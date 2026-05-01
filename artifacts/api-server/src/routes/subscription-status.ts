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

  try {
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress ?? "";
    const subscribed = await isSubscriber(email);
    console.log(`[subscription-status] Checking email: "${email}" | active in DB: ${subscribed}`);
    res.json({ hasSubscription: subscribed, email });
  } catch (err) {
    console.error("Failed to verify subscription status:", err);
    res.status(500).json({ error: "Could not verify subscription status" });
  }
});

export default router;
