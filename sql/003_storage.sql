-- =====================================================================
-- STORAGE - bucket "photos" público con políticas
-- Ejecutar DESPUÉS de crear manualmente el bucket en Storage > New bucket
-- Nombre del bucket: photos    |   Public: ON
-- =====================================================================

-- Lectura pública del bucket (modo visita)
drop policy if exists "Public read photos" on storage.objects;
create policy "Public read photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'photos');

-- Solo autenticados pueden subir, y solo dentro de su carpeta {auth.uid()}/...
drop policy if exists "Auth upload own folder" on storage.objects;
create policy "Auth upload own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Solo el dueño puede borrar sus objetos
drop policy if exists "Auth delete own" on storage.objects;
create policy "Auth delete own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
