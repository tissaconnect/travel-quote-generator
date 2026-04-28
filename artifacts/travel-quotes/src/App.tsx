import { useState, useRef, useEffect } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import type { AdvisorProfile, Hotel, ParsedQuotes, TripDetails } from "./types";
import { buildOnePager, type OnePagerStyle } from "./lib/onePager";

const MAX_HOTELS = 4;

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#c9973a",
    colorForeground: "#1a1a1a",
    colorMutedForeground: "#6b7280",
    colorDanger: "#dc2626",
    colorBackground: "#ffffff",
    colorInput: "#f5f0e8",
    colorInputForeground: "#1a1a1a",
    colorNeutral: "rgba(201,151,58,0.35)",
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: "8px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-xl w-[440px] max-w-full overflow-hidden shadow-lg",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: { color: "#0a1f2e", fontSize: "1.4rem" },
    headerSubtitle: { color: "#6b7280" },
    socialButtonsBlockButtonText: { color: "#1a1a1a" },
    formFieldLabel: { color: "#6b7280", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" as const },
    footerActionLink: { color: "#c9973a" },
    footerActionText: { color: "#6b7280" },
    dividerText: { color: "#6b7280" },
    identityPreviewEditButton: { color: "#c9973a" },
    formFieldSuccessText: { color: "#059669" },
    alertText: { color: "#dc2626" },
    logoBox: { display: "flex", justifyContent: "center", padding: "8px 0" },
    logoImage: { height: "36px" },
    socialButtonsBlockButton: { border: "1px solid rgba(201,151,58,0.2)", background: "#f5f0e8" },
    formButtonPrimary: { background: "#0a1f2e", color: "#ffffff" },
    formFieldInput: { background: "#f5f0e8", border: "1px solid rgba(201,151,58,0.25)", color: "#1a1a1a" },
    footerAction: { background: "transparent" },
    dividerLine: { background: "rgba(201,151,58,0.2)" },
    alert: { background: "#fef2f2" },
    otpCodeFieldInput: { background: "#f5f0e8", border: "1px solid rgba(201,151,58,0.25)" },
    formFieldRow: {},
    main: {},
  },
};

function loadProfile(): AdvisorProfile {
  return {
    name: localStorage.getItem("adv-name") ?? "",
    agency: localStorage.getItem("adv-agency") ?? "",
    phone: localStorage.getItem("adv-phone") ?? "",
    email: localStorage.getItem("adv-email") ?? "",
  };
}

function saveProfileField(key: string, value: string) {
  localStorage.setItem(key, value);
}

const STYLES: { id: OnePagerStyle; label: string; description: string }[] = [
  { id: "luxury", label: "Luxury", description: "Dark navy & gold, premium feel" },
  { id: "editorial", label: "Editorial", description: "Cream tones, light & airy" },
  { id: "bold", label: "Bold", description: "Clean white, strong accents" },
];

// ─── MAIN QUOTE GENERATOR APP ─────────────────────────────────────────────────

