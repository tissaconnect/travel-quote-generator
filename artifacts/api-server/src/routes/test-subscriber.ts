import { Router } from "express";
import { addSubscriber } from "../lib/subscriptions";

const router = Router();

router.get("/add-test-subscriber", (req, res) => {
  const email = req.query.email as string;
  if (!email) {
    res.status(400).json({ error: "email query parameter is required" });
    return;
  }
  addSubscriber(email);
  console.log(`[test] Manually added subscriber: ${email}`);
  res.json({ ok: true, message: `${email} added to activeSubscribers` });
});

export default router;
