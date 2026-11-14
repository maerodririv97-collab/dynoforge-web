import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gauge, LineChart, ShieldCheck, ThermometerSun, Users, Wrench } from 'lucide-react';
import { EQUIPMENT, SOFTWARE_FEATURES } from '../content';
import { SectionTitle } from '../SiteLayout';
import { WhatsAppButton } from '../whatsapp';

const STATS = [
  { value: '3', label: 'líneas de banco: motos, carros y karts' },
  { value: '250 Hz', label: 'adquisición de datos del hardware' },
  { value: '3', label: 'estándares de corrección: SAE, DIN, ISO' },
  { value: '100%', label: 'software propio, desarrollado en casa' },
];

const REASONS = [
  { icon: Gauge, title: 'Medición confiable', text: 'Potencia y torque calculados en tiempo real a partir de la celda de carga y las RPM, con calibración por equipo.' },
  { icon: ThermometerSun, title: 'Resultados comparables', text: 'La corrección atmosférica normaliza cada corrida para comparar pruebas hechas en días y climas distintos.' },
  { icon: Wrench, title: 'Hardware + software', text: 'Un solo proveedor para el banco y el programa: sin integraciones de terceros ni licencias aparte.' },
  { icon: Users, title: 'Para todo el taller', text: 'Usuarios con roles, varios dinamómetros por taller y acceso administrado desde la nube.' },
  { icon: LineChart, title: 'Reportes que venden', text: 'Curvas antes / después listas para mostrar al cliente el valor real de cada trabajo.' },
  { icon: ShieldCheck, title: 'Acompañamiento', text: 'Instalación, configuración inicial y soporte directo con el equipo que desarrolla el sistema.' },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-dark-3">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_75%_40%,rgba(229,35,43,0.16),transparent_70%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-red/30 bg-red/10 px-3 py-1 text-xs font-medium text-red-light">
              <span className="h-1.5 w-1.5 rounded-full bg-red-light" /> Performance Test System
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              La potencia no se adivina,{' '}
              <span className="bg-gradient-to-r from-sky-400 to-red-light bg-clip-text text-transparent">se mide.</span>
            </h1>
            <p className="mt-5 max-w-xl text-muted-light md:text-lg">
              DynoForge diseña dinamómetros de rodillo y su propio software de adquisición para talleres, preparadores y
              equipos de competencia. Mide, compara y demuestra cada mejora con datos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/productos"
                className="inline-flex items-center gap-2 rounded-md bg-red px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_18px_rgba(229,35,43,0.4)] hover:bg-red-light"
              >
                Ver equipos <ArrowRight className="h-4 w-4" />
              </Link>
              <WhatsAppButton>Cotizar por WhatsApp</WhatsAppButton>
            </div>
          </div>
          <HeroRotator />
        </div>
      </section>

      {/* Cifras */}
      <section className="border-b border-dark-3 bg-dark/60">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 md:grid-cols-4 md:px-6">
          {STATS.map((s) => (
            <div key={s.label} className="px-2 py-8 text-center">
              <p className="text-3xl font-bold text-white md:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs text-muted-light md:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quiénes somos */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:px-6 lg:grid-cols-2">
        <div>
          <SectionTitle
            eyebrow="Quiénes somos"
            title="Ingeniería de banco hecha para el taller"
            text="En DynoForge combinamos mecánica, electrónica y software para entregar un sistema completo: el banco de rodillo, la adquisición de datos y un programa moderno que cualquier técnico entiende desde el primer día."
          />
          <p className="-mt-4 text-muted-light">
            Cada equipo DynoForge sale configurado con su modelo y su calibración, y el software se actualiza
            continuamente con nuevas funciones. Tu taller gana una herramienta de diagnóstico y, sobre todo, una forma de
            demostrarle al cliente el resultado de su inversión.
          </p>
        </div>
        <img
          src="/img/software/prueba-en-vivo.webp"
          alt="Software DynoForge mostrando una prueba en vivo"
          className="w-full rounded-lg border border-dark-3 shadow-2xl"
          loading="lazy"
        />
      </section>

      {/* Líneas */}
      <section className="border-y border-dark-3 bg-dark/50">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
          <SectionTitle eyebrow="Equipos" title="Una línea para cada tipo de vehículo" />
          <div className="grid gap-5 md:grid-cols-3">
            {EQUIPMENT.map((e) => (
              <Link
                key={e.slug}
                to={`/productos#${e.slug}`}
                className="group rounded-lg border border-dark-3 bg-dark/80 p-5 transition-colors hover:border-red/50"
              >
                <div className="flex aspect-[4/3] items-center justify-center">
                  <img src={e.image} alt={e.name} className="max-h-full w-auto transition-transform group-hover:scale-105" loading="lazy" />
                </div>
                <h3 className="mt-4 font-semibold">{e.name}</h3>
                <p className="mt-1 text-sm text-muted-light">{e.short}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-red-light">
                  Ver detalle <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Software */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:px-6 lg:grid-cols-2">
        <img
          src="/img/software/comparacion.webp"
          alt="Comparación de corridas en el software DynoForge"
          className="order-last w-full rounded-lg border border-dark-3 shadow-2xl lg:order-first"
          loading="lazy"
        />
        <div>
          <SectionTitle eyebrow="Software" title="El cerebro de cada prueba" text="Incluido con cada banco. Se instala en el PC del taller y se descarga siempre actualizado desde tu cuenta." />
          <div className="grid gap-4 sm:grid-cols-2">
            {SOFTWARE_FEATURES.map((f) => (
              <div key={f.title} className="rounded-lg border border-dark-3 bg-dark/70 p-4">
                <p className="font-medium">{f.title}</p>
                <p className="mt-1 text-sm text-muted-light">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por qué */}
      <section className="border-y border-dark-3 bg-dark/50">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
          <SectionTitle eyebrow="Por qué DynoForge" title="Más que un banco de potencia" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {REASONS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-lg border border-dark-3 bg-dark/80 p-5">
                <Icon className="h-6 w-6 text-red-light" />
                <p className="mt-3 font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted-light">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

/** Rota las imágenes de las 3 líneas (carro, moto, karts) con un fundido. */
function HeroRotator() {
  const slides = [...EQUIPMENT].sort((a, b) => (a.slug === 'carro' ? -1 : b.slug === 'carro' ? 1 : 0));
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % slides.length), 4500);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="absolute inset-6 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="relative aspect-[16/11]">
        {slides.map((s, i) => (
          <img
            key={s.slug}
            src={s.image}
            alt={s.name}
            aria-hidden={i !== active}
            className={`absolute inset-0 h-full w-full object-contain drop-shadow-[0_0_40px_rgba(0,191,255,0.25)] transition-all duration-1000 ease-out ${
              i === active ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
          />
        ))}
      </div>
      <div className="relative mt-4 flex items-center justify-center gap-4">
        {slides.map((s, i) => (
          <button
            key={s.slug}
            onClick={() => setActive(i)}
            className={`text-xs font-medium uppercase tracking-wide transition-colors ${i === active ? 'text-white' : 'text-muted hover:text-muted-light'}`}
          >
            <span className={`mx-auto mb-1.5 block h-0.5 rounded-full transition-all ${i === active ? 'w-8 bg-red' : 'w-4 bg-dark-4'}`} />
            {s.slug === 'moto' ? 'Motos' : s.slug === 'carro' ? 'Carros' : 'Karts'}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
      <div className="relative overflow-hidden rounded-xl border border-dark-3 bg-dark-2 px-6 py-12 text-center md:px-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_0%_0%,rgba(0,191,255,0.12),transparent_70%),radial-gradient(ellipse_50%_80%_at_100%_100%,rgba(229,35,43,0.16),transparent_70%)]" />
        <div className="relative">
          <h2 className="text-2xl font-bold md:text-3xl">¿Listo para medir lo que tu taller puede hacer?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-light">
            Cuéntanos qué vehículos trabajas y te asesoramos con el equipo adecuado para tu espacio y presupuesto.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <WhatsAppButton>Hablar con un asesor</WhatsAppButton>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 rounded-md border border-dark-4 bg-dark-3 px-5 py-2.5 text-sm font-medium hover:bg-dark-4"
            >
              Otros medios de contacto
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
