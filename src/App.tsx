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
import SiteLayout from './site/SiteLayout';
import Home from './site/pages/Home';
import Equipment from './site/pages/Equipment';
import Gallery from './site/pages/Gallery';
import Datasheets from './site/pages/Datasheets';
import Contact from './site/pages/Contact';

/** Rutas del panel antes de que existiera el sitio público (enlaces y marcadores viejos). */
const LEGACY_PANEL = ['talleres', 'usuarios', 'equipos', 'versiones', 'descargas'];

export default function App() {
  const { session, loading, recovering } = useAuth();

  if (recovering) return <ResetPassword />;

  return (
    <Routes>
      {/* Sitio público */}
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="productos" element={<Equipment />} />
        <Route path="galeria" element={<Gallery />} />
        <Route path="fichas-tecnicas" element={<Datasheets />} />
        <Route path="contacto" element={<Contact />} />
      </Route>

      <Route path="/login" element={loading ? <Spinner /> : session ? <Navigate to="/panel" replace /> : <Login />} />
      <Route path="/restablecer" element={<ResetPassword />} />
      <Route path="/panel/*" element={<Panel />} />

      {LEGACY_PANEL.map((p) => (
        <Route key={p} path={`/${p}`} element={<Navigate to={`/panel/${p}`} replace />} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Panel() {
  const { session, profile, loading, blockedReason, signOut } = useAuth();

  if (loading) return <Spinner />;
  if (!session) return <Navigate to="/login" replace />;

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
        <Route path="descargas" element={<Downloads />} />
        {/* Técnicos: ven y crean técnicos de su taller (la página se adapta al rol). */}
        <Route path="usuarios" element={<Users />} />
        {admin && (
          <>
            <Route path="talleres" element={<Workshops />} />
            <Route path="equipos" element={<Devices />} />
            <Route path="versiones" element={<Releases />} />
          </>
        )}
        <Route path="*" element={<Navigate to={admin ? '/panel/talleres' : '/panel/descargas'} replace />} />
      </Routes>
    </Layout>
  );
}
