import { Router } from "express";
import { addSubscriber, getAllSubscribers } from "../lib/subscriptions";

const router = Router();

router.get("/add-test-subscriber", (req, res) => {
  const email = req.query.email as string;
  if (!email) {
    res.status(400).json({ error: "email query parameter is required" });
    return;
  }
  addSubscriber(email);
  const all = getAllSubscribers();
  console.log(`[test] Manually added subscriber: ${email} | activeSubscribers now: [${all.join(", ")}]`);
  res.json({ ok: true, added: email, activeSubscribers: all });
});

export default router;
