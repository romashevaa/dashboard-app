-- Extra social handles for member profiles (telegram already exists). Stored as
-- a handle or full URL; the app builds the link. RLS unchanged.

alter table public.profiles
  add column linkedin text,
  add column dribbble text,
  add column behance  text;
