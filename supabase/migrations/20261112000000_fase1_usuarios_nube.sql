-- =============================================================================
-- DynoForge · Fase 1: usuarios y acceso en la nube (multi-taller)
-- Plan: docs/PLAN_Usuarios_Nube.md
--
-- Cómo aplicarlo: Supabase → SQL Editor → pegar todo → Run.
-- Es idempotente en lo posible (IF NOT EXISTS / OR REPLACE / ON CONFLICT), pero
-- está pensado para correrse UNA vez sobre un proyecto nuevo.
--
-- Reglas de seguridad:
--   * La app de escritorio usa solo la `anon` key + la sesión del usuario.
--   * Toda escritura de talleres/usuarios/equipos/versiones la hace el superadmin
--     (panel web). Los usuarios normales solo LEEN lo de su taller.
--   * Los usuarios de Auth los crea el panel con la service_role (en el servidor
--     de Vercel, nunca en el navegador ni en la app). El registro público de
--     Auth debe quedar DESACTIVADO (ver instrucciones al final).
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Utilidad: updated_at automático
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- -----------------------------------------------------------------------------
-- Talleres
-- -----------------------------------------------------------------------------
create table if not exists public.workshops (
  id                uuid primary key default gen_random_uuid(),
  name              text not null check (length(trim(name)) between 1 and 120),
  city              text,
  contact           text,
  -- Código que se escribe en la app al registrar un equipo nuevo (8 caracteres).
  registration_code text not null unique
                    default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

drop trigger if exists trg_workshops_updated_at on public.workshops;
create trigger trg_workshops_updated_at
  before update on public.workshops
  for each row execute function public.set_updated_at();


-- -----------------------------------------------------------------------------
-- Perfiles (1 a 1 con auth.users)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  workshop_id   uuid references public.workshops (id) on delete restrict,
  first_name    text not null default '',
  last_name     text not null default '',
  phone         text,
  role          text not null default 'mechanic' check (role in ('admin', 'mechanic')),
  is_active     boolean not null default true,
  is_superadmin boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Todo usuario que no sea superadmin pertenece a un taller.
  constraint profiles_workshop_required check (is_superadmin or workshop_id is not null)
);

create index if not exists idx_profiles_workshop on public.profiles (workshop_id);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();


-- -----------------------------------------------------------------------------
-- Equipos (PCs con la app instalada)
-- -----------------------------------------------------------------------------
create table if not exists public.devices (
  id           uuid primary key default gen_random_uuid(),
  workshop_id  uuid not null references public.workshops (id) on delete cascade,
  name         text not null check (length(trim(name)) between 1 and 120),
  machine_id   text not null unique check (length(machine_id) between 8 and 128),
  app_version  text,
  -- pending: registrado, esperando autorización · authorized · blocked
  status       text not null default 'pending'
               check (status in ('pending', 'authorized', 'blocked')),
  last_seen_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_devices_workshop on public.devices (workshop_id);

drop trigger if exists trg_devices_updated_at on public.devices;
create trigger trg_devices_updated_at
  before update on public.devices
  for each row execute function public.set_updated_at();


-- -----------------------------------------------------------------------------
-- Versiones del instalador
-- -----------------------------------------------------------------------------
create table if not exists public.app_releases (
  version      text primary key check (version ~ '^\d+\.\d+\.\d+$'),
  file_path    text not null,          -- ruta dentro del bucket `installers`
  notes        text,
  published_at timestamptz not null default now(),
  is_current   boolean not null default false
);

-- Solo una versión vigente a la vez.
create unique index if not exists uq_app_releases_current
  on public.app_releases (is_current) where is_current;


-- -----------------------------------------------------------------------------
-- Funciones auxiliares para RLS (SECURITY DEFINER para no recursar en profiles)
-- -----------------------------------------------------------------------------
create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_superadmin and p.is_active
  );
$$;

create or replace function public.my_workshop_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.workshop_id from public.profiles p
  where p.id = auth.uid() and p.is_active;
$$;

-- Usuario activo y, si no es superadmin, con taller activo.
create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    left join public.workshops w on w.id = p.workshop_id
    where p.id = auth.uid()
      and p.is_active
      and (p.is_superadmin or coalesce(w.is_active, false))
  );
$$;

revoke all on function public.is_superadmin()   from public, anon;
revoke all on function public.my_workshop_id()  from public, anon;
revoke all on function public.is_active_user()  from public, anon;
grant execute on function public.is_superadmin()  to authenticated;
grant execute on function public.my_workshop_id() to authenticated;
grant execute on function public.is_active_user() to authenticated;


-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.workshops    enable row level security;
alter table public.profiles     enable row level security;
alter table public.devices      enable row level security;
alter table public.app_releases enable row level security;

-- workshops: cada uno ve su taller; superadmin ve y escribe todo.
drop policy if exists workshops_select on public.workshops;
create policy workshops_select on public.workshops
  for select to authenticated
  using (id = public.my_workshop_id() or public.is_superadmin());

drop policy if exists workshops_write on public.workshops;
create policy workshops_write on public.workshops
  for all to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- profiles: su propio perfil + los de su taller; solo superadmin escribe.
-- (No hay política de UPDATE para usuarios normales → nadie se sube el rol.)
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or workshop_id = public.my_workshop_id()
    or public.is_superadmin()
  );

drop policy if exists profiles_write on public.profiles;
create policy profiles_write on public.profiles
  for all to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- devices: ven los de su taller; el alta la hace register_device(); el resto, superadmin.
drop policy if exists devices_select on public.devices;
create policy devices_select on public.devices
  for select to authenticated
  using (workshop_id = public.my_workshop_id() or public.is_superadmin());

drop policy if exists devices_write on public.devices;
create policy devices_write on public.devices
  for all to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- app_releases: cualquier usuario activo las lee; solo superadmin escribe.
drop policy if exists app_releases_select on public.app_releases;
create policy app_releases_select on public.app_releases
  for select to authenticated
  using (public.is_active_user());

drop policy if exists app_releases_write on public.app_releases;
create policy app_releases_write on public.app_releases
  for all to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());


-- -----------------------------------------------------------------------------
-- RPC: registro de equipo (se llama ANTES del login, con la anon key)
--   Devuelve: 'pending' | 'authorized' | 'blocked' | 'invalid_code'
--   Si la PC ya estaba registrada, devuelve su estado actual sin moverla de taller.
-- -----------------------------------------------------------------------------
create or replace function public.register_device(
  p_registration_code text,
  p_machine_id        text,
  p_name              text,
  p_app_version       text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_workshop_id uuid;
  v_status      text;
begin
  if p_machine_id is null or length(p_machine_id) not between 8 and 128 then
    return 'invalid_code';
  end if;

  select d.status into v_status
  from public.devices d
  where d.machine_id = p_machine_id;

  if found then
    return v_status;
  end if;

  select w.id into v_workshop_id
  from public.workshops w
  where w.registration_code = upper(trim(p_registration_code))
    and w.is_active;

  if v_workshop_id is null then
    return 'invalid_code';
  end if;

  insert into public.devices (workshop_id, name, machine_id, app_version)
  values (
    v_workshop_id,
    left(coalesce(nullif(trim(p_name), ''), 'PC sin nombre'), 120),
    p_machine_id,
    left(p_app_version, 32)
  );

  return 'pending';
end;
$$;

revoke all on function public.register_device(text, text, text, text) from public;
grant execute on function public.register_device(text, text, text, text) to anon, authenticated;


-- -----------------------------------------------------------------------------
-- RPC: verificación de acceso justo después del login (con la sesión del usuario)
--   Comprueba usuario, taller y equipo; actualiza last_seen_at y app_version.
--   La app guarda la respuesta para el respaldo sin internet.
--   reason: ok | no_profile | user_inactive | workshop_inactive |
--           device_unknown | device_other_workshop | device_pending | device_blocked
-- -----------------------------------------------------------------------------
create or replace function public.check_access(
  p_machine_id  text,
  p_app_version text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile  public.profiles%rowtype;
  v_workshop public.workshops%rowtype;
  v_device   public.devices%rowtype;
  v_reason   text := 'ok';
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'no_profile');
  end if;

  if not v_profile.is_active then
    return jsonb_build_object('ok', false, 'reason', 'user_inactive');
  end if;

  if v_profile.workshop_id is not null then
    select * into v_workshop from public.workshops where id = v_profile.workshop_id;
    if not v_workshop.is_active and not v_profile.is_superadmin then
      return jsonb_build_object('ok', false, 'reason', 'workshop_inactive');
    end if;
  end if;

  select * into v_device from public.devices where machine_id = p_machine_id;

  if not found then
    v_reason := 'device_unknown';
  elsif v_device.workshop_id is distinct from v_profile.workshop_id
        and not v_profile.is_superadmin then
    v_reason := 'device_other_workshop';
  elsif v_device.status = 'pending' then
    v_reason := 'device_pending';
  elsif v_device.status = 'blocked' then
    v_reason := 'device_blocked';
  end if;

  -- Superadmin entra en cualquier PC registrada (soporte), salvo bloqueada.
  if v_profile.is_superadmin and v_reason in ('device_other_workshop', 'device_pending') then
    v_reason := 'ok';
  end if;

  if v_device.id is not null then
    update public.devices
       set last_seen_at = now(),
           app_version  = coalesce(left(p_app_version, 32), app_version)
     where id = v_device.id;
  end if;

  return jsonb_build_object(
    'ok',            v_reason = 'ok',
    'reason',        v_reason,
    'server_time',   now(),
    'profile', jsonb_build_object(
      'id',            v_profile.id,
      'first_name',    v_profile.first_name,
      'last_name',     v_profile.last_name,
      'phone',         v_profile.phone,
      'role',          v_profile.role,
      'is_superadmin', v_profile.is_superadmin
    ),
    'workshop', case when v_workshop.id is null then null else jsonb_build_object(
      'id',   v_workshop.id,
      'name', v_workshop.name,
      'city', v_workshop.city
    ) end,
    'device', case when v_device.id is null then null else jsonb_build_object(
      'id',     v_device.id,
      'name',   v_device.name,
      'status', v_device.status
    ) end
  );
end;
$$;

revoke all on function public.check_access(text, text) from public, anon;
grant execute on function public.check_access(text, text) to authenticated;


-- -----------------------------------------------------------------------------
-- Storage: bucket PRIVADO de instaladores
--   Límite 50 MB por archivo (máximo del plan Free). Descarga solo por enlace
--   firmado (createSignedUrl), que exige permiso de SELECT → usuarios activos.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('installers', 'installers', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists installers_read on storage.objects;
create policy installers_read on storage.objects
  for select to authenticated
  using (bucket_id = 'installers' and public.is_active_user());

drop policy if exists installers_insert on storage.objects;
create policy installers_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'installers' and public.is_superadmin());

drop policy if exists installers_update on storage.objects;
create policy installers_update on storage.objects
  for update to authenticated
  using (bucket_id = 'installers' and public.is_superadmin())
  with check (bucket_id = 'installers' and public.is_superadmin());

drop policy if exists installers_delete on storage.objects;
create policy installers_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'installers' and public.is_superadmin());


-- =============================================================================
-- DESPUÉS DE CORRER ESTE SCRIPT (a mano, una sola vez)
-- =============================================================================
-- 1) Authentication → Sign In / Providers → desactivar "Allow new users to sign up".
--    (Los usuarios los crea solo el panel. Si queda abierto, cualquiera con la
--    anon key podría crearse una cuenta; no tendría perfil ni acceso, pero mejor cerrado.)
--
-- 2) Crear tu usuario superadmin:
--    Authentication → Users → Add user → tu correo + contraseña (Auto Confirm).
--    Luego, en el SQL Editor (cambia el correo):
--
--    insert into public.profiles (id, first_name, last_name, role, is_superadmin)
--    select id, 'Tu nombre', 'Tu apellido', 'admin', true
--    from auth.users where email = 'TU_CORREO_AQUI';
--
-- 3) Taller de prueba:
--    insert into public.workshops (name, city) values ('Taller Piloto', 'Ciudad')
--    returning id, registration_code;
-- =============================================================================