function QuoteGeneratorApp() {
  const { signOut } = useClerk();
  const [profile, setProfile] = useState<AdvisorProfile>(loadProfile);
  const [trip, setTrip] = useState<TripDetails>({
    destination: "",
    dates: "",
    adults: "2",
    nights: "5",
    clients: "",
  });
  const [rawText, setRawText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [parsedData, setParsedData] = useState<ParsedQuotes | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<OnePagerStyle>("luxury");
  const [shareStatus, setShareStatus] = useState<"idle" | "copying" | "copied">("idle");
  const [printing, setPrinting] = useState(false);

  const hotelSectionRef = useRef<HTMLDivElement>(null);
  const previewSectionRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  function updateProfile(field: keyof AdvisorProfile, value: string) {
    setProfile((p) => ({ ...p, [field]: value }));
    saveProfileField(`adv-${field}`, value);
  }

  async function parseQuotes() {
    if (!rawText.trim()) {
      alert("Please paste your quote text first.");
      return;
    }
    setParsing(true);
    setParseError("");
    setParsedData(null);
    setSelectedIndex(null);
    setPreviewHtml(null);

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/parse-quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, tripDetails: trip }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Failed to parse");

      setParsedData(data);

      const pickIndex = data.hotels.findIndex((h: Hotel) => h.advisorPick);
      if (pickIndex !== -1) setSelectedIndex(Math.min(pickIndex, MAX_HOTELS - 1));

      setTimeout(() => {
        hotelSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: unknown) {
      setParseError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setParsing(false);
    }
  }

  function buildCurrentHtml(): string | null {
    if (selectedIndex === null || !parsedData) return null;

    const adv: AdvisorProfile = {
      name: profile.name || "Your Advisor",
      agency: profile.agency || "Travel Advisory",
      phone: profile.phone,
      email: profile.email,
    };
    const tripData: TripDetails = {
      destination: trip.destination || "Your Destination",
      dates: trip.dates,
      adults: trip.adults || "2",
      nights: trip.nights || "5",
      clients: trip.clients || "Valued Client",
    };

    const visibleHotels = parsedData.hotels.slice(0, MAX_HOTELS);
    const selected = visibleHotels[selectedIndex] ?? visibleHotels[0];

    return buildOnePager(adv, tripData, selected, visibleHotels, parsedData.advisorNote, selectedStyle);
  }

  function generatePreview() {
    if (selectedIndex === null || !parsedData) {
      alert("Please select a hotel first.");
      return;
    }

    const html = buildCurrentHtml();
    if (!html) return;
    setPreviewHtml(html);
    setShareStatus("idle");

    setTimeout(() => {
      previewSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      if (iframeRef.current) {
        iframeRef.current.srcdoc = html;
        iframeRef.current.onload = () => {
          const h = iframeRef.current?.contentDocument?.body?.scrollHeight;
          if (h && iframeRef.current) {
            iframeRef.current.style.height = Math.max(h + 30, 700) + "px";
          }
        };
      }
    }, 100);
  }

  async function saveQuoteToServer(html: string): Promise<string> {
    const res = await fetch(`${import.meta.env.BASE_URL}api/save-quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html }),
    });
    const data = await res.json();
    if (!res.ok || !data.id) throw new Error("Failed to save quote");
    return data.id;
  }

  async function printPreview() {
    if (!previewHtml) return;
    setPrinting(true);
    try {
      const id = await saveQuoteToServer(previewHtml);
      const url = `${window.location.origin}${import.meta.env.BASE_URL}api/quote/${id}`;
      const win = window.open(url, "_blank");
      if (win) {
        win.onload = () => {
          setTimeout(() => win.print(), 500);
        };
      }
    } catch {
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(previewHtml);
        win.document.close();
        win.onload = () => win.print();
      }
    } finally {
      setPrinting(false);
    }
  }

  async function copyShareLink() {
    if (!previewHtml) return;
    setShareStatus("copying");
    try {
      const id = await saveQuoteToServer(previewHtml);
      const url = `${window.location.origin}${import.meta.env.BASE_URL}api/quote/${id}`;
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 3000);
    } catch {
      setShareStatus("idle");
      alert("Could not copy link. Please try again.");
    }
  }

  const gb = "rgba(201,151,58,0.2)";
  const visibleHotels = parsedData?.hotels.slice(0, MAX_HOTELS) ?? [];
  const hiddenCount = (parsedData?.hotels.length ?? 0) - MAX_HOTELS;

  return (
    <div style={{ backgroundColor: "#f5f0e8", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#1a1a1a" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>

        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2.5rem", position: "relative" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", color: "#0a1f2e", letterSpacing: "0.15em", fontWeight: 500 }}>
              Travolo<span style={{ color: "#c9973a" }}>.</span>
            </div>
            <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b7280", marginTop: 4 }}>
              Quote Generator
            </div>
          </div>
          <button
            onClick={() => signOut()}
            style={{
              position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
              background: "transparent", border: "1px solid rgba(201,151,58,0.25)",
              borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#6b7280",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.03em",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c9973a"; e.currentTarget.style.color = "#0a1f2e"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,151,58,0.25)"; e.currentTarget.style.color = "#6b7280"; }}
          >
            Sign Out
          </button>
        </header>

        {/* Advisor Profile */}
        <Card title="Advisor Profile">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Your Name">
              <Input value={profile.name} onChange={(v) => updateProfile("name", v)} placeholder="Monique Robinson" />
            </Field>
            <Field label="Agency Name">
              <Input value={profile.agency} onChange={(v) => updateProfile("agency", v)} placeholder="Your Agency Name" />
            </Field>
            <Field label="Phone / Text">
              <Input value={profile.phone} onChange={(v) => updateProfile("phone", v)} placeholder="+1.585.503.1066" />
            </Field>
            <Field label="Email">
              <Input value={profile.email} onChange={(v) => updateProfile("email", v)} placeholder="monique@sevenseas.com" type="email" />
            </Field>
          </div>
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: "0.75rem" }}>
            Your profile saves automatically in the browser — only enter this once.
          </p>
        </Card>

        {/* Trip Details */}
        <Card title="Trip Details">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Destination">
              <Input value={trip.destination} onChange={(v) => setTrip((t) => ({ ...t, destination: v }))} placeholder="Jamaica" />
            </Field>
            <Field label="Travel Dates">
              <Input value={trip.dates} onChange={(v) => setTrip((t) => ({ ...t, dates: v }))} placeholder="December 10–15, 2025" />
            </Field>
            <Field label="Number of Adults">
              <Input value={trip.adults} onChange={(v) => setTrip((t) => ({ ...t, adults: v }))} placeholder="2" type="number" />
            </Field>
            <Field label="Number of Nights">
              <Input value={trip.nights} onChange={(v) => setTrip((t) => ({ ...t, nights: v }))} placeholder="5" type="number" />
            </Field>
            <Field label="Client Name(s)">
              <Input value={trip.clients} onChange={(v) => setTrip((t) => ({ ...t, clients: v }))} placeholder="Geri & Guest" />
            </Field>
          </div>
        </Card>

        {/* Paste Quotes */}
        <Card title="Paste Raw Quote">
          <Field label="Paste your quote text here — email, GDS output, notes, anything">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste the full quote text from your system, email, or notes here. Claude will automatically extract each hotel option, pricing, highlights, and your recommendation..."
              style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#1a1a1a",
                backgroundColor: "#f5f0e8", border: `1px solid ${gb}`, borderRadius: 7,
                padding: "10px 12px", outline: "none", resize: "vertical", minHeight: 160,
                lineHeight: 1.6, width: "100%", transition: "border-color 0.2s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#c9973a"; e.target.style.backgroundColor = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = gb; e.target.style.backgroundColor = "#f5f0e8"; }}
            />
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: "1rem" }}>
            <Btn navy disabled={parsing} onClick={parseQuotes}>
              {parsing ? <><div className="spinner" /> Parsing...</> : "✨ Parse & Extract Hotels"}
            </Btn>
          </div>

          {parsing && (
            <StatusRow><div className="spinner" /> Claude is reading your quotes...</StatusRow>
          )}
          {parseError && (
            <div style={{ color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", marginTop: "1rem", fontSize: 14 }}>
              {parseError}
            </div>
          )}
          {parsedData && !parsing && (
            <StatusRow>Found {parsedData.hotels.length} hotel option{parsedData.hotels.length !== 1 ? "s" : ""}</StatusRow>
          )}
        </Card>

        {/* Hotel Selection */}
        {parsedData && (
          <div ref={hotelSectionRef}>
            <Card title="Choose the Selected Property">
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: "1rem" }}>
                Click the hotel your client is booking. It'll be highlighted on the one-pager.
              </p>
              <div style={{ display: "grid", gap: "1rem" }}>
                {visibleHotels.map((hotel, i) => (
                  <HotelCard
                    key={i}
                    hotel={hotel}
                    selected={selectedIndex === i}
                    onClick={() => setSelectedIndex(i)}
                  />
                ))}
              </div>

              {hiddenCount > 0 && (
                <div style={{
                  fontSize: 12, color: "#9ca3af", marginTop: "0.75rem",
                  padding: "8px 14px", background: "#fafafa", border: "1px solid #f0ebe0",
                  borderRadius: 8, textAlign: "center",
                }}>
                  Showing top 4 options. Upgrade for unlimited.
                </div>
              )}

              {/* Style Selector */}
              <div style={{ marginTop: "1.5rem" }}>
                <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", fontWeight: 500, marginBottom: 10 }}>
                  One-Pager Style
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStyle(s.id)}
                      style={{
                        border: selectedStyle === s.id ? "2px solid #c9973a" : "2px solid rgba(201,151,58,0.2)",
                        borderRadius: 10, padding: "12px 14px", cursor: "pointer",
                        background: selectedStyle === s.id ? "#fffbf4" : "#ffffff",
                        textAlign: "left", transition: "all 0.2s",
                        boxShadow: selectedStyle === s.id ? "0 2px 12px rgba(201,151,58,0.12)" : "none",
                      }}
                    >
                      <div style={{
                        width: "100%", height: 28, borderRadius: 5, marginBottom: 8,
                        background: s.id === "luxury" ? "#0a1f2e" : s.id === "editorial" ? "#faf8f5" : "#ffffff",
                        border: s.id === "editorial" ? "1px solid #e8e4dd" : s.id === "bold" ? "1px solid #e5e7eb" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{
                          width: 40, height: 4, borderRadius: 2,
                          background: s.id === "luxury" ? "#c9973a" : s.id === "editorial" ? "#c9973a" : "#0a1f2e",
                        }} />
                      </div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 600, color: "#0a1f2e", marginBottom: 2 }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.description}</div>
                      {selectedStyle === s.id && (
                        <div style={{ fontSize: 10, color: "#c9973a", marginTop: 4, fontWeight: 500 }}>Selected</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: "1.5rem", flexWrap: "wrap" }}>
                <Btn gold onClick={generatePreview}>
                  Generate One-Pager
                </Btn>
              </div>
            </Card>
          </div>
        )}

        {/* Preview Section */}
        {previewHtml && (
          <div ref={previewSectionRef}>
            <div style={{ display: "flex", gap: 10, marginBottom: "1rem", flexWrap: "wrap" }}>
              <Btn navy disabled={printing} onClick={printPreview}>
                {printing ? "Opening..." : "🖨 Print / Save as PDF"}
              </Btn>
              <Btn
                gold
                onClick={copyShareLink}
                disabled={shareStatus === "copying"}
              >
                {shareStatus === "copied"
                  ? "✓ Link Copied!"
                  : shareStatus === "copying"
                    ? "Saving..."
                    : "🔗 Copy Shareable Link"}
              </Btn>
              <BtnOutline onClick={() => setPreviewHtml(null)}>
                ← Edit
              </BtnOutline>
            </div>
            {shareStatus === "copied" && (
              <div style={{ fontSize: 13, color: "#059669", background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 8, padding: "10px 16px", marginBottom: "1rem" }}>
                Shareable link copied to clipboard — send it directly to your client.
              </div>
            )}
            <iframe
              ref={iframeRef}
              style={{
                width: "100%", border: "none", borderRadius: 12, overflow: "hidden",
                boxShadow: "0 8px 40px rgba(10,31,46,0.15)", minHeight: 700,
              }}
              title="One-Pager Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AUTH PAGES ───────────────────────────────────────────────────────────────

function SignInPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f0e8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f0e8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "active" | "inactive">("loading");

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/subscription-status`)
      .then((r) => r.json())
      .then((d) => setStatus(d.hasSubscription ? "active" : "inactive"))
      .catch(() => setStatus("active")); // fail open in dev
  }, []);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 14, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>Loading…</div>
      </div>
    );
  }

  if (status === "inactive") {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f0e8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", color: "#0a1f2e", letterSpacing: "0.15em", fontWeight: 500 }}>
            Travolo<span style={{ color: "#c9973a" }}>.</span>
          </div>
        </div>
        <div style={{ background: "#fff", border: "1px solid rgba(201,151,58,0.2)", borderRadius: 14, padding: "2.5rem 2rem", width: "100%", maxWidth: 420, boxShadow: "0 4px 24px rgba(10,31,46,0.07)", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔒</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", color: "#0a1f2e", marginBottom: 8 }}>
            No active subscription
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: "1.75rem", lineHeight: 1.6 }}>
            Start your free trial to access the Travolo quote generator.
          </div>
          <a
            href="https://buy.stripe.com/test_eVqbJ1b5P4iY32p76Zds400"
            style={{
              display: "block", width: "100%", padding: "13px 24px", borderRadius: 8,
              background: "#c9973a", color: "#fff", fontFamily: "'DM Sans', sans-serif",
              fontSize: 15, fontWeight: 500, cursor: "pointer", letterSpacing: "0.03em",
              textDecoration: "none", textAlign: "center", boxSizing: "border-box",
            }}
          >
            Start Your Free Trial
          </a>
          <div style={{ marginTop: "1.25rem", fontSize: 12, color: "#9ca3af" }}>
            $9/month · 14-day free trial · Cancel anytime
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function HomeRoute() {
  return (
    <>
      <Show when="signed-in">
        <SubscriptionGate>
          <QuoteGeneratorApp />
        </SubscriptionGate>
      </Show>
      <Show when="signed-out">
        <BrandedSignInScreen />
      </Show>
    </>
  );
}

function BrandedSignInScreen() {
  const [, setLocation] = useLocation();
  return (
    <div style={{ minHeight: "100vh", background: "#f5f0e8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.8rem", color: "#0a1f2e", letterSpacing: "0.15em", fontWeight: 500, lineHeight: 1 }}>
          Travolo<span style={{ color: "#c9973a" }}>.</span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#6b7280", marginTop: 8 }}>
          Quote Generator
        </div>
      </div>
      <div style={{ background: "#fff", border: "1px solid rgba(201,151,58,0.2)", borderRadius: 14, padding: "2.5rem 2rem", width: "100%", maxWidth: 420, boxShadow: "0 4px 24px rgba(10,31,46,0.07)", textAlign: "center" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", color: "#0a1f2e", marginBottom: 8 }}>
          Sign in to Travolo
        </div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: "1.75rem", lineHeight: 1.5 }}>
          Welcome back — your clients are waiting
        </div>
        <button
          onClick={() => setLocation("/sign-in")}
          style={{
            width: "100%", padding: "13px 24px", borderRadius: 8, border: "none",
            background: "#0a1f2e", color: "#fff", fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, fontWeight: 500, cursor: "pointer", letterSpacing: "0.03em",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#122d42"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#0a1f2e"; }}
        >
          Sign In
        </button>
        <div style={{ marginTop: "1.25rem", fontSize: 13, color: "#9ca3af" }}>
          Don't have an account?{" "}
          <span
            onClick={() => setLocation("/sign-up")}
            style={{ color: "#c9973a", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}
          >
            Sign up
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── CLERK PROVIDER + ROUTER ──────────────────────────────────────────────────

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey!}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Sign in to Travolo",
            subtitle: "Welcome back — your clients are waiting",
          },
        },
        signUp: {
          start: {
            title: "Create your Travolo account",
            subtitle: "Start generating beautiful client quotes",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <Switch>
        <Route path="/" component={HomeRoute} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
      </Switch>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(201,151,58,0.2)", borderRadius: 12, padding: "1.75rem", marginBottom: "1.25rem", boxShadow: "0 2px 12px rgba(10,31,46,0.06)" }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#0a1f2e", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 3, height: 18, background: "#c9973a", borderRadius: 2, flexShrink: 0 }} />
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", fontWeight: 500 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
      style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#1a1a1a", backgroundColor: "#f5f0e8", border: "1px solid rgba(201,151,58,0.2)", borderRadius: 7, padding: "10px 12px", outline: "none", transition: "border-color 0.2s", width: "100%" }}
      onFocus={(e) => { e.target.style.borderColor = "#c9973a"; e.target.style.backgroundColor = "#fff"; }}
      onBlur={(e) => { e.target.style.borderColor = "rgba(201,151,58,0.2)"; e.target.style.backgroundColor = "#f5f0e8"; }}
    />
  );
}

function Btn({ children, onClick, disabled, navy, gold }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; navy?: boolean; gold?: boolean }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 8,
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer", border: "none",
        transition: "all 0.2s", letterSpacing: "0.03em", opacity: disabled ? 0.5 : 1,
        background: navy ? "#0a1f2e" : gold ? "#c9973a" : "#e5e7eb",
        color: (navy || gold) ? "#fff" : "#1a1a1a",
      }}
    >
      {children}
    </button>
  );
}

