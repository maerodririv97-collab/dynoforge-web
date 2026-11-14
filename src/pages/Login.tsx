import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase, errMsg } from '../lib/supabase';
import { Button, Card, ErrorBox, Field, Input } from '../components/ui';
import logo from '../logo-dynoforge.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [forgot, setForgot] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    if (forgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/restablecer`,
      });
      if (error) setError(errMsg(error));
      else setInfo('Si el correo existe, te llegará un enlace para crear una contraseña nueva.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setError(errMsg(error));
    }
    setBusy(false);
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 p-4">
      <Card className="w-full max-w-sm p-6">
        <Link to="/">
          <img src={logo} alt="DynoForge" className="mx-auto mb-6 h-10 w-auto" />
        </Link>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Correo">
            <Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {!forgot && (
            <Field label="Contraseña">
              <Input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          )}
          <ErrorBox>{error}</ErrorBox>
          {info && <p className="text-sm text-green-400">{info}</p>}
          <Button type="submit" busy={busy} className="w-full">
            {forgot ? 'Enviar enlace' : 'Entrar'}
          </Button>
          <button
            type="button"
            onClick={() => {
              setForgot((f) => !f);
              setError('');
              setInfo('');
            }}
            className="block w-full text-center text-xs text-muted-light hover:text-white"
          >
            {forgot ? 'Volver a entrar' : '¿Olvidaste tu contraseña?'}
          </button>
        </form>
      </Card>
      <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-light hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Volver al sitio
      </Link>
    </div>
  );
}
