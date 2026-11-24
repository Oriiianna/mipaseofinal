-- =========================================================
-- 05 · FRANJAS PREFERIDAS DE CADA MASCOTA
-- Cada fila = "esta mascota suele salir en esta franja".
-- =========================================================

create table public.pet_time_slots (
  pet_id       bigint   not null references public.pets (id) on delete cascade,
  time_slot_id smallint not null references public.time_slots (id),
  primary key (pet_id, time_slot_id)
);

grant select, insert, delete on public.pet_time_slots to authenticated;
alter table public.pet_time_slots enable row level security;

create policy "Ver las franjas de las mascotas que podés ver"
  on public.pet_time_slots for select to authenticated
  using (exists (select 1 from public.pets where pets.id = pet_time_slots.pet_id));

create policy "El dueño agrega franjas a sus mascotas"
  on public.pet_time_slots for insert to authenticated
  with check (public.owns_pet(pet_id));

create policy "El dueño quita franjas de sus mascotas"
  on public.pet_time_slots for delete to authenticated
  using (public.owns_pet(pet_id));