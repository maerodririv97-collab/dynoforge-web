// Función de servidor (Vercel) para lo que exige la secret key de Supabase:
// crear usuarios de Auth, cambiar correo/contraseña y borrarlos.
// Todo lo demás (talleres, equipos, versiones, perfiles) lo hace el navegador
// con la sesión del superadmin, protegido por RLS.
//
// Variables de entorno (Vercel → Settings → Environment Variables):
//   SUPABASE_URL, SUPABASE_SECRET_KEY   ← nunca con prefijo VITE_
//
// Un solo archivo a propósito: en Vercel con "type": "module" las
// importaciones relativas entre funciones dan problemas.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type Role = 'admin' | 'mechanic';

interface CreateBody {
  action: 'create';
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  role: Role;
  workshop_id: string | null;
}

interface UpdateAuthBody {
  action: 'update_auth';
  user_id: string;
  email?: string;
  password?: string;
}

interface DeleteBody {
  action: 'delete';
  user_id: string;
}

type Body = CreateBody | UpdateAuthBody | DeleteBody;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function adminClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('Faltan SUPABASE_URL / SUPABASE_SECRET_KEY en el servidor');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Devuelve el id del que llama si es superadmin activo; si no, null. */
async function requireSuperadmin(admin: SupabaseClient, req: VercelRequest): Promise<string | null> {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;

  const { data: profile } = await admin
    .from('profiles')
    .select('is_superadmin, is_active')
    .eq('id', data.user.id)
    .maybeSingle();

  return profile?.is_superadmin && profile.is_active ? data.user.id : null;
}

function validPassword(p: unknown): p is string {
  return typeof p === 'string' && p.length >= 8 && p.length <= 72;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  let admin: SupabaseClient;
  try {
    admin = adminClient();
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message });
  }

  const callerId = await requireSuperadmin(admin, req);
  if (!callerId) return res.status(403).json({ error: 'Solo el superadministrador' });

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as Body;

  try {
    switch (body?.action) {
      case 'create': {
        const email = String(body.email ?? '').trim().toLowerCase();
        if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Correo inválido' });
        if (!validPassword(body.password))
          return res.status(400).json({ error: 'La contraseña debe tener entre 8 y 72 caracteres' });
        if (body.role !== 'admin' && body.role !== 'mechanic')
          return res.status(400).json({ error: 'Rol inválido' });
        const isAdmin = body.role === 'admin'; // dueño de DynoForge: sin taller
        if (!isAdmin && !UUID_RE.test(String(body.workshop_id)))
          return res.status(400).json({ error: 'Taller inválido' });

        const { data: created, error: authErr } = await admin.auth.admin.createUser({
          email,
          password: body.password,
          email_confirm: true,
        });
        if (authErr || !created.user) {
          const msg = authErr?.message ?? 'No se pudo crear el usuario';
          const dup = /already|registered|exists/i.test(msg);
          return res.status(dup ? 409 : 400).json({ error: dup ? 'Ese correo ya existe' : msg });
        }

        const { error: profErr } = await admin.from('profiles').insert({
          id: created.user.id,
          email,
          workshop_id: isAdmin ? null : body.workshop_id,
          first_name: String(body.first_name ?? '').trim(),
          last_name: String(body.last_name ?? '').trim(),
          phone: body.phone ? String(body.phone).trim() : null,
          role: body.role,
        });
        if (profErr) {
          // Sin perfil el usuario no sirve: se deshace el alta en Auth.
          await admin.auth.admin.deleteUser(created.user.id);
          return res.status(400).json({ error: profErr.message });
        }
        return res.status(200).json({ id: created.user.id });
      }

      case 'update_auth': {
        if (!UUID_RE.test(String(body.user_id))) return res.status(400).json({ error: 'Usuario inválido' });
        const attrs: { email?: string; password?: string; email_confirm?: boolean } = {};
        if (body.email !== undefined) {
          const email = String(body.email).trim().toLowerCase();
          if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Correo inválido' });
          attrs.email = email;
          attrs.email_confirm = true;
        }
        if (body.password !== undefined) {
          if (!validPassword(body.password))
            return res.status(400).json({ error: 'La contraseña debe tener entre 8 y 72 caracteres' });
          attrs.password = body.password;
        }
        if (!attrs.email && !attrs.password) return res.status(400).json({ error: 'Nada que cambiar' });

        const { error } = await admin.auth.admin.updateUserById(body.user_id, attrs);
        if (error) return res.status(400).json({ error: error.message });

        if (attrs.email) {
          await admin.from('profiles').update({ email: attrs.email }).eq('id', body.user_id);
        }
        return res.status(200).json({ ok: true });
      }

      case 'delete': {
        if (!UUID_RE.test(String(body.user_id))) return res.status(400).json({ error: 'Usuario inválido' });
        if (body.user_id === callerId)
          return res.status(400).json({ error: 'No puedes borrar tu propio usuario' });
        const { error } = await admin.auth.admin.deleteUser(body.user_id); // borra el perfil en cascada
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ ok: true });
      }

      default:
        return res.status(400).json({ error: 'Acción desconocida' });
    }
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message });
  }
}
