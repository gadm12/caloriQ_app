# App Planning Outline — CaloriQ

## Fundamental Questions

### Identifying the App

**1. What problem does the app solve?**

CaloriQ tackles one of the most common barriers to healthy eating: the lack of a simple, free tool to track daily nutrition. Most calorie tracking apps hide essential features — macro breakdowns, meal history, and goal tracking — behind expensive subscriptions. Users are left guessing what they're actually consuming day to day, making it difficult to stay consistent with any nutrition goal.

CaloriQ provides a free, focused nutrition tracking experience. Users can log meals, track calories and macronutrients (protein, carbs, and fat), set daily calorie goals, and visualize their intake over time — all without paying a subscription.

**2. Why would someone use it?**

To replace expensive nutrition apps and scattered food journals with a single, clean place to log every meal. CaloriQ removes the friction of tracking — users search for food, log their portions, and over time build a clear picture of their eating habits. Knowing your numbers each day makes healthy choices more intentional and sustainable.

**3. What pain point exists today?**

The nutrition app market is dominated by subscription-gated products. Free tiers on apps like MyFitnessPal are intentionally limited — macro tracking, detailed history, and goal analytics are often locked behind a paywall. People who want to eat better without paying a monthly fee are left with no purpose-built tool. The core pain point is that basic, personal nutrition data shouldn't cost a monthly fee to access.

**4. How are users solving this now?**

Current workarounds are inconsistent and hard to maintain. Some people keep food journals in a notebook. Others use Notes or Google Sheets, which require manual formatting with no nutritional lookup. A portion use free tiers of apps like MyFitnessPal or Cronometer but hit paywalls quickly. Some simply estimate their intake from memory, which makes accurate tracking nearly impossible.

---

### Who is the User

**1. Who will use this app?**

CaloriQ is built for anyone who wants to take control of their daily nutrition without paying a subscription. The target user is a health-conscious individual of any experience level — from someone just starting to track their eating to a fitness enthusiast monitoring macros for performance goals. No technical background is required.

**2. Additional User Types**

There is only one user type. All users share the same role, permissions, and experience within the application.

**3. What information does this user need?**

- **Resource Management:** The ability to create and manage daily meal logs, individual food entries within those logs, and their associated calorie and macro data.
- **Personal Information:** Basic account details including name, email address, and password to maintain a secure, personalized experience.
- **Goal Data:** A personal daily calorie target used to measure progress against actual intake.

---

### User Goals

**1. What actions do people come here to accomplish?**

Users come to CaloriQ to log their meals quickly and accurately, review their daily and weekly nutrition history, track their progress toward calorie and macro goals, and search for food items using the Open Food Facts API — all in support of consistent, informed eating habits.

**2. Top 3 Reasons for Visit**

| Priority | Action                         | HTTP Method  |
| -------- | ------------------------------ | ------------ |
| 1        | Log a meal / food entry        | POST         |
| 2        | Review daily nutrition summary | GET          |
| 3        | Update or delete a food entry  | PUT / DELETE |

---

### Information Needed

**1. What do users view?**

Users interact with the following resources:

- Their personal **profile** and daily calorie goal
- Their **daily meal log** (breakfast, lunch, dinner, snacks)
- **Individual food entries** within each meal (name, calories, protein, carbs, fat)
- A **daily nutrition dashboard** showing calories consumed vs. goal and macro breakdown
- **Weekly progress summary** showing intake trends over time

**2. What should they never see?**

Users must never have access to another user's meal logs, nutrition data, or profile. All resources are private and scoped strictly to the authenticated user.

**3. What do they create, update, and delete?**

Users have full CRUD control over their **meal logs**, **food entries**, and **daily calorie goals**.

---

## User Journey

The user arrives at the application and is immediately presented with a single, unified form that handles both **registration** and **login**. The form is dynamic — users toggle between the two modes depending on whether they have an existing account. During registration, users must confirm both their email address and password before the account is created.

Upon successful registration or login, the user is redirected to the **Dashboard**, which displays their daily calorie summary, macro breakdown, and a prompt to log their first meal.

