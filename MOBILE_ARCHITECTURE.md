MOBILE_ARCHITECTURE.md

Electrical Distribution CRM — Mobile Application Architecture

Version: 1.0
Status: Technical Foundation Specification (pre-implementation)
Related Documents: MOBILE_PRD.md, PROJECT_SETUP.md, technical/ARCHITECTURE.md, technical/API.md, technical/DATABASE.md

⸻

1. Purpose

This document defines the technical architecture for the mobile application described in MOBILE_PRD.md.

It is grounded in the backend as it exists today in this repository, not a green-field assumption — every claim below about what already works, and what doesn't, was verified against the actual code (`apps/api`) rather than inferred from the product spec alone.

Follow CLAUDE.md's Understand → Inspect → Plan → Implement → Verify → Report → Stop process once implementation starts. This document is the "Plan" input for that process, not a substitute for inspecting the code again at build time — the codebase will have moved on by then.

⸻

2. Guiding Principle

No mobile-specific business logic on the server (docs/sds/volume-7-engineering/09_Mobile_App_Requirements.md; CLAUDE.md sections 13-17, API-First Principle).

The mobile app is a REST client of the exact same `/api/v1` surface the web app already uses. It does not get its own endpoints, its own validation rules, or its own copy of a business rule. Where the mobile UX needs something the API doesn't yet return efficiently (e.g. a combined "today" view), the fix is a new read endpoint the web app could also use — not a mobile-only shortcut.

⸻

3. Current Backend Readiness

3.1 Already mobile-ready, no change needed

* **Access-token issuance and validation.** `POST /auth/login` returns the JWT access token in the JSON response body (not cookie-only), and every protected route's `JwtAuthGuard` extracts it from a plain `Authorization: Bearer <token>` header. This is exactly what a mobile HTTP client needs, and it's already how the web SPA's Axios client works today too.
* **RBAC.** Field Sales Executive and Telecaller roles are seeded (`apps/api/prisma/seed.ts`) with a real permission grant (`SALES_TEAM_PERMISSIONS`): `lead.read/create/update/convert`, `contact.read/create/update`, `company.read/create/update`, `follow_up.read/create/update/complete`, `quotation.read/create/update/send`, `sales_order.read/update`, `communication.read/send`, `file.upload/read`, `address.read/manage`, `invoice.read`, `payment.read`. This maps directly onto MOBILE_PRD.md's V1 module list — no new permission codes are needed for the screens currently scoped.
* **Sessions.** The `sessions` table already tracks `userAgent`/`ipAddress` per session and supports unlimited concurrent sessions per user (a phone and a laptop logged in simultaneously is already the normal case, not a special one). `POST /auth/logout-all` already exists for "sign me out everywhere."
* **CORS.** Native mobile HTTP requests aren't subject to browser CORS enforcement at all, so the existing single-origin `enableCors({ origin: WEB_ORIGIN })` for the web app needs no change and doesn't affect mobile either way.

3.2 Needs a small, additive change

* **Refresh token delivery.** Today, `POST /auth/login` sets the refresh token as an httpOnly cookie (`crm_refresh_token`, scoped to `/api/v1/auth`) and never returns it in the body. `POST /auth/refresh` reads *only* that cookie — there is no fallback. A mobile client can't use a browser cookie jar the same way.
  Concrete change (web behavior must not regress):
  1. `packages/types` — add an optional `refreshToken` field to the login/refresh response types.
  2. `auth.controller.ts` `login()` — when the request signals a non-cookie client (e.g. `X-Client-Type: mobile` header), also return the raw refresh token in the body instead of only setting the cookie.
  3. `auth.controller.ts` `refresh()` — accept the token from a request body field as a fallback when no cookie is present, before throwing `UnauthorizedException`.
  4. Mobile stores the refresh token in **Expo SecureStore**, not `localStorage`-equivalent, and resends it explicitly on refresh.
  This is the only auth change required. Everything else in the login/refresh/session flow is already client-agnostic.

3.3 Does not exist yet — real new work

