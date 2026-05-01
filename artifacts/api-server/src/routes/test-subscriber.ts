import { Router } from "express";
import { addSubscriber, getAllSubscribers } from "../lib/subscriptions";

const router = Router();

router.get("/add-test-subscriber", async (req, res) => {
  const email = req.query.email as string;
  if (!email) {
    res.status(400).json({ error: "email query parameter is required" });
    return;
  }
  await addSubscriber(email);
  const all = await getAllSubscribers();
  console.log(`[test] Manually added subscriber: ${email} | DB now has ${all.length} subscriber(s)`);
  res.json({ ok: true, added: email, activeSubscribers: all });
});

export default router;
