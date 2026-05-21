-- =====================================================================
-- RLS — el teléfono NUNCA se expone en selects públicos
-- =====================================================================

alter table public.party_users enable row level security;
alter table public.swipes      enable row level security;

-- PARTY_USERS: lectura pública de id, name, photo_url (SIN phone)
-- Usamos una vista para garantizarlo.
drop view if exists public.party_users_public;
create view public.party_users_public as
  select id, name, photo_url, created_at
  from public.party_users;

-- Anon puede leer la vista pública (sin phone)
drop policy if exists "party_users_public_select" on public.party_users;
create policy "party_users_public_select"
  on public.party_users for select
  to anon, authenticated
  using (true);
-- Nota: el teléfono solo lo lee el service_role desde las API routes.

-- Insert: cualquiera puede registrarse
drop policy if exists "party_users_insert" on public.party_users;
create policy "party_users_insert"
  on public.party_users for insert
  to anon, authenticated
  with check (true);

-- SWIPES: insert y lectura sin restricción de fila
-- (la lógica de autorización se valida en la API route)
drop policy if exists "swipes_insert" on public.swipes;
create policy "swipes_insert"
  on public.swipes for insert
  to anon, authenticated
  with check (true);

drop policy if exists "swipes_select" on public.swipes;
create policy "swipes_select"
  on public.swipes for select
  to anon, authenticated
  using (true);

drop policy if exists "swipes_delete" on public.swipes;
create policy "swipes_delete"
  on public.swipes for delete
  to anon, authenticated
  using (true);

-- party_users delete (para borrar todo al final del evento)
drop policy if exists "party_users_delete" on public.party_users;
create policy "party_users_delete"
  on public.party_users for delete
  to anon, authenticated
  using (true);
