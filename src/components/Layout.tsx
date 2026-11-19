import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Building2, Download, Globe, LogOut, Menu, Monitor, Package, Users, X } from 'lucide-react';
import { useAuth } from '../lib/auth';
import logo from '../logo-dynoforge.png';

const ADMIN_NAV = [
  { to: '/panel/talleres', label: 'Talleres', icon: Building2 },
  { to: '/panel/usuarios', label: 'Usuarios', icon: Users },
  { to: '/panel/equipos', label: 'Equipos', icon: Monitor },
  { to: '/panel/versiones', label: 'Versiones', icon: Package },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const nav = [...(profile?.is_superadmin ? ADMIN_NAV : []), { to: '/panel/descargas', label: 'Descargas', icon: Download }];

  const links = (
    <nav className="flex flex-col gap-1">
      {nav.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              isActive ? 'bg-red/15 text-white' : 'text-muted-light hover:bg-dark-3 hover:text-white'
            }`
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  const userBox = (
    <div className="border-t border-dark-3 pt-4">
      <p className="truncate text-sm font-medium">
        {profile ? `${profile.first_name} ${profile.last_name}`.trim() || profile.email : ''}
      </p>
      <p className="truncate text-xs text-muted-light">{profile?.is_superadmin ? 'Administrador' : profile?.email}</p>
      <Link to="/" className="mt-3 flex items-center gap-2 text-sm text-muted-light hover:text-white">
        <Globe className="h-4 w-4" /> Ver sitio web
      </Link>
      <button
        onClick={() => void signOut()}
        className="mt-2 flex items-center gap-2 text-sm text-muted-light hover:text-white"
      >
        <LogOut className="h-4 w-4" /> Cerrar sesión
      </button>
    </div>
  );

  return (
    <div className="flex min-h-full">
      {/* Escritorio */}
      <aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-dark-3 bg-dark/70 p-4 md:flex">
        <div className="space-y-6">
          <Link to="/">
            <img src={logo} alt="DynoForge" className="h-8 w-auto" />
          </Link>
          {links}
        </div>
        {userBox}
      </aside>

      {/* Celular */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-dark-3 bg-dark/95 px-4 py-3 md:hidden">
        <img src={logo} alt="DynoForge" className="h-6 w-auto" />
        <button onClick={() => setOpen((o) => !o)} aria-label="Menú">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-30 space-y-6 bg-dark p-4 pt-16 md:hidden">
          {links}
          {userBox}
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 pb-10 pt-20 md:px-8 md:pt-8">{children}</main>
    </div>
  );
}
