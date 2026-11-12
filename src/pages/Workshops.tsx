import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Pencil, Plus, RefreshCw } from 'lucide-react';
import { supabase, errMsg, type Workshop } from '../lib/supabase';
import { fmtDate } from '../lib/format';
import { Badge, Button, ErrorBox, Field, Input, Modal, PageHeader, Spinner, Table } from '../components/ui';

type Row = Workshop & { profiles: { count: number }[]; devices: { count: number }[] };

export default function Workshops() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Partial<Workshop> | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('workshops')
      .select('*, profiles(count), devices(count)')
      .order('name');
    if (error) setError(errMsg(error));
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => void load(), [load]);

  async function copy(code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  async function regenerate(w: Workshop) {
    if (!confirm(`¿Generar un código nuevo para «${w.name}»? El anterior deja de servir para registrar PCs (las ya registradas siguen igual).`))
      return;
    const { error } = await supabase.rpc('regenerate_registration_code', { p_workshop_id: w.id });
    if (error) setError(errMsg(error));
    void load();
  }

  return (
    <div>
      <PageHeader
        title="Talleres"
        subtitle="El código de registro se escribe en la app al instalarla en una PC nueva."
        actions={
          <Button onClick={() => setEditing({ is_active: true })}>
            <Plus className="h-4 w-4" /> Nuevo taller
          </Button>
        }
      />
      <ErrorBox>{error}</ErrorBox>
      {loading ? (
        <Spinner />
      ) : (
        <Table
          head={['Taller', 'Ciudad', 'Código de registro', 'Usuarios', 'Equipos', 'Estado', '']}
          empty={rows.length === 0 && 'Aún no hay talleres.'}
        >
          {rows.map((w) => (
            <tr key={w.id} className="hover:bg-dark-2/60">
              <td className="px-4 py-3">
                <p className="font-medium">{w.name}</p>
                <p className="text-xs text-muted">{w.contact || `Creado ${fmtDate(w.created_at)}`}</p>
              </td>
              <td className="px-4 py-3 text-muted-light">{w.city || '—'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <code className="rounded bg-dark-3 px-2 py-1 font-mono text-sm tracking-widest">{w.registration_code}</code>
                  <Button variant="ghost" className="!px-2" title="Copiar" onClick={() => void copy(w.registration_code)}>
                    {copied === w.registration_code ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" className="!px-2" title="Generar código nuevo" onClick={() => void regenerate(w)}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </td>
              <td className="px-4 py-3 tabular-nums">{w.profiles[0]?.count ?? 0}</td>
              <td className="px-4 py-3 tabular-nums">{w.devices[0]?.count ?? 0}</td>
              <td className="px-4 py-3">
                {w.is_active ? <Badge tone="green">Activo</Badge> : <Badge tone="red">Inactivo</Badge>}
              </td>
              <td className="px-4 py-3 text-right">
                <Button variant="ghost" className="!px-2" title="Editar" onClick={() => setEditing(w)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {editing && (
        <WorkshopModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

function WorkshopModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Partial<Workshop>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial.name ?? '');
  const [city, setCity] = useState(initial.city ?? '');
  const [contact, setContact] = useState(initial.contact ?? '');
  const [active, setActive] = useState(initial.is_active ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!name.trim()) return setError('El nombre es obligatorio');
    setBusy(true);
    const values = { name: name.trim(), city: city.trim() || null, contact: contact.trim() || null, is_active: active };
    const { error } = initial.id
      ? await supabase.from('workshops').update(values).eq('id', initial.id)
      : await supabase.from('workshops').insert(values);
    setBusy(false);
    if (error) return setError(errMsg(error));
    onSaved();
  }

  return (
    <Modal
      title={initial.id ? 'Editar taller' : 'Nuevo taller'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} busy={busy}>
            Guardar
          </Button>
        </>
      }
    >
      <Field label="Nombre">
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>
      <Field label="Ciudad">
        <Input value={city} onChange={(e) => setCity(e.target.value)} />
      </Field>
      <Field label="Contacto" hint="Persona, teléfono o correo del taller">
        <Input value={contact} onChange={(e) => setContact(e.target.value)} />
      </Field>
      {initial.id && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-red" />
          Taller activo
          <span className="text-xs text-muted">(inactivo = nadie del taller puede entrar)</span>
        </label>
      )}
      <ErrorBox>{error}</ErrorBox>
    </Modal>
  );
}
