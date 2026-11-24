import { supabase } from "../lib/supabase";

/**
 * Sube una imagen a la carpeta del usuario en un bucket y devuelve su URL pública.
 * @param {"avatars" | "pets"} bucket Bucket de destino
 * @param {string} userId id del usuario (nombre de su carpeta)
 * @param {string} fileName Nombre del archivo sin extensión, por ejemplo el id de la mascota
 * @param {File} file Imagen elegida en el formulario
 * @returns {Promise<string>} URL pública de la imagen
 */
export async function uploadImage(bucket, userId, fileName, file) {
  const extension = file.name.split(".").pop().toLowerCase();
  const path = `${userId}/${fileName}.${extension}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}
