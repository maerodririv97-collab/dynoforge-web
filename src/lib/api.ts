import { supabase, type Role } from './supabase';

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sesión vencida, vuelve a entrar');

  const res = await fetch('/api/admin-users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Error ${res.status}`);
  return json as T;
}

export const adminUsers = {
  create: (u: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    role: Role;
    workshop_id: string;
  }) => call<{ id: string }>({ action: 'create', ...u }),

  updateAuth: (user_id: string, changes: { email?: string; password?: string }) =>
    call<{ ok: true }>({ action: 'update_auth', user_id, ...changes }),

  remove: (user_id: string) => call<{ ok: true }>({ action: 'delete', user_id }),
};

/** Contraseña temporal legible (sin 0/O/1/l). */
export function generatePassword(len = 12): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  return Array.from(buf, (n) => chars[n % chars.length]).join('');
}
