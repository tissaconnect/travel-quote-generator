import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { addSubscriber, removeSubscriber, getAllSubscribers, setSubscriberStatus } from "../lib/subscriptions";

const router = Router();

function checkAuth(req: Request, res: Response): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    res.status(500).json({ error: "ADMIN_PASSWORD environment variable is not set" });
    return false;
  }
  const provided =
    (req.headers["x-admin-password"] as string) ||
    (req.query.password as string);
  if (provided !== adminPassword) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

// ─── Admin HTML Panel ────────────────────────────────────────────────────────

router.get("/admin", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Travolo Admin</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8f9fa; color: #1a1a2e; min-height: 100vh; }
    header { background: #0a1f2e; color: #fff; padding: 16px 32px; display: flex; align-items: center; gap: 12px; }
    header span.logo { font-size: 1.3rem; letter-spacing: 0.1em; font-weight: 600; }
    header span.gold { color: #c9973a; }
    header span.badge { font-size: 11px; background: #c9973a22; color: #c9973a; border: 1px solid #c9973a55; border-radius: 4px; padding: 2px 8px; margin-left: 8px; }
    main { max-width: 960px; margin: 32px auto; padding: 0 24px; }
    #login-screen { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 40px; max-width: 400px; margin: 80px auto; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
    #login-screen h2 { font-size: 1.25rem; margin-bottom: 8px; color: #0a1f2e; }
    #login-screen p { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
    #app-screen { display: none; }
    .stats-row { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px 24px; flex: 1; }
    .stat { font-size: 2rem; font-weight: 700; color: #c9973a; }
    .stat.grey { color: #6b7280; }
    .stat-label { font-size: 12px; color: #9ca3af; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em; }
    .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .card h2 { font-size: 1rem; font-weight: 600; color: #0a1f2e; margin-bottom: 16px; }
    input[type="text"], input[type="email"], input[type="password"] {
      width: 100%; padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 7px;
      font-size: 14px; outline: none; transition: border 0.15s;
    }
    input:focus { border-color: #c9973a; }
    .row { display: flex; gap: 8px; margin-top: 12px; }
    .row input { flex: 1; }
    button { padding: 9px 18px; border: none; border-radius: 7px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
    .btn-primary { background: #0a1f2e; color: #fff; }
    .btn-primary:hover { background: #153247; }
    .btn-gold { background: #c9973a; color: #fff; }
    .btn-gold:hover { background: #b8882f; }
    .btn-cancel { background: #fff; color: #dc2626; border: 1px solid #fecaca; font-size: 12px; padding: 5px 12px; border-radius: 6px; }
    .btn-cancel:hover { background: #fef2f2; }
    .btn-reactivate { background: #fff; color: #059669; border: 1px solid #a7f3d0; font-size: 12px; padding: 5px 12px; border-radius: 6px; }
    .btn-reactivate:hover { background: #ecfdf5; }
    .btn-remove { background: #fff; color: #9ca3af; border: 1px solid #e5e7eb; font-size: 12px; padding: 5px 10px; border-radius: 6px; }
    .btn-remove:hover { background: #f9fafb; color: #6b7280; }
    .actions { display: flex; gap: 6px; align-items: center; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #9ca3af; padding: 0 0 10px; border-bottom: 1px solid #f3f4f6; }
    td { padding: 11px 0; border-bottom: 1px solid #f9fafb; vertical-align: middle; }
    td.email { font-weight: 500; color: #0a1f2e; }
    td.note { color: #6b7280; font-size: 13px; }
    td.date { color: #9ca3af; font-size: 12px; white-space: nowrap; }
    tr.row-inactive td.email { color: #9ca3af; font-weight: 400; }
    .badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 2px 9px; border-radius: 99px; letter-spacing: 0.04em; white-space: nowrap; }
    .badge-active { background: #d1fae5; color: #065f46; }
    .badge-inactive { background: #f3f4f6; color: #6b7280; }
    .empty { text-align: center; padding: 32px; color: #9ca3af; font-size: 13px; }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #0a1f2e; color: #fff; padding: 12px 20px; border-radius: 8px; font-size: 13px; opacity: 0; transition: opacity 0.2s; pointer-events: none; max-width: 340px; }
    .toast.show { opacity: 1; }
    .toast.is-error { background: #dc2626; }
  </style>
</head>
<body>
<header>
  <span class="logo">Travolo<span class="gold">.</span></span>
  <span class="badge" style="background:#c9973a22;color:#c9973a;border:1px solid #c9973a55;border-radius:4px;padding:2px 8px;margin-left:8px;font-size:11px;">Admin Panel</span>
</header>

<main>
  <div id="login-screen">
    <h2>Admin Access</h2>
    <p>Enter your admin password to continue.</p>
    <input type="password" id="pw-input" placeholder="Admin password" />
    <div style="margin-top:12px">
      <button class="btn-primary" style="width:100%" onclick="login()">Sign In</button>
    </div>
    <div id="login-error" style="color:#dc2626;font-size:13px;margin-top:10px;display:none">Incorrect password</div>
  </div>

  <div id="app-screen">
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat" id="stat-active">—</div>
        <div class="stat-label">Active subscribers</div>
      </div>
      <div class="stat-card">
        <div class="stat grey" id="stat-inactive">—</div>
        <div class="stat-label">Cancelled</div>
      </div>
    </div>

    <div class="card">
      <h2>Add Subscriber</h2>
      <input type="email" id="add-email" placeholder="advisor@example.com" />
      <div class="row">
        <input type="text" id="add-note" placeholder='Note: "free month", "beta tester", etc.' />
        <button class="btn-gold" onclick="addSubscriber()">Add</button>
      </div>
    </div>

    <div class="card">
      <h2>All Subscribers</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Status</th>
            <th>Note</th>
            <th>Since</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="subscriber-table"></tbody>
      </table>
      <div id="empty-state" class="empty" style="display:none">No subscribers yet.</div>
    </div>
  </div>
</main>

<div class="toast" id="toast"></div>

<script>
  let password = '';

  function login() {
    const pw = document.getElementById('pw-input').value;
    fetch('/admin/subscribers', { headers: { 'x-admin-password': pw } })
      .then(r => {
        if (r.status === 401) { document.getElementById('login-error').style.display = 'block'; return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        password = pw;
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-screen').style.display = 'block';
        renderSubscribers(data.subscribers);
      });
  }

  document.getElementById('pw-input').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });

  function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function renderSubscribers(subscribers) {
    const active = subscribers.filter(s => s.status === 'active');
    const inactive = subscribers.filter(s => s.status !== 'active');
    document.getElementById('stat-active').textContent = active.length;
    document.getElementById('stat-inactive').textContent = inactive.length;

    const tbody = document.getElementById('subscriber-table');
    const empty = document.getElementById('empty-state');
    tbody.innerHTML = '';
    if (subscribers.length === 0) { empty.style.display = 'block'; return; }
    empty.style.display = 'none';

    // Active rows first, then inactive
    [...active, ...inactive].forEach(s => {
      const isActive = s.status === 'active';
      const date = new Date(s.subscribedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const statusBadge = isActive
        ? '<span class="badge badge-active">&#9679; Active</span>'
        : '<span class="badge badge-inactive">&#9675; Cancelled</span>';

      const actions = isActive
        ? \`<div class="actions">
            <button class="btn-cancel" onclick="cancelSub('\${esc(s.email)}')">Cancel Subscription</button>
            <button class="btn-remove" onclick="removeSub('\${esc(s.email)}')">Remove</button>
           </div>\`
        : \`<div class="actions">
            <button class="btn-reactivate" onclick="reactivateSub('\${esc(s.email)}')">Reactivate</button>
            <button class="btn-remove" onclick="removeSub('\${esc(s.email)}')">Remove</button>
           </div>\`;

      const tr = document.createElement('tr');
      if (!isActive) tr.classList.add('row-inactive');
      tr.innerHTML = \`
        <td class="email">\${esc(s.email)}</td>
        <td>\${statusBadge}</td>
        <td class="note">\${s.note ? esc(s.note) : '<span style="color:#d1d5db">—</span>'}</td>
        <td class="date">\${date}</td>
        <td>\${actions}</td>
      \`;
      tbody.appendChild(tr);
    });
  }

  function addSubscriber() {
    const email = document.getElementById('add-email').value.trim();
    const note = document.getElementById('add-note').value.trim();
    if (!email) { showToast('Enter an email address'); return; }
    fetch('/admin/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ email, note })
    }).then(r => r.json()).then(data => {
      document.getElementById('add-email').value = '';
      document.getElementById('add-note').value = '';
      renderSubscribers(data.subscribers);
      showToast(email + ' added');
    });
  }

  function removeSub(email) {
    if (!confirm('Permanently delete ' + email + ' from the database?')) return;
    fetch('/admin/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ email })
    }).then(r => r.json()).then(data => {
      renderSubscribers(data.subscribers);
      showToast(email + ' removed');
    });
  }

  function cancelSub(email) {
    if (!confirm('Are you sure you want to cancel the subscription for ' + email + '?\\n\\nThis will immediately cancel their active Stripe subscription and revoke app access.')) return;
    showToast('Cancelling subscription…');
    fetch('/admin/cancel-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ email })
    }).then(r => r.json()).then(data => {
      if (data.error) { showToast(data.error, true); return; }
      renderSubscribers(data.subscribers);
      showToast(email + ' — subscription cancelled');
    }).catch(() => showToast('Request failed', true));
  }

  function reactivateSub(email) {
    if (!confirm('Reactivate subscription for ' + email + '?\\n\\nThis will create a new Stripe subscription using their saved payment method.')) return;
    showToast('Reactivating…');
    fetch('/admin/reactivate-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ email })
    }).then(r => r.json()).then(data => {
      if (data.error) { showToast(data.error, true); return; }
      renderSubscribers(data.subscribers);
      showToast(email + ' — reactivated');
    }).catch(() => showToast('Request failed', true));
  }

  function showToast(msg, isError = false) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast' + (isError ? ' is-error' : '');
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3000);
  }
</script>
</body>
</html>`);
});

// ─── Admin API Endpoints ─────────────────────────────────────────────────────

router.get("/admin/subscribers", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const subscribers = await getAllSubscribers();
  res.json({ count: subscribers.length, subscribers });
});

router.post("/admin/add", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const { email, note = "" } = req.body as { email?: string; note?: string };
  if (!email) { res.status(400).json({ error: "email is required" }); return; }
  await addSubscriber(email, note);
  console.log(`[admin] Added subscriber: ${email}${note ? ` (${note})` : ""}`);
  const subscribers = await getAllSubscribers();
  res.json({ ok: true, subscribers });
});

router.post("/admin/remove", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const { email } = req.body as { email?: string };
  if (!email) { res.status(400).json({ error: "email is required" }); return; }
  await removeSubscriber(email);
  console.log(`[admin] Removed subscriber: ${email}`);
  const subscribers = await getAllSubscribers();
  res.json({ ok: true, subscribers });
});

router.post("/admin/cancel-subscription", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const { email } = req.body as { email?: string };
  if (!email) { res.status(400).json({ error: "email is required" }); return; }

  const stripe = getStripe();
  if (stripe) {
    try {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        const customerId = customers.data[0].id;
        const subs = await stripe.subscriptions.list({ customer: customerId, status: "active" });
        for (const sub of subs.data) {
          await stripe.subscriptions.cancel(sub.id);
          console.log(`[admin] Cancelled Stripe subscription ${sub.id} for ${email}`);
        }
        if (subs.data.length === 0) {
          console.warn(`[admin] No active Stripe subscriptions found for ${email} — marking inactive in DB only`);
        }
      } else {
        console.warn(`[admin] No Stripe customer found for ${email} — marking inactive in DB only`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[admin] Stripe cancel error for ${email}:`, msg);
      res.status(500).json({ error: `Stripe error: ${msg}` });
      return;
    }
  }

  await setSubscriberStatus(email, "inactive");
  console.log(`[admin] Marked ${email} as inactive`);
  const subscribers = await getAllSubscribers();
  res.json({ ok: true, subscribers });
});

router.post("/admin/reactivate-subscription", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const { email } = req.body as { email?: string };
  if (!email) { res.status(400).json({ error: "email is required" }); return; }

  const stripe = getStripe();
  if (stripe) {
    try {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length === 0) {
        res.status(404).json({
          error: "No Stripe customer found for this email. Use the Add Subscriber form to grant access manually.",
        });
        return;
      }
      const customerId = customers.data[0].id;

      // Find their most recent cancelled subscription to reuse the price
      const cancelledSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: "canceled",
        limit: 1,
      });

      if (cancelledSubs.data.length > 0) {
        const priceId = cancelledSubs.data[0].items.data[0]?.price.id;
        if (!priceId) {
          res.status(500).json({ error: "Could not determine price from previous subscription" });
          return;
        }
        const newSub = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
        });
        console.log(`[admin] Created new Stripe subscription ${newSub.id} for ${email}`);
      } else {
        console.warn(`[admin] No cancelled Stripe subscription for ${email} — activating in DB only`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[admin] Stripe reactivation error for ${email}:`, msg);
      res.status(500).json({ error: `Stripe error: ${msg}` });
      return;
    }
  }

  await setSubscriberStatus(email, "active");
  console.log(`[admin] Marked ${email} as active`);
  const subscribers = await getAllSubscribers();
  res.json({ ok: true, subscribers });
});

export default router;
