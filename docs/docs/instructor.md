# For Instructors

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
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 0002` | Payment declined |

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

```
https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&json=true
```

---

## Bonus Features

- **Stripe Donations** — one-time payment flow with Supabase Edge Functions
- **Weekly Progress Chart** — 7-day calorie intake visualization
- **Goal Settings** — users set and update daily calorie and macro targets
- **MkDocs Documentation** — this technical documentation site
