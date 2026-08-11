// supabase/functions/send-contact-email/index.ts
//
// Called from the Contact page right after an Inquiry row is inserted.
// Sends the enquiry straight to hello@marginstudio.co.uk via Resend.

import { corsHeaders, handleOptions } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Margin Studio <hello@marginstudio.co.uk>";
const NOTIFY_EMAIL = Deno.env.get("NOTIFY_EMAIL") ?? "hello@marginstudio.co.uk";

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    const { name, email, project_type, budget, message } = await req.json();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "name, email and message are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: NOTIFY_EMAIL,
        reply_to: email,
        subject: `New enquiry: ${name} (${project_type ?? "other"})`,
        html: `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Project type:</strong> ${project_type ?? "—"}</p>
          <p><strong>Budget:</strong> ${budget ?? "—"}</p>
          <p><strong>Message:</strong></p>
          <p>${(message as string).replace(/\n/g, "<br/>")}</p>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errText = await resendResponse.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ error: "Email failed to send, but your enquiry was saved." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
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
