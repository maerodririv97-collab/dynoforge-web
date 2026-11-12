import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { supabase, errMsg, DEVICE_STATUS_LABEL, type Device, type DeviceStatus, type Workshop } from '../lib/supabase';
import { fmtAgo, fmtDate } from '../lib/format';
import { Badge, Button, ErrorBox, Field, Input, Modal, PageHeader, Select, Spinner, Table } from '../components/ui';

const STATUS_TONE: Record<DeviceStatus, 'yellow' | 'green' | 'red'> = {
  pending: 'yellow',
  authorized: 'green',
  blocked: 'red',
};

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [wsFilter, setWsFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | DeviceStatus>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [renaming, setRenaming] = useState<Device | null>(null);

  const load = useCallback(async () => {
    const [d, w] = await Promise.all([
      supabase.from('devices').select('*').order('created_at', { ascending: false }),
      supabase.from('workshops').select('*').order('name'),
    ]);
    if (d.error || w.error) setError(errMsg(d.error ?? w.error));
    setDevices(d.data ?? []);
    setWorkshops(w.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => void load(), [load]);

  const wsName = useMemo(() => new Map(workshops.map((w) => [w.id, w.name])), [workshops]);
  const shown = devices.filter((d) => (!wsFilter || d.workshop_id === wsFilter) && (!statusFilter || d.status === statusFilter));
  const pending = devices.filter((d) => d.status === 'pending').length;

  async function setStatus(d: Device, status: DeviceStatus) {
    const { error } = await supabase.from('devices').update({ status }).eq('id', d.id);
    if (error) setError(errMsg(error));
    void load();
  }

  async function remove(d: Device) {
    if (!confirm(`¿Quitar «${d.name}»? La PC tendrá que registrarse otra vez con el código del taller.`)) return;
    const { error } = await supabase.from('devices').delete().eq('id', d.id);
    if (error) setError(errMsg(error));
    void load();
  }

  return (
    <div>
      <PageHeader
        title="Equipos"
        subtitle={pending ? `${pending} equipo${pending === 1 ? '' : 's'} esperando autorización` : 'PCs con la app instalada'}
        actions={
          <>
            <Select value={wsFilter} onChange={(e) => setWsFilter(e.target.value)} className="!w-auto">
              <option value="">Todos los talleres</option>
              {workshops.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as '' | DeviceStatus)} className="!w-auto">
              <option value="">Todos los estados</option>
              {(Object.keys(DEVICE_STATUS_LABEL) as DeviceStatus[]).map((s) => (
                <option key={s} value={s}>
                  {DEVICE_STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </>
        }
      />
      <ErrorBox>{error}</ErrorBox>
      {loading ? (
        <Spinner />
      ) : (
        <Table
          head={['Equipo', 'Taller', 'Versión', 'Última conexión', 'Estado', '']}
          empty={shown.length === 0 && 'No hay equipos. Aparecen aquí cuando una PC se registra con el código del taller.'}
        >
          {shown.map((d) => (
            <tr key={d.id} className="hover:bg-dark-2/60">
              <td className="px-4 py-3">
                <p className="font-medium">{d.name}</p>
                <p className="font-mono text-xs text-muted" title={d.machine_id}>
                  {d.machine_id.slice(0, 16)}… · registrado {fmtDate(d.created_at)}
                </p>
              </td>
              <td className="px-4 py-3">{wsName.get(d.workshop_id) ?? '—'}</td>
              <td className="px-4 py-3 font-mono text-muted-light">{d.app_version ?? '—'}</td>
              <td className="px-4 py-3 text-muted-light" title={fmtDate(d.last_seen_at)}>
                {fmtAgo(d.last_seen_at)}
              </td>
              <td className="px-4 py-3">
                <Badge tone={STATUS_TONE[d.status]}>{DEVICE_STATUS_LABEL[d.status]}</Badge>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                {d.status !== 'authorized' && (
                  <Button variant="secondary" className="!px-2.5 !py-1.5" onClick={() => void setStatus(d, 'authorized')}>
                    <CheckCircle2 className="h-4 w-4 text-green-400" /> Autorizar
                  </Button>
                )}
                {d.status !== 'blocked' && (
                  <Button variant="ghost" className="!px-2" title="Bloquear" onClick={() => void setStatus(d, 'blocked')}>
                    <Ban className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" className="!px-2" title="Renombrar" onClick={() => setRenaming(d)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="!px-2 hover:!text-red-light" title="Quitar" onClick={() => void remove(d)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {renaming && (
        <RenameModal
          device={renaming}
          onClose={() => setRenaming(null)}
          onSaved={() => {
            setRenaming(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

function RenameModal({ device, onClose, onSaved }: { device: Device; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(device.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!name.trim()) return setError('El nombre es obligatorio');
    setBusy(true);
    const { error } = await supabase.from('devices').update({ name: name.trim() }).eq('id', device.id);
    setBusy(false);
    if (error) return setError(errMsg(error));
    onSaved();
  }

  return (
    <Modal
      title="Renombrar equipo"
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
      <Field label="Nombre" hint="Ej.: «PC banco 1», «Laptop recepción»">
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>
      <ErrorBox>{error}</ErrorBox>
    </Modal>
  );
}