* **Push notification delivery.** `NotificationsService` and `NotificationTriggersListener` are fully built (`apps/api/src/modules/notifications/`) and already fire on 5 domain events — `lead.assigned`, `quotation.approval_required`, `purchase_order.approval_required`, `payment.received`, `inventory.low_stock` — but delivery today is strictly an **in-app row** in the `notifications` table (ARCHITECTURE.md section 77: "Domain Event → Notification Service → In-App Notification"). There is no device-token storage and no push provider integration (APNs/FCM/Expo Push). See section 9.
* **A "visit" / check-in data model.** There is currently no `Visit` (or equivalent) entity anywhere in the schema. The closest existing concept is `FollowUp`, which has a type, a scheduled time, and a completion state — but no GPS check-in/check-out timestamps, no visit outcome enum, and no photo/voice-note attachment path distinct from the generic Files module. MOBILE_PRD.md section 7.4's Site Visits module needs a product decision (open question in MOBILE_PRD.md section 14) before this can be scoped as a schema change. See section 6.
* **Quotation-decision and order-status notifications.** MOBILE_PRD.md section 9 lists "quotation approved/rejected" and "order status change" as push triggers. Neither exists as a domain event today — `quotation.approval_required` notifies the *approver*, not the *submitter* of the outcome. Two new events (and listener cases) are needed: something like `quotation.decided` and `sales_order.status_changed`, following the exact pattern the other five events already use.

⸻

4. Technology Stack

Per docs/sds/volume-7-engineering/09_Mobile_App_Requirements.md, unchanged here — this was already a deliberate, specific choice, not left open:

* Framework: React Native, Expo (managed workflow)
* Language: TypeScript
* Navigation: Expo Router
* Server state: TanStack Query — same library the web app already uses, so caching/invalidation patterns transfer directly
* Forms: React Hook Form + Zod — same validation library as web; where practical, share the Zod schema shape with `packages/types` rather than redefining it
* HTTP: Axios
* Secure storage: Expo SecureStore (refresh token, never the equivalent of `localStorage`)
* Device APIs: Expo Camera, Expo Image Picker, Expo Location, Expo Notifications

Do not introduce a second state-management library, a second HTTP client, or a second validation library "because mobile is different." It isn't, for these concerns.

⸻

5. Authentication & Session Architecture

Flow (post-adjustment, section 3.2):

1. `POST /auth/login` with `X-Client-Type: mobile` → response body contains `{ accessToken, accessTokenExpiresAt, refreshToken, user }`.
2. Access token held in memory (React state/context), attached as `Authorization: Bearer` on every request — identical pattern to `apps/web/src/lib/auth/token-store.ts`.
3. Refresh token written to Expo SecureStore immediately.
4. On 401 (access token expired), call `POST /auth/refresh` with the stored refresh token in the body → new access + refresh token pair (rotation), matching the existing reuse-detection behavior already implemented in `SessionService`.
5. Logout calls `POST /auth/logout` (revokes that session) and clears SecureStore. "Log out everywhere" uses the existing `POST /auth/logout-all`.
6. Forgot/Reset Password reuse `POST /auth/forgot-password` and `POST /auth/reset-password` exactly as built for web (MOBILE_PRD.md section 7.1) — no changes needed.

No new backend authentication mechanism, no API keys, no separate mobile auth service. Same JWT, same session table, same reuse-detection.

⸻

6. Data Model Gap: Site Visits

This needs a decision before Site Visits (MOBILE_PRD.md 7.4) can be built, not during. Two real options:

