import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GALLERY, type GalleryCategory } from '../content';
import { PageHero } from '../SiteLayout';

const CATEGORIES: ('Todas' | GalleryCategory)[] = ['Todas', ...Array.from(new Set(GALLERY.map((g) => g.category)))];

export default function Gallery() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>('Todas');
  const [index, setIndex] = useState<number | null>(null);

  const items = filter === 'Todas' ? GALLERY : GALLERY.filter((g) => g.category === filter);
  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [index, close, step]);

  const current = index === null ? null : items[index];

  return (
    <>
      <PageHero eyebrow="Galería" title="Nuestros equipos en acción" text="Bancos, instalaciones y el software DynoForge trabajando en talleres reales." />
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                filter === c ? 'border-red/50 bg-red/15 text-white' : 'border-dark-4 text-muted-light hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g, i) => (
            <button
              key={g.src}
              onClick={() => setIndex(i)}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-dark-3 bg-dark-2"
            >
              <img src={g.src} alt={g.title} loading="lazy" className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-3 pt-8 text-left text-sm font-medium">
                {g.title}
                <span className="block text-xs font-normal text-muted-light">{g.category}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {current && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4" onClick={close} role="dialog" aria-label={current.title}>
          <button className="absolute right-4 top-4 text-muted-light hover:text-white" onClick={close} aria-label="Cerrar">
            <X className="h-7 w-7" />
          </button>
          {items.length > 1 && (
            <>
              <button
                className="absolute left-2 rounded-full bg-dark-3/80 p-2 hover:bg-dark-4 md:left-6"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                className="absolute right-2 rounded-full bg-dark-3/80 p-2 hover:bg-dark-4 md:right-6"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Siguiente"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img src={current.src} alt={current.title} className="max-h-[80vh] w-auto rounded-md" />
            <figcaption className="mt-3 text-center text-sm text-muted-light">
              {current.title} · {index! + 1} / {items.length}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
