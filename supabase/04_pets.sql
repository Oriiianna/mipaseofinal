-- =========================================================
-- 04 · MASCOTAS
-- =========================================================

create table public.pets (
  id            bigint generated always as identity primary key,
  owner_id      uuid not null references public.owners (profile_id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 50),
  breed         text not null check (char_length(breed) between 1 and 100),
  age           smallint not null check (age between 0 and 30),
  weight_kg     numeric(4,1) not null check (weight_kg > 0 and weight_kg <= 100),
  photo_url     text,
  feeding_notes text not null default '' check (char_length(feeding_notes) <= 300),
  special_care  text not null default '' check (char_length(special_care) <= 300),
  is_sociable   boolean not null default true,
  needs_muzzle  boolean not null default false,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ¿La mascota es del usuario actual?
create function public.owns_pet(p_pet_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.pets
    where id = p_pet_id and owner_id = auth.uid()
  );
$$;

grant select, insert, update on public.pets to authenticated;
alter table public.pets enable row level security;

create policy "El dueño ve sus mascotas; el admin, todas"
  on public.pets for select to authenticated
  using (owner_id = auth.uid() or public.is_admin());

create policy "El dueño carga sus mascotas"
  on public.pets for insert to authenticated
  with check (owner_id = auth.uid());

create policy "El dueño edita sus mascotas"
  on public.pets for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());