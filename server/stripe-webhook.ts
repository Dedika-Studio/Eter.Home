import { Router, raw } from "express";
import Stripe from "stripe";
import { getOrderByStripeSession, updateOrderStatus, markTicketsSold, releaseTicketsByOrder } from "./db";
import { syncToGoogleSheets } from "./sheets-sync";
import { sendWhatsAppConfirmation } from "./whatsapp";
let stripe = null;
function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return stripe;
}
export const webhookRouter = Router();
webhookRouter.post("/api/stripe/webhook/raffle/:raffleId", raw({ type: "application/json" }), async (req, res) => {
  const { raffleId } = req.params;
  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_LIVE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || "";
  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event.data.object);
  }
  res.json({ received: true });
});
async function handleCheckoutCompleted(session) {
  const order = await getOrderByStripeSession(session.id);
  if (!order || order.status === "paid") return;
  await updateOrderStatus(order.id, "paid", session.payment_intent);
  const buyerName = session.customer_details?.name || order.buyerName;
  const buyerPhone = session.customer_details?.phone || order.buyerPhone;
  const buyerEmail = session.customer_details?.email || order.buyerEmail;
  const ticketNumbers = JSON.parse(order.ticketNumbers);
  await markTicketsSold(order.id, ticketNumbers, buyerName, buyerPhone, buyerEmail);
  await syncToGoogleSheets(order.id, ticketNumbers, buyerName, buyerPhone);
  if (buyerPhone) {
    await sendWhatsAppConfirmation({ to: `+52${buyerPhone}`, ticketNumbers, buyerName, totalAmount: order.totalAmount });
  }
}
