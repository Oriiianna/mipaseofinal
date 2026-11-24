import { supabase } from "../lib/supabase";

/**
 * Trae los datos de un paseador y su disponibilidad.
 * @param {string} walkerId id del paseador
 * @returns {Promise<object>} Datos del paseador con su lista de disponibilidad.
 */
export async function getWalker(walkerId) {
  const { data, error } = await supabase
    .from("walkers")
    .select(
      "profile_id, neighborhood_id, experience_years, bio, is_paused, neighborhoods(name), profiles(full_name, avatar_url), walker_availability(weekday, time_slot_id)",
    )
    .eq("profile_id", walkerId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualiza los datos del paseador.
 * @param {string} walkerId id del paseador
 * @param {{neighborhood_id?: number, experience_years?: number, bio?: string, is_paused?: boolean}} changes Columnas a cambiar
 */
export async function updateWalker(walkerId, changes) {
  const { error } = await supabase
    .from("walkers")
    .update(changes)
    .eq("profile_id", walkerId);

  if (error) throw error;
}

/**
 * Reemplaza la disponibilidad del paseador.
 * @param {string} walkerId id del paseador
 * @param {Array<{weekday: number, time_slot_id: number}>} slots Días y franjas elegidos
 */
export async function setAvailability(walkerId, slots) {
  const { error: deleteError } = await supabase
    .from("walker_availability")
    .delete()
    .eq("walker_id", walkerId);

  if (deleteError) throw deleteError;
  if (slots.length === 0) return;

  const rows = slots.map((slot) => ({ walker_id: walkerId, ...slot }));

  const { error: insertError } = await supabase
    .from("walker_availability")
    .insert(rows);
  if (insertError) throw insertError;
}

/**
 * Busca paseadores que tomen paseos y tengan disponibilidad cargada, opcionalmente por barrio.
 * @param {number|null} neighborhoodId id del barrio, o null para traer todos
 * @returns {Promise<Array<object>>}
 */
export async function searchWalkers(neighborhoodId) {
  let query = supabase
    .from("walkers")
    .select(
      "profile_id, experience_years, bio, neighborhoods(name), profiles(full_name, avatar_url, is_suspended), walker_availability(weekday, time_slot_id)",
    )
    .eq("is_paused", false);

  if (neighborhoodId) {
    query = query.eq("neighborhood_id", neighborhoodId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data.filter(
    (walker) =>
      !walker.profiles.is_suspended && walker.walker_availability.length > 0,
  );
}
