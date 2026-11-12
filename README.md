# DynoForge · Panel web

Panel de administración (solo superadmin) y página de descargas (cualquier usuario activo).
Plan completo: `../docs/PLAN_Usuarios_Nube.md`.

| Ruta | Quién | Qué |
|---|---|---|
| `/talleres` | superadmin | Crear/editar/desactivar talleres, código de registro de PCs |
| `/usuarios` | superadmin | Crear usuarios (contraseña inicial), rol, taller, activar/desactivar, cambiar contraseña, borrar |
| `/equipos` | superadmin | PCs registradas: autorizar, bloquear, renombrar, quitar |
| `/versiones` | superadmin | Subir instalador (bucket privado), marcar vigente |
| `/descargas` | todos | Descarga de la versión vigente con enlace firmado de 10 min |

## Antes de desplegar (Supabase)
1. SQL Editor → correr `../supabase/migrations/20261112010000_fase2_panel.sql`.
2. Authentication → URL Configuration:
   - **Site URL**: la URL de Vercel (ej. `https://dynoforge-panel.vercel.app`).
   - **Redirect URLs**: agregar `https://<tu-dominio>/restablecer` y `http://localhost:5180/restablecer`.

## Desplegar en Vercel
1. New Project → importar el repo de GitHub.
2. **Root Directory: `admin-panel`** (Framework: Vite, se detecta solo).
3. Environment Variables:
   - `VITE_SUPABASE_URL` = `https://nwjghirjgipozcvnxhak.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = la `sb_publishable_…`
   - `SUPABASE_URL` = igual que arriba
   - `SUPABASE_SECRET_KEY` = la `sb_secret_…` (Supabase → Settings → API Keys). **Solo aquí**, nunca en la app ni en el repo.
4. Deploy.

## Desarrollo local
```
npm install
npm run dev          # http://localhost:5180 — todo menos crear/borrar usuarios y cambiar contraseñas
npx vercel dev       # incluye la función /api/admin-users (pide .env.local con SUPABASE_SECRET_KEY)
```

## Notas
- Los usuarios se crean con contraseña inicial (no por invitación): el correo integrado de
  Supabase permite muy pocos envíos por hora. «¿Olvidaste tu contraseña?» sí usa correo.
- Desactivar un usuario o taller le quita el acceso en el panel y en la app (`check_access`).
- Borrar un equipo obliga a esa PC a registrarse de nuevo con el código del taller.
