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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia" as any,
});

const webhookRouter = Router();

// MUST use raw body for Stripe signature verification
webhookRouter.post(
  "/api/stripe/webhook",
  raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } catch (err: any) {
      console.error("[Webhook] Signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle test events
    if (event.id.startsWith("evt_test_")) {
      console.log("[Webhook] Test event detected, returning verification response");
      return res.json({ verified: true });
    }

    console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

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
        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`[Webhook] Error processing ${event.type}:`, error);
    }

    res.json({ received: true });
  }
);

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const order = await getOrderByStripeSession(session.id);
  if (!order) {
    console.error(`[Webhook] No order found for session: ${session.id}`);
    return;
  }

  if (order.status === "paid") {
    console.log(`[Webhook] Order ${order.id} already paid, skipping`);
    return;
  }

  // Update order status to paid
  await updateOrderStatus(order.id, "paid", session.payment_intent as string);

  // Mark tickets as sold
  await markTicketsSold(order.id, order.buyerName, order.buyerPhone, order.buyerEmail);

  // Sync to Google Sheets
  const ticketNumbers = JSON.parse(order.ticketNumbers) as string[];
  await syncToGoogleSheets(order.id, ticketNumbers, order.buyerName, order.buyerPhone);

  // Send WhatsApp confirmation
  const whatsappPhone = `+52${order.buyerPhone}`;
  await sendWhatsAppConfirmation({
    to: whatsappPhone,
    ticketNumbers,
    buyerName: order.buyerName,
    totalAmount: order.totalAmount,
  });

  console.log(`[Webhook] Order ${order.id} completed. Tickets sold: ${ticketNumbers.join(", ")}`);
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const order = await getOrderByStripeSession(session.id);
  if (!order) return;

  if (order.status !== "pending") return;

  // Release reserved tickets
  await releaseTicketsByOrder(order.id);
  await updateOrderStatus(order.id, "expired");

  console.log(`[Webhook] Order ${order.id} expired. Tickets released.`);
}

export { webhookRouter };
