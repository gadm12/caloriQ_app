import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const SECTIONS = [
  {
    id: 'overview',
    title: 'Overview',
    content: `# CaloriQ

**CaloriQ** is a free, full-stack single-page application for tracking daily nutrition and calories — built as a course project at Code Platoon.

---

## What is CaloriQ?

CaloriQ tackles one of the most common barriers to healthy eating: the lack of a simple, free tool to track daily nutrition. Most calorie tracking apps hide essential features — macro breakdowns, meal history, and goal tracking — behind expensive subscriptions.

CaloriQ provides a focused nutrition tracking experience where users can:

- Search for foods using the Open Food Facts API
- Log meals across Breakfast, Lunch, Dinner, and Snacks
- Track calories and macronutrients (protein, carbs, fat)
- Set and monitor daily calorie goals
- Visualize weekly nutrition trends
- Support the project via a one-time Stripe donation

---

## Why CaloriQ?

The fitness app market is dominated by subscription-gated products. Free tiers on apps like MyFitnessPal are intentionally limited. CaloriQ's core belief is that basic, personal nutrition data shouldn't cost a monthly fee to access.

---

## Live App

> [caloriQ.vercel.app](https://caloriq-psi.vercel.app/)

## Repository

> [github.com/gadm12/caloriQ_app](https://github.com/gadm12/caloriQ_app)`,
  },
  {
    id: 'tech-stack',
    title: 'Tech Stack',
    content: `# Tech Stack

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

\`\`\`
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
\`\`\``,
  },
  {
    id: 'database',
    title: 'Database',
    content: `# Database

CaloriQ uses a PostgreSQL database hosted on Supabase with three core tables.

---

## Schema

### \`profiles\`

Extends Supabase Auth users with app-specific data. Created automatically via a database trigger on signup.

\`\`\`sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    calorie_goal INTEGER DEFAULT 2000,
    created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

---

### \`meal_logs\`

Represents a single day's log for a user. Each user gets one log per date.

\`\`\`sql
CREATE TABLE meal_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

---

### \`food_entries\`

Individual food items logged within a meal log, organized by meal category.

\`\`\`sql
CREATE TABLE food_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID NOT NULL REFERENCES meal_logs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    food_name TEXT NOT NULL,
    calories NUMERIC(7,2) NOT NULL,
    protein NUMERIC(5,2) DEFAULT 0,
    carbs NUMERIC(5,2) DEFAULT 0,
    fat NUMERIC(5,2) DEFAULT 0,
    serving_size NUMERIC(6,2) DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

---

### \`donations\`

Records Stripe payment results written by the webhook Edge Function.

\`\`\`sql
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users,
    amount INTEGER,
    stripe_payment_intent_id TEXT UNIQUE,
    status TEXT CHECK (status IN ('succeeded', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

---

## Table Relationships

\`\`\`
auth.users (Supabase managed)
    │
    └── profiles (1-to-1)
            │
            └── meal_logs (1-to-many)
                    │
                    └── food_entries (1-to-many)
\`\`\`

---

## Auth Trigger

When a new user registers, a PostgreSQL trigger automatically creates their \`profiles\` row:

\`\`\`sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
\`\`\``,
  },
  {
    id: 'api',
    title: 'API Integration',
    content: `# API Integration

CaloriQ uses the **Open Food Facts API** for food search and nutrition data. It is completely free, requires no API key, and no account registration.

---

## Open Food Facts

### Search by Name

\`\`\`
GET https://world.openfoodfacts.org/cgi/search.pl
\`\`\`

**Parameters:**

| Parameter | Value | Description |
|---|---|---|
| \`search_terms\` | string | Food name to search |
| \`json\` | \`true\` | Return JSON response |
| \`page_size\` | \`10\` | Number of results |
| \`lc\` | \`en\` | Filter to English products |
| \`cc\` | \`us\` | Filter to US products |
| \`fields\` | see below | Limit returned fields |

**Example Request:**
\`\`\`
https://world.openfoodfacts.org/cgi/search.pl?search_terms=chicken&json=true&page_size=10&lc=en&cc=us
\`\`\`

---

## Data Extraction

CaloriQ extracts only the fields it needs from the response:

\`\`\`js
const nutrition = {
  name: product.product_name,
  calories: product.nutriments["energy-kcal_100g"] ?? 0,
  protein: product.nutriments["proteins_100g"] ?? 0,
  carbs: product.nutriments["carbohydrates_100g"] ?? 0,
  fat: product.nutriments["fat_100g"] ?? 0,
};
\`\`\`

All values are per 100g and scaled based on the user's serving size input.

---

## Service Layer

All Open Food Facts calls are handled through a dedicated service file. Components never call Axios directly.

\`\`\`js
// src/services/openFoodFacts.js
import axios from 'axios';

export const searchFoods = async (query) => {
  const response = await axios.get(
    'https://world.openfoodfacts.org/cgi/search.pl',
    {
      params: {
        search_terms: query,
        json: true,
        page_size: 10,
        lc: 'en',
        cc: 'us',
      }
    }
  );

  return response.data.products
    .filter(p => p.product_name && p.nutriments?.["energy-kcal_100g"])
    .map(p => ({
      name: p.product_name,
      calories: p.nutriments["energy-kcal_100g"] ?? 0,
      protein: p.nutriments["proteins_100g"] ?? 0,
      carbs: p.nutriments["carbohydrates_100g"] ?? 0,
      fat: p.nutriments["fat_100g"] ?? 0,
    }));
};
\`\`\`

---

## Rate Limiting

Open Food Facts is a free community API. To avoid rate limiting (503 errors):

- Search only triggers on button click or Enter key — never on keystroke
- No debounce or automatic search on input change
- Playwright MCP tests use mock data instead of live API calls`,
  },
  {
    id: 'features',
    title: 'Features',
    content: `# Features

CaloriQ is organized into six main pages, each accessible from the top navigation bar.

---

## Dashboard

The landing page after login. Displays a personalized overview of the user's daily nutrition:

- Greeting with the user's name
- Daily calorie progress bar (consumed vs. goal)
- Macro breakdown — protein, carbs, and fat
- Today's meals organized by category with quick-add buttons

---

## Daily Log

A full view of all food entries for the current day, organized by meal category:

- **Breakfast**
- **Lunch**
- **Dinner**
- **Snacks**

Each entry displays food name, serving size, calories, protein, carbs, and fat. Users can edit or delete any entry inline. A running daily total is shown at the bottom. Users can navigate to previous days to review past logs.

---

## Add Food

The food search page powered by the Open Food Facts API:

1. User types a food name and clicks **Search**
2. Results display food name and calorie info
3. User selects a result and adjusts serving size
4. User assigns the entry to a meal category
5. Entry is saved to the daily log in Supabase

---

## Progress

A weekly nutrition summary showing the past 7 days:

- Bar or line chart of daily calorie intake vs. goal
- Average daily calories for the week
- Average macro breakdown for the week

---

## Goal Settings

Users can set and update their personal nutrition targets:

- Daily calorie goal
- Optional macro targets (protein, carbs, fat in grams)

Changes are saved to the \`profiles\` table and reflected immediately on the dashboard.

---

## Donate

A one-time donation page powered by Stripe:

- Preset donation amounts: $5, $10, $25, $50
- Custom amount input
- Stripe Elements card input
- Success and failure states with user-friendly messages

---

## CRUD Summary

| Resource | Create | Read | Update | Delete |
|---|---|---|---|---|
| Food Entries | ✅ | ✅ | ✅ | ✅ |
| Meal Logs | ✅ | ✅ | — | ✅ |
| Profile / Goals | — | ✅ | ✅ | — |
| Donations | ✅ (webhook) | ✅ | — | — |`,
  },
  {
    id: 'authentication',
    title: 'Authentication',
    content: `# Authentication

CaloriQ uses **Supabase Auth** for user registration, login, and session management.

---

## Registration

New users fill out a single unified form that handles both registration and login. During registration the user provides:

- Full name
- Email address
- Email confirmation
- Password
- Password confirmation

On successful registration the user is automatically logged in and redirected to the Dashboard.

---

## Login

Returning users toggle to the login form and provide their email and password. On success they are redirected to the Dashboard.

---

## Session Persistence

On page refresh, authenticated users remain logged in and are routed back to their last visited page. This is handled by Supabase's built-in session management using localStorage.

---

## Logout

Authenticated users can sign out from the navigation bar. They are returned to the login/registration page and their session is cleared.

---

## Protected Routes

All pages except the auth page are protected. Unauthenticated users attempting to visit any route are redirected to the login page.

---

## Profile Auto-Creation

When a new user registers, a PostgreSQL database trigger (\`on_auth_user_created\`) automatically inserts a row into the \`profiles\` table using the user's \`auth.uid()\` and the name provided during registration. This ensures every authenticated user has a corresponding profile without any manual insert from the frontend.

---

## Data Isolation

All Supabase queries are scoped to the authenticated user's \`user_id\`. No user can access another user's meal logs, food entries, or profile data.`,
  },
  {
    id: 'stripe',
    title: 'Stripe Donations',
    content: `# Stripe Donations

CaloriQ includes a one-time donation feature powered by Stripe. The implementation uses two Supabase Edge Functions to keep all secret keys off the frontend.

---

## Flow Overview

\`\`\`
User selects amount → clicks Donate
        │
        ▼
Axios POST → process-donation (Edge Function)
        │     creates Stripe PaymentIntent
        │     returns { client_secret }
        ▼
stripe.confirmCardPayment() (Stripe.js)
        │     confirms payment directly with Stripe
        ▼
Stripe fires webhook → stripe-webhook (Edge Function)
        │     verifies signature
        │     inserts row into donations table
        ▼
User sees success or failure message
\`\`\`

---

## Edge Functions

### \`process-donation\`

Accepts a POST request from the frontend and creates a Stripe PaymentIntent.

**Request body:**
\`\`\`json
{
  "amount": 1000,
  "user_id": "uuid"
}
\`\`\`

**Response:**
\`\`\`json
{
  "client_secret": "pi_xxx_secret_xxx"
}
\`\`\`

- Amount is validated to be a positive integer between 1 and 1,000,000 cents ($0.01–$10,000)
- \`STRIPE_SECRET_KEY\` is read from Supabase secrets vault — never hardcoded or exposed to the frontend

---

### \`stripe-webhook\`

Listens for POST requests from Stripe and records payment results in the \`donations\` table.

- Deployed with \`--no-verify-jwt\` flag so Stripe's requests are not blocked by Supabase Auth
- Verifies every request using the \`STRIPE_WEBHOOK_SECRET\` signing secret
- Handles \`payment_intent.succeeded\` and \`payment_intent.payment_failed\` events
- Implements idempotency — checks for existing \`stripe_payment_intent_id\` before inserting to prevent duplicate records
- Returns \`200\` for all handled events, \`400\` for signature verification failures

**Webhook URL:**
\`\`\`
https://inkfsrdjdmhbfxqjyvtm.supabase.co/functions/v1/stripe-webhook
\`\`\`

---

## Security

- \`STRIPE_SECRET_KEY\` lives exclusively in Supabase secrets vault
- \`STRIPE_WEBHOOK_SECRET\` lives exclusively in Supabase secrets vault
- Only \`VITE_STRIPE_PUBLISHABLE_KEY\` is exposed to the frontend (this is safe and expected by Stripe)
- No secret key appears in any committed file or environment file in the repository
- RLS on the \`donations\` table ensures users can only read their own donation rows
- No user can insert directly into \`donations\` — inserts come only from the webhook handler via the service role

---

## Test Cards

| Card Number | Result |
|---|---|
| \`4242 4242 4242 4242\` | Payment succeeds |
| \`4000 0000 0000 0002\` | Payment declined |

Use any future expiry date and any 3-digit CVC.`,
  },
  {
    id: 'instructor',
    title: 'For Instructors',
    content: `# For Instructors

A quick reference page summarizing how CaloriQ meets the Agentic Coding Project requirements.

---

## Project Info

| Field      | Details                                                                |
| ---------- | ---------------------------------------------------------------------- |
| Student    | Mohamed Gad                                                            |
| Project    | CaloriQ — Nutrition & Calorie Tracker                                  |
| Timeline   | June 19, 2026 – June 29, 2026 (10 Days)                                |
| Repository | [github.com/gadm12/caloriQ_app](https://github.com/gadm12/caloriQ_app) |
| Live App   | [caloriQ.vercel.app](https://caloriq-psi.vercel.app/)                  |
| MkDocs     | This site                                                              |

---

## Tech Stack Requirements

| Requirement        | Implementation                            | Status |
| ------------------ | ----------------------------------------- | ------ |
| Vite + React.js    | React 18 with Vite build tool             | ✅     |
| React Router DOM   | Client-side routing across all pages      | ✅     |
| Axios              | All API calls via dedicated service layer | ✅     |
| Supabase           | PostgreSQL database + Auth + REST API     | ✅     |
| Deployed on Vercel | Frontend deployed via Vercel CI/CD        | ✅     |

---

## Feature Requirements

### 1. Authentication ✅

| Feature      | Details                                                       |
| ------------ | ------------------------------------------------------------- |
| Register     | New users sign up with name, email, and password confirmation |
| Login        | Returning users log in with email and password                |
| Logout       | Session cleared, user returned to login page                  |
| Confirmation | Email and password confirmation required on registration      |

To test — create a new account at the live app URL using any email and password.

**Stripe Test Cards:**

| Card                  | Result           |
| --------------------- | ---------------- |
| \`4242 4242 4242 4242\` | Payment succeeds |
| \`4000 0000 0000 0002\` | Payment declined |

Use any future expiry date and any 3-digit CVC.

---

### 2. CRUD Resource ✅

The primary CRUD resource is **Food Entries** — not a user profile.

| Operation | Action                                            |
| --------- | ------------------------------------------------- |
| Create    | Search and log a food item to a meal category     |
| Read      | View all food entries in the Daily Log            |
| Update    | Edit a food entry's serving size or meal category |
| Delete    | Remove a food entry with confirmation             |

---

### 3. Dynamic User Interface ✅

- Dashboard updates in real time as food entries are logged
- Daily calorie progress bar reflects current intake vs. goal
- Macro breakdown updates dynamically with each entry
- Dark/light mode toggle with preference persisted to localStorage
- Food search returns live results from the Open Food Facts API

---

### 4. Error Handling ✅

| Scenario                        | Handling                                         |
| ------------------------------- | ------------------------------------------------ |
| Invalid login credentials       | User-facing error message, re-attempt allowed    |
| Failed registration             | Field-level validation errors displayed          |
| Food search returns no results  | "No foods found" message displayed               |
| Open Food Facts API unavailable | Error state shown, user can retry                |
| Stripe payment declined         | Human-readable error message, no raw error codes |
| Stripe payment network error    | "Something went wrong" message with retry option |
| Unknown route                   | Error page with Home button redirect             |

---

## Third Party API

CaloriQ integrates the **Open Food Facts API** — a free, open, community-driven food database requiring no API key or authentication.

\`\`\`
https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&json=true
\`\`\`

---

## Bonus Features

- **Stripe Donations** — one-time payment flow with Supabase Edge Functions
- **Weekly Progress Chart** — 7-day calorie intake visualization
- **Goal Settings** — users set and update daily calorie and macro targets
- **MkDocs Documentation** — this technical documentation site`,
  },
]

