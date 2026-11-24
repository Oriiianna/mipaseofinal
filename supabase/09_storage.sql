-- =========================================================
-- 09 · STORAGE: FOTOS DE PERFIL Y DE MASCOTAS
-- Cada usuario guarda sus archivos en una carpeta con su id:
--   avatars/<user_id>/foto.jpg   ·   pets/<user_id>/12.jpg
-- =========================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('pets',    'pets',    true, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Cada usuario ve sus archivos"
  on storage.objects for select to authenticated
  using (bucket_id in ('avatars', 'pets')
         and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Cada usuario sube a su carpeta"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('avatars', 'pets')
              and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Cada usuario reemplaza sus archivos"
  on storage.objects for update to authenticated
  using (bucket_id in ('avatars', 'pets')
         and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Cada usuario borra sus archivos"
  on storage.objects for delete to authenticated
  using (bucket_id in ('avatars', 'pets')
         and (storage.foldername(name))[1] = auth.uid()::text);