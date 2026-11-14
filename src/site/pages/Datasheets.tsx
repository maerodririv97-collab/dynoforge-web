import { Download, FileText } from 'lucide-react';
import { DATASHEETS } from '../content';
import { PageHero } from '../SiteLayout';
import { WhatsAppButton } from '../whatsapp';

export default function Datasheets() {
  return (
    <>
      <PageHero
        eyebrow="Fichas técnicas"
        title="Documentación de equipos"
        text="Descarga las fichas técnicas en PDF con dimensiones, capacidades y requisitos de instalación de cada línea."
      />
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-2 md:px-6">
        {DATASHEETS.map((d) => (
          <div key={d.title} className="flex items-start gap-4 rounded-lg border border-dark-3 bg-dark/80 p-5">
            <div className="rounded-md border border-red/30 bg-red/10 p-3">
              <FileText className="h-6 w-6 text-red-light" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{d.title}</p>
              <p className="mt-1 text-sm text-muted-light">{d.description}</p>
              <div className="mt-4">
                {d.file ? (
                  <a
                    href={d.file}
                    download
                    className="inline-flex items-center gap-2 rounded-md bg-red px-4 py-2 text-sm font-medium text-white hover:bg-red-light"
                  >
                    <Download className="h-4 w-4" /> Descargar PDF{d.size ? ` · ${d.size}` : ''}
                  </a>
                ) : (
                  <WhatsAppButton message={`Hola DynoForge, ¿me pueden enviar la ${d.title.toLowerCase()}?`} className="!px-4 !py-2">
                    Solicitar por WhatsApp
                  </WhatsAppButton>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
