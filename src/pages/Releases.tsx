import { useCallback, useEffect, useState } from 'react';
import { Download, Star, Trash2, Upload } from 'lucide-react';
import { supabase, errMsg, INSTALLERS_BUCKET, type Release } from '../lib/supabase';
import { fmtBytes, fmtDate } from '../lib/format';
import { Badge, Button, ErrorBox, Field, Input, Modal, PageHeader, Spinner, Table, Textarea } from '../components/ui';
import { downloadRelease } from './Downloads';

const MAX_BYTES = 50 * 1024 * 1024; // límite del bucket (plan Free)

export default function Releases() {
  const [rows, setRows] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('app_releases').select('*').order('published_at', { ascending: false });
    if (error) setError(errMsg(error));
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => void load(), [load]);

  async function makeCurrent(r: Release) {
    const { error } = await supabase.rpc('set_current_release', { p_version: r.version });
    if (error) setError(errMsg(error));
    void load();
  }

  async function remove(r: Release) {
    if (r.is_current) return setError('No se puede borrar la versión vigente. Marca otra como vigente primero.');
    if (!confirm(`¿Borrar la versión ${r.version} y su instalador?`)) return;
    const { error: sErr } = await supabase.storage.from(INSTALLERS_BUCKET).remove([r.file_path]);
    if (sErr) return setError(errMsg(sErr));
    const { error } = await supabase.from('app_releases').delete().eq('version', r.version);
    if (error) setError(errMsg(error));
    void load();
  }

  async function download(r: Release) {
    try {
      await downloadRelease(r);
    } catch (e) {
      setError(errMsg(e));
    }
  }

  return (
    <div>
      <PageHeader
        title="Versiones"
        subtitle="La versión vigente es la que ven los usuarios en Descargas."
        actions={
          <Button onClick={() => setUploading(true)}>
            <Upload className="h-4 w-4" /> Subir versión
          </Button>
        }
      />
      <ErrorBox>{error}</ErrorBox>
      {loading ? (
        <Spinner />
      ) : (
        <Table head={['Versión', 'Archivo', 'Publicada', 'Notas', '']} empty={rows.length === 0 && 'Aún no hay versiones.'}>
          {rows.map((r) => (
            <tr key={r.version} className="hover:bg-dark-2/60">
              <td className="whitespace-nowrap px-4 py-3">
                <span className="font-mono font-medium">{r.version}</span>{' '}
                {r.is_current && <Badge tone="green">Vigente</Badge>}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-light">{r.file_path.split('/').pop()}</td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-light">{fmtDate(r.published_at)}</td>
              <td className="max-w-xs truncate px-4 py-3 text-muted-light" title={r.notes ?? ''}>
                {r.notes || '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                {!r.is_current && (
                  <Button variant="secondary" className="!px-2.5 !py-1.5" onClick={() => void makeCurrent(r)}>
                    <Star className="h-4 w-4" /> Marcar vigente
                  </Button>
                )}
                <Button variant="ghost" className="!px-2" title="Descargar" onClick={() => void download(r)}>
                  <Download className="h-4 w-4" />
                </Button>
                {!r.is_current && (
                  <Button variant="ghost" className="!px-2 hover:!text-red-light" title="Borrar" onClick={() => void remove(r)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {uploading && (
        <UploadModal
          existing={rows.map((r) => r.version)}
          onClose={() => setUploading(false)}
          onSaved={() => {
            setUploading(false);
            void load();
          }}
        />
      )}
    </div>
  );
}

function UploadModal({ existing, onClose, onSaved }: { existing: string[]; onClose: () => void; onSaved: () => void }) {
  const [version, setVersion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [current, setCurrent] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function pick(f: File | null) {
    setFile(f);
    // DynoForge_1.0.7_x64-setup.exe → 1.0.7
    const m = f?.name.match(/(\d+\.\d+\.\d+)/);
    if (m && !version) setVersion(m[1]);
  }

  async function save() {
    setError('');
    const v = version.trim();
    if (!/^\d+\.\d+\.\d+$/.test(v)) return setError('La versión debe tener la forma 1.0.7');
    if (existing.includes(v)) return setError('Esa versión ya existe');
    if (!file) return setError('Elige el instalador');
    if (file.size > MAX_BYTES) return setError(`El archivo pesa ${fmtBytes(file.size)}; el máximo es 50 MB`);

    setBusy(true);
    const safeName = file.name.replace(/[^\w.\-]+/g, '_');
    const path = `${v}/${safeName}`;
    const { error: upErr } = await supabase.storage
      .from(INSTALLERS_BUCKET)
      .upload(path, file, { contentType: 'application/octet-stream', upsert: false });
    if (upErr) {
      setBusy(false);
      return setError(errMsg(upErr));
    }

    const { error: insErr } = await supabase
      .from('app_releases')
      .insert({ version: v, file_path: path, notes: notes.trim() || null });
    if (insErr) {
      await supabase.storage.from(INSTALLERS_BUCKET).remove([path]);
      setBusy(false);
      return setError(errMsg(insErr));
    }

    if (current) {
      const { error } = await supabase.rpc('set_current_release', { p_version: v });
      if (error) {
        setBusy(false);
        return setError(`Subida, pero no se pudo marcar vigente: ${errMsg(error)}`);
      }
    }
    setBusy(false);
    onSaved();
  }

  return (
    <Modal
      title="Subir versión"
      onClose={busy ? () => {} : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button onClick={save} busy={busy}>
            {busy ? 'Subiendo…' : 'Subir'}
          </Button>
        </>
      }
    >
      <Field label="Instalador" hint="El .exe o .msi que genera el build de Tauri (máx. 50 MB)">
        <Input type="file" accept=".exe,.msi" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
      </Field>
      {file && <p className="text-xs text-muted-light">{file.name} · {fmtBytes(file.size)}</p>}
      <Field label="Versión">
        <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.7" className="font-mono" />
      </Field>
      <Field label="Notas" hint="Qué cambió; lo ven los usuarios en Descargas">
        <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={current} onChange={(e) => setCurrent(e.target.checked)} className="accent-red" />
        Marcar como vigente
      </label>
      <ErrorBox>{error}</ErrorBox>
    </Modal>
  );
}
