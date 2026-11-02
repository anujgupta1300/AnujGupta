-- Contact form storage for the portfolio's Contact section.
-- Schema matches the fields the existing form actually inserts:
--   name, email, subject (a fixed "Portfolio contact" label today), message.
-- created_at is owned by the database, not the client, so it can't be spoofed.

create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(trim(name)) > 0),
  email      text not null check (length(trim(email)) > 0),
  subject    text not null default 'Portfolio contact',
  message    text not null check (length(trim(message)) > 0),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Public, unauthenticated visitors may submit a message (INSERT only).
-- The publishable key resolves to the `anon` Postgres role, so this is the
-- role the browser hits. No USING clause exists for SELECT/UPDATE/DELETE, so
-- with RLS enabled those are denied by default for anon — messages are
-- readable only via the Dashboard (project owner) or server-side with the
-- secret key. There is no auth in this task, so we deliberately add no read path.
drop policy if exists "Anyone can submit a contact message" on public.contact_messages;
create policy "Anyone can submit a contact message"
  on public.contact_messages
  for insert
  to anon
  with check (true);
