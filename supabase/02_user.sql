-- 02 · USUARIOS
-- profiles: lo común a todos. owners y walkers: lo propio de cada rol.

create type public.user_role as enum ('owner', 'walker', 'admin');

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         public.user_role not null,
  full_name    text not null check (char_length(full_name) between 2 and 100),
  phone        text not null check (char_length(phone) between 6 and 20),
  avatar_url   text,
  is_suspended boolean not null default false,
  created_at   timestamptz not null default now()
);

create table public.owners (
  profile_id      uuid primary key references public.profiles (id) on delete cascade,
  address         text not null check (char_length(address) between 5 and 200),
  neighborhood_id smallint not null references public.neighborhoods (id)
);

create table public.walkers (
  profile_id       uuid primary key references public.profiles (id) on delete cascade,
  neighborhood_id  smallint not null references public.neighborhoods (id),
  experience_years smallint not null default 0 check (experience_years between 0 and 50),
  bio              text not null default '' check (char_length(bio) <= 500),
  is_paused        boolean not null default false
);

-- ¿El usuario actual es admin?
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Al registrarse: crea el perfil y la fila de dueño o paseador
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta     jsonb := new.raw_user_meta_data;
  new_role text  := meta ->> 'role';
begin
  if new_role is null or new_role not in ('owner', 'walker') then
    raise exception 'Rol inválido: tiene que ser owner o walker';
  end if;

  insert into public.profiles (id, role, full_name, phone)
  values (new.id, new_role::public.user_role, meta ->> 'full_name', meta ->> 'phone');

  if new_role = 'owner' then
    insert into public.owners (profile_id, address, neighborhood_id)
    values (new.id, meta ->> 'address', (meta ->> 'neighborhood_id')::smallint);
  else
    insert into public.walkers (profile_id, neighborhood_id, experience_years, bio)
    values (
      new.id,
      (meta ->> 'neighborhood_id')::smallint,
      coalesce((meta ->> 'experience_years')::smallint, 0),
      coalesce(meta ->> 'bio', '')
    );
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Nadie se cambia el rol ni se quita la suspensión (salvo el admin)
create function public.protect_profile_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (new.role is distinct from old.role
      or new.is_suspended is distinct from old.is_suspended)
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'No tenés permiso para cambiar el rol o la suspensión';
  end if;
  return new;
end;
$$;

create trigger protect_profile_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- Permisos y RLS
grant select, update on public.profiles to authenticated;
grant select, update on public.owners   to authenticated;
grant select, update on public.walkers  to authenticated;

alter table public.profiles enable row level security;
alter table public.owners   enable row level security;
alter table public.walkers  enable row level security;

-- profiles
create policy "Usuarios logueados ven los perfiles"
  on public.profiles for select to authenticated
  using (true);

create policy "Cada uno edita su perfil; el admin, todos"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- owners
create policy "El dueño ve sus datos; el admin, todos"
  on public.owners for select to authenticated
  using (profile_id = auth.uid() or public.is_admin());

create policy "El dueño edita sus datos"
  on public.owners for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- walkers
create policy "Usuarios logueados ven a los paseadores"
  on public.walkers for select to authenticated
  using (true);

create policy "El paseador edita sus datos"
  on public.walkers for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());