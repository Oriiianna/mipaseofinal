import { supabase } from "../lib/supabase";

/**
 * Cuenta cuántas filas tiene una tabla.
 * @param {string} table Nombre de la tabla
 * @param {boolean} [onlyActive] Si es true, cuenta solo las filas con is_active = true
 * @returns {Promise<number>}
 */
async function countRows(table, onlyActive = false) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });

  if (onlyActive) {
    query = query.eq("is_active", true);
  }

  const { count, error } = await query;
  if (error) throw error;
  return count;
}

/**
 * Totales para el panel del admin.
 * @returns {Promise<{ owners: number, walkers: number, pets: number, walks: number }>}
 */
export async function getAdminStats() {
  const [owners, walkers, pets, walks] = await Promise.all([
    countRows("owners"),
    countRows("walkers"),
    countRows("pets", true),
    countRows("walks"),
  ]);

  return { owners, walkers, pets, walks };
}

/**
 * Trae todos los dueños y paseadores, del más nuevo al más viejo.
 * @returns {Promise<Array<{ id: string, role: string, full_name: string, phone: string, is_suspended: boolean, created_at: string }>>}
 */
export async function getUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone, is_suspended, created_at")
    .neq("role", "admin")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
