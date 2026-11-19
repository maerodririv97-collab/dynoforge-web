import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY (ver .env.example)');
}

export const supabase = createClient(url, key);

export const INSTALLERS_BUCKET = 'installers';

export type Role = 'admin' | 'mechanic';
export type DeviceStatus = 'pending' | 'authorized' | 'blocked';

export interface Workshop {
  id: string;
  name: string;
  city: string | null;
  contact: string | null;
  registration_code: string;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  workshop_id: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: Role;
  is_active: boolean;
  is_superadmin: boolean;
  created_at: string;
}

export interface Device {
  id: string;
  workshop_id: string;
  name: string;
  machine_id: string;
  app_version: string | null;
  status: DeviceStatus;
  last_seen_at: string | null;
  created_at: string;
}

export interface Release {
  version: string;
  file_path: string;
  notes: string | null;
  published_at: string;
  is_current: boolean;
}

export const ROLE_LABEL: Record<Role, string> = { admin: 'Administrador', mechanic: 'Técnico' };
export const DEVICE_STATUS_LABEL: Record<DeviceStatus, string> = {
  pending: 'Pendiente',
  authorized: 'Autorizado',
  blocked: 'Bloqueado',
};

/** Mensaje legible de un error de Supabase / fetch. */
export function errMsg(e: unknown): string {
  if (!e) return 'Error desconocido';
  if (typeof e === 'string') return e;
  const m = (e as { message?: string }).message ?? String(e);
  if (/duplicate key.*email/i.test(m)) return 'Ese correo ya existe';
  if (/duplicate key/i.test(m)) return 'Ya existe un registro con ese valor';
  if (/Invalid login credentials/i.test(m)) return 'Correo o contraseña incorrectos';
  if (/violates foreign key|restrict/i.test(m)) return 'No se puede borrar: tiene registros asociados';
  return m;
}
