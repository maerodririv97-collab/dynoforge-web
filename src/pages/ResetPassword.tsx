import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, errMsg } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Button, Card, ErrorBox, Field, Input } from '../components/ui';

export default function ResetPassword() {
  const { session, clearRecovering } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError('Mínimo 8 caracteres');
    if (password !== confirm) return setError('Las contraseñas no coinciden');
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(errMsg(error));
    clearRecovering();
    navigate('/', { replace: true });
  }

  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6">
        <h1 className="mb-4 text-lg font-semibold">Nueva contraseña</h1>
        {!session ? (
          <p className="text-sm text-muted-light">
            El enlace no es válido o ya venció. Pide uno nuevo desde «¿Olvidaste tu contraseña?».
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Contraseña nueva">
              <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <Field label="Repetir contraseña">
              <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </Field>
            <ErrorBox>{error}</ErrorBox>
            <Button type="submit" busy={busy} className="w-full">
              Guardar
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
