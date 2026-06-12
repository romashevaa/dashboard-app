-- Some services are entered with just an email/login (magic link, SSO, etc.)
-- and have no password to store. Allow credentials.password to be null so an
-- admin can save a login on its own. (Plain-text storage decision unchanged.)

alter table public.credentials alter column password drop not null;
