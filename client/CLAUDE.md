# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with HMR
npm run build     # Production build to dist/
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

No test runner is configured yet.

## Project Overview

CaloriQ is a calorie and macro tracking SPA. The `client/` directory is the entire frontend — a React 19 + Vite 8 app using React Router v7.

The app is in early scaffolding stage: `src/App.jsx` still contains the default Vite starter template. The full feature set is planned in `skeleton/user_journey.md` but not yet implemented.

## Planned Architecture (from skeleton/user_journey.md)

Pages to build (all behind auth):
- **Auth** — combined login/registration form (landing page)
- **Home** — app purpose/intro
- **Daily Log** — food entries by meal category (Breakfast, Lunch, Dinner, Snacks); search via Open Food Facts API; inline edit/delete with confirmation
- **Dashboard** — daily calorie progress bar, macro breakdown, meal snapshot
- **Progress** — 7-day calorie trend chart, weekly averages
- **Goal Settings** — daily calorie goal + optional macro targets (protein, carbs, fat)
- **Profile** — account info (name, email, password)
- **Contact Us** — support via email, GitHub, LinkedIn
- **Error page** — generic fallback with Home redirect button

Key UX details:
- Deleting a food entry always requires user confirmation
- Clicking a food entry opens a detail popup with edit/delete
- A live daily calorie counter updates when entries are logged
- Food entry fields: name, meal category, serving size, calories, protein, carbs, fat

## External API

Open Food Facts API is used for food search on the Daily Log page.

## Styling

Follow the color scheme and style from any templates in `skeleton/pages/` (if present). SVG icons are served from `public/icons.svg` using `<use href="/icons.svg#icon-name">` sprite pattern.