---

### Pages & Features

---

**Dashboard (Home)**

After logging in, the user sees a personalized dashboard showing:

- A greeting with their name
- Daily calorie summary: calories consumed vs. daily goal (progress bar)
- Macro breakdown: protein, carbs, and fat (displayed as progress bars or a donut chart)
- A list of today's logged meals with quick-add buttons per meal category
- A shortcut to search and add a new food entry

---

**Meal Log (Daily Diary)**

A page displaying all food entries for the current day, organized by meal category:

- Breakfast
- Lunch
- Dinner
- Snacks

Each entry shows:

- Food name
- Serving size
- Calories, protein, carbs, and fat

Users can **edit** or **delete** any entry inline. A running daily total is displayed at the bottom of the page. Users can navigate to previous days to review past logs.

---

**Add Food Entry**

The user searches for a food by name using the **Open Food Facts API**. Search results display the food name and basic nutrition info. The user selects a result, confirms or adjusts the serving size, assigns it to a meal category, and saves the entry to their daily log.

API Used:

```
https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&json=true
```

Data extracted per entry:

- `product_name` — food name
- `nutriments["energy-kcal_100g"]` — calories
- `nutriments["proteins_100g"]` — protein
- `nutriments["carbohydrates_100g"]` — carbohydrates
- `nutriments["fat_100g"]` — fat

---

**Goal Settings**

A page where users can set and update their personal nutrition targets:

- Daily calorie goal
- Optional macro targets (protein, carbs, fat in grams)

The goal is saved to Supabase and referenced on the dashboard to calculate progress. Users can update their goal at any time.

---

**Progress (Weekly Summary)**

A page where users can review their nutrition trends over the past 7 days. Displays:

- A bar or line chart showing daily calorie intake vs. goal
- Average daily calories for the week
- A breakdown of average macros for the week

This gives users a clear picture of consistency — whether they're hitting their goals or need to adjust.

---

**Profile**

A page where users can view and update their account information:

- Name
- Email
- Password (change)
- Daily calorie goal shortcut

---

**Contact**

A support page where users can reach out through the following channels:

- Email
- GitHub
- LinkedIn

---

**Error Page**

If an unexpected error occurs, the user is presented with a friendly message:

> "Oops! Something went wrong. We have captured this error and will work diligently on fixing it!"

A **Home** button is displayed, redirecting the user back to the dashboard.

---

**Logout**

The user ends their session by logging out, returning them to the login/registration form.

---

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Frontend     | React (SPA), React Router           |
| Backend/DB   | Supabase (PostgreSQL + Auth + REST) |
| External API | Open Food Facts (free, no key)      |
| Styling      | TailwindCSS                         |
| Deployment   | Vercel                              |

---

## Supabase Tables (Data Model)

### `profiles`

| Column       | Type      | Notes                 |
| ------------ | --------- | --------------------- |
| id           | uuid      | References auth.users |
| name         | text      |                       |
| calorie_goal | integer   | Daily calorie target  |
| created_at   | timestamp |                       |

### `meal_logs`

| Column     | Type      | Notes                       |
| ---------- | --------- | --------------------------- |
| id         | uuid      | Primary key                 |
| user_id    | uuid      | References profiles.id      |
| log_date   | date      | The day this log belongs to |
| created_at | timestamp |                             |

### `food_entries`

| Column       | Type      | Notes                              |
| ------------ | --------- | ---------------------------------- |
| id           | uuid      | Primary key                        |
| log_id       | uuid      | References meal_logs.id            |
| user_id      | uuid      | References profiles.id             |
| meal_type    | text      | breakfast / lunch / dinner / snack |
| food_name    | text      | From Open Food Facts               |
| calories     | numeric   |                                    |
| protein      | numeric   | grams                              |
| carbs        | numeric   | grams                              |
| fat          | numeric   | grams                              |
| serving_size | numeric   | User-adjusted serving (grams)      |
| created_at   | timestamp |                                    |
