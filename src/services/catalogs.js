import { supabase } from "../lib/supabase";

/**
 * Trae los barrios ordenados alfabéticamente.
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
export async function getNeighborhoods() {
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return data;
}

/**
 * Trae las franjas horarias en orden: mañana, tarde y noche.
 * @returns {Promise<Array<{id: number, name: string, start_time: string, end_time: string}>>}
 */
export async function getTimeSlots() {
  const { data, error } = await supabase
    .from("time_slots")
    .select("id, name, start_time, end_time")
    .order("id");

  if (error) throw error;
  return data;
}
