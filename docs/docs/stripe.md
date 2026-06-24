# Stripe Donations

CaloriQ includes a one-time donation feature powered by Stripe. The implementation uses two Supabase Edge Functions to keep all secret keys off the frontend.

---

## Flow Overview

```
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
```

---

## Edge Functions

### `process-donation`

Accepts a POST request from the frontend and creates a Stripe PaymentIntent.

**Request body:**
```json
{
  "amount": 1000,
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "client_secret": "pi_xxx_secret_xxx"
}
```

- Amount is validated to be a positive integer between 1 and 1,000,000 cents ($0.01–$10,000)
- `STRIPE_SECRET_KEY` is read from Supabase secrets vault — never hardcoded or exposed to the frontend

---

### `stripe-webhook`

Listens for POST requests from Stripe and records payment results in the `donations` table.

- Deployed with `--no-verify-jwt` flag so Stripe's requests are not blocked by Supabase Auth
- Verifies every request using the `STRIPE_WEBHOOK_SECRET` signing secret
- Handles `payment_intent.succeeded` and `payment_intent.payment_failed` events
- Implements idempotency — checks for existing `stripe_payment_intent_id` before inserting to prevent duplicate records
- Returns `200` for all handled events, `400` for signature verification failures

**Webhook URL:**
```
https://inkfsrdjdmhbfxqjyvtm.supabase.co/functions/v1/stripe-webhook
```

---

## Security

- `STRIPE_SECRET_KEY` lives exclusively in Supabase secrets vault
- `STRIPE_WEBHOOK_SECRET` lives exclusively in Supabase secrets vault
- Only `VITE_STRIPE_PUBLISHABLE_KEY` is exposed to the frontend (this is safe and expected by Stripe)
- No secret key appears in any committed file or environment file in the repository
- RLS on the `donations` table ensures users can only read their own donation rows
- No user can insert directly into `donations` — inserts come only from the webhook handler via the service role

---

## Test Cards

| Card Number | Result |
|---|---|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 0002` | Payment declined |

Use any future expiry date and any 3-digit CVC.
