# NK Suits Botique + Suit Style Store — Project Outline

A shared-backend, two-brand boutique management app: order intake and
dispatch tracking for NK Suits Botique, and customer/order/inventory
management for Suit Style Store. One login, one database, two storefronts.


## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite | Fast dev server, simple build, no framework overhead for a CRUD-heavy admin tool |
| Routing | React Router v6 | Client-side routing between brand sections |
| Styling | Plain CSS + design tokens (no Tailwind/UI kit) | Full control over the custom Luxury/Editorial visual system |
| Backend | FastAPI (Python) | Async-friendly, auto-generated API docs, clean typing via Pydantic |
| Database | MongoDB (Atlas) | Schema-flexible documents fit two structurally different businesses in one DB without rigid joins |
| Auth | Single-account JWT (bcrypt-hashed password) | No multi-user complexity needed — one brand owner logs into both storefronts |
| Frontend hosting | Vercel | Free tier, auto-deploys on push, ideal for a static Vite build |
| Backend hosting | Render | Persistent Python process (FastAPI/Uvicorn needs a long-lived server, unlike Vercel's serverless model) |
| Version control | Git + GitHub | Source of truth; both Vercel and Render auto-deploy from pushes |


## 2. Architecture

```
                 ┌───────────────┐
                 │   MongoDB      │
                 │   (Atlas)      │
                 └───────▲────────┘
                         │
                 ┌───────┴────────┐
                 │  FastAPI        │   <- Render
                 │  backend        │
                 │                 │
                 │  routes/        │  (HTTP layer only)
                 │  processing_    │  (business logic:
                 │   agent/         │   validation, sorting,
                 │                 │   calculations)
                 └───────▲────────┘
                         │  REST API (JSON, JWT auth)
                 ┌───────┴────────┐
                 │  React frontend │   <- Vercel
                 │                 │
                 │  pages/nksuits  │
                 │  pages/suitstyle│
                 │  components/    │  (shared UI: Button,
                 │                 │   Input, Card,
                 │                 │   CalendarPopup, etc.)
                 └───────▲────────┘
                         │
                    Browser / Phone
```

**Guiding rule the whole codebase follows:** the frontend never touches
the database directly, and the backend's `routes/` layer never contains
business logic — it just translates HTTP requests into calls against
`processing_agent/`, which is plain Python with no knowledge it's
running behind an API. This means the UI can be redesigned without
touching backend code, and business rules can change without touching
routes.



## 3. Data Model (MongoDB collections)

| Collection | Purpose |
|---|---|
| `nksuits_orders` | Every NK Suits order — name, contact, prices, status, dispatch/delivery dates, status history |
| `suitstyle_customers` | Suit Style customer records, keyed by unique `Contact` |
| `suitstyle_orders` | Orders referencing a customer by `Contact` (not embedded — keeps customer updates cheap) |
| `suitstyle_vendors` | Vendor names for stock sourcing |
| `suitstyle_stock` | Stock cost entries logged per vendor |
| `auth` | Single document: the one brand-owner login (bcrypt hash) |


## 4. Core Workflows

### NK Suits — order lifecycle
```
Create Order → Created → Processing → Dispatched → Delivered
                                ↑            ↑           ↑
                          (manual)     (date picker   (date picker
                                        auto-sets       auto-sets
                                        status)         status)
```
- Order numbers are computed from the highest existing number + 1 (never a
  stale persisted counter) — deleting every order resets numbering to 1,
  deleting a middle order never causes a collision.
- Discount % is always calculated server-side from Actual price vs. sale
  price — never trusted from the client.
- Dispatch/Delivery dates can only be set via the calendar popup, and
  setting either one always updates Status together with it, from either
  the order list, the order detail page, or the status dropdown itself.
- The order list is two-tier sorted: active orders first (newest
  created), delivered orders after (most recently delivered first).

### Suit Style — customer + order + inventory
```
Add Customer → view/search customer list → open a customer
  → add orders against them (auto-numbered per customer)
  → separately: log vendors and stock cost entries
  → dashboard rolls all of it up into weekly/monthly/yearly stats
```

### Auth
```
create_admin.py (run once, locally) → writes bcrypt hash to `auth`
      ↓
Login screen → POST /api/auth/login → JWT issued
      ↓
JWT stored client-side → sent as Bearer token on every API call
      ↓
FastAPI dependency (require_auth) rejects any request without a valid token
```

## 5. Deployment Pipeline

```
git push → GitHub
             │
      ┌──────┴───────┐
      ▼               ▼
   Vercel          Render
   (frontend)      (backend)
   auto-builds     auto-builds
   & deploys       & deploys
      │               │
      └──────┬────────┘
             ▼
     Live app, reachable
     from any browser —
     desktop or phone
```

- Frontend build reads `VITE_API_BASE_URL` at build time to know where
  the API lives.
- Backend's `CORS_ORIGINS` env var whitelists exactly which frontend
  URL(s) are allowed to call it.
- Both platforms redeploy automatically on every push to the connected
  branch — no manual deploy step in normal day-to-day use.

## 6. Design System (frontend)

"Luxury / Editorial" visual language, fully custom (no component
library): warm alabaster/charcoal/gold palette, Playfair Display +
Inter typography, 0px border radii, underline-only inputs, slow
gold-slide button hover, thin architectural grid lines, and a fully
responsive layout that collapses to a single column on phone widths.
All tokens (colors, spacing, motion) are centralized in one CSS file
so the whole visual identity can be adjusted from a single place.


