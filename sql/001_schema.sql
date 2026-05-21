-- =====================================================================
-- JAMBOO FIESTA — Schema (party_users + swipes)
-- Ejecutar en Supabase > SQL Editor
-- =====================================================================

-- 1. PARTY_USERS: perfil mínimo de cada asistente
create table if not exists public.party_users (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,  -- PRIVADO: solo se revela en match
  photo_url  text,
  created_at timestamptz not null default now()
);

-- 2. SWIPES: likes y passes entre asistentes
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
