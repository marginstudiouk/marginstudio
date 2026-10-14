// supabase/functions/create-checkout-session/index.ts
//
// Called from the client when a logged-in customer checks out their cart.
// Accepts an array of { product_id, variant_id?, quantity? } items, verifies
// the user's session, then builds one Stripe Checkout Session with one line
// item per cart line — prices are created on the fly from whatever price is
// stored in the database (product.price, or the chosen variant's price), so
// nothing needs pre-creating in the Stripe Dashboard.
//
// Each Stripe line item's ad-hoc product carries our internal product_id /
// variant_id / variant_label in its metadata, so the webhook can reconstruct
// exactly what was bought without needing a separate staging table.
//
// No charge happens here — the actual payment is confirmed later by the
// stripe-webhook function.

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

    const body = await req.json();

    // Back-compat: still accept a single { product_id, variant_id } call,
    // as well as the new { items: [...] } shape used by the cart.
    const rawItems: Array<{ product_id?: string; variant_id?: string; quantity?: number }> =
      Array.isArray(body.items) && body.items.length > 0
        ? body.items
        : body.product_id
        ? [{ product_id: body.product_id, variant_id: body.variant_id }]
        : [];

    if (rawItems.length === 0) {
      return new Response(JSON.stringify({ error: "Your cart is empty." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const productIds = [...new Set(rawItems.map((i) => i.product_id).filter(Boolean))];

    const { data: products, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, is_free, variants, sold_out")
      .in("id", productIds);

    if (productError || !products) {
      return new Response(JSON.stringify({ error: "Could not load products." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const productById = Object.fromEntries(products.map((p) => [p.id, p]));
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of rawItems) {
      const product = productById[item.product_id ?? ""];
      if (!product) {
        return new Response(JSON.stringify({ error: "One of the items in your cart no longer exists." }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (product.is_free) {
        return new Response(
          JSON.stringify({ error: `"${product.name}" is a free resource — use the resources signup flow instead.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (product.sold_out) {
        return new Response(JSON.stringify({ error: `"${product.name}" has already sold.` }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let priceGBP: number | null = null;
      let nameForRecord = product.name;
      let variantLabel = "";
      const variants = Array.isArray(product.variants) ? product.variants : [];

      if (variants.length > 0) {
        if (!item.variant_id) {
          return new Response(
            JSON.stringify({ error: `Please choose an option for "${product.name}" before checking out.` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const variant = variants.find((v: any) => v.id === item.variant_id);
        if (!variant) {
          return new Response(JSON.stringify({ error: `That option for "${product.name}" isn't available.` }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        priceGBP = Number(variant.price);
        variantLabel = variant.label;
        nameForRecord = `${product.name} — ${variant.label}`;
      } else {
        priceGBP = Number(product.price);
      }

      if (!priceGBP || priceGBP <= 0) {
        return new Response(
          JSON.stringify({ error: `"${product.name}" doesn't have a valid price set yet. Check the admin panel.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));

      lineItems.push({
        price_data: {
          currency: "gbp",
          product_data: {
            name: nameForRecord,
            metadata: {
              product_id: product.id,
              variant_id: item.variant_id ?? "",
              variant_label: variantLabel,
            },
          },
          unit_amount: Math.round(priceGBP * 100),
        },
        quantity,
      });
    }

    const { origin } = body;
    const site = origin || Deno.env.get("SITE_URL") || "https://marginstudio.co.uk";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: user.email,
      success_url: `${site}/library?checkout=success`,
      cancel_url: `${site}/cart?checkout=cancelled`,
      metadata: {
        user_id: user.id,
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
