import { supabase } from "../lib/supabase";

/**
 * Trae el promedio y la cantidad de reseñas de cada paseador.
 * @returns {Promise<Array<{walker_id: string, average: number, total: number}>>}
 */
export async function getWalkerRatings() {
  const { data, error } = await supabase.rpc("get_walker_ratings");

  if (error) throw error;
  return data;
}

/**
 * Trae las reseñas de un paseador, desde la más nueva hasta la más vieja.
 * @param {string} walkerId id del paseador
 * @returns {Promise<Array<{id: number, rating: number, comment: string, created_at: string, owner_name: string, pet_name: string}>>}
 */
export async function getWalkerReviews(walkerId) {
  const { data, error } = await supabase.rpc("get_walker_reviews", {
    p_walker_id: walkerId,
  });
  if (error) throw error;
  return data;
}

/**
 * Crea la reseña de un paseo confirmado.
 * @param {number} walkId id del paseo
 * @param {number} rating Puntaje de 1 a 5
 * @param {string} comment Comentario (puede estar vacío)
 */
export async function createReview(walkId, rating, comment) {
  const { error } = await supabase.from("reviews").insert({
    walk_id: walkId,
    rating,
    comment: comment.trim(),
  });

  if (error) throw error;
}

/**
 * Trae todas las reseñas con su paseo, mascota, dueño y paseador (para el admin).
 * @returns {Promise<Array<object>>}
 */
export async function getAllReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `id, rating, comment, created_at,
       walks(pets(name, owners(profiles(full_name))), walkers(profiles(full_name)))`,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Borra una reseña. Solo lo permite la base si quien lo pide es admin.
 * @param {number} reviewId id de la reseña
 */
export async function deleteReview(reviewId) {
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) throw error;
}
