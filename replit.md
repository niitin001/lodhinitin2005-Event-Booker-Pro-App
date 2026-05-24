# EventShooter

Premium event photography booking platform — hire photographers, videographers, drone operators, and editors for weddings, birthdays, corporate events, fashion shoots, and reels.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/event-shooter run dev` — run the frontend (port 24560, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed DB with sample photographers, packages, coupons
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing key

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, wouter, framer-motion, recharts, Tailwind CSS, shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI 3.1 spec (source of truth for all endpoints)
- `lib/api-client-react/` — Orval-generated React Query hooks
- `lib/api-zod/` — Orval-generated Zod schemas
- `lib/db/src/schema/` — Drizzle schema files (users, photographers, bookings, payments, reviews, chat, coupons, notifications, portfolio, deliverables, wishlist)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, users, photographers, bookings, payments, reviews, chat, coupons, admin, ai)
- `artifacts/event-shooter/src/pages/` — React pages (Home, Explore, PhotographerProfile, Login, Register, BookingFlow, CustomerDashboard, PhotographerDashboard, AdminDashboard, AIHub, etc.)
- `artifacts/event-shooter/src/contexts/AuthContext.tsx` — JWT-based auth state
- `artifacts/event-shooter/src/components/ThemeProvider.tsx` — dark/light mode

## Architecture decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → Zod schemas for server validation + React Query hooks for client
- **Simple JWT auth**: HMAC-SHA256 tokens (no external lib), 30-day expiry, stored in localStorage
- **Role-based access**: customer / photographer / admin roles enforced at route and UI level
- **Payment stub**: Razorpay integration returns a mock order ID; real Razorpay keys can be wired in without changing the API contract
- **AI stubs**: Cost estimator, package recommender, and caption generator are rule-based stubs ready to be replaced with real LLM calls

## Product

EventShooter is a two-sided marketplace where customers book professional photographers/videographers for events, and photographers manage their portfolio, availability, and earnings. Key flows:

1. **Discovery** — landing page hero search → explore page with filters → photographer profile with portfolio/packages/reviews
2. **Booking wizard** — 4-step: event details → package + addons → coupon + payment → confirmation
3. **Customer dashboard** — booking history, payment status, deliverables gallery, chat
4. **Photographer dashboard** — accept/reject bookings, upload deliverables, earnings chart, portfolio management
5. **Admin panel** — approve photographers, moderate reviews, manage coupons, revenue analytics
6. **AI hub** — cost estimator, package recommender, Instagram caption generator

## Seeded accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eventshooter.in | admin123 |
| Customer | priya@example.com | password123 |
| Photographer (x6) | arjun/sneha/vikram/meera/rohan/ananya@eventshooter.in | photo123 |

## User preferences

- No emojis anywhere in the UI
- Premium cinematic feel — Playfair Display serif headings, Plus Jakarta Sans body
- Dark mode supported via `.dark` class on `<html>`

## Gotchas

- Codegen naming rule: never use operations with BOTH path params AND query params sharing the same `Params` name — Orval generates two types with identical names and the barrel export collides. Solution: move the query param to the handler only (not in the spec).
- `@import url(...)` for Google Fonts MUST be the very first line in `index.css`, before `@import "tailwindcss"`.
- API server uses `req.log` (pino) not `console.log`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
