import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { rotaInicialPorPerfil, type Perfil } from '@/lib/perfil';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  // Quando informado, só esses perfis entram; os outros vão para a tela
  // inicial do próprio perfil em vez de verem uma página vazia ou um 403.
  perfis?: Perfil[];
}

export default function RequireAuth({ perfis }: Props = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const usuario = useAuthStore((s) => s.usuario);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (perfis && usuario && !perfis.includes(usuario.perfil)) {
    return <Navigate to={rotaInicialPorPerfil(usuario.perfil)} replace />;
  }

  return <Outlet />;
}
