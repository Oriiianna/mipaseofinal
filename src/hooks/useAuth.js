import { useContext } from "react";
import { AuthContext } from "../context/auth-context";

/**
 * Devuelve la sesión, el usuario, el perfil, si está cargando y la función para refrescar el perfil.
 * @returns {{ session: object|null, user: object|null, profile: object|null, loading: boolean, refreshProfile: () => Promise<void> }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth tiene que usarse dentro de AuthProvider");
  return context;
}
