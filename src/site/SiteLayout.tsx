import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogIn, Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { COMPANY } from './content';
import { InstagramIcon } from './InstagramIcon';
import { WhatsAppIcon, whatsappUrl } from './whatsapp';
import logo from '../logo-dynoforge.png';

const NAV = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/productos', label: 'Equipos' },
  { to: '/galeria', label: 'Galería' },
  { to: '/fichas-tecnicas', label: 'Fichas técnicas' },
  { to: '/contacto', label: 'Contáctenos' },
];

export default function SiteLayout() {
  const { session } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setOpen(false);
  }, [pathname]);

  const loginLink = session ? (
    <Link
      to="/panel"
      className="inline-flex items-center gap-2 rounded-md border border-dark-4 bg-dark-3 px-3.5 py-2 text-sm font-medium hover:bg-dark-4"
    >
      <LayoutDashboard className="h-4 w-4" /> Ir al panel
    </Link>
  ) : (
    <Link
      to="/login"
      className="inline-flex items-center gap-2 rounded-md bg-red px-3.5 py-2 text-sm font-medium text-white shadow-[0_0_14px_rgba(229,35,43,0.35)] hover:bg-red-light"
    >
      <LogIn className="h-4 w-4" /> Iniciar sesión
    </Link>
  );

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition-colors ${isActive ? 'text-white' : 'text-muted-light hover:text-white'}`;

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-dark-3 bg-dark/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 md:px-6">
          <Link to="/" aria-label="DynoForge, inicio">
            <img src={logo} alt="DynoForge" className="h-7 w-auto md:h-8" />
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={navClass}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden lg:block">{loginLink}</div>
          <button className="lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menú" aria-expanded={open}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {open && (
          <nav className="flex flex-col gap-1 border-t border-dark-3 bg-dark px-4 pb-5 pt-3 lg:hidden">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2.5 text-sm ${isActive ? 'bg-red/15 text-white' : 'text-muted-light hover:bg-dark-3 hover:text-white'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <div className="mt-3">{loginLink}</div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-dark-3 bg-dark/80">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
          <div className="space-y-3">
            <img src={logo} alt="DynoForge" className="h-7 w-auto" />
            <p className="max-w-xs text-sm text-muted-light">
              Dinamómetros y software de medición de potencia para talleres, preparadores y equipos de competencia.
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-light">Sitio</p>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="text-muted-light hover:text-white">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to={session ? '/panel' : '/login'} className="text-muted-light hover:text-white">
                  {session ? 'Panel' : 'Iniciar sesión'}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-light">Contacto</p>
            <ul className="space-y-2 text-sm text-muted-light">
              <li>
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
                  <WhatsAppIcon className="h-4 w-4" /> {COMPANY.whatsappDisplay}
                </a>
              </li>
              <li>
                <a href={`tel:${COMPANY.phone}`} className="flex items-center gap-2 hover:text-white">
                  <Phone className="h-4 w-4" /> {COMPANY.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-2 hover:text-white">
                  <Mail className="h-4 w-4" /> {COMPANY.email}
                </a>
              </li>
              <li>
                <a href={COMPANY.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-white">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {COMPANY.address}
                </a>
              </li>
              {COMPANY.instagram && (
                <li>
                  <a href={COMPANY.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
                    <InstagramIcon className="h-4 w-4" /> {COMPANY.instagramHandle}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <p className="border-t border-dark-3 px-4 py-4 text-center text-xs text-muted">
          © {new Date().getFullYear()} {COMPANY.name}. Todos los derechos reservados.
        </p>
      </footer>

      {/* Botón flotante de WhatsApp */}
      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-black shadow-[0_6px_24px_rgba(37,211,102,0.45)] transition-transform hover:scale-105"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </div>
  );
}

/** Encabezado de sección para las páginas públicas. */
export function SectionTitle({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-light">{eyebrow}</p>}
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      {text && <p className="mt-3 text-muted-light">{text}</p>}
    </div>
  );
}

/** Cabecera de las páginas internas del sitio. */
export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="border-b border-dark-3">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-light">{eyebrow}</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-muted-light md:text-lg">{text}</p>
      </div>
    </section>
  );
}
