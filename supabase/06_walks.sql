-- =========================================================
-- 06 · PASEOS
-- =========================================================

create type public.walk_status as enum
  ('pending', 'accepted', 'rejected', 'cancelled', 'done', 'confirmed');

create table public.walks (
  id            bigint generated always as identity primary key,
  pet_id        bigint not null references public.pets (id) on delete cascade,
  walker_id     uuid   not null references public.walkers (profile_id) on delete cascade,
  scheduled_at  timestamptz not null
                check (extract(minute from scheduled_at) in (0, 30)
                       and extract(second from scheduled_at) = 0),
  notes         text not null default '' check (char_length(notes) <= 500),
  status        public.walk_status not null default 'pending',
  cancelled_by  uuid references public.profiles (id) on delete set null,
  cancel_reason text check (char_length(cancel_reason) <= 300),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index walks_walker_schedule_idx on public.walks (walker_id, scheduled_at);

grant select, insert, update on public.walks to authenticated;
alter table public.walks enable row level security;

create policy "Ven el paseo su dueño, su paseador y el admin"
  on public.walks for select to authenticated
  using (public.owns_pet(pet_id) or walker_id = auth.uid() or public.is_admin());

create policy "El dueño pide paseos para sus mascotas"
  on public.walks for insert to authenticated
  with check (public.owns_pet(pet_id));

create policy "Modifican el paseo su dueño, su paseador y el admin"
  on public.walks for update to authenticated
  using (public.owns_pet(pet_id) or walker_id = auth.uid() or public.is_admin());

  -- ---------------------------------------------------------
-- Reglas al pedir un paseo
-- ---------------------------------------------------------
create function public.validate_new_walk()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  local_start timestamp := new.scheduled_at at time zone 'America/Argentina/Buenos_Aires';
begin
  -- Desde el SQL Editor (sin sesión) no se aplican: sirve para cargar datos de prueba
  if auth.uid() is null then
    return new;
  end if;

  -- Todo paseo nace pendiente, sin datos de cancelación
  new.status        := 'pending';
  new.cancelled_by  := null;
  new.cancel_reason := null;

  if new.scheduled_at <= now() then
    raise exception 'El paseo tiene que ser en el futuro';
  end if;

  if not exists (select 1 from public.pets where id = new.pet_id and is_active) then
    raise exception 'La mascota no está disponible';
  end if;

  if exists (select 1 from public.profiles where id = auth.uid() and is_suspended) then
    raise exception 'Tu cuenta está suspendida';
  end if;

  if not exists (
    select 1
    from public.walkers w
    join public.profiles p on p.id = w.profile_id
    where w.profile_id = new.walker_id
      and not w.is_paused
      and not p.is_suspended
  ) then
    raise exception 'El paseador no está tomando paseos';
  end if;

  if not exists (
    select 1
    from public.walker_availability a
    join public.time_slots s on s.id = a.time_slot_id
    where a.walker_id = new.walker_id
      and a.weekday = extract(isodow from local_start)
      and local_start::time >= s.start_time
      and local_start::time <= s.end_time - interval '60 minutes'
  ) then
    raise exception 'El paseador no trabaja en ese día y horario';
  end if;

  return new;
end;
$$;

create trigger validate_new_walk
  before insert on public.walks
  for each row execute function public.validate_new_walk();
  
  -- ---------------------------------------------------------
-- Reglas al cambiar el estado de un paseo
-- ---------------------------------------------------------
create function public.validate_walk_update()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  by_walker boolean     := old.walker_id = auth.uid();
  by_owner  boolean     := public.owns_pet(old.pet_id);
  by_admin  boolean     := public.is_admin();
  walk_end  timestamptz := old.scheduled_at + interval '60 minutes';
begin
  if auth.uid() is null then
    return new;
  end if;

  -- Lo único que se puede cambiar es el estado
  if (new.pet_id, new.walker_id, new.scheduled_at, new.notes, new.created_at)
     is distinct from
     (old.pet_id, old.walker_id, old.scheduled_at, old.notes, old.created_at) then
    raise exception 'Solo se puede cambiar el estado del paseo';
  end if;

  if new.status = old.status then
    raise exception 'El paseo ya está en ese estado';
  end if;

  if not by_admin and exists (
    select 1 from public.profiles where id = auth.uid() and is_suspended
  ) then
    raise exception 'Tu cuenta está suspendida';
  end if;

  new.updated_at    := now();
  new.cancelled_by  := null;
  new.cancel_reason := case when new.status = 'cancelled' then trim(new.cancel_reason) end;

  -- Aceptar o rechazar: solo el paseador
  if old.status = 'pending' and new.status in ('accepted', 'rejected') then
    if not by_walker then
      raise exception 'Solo el paseador puede aceptar o rechazar';
    end if;
    if now() >= old.scheduled_at then
      raise exception 'El horario de este paseo ya pasó';
    end if;
    if new.status = 'accepted' and exists (
      select 1 from public.walks w
      where w.walker_id = old.walker_id
        and w.id <> old.id
        and w.status = 'accepted'
        and w.scheduled_at > old.scheduled_at - interval '60 minutes'
        and w.scheduled_at < old.scheduled_at + interval '60 minutes'
    ) then
      raise exception 'Ya tenés un paseo aceptado que se superpone con este horario';
    end if;

  -- Cancelar: dueño, paseador o admin, con motivo y antes de que empiece
  elsif old.status in ('pending', 'accepted') and new.status = 'cancelled' then
    if not (by_walker or by_owner or by_admin) then
      raise exception 'No podés cancelar este paseo';
    end if;
    if coalesce(new.cancel_reason, '') = '' then
      raise exception 'Indicá el motivo de la cancelación';
    end if;
    if now() >= old.scheduled_at then
      raise exception 'El paseo ya empezó, no se puede cancelar';
    end if;
    new.cancelled_by := auth.uid();

  -- Marcar realizado: solo el paseador, después de que termine
  elsif old.status = 'accepted' and new.status = 'done' then
    if not by_walker then
      raise exception 'Solo el paseador puede marcar el paseo como realizado';
    end if;
        if walk_end > now() then
      raise exception 'Todavía no terminó el horario del paseo';
    end if;

  -- Confirmar: solo el dueño
  elsif old.status = 'done' and new.status = 'confirmed' then
    if not by_owner then
      raise exception 'Solo el dueño puede confirmar el paseo';
    end if;

  else
    raise exception 'No se puede pasar de % a %', old.status, new.status;
  end if;

  return new;
end;
$$;

create trigger validate_walk_update
  before update on public.walks
  for each row execute function public.validate_walk_update();