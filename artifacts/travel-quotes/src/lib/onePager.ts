import type { AdvisorProfile, Hotel, TripDetails } from "../types";

export type OnePagerStyle = "luxury" | "editorial" | "bold";

function highlightEmoji(text: string): string {
  const t = text.toLowerCase();
  if (/beach|ocean|sea|coastal|waterfront/.test(t)) return "🏖️";
  if (/pool|swim/.test(t)) return "🏊";
  if (/spa|wellness|relax|massage/.test(t)) return "🧖";
  if (/dine|dining|restaurant|cuisine|food|culinary|gourmet/.test(t)) return "🍽️";
  if (/all.inclus|drink|bar|cocktail|beverage/.test(t)) return "🥂";
  if (/family|kid|children|water.park/.test(t)) return "👨‍👩‍👧";
  if (/couple|romance|honeymoon|adult.only|romantic/.test(t)) return "💑";
  if (/entertain|show|music|night|club/.test(t)) return "🎭";
  if (/golf/.test(t)) return "⛳";
  if (/view|panoram|scenic|sunset|sunrise/.test(t)) return "🌅";
  if (/butler|concierge|service|attend/.test(t)) return "🛎️";
  if (/private|exclusive|villa|suite/.test(t)) return "👑";
  if (/snorkel|dive|water.sport|excursion|activity/.test(t)) return "🤿";
  if (/transfer|airport|shuttle/.test(t)) return "🚐";
  return "✦";
}

function bestForLabel(category: string): string {
  const c = (category || "").toLowerCase();
  if (c.includes("budget")) return "Value Seekers";
  if (c.includes("best value")) return "Smart Travelers";
  if (c.includes("luxury") || c.includes("premium")) return "Luxury Travelers";
  if (c.includes("mid")) return "Couples";
  return "All Travelers";
}

function hasAllInclusive(hotel: Hotel): boolean {
  const text = [hotel.category, hotel.vibe, ...(hotel.highlights || []), ...(hotel.pros || [])].join(" ").toLowerCase();
  return text.includes("all-inclus") || text.includes("all inclus");
}

