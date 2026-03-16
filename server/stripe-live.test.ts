import { describe, expect, it } from "vitest";
import Stripe from "stripe";

describe("Stripe LIVE key validation", () => {
  it("should connect to Stripe with LIVE key", async () => {
    const stripeKey = process.env.STRIPE_LIVE_SECRET_KEY || "";
    
    // Verify key starts with sk_live_
    expect(stripeKey.startsWith("sk_live_")).toBe(true);
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-02-24.acacia" as any,
    });

    // Try to retrieve account info to verify the key works
    const account = await stripe.accounts.retrieve();
    expect(account).toBeDefined();
    expect(account.id).toBeTruthy();
    console.log(`[Stripe LIVE Test] Connected to account: ${account.id}`);
  });
});