const mdComponents = {
  h1: () => null,
  h2: ({ children }) => (
    <h3 className="font-display font-semibold text-title-lg text-on-surface mt-lg mb-sm">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="font-display font-semibold text-title-md text-on-surface mt-md mb-xs">{children}</h4>
  ),
  h4: ({ children }) => (
    <h5 className="font-display font-medium text-title-sm text-on-surface mt-sm mb-xs">{children}</h5>
  ),
  p: ({ children }) => (
    <p className="text-body-md text-on-surface-variant mb-sm leading-relaxed">{children}</p>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80">
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-lg mb-sm space-y-xs text-body-md text-on-surface-variant">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-lg mb-sm space-y-xs text-body-md text-on-surface-variant">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-on-surface">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  pre: ({ children }) => (
    <pre className="font-mono text-sm bg-surface-container border border-outline-variant/30 rounded-lg p-md overflow-x-auto mb-sm text-on-surface-variant leading-relaxed">
      {children}
    </pre>
  ),
  code: ({ children, className }) => {
    const text = Array.isArray(children) ? children.join('') : String(children ?? '')
    const isBlock = text.endsWith('\n') || !!className
    if (isBlock) {
      return <code className="font-mono">{children}</code>
    }
    return (
      <code className="font-mono text-sm bg-surface-container px-1 py-0.5 rounded text-primary">
        {children}
      </code>
    )
  },
  table: ({ children }) => (
    <div className="overflow-x-auto mb-sm">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-outline-variant/20">{children}</tr>,
  th: ({ children }) => (
    <th className="text-left font-semibold text-on-surface px-sm py-xs bg-surface-container-low">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="text-on-surface-variant px-sm py-xs">{children}</td>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary/40 pl-md my-sm text-on-surface-variant italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-outline-variant/30 my-lg" />,
}

export default function DocsPage() {
  return (
    <div className="py-xl space-y-xl">

      {/* Header */}
      <section>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-xs text-label-md font-semibold text-on-surface-variant hover:text-primary transition-colors mb-md"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Dashboard
        </Link>
        <h1 className="font-display font-bold text-headline-lg-mobile md:text-headline-lg text-on-surface">
          Documentation
        </h1>
        <p className="text-body-md text-on-surface-variant mt-sm">
          Technical reference for the CaloriQ application.
        </p>
      </section>

      {/* Table of Contents */}
      <section
        className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg"
        style={{ boxShadow: '0 4px 20px rgba(107,122,118,0.08)' }}
      >
        <h2 className="font-display font-semibold text-headline-sm text-on-surface mb-md">Contents</h2>
        <ol className="list-decimal pl-lg space-y-xs">
          {SECTIONS.map(s => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-primary text-body-md hover:underline">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </section>

      {/* Sections */}
      {SECTIONS.map(s => (
        <section
          key={s.id}
          id={s.id}
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg"
          style={{ boxShadow: '0 4px 20px rgba(107,122,118,0.08)' }}
        >
          <h2 className="font-display font-bold text-headline-md text-on-surface mb-md pb-sm border-b border-outline-variant/20">
            {s.title}
          </h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {s.content}
          </ReactMarkdown>
        </section>
      ))}

    </div>
  )
}
