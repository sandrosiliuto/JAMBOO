-- =====================================================================
-- STORAGE — bucket "party-photos" (crear manualmente con Public: ON)
-- =====================================================================

-- Lectura pública
drop policy if exists "public read party-photos" on storage.objects;
create policy "public read party-photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'party-photos');

-- Cualquiera puede subir (la validación se hace en la API route)
drop policy if exists "upload party-photos" on storage.objects;
create policy "upload party-photos"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'party-photos');

-- Borrar (para el admin)
drop policy if exists "delete party-photos" on storage.objects;
create policy "delete party-photos"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'party-photos');
