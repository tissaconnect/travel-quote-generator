import type { AdvisorProfile, Hotel, TripDetails } from "../types";

export function buildOnePager(
  adv: AdvisorProfile,
  trip: TripDetails,
  selected: Hotel,
  others: Hotel[],
  advisorNote?: string
): string {
  const stars = "★".repeat(selected.stars || 4);
  const highlights = (selected.highlights || selected.pros || []).slice(0, 4);

  const highlightHtml = highlights
    .map(
      (h) => `
    <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;">
      <span style="color:#c9973a;font-size:14px;margin-top:1px;">✦</span>
      <span style="font-size:13px;color:rgba(255,255,255,0.85);line-height:1.5;">${h}</span>
    </div>`
    )
    .join("");

  const othersHtml = others
    .slice(0, 4)
    .map(
      (h) => `
    <tr>
      <td style="padding:10px 16px;font-family:'DM Sans',sans-serif;font-size:13px;color:#1a1a1a;border-bottom:1px solid #f0ebe0;">${h.name}</td>
      <td style="padding:10px 16px;font-family:'DM Sans',sans-serif;font-size:12px;color:#6b7280;border-bottom:1px solid #f0ebe0;">${"★".repeat(h.stars || 4)}</td>
      <td style="padding:10px 16px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#c9973a;border-bottom:1px solid #f0ebe0;">${h.totalPrice}</td>
      <td style="padding:10px 16px;font-family:'DM Sans',sans-serif;font-size:12px;color:#6b7280;border-bottom:1px solid #f0ebe0;">${h.category || ""}</td>
      <td style="padding:10px 16px;font-family:'DM Sans',sans-serif;font-size:12px;color:#6b7280;border-bottom:1px solid #f0ebe0;">${h.refundableBy ? "Refundable by " + h.refundableBy : ""}</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'DM Sans',sans-serif;background:#f5f0e8;}</style>
</head><body>
<div style="max-width:760px;margin:0 auto;background:#fff;box-shadow:0 4px 40px rgba(0,0,0,0.08);">

  <!-- HEADER -->
  <div style="background:#0a1f2e;padding:32px 40px 28px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:26px;color:#fff;letter-spacing:0.15em;font-weight:500;">
          Se7en <span style="color:#c9973a;">Seas</span> Advisory
        </div>
        <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-top:4px;">Your Luxury Travel Experts</div>
      </div>
      <div style="text-align:right;">
        <div style="font-family:'Cormorant Garamond',serif;font-size:22px;color:#fff;font-style:italic;">${trip.destination}</div>
        <div style="font-size:12px;color:#c9973a;margin-top:4px;">${trip.dates}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px;">${trip.adults} Adults · ${trip.nights} Nights</div>
      </div>
    </div>
    <div style="height:1px;background:rgba(201,151,58,0.25);margin:20px 0;"></div>
    <div style="font-size:12px;color:rgba(255,255,255,0.5);">Prepared for <span style="color:rgba(255,255,255,0.85);font-weight:500;">${trip.clients}</span></div>
  </div>

  <!-- SELECTED HOTEL HERO -->
  <div style="background:linear-gradient(135deg,#0d2d3e 0%,#1a4a5c 100%);padding:32px 40px;">
    <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c9973a;margin-bottom:10px;font-weight:500;">✦ Your Selected Property</div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:28px;color:#fff;font-weight:600;margin-bottom:6px;">${selected.name}</div>
    <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;flex-wrap:wrap;">
      <span style="font-size:16px;color:#c9973a;">${stars}</span>
      <span style="font-size:13px;color:rgba(255,255,255,0.6);">${selected.category || "All-Inclusive"}</span>
      ${selected.refundableBy ? `<span style="font-size:12px;color:rgba(255,255,255,0.4);">Refundable by ${selected.refundableBy}</span>` : ""}
    </div>
    <div style="font-size:13px;font-style:italic;color:rgba(255,255,255,0.6);margin-bottom:20px;">${selected.vibe || ""}</div>
    <div style="display:flex;gap:32px;align-items:flex-start;flex-wrap:wrap;">
      <div>
        <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:4px;">Total Package</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:36px;color:#c9973a;font-weight:600;">${selected.totalPrice}</div>
        ${selected.perPersonPrice ? `<div style="font-size:11px;color:rgba(255,255,255,0.4);">${selected.perPersonPrice} per person</div>` : ""}
      </div>
      <div style="flex:1;">
        ${highlightHtml}
      </div>
    </div>
  </div>

  <!-- OTHER OPTIONS TABLE -->
  ${
    others.length > 0
      ? `
  <div style="padding:28px 40px;">
    <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6b7280;margin-bottom:14px;font-weight:500;">Also Considered</div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #f0ebe0;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#f5f0e8;">
          <th style="padding:10px 16px;text-align:left;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;font-weight:500;">Property</th>
          <th style="padding:10px 16px;text-align:left;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;font-weight:500;">Stars</th>
          <th style="padding:10px 16px;text-align:left;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;font-weight:500;">Price</th>
          <th style="padding:10px 16px;text-align:left;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;font-weight:500;">Vibe</th>
          <th style="padding:10px 16px;text-align:left;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;font-weight:500;">Refund</th>
        </tr>
      </thead>
      <tbody>${othersHtml}</tbody>
    </table>
  </div>`
      : ""
  }

  <!-- ADVISOR NOTE -->
  ${
    advisorNote
      ? `
  <div style="margin:0 40px 28px;background:#0a1f2e;border-radius:10px;padding:20px 24px;">
    <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#c9973a;margin-bottom:8px;">Advisor's Note</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.8);line-height:1.65;font-style:italic;">${advisorNote}</div>
  </div>`
      : ""
  }

  <!-- FOOTER -->
  <div style="background:#0a1f2e;padding:18px 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
    <div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:15px;color:#d4b896;letter-spacing:0.1em;">${adv.name}</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);">${adv.agency}</div>
    </div>
    <div style="text-align:right;">
      ${adv.phone ? `<div style="font-size:12px;color:rgba(255,255,255,0.6);">${adv.phone}</div>` : ""}
      ${adv.email ? `<div style="font-size:11px;color:rgba(255,255,255,0.4);">${adv.email}</div>` : ""}
    </div>
  </div>
  <div style="background:#061420;padding:8px 40px;">
    <div style="font-size:10px;color:rgba(255,255,255,0.2);">Prices reflect total package for ${trip.adults} adults · ${trip.nights} nights · Subject to availability. Airfare, transfers &amp; travel insurance not included.</div>
  </div>
</div>
</body></html>`;
}
