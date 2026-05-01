import { Router } from "express";
import Stripe from "stripe";
import { getAuth, clerkClient } from "@clerk/express";

const router = Router();

router.get("/customer-portal", async (req, res) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    res.status(500).json({ error: "Stripe not configured" });
    return;
  }

  try {
    const clerkUser = await clerkClient.users.getUser(userId as string);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      res.status(400).json({ error: "No email address on account" });
      return;
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2026-04-22.dahlia" });

    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      res.status(404).json({ error: "No Stripe customer found for this account" });
      return;
    }

    const customerId = customers.data[0].id;
    const origin = req.headers.origin || `https://${req.headers.host}`;
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/app`,
    });

    res.json({ url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: `Could not create portal session: ${msg}` });
  }
});

export default router;
