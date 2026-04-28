import { Router } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { isSubscriber } from "../lib/subscriptions";

const router = Router();

router.get("/subscription-status", async (req, res) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    res.json({ hasSubscription: true, bypass: true });
    return;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress ?? "";
    res.json({ hasSubscription: isSubscriber(email), email });
  } catch (err) {
    console.error("Failed to fetch user for subscription check:", err);
    res.status(500).json({ error: "Could not verify subscription status" });
  }
});

export default router;