// ─── LUXURY STYLE ────────────────────────────────────────────────────────────
function luxuryStyles(): string {
  return `
    body { font-family: 'DM Sans', sans-serif; background: #f5f0e8; margin: 0; }
    .page { max-width: 800px; margin: 0 auto; background: #fff; }
    .hero { background: #0a1f2e; padding: 36px 44px 28px; }
    .hero-agency { font-family: 'Cormorant Garamond', serif; font-size: 22px; color: #fff; letter-spacing: 0.15em; font-weight: 500; }
    .hero-agency span { color: #c9973a; }
    .hero-tagline { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-top: 3px; }
    .hero-divider { height: 1px; background: rgba(201,151,58,0.25); margin: 20px 0; }
    .hero-destination { font-family: 'Cormorant Garamond', serif; font-size: 42px; color: #fff; font-style: italic; line-height: 1.1; margin-bottom: 6px; }
    .hero-dates { font-size: 14px; color: #c9973a; letter-spacing: 0.08em; margin-bottom: 18px; }
    .stats-bar { display: flex; gap: 0; border: 1px solid rgba(201,151,58,0.3); border-radius: 8px; overflow: hidden; }
    .stat { flex: 1; padding: 10px 14px; border-right: 1px solid rgba(201,151,58,0.2); }
    .stat:last-child { border-right: none; }
    .stat-label { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 3px; }
    .stat-value { font-size: 13px; color: #c9973a; font-weight: 500; }
    .hotels-section { padding: 28px 44px; }
    .section-label { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #9ca3af; margin-bottom: 16px; font-weight: 500; }
    .hotel-card { border: 1.5px solid #e8e2d9; border-radius: 10px; margin-bottom: 14px; overflow: hidden; position: relative; }
    .hotel-card.selected { border-color: #c9973a; box-shadow: 0 4px 20px rgba(201,151,58,0.18); }
    .hotel-card-inner { display: flex; gap: 0; }
    .hotel-col-left { padding: 20px 22px; flex: 0 0 220px; border-right: 1px solid #f0ebe0; }
    .hotel-col-mid { padding: 20px 22px; flex: 1; border-right: 1px solid #f0ebe0; }
    .hotel-col-right { padding: 20px 22px; flex: 0 0 150px; text-align: right; }
    .category-label { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #c9973a; font-weight: 600; margin-bottom: 7px; }
    .hotel-name { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 600; color: #0a1f2e; line-height: 1.2; margin-bottom: 7px; }
    .hotel-stars { color: #c9973a; font-size: 13px; margin-bottom: 8px; }
    .type-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .type-tag { font-size: 10px; background: #f5f0e8; color: #6b7280; padding: 2px 8px; border-radius: 4px; }
    .hotel-vibe { font-style: italic; color: #6b7280; font-size: 12px; line-height: 1.55; margin-bottom: 12px; }
    .highlight-pills { display: flex; flex-wrap: wrap; gap: 5px; }
    .pill { font-size: 11px; background: #f5f0e8; color: #374151; padding: 3px 10px; border-radius: 20px; }
    .price-main { font-family: 'Cormorant Garamond', serif; font-size: 30px; color: #c9973a; font-weight: 600; line-height: 1; margin-bottom: 3px; }
    .price-per { font-size: 11px; color: #9ca3af; margin-bottom: 10px; }
    .refund-badge { display: inline-block; font-size: 10px; padding: 3px 8px; border-radius: 4px; font-weight: 500; }
    .refund-green { background: #d1fae5; color: #065f46; }
    .refund-amber { background: #fef3c7; color: #92400e; }
    .selection-banner { position: absolute; top: 0; right: 0; background: #c9973a; color: #fff; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; padding: 5px 14px; border-bottom-left-radius: 8px; }
    .compare-section { padding: 0 44px 28px; }
    .compare-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .compare-table th { padding: 8px 12px; background: #f5f0e8; text-align: left; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: #6b7280; font-weight: 500; border-bottom: 1px solid #e8e2d9; }
    .compare-table td { padding: 9px 12px; border-bottom: 1px solid #f5f0e8; color: #374151; vertical-align: middle; }
    .compare-table tr:last-child td { border-bottom: none; }
    .ai-check { color: #059669; font-size: 14px; }
    .advisor-note { margin: 0 44px 24px; background: #0a1f2e; border-radius: 10px; padding: 18px 22px; }
    .advisor-note-label { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #c9973a; margin-bottom: 7px; }
    .advisor-note-text { font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.65; font-style: italic; }
    .footer { background: #0a1f2e; padding: 22px 44px; display: flex; justify-content: space-between; gap: 20px; }
    .footer-left {}
    .footer-adv-name { font-family: 'Cormorant Garamond', serif; font-size: 18px; color: #d4b896; letter-spacing: 0.08em; margin-bottom: 2px; }
    .footer-adv-title { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 8px; }
    .footer-contact { font-size: 12px; color: rgba(255,255,255,0.6); line-height: 1.7; }
    .footer-right { text-align: right; max-width: 280px; }
    .footer-notes-label { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 6px; }
    .footer-notes-text { font-size: 10px; color: rgba(255,255,255,0.35); line-height: 1.7; }
    .sub-footer { background: #061420; padding: 8px 44px; }
    .sub-footer-text { font-size: 9px; color: rgba(255,255,255,0.18); }
    @page { margin: 0; size: auto; }
    @media print { body { margin: 1cm; } .page { box-shadow: none; } }
  `;
}

// ─── EDITORIAL STYLE ─────────────────────────────────────────────────────────
function editorialStyles(): string {
  return `
    body { font-family: 'DM Sans', sans-serif; background: #faf8f5; margin: 0; }
    .page { max-width: 800px; margin: 0 auto; background: #fff; }
    .hero { background: #faf8f5; padding: 40px 44px 32px; border-bottom: 1px solid #e8e4dd; }
    .hero-agency { font-family: 'Cormorant Garamond', serif; font-size: 22px; color: #1a1a1a; letter-spacing: 0.12em; font-weight: 500; }
    .hero-agency span { color: #c9973a; }
    .hero-tagline { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #9ca3af; margin-top: 3px; }
    .hero-divider { height: 1px; background: #e8e4dd; margin: 22px 0; }
    .hero-destination { font-family: 'Cormorant Garamond', serif; font-size: 48px; color: #1a1a1a; font-style: italic; line-height: 1.05; margin-bottom: 6px; }
    .hero-dates { font-size: 14px; color: #c9973a; letter-spacing: 0.06em; margin-bottom: 20px; }
    .stats-bar { display: flex; gap: 24px; }
    .stat { }
    .stat-label { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #9ca3af; margin-bottom: 3px; }
    .stat-value { font-size: 13px; color: #1a1a1a; font-weight: 500; }
    .hotels-section { padding: 28px 44px; }
    .section-label { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #9ca3af; margin-bottom: 16px; font-weight: 500; }
    .hotel-card { border: 1px solid #e8e4dd; border-radius: 8px; margin-bottom: 14px; overflow: hidden; position: relative; }
    .hotel-card.selected { border-color: #c9973a; }
    .hotel-card-inner { display: flex; gap: 0; }
    .hotel-col-left { padding: 20px 22px; flex: 0 0 220px; border-right: 1px solid #f0ede8; }
    .hotel-col-mid { padding: 20px 22px; flex: 1; border-right: 1px solid #f0ede8; }
    .hotel-col-right { padding: 20px 22px; flex: 0 0 150px; text-align: right; }
    .category-label { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #c9973a; font-weight: 600; margin-bottom: 7px; }
    .hotel-name { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; color: #1a1a1a; line-height: 1.2; margin-bottom: 7px; }
    .hotel-stars { color: #c9973a; font-size: 13px; margin-bottom: 8px; }
    .type-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .type-tag { font-size: 10px; background: #f5f2ee; color: #6b7280; padding: 2px 8px; border-radius: 4px; }
    .hotel-vibe { font-style: italic; color: #6b7280; font-size: 12px; line-height: 1.55; margin-bottom: 12px; }
    .highlight-pills { display: flex; flex-wrap: wrap; gap: 5px; }
    .pill { font-size: 11px; background: #faf8f5; color: #374151; padding: 3px 10px; border-radius: 20px; border: 1px solid #e8e4dd; }
    .price-main { font-family: 'Cormorant Garamond', serif; font-size: 30px; color: #1a1a1a; font-weight: 600; line-height: 1; margin-bottom: 3px; }
    .price-per { font-size: 11px; color: #9ca3af; margin-bottom: 10px; }
    .refund-badge { display: inline-block; font-size: 10px; padding: 3px 8px; border-radius: 4px; font-weight: 500; }
    .refund-green { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    .refund-amber { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
    .selection-banner { position: absolute; top: 0; right: 0; background: #c9973a; color: #fff; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; padding: 5px 14px; border-bottom-left-radius: 8px; }
    .compare-section { padding: 0 44px 28px; }
    .compare-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .compare-table th { padding: 8px 12px; background: #faf8f5; text-align: left; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: #6b7280; font-weight: 500; border-bottom: 1px solid #e8e4dd; }
    .compare-table td { padding: 9px 12px; border-bottom: 1px solid #f5f2ee; color: #374151; vertical-align: middle; }
    .compare-table tr:last-child td { border-bottom: none; }
    .ai-check { color: #059669; font-size: 14px; }
    .advisor-note { margin: 0 44px 24px; background: #faf8f5; border: 1px solid #e8e4dd; border-radius: 8px; padding: 18px 22px; }
    .advisor-note-label { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #c9973a; margin-bottom: 7px; }
    .advisor-note-text { font-size: 13px; color: #374151; line-height: 1.65; font-style: italic; }
    .footer { background: #faf8f5; border-top: 1px solid #e8e4dd; padding: 22px 44px; display: flex; justify-content: space-between; gap: 20px; }
    .footer-left {}
    .footer-adv-name { font-family: 'Cormorant Garamond', serif; font-size: 18px; color: #1a1a1a; letter-spacing: 0.06em; margin-bottom: 2px; }
    .footer-adv-title { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #9ca3af; margin-bottom: 8px; }
    .footer-contact { font-size: 12px; color: #6b7280; line-height: 1.7; }
    .footer-right { text-align: right; max-width: 280px; }
    .footer-notes-label { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #9ca3af; margin-bottom: 6px; }
    .footer-notes-text { font-size: 10px; color: #9ca3af; line-height: 1.7; }
    .sub-footer { background: #f0ede8; padding: 8px 44px; }
    .sub-footer-text { font-size: 9px; color: #9ca3af; }
    @page { margin: 0; size: auto; }
    @media print { body { margin: 1cm; } .page { box-shadow: none; } }
  `;
}

