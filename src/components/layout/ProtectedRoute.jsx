import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { HOME_BY_ROLE } from "../../utils/roles";

/**
 * Deja pasar solo a usuarios logueados con alguno de los roles indicados.
 * Si no hay sesión, manda a ingresar; si el rol no corresponde, a su página de inicio.
 * @param {{ roles: string[] }} props
 */
export default function ProtectedRoute({ roles }) {
  const { profile, loading } = useAuth();
  if (loading)
    return <p className="p-8 text-center text-gray-500">Cargando...</p>;
  if (!profile) return <Navigate to="/ingresar" replace />;
  if (!roles.includes(profile.role))
    return <Navigate to={HOME_BY_ROLE[profile.role]} replace />;
  return <Outlet />;
}
