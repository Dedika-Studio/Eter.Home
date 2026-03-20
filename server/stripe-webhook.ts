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

// Usar solo claves de prueba (TEST) como solicitaste
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('La variable de entorno STRIPE_SECRET_KEY es necesaria');
    }
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia" as any,
    });
  }
  return stripe;
}

export const webhookRouter = Router();

// Endpoint del Webhook de Stripe
webhookRouter.post(
  "/api/stripe/webhook/raffle/:raffleId",
  raw({ type: "application/json" }),
  async (req, res) => {
    const { raffleId } = req.params;
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

    let event: Stripe.Event;

    try {
      event = getStripe().webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } catch (err: any) {
      console.error(`[Webhook] Error de firma:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutExpired(session);
    }

    res.json({ received: true });
  }
);

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const order = await getOrderByStripeSession(session.id);
  if (!order || order.status === "paid") return;

  // 1. Actualizar estado de la orden a pagada
  await updateOrderStatus(order.id, "paid", session.payment_intent as string);

  // 2. Usar datos de la orden original para asegurar que no falte info
  const buyerName = order.buyerName;
  const buyerPhone = order.buyerPhone;
  const buyerEmail = order.buyerEmail;
  const ticketNumbers = JSON.parse(order.ticketNumbers) as string[];

  // 3. Marcar tickets como vendidos con TODA la información
  await markTicketsSold(order.id, ticketNumbers, buyerName, buyerPhone, buyerEmail);

  // 4. Sincronizar con Google Sheets
  try {
    await syncToGoogleSheets(order.id, ticketNumbers, buyerName, buyerPhone);
  } catch (err) {
    console.error(`[Webhook] Error sincronizando con Sheets:`, err);
  }

  // 5. Enviar WhatsApp de confirmación
  if (buyerPhone) {
    const whatsappPhone = `+52${buyerPhone}`;
    await sendWhatsAppConfirmation({
      to: whatsappPhone,
      ticketNumbers,
      buyerName,
      totalAmount: order.totalAmount,
    }).catch(err => console.error("[WhatsApp] Error enviando mensaje:", err));
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const order = await getOrderByStripeSession(session.id);
  if (order && order.status === "pending") {
    await updateOrderStatus(order.id, "expired");
    await releaseTicketsByOrder(order.id);
  }
}
