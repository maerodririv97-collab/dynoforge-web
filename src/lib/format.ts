const dtf = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' });

export function fmtDate(iso: string | null | undefined): string {
  return iso ? dtf.format(new Date(iso)) : '—';
}

export function fmtAgo(iso: string | null | undefined): string {
  if (!iso) return 'Nunca';
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'Hace un momento';
  const m = Math.round(s / 60);
  if (m < 60) return `Hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `Hace ${d} día${d === 1 ? '' : 's'}`;
  return fmtDate(iso);
}

export function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 ** 2).toFixed(1)} MB`;
}
