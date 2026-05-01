# Threat Model

## Project Overview

Travolo is a travel advisor application that uses a React frontend and an Express API to turn raw quote text into polished client-facing hotel comparison pages. The production stack includes Clerk for authentication, Stripe-backed subscription gating, Anthropic for quote parsing, and Replit DB plus shared Drizzle/PostgreSQL libraries for persistence and future structured data access.

## Assets

- **User accounts and sessions** -- Clerk-authenticated advisor accounts gate access to paid quote parsing features and any account-linked data.
- **Subscription entitlements** -- subscriber status determines whether a user may access the paid AI parsing workflow; unauthorized changes directly affect revenue and cost exposure.
- **Generated quote pages and client itinerary data** -- quote pages contain client names, trip dates, hotel options, pricing, and advisor contact details. Exposure or tampering can affect both privacy and brand trust.
- **Application secrets** -- `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLERK_SECRET_KEY`, `ADMIN_PASSWORD`, and database credentials all enable privileged operations if misused.
- **Admin subscriber-management capability** -- the admin surface can add or remove subscribers and therefore change who may access paid features.

## Trust Boundaries

- **Browser to API** -- all frontend input, including raw pasted quotes and advisor-entered profile data, is untrusted until validated server-side.
- **API to Clerk** -- identity and user metadata come from Clerk; the API must enforce route-level auth and not treat frontend state as authoritative.
- **API to Stripe** -- webhook events cross an external trust boundary and must be signature-verified before changing subscription state.
- **API to Anthropic** -- raw quote text leaves the application boundary and the response is untrusted model output that must not be rendered as trusted HTML without sanitization.
- **Public to authenticated/admin surfaces** -- public quote viewing and any unauthenticated endpoints must remain strictly separated from authenticated parsing and admin subscriber-management routes.
- **Production to dev-only tooling** -- `artifacts/mockup-sandbox/**` is treated as development-only and should be ignored during production scans unless routing/build evidence shows it is reachable in production.

## Scan Anchors

- **Production entry points**: `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/travel-quotes/src/main.tsx`
- **Highest-risk code areas**: `artifacts/api-server/src/routes/*.ts`, `artifacts/travel-quotes/src/App.tsx`, `artifacts/travel-quotes/src/lib/onePager.ts`
- **Public surfaces**: `/api/health`, public quote viewing under `/api/quote/:id`, landing/auth pages, any unauthenticated API routes
- **Authenticated surfaces**: `/api/parse-quotes`, `/api/subscription-status`
- **Admin surfaces**: `/admin`, `/admin/subscribers`, `/admin/add`, `/admin/remove`
- **Usually ignore**: `artifacts/mockup-sandbox/**` unless production reachability is demonstrated

## Threat Categories

### Spoofing

The application relies on Clerk to identify advisors and on a separate admin password to protect subscriber-management routes. All authenticated and admin-only routes MUST verify identity server-side on every request, and no production route may provide alternate unauthenticated paths that let attackers impersonate a subscriber or privileged operator.

### Tampering

Attackers can supply raw quote text, trip details, advisor profile content, and any other browser-submitted payloads. The system MUST treat both direct user input and LLM output as untrusted data, and MUST prevent that data from being turned into executable HTML or from modifying subscriber records without authenticated authorization.

### Information Disclosure

Generated quote pages may contain client names, pricing, travel dates, and advisor contact data, while API secrets and Clerk-derived account data remain highly sensitive. Public endpoints and rendered pages MUST not expose other users' data, secrets, verbose internal errors, or trusted-origin content that allows same-origin script execution against authenticated users.

### Denial of Service

The parse endpoint invokes Anthropic and can generate direct cost and latency pressure, while public write endpoints could be abused to consume memory or operational capacity. Public and authenticated routes that trigger expensive or stateful behavior SHOULD enforce appropriate limits, and the app MUST not expose easy unauthenticated paths for sustained resource abuse in production.

### Elevation of Privilege

This project has a strong public/authenticated/admin separation and a separate paid-feature boundary. The application MUST ensure that only legitimately subscribed authenticated users can access paid parsing, that admin capabilities cannot be reached through shared secrets in weak channels or public helper routes, and that no same-origin HTML/JS execution path can escalate a lower-privilege user into a higher-privilege session context.
