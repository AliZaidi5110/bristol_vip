-- ============================================================================
--  Bristol VIP — Supabase schema
--  Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) site_settings : a single-row table holding the live "Get Tickets" link.
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id int primary key default 1,
  ticket_link text not null default 'https://www.eventbrite.co.uk/',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- Seed the one and only row (id = 1). No-op if it already exists.
insert into public.site_settings (id, ticket_link)
values (1, 'https://www.eventbrite.co.uk/')
on conflict (id) do nothing;

-- Row Level Security: anyone may READ the link (site needs to display it),
-- but nobody may write via the anon/public key. Writes happen only through the
-- server-side service-role key, which bypasses RLS.
alter table public.site_settings enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

-- (No insert/update/delete policies → blocked for anon/authenticated. The
--  service role bypasses RLS entirely, so admin saves still work.)

-- ---------------------------------------------------------------------------
-- 2) contact_messages : stores submissions from the site contact form.
--    Written only via the service role (server API route). No public access.
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
-- No policies → the anon/public key can neither read nor write. Only the
-- server-side service role (used by /api/contact) can insert.
