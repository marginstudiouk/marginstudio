# Margin Studio

React (Vite) + Supabase + Stripe + Resend, deployed on Vercel. No Base44 anywhere.

## Stack

- **Frontend**: React 18, Vite, Tailwind, shadcn/ui, TanStack Query, React Router — hosted on **Vercel**.
- **Backend**: **Supabase** — Postgres database, Auth (email/password, admin + customer), Storage (public `images` bucket + private `product-files` bucket), and Edge Functions for anything that needs a secret key.
- **Payments**: **Stripe** Checkout (hosted). Your database stores product content, Stripe stores the price and takes the payment.
- **Email**: **Resend**, called from Edge Functions — contact form notifications, purchase receipts + sale alerts, and free-resource delivery.

Nothing in the browser ever sees a Stripe secret key, a Resend API key, or the Supabase service role key — those only exist as Edge Function secrets on Supabase's servers.

---

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL editor** → paste the entire contents of `supabase/schema.sql` → Run. This creates every table, RLS policy, and the two storage buckets.
3. **Project Settings → API** → copy your Project URL and `anon` public key into `.env.local` (see step 4 below).
4. Install the Supabase CLI (`npm install -g supabase`), then from the project root:
   ```
   supabase login
   supabase link --project-ref your-project-ref
   ```
5. Deploy the Edge Functions:
   ```
   supabase functions deploy create-checkout-session
   supabase functions deploy get-download-link
   supabase functions deploy send-contact-email
   supabase functions deploy send-subscriber-email
   supabase functions deploy invite-admin
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```
   (`stripe-webhook` is the one exception — it needs `--no-verify-jwt` because Stripe calls it directly, not through a logged-in user's session.)
6. Set the Edge Function secrets (these are shared across all functions in the project):
   ```
   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
   supabase secrets set RESEND_API_KEY=re_xxx
   supabase secrets set FROM_EMAIL="Margin Studio <hello@marginstudio.co.uk>"
   supabase secrets set NOTIFY_EMAIL=hello@marginstudio.co.uk
   supabase secrets set SITE_URL=https://marginstudio.co.uk
   ```
   `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically — you don't need to set those.

### Making the *first* admin (you)

Every admin after the first is invited from inside the app (see below) — but there's a chicken-and-egg problem for admin #1, since inviting requires already being an admin. So, once only:

1. Sign up through the live site once with your own email (this creates your `profiles` row automatically).
2. In the Supabase SQL editor, run:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@marginstudio.co.uk';
   ```

That's the only manual role flip you should ever need. Every subsequent admin — the same shape Base44's `inviteUser(email, "admin")` gave you — is created from `/admin → Team`, which emails them their own "set your password" link and lands them in as an admin from the start. It never touches or upgrades an existing customer account, and only an existing admin can send an invite (enforced inside the `invite-admin` Edge Function, not just hidden in the UI).

### Email confirmations

By default Supabase requires email confirmation before a new signup can log in. For a shop, that's usually right — but if you'd rather customers can buy immediately after signing up, turn it off in **Authentication → Providers → Email → Confirm email**.

---

## 2. Stripe setup

For **each paid product**:
1. Stripe Dashboard → **Product catalog** → add a product with a one-off price in GBP.
2. Copy the **Price ID** (`price_...`).
3. In the Margin Studio admin panel (`/admin` → Products), create the product and paste that Price ID into the "Stripe price ID" field. A product can't be bought until this is set — the admin list will flag any paid product missing one.

### Webhook

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. URL: `https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`
3. Event to listen for: `checkout.session.completed`.
4. Copy the **Signing secret** (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` (see above).

This webhook is the only place a purchase is ever recorded — nothing in the browser can fake a purchase.

Test locally with the Stripe CLI: `stripe listen --forward-to https://<project-ref>.supabase.co/functions/v1/stripe-webhook`.

---

## 3. Resend setup

1. Create an account at [resend.com](https://resend.com), verify your sending domain (`marginstudio.co.uk`) by adding the DNS records they give you.
2. Create an API key → set it as `RESEND_API_KEY` above.
3. `FROM_EMAIL` must be an address on your verified domain (e.g. `hello@marginstudio.co.uk`).

---

## 4. Local development

```
npm install
cp .env.example .env.local
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

---

## 5. Deploying to Vercel

1. Push this repo to GitHub.
2. Vercel → **Add New Project** → import the repo. Framework preset: Vite.
3. **Environment Variables** → add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL` (your production domain) — same values as `.env.local`.
4. Deploy. `vercel.json` is already set up to route all paths to `index.html` so client-side routing (React Router) works on refresh and direct links.
5. Once your domain is live, update `SITE_URL` in the Supabase Edge Function secrets to match (used for email links) and update the Stripe webhook / success / cancel URLs if you change domains later.

---

## Images

**Every image in this project is a placeholder** — plain labelled SVGs in `public/images/`, generated so nothing shows as broken while you build. Replace these before launch:

| File | Used for |
|---|---|
| `public/images/logo.svg` | Navbar + footer logo |
| `public/images/favicon.svg` | Browser tab icon |
| `public/images/hero.svg` | Homepage hero image |
| `public/images/services/*.svg` | The six service pages + related cards |

Product cover images and journal post images are set individually per item in the admin panel (`/admin`) — paste a URL, or upload through the admin form once you wire up a real image (they go into the public `images` Supabase Storage bucket).

---

## How the money actually moves

1. Customer clicks "Get instant access" on a product → `create-checkout-session` Edge Function creates a Stripe Checkout session → they're redirected to Stripe's hosted payment page.
2. They pay. Stripe redirects them back to `/library?checkout=success`.
3. Independently, Stripe calls the `stripe-webhook` function to confirm the payment actually went through — **this** is what creates the `purchases` row, not the redirect. This is what makes it safe against someone just navigating to `/library` without paying.
4. The webhook also emails the customer a receipt/library link, and emails you (`NOTIFY_EMAIL`) a sale notification.
5. Money settles into your Stripe balance on Stripe's normal payout schedule to your bank account — nothing in this app handles payouts, that's entirely Stripe's side.
6. In the Library page, each purchase allows up to 5 downloads — `get-download-link` checks ownership and the counter, then mints a 10-minute signed URL to the actual file in the private storage bucket.

## Free resources

Someone enters their email on `/resources` → `send-subscriber-email` records them as a subscriber, generates a 7-day signed download link, emails it to them, and returns the same link so the page can also offer an immediate "Download now" button. Free resources aren't download-capped like paid ones.

## Access control summary

| Role | Can do |
|---|---|
| Anyone (logged out) | Browse shop/resources/journal/services, submit contact form, sign up to newsletter, sign up for an account |
| Customer (logged in) | View `/account`, view `/library` and download their own purchases (up to 5x each), buy products |
| Admin | Everything a customer can, plus `/admin` — create/delete products, posts, and case studies, view and manage the subscriber list |

Admin status is a manual SQL flip (see above) — there's no self-service path to becoming an admin from inside the app.
