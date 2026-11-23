import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyRound, Pencil, Plus, Trash2, Wand2 } from 'lucide-react';
import { supabase, errMsg, ROLE_LABEL, type Profile, type Role, type Workshop } from '../lib/supabase';
import { adminUsers, generatePassword } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Badge, Button, ErrorBox, Field, Input, Modal, PageHeader, Select, Spinner, Table } from '../components/ui';

export default function Users() {
  const { profile: me } = useAuth();
  const isAdmin = !!me?.is_superadmin;
  const [users, setUsers] = useState<Profile[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<{ kind: 'create' } | { kind: 'edit'; user: Profile } | { kind: 'password'; user: Profile } | null>(null);

  const load = useCallback(async () => {
    const [u, w] = await Promise.all([
      supabase.from('profiles').select('*').order('first_name'),
      supabase.from('workshops').select('*').order('name'),
    ]);
    if (u.error || w.error) setError(errMsg(u.error ?? w.error));
    setUsers(u.data ?? []);
    setWorkshops(w.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => void load(), [load]);

  const wsName = useMemo(() => new Map(workshops.map((w) => [w.id, w.name])), [workshops]);
  const shown = filter ? users.filter((u) => u.workshop_id === filter) : users;

  async function remove(u: Profile) {
    if (!confirm(`¿Borrar a ${u.first_name} ${u.last_name} (${u.email})? No se puede deshacer. Si solo quieres quitarle el acceso, desactívalo.`))
      return;
    try {
      await adminUsers.remove(u.id);
      void load();
    } catch (e) {
      setError(errMsg(e));
    }
  }

  const close = () => setModal(null);
  const saved = () => {
    setModal(null);
    void load();
  };

  return (
    <div>
      <PageHeader
        title="Usuarios"
        subtitle={
          isAdmin
            ? 'Los usuarios entran a la app de escritorio con su correo y contraseña.'
            : 'Técnicos de tu taller. Entran a la app de escritorio con su correo y contraseña.'
        }
        actions={
          <>
            {isAdmin && (
              <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="!w-auto">
                <option value="">Todos los talleres</option>
                {workshops.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </Select>
            )}
            <Button onClick={() => setModal({ kind: 'create' })} disabled={workshops.length === 0} title={workshops.length === 0 ? 'Primero crea un taller' : ''}>
              <Plus className="h-4 w-4" /> Nuevo usuario
            </Button>
          </>
        }
      />
      <ErrorBox>{error}</ErrorBox>
      {loading ? (
        <Spinner />
      ) : (
        <Table head={['Nombre', 'Correo', 'Taller', 'Rol', 'Estado', '']} empty={shown.length === 0 && 'No hay usuarios.'}>
          {shown.map((u) => (
            <tr key={u.id} className="hover:bg-dark-2/60">
              <td className="px-4 py-3">
                <p className="font-medium">{`${u.first_name} ${u.last_name}`.trim() || '—'}</p>
                {u.phone && <p className="text-xs text-muted">{u.phone}</p>}
              </td>
              <td className="px-4 py-3 text-muted-light">{u.email ?? '—'}</td>
              <td className="px-4 py-3">{u.workshop_id ? wsName.get(u.workshop_id) ?? '—' : '—'}</td>
              <td className="px-4 py-3">
                {u.is_superadmin ? <Badge tone="blue">{ROLE_LABEL.admin}</Badge> : <Badge>{ROLE_LABEL[u.role]}</Badge>}
              </td>
              <td className="px-4 py-3">
                {u.is_active ? <Badge tone="green">Activo</Badge> : <Badge tone="red">Inactivo</Badge>}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                {isAdmin && (
                  <>
                    <Button variant="ghost" className="!px-2" title="Editar" onClick={() => setModal({ kind: 'edit', user: u })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="!px-2" title="Cambiar contraseña" onClick={() => setModal({ kind: 'password', user: u })}>
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    {u.id !== me?.id && (
                      <Button variant="ghost" className="!px-2 hover:!text-red-light" title="Borrar" onClick={() => void remove(u)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {modal?.kind === 'create' && (
        <UserModal workshops={workshops} defaultWorkshop={isAdmin ? filter : me?.workshop_id ?? ''} canChooseRole={isAdmin} onClose={close} onSaved={saved} />
      )}
      {modal?.kind === 'edit' && <UserModal workshops={workshops} user={modal.user} canChooseRole onClose={close} onSaved={saved} />}
      {modal?.kind === 'password' && <PasswordModal user={modal.user} onClose={close} />}
    </div>
  );
}

function UserModal({
  workshops,
  user,
  defaultWorkshop,
  canChooseRole,
  onClose,
  onSaved,
}: {
  workshops: Workshop[];
  user?: Profile;
  defaultWorkshop?: string;
  /** false para técnicos: solo crean técnicos de su propio taller. */
  canChooseRole: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!user;
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState(() => (isEdit ? '' : generatePassword()));
  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [role, setRole] = useState<Role>(user?.role ?? 'mechanic');
  const [workshopId, setWorkshopId] = useState(user?.workshop_id ?? defaultWorkshop ?? workshops[0]?.id ?? '');
  const [active, setActive] = useState(user?.is_active ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  async function save() {
    setError('');
    if (!firstName.trim()) return setError('El nombre es obligatorio');
    if (!email.trim()) return setError('El correo es obligatorio');
    const isAdmin = role === 'admin';
    if (!isAdmin && !workshopId) return setError('Elige un taller');
    setBusy(true);
    try {
      if (!isEdit) {
        await adminUsers.create({
          email: email.trim(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim() || null,
          role,
          workshop_id: isAdmin ? null : workshopId,
        });
        setCreatedPassword(password);
      } else {
        if (email.trim().toLowerCase() !== (user.email ?? '').toLowerCase()) {
          await adminUsers.updateAuth(user.id, { email: email.trim() });
        }
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone: phone.trim() || null,
            ...(user.is_superadmin ? {} : { role, workshop_id: isAdmin ? null : workshopId, is_active: active }),
          })
          .eq('id', user.id);
        if (error) throw error;
        onSaved();
      }
    } catch (e) {
      setError(errMsg(e));
    }
    setBusy(false);
  }

  if (createdPassword) {
    return (
      <Modal title="Usuario creado" onClose={onSaved} footer={<Button onClick={onSaved}>Listo</Button>}>
        <p className="text-sm text-muted-light">Pásale estos datos al usuario. La contraseña no se vuelve a mostrar.</p>
        <div className="space-y-1 rounded-md bg-dark-3 p-3 font-mono text-sm">
          <p>Correo: {email.trim().toLowerCase()}</p>
          <p>Contraseña: {createdPassword}</p>
        </div>
        <Button variant="secondary" onClick={() => void navigator.clipboard.writeText(`Correo: ${email.trim().toLowerCase()}\nContraseña: ${createdPassword}`)}>
          Copiar
        </Button>
      </Modal>
    );
  }

  return (
    <Modal
      title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} busy={busy}>
            {isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nombre">
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus />
        </Field>
        <Field label="Apellido">
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </Field>
      </div>
      <Field label="Correo">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      {!isEdit && (
        <Field label="Contraseña inicial" hint="Mínimo 8 caracteres. Se muestra una sola vez al crear.">
          <div className="flex gap-2">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} className="font-mono" />
            <Button variant="secondary" title="Generar otra" onClick={() => setPassword(generatePassword())}>
              <Wand2 className="h-4 w-4" />
            </Button>
          </div>
        </Field>
      )}
      <Field label="Teléfono">
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      {!canChooseRole && (
        <p className="text-sm text-muted-light">
          Se creará como {ROLE_LABEL.mechanic} de {workshops.find((w) => w.id === workshopId)?.name ?? 'tu taller'}.
        </p>
      )}
      {canChooseRole && !user?.is_superadmin && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Rol" hint={role === 'admin' ? 'Dueño de DynoForge: acceso total, sin taller.' : undefined}>
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="mechanic">{ROLE_LABEL.mechanic}</option>
              <option value="admin">{ROLE_LABEL.admin}</option>
            </Select>
          </Field>
          {role !== 'admin' && (
          <Field label="Taller">
            <Select value={workshopId} onChange={(e) => setWorkshopId(e.target.value)}>
              {workshops.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                  {w.is_active ? '' : ' (inactivo)'}
                </option>
              ))}
            </Select>
          </Field>
          )}
        </div>
      )}
      {isEdit && !user.is_superadmin && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-red" />
          Usuario activo
        </label>
      )}
      <ErrorBox>{error}</ErrorBox>
    </Modal>
  );
}

function PasswordModal({ user, onClose }: { user: Profile; onClose: () => void }) {
  const [password, setPassword] = useState(generatePassword);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function save() {
    setBusy(true);
    setError('');
    try {
      await adminUsers.updateAuth(user.id, { password });
      setDone(true);
    } catch (e) {
      setError(errMsg(e));
    }
    setBusy(false);
  }

  return (
    <Modal
      title={`Contraseña de ${user.first_name}`}
      onClose={onClose}
      footer={
        done ? (
          <Button onClick={onClose}>Listo</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={save} busy={busy}>
              Cambiar
            </Button>
          </>
        )
      }
    >
      {done ? (
        <>
          <p className="text-sm text-muted-light">Contraseña cambiada. Pásasela al usuario:</p>
          <p className="rounded-md bg-dark-3 p-3 font-mono text-sm">{password}</p>
        </>
      ) : (
        <Field label="Contraseña nueva" hint={`Para ${user.email}. Mínimo 8 caracteres.`}>
          <div className="flex gap-2">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} className="font-mono" />
            <Button variant="secondary" title="Generar otra" onClick={() => setPassword(generatePassword())}>
              <Wand2 className="h-4 w-4" />
            </Button>
          </div>
        </Field>
      )}
      <ErrorBox>{error}</ErrorBox>
    </Modal>
  );
}
