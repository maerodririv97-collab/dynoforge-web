import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth';
import Layout from './components/Layout';
import { Button, Card, Spinner } from './components/ui';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Downloads from './pages/Downloads';
import Workshops from './pages/Workshops';
import Users from './pages/Users';
import Devices from './pages/Devices';
import Releases from './pages/Releases';

export default function App() {
  const { session, profile, loading, blockedReason, recovering, signOut } = useAuth();

  if (recovering) return <ResetPassword />;
  if (loading) return <Spinner />;
  if (!session) {
    return (
      <Routes>
        <Route path="/restablecer" element={<ResetPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  if (blockedReason || !profile) {
    return (
      <div className="flex min-h-full items-center justify-center p-4">
        <Card className="max-w-sm space-y-4 p-6 text-center">
          <p className="text-sm text-muted-light">{blockedReason ?? 'Sin acceso.'}</p>
          <Button variant="secondary" onClick={() => void signOut()}>
            Cerrar sesión
          </Button>
        </Card>
      </div>
    );
  }

  const admin = profile.is_superadmin;

  return (
    <Layout>
      <Routes>
        <Route path="/descargas" element={<Downloads />} />
        {admin && (
          <>
            <Route path="/talleres" element={<Workshops />} />
            <Route path="/usuarios" element={<Users />} />
            <Route path="/equipos" element={<Devices />} />
            <Route path="/versiones" element={<Releases />} />
          </>
        )}
        <Route path="*" element={<Navigate to={admin ? '/talleres' : '/descargas'} replace />} />
      </Routes>
    </Layout>
  );
}