// ─── BOLD STYLE ───────────────────────────────────────────────────────────────
function boldStyles(): string {
  return `
    body { font-family: 'DM Sans', sans-serif; background: #fff; margin: 0; }
    .page { max-width: 800px; margin: 0 auto; background: #fff; }
    .hero { background: #fff; padding: 36px 44px 28px; border-bottom: 4px solid #c9973a; }
    .hero-agency { font-family: 'Cormorant Garamond', serif; font-size: 24px; color: #0a1f2e; letter-spacing: 0.12em; font-weight: 600; }
    .hero-agency span { color: #c9973a; }
    .hero-tagline { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #9ca3af; margin-top: 3px; }
    .hero-divider { height: 3px; background: #0a1f2e; margin: 20px 0; }
    .hero-destination { font-family: 'Cormorant Garamond', serif; font-size: 56px; color: #0a1f2e; line-height: 1; margin-bottom: 6px; font-weight: 600; }
    .hero-dates { font-size: 15px; color: #c9973a; font-weight: 500; margin-bottom: 20px; }
    .stats-bar { display: flex; gap: 0; background: #0a1f2e; border-radius: 8px; overflow: hidden; }
    .stat { flex: 1; padding: 12px 16px; border-right: 1px solid rgba(255,255,255,0.1); }
    .stat:last-child { border-right: none; }
    .stat-label { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 3px; }
    .stat-value { font-size: 14px; color: #c9973a; font-weight: 600; }
    .hotels-section { padding: 28px 44px; }
    .section-label { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #9ca3af; margin-bottom: 16px; font-weight: 500; }
    .hotel-card { border: 2px solid #e5e7eb; border-radius: 10px; margin-bottom: 14px; overflow: hidden; position: relative; }
    .hotel-card.selected { border-color: #c9973a; border-width: 2.5px; }
    .hotel-card-inner { display: flex; gap: 0; }
    .hotel-col-left { padding: 20px 22px; flex: 0 0 220px; border-right: 2px solid #f3f4f6; }
    .hotel-col-mid { padding: 20px 22px; flex: 1; border-right: 2px solid #f3f4f6; }
    .hotel-col-right { padding: 20px 22px; flex: 0 0 150px; text-align: right; }
    .category-label { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #c9973a; font-weight: 700; margin-bottom: 7px; }
    .hotel-name { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: #0a1f2e; line-height: 1.15; margin-bottom: 7px; }
    .hotel-stars { color: #c9973a; font-size: 14px; margin-bottom: 8px; }
    .type-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .type-tag { font-size: 10px; background: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 4px; font-weight: 500; }
    .hotel-vibe { font-style: italic; color: #6b7280; font-size: 12px; line-height: 1.55; margin-bottom: 12px; }
    .highlight-pills { display: flex; flex-wrap: wrap; gap: 5px; }
    .pill { font-size: 11px; background: #f3f4f6; color: #1f2937; padding: 3px 10px; border-radius: 20px; font-weight: 500; }
    .price-main { font-family: 'Cormorant Garamond', serif; font-size: 34px; color: #0a1f2e; font-weight: 700; line-height: 1; margin-bottom: 3px; }
    .price-per { font-size: 11px; color: #9ca3af; margin-bottom: 10px; font-weight: 500; }
    .refund-badge { display: inline-block; font-size: 10px; padding: 3px 8px; border-radius: 4px; font-weight: 600; }
    .refund-green { background: #d1fae5; color: #065f46; }
    .refund-amber { background: #fef3c7; color: #78350f; }
    .selection-banner { position: absolute; top: 0; right: 0; background: #c9973a; color: #fff; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700; padding: 6px 16px; border-bottom-left-radius: 8px; }
    .compare-section { padding: 0 44px 28px; }
    .compare-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .compare-table th { padding: 10px 12px; background: #0a1f2e; color: rgba(255,255,255,0.7); text-align: left; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; }
    .compare-table td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: middle; }
    .compare-table tr:last-child td { border-bottom: none; }
    .ai-check { color: #059669; font-size: 14px; font-weight: 700; }
    .advisor-note { margin: 0 44px 24px; background: #f3f4f6; border-left: 4px solid #c9973a; border-radius: 0 8px 8px 0; padding: 18px 22px; }
    .advisor-note-label { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #c9973a; font-weight: 700; margin-bottom: 7px; }
    .advisor-note-text { font-size: 13px; color: #374151; line-height: 1.65; font-style: italic; }
    .footer { background: #0a1f2e; padding: 24px 44px; display: flex; justify-content: space-between; gap: 20px; }
    .footer-left {}
    .footer-adv-name { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: #d4b896; letter-spacing: 0.06em; margin-bottom: 2px; font-weight: 600; }
    .footer-adv-title { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 8px; }
    .footer-contact { font-size: 12px; color: rgba(255,255,255,0.6); line-height: 1.7; }
    .footer-right { text-align: right; max-width: 280px; }
    .footer-notes-label { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 6px; font-weight: 600; }
    .footer-notes-text { font-size: 10px; color: rgba(255,255,255,0.35); line-height: 1.7; }
    .sub-footer { background: #061420; padding: 8px 44px; }
    .sub-footer-text { font-size: 9px; color: rgba(255,255,255,0.2); }
    @page { margin: 0; size: auto; }
    @media print { body { margin: 1cm; } .page { box-shadow: none; } }
  `;
}

