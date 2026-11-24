const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Revisa el formato y peso de una imagen.
 * @param {File} file imagen elegida
 * @returns {string|null} Mensaje de error, o null si la imagen es válida.
 */
function getImageError(file) {
  if (!IMAGE_TYPES.includes(file.type))
    return "La imagen tiene que ser JPG, PNG o WebP.";
  if (file.size > MAX_IMAGE_BYTES)
    return "La imagen no puede pesar más de 2 MB.";
  return null;
}

/**
 * Valida el formulario de registro.
 * @param {object} form Valores actuales del formulario
 * @returns {Record<string, string>} Errores por campo; objeto vacío si es válido
 */
export function validateRegisterForm(form) {
  const errors = {};
  const name = form.fullName.trim();
  const phone = form.phone.trim();

  if (name.length < 2 || name.length > 100)
    errors.fullName = "Ingresá tu nombre completo.";
  if (!EMAIL_REGEX.test(form.email)) errors.email = "Ingresá un email válido.";
  if (phone.length < 6 || phone.length > 20)
    errors.phone = "Ingresá un teléfono válido.";
  if (form.password.length < 6) errors.password = "Usá al menos 6 caracteres.";
  if (!form.neighborhoodId) errors.neighborhoodId = "Elegí un barrio.";

  if (form.role === "owner" && form.address.trim().length < 5) {
    errors.address = "Ingresá tu dirección.";
  }

  if (form.role === "walker") {
    const years = Number(form.experienceYears);
    if (
      form.experienceYears === "" ||
      !Number.isInteger(years) ||
      years < 0 ||
      years > 50
    ) {
      errors.experienceYears = "Ingresá un número entre 0 y 50.";
    }
    if (form.bio.length > 500) errors.bio = "Máximo 500 caracteres.";
  }

  return errors;
}

/**
 * Valida el formulario de ingreso.
 * @param {{ email: string, password: string }} form
 * @returns {Record<string, string>} Errores por campo; objeto vacío si es válido
 */
export function validateLoginForm(form) {
  const errors = {};
  if (!EMAIL_REGEX.test(form.email)) errors.email = "Ingresá un email válido.";
  if (!form.password) errors.password = "Ingresá tu contraseña.";
  return errors;
}

/**
 * Valida el formulario de mascota.
 * @param {object} form Valores actuales del formulario
 * @returns {Record<string, string>} Errores por campo; objeto vacío si es válido
 */
export function validatePetForm(form) {
  const errors = {};
  const name = form.name.trim();
  const breed = form.breed.trim();
  const age = Number(form.age);
  const weight = Number(form.weightKg);

  if (!name || name.length > 50) {
    errors.name = "Ingresá el nombre (hasta 50 caracteres).";
  }
  if (!breed || breed.length > 100) {
    errors.breed = "Ingresá la raza. Si no la sabés, poné Mestizo.";
  }
  if (form.age === "" || !Number.isInteger(age) || age < 0 || age > 30) {
    errors.age = "Ingresá una edad entre 0 y 30 años.";
  }
  if (
    form.weightKg === "" ||
    Number.isNaN(weight) ||
    weight <= 0 ||
    weight > 100
  ) {
    errors.weightKg = "Ingresá un peso entre 0,1 y 100 kg.";
  }
  if (form.feedingNotes.length > 300) {
    errors.feedingNotes = "Máximo 300 caracteres.";
  }
  if (form.specialCare.length > 300) {
    errors.specialCare = "Máximo 300 caracteres.";
  }

  if (!form.photoFile && !form.currentPhotoUrl) {
    errors.photoFile = "Subí una foto de tu mascota.";
  } else if (form.photoFile) {
    const imageError = getImageError(form.photoFile);
    if (imageError) errors.photoFile = imageError;
  }

  return errors;
}

/**
 * Valida el formulario de datos de la cuenta.
 * @param {{fullName: string, phone: string, avatarFile: File|null}} form
 * @returns {Record<string, string>} errores por campo. objeto vacío si es valido
 */
export function validateAccountForm(form) {
  const errors = {};
  const name = form.fullName.trim();
  const phone = form.phone.trim();

  if (name.length < 2 || name.length > 100) {
    errors.fullName = "Ingresá tu nombre completo.";
  }
  if (phone.length < 6 || phone.length > 20) {
    errors.phone = "Ingresá un teléfono válido.";
  }
  if (form.avatarFile) {
    const imageError = getImageError(form.avatarFile);
    if (imageError) errors.avatarFile = imageError;
  }
  return errors;
}

/**
 * Valida el formulario de cambio de contraseña.
 * @param {{password: string, confirmPassword: string}} form
 * @returns {Record<string, string>} Errores por campo
 */
export function validatePasswordForm(form) {
  const errors = {};

  if (form.password.length < 6) {
    errors.password = "Usá al menos 6 caracteres.";
  }
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }
  return errors;
}

/**
 * Valida el formulario del perfil profesional del paseador.
 * @param {{neighborhoodId: string, experienceYears:string, bio:string}} form
 * @returns {Record<string, string>}
 */
export function validateWalkerForm(form) {
  const errors = {};
  const years = Number(form.experienceYears);

  if (!form.neighborhoodId) {
    errors.neighborhoodId = "Elegí un barrio.";
  }
  if (
    form.experienceYears === "" ||
    !Number.isInteger(years) ||
    years < 0 ||
    years > 50
  ) {
    errors.experienceYears = "Ingresá un número entre 0 y 50.";
  }
  if (form.bio.length > 500) {
    errors.bio = "Máximo 500 caracteres.";
  }
  return errors;
}

/**
 * Valida el formulario para solicitar un paseo.
 * @param {{petId: string, date: string, timeSlotId: string, time: string, notes: string}} form Valores actuales del formulario
 * @returns {Record<string, string>} Errores por campo; objeto vacío si es válido
 */
export function validateWalkForm(form) {
  const errors = {};

  if (!form.petId) errors.petId = "Elegí una mascota.";
  if (!form.date) errors.date = "Elegí un día.";
  if (!form.timeSlotId) errors.timeSlotId = "Elegí una franja.";
  if (!form.time) errors.time = "Elegí un horario.";
  if (form.notes.length > 500) errors.notes = "Máximo 500 caracteres.";

  return errors;
}