**Option A — Extend FollowUp.** Add `checkInAt`, `checkInLatitude`/`checkInLongitude`, `checkOutAt`, and an `outcome` enum to the existing `follow_ups` table. Cheapest change; keeps one activity-history concept instead of two. Risk: a FollowUp was designed as "a planned future action," not "a record of an in-person event" — overloading it may make the web Follow-ups UI harder to reason about (DATABASE.md's own distinction between Activity and Audit, section 102, is the same kind of category mixing to be careful of here).

**Option B — New `Visit` entity.** A distinct table (`visits`), linked to Lead/Contact/Company like Addresses/Files already are (nullable FKs + a CHECK constraint per DATABASE.md section 36's precedent), with its own status/outcome and optional link to the FollowUp it originated from or produced. Cleaner domain model, more migration/API/UI surface to build (a new module, following the exact pattern Addresses or Files established: shared types → backend module → tests → frontend, applied to mobile instead of web).

Recommendation: Option B, for the same reason Addresses got its own table instead of being bolted onto Company — a visit has its own lifecycle and its own fields that don't belong on every FollowUp. This should be confirmed as part of resolving MOBILE_PRD.md section 14's open question, not assumed silently when implementation starts.

⸻

7. API Surface Reuse

Every mobile screen maps onto existing, already-built REST routes. No new business endpoints are required for MOBILE_PRD.md's V1 scope, aside from the Site Visits data model in section 6 and the two notification events in section 3.3.

| Mobile module | Existing endpoints |
| --- | --- |
| Dashboard | `GET /reports/dashboard` (already role-aware; reuse as-is) |
| Leads | `GET/POST /leads`, `GET/PATCH /leads/:id`, `POST /leads/:id/assign`, `POST /leads/:id/status`, `POST /leads/:id/convert`, `GET/POST /leads/:id/activities` |
| Follow-ups | `GET/POST /follow-ups`, `GET/PATCH /follow-ups/:id`, `POST /follow-ups/:id/complete`, `POST /follow-ups/:id/cancel`, `GET /me/follow-ups` |
| Customers & Dealers | `GET /companies`, `GET /companies/:id`, `GET /contacts`, `GET /contacts/:id` |
| Sales — catalogue/pricing/stock | `GET /products`, `GET /inventory` |
| Sales — quotations | `GET/POST /quotations`, `GET/PATCH /quotations/:id`, `POST /quotations/:id/submit`, `.../send`, `.../accept`, `.../reject`, `.../cancel`, `.../convert-to-order` |
| Sales — orders | `GET /sales-orders`, `GET /sales-orders/:id` |
| Billing (read-only) | `GET /invoices`, `GET /invoices/:id`, `GET /payments`, `GET /payments/:id` |
| Notifications | `GET /notifications`, `GET /notifications/unread-count`, `POST /notifications/:id/read`, `POST /notifications/read-all` |
| Files (visit photos, quotation attachments) | `POST /files`, `GET /files`, `GET /files/:fileId/download`, `DELETE /files/:fileId` |
| Communication (share a quotation) | `POST /communications` (existing WhatsApp/Email/SMS abstraction — no new channel) |
| Addresses | `GET /addresses`, `POST/PATCH/DELETE /addresses` |
| Profile | `GET /auth/me`, `POST /auth/change-password` |

⸻

8. Client Architecture

* **Navigation:** Expo Router, file-based, mirroring MOBILE_PRD.md section 7's screen list — bottom tabs for Dashboard/Leads/Visits/Orders/Profile, stack navigation for detail screens.
* **Server state:** TanStack Query, one query-key namespace per resource (`leads`, `follow-ups`, `quotations`, ...), same convention `apps/web/src/features/*/use*.ts` already establishes — mutation hooks invalidate their own resource's queries on success.
* **Forms:** React Hook Form + Zod resolvers, mirroring `apps/web/src/features/*/schemas/*.schema.ts`. Where a shape genuinely matches an existing web schema, prefer importing the Zod schema from a shared location over re-declaring it, but do not force a shared UI-form abstraction between web and mobile (CLAUDE.md section 23: `packages/ui` is for web, native uses platform-appropriate UI).
* **Caching:** TanStack Query's own cache is the only "offline" behavior in V1 — recently-fetched read data stays visible if connectivity drops momentarily. No persisted local database, no write queue. Building either is explicitly V2 (MOBILE_PRD.md section 10).
* **Error handling:** reuse the same `{ error: { code, message, fields?, requestId } }` envelope contract the web app's `ApiError` already normalizes (`apps/web/src/lib/api/api-error.ts`) — the mobile Axios client should implement the equivalent, not invent a new error shape.

⸻

9. Push Notifications Architecture

New backend work, additive to the existing in-app notification system — does not replace it:

1. **Device token storage.** A new table (e.g. `push_tokens`: `userId`, `expoPushToken`, `platform`, `createdAt`, revoked on logout of that session) or a `pushToken` column on `sessions` if one-token-per-session is sufficient. Registered via a new endpoint, e.g. `POST /notifications/push-token`, called once on mobile login/app-open.
2. **Delivery.** `NotificationTriggersListener` (or a new listener alongside it, per ARCHITECTURE.md section 79's "don't turn every function call into an event" — this already *is* an event, so it's a new listener, not new coupling) sends an Expo push request in addition to creating the in-app `Notification` row, for any user with a registered token.
3. **New events needed** (section 3.3): `quotation.decided` (emitted from `QuotationsService` on approve/reject-approval, notifying the submitter — mirrors the existing `quotation.approval_required` pattern exactly) and `sales_order.status_changed` (emitted from `SalesOrdersService` on confirm/cancel/complete).
4. Failure handling follows the same principle as the SendGrid/Twilio providers already built (CLAUDE.md section 31): a push failure logs a warning and never blocks the underlying business operation (approving a quotation must succeed even if the push provider is down).

⸻

10. File & Photo Uploads

Reuse the existing Files module exactly as built for web — `POST /files` (multipart), entity-scoped via `relatedEntityType`/`relatedEntityId`, size/MIME validation already server-enforced. Visit photos and voice notes attach the same way Lead/Company/Quotation attachments already do; no new upload path.

Client-side: compress images before upload (Expo Image Picker's built-in compression is sufficient for V1 — do not build a custom compression pipeline).

⸻

11. Security

* HTTPS only, in every environment including local device testing against a tunneled dev API.
* Refresh token in Expo SecureStore only. Access token in memory only — never persisted to disk on the device.
* Session revocation already works end-to-end (logout, logout-all, and the existing reuse-detection that revokes a whole session family if a used-and-rotated refresh token is replayed) — mobile inherits this for free once section 3.2's change lands.
* An app-level lock (biometric/PIN before the app is usable, independent of the API session) is a reasonable V2 addition given the app will hold customer financial data (outstanding balances) — not required for V1 functionality, but worth deciding on deliberately rather than defaulting to "no lock."

⸻

12. Environments & Build

Follow the same environment discipline as the rest of the platform (CLAUDE.md section 51): API base URL per environment (dev/staging/production) via Expo's `app.config.ts` + EAS build profiles, never hardcoded. No real secrets in the mobile bundle — the mobile app authenticates as a user, not as a service, so it needs no API keys beyond what the user's own login already grants.

⸻

13. Testing Strategy

Matches docs/sds/volume-7-engineering/09_Mobile_App_Requirements.md, applied with the same rigor CLAUDE.md section 43 already expects of the backend:

* Unit tests for business-adjacent logic that lives client-side (form validation, derived display state)
* Component tests for key screens
* API integration tests against the real backend for the auth adjustment in section 3.2 (extend `apps/api/test/auth.e2e-live-spec.ts` rather than creating a parallel mobile-only auth test file)
* Device testing on both Android and iOS before any release

⸻

14. Phased Build Plan

Following the same "one step, verify, report, stop" rhythm used throughout this repository's build so far, in dependency order:

1. Backend: refresh-token adjustment (section 3.2) + its own test coverage — ships independently, has zero mobile-app dependency, and unblocks everything else.
2. Decide the Site Visits data model (section 6) and, if Option B, build it as an ordinary backend module (shared types → service → controller → tests) before any mobile UI touches it.
3. Mobile app skeleton: Expo project, navigation shell, auth screens, talking to the real API.
4. Dashboard + Leads (highest-value, lowest-risk — pure reuse of existing endpoints).
5. Site Visits (once step 2 has landed).
6. Sales: catalogue, quotations, orders.
7. Billing (read-only) + Customers/Dealers.
8. Notifications: backend push infrastructure (section 9) + mobile registration/handling, wired last since every other screen can ship and be useful without it.
9. Polish, device testing, release-candidate build.

Do not start step 3 before step 1 is merged — building against cookie-based refresh now only to rework it later is avoidable rework.

⸻

15. Open Architecture Decisions

Carried forward from MOBILE_PRD.md section 14, technical framing:

* Site Visits: Option A vs Option B (section 6) — blocks steps 2 and 5 of the build plan.
* Push provider: Expo Push Notification service (simplest, works for both platforms through one API) vs. going directly to APNs/FCM. Recommendation is Expo Push unless a concrete reason emerges not to — it fits the "don't introduce infrastructure simply because it may be useful someday" principle (PROJECT_SETUP.md section 3.1).
* One push token per user vs. per session/device — affects whether a user logged in on two phones gets notified on both. Recommend per-session, consistent with how the sessions table already models "one row per device."

⸻
