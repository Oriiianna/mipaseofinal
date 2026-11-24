-- =========================================================
-- 07 · RESEÑAS
-- =========================================================

create table public.reviews (
  id         bigint generated always as identity primary key,
  walk_id    bigint not null unique references public.walks (id) on delete cascade,
  rating     smallint not null check (rating between 1 and 5),
  comment    text not null default '' check (char_length(comment) <= 500),
  created_at timestamptz not null default now()
);

grant select, insert, delete on public.reviews to authenticated;
alter table public.reviews enable row level security;

create policy "Ven la reseña quienes pueden ver el paseo"
  on public.reviews for select to authenticated
  using (exists (select 1 from public.walks w where w.id = reviews.walk_id));

create policy "El dueño reseña sus paseos confirmados"
  on public.reviews for insert to authenticated
  with check (exists (
    select 1 from public.walks w
    where w.id = walk_id
      and w.status = 'confirmed'
      and public.owns_pet(w.pet_id)
  ));

create policy "El admin borra reseñas"
  on public.reviews for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------
-- Reseñas públicas de un paseador
-- ---------------------------------------------------------
create function public.get_walker_reviews(p_walker_id uuid)
returns table (id bigint, rating smallint, comment text, created_at timestamptz,
               owner_name text, pet_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.rating, r.comment, r.created_at, pr.full_name, p.name
  from public.reviews r
  join public.walks w     on w.id = r.walk_id
  join public.pets p      on p.id = w.pet_id
  join public.profiles pr on pr.id = p.owner_id
  where w.walker_id = p_walker_id
  order by r.created_at desc;
$$;

-- ---------------------------------------------------------
-- Promedio y cantidad de reseñas de cada paseador
-- ---------------------------------------------------------
create function public.get_walker_ratings()
returns table (walker_id uuid, average numeric, total bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select w.walker_id, round(avg(r.rating), 1), count(*)
  from public.reviews r
  join public.walks w on w.id = r.walk_id
  group by w.walker_id;
$$;

revoke execute on function public.get_walker_reviews(uuid) from public, anon;
revoke execute on function public.get_walker_ratings()     from public, anon;
grant  execute on function public.get_walker_reviews(uuid) to authenticated;
grant  execute on function public.get_walker_ratings()     to authenticated;