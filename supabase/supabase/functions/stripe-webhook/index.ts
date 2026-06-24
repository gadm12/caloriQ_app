import Stripe from "npm:stripe@14";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Stripe signature validation ───────────────────────────────────────────
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.warn(
      "STRIPE_WEBHOOK_SECRET is not set — cannot verify webhook signature",
    );
    return new Response(
      JSON.stringify({ error: "Webhook secret not configured" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    console.error("STRIPE_SECRET_KEY is not set");
    return new Response(
      JSON.stringify({ error: "Server misconfiguration" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-04-10",
  });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(
      JSON.stringify({ error: "Missing stripe-signature header" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  let event: Stripe.Event;
  const rawBody = await req.text();
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(
      JSON.stringify({ error: "Invalid webhook signature" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // ── Supabase service-role client ──────────────────────────────────────────
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not available");
    return new Response(
      JSON.stringify({ error: "Server misconfiguration" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // ── Handle events ─────────────────────────────────────────────────────────
  if (
    event.type === "payment_intent.succeeded" ||
    event.type === "payment_intent.payment_failed"
  ) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const stripePaymentIntentId = paymentIntent.id;
    const userId = paymentIntent.metadata?.user_id ?? null;
    const amount = paymentIntent.amount;
    const status =
      event.type === "payment_intent.succeeded" ? "succeeded" : "failed";

    // Idempotency guard: skip if we've already recorded this payment intent
    const { data: existing, error: selectError } = await supabase
      .from("donations")
      .select("id")
      .eq("stripe_payment_intent_id", stripePaymentIntentId)
      .maybeSingle();

    if (selectError) {
      console.error("Error checking for existing donation:", selectError);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    if (existing) {
      console.log(
        `Idempotency: donation for ${stripePaymentIntentId} already recorded, skipping`,
      );
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Insert the donation record
    const { error: insertError } = await supabase.from("donations").insert({
      user_id: userId,
      amount,
      stripe_payment_intent_id: stripePaymentIntentId,
      status,
    });

    if (insertError) {
      console.error("Error inserting donation:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to record donation" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log(
      `Recorded donation: ${stripePaymentIntentId} status=${status} amount=${amount} user=${userId}`,
    );
  } else {
    // Unhandled event type — acknowledge without processing
    console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
