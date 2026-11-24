-- =========================================================
-- 08 · LO QUE VE EL PASEADOR DE SUS PASEOS
-- =========================================================
create policy "El paseador ve las mascotas de sus paseos" on public.pets for
select
    to authenticated using (
        exists (
            select
                1
            from
                public.walks w
            where
                w.pet_id = pets.id
                and w.walker_id = auth.uid ()
        )
    );

create policy "El paseador ve los dueños de sus paseos" on public.owners for
select
    to authenticated using (
        exists (
            select
                1
            from
                public.walks w
                join public.pets p on p.id = w.pet_id
            where
                p.owner_id = owners.profile_id
                and w.walker_id = auth.uid ()
        )
    );