-- =====================================================================
-- JAMBOO FIESTA - Schema mínimo (perfiles + fotos + likes)
-- Ejecutar en Supabase > SQL Editor (todo de una vez)
-- =====================================================================

-- 1. PROFILES (perfil básico vinculado a auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 2. PHOTOS (fotos subidas por usuarios)
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,           -- ruta dentro del bucket "photos"
  caption text,
  created_at timestamptz not null default now()
);
create index if not exists photos_created_at_idx on public.photos (created_at desc);
create index if not exists photos_user_id_idx on public.photos (user_id);

-- 3. LIKES (un usuario solo puede dar like una vez a una foto)
create table if not exists public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, photo_id)
);
create index if not exists likes_photo_id_idx on public.likes (photo_id);

-- 4. VISTA agregada para mostrar fotos + nº de likes
create or replace view public.photos_with_stats as
select
  p.id,
  p.user_id,
  p.storage_path,
  p.caption,
  p.created_at,
  pr.name as author_name,
  pr.avatar_url as author_avatar,
  coalesce((select count(*) from public.likes l where l.photo_id = p.id), 0) as likes_count
from public.photos p
join public.profiles pr on pr.id = p.user_id;

-- 5. TRIGGER: al crearse un usuario en auth.users, crear su fila en profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
