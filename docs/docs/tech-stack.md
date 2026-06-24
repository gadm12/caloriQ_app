# Tech Stack

CaloriQ is built with a modern full-stack JavaScript toolchain.

---

## Frontend

| Technology | Purpose |
|---|---|
| React (Vite) | SPA framework and build tool |
| React Router DOM | Client-side routing |
| TailwindCSS | Utility-first styling |
| Axios | HTTP client for all API calls |
| Stripe.js / React Stripe | Payment UI and card confirmation |

---

## Backend & Database

| Technology | Purpose |
|---|---|
| Supabase | PostgreSQL database, Auth, and REST API |
| Supabase Edge Functions | Serverless functions (Deno runtime) |
| Supabase Auth | User registration and login |

---

## External APIs

| API | Purpose |
|---|---|
| Open Food Facts | Free food nutrition database — no key required |
| Stripe | One-time donation payment processing |

---

## DevOps

| Tool | Purpose |
|---|---|
| Vercel | Frontend deployment with automatic CI/CD |
| GitHub | Version control with feature branch workflow |
| WSL2 (Ubuntu) | Local development environment |

---

## Architecture Overview

```
User Browser
    │
    ▼
React SPA (Vercel)
    │
    ├── Open Food Facts API (food search)
    │
    ├── Supabase REST API (CRUD: meal logs, food entries, profiles)
    │
    ├── Supabase Auth (registration, login, session)
    │
    └── Supabase Edge Functions
            ├── process-donation (creates Stripe PaymentIntent)
            └── stripe-webhook (records payment results)
                    │
                    └── Stripe API
```
