# User Journey — CaloriQ

User should visit the application and be immediately faced with a form that will handle BOTH registration and log in. This form should be exchangeable pending on whether the user indicates if they have an existing account or don't.

If a user is registering they should confirm their email and their password prior to a successful registration.

After filling out the form they will either register and/or log in and be sent to the home page where they will see a few paragraphs describing the purpose and intent of this application.

Users may visit a page named **Daily Log** where all food entries for the current day, organized by meal category (Breakfast, Lunch, Dinner, Snacks), will be on display. Additionally there will be a simple search input for finding and adding a new food entry via the Open Food Facts API. Each food entry will display the food name, serving size, calories, protein, carbs, and fat. A user can click on a pencil icon to quickly edit an entry, and click on a trash icon to delete an entry.

Deleting a food entry will always require user confirmation.

A user may click on a food entry itself to open a pop up that will show the selected entry in detail — food name, meal category, serving size, calories, protein, carbs, and fat. The pop up should have an interface with capabilities for saving edits and deleting the entry.

A user may visit **Dashboard** where they will see their daily calorie summary (calories consumed vs. their goal displayed as a progress bar), a macro breakdown of protein, carbs, and fat, and a snapshot of all meals logged today organized by category.

A user may visit **Progress** where their nutrition trends over the past 7 days will be displayed — a chart showing daily calorie intake vs. goal, average daily calories for the week, and a breakdown of average macros for the week.

A user may visit **Goal Settings** where they can set or update their daily calorie goal and optional macro targets (protein, carbs, fat in grams). Changes are saved immediately and reflected across the dashboard.

A user may visit **Profile** where they can view and update their account information including name, email, and password.

A user may visit **Contact Us** where they will have the ability to reach out for support via email, GitHub, and LinkedIn.

If something goes wrong a page stating "Oops! Something went wrong. We have captured this error and will work diligently on fixing it!" with a button named "Home" that will redirect the user back to the home page.

Upon a food entry being logged, a daily calorie counter increments to show the user how many calories they have consumed today toward their goal.

User logs out.


This React + vite application using React Router DOM is functioning correctly and I want to preserver the existing UI and user experience

Resources:

1. SQL Schema: @./skeleton/db_schema.sql
2. Supabase Project URL: see .env file (VITE_SUPABASE_URL)
3. Supabase Public API Key: see .env file (VITE_SUPABASE_ANON_KEY)
4. Resources: tables
5. application user journey: @./skeleton/user_journey.md

Requirements:

- Analyze the current application before making any code changes.
- identify all existing CRUD flows and components that manage data.
- present an implementation plan before modifying code.
- Use axios for all Open Food Facts API calls as well, not just Supabase

Implementation Requirements:

- Preserver the existing UI.
- Replace all all mock/local CRUD operations with Supabase API interactions.
- Use axios for all API service layer.
- Create a dedicated ApI service layer
- Components should never directly call axios
- Store API configuration in environment variables.
- Implement loading, error, and success states for all CRUD actions
- Analyze the SQL schema and correctly implement any relationships between tables
- Do not implement authentication at this time
- Do not introduce unnecessary architectural changes or redesign existing components

Deliverables:

1. Analysis of current architecture
2. Proposed implementation plan
3. Code changes
4. Summary of modified files
5. Any assumptions made during implementation

Before writing code, tell me if you identify any ambiguities, missing schema information or architectural concerns.

while you are adding functionality to the application, I want you to utilize the playwright MCP to walk through each feature as if you were the user and ensure the API communication and feature itself are working.

do you have any additional questions?