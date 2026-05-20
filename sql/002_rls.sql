-- =====================================================================
-- ROW LEVEL SECURITY - modo visita (lectura pública, escritura autenticada)
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.photos   enable row level security;
alter table public.likes    enable row level security;

-- PROFILES ------------------------------------------------------------
-- Cualquiera (incluso anónimo) puede ver perfiles públicos
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  to anon, authenticated
  using (true);

-- Solo el dueño puede actualizar su perfil
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- PHOTOS --------------------------------------------------------------
-- Cualquiera puede ver las fotos (modo visita)
drop policy if exists "photos_select_all" on public.photos;
create policy "photos_select_all"
  on public.photos for select
  to anon, authenticated
  using (true);

-- Solo autenticados pueden subir sus propias fotos
drop policy if exists "photos_insert_own" on public.photos;
create policy "photos_insert_own"
  on public.photos for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Solo el dueño puede borrar sus fotos
drop policy if exists "photos_delete_own" on public.photos;
create policy "photos_delete_own"
  on public.photos for delete
  to authenticated
  using (auth.uid() = user_id);

-- LIKES ---------------------------------------------------------------
-- Cualquiera puede ver los likes (para mostrar contador)
drop policy if exists "likes_select_all" on public.likes;
create policy "likes_select_all"
  on public.likes for select
  to anon, authenticated
  using (true);

-- Solo autenticados pueden dar like en su nombre
drop policy if exists "likes_insert_own" on public.likes;
create policy "likes_insert_own"
  on public.likes for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Solo el dueño del like puede quitarlo
drop policy if exists "likes_delete_own" on public.likes;
create policy "likes_delete_own"
  on public.likes for delete
  to authenticated
  using (auth.uid() = user_id);
