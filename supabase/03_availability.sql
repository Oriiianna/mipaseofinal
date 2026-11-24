-- =========================================================
-- 03 · DISPONIBILIDAD DEL PASEADOR
-- Cada fila = "este paseador trabaja este día en esta franja".
-- =========================================================

create table public.walker_availability (
  walker_id    uuid     not null references public.walkers (profile_id) on delete cascade,
  weekday      smallint not null check (weekday between 1 and 7),
  time_slot_id smallint not null references public.time_slots (id),
  primary key (walker_id, weekday, time_slot_id)
);

grant select, insert, delete on public.walker_availability to authenticated;
alter table public.walker_availability enable row level security;

create policy "Usuarios logueados ven la disponibilidad"
  on public.walker_availability for select to authenticated
  using (true);

create policy "El paseador agrega su disponibilidad"
  on public.walker_availability for insert to authenticated
  with check (walker_id = auth.uid());

create policy "El paseador quita su disponibilidad"
  on public.walker_availability for delete to authenticated
  using (walker_id = auth.uid());