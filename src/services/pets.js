import { supabase } from "../lib/supabase";

/**
 * Trae las mascotas activas de un dueño, con sus franjas preferidas.
 * @param {string} ownerId id del dueño
 * @returns {Promise<Array<object>>}
 */
export async function getMyPets(ownerId) {
  const { data, error } = await supabase
    .from("pets")
    .select(
      "id, name, breed, age, weight_kg, photo_url, feeding_notes, special_care, is_sociable, needs_muzzle, pet_time_slots(time_slot_id)",
    )
    .eq("owner_id", ownerId)
    .eq("is_active", true)
    .order("created_at");

  if (error) throw error;
  return data;
}

/**
 * Convierte los valores del formulario en una fila de la tabla pets.
 * @param {object} pet Valores del formulario de mascota
 * @returns {object} Fila con los nombres y tipos de la tabla
 */
function toPetRow(pet) {
  return {
    name: pet.name.trim(),
    breed: pet.breed.trim(),
    age: Number(pet.age),
    weight_kg: Number(pet.weightKg),
    feeding_notes: pet.feedingNotes.trim(),
    special_care: pet.specialCare.trim(),
    is_sociable: pet.isSociable,
    needs_muzzle: pet.needsMuzzle,
  };
}

/**
 * Crea una mascota para un dueño.
 * @param {string} ownerId id del dueño
 * @param {object} pet Valores del formulario de mascota
 * @returns {Promise<{ id: number }>} id de la mascota creada
 */
export async function createPet(ownerId, pet) {
  const { data, error } = await supabase
    .from("pets")
    .insert({ ...toPetRow(pet), owner_id: ownerId })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualiza los datos de una mascota.
 * @param {number} petId id de la mascota
 * @param {object} pet Valores del formulario de mascota
 */
export async function updatePet(petId, pet) {
  const { error } = await supabase
    .from("pets")
    .update(toPetRow(pet))
    .eq("id", petId);

  if (error) throw error;
}

/**
 * Da de baja una mascota (borrado lógico: deja de aparecer, pero sigue en la base).
 * @param {number} petId id de la mascota
 */
export async function deactivatePet(petId) {
  const { error } = await supabase
    .from("pets")
    .update({ is_active: false })
    .eq("id", petId);

  if (error) throw error;
}

/**
 * Guarda la URL de la foto de una mascota.
 * @param {number} petId id de la mascota
 * @param {string} photoUrl URL pública de la foto en Storage
 */
export async function setPetPhoto(petId, photoUrl) {
  const { error } = await supabase
    .from("pets")
    .update({ photo_url: photoUrl })
    .eq("id", petId);

  if (error) throw error;
}

/**
 * Reemplaza las franjas preferidas de una mascota.
 * @param {number} petId id de la mascota
 * @param {number[]} timeSlotIds ids de las franjas elegidas (1 mañana, 2 tarde, 3 noche)
 */
export async function setPetTimeSlots(petId, timeSlotIds) {
  const { error: deleteError } = await supabase
    .from("pet_time_slots")
    .delete()
    .eq("pet_id", petId);

  if (deleteError) throw deleteError;
  if (timeSlotIds.length === 0) return;

  const rows = timeSlotIds.map((timeSlotId) => ({
    pet_id: petId,
    time_slot_id: timeSlotId,
  }));

  const { error: insertError } = await supabase
    .from("pet_time_slots")
    .insert(rows);

  if (insertError) throw insertError;
}