function BtnOutline({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 8,
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
        cursor: "pointer", background: "transparent", color: "#0a1f2e",
        border: "1px solid rgba(201,151,58,0.2)", transition: "all 0.2s", letterSpacing: "0.03em",
      }}
    >
      {children}
    </button>
  );
}

function StatusRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#6b7280", padding: "12px 16px", background: "#f5f0e8", borderRadius: 8, marginTop: "1rem" }}>
      {children}
    </div>
  );
}

function HotelCard({ hotel, selected, onClick }: { hotel: Hotel; selected: boolean; onClick: () => void }) {
  const stars = "★".repeat(hotel.stars || 4) + "☆".repeat(5 - (hotel.stars || 4));
  const pros = (hotel.pros || hotel.highlights || []).slice(0, 3);
  return (
    <div onClick={onClick} style={{ border: selected ? "1.5px solid #c9973a" : "1.5px solid rgba(201,151,58,0.2)", borderRadius: 10, padding: "1.25rem", cursor: "pointer", transition: "all 0.2s", position: "relative", background: selected ? "#fffbf4" : "#ffffff", boxShadow: selected ? "0 4px 20px rgba(201,151,58,0.15)" : "none" }}>
      {selected && <div style={{ position: "absolute", top: 12, right: 12, background: "#c9973a", color: "#fff", fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.05em" }}>✓ Selected</div>}
      {hotel.advisorPick && <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#0a1f2e", color: "#d4b896", fontSize: 11, padding: "3px 10px", borderRadius: 4, marginBottom: 8 }}>⭐ Advisor's Pick</div>}
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", fontWeight: 600, color: "#0a1f2e" }}>{hotel.name}</div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "6px 0 10px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "#c9973a" }}>{hotel.totalPrice}</span>
        <span style={{ color: "#c9973a", fontSize: 13 }}>{stars}</span>
        {hotel.category && <span style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", background: "#f5f0e8", padding: "2px 8px", borderRadius: 4 }}>{hotel.category}</span>}
        {hotel.refundableBy && <span style={{ fontSize: 12, color: "#6b7280" }}>Refundable by {hotel.refundableBy}</span>}
      </div>
      {hotel.vibe && <div style={{ fontStyle: "italic", color: "#6b7280", fontSize: 13, marginBottom: 10 }}>{hotel.vibe}</div>}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {pros.map((p, i) => <span key={i} style={{ fontSize: 12, background: "#f0f7f4", color: "#2d6a4f", padding: "3px 10px", borderRadius: 4 }}>{p}</span>)}
      </div>
    </div>
  );
}
