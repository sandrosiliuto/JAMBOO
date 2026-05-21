-- =====================================================================
-- JAMBOO FIESTA — Setup completo (ejecutar TODO de una vez)
-- =====================================================================

-- TABLAS
create table if not exists public.party_users (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  photo_url  text,
  created_at timestamptz not null default now()
);

create table if not exists public.swipes (
  id         uuid primary key default gen_random_uuid(),
  swiper_id  uuid not null references public.party_users(id) on delete cascade,
  swiped_id  uuid not null references public.party_users(id) on delete cascade,
  liked      boolean not null default false,
  created_at timestamptz not null default now(),
  unique(swiper_id, swiped_id)
);

create index if not exists swipes_swiper_idx on public.swipes(swiper_id);
create index if not exists swipes_swiped_idx on public.swipes(swiped_id);

-- RLS
alter table public.party_users enable row level security;
alter table public.swipes      enable row level security;

drop policy if exists "party_users_select" on public.party_users;
create policy "party_users_select" on public.party_users for select to anon, authenticated using (true);

drop policy if exists "party_users_insert" on public.party_users;
create policy "party_users_insert" on public.party_users for insert to anon, authenticated with check (true);

drop policy if exists "party_users_delete" on public.party_users;
create policy "party_users_delete" on public.party_users for delete to anon, authenticated using (true);

drop policy if exists "swipes_select" on public.swipes;
create policy "swipes_select" on public.swipes for select to anon, authenticated using (true);

drop policy if exists "swipes_insert" on public.swipes;
create policy "swipes_insert" on public.swipes for insert to anon, authenticated with check (true);

drop policy if exists "swipes_delete" on public.swipes;
create policy "swipes_delete" on public.swipes for delete to anon, authenticated using (true);