export function buildOnePager(
  adv: AdvisorProfile,
  trip: TripDetails,
  selected: Hotel,
  allHotels: Hotel[],
  advisorNote?: string,
  style: OnePagerStyle = "luxury"
): string {
  const others = allHotels.filter((h) => h.name !== selected.name);

  const styles =
    style === "editorial"
      ? editorialStyles()
      : style === "bold"
        ? boldStyles()
        : luxuryStyles();

  // Price range across all hotels
  const prices = allHotels.map((h) => h.totalPrice).filter(Boolean);
  const priceRange = prices.length > 1 ? `${prices[prices.length - 1]} – ${prices[0]}` : prices[0] || "—";

  // Build hotel cards HTML
  const allCards = allHotels
    .map((hotel) => {
      const isSelected = hotel.name === selected.name;
      const stars = "★".repeat(hotel.stars || 4);
      const highlights = (hotel.highlights || hotel.pros || []).slice(0, 4);
      const pills = highlights.map((h) => `<span class="pill">${highlightEmoji(h)} ${h}</span>`).join(" ");
      const tags = [hotel.category].filter(Boolean).map((t) => `<span class="type-tag">${t}</span>`).join(" ");

      const isAmberRefund = hotel.refundableBy
        ? /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d+/i.test(hotel.refundableBy)
        : false;
      const refundBadge = hotel.refundableBy
        ? `<span class="refund-badge ${isAmberRefund ? "refund-amber" : "refund-green"}">Cancel by ${hotel.refundableBy}</span>`
        : "";

      return `
      <div class="hotel-card ${isSelected ? "selected" : ""}">
        ${isSelected ? `<div class="selection-banner">★ Client Selection</div>` : ""}
        <div class="hotel-card-inner">
          <div class="hotel-col-left">
            ${hotel.advisorPick ? `<div class="category-label">⭐ Advisor's Pick</div>` : `<div class="category-label">${hotel.category || "Option"}</div>`}
            <div class="hotel-name">${hotel.name}</div>
            <div class="hotel-stars">${stars}</div>
            <div class="type-tags">${tags}</div>
          </div>
          <div class="hotel-col-mid">
            <div class="hotel-vibe">${hotel.vibe || ""}</div>
            <div class="highlight-pills">${pills}</div>
          </div>
          <div class="hotel-col-right">
            <div class="price-main">${hotel.totalPrice}</div>
            ${hotel.perPersonPrice ? `<div class="price-per">${hotel.perPersonPrice} / person</div>` : `<div class="price-per">&nbsp;</div>`}
            ${refundBadge}
          </div>
        </div>
      </div>`;
    })
    .join("");

  // Comparison table rows — all hotels
  const tableRows = allHotels
    .map((hotel) => {
      const isSelected = hotel.name === selected.name;
      const nameCell = isSelected ? `<strong>${hotel.name}</strong>` : hotel.name;
      const aiCheck = hasAllInclusive(hotel) ? `<span class="ai-check">✓</span>` : `<span style="color:#d1d5db;">—</span>`;
      return `
      <tr${isSelected ? ` style="background:#fffbf4;"` : ""}>
        <td>${nameCell}</td>
        <td>${"★".repeat(hotel.stars || 4)}</td>
        <td style="font-weight:500;color:#c9973a;">${hotel.totalPrice}</td>
        <td style="font-style:italic;font-size:11px;">${hotel.vibe || "—"}</td>
        <td style="text-align:center;">${aiCheck}</td>
        <td>${hotel.refundableBy ? hotel.refundableBy : "—"}</td>
        <td style="font-size:11px;">${bestForLabel(hotel.category)}</td>
      </tr>`;
    })
    .join("");

  // Auto-detect cancellation warnings
  const hasCancelDeadlines = allHotels.some((h) => h.refundableBy);
  const cancelNote = hasCancelDeadlines
    ? "Cancellation deadlines apply — please review refund dates above before confirming."
    : "";

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<title>Travolo Quote — ${trip.destination}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;}
  ${styles}
</style>
</head><body>
<div class="page">

  <!-- HERO -->
  <div class="hero">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <div class="hero-agency">${adv.agency || "Your Agency"}</div>
        <div class="hero-tagline">Powered by Travolo</div>
      </div>
      <div style="text-align:right;font-size:11px;color:#9ca3af;">
        Prepared for <strong style="color:inherit;">${trip.clients}</strong>
      </div>
    </div>
    <div class="hero-divider"></div>
    <div class="hero-destination">${trip.destination}</div>
    <div class="hero-dates">${trip.dates}</div>
    <div class="stats-bar">
      <div class="stat"><div class="stat-label">Dates</div><div class="stat-value">${trip.dates || "—"}</div></div>
      <div class="stat"><div class="stat-label">Duration</div><div class="stat-value">${trip.nights} nights</div></div>
      <div class="stat"><div class="stat-label">Travelers</div><div class="stat-value">${trip.adults} adults</div></div>
      <div class="stat"><div class="stat-label">Options</div><div class="stat-value">${allHotels.length} properties</div></div>
      <div class="stat"><div class="stat-label">Price Range</div><div class="stat-value">${priceRange}</div></div>
    </div>
  </div>

  <!-- HOTEL CARDS -->
  <div class="hotels-section">
    <div class="section-label">Property Options</div>
    ${allCards}
  </div>

  <!-- COMPARISON TABLE -->
  <div class="compare-section">
    <div class="section-label">At-a-Glance Comparison</div>
    <table class="compare-table">
      <thead>
        <tr>
          <th>Property</th>
          <th>Stars</th>
          <th>Total Price</th>
          <th>Vibe</th>
          <th style="text-align:center;">All-Incl.</th>
          <th>Cancel By</th>
          <th>Best For</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  </div>

  ${advisorNote ? `
  <!-- ADVISOR NOTE -->
  <div class="advisor-note">
    <div class="advisor-note-label">Advisor's Note</div>
    <div class="advisor-note-text">${advisorNote}</div>
  </div>` : ""}

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-left">
      <div class="footer-adv-name">${adv.name}</div>
      <div class="footer-adv-title">${adv.agency}</div>
      <div class="footer-contact">
        ${adv.phone ? `📞 ${adv.phone}<br>` : ""}
        ${adv.email ? `✉ ${adv.email}` : ""}
      </div>
    </div>
    <div class="footer-right">
      <div class="footer-notes-label">Important Notes</div>
      <div class="footer-notes-text">
        Prices reflect total package for ${trip.adults} adults · ${trip.nights} nights · Subject to availability.<br>
        Airfare, transfers &amp; travel insurance not included.<br>
        ${cancelNote}
      </div>
    </div>
  </div>
  <div class="sub-footer">
    <div class="sub-footer-text">Quote prepared by ${adv.name} · ${adv.agency} · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
  </div>

</div>
</body></html>`;
}
