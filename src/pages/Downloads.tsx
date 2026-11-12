import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { supabase, errMsg, INSTALLERS_BUCKET, type Release } from '../lib/supabase';
import { fmtDate } from '../lib/format';
import { Button, Card, ErrorBox, PageHeader, Spinner } from '../components/ui';

/** Enlace firmado de 10 min y descarga directa. Lo reutiliza Versiones. */
export async function downloadRelease(r: Release) {
  const fileName = r.file_path.split('/').pop() ?? `DynoForge_${r.version}.exe`;
  const { data, error } = await supabase.storage
    .from(INSTALLERS_BUCKET)
    .createSignedUrl(r.file_path, 600, { download: fileName });
  if (error || !data) throw error ?? new Error('No se pudo generar el enlace');
  window.location.href = data.signedUrl;
}

export default function Downloads() {
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('app_releases')
      .select('*')
      .eq('is_current', true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setError(errMsg(error));
        setRelease(data);
        setLoading(false);
      });
  }, []);

  async function download() {
    if (!release) return;
    setBusy(true);
    setError('');
    try {
      await downloadRelease(release);
    } catch (e) {
      setError(errMsg(e));
    }
    setBusy(false);
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Descargas" subtitle="Instalador de DynoForge para Windows" />
      {loading ? (
        <Spinner />
      ) : !release ? (
        <Card className="p-6 text-sm text-muted-light">Todavía no hay una versión publicada.</Card>
      ) : (
        <Card className="space-y-4 p-6">
          <div>
            <p className="text-2xl font-semibold">DynoForge {release.version}</p>
            <p className="text-sm text-muted-light">Publicada el {fmtDate(release.published_at)}</p>
          </div>
          {release.notes && <p className="whitespace-pre-line text-sm text-muted-light">{release.notes}</p>}
          <ErrorBox>{error}</ErrorBox>
          <Button onClick={download} busy={busy}>
            <Download className="h-4 w-4" /> Descargar instalador
          </Button>
          <p className="text-xs text-muted">El enlace de descarga es personal y vence a los 10 minutos.</p>
        </Card>
      )}
    </div>
  );
}
