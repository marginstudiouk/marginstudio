// supabase/functions/send-subscriber-email/index.ts
//
// Called from the Resources page after someone submits their email for a
// free resource. Generates a signed link to the file (private bucket),
// emails it to them via Resend, AND returns the same link so the page can
// also offer an immediate "Download now" button — satisfying both "gets it
// immediately" and "gets it by email".

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Margin Studio <hello@marginstudio.co.uk>";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    const { email, name, product_id } = await req.json();
    if (!email || !product_id) {
      return new Response(JSON.stringify({ error: "email and product_id are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record/update the subscriber (id conflict on unique email -> ignore).
    await supabaseAdmin.from("subscribers").upsert({ email, name }, { onConflict: "email" });

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("name, storage_path, is_free")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!product.is_free) {
      return new Response(JSON.stringify({ error: "This isn't a free resource." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!product.storage_path) {
      return new Response(JSON.stringify({ error: "No file is attached to this resource yet." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 7-day link — free resources aren't download-capped like paid ones.
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("product-files")
      .createSignedUrl(product.storage_path, 60 * 60 * 24 * 7);

    if (signError || !signed) {
      return new Response(JSON.stringify({ error: "Could not generate download link" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: `Your download: ${product.name}`,
        html: `
          <p>Hi ${name || "there"},</p>
          <p>Here's your copy of <strong>${product.name}</strong>:</p>
          <p><a href="${signed.signedUrl}">Download ${product.name}</a></p>
          <p>This link works for 7 days. If it expires, just reply to this email.</p>
        `,
      }),
    });

    return new Response(JSON.stringify({ url: signed.signedUrl }), {
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
