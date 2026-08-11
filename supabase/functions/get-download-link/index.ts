// supabase/functions/get-download-link/index.ts
//
// Called from the Library page when a customer clicks "Download". Verifies
// they actually own the purchase, checks they haven't exceeded 5 downloads,
// increments the counter, and returns a short-lived signed URL to the file
// in the private 'product-files' bucket. The bucket itself is never public,
// so this function is the only way to get a working link.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";

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

    const { purchase_id } = await req.json();
    if (!purchase_id) {
      return new Response(JSON.stringify({ error: "purchase_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .select("id, user_id, product_id, download_count, max_downloads, status")
      .eq("id", purchase_id)
      .single();

    if (purchaseError || !purchase) {
      return new Response(JSON.stringify({ error: "Purchase not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (purchase.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "This purchase doesn't belong to you" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (purchase.status !== "completed") {
      return new Response(JSON.stringify({ error: "This purchase isn't active" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (purchase.download_count >= purchase.max_downloads) {
      return new Response(
        JSON.stringify({ error: `You've used all ${purchase.max_downloads} downloads for this item. Email hello@marginstudio.co.uk if you need more.` }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("storage_path, name")
      .eq("id", purchase.product_id)
      .single();

    if (productError || !product?.storage_path) {
      return new Response(JSON.stringify({ error: "No file is attached to this product yet." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("product-files")
      .createSignedUrl(product.storage_path, 60 * 10); // 10 minute link

    if (signError || !signed) {
      return new Response(JSON.stringify({ error: "Could not generate download link" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabaseAdmin
      .from("purchases")
      .update({ download_count: purchase.download_count + 1 })
      .eq("id", purchase_id);

    return new Response(
      JSON.stringify({
        url: signed.signedUrl,
        downloads_used: purchase.download_count + 1,
        downloads_remaining: purchase.max_downloads - (purchase.download_count + 1),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message ?? "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
