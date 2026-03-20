import { Router, raw } from "express";
import Stripe from "stripe";
import {
  getOrderByStripeSession,
  updateOrderStatus,
  markTicketsSold,
  releaseTicketsByOrder,
} from "./db";
import { syncToGoogleSheets } from "./sheets-sync";
import { sendWhatsAppConfirmation } from "./whatsapp";

// Use LIVE keys if available, fallback to test keys
// Initialize Stripe lazily to ensure env vars are loaded
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const stripeSecretKey = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY or STRIPE_LIVE_SECRET_KEY environment variable is required');
    }
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia" as any,
    });
  }
  return stripe;
}

export const webhookRouter = Router();

// MUST use raw body for Stripe signature verification
// Dynamic raffle webhook endpoint
webhookRouter.post(
  "/api/stripe/webhook/raffle/:raffleId",
  raw({ type: "application/json" }),
  async (req, res) => {
    const { raffleId } = req.params;
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_LIVE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || "";

    let event: Stripe.Event;

    try {
      event = getStripe().webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } catch (err: any) {
      console.error(`[Webhook Raffle ${raffleId}] Signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle test events
    if (event.id.startsWith("evt_test_")) {
      console.log(`[Webhook Raffle ${raffleId}] Test event detected, returning verification response`);
      return res.json({ verified: true });
    }

    console.log(`[Webhook Raffle ${raffleId}] Received event: ${event.type} (${event.id})`);

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutCompleted(session);
          break;
        }
        case "checkout.session.expired": {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutExpired(session);
          break;
        }
      }

      res.json({ received: true });
    } catch (err: any) {
      console.error(`[Webhook Raffle ${raffleId}] Error processing event:`, err.message);
      res.status(500).send(`Webhook Error: ${err.message}`);
    }
  }
);

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const order = await getOrderByStripeSession(session.id);
  if (!order) {
    console.error(`[Webhook] Order not found for session ${session.id}`);
    return;
  }

  if (order.status === "paid") {
    console.log(`[Webhook] Order ${order.id} already paid, skipping`);
    return;
  }

  // Update order status to paid
  await updateOrderStatus(order.id, "paid", session.payment_intent as string);

  console.log(`[Webhook] Processing order ${order.id} for buyer:`, {
    name: order.buyerName,
    phone: order.buyerPhone,
    email: order.buyerEmail
  });

  // Extract buyer info from Stripe session if not in order
  const buyerName = session.customer_details?.name || order.buyerName;
  const buyerEmail = session.customer_details?.email || order.buyerEmail;
  const buyerPhone = session.customer_details?.phone || order.buyerPhone;

  console.log(`[Webhook] Final buyer info for tickets:`, { buyerName, buyerEmail, buyerPhone });

  // Mark tickets as sold with buyer information
  const ticketNumbers = JSON.parse(order.ticketNumbers) as string[];
  await markTicketsSold(order.id, ticketNumbers, buyerName, buyerPhone, buyerEmail);

  // Sync to Google Sheets
  try {
    await syncToGoogleSheets(order.id, ticketNumbers, buyerName, buyerPhone);
  } catch (err) {
    console.error(`[Webhook] Failed to sync order ${order.id} to Google Sheets:`, err);
  }

  // Send WhatsApp confirmation if phone is available
  if (order.buyerPhone) {
    const ticketNumbers = JSON.parse(order.ticketNumbers) as string[];
    const whatsappPhone = `+52${order.buyerPhone}`;
    await sendWhatsAppConfirmation({
      to: whatsappPhone,
      ticketNumbers,
      buyerName: order.buyerName,
      totalAmount: order.totalAmount,
    }).catch(err => console.error("[WhatsApp] Failed to send confirmation:", err));
  }

  console.log(`[Webhook] Order ${order.id} confirmed and tickets marked as sold`);
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const order = await getOrderByStripeSession(session.id);
  if (!order) return;

  if (order.status === "pending") {
    await updateOrderStatus(order.id, "expired");
    await releaseTicketsByOrder(order.id);
    console.log(`[Webhook] Order ${order.id} expired and tickets released`);
  }
}

// export default webhookRouter;
