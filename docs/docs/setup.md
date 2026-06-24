# Setup

Instructions for running CaloriQ locally.

---

## Prerequisites

- Node.js v18+
- npm
- WSL2 (Ubuntu) or any Unix-based terminal
- Supabase account
- Stripe account

---

## Clone the Repository

```bash
git clone https://github.com/gadm12/caloriQ_app.git
cd caloriQ_app
```

---

## Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in the `client/` directory:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Supabase Setup

1. Create a new Supabase project
2. Run the SQL schema in the Supabase SQL Editor (see [Database](database.md))
3. Run the auth trigger SQL to enable automatic profile creation
4. Add the following secrets to Supabase:

```bash
cd supabase
npx supabase secrets set --project-ref your_project_ref STRIPE_SECRET_KEY=sk_...
npx supabase secrets set --project-ref your_project_ref STRIPE_WEBHOOK_SECRET=whsec_...
```

5. Deploy Edge Functions:

```bash
npx supabase functions deploy process-donation --project-ref your_project_ref
npx supabase functions deploy stripe-webhook --project-ref your_project_ref --no-verify-jwt
```

---

## Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your publishable and secret keys from the Stripe Dashboard
3. Register the webhook endpoint in Stripe Dashboard → Developers → Webhooks:
   - URL: `https://your_project_ref.supabase.co/functions/v1/stripe-webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook signing secret (`whsec_...`) and add it to Supabase secrets

---

## Deployment

CaloriQ is deployed on Vercel:

1. Connect the `caloriQ_app` GitHub repo to Vercel
2. Set the **Root Directory** to `client`
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
4. Deploy — Vercel auto-deploys on every push to `main`
