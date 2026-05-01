import { Router } from "express";
import { randomUUID } from "node:crypto";
import { getAuth } from "@clerk/express";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// In-memory store: id -> html string
const quoteStore = new Map<string, string>();

// POST /api/save-quote — store HTML, return UUID (authenticated users only)
router.post("/save-quote", requireAuth, (req, res) => {
  const { html } = req.body as { html?: string };
  if (!html || typeof html !== "string") {
    res.status(400).json({ error: "html is required" });
    return;
  }
  const id = randomUUID();
  quoteStore.set(id, html);
  res.json({ id });
});

// GET /api/quote/:id — serve stored HTML with strict CSP to block any scripts
router.get("/quote/:id", (req, res) => {
  const html = quoteStore.get(req.params.id);
  if (!html) {
    res.status(404).send("<h1>Quote not found or has expired.</h1>");
    return;
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none';"
  );
  res.send(html);
});

export default router;
