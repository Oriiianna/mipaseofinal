-- 01 · CATÁLOGOS
-- Datos fijos que usan las demás tablas: barrios y franjas.

-- Barrios de CABA
create table public.neighborhoods (
  id   smallint generated always as identity primary key,
  name text not null unique
);

-- Franjas horarias de paseo
create table public.time_slots (
  id         smallint primary key,
  name       text not null unique,
  start_time time not null,
  end_time   time not null,
  check (start_time < end_time)
);

insert into public.time_slots (id, name, start_time, end_time) values
  (1, 'Mañana', '07:00', '12:00'),
  (2, 'Tarde',  '12:00', '17:00'),
  (3, 'Noche',  '17:00', '21:00');

insert into public.neighborhoods (name) values
  ('Agronomía'), ('Almagro'), ('Balvanera'), ('Barracas'), ('Belgrano'),
  ('Boedo'), ('Caballito'), ('Chacarita'), ('Coghlan'), ('Colegiales'),
  ('Constitución'), ('Flores'), ('Floresta'), ('La Boca'), ('La Paternal'),
  ('Liniers'), ('Mataderos'), ('Monte Castro'), ('Monserrat'), ('Nueva Pompeya'),
  ('Núñez'), ('Palermo'), ('Parque Avellaneda'), ('Parque Chacabuco'), ('Parque Chas'),
  ('Parque Patricios'), ('Puerto Madero'), ('Recoleta'), ('Retiro'), ('Saavedra'),
  ('San Cristóbal'), ('San Nicolás'), ('San Telmo'), ('Vélez Sarsfield'), ('Versalles'),
  ('Villa Crespo'), ('Villa del Parque'), ('Villa Devoto'), ('Villa Gral. Mitre'), ('Villa Lugano'),
  ('Villa Luro'), ('Villa Ortúzar'), ('Villa Pueyrredón'), ('Villa Real'), ('Villa Riachuelo'),
  ('Villa Santa Rita'), ('Villa Soldati'), ('Villa Urquiza');

-- Permisos: los roles de la app pueden leer estas tablas
grant select on public.neighborhoods to anon, authenticated;
grant select on public.time_slots    to anon, authenticated;

-- RLS: activada siempre, aunque la tabla sea de solo lectura
alter table public.neighborhoods enable row level security;
alter table public.time_slots    enable row level security;

create policy "Cualquiera puede ver los barrios"
  on public.neighborhoods for select
  to anon, authenticated
  using (true);

create policy "Cualquiera puede ver las franjas"
  on public.time_slots for select
  to anon, authenticated
  using (true);