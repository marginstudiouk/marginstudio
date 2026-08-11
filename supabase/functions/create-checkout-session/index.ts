// supabase/functions/create-checkout-session/index.ts
//
// Called from the client when a logged-in customer clicks "Buy" on a product.
// Verifies the user's session, looks up the product's Stripe price, and
// returns a Stripe Checkout URL to redirect to. No charge happens here —
// the actual payment is confirmed later by the stripe-webhook function.

import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@16";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Client bound to the calling user's JWT — respects RLS, used to identify who's buying.
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { product_id, origin } = await req.json();
    if (!product_id) {
      return new Response(JSON.stringify({ error: "product_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service-role client to read the product regardless of RLS nuances.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, is_free, stripe_price_id")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (product.is_free) {
      return new Response(JSON.stringify({ error: "This product is free — use the resources signup flow instead." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!product.stripe_price_id) {
      return new Response(
        JSON.stringify({ error: "This product isn't linked to a Stripe price yet. Add stripe_price_id in the admin panel." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const site = origin || Deno.env.get("SITE_URL") || "https://marginstudio.co.uk";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: product.stripe_price_id, quantity: 1 }],
      customer_email: user.email,
      success_url: `${site}/library?checkout=success`,
      cancel_url: `${site}/product/${product_id}?checkout=cancelled`,
      metadata: {
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message ?? "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
