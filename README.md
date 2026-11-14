# DynoForge · Sitio web y panel

Sitio público de la marca + panel de administración (superadmin) y descargas (cualquier usuario activo).
Plan completo: `docs/PLAN_Usuarios_Nube.md` en el repo de la app de escritorio (DynoForge, Bitbucket).
El esquema de Supabase vive en `supabase/migrations/` (la app de escritorio usa `register_device` y `check_access`).

## Sitio público
| Ruta | Qué |
|---|---|
| `/` | Inicio: información de la empresa, líneas de equipos, software |
| `/productos` | Líneas de dinamómetros (motos, carros, karts) |
| `/galeria` | Galería de fotos con filtros y visor |
| `/fichas-tecnicas` | Descarga de fichas técnicas en PDF |
| `/contacto` | Datos de contacto y formulario que abre WhatsApp |
| `/login` | Entrada al panel |

**Todo el contenido editable está en `src/site/content.ts`**: número de WhatsApp, correo, textos de cada
línea, lista de fotos y fichas.
- Fotos: copiarlas a `public/img/galeria/` y agregarlas a `GALLERY`.
- Fichas: copiar el PDF a `public/fichas/` y poner su ruta en `file` (mientras sea `null`, el botón ofrece pedirla por WhatsApp).

## Panel (requiere sesión)
| Ruta | Quién | Qué |
|---|---|---|
| `/panel/talleres` | superadmin | Crear/editar/desactivar talleres, código de registro de PCs |
| `/panel/usuarios` | superadmin | Crear usuarios (contraseña inicial), rol, taller, activar/desactivar, cambiar contraseña, borrar |
| `/panel/equipos` | superadmin | PCs registradas: autorizar, bloquear, renombrar, quitar |
| `/panel/versiones` | superadmin | Subir instalador (bucket privado), marcar vigente |
| `/panel/descargas` | todos | Descarga de la versión vigente con enlace firmado de 10 min |

Las rutas viejas (`/talleres`, `/usuarios`, …) redirigen a su equivalente en `/panel/`.

## Antes de desplegar (Supabase)
1. SQL Editor → correr `supabase/migrations/20261112010000_fase2_panel.sql`.
2. Authentication → URL Configuration:
   - **Site URL**: la URL de Vercel (ej. `https://dynoforge-panel.vercel.app`).
   - **Redirect URLs**: agregar `https://<tu-dominio>/restablecer` y `http://localhost:5180/restablecer`.

## Desplegar en Vercel
1. New Project → importar `dynoforge-web` desde GitHub.
2. Framework: Vite (se detecta solo). Root Directory: la raíz del repo.
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
