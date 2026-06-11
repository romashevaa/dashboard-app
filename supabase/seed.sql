-- Local seed data for the Credentials feature. Runs on `supabase db reset`
-- (NOT on `db push`), so production stays empty until real data is entered.
-- Passwords here are obvious placeholders — this is sample content only.

with svc as (
  insert into public.services (name, url, icon_url, no_icon, category_note)
  values
    ('Webflow', 'https://webflow.com',
     'https://www.google.com/s2/favicons?domain=webflow.com&sz=64', false,
     'Please ask in the #shared-creds channel if someone''s using a Webflow account you need to log in to.'),
    ('UI8', 'https://ui8.net',
     'https://www.google.com/s2/favicons?domain=ui8.net&sz=64', false, null),
    ('Adobe Creative Cloud', 'https://adobe.com',
     'https://www.google.com/s2/favicons?domain=adobe.com&sz=64', false, null),
    ('Loom', 'https://loom.com',
     'https://www.google.com/s2/favicons?domain=loom.com&sz=64', false, null),
    ('Freepik', 'https://freepik.com',
     'https://www.google.com/s2/favicons?domain=freepik.com&sz=64', false, null)
  returning id, name
)
insert into public.credentials (service_id, account, username, password, note)
select svc.id, v.account, v.username, v.password, v.note
from svc
join (
  values
    ('Webflow', 'DevAccount',  'dev-webflow',  'dev-webflow-pw',  null),
    ('Webflow', 'ProAccount',  'pro-webflow',  'pro-webflow-pw',  null),
    ('Webflow', 'HexAccount',  'hex-webflow',  'hex-webflow-pw',  null),
    ('Webflow', 'HiWebfolks',  'hi-webflow',   'hi-webflow-pw',   null),
    ('Webflow', 'Marketing',   'mkt-webflow',  'mkt-webflow-pw',  null),
    ('UI8',                  null, 'usernameforui', 'ui8-pw',     null),
    ('Adobe Creative Cloud', null, 'usernameforui', 'adobe-pw',
     'Feel free to log out the oldest user.'),
    ('Loom',                 null, 'loomuser',      'loom-pw',    null),
    ('Freepik',              null, 'freepickuser',  'freepik-pw', null)
) as v(service, account, username, password, note)
  on v.service = svc.name;
