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
                            c
