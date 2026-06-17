-- Hire date (when the person started at the company), shown on their profile
-- and in the member directory. RLS unchanged — covered by the existing
-- self-update / read policies on profiles.

alter table public.profiles add column hire_date date;
