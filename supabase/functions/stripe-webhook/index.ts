// supabase/functions/stripe-webhook/index.ts
//
// Stripe calls this URL directly (not the browser) whenever a payment event
// happens. This is the ONLY place a `purchases` row is ever created — that's
// what makes "did this person actually pay" trustworthy. Configure this as
// an endpoint in the Stripe Dashboard listening for `checkout.session.completed`.
//
// Deploy with --no-verify-jwt since Stripe can't send a Supabase auth header:
//   supabase functions deploy stripe-webhook --no-verify-jwt

import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@16";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Margin Studio <hello@marginstudio.co.uk>";
const NOTIFY_EMAIL = Deno.env.get("NOTIFY_EMAIL") ?? "hello@marginstudio.co.uk";

async function sendEmail(to: string, subject: string, html: string) {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
}

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { user_id, product_id, product_name } = session.metadata ?? {};

    if (!user_id || !product_id) {
      console.error("Missing metadata on checkout session", session.id);
      return new Response("Missing metadata", { status: 400 });
    }

    // Idempotency: if we've already recorded this session, do nothing further.
    const { data: existing } = await supabaseAdmin
      .from("purchases")
      .select("id")
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();

    if (!existing) {
      const { error: insertError } = await supabaseAdmin.from("purchases").insert({
        user_id,
        product_id,
        product_name: product_name ?? "Product",
        amount_paid: (session.amount_total ?? 0) / 100,
        currency: session.currency ?? "gbp",
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        status: "completed",
      });

      if (insertError) {
        console.error("Failed to insert purchase:", insertError);
        return new Response("DB insert failed", { status: 500 });
      }

      const customerEmail = session.customer_email ?? session.customer_details?.email;

      if (customerEmail) {
        await sendEmail(
          customerEmail,
          "Your Margin Studio purchase",
          `<p>Thanks for your purchase — <strong>${product_name}</strong> is ready in your library.</p>
           <p><a href="${Deno.env.get("SITE_URL") ?? "https://marginstudio.co.uk"}/library">Go to your library</a> to download it (up to 5 downloads).</p>`
        );
      }

      await sendEmail(
        NOTIFY_EMAIL,
        `New sale: ${product_name}`,
        `<p>${customerEmail ?? "A customer"} just bought <strong>${product_name}</strong> for £${((session.amount_total ?? 0) / 100).toFixed(2)}.</p>
         <p>Payment intent: ${session.payment_intent}</p>`
      );
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
