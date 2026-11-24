import { supabase } from "../lib/supabase";

/**
 * Crea la solicitud del paseo y queda pendiente hasta que el paseador acepte.
 * @param {{petId: number, walkerId: string, scheduledAt: string, notes: string}} walk Datos del paseo
 */
export async function createWalk({ petId, walkerId, scheduledAt, notes }) {
  const { error } = await supabase.from("walks").insert({
    pet_id: petId,
    walker_id: walkerId,
    scheduled_at: scheduledAt,
    notes: notes.trim(),
  });
  if (error) throw error;
}

/**
 * Trae los paseos del usuario logueado, con su mascota, dueño y paseador.
 * Las RLS hacen que cada uno reciba solo los suyos: el dueño, los de sus
 * mascotas, y el paseador, los que le pidieron a él.
 * @returns {Promise<Array<object>>}
 */
export async function getMyWalks() {
  const { data, error } = await supabase
    .from("walks")
    .select(
      `id, scheduled_at, notes, status, cancel_reason, cancelled_by,
       pets(name, breed, photo_url, is_sociable, needs_muzzle, feeding_notes, special_care,
         owners(address, neighborhoods(name), profiles(full_name, phone))),
       walkers(profiles(full_name, phone)),
       reviews(id)`,
    )
    .order("scheduled_at");

  if (error) throw error;
  return data;
}

/**
 * Cambia el estado de un paseo. El trigger de la base valida si el cambio está permitido.
 * @param {number} walkId id del paseo
 * @param {"accepted" | "rejected" | "cancelled" | "done" | "confirmed"} status Estado nuevo
 * @param {string|null} [cancelReason] Motivo, solo si se cancela
 */
export async function updateWalkStatus(walkId, status, cancelReason = null) {
  const { error } = await supabase
    .from("walks")
    .update({ status, cancel_reason: cancelReason })
    .eq("id", walkId);

  if (error) throw error;
}

/**
 * Escucha los cambios en los paseos y avisa cada vez que hay uno.
 * @param {() => void} onChange Función que se ejecuta cuando cambia un paseo
 * @returns {() => void} Función para dejar de escuchar
 */
export function subscribeToWalks(onChange) {
  const channel = supabase
    .channel("walks-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "walks" },
      onChange,
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
