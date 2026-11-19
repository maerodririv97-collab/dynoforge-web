-- =============================================================================
-- DynoForge · El rol 'admin' (Administrador) ES el superadministrador.
-- Correr en Supabase → SQL Editor DESPUÉS de las migraciones de fase 1 y 2.
--
-- Los talleres no tienen administradores: el único Administrador es el dueño
-- de DynoForge. Para que rol e is_superadmin nunca se contradigan, un trigger
-- deriva is_superadmin del rol. Así todo lo que ya usa is_superadmin (RLS,
-- bucket de instaladores, RPC del panel, check_access de la app de escritorio)
-- funciona igual para el Administrador, y no necesita taller.
-- =============================================================================

-- 1) Alinear los datos actuales (el superadmin inicial ya tiene role = 'admin').
update public.profiles set role = 'admin' where is_superadmin and role <> 'admin';
update public.profiles set is_superadmin = (role = 'admin')
 where is_superadmin is distinct from (role = 'admin');

-- 2) De aquí en adelante, is_superadmin sale siempre del rol.
create or replace function public.profiles_sync_superadmin()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.is_superadmin := (new.role = 'admin');
  return new;
end;
$$;

drop trigger if exists trg_profiles_sync_superadmin on public.profiles;
create trigger trg_profiles_sync_superadmin
  before insert or update of role, is_superadmin on public.profiles
  for each row execute function public.profiles_sync_superadmin();
