import { Router, raw } from "express";
import Stripe from "stripe";
import { addSubscriber, removeSubscriber } from "../lib/subscriptions";

const router = Router();

router.post(
  "/webhooks/stripe",
  raw({ type: "application/json" }),
  async (req, res) => {
    console.log(`[Stripe webhook] *** Request arrived *** method=${req.method} sig-header-present=${!!req.headers["stripe-signature"]}`);
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret) {
      console.warn("STRIPE_WEBHOOK_SECRET not set — webhook rejected");
      res.status(400).json({ error: "Webhook secret not configured" });
      return;
    }

    const sig = req.headers["stripe-signature"];
    if (!sig) {
      res.status(400).json({ error: "Missing stripe-signature header" });
      return;
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
      apiVersion: "2025-03-31.basil",
    });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid signature";
      console.error("Stripe webhook signature verification failed:", msg);
      res.status(400).json({ error: `Webhook error: ${msg}` });
      return;
    }

    console.log(`[Stripe webhook] Received event: ${event.type} (id: ${event.id})`);

    switch (event.type) {
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        console.log(`[Stripe webhook] subscription.created — customerId: ${customerId}`);
        try {
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          if (customer.email) {
            await addSubscriber(customer.email);
            console.log(`[Stripe webhook] Added subscriber: ${customer.email}`);
          } else {
            console.warn(`[Stripe webhook] Customer ${customerId} has no email`);
          }
        } catch (err) {
          console.error("[Stripe webhook] Failed to retrieve customer for subscription.created:", err);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        console.log(`[Stripe webhook] subscription.deleted — customerId: ${customerId}`);
        try {
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          if (customer.email) {
            await removeSubscriber(customer.email);
            console.log(`[Stripe webhook] Removed subscriber: ${customer.email}`);
          } else {
            console.warn(`[Stripe webhook] Customer ${customerId} has no email`);
          }
        } catch (err) {
          console.error("[Stripe webhook] Failed to retrieve customer for subscription.deleted:", err);
        }
        break;
      }

      default:
        console.log(`[Stripe webhook] Unhandled event type: ${event.type} — ignoring`);
        break;
    }

    res.json({ received: true });
  }
);

export default router;
