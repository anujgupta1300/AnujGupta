# Supabase Setup — Contact Form (storage + email notification)

This wires the existing Contact section to Supabase. Scope is the Contact form only:
public visitors can **submit** a message; nobody can read messages from the
browser. **No authentication** is involved anywhere.

Pipeline:

```
Contact form (publishable key)
      │  supabase.from('contact_messages').insert(...)
      ▼
Postgres table  public.contact_messages   (RLS: anon INSERT only)
      │  Database Webhook on INSERT
      ▼
Edge Function  notify-new-contact-message  (Deno, server-side)
      │  Resend API (secret key, server-side only)
      ▼
Owner inbox (NOTIFY_EMAIL)
```

> **Key naming (current, 2026):** use the **publishable key** (`sb_publishable_...`)
> in the browser and the **secret key** (`sb_secret_...`) server-side only. The old
> `anon` / `service_role` names are legacy (under *Project Settings > API Keys >
> Legacy API Keys*) and are being phased out by end of 2026.

---

## What's already in this repo

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Browser client, reads `VITE_SUPABASE_*` env |
| `src/components/ContactSection.tsx` | Form submit → `insert` + honeypot guard |
| `.env.example` | Template for the two browser-safe env vars |
| `supabase/migrations/20260628120000_create_contact_messages.sql` | Table + RLS |
| `supabase/functions/notify-new-contact-message/index.ts` | Email Edge Function |
| `supabase/config.toml` | CLI config |

The rest below is **manual** (Dashboard / CLI) and cannot be done from the codebase.

---

## 1. Create the project & get the browser keys

1. Create a project at https://supabase.com/dashboard.
2. Go to **Project Settings > API Keys**.
   - Copy the **Project URL** → `VITE_SUPABASE_URL`
   - Copy the **Publishable key** (`sb_publishable_...`) → `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Locally:
   ```bash
   cp .env.example .env.local   # then paste the two values in
   ```
   `.env.local` is gitignored. Never put the secret key or Resend key here.

## 2. Apply the database migration

**Option A — CLI (recommended):**
```bash
npm install -g supabase          # or: npx supabase ...
supabase login
supabase link --project-ref <your-project-ref>
supabase db push                 # applies supabase/migrations/*
```

**Option B — Dashboard:** open **SQL Editor**, paste the contents of
`supabase/migrations/20260628120000_create_contact_messages.sql`, and run it.

Verify in **Table Editor**: `contact_messages` exists with RLS enabled and a
single INSERT policy for `anon`.

## 3. Set up Resend (email provider)

1. Create an account at https://resend.com and an **API key**.
2. For real sending, add and verify your **sending domain** (Resend > Domains),
   then use an address on it, e.g. `Portfolio Contact <notifications@yourdomain.com>`.
   For quick testing you can use `onboarding@resend.dev` (the function defaults to
   this if `NOTIFY_FROM_EMAIL` is unset).

## 4. Deploy the Edge Function & set its secrets

Secrets live **only** in the Edge Function environment — never in `.env.local`.

```bash
# from the project root
supabase functions deploy notify-new-contact-message

supabase secrets set \
  RESEND_API_KEY=re_xxx \
  NOTIFY_EMAIL=anujgupta3600@gmail.com \
  NOTIFY_FROM_EMAIL="Portfolio Contact <notifications@yourdomain.com>"
```

(You can also set these under **Dashboard > Edge Functions > (function) > Secrets**.)

## 5. Create the Database Webhook (INSERT → function)

Dashboard > **Database > Webhooks** (a.k.a. Database Webhooks) > **Create a new hook**:

- **Table:** `public.contact_messages`
- **Events:** `INSERT` only
- **Type:** *Supabase Edge Functions*
- **Function:** `notify-new-contact-message`
- **HTTP headers:** keep the default `Authorization: Bearer <service_role/secret>`
  header the wizard adds — this is server-to-server and never touches the browser.

The function reads `payload.record` (the newly inserted row) and emails you.

## 6. Test end-to-end

1. `npm run dev`, open the Contact section, send a test message.
2. Check **Table Editor** → a new row appears.
3. Check your inbox → notification email arrives.
4. Check **Edge Functions > Logs** if the email doesn't arrive.

---

## Security notes

- **RLS:** `anon` can only `INSERT`. No SELECT/UPDATE/DELETE policy exists, so the
  browser cannot read, edit, or delete messages. Read them via the Dashboard or
  server-side with the secret key.
- **Honeypot:** the form includes a hidden `company` field; submissions with it
  filled are dropped client-side without hitting the DB. Optional extra hardening:
  a per-IP rate limit (e.g. via an Edge Function proxy) if spam becomes an issue.
- **Keys:** only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` ship to
  the browser. `RESEND_API_KEY`, `NOTIFY_EMAIL`, and the Supabase secret key stay
  server-side.
