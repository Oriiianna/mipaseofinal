-- =========================================================
-- 10 · ADMIN
-- El admin se registra desde la app como dueño y después
-- se le cambia el rol acá. Correr una sola vez.
-- =========================================================
update public.profiles
set
    role = 'admin'
where
    id = (
        select
            id
        from
            auth.users
        where
            email = 'admin@mipaseo.com'
    );

delete from public.owners
where
    profile_id = (
        select
            id
        from
            auth.users
        where
            email = 'admin@mipaseo.com'
    );