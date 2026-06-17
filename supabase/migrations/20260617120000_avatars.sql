-- Profile photos.
--
-- Adds profiles.avatar_url and a public "avatars" storage bucket. Files live
-- under a per-user folder (<user_id>/...) so RLS can scope writes to the owner.
-- Images are publicly readable (the bucket is public); only the owner can
-- upload/replace/remove their own.

alter table public.profiles add column avatar_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Public read (the bucket is public anyway; explicit for clarity).
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Owner-only writes: the first path segment must be the user's id.
create policy "avatars_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
