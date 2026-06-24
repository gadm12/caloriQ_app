# Features

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

Changes are saved to the `profiles` table and reflected immediately on the dashboard.

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
| Donations | ✅ (webhook) | ✅ | — | — |
