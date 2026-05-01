import { Router, type Request, type Response } from "express";
import { addSubscriber, removeSubscriber, getAllSubscribers } from "../lib/subscriptions";

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
    main { max-width: 860px; margin: 32px auto; padding: 0 24px; }
    #login-screen { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 40px; max-width: 400px; margin: 80px auto; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
    #login-screen h2 { font-size: 1.25rem; margin-bottom: 8px; color: #0a1f2e; }
    #login-screen p { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
    #app-screen { display: none; }
    .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .card h2 { font-size: 1rem; font-weight: 600; color: #0a1f2e; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .stat { font-size: 2.25rem; font-weight: 700; color: #c9973a; }
    .stat-label { font-size: 13px; color: #6b7280; margin-top: 2px; }
    input[type="text"], input[type="email"], input[type="password"] {
      width: 100%; padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 7px;
      font-size: 14px; outline: none; transition: border 0.15s;
    }
    input:focus { border-color: #c9973a; }
    .row { display: flex; gap: 8px; margin-top: 12px; }
    .row input { flex: 1; }
    button {
      padding: 9px 18px; border: none; border-radius: 7px; font-size: 14px;
      font-weight: 500; cursor: pointer; transition: background 0.15s;
    }
    .btn-primary { background: #0a1f2e; color: #fff; }
    .btn-primary:hover { background: #153247; }
    .btn-gold { background: #c9973a; color: #fff; }
    .btn-gold:hover { background: #b8882f; }
    .btn-danger { background: #fff; color: #dc2626; border: 1px solid #fecaca; font-size: 12px; padding: 5px 10px; }
    .btn-danger:hover { background: #fef2f2; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #9ca3af; padding: 0 0 10px; border-bottom: 1px solid #f3f4f6; }
    td { padding: 11px 0; border-bottom: 1px solid #f9fafb; vertical-align: middle; }
    td.email { font-weight: 500; color: #0a1f2e; }
    td.note { color: #6b7280; font-size: 13px; }
    td.date { color: #9ca3af; font-size: 12px; white-space: nowrap; }
    .empty { text-align: center; padding: 32px; color: #9ca3af; font-size: 13px; }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #0a1f2e; color: #fff; padding: 12px 20px; border-radius: 8px; font-size: 13px; opacity: 0; transition: opacity 0.2s; pointer-events: none; }
    .toast.show { opacity: 1; }
  </style>
</head>
<body>
<header>
  <span class="logo">Travolo<span class="gold">.</span></span>
  <span class="badge">Admin Panel</span>
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
    <div class="card">
      <div class="stat" id="stat-count">—</div>
      <div class="stat-label">Active subscribers</div>
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
      <h2>Active Subscribers</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Note</th>
            <th>Added</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="subscriber-table"></tbody>
      </table>
      <div id="empty-state" class="empty" style="display:none">No active subscribers yet.</div>
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

  function renderSubscribers(subscribers) {
    document.getElementById('stat-count').textContent = subscribers.length;
    const tbody = document.getElementById('subscriber-table');
    const empty = document.getElementById('empty-state');
    tbody.innerHTML = '';
    if (subscribers.length === 0) { empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    subscribers.forEach(s => {
      const date = new Date(s.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td class="email">\${s.email}</td>
        <td class="note">\${s.note || '<span style="color:#d1d5db">—</span>'}</td>
        <td class="date">\${date}</td>
        <td><button class="btn-danger" onclick="removeSubscriber('\${s.email}')">Remove</button></td>
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

  function removeSubscriber(email) {
    if (!confirm('Remove ' + email + ' from active subscribers?')) return;
    fetch('/admin/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ email })
    }).then(r => r.json()).then(data => {
      renderSubscribers(data.subscribers);
      showToast(email + ' removed');
    });
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
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
  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }
  await addSubscriber(email, note);
  console.log(`[admin] Added subscriber: ${email}${note ? ` (${note})` : ""}`);
  const subscribers = await getAllSubscribers();
  res.json({ ok: true, subscribers });
});

router.post("/admin/remove", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const { email } = req.body as { email?: string };
  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }
  await removeSubscriber(email);
  console.log(`[admin] Removed subscriber: ${email}`);
  const subscribers = await getAllSubscribers();
  res.json({ ok: true, subscribers });
});

export default router;
