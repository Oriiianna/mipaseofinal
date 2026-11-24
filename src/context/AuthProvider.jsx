import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getProfile } from "../services/profiles";
import { AuthContext } from "./auth-context";

/**
 * Escucha la sesión de Supabase y carga el perfil del usuario.
 * Envuelve toda la app para que cualquier componente sepa quién está logueado.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = todavía no sabemos
  const [loadedProfile, setLoadedProfile] = useState({
    userId: null,
    data: null,
  });

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!userId) return;

    let ignore = false;
    getProfile(userId)
      .then((data) => {
        if (!ignore) setLoadedProfile({ userId, data });
      })
      .catch(() => {
        if (!ignore) setLoadedProfile({ userId, data: null });
      });

    return () => {
      ignore = true;
    };
  }, [userId]);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    const data = await getProfile(userId);
    setLoadedProfile({ userId, data });
  }, [userId]);

  const profileIsCurrent = userId !== null && loadedProfile.userId === userId;
  const profile = profileIsCurrent ? loadedProfile.data : null;
  const loading =
    session === undefined || (userId !== null && !profileIsCurrent);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
