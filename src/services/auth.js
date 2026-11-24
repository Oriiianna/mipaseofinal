import { supabase } from "../lib/supabase";

/**
 * Registra un usuario. Los datos extra viajan como metadata y el
 * trigger handle_new_user crea el perfil y la fila de su rol.
 * @param {object} form Datos ya validados del formulario de registro
 * @returns {Promise<object>} Usuario y sesión creados
 */
export async function signUp(form) {
  const { data, error } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    options: {
      data: {
        role: form.role,
        full_name: form.fullName.trim(),
        phone: form.phone.trim(),
        neighborhood_id: Number(form.neighborhoodId),
        address: form.role === "owner" ? form.address.trim() : null,
        experience_years:
          form.role === "walker" ? Number(form.experienceYears) : null,
        bio: form.role === "walker" ? form.bio.trim() : null,
      },
    },
  });

  if (error) throw error;
  return data;
}

const AUTH_ERRORS = {
  user_already_exists: "Ya existe una cuenta con ese email.",
  weak_password: "La contraseña es demasiado débil.",
  email_address_invalid: "El email no es válido.",
  over_email_send_rate_limit: "Demasiados intentos. Esperá unos minutos.",
  invalid_credentials: "Email o contraseña incorrectos.",
  same_password: "La contraseña nueva tiene que ser distinta de la actual.",
};

/**
 * Traduce un error de Supabase Auth a un mensaje para el usuario.
 * @param {{ code?: string }} error
 * @returns {string}
 */
export function getAuthErrorMessage(error) {
  return (
    AUTH_ERRORS[error?.code] ??
    "No se pudo completar la operación. Probá de nuevo."
  );
}

/**
 * Inicia sesión con email y contraseña.
 * @param {string} email
 * @param {string} password
 */
export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

/** Cierra la sesión actual. */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Cambia la contraseña del usuario logueado.
 * @param {string} newPassword Contraseña nueva
 */
export async function changePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
