import { supabase } from "../lib/supabase";

/**
 * Trae el perfil de un usuario.
 * @param {string} userId id del usuario
 * @returns {Promise<{id: string, role: string, full_name: string, phone: string, avatar_url: string|null, is_suspended: boolean}>} Perfil del usuario
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone, avatar_url, is_suspended")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualiza datos del perfil de un usuario.
 * @param {string} userId id del usuario
 * @param {{full_name?: string, phone?: string, avatar_url?: string, is_suspended?: boolean}} changes Columnas a cambiar
 */
export async function updateProfile(userId, changes) {
  const { error } = await supabase
    .from("profiles")
    .update(changes)
    .eq("id", userId);

  if (error) throw error;
}
