import { Router } from "express";
import { randomUUID } from "node:crypto";

const router = Router();

// In-memory store: id -> html string
const quoteStore = new Map<string, string>();

// POST /api/save-quote — store HTML, return UUID
router.post("/save-quote", (req, res) => {
  const { html } = req.body as { html?: string };
  if (!html || typeof html !== "string") {
    res.status(400).json({ error: "html is required" });
    return;
  }
  const id = randomUUID();
  quoteStore.set(id, html);
  res.json({ id });
});

// GET /api/quote/:id — serve stored HTML as a real page
router.get("/quote/:id", (req, res) => {
  const html = quoteStore.get(req.params.id);
  if (!html) {
    res.status(404).send("<h1>Quote not found or has expired.</h1>");
    return;
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

export default router;
