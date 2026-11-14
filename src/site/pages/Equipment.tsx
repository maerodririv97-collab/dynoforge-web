import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Check, FileText } from 'lucide-react';
import { EQUIPMENT } from '../content';
import { PageHero } from '../SiteLayout';
import { WhatsAppButton } from '../whatsapp';
import { CtaBand } from './Home';

export default function Equipment() {
  const { hash } = useLocation();

  // Llegar desde el inicio con /productos#carro baja hasta esa línea.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return (
    <>
      <PageHero
        eyebrow="Equipos"
        title="Dinamómetros DynoForge"
        text="Bancos de rodillo para motos, carros y karts. Todos incluyen el software DynoForge, la electrónica de adquisición y la configuración inicial del equipo."
      />
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-14 md:px-6">
        {EQUIPMENT.map((e, i) => (
          <section
            key={e.slug}
            id={e.slug}
            className="grid scroll-mt-24 items-center gap-8 rounded-xl border border-dark-3 bg-dark/70 p-6 md:p-10 lg:grid-cols-2"
          >
            <div className={`flex items-center justify-center ${i % 2 ? 'lg:order-last' : ''}`}>
              <img src={e.image} alt={e.name} className="max-h-80 w-auto drop-shadow-[0_0_30px_rgba(0,191,255,0.2)]" loading="lazy" />
            </div>
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">{e.name}</h2>
              <p className="mt-3 text-muted-light">{e.description}</p>
              <ul className="mt-5 space-y-2">
                {e.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-red-light" /> {h}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <WhatsAppButton message={`Hola DynoForge, quiero cotizar el ${e.name.toLowerCase()}.`}>Cotizar</WhatsAppButton>
                <Link
                  to="/fichas-tecnicas"
                  className="inline-flex items-center gap-2 rounded-md border border-dark-4 bg-dark-3 px-5 py-2.5 text-sm font-medium hover:bg-dark-4"
                >
                  <FileText className="h-4 w-4" /> Ficha técnica
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>
      <CtaBand />
    </>
  );
}
