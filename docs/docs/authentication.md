# Authentication

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

When a new user registers, a PostgreSQL database trigger (`on_auth_user_created`) automatically inserts a row into the `profiles` table using the user's `auth.uid()` and the name provided during registration. This ensures every authenticated user has a corresponding profile without any manual insert from the frontend.

---

## Data Isolation

All Supabase queries are scoped to the authenticated user's `user_id`. No user can access another user's meal logs, food entries, or profile data.
