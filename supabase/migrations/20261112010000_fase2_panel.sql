-- =============================================================================
-- DynoForge · Fase 2: soporte para el panel web
-- Correr en Supabase → SQL Editor DESPUÉS de 20261112000000_fase1_usuarios_nube.sql
-- =============================================================================

-- 1) Correo visible en el perfil (auth.users no se puede leer desde el navegador).
--    Lo escribe el panel (servidor) al crear o cambiar el correo de un usuario.
alter table public.profiles add column if not exists email text;

update public.profiles p
   set email = u.email
  from auth.users u
 where u.id = p.id and p.email is distinct from u.email;

create unique index if not exists uq_profiles_email on public.profiles (lower(email));


-- 2) Marcar la versión vigente en un solo paso (desmarca la anterior).
create or replace function public.set_current_release(p_version text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_superadmin() then
    raise exception 'Solo el superadministrador puede publicar versiones'
      using errcode = '42501';
  end if;

  if not exists (select 1 from public.app_releases where version = p_version) then
    raise exception 'La versión % no existe', p_version;
  end if;

  update public.app_releases set is_current = false where is_current and version <> p_version;
  update public.app_releases set is_current = true  where version = p_version;
end;
$$;

revoke all on function public.set_current_release(text) from public, anon;
grant execute on function public.set_current_release(text) to authenticated;


-- 3) Regenerar el código de registro de un taller (si se filtró).
create or replace function public.regenerate_registration_code(p_workshop_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
begin
  if not public.is_superadmin() then
    raise exception 'Solo el superadministrador' using errcode = '42501';
  end if;

  v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  update public.workshops set registration_code = v_code where id = p_workshop_id;
  return v_code;
end;
$$;

revoke all on function public.regenerate_registration_code(uuid) from public, anon;
grant execute on function public.regenerate_registration_code(uuid) to authenticated;
