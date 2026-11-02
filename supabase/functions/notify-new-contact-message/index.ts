// Edge Function (Deno runtime) invoked by a Postgres Database Webhook that fires
// on every INSERT into public.contact_messages. It emails the portfolio owner.
//
// This runs server-side only. The Resend API key and owner email live in Edge
// Function secrets (see SUPABASE_SETUP.md) and are never shipped to the browser.
//
// Webhook payload shape (Supabase DB webhook):
//   { type: "INSERT", table, schema, record: {...new row...}, old_record: null }

import { Resend } from 'npm:resend@4'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
const NOTIFY_EMAIL = Deno.env.get('NOTIFY_EMAIL') ?? ''
// Must be an address on a domain verified in Resend. onboarding@resend.dev works
// for testing without a verified domain.
const FROM_EMAIL =
  Deno.env.get('NOTIFY_FROM_EMAIL') ?? 'Portfolio Contact <onboarding@resend.dev>'

// Minimal HTML escaping so message content can't inject markup into the email.
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const record = payload?.record

    if (!record?.email || !record?.message) {
      return new Response(JSON.stringify({ error: 'Malformed webhook payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!NOTIFY_EMAIL) {
      console.error('NOTIFY_EMAIL secret is not set')
      return new Response(JSON.stringify({ error: 'NOTIFY_EMAIL not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const name = escapeHtml(record.name)
    const email = escapeHtml(record.email)
    const message = escapeHtml(record.message).replaceAll('\n', '<br>')

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      reply_to: record.email, // reply goes straight to the sender
      subject: `New portfolio contact message from ${record.name}`,
      html: `
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Edge Function error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
