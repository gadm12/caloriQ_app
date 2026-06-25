# 🍎 CaloriQ

> A free, full-stack nutrition and calorie tracking SPA — built as a course project at Code Platoon.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-green?logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)

---

## What is CaloriQ?

CaloriQ tackles one of the most common barriers to healthy eating: the lack of a simple, free tool to track daily nutrition. Most calorie tracking apps hide essential features behind expensive subscriptions.

CaloriQ gives users a focused nutrition tracking experience — for free.

---

## Features

- 🔐 **Auth** — Register, login, logout with Supabase Auth
- 🍽️ **Meal Logging** — Log food across Breakfast, Lunch, Dinner, and Snacks
- 🔍 **Food Search** — Search millions of foods via Open Food Facts API
- 📊 **Dashboard** — Daily calorie progress and macro breakdown
- 🎯 **Goal Setting** — Set and update daily calorie and macro targets
- 📈 **Progress** — Weekly nutrition trends chart
- 💳 **Donations** — One-time Stripe donation with webhook recording
- 🌙 **Dark Mode** — Persisted to localStorage

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, React Router DOM, TailwindCSS, Axios |
| Backend | Supabase (PostgreSQL + Auth + REST API) |
| Serverless | Supabase Edge Functions (Deno) |
| External API | Open Food Facts (free, no key required) |
| Payments | Stripe |
| Deployment | Vercel |

---

## Getting Started

```bash
git clone https://github.com/gadm12/caloriQ_app.git
cd caloriQ_app/client
npm install
```

Create a `.env` file in `client/`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

```bash
npm run dev
```

---

## Documentation

Full technical documentation is available inside the app under the **Docs** tab.

---

## Author

**Mohamed Gadm**
- GitHub: [github.com/gadm12](https://github.com/gadm12)
- LinkedIn: [linkedin.com/in/mohamed-gad-67108921a](https://www.linkedin.com/in/mohamed-gad-67108921a/)
