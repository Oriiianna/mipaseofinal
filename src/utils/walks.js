/** Texto y estilo de cada estado de un paseo. */
export const WALK_STATUS = {
  pending: { label: "Pendiente", badge: "badge-warning" },
  accepted: { label: "Aceptado", badge: "badge-info" },
  rejected: { label: "Rechazado", badge: "badge-error" },
  cancelled: { label: "Cancelado", badge: "badge-error" },
  done: { label: "Realizado · falta confirmar", badge: "badge-warning" },
  confirmed: { label: "Confirmado", badge: "badge-success" },
};

/**
 * Muestra la fecha y hora de un paseo en formato argentino.
 * @param {string} isoDate Fecha guardada en la base
 * @returns {string} Por ejemplo "jueves, 26/11, 09:30"
 */
export function formatWalkDate(isoDate) {
  return new Date(isoDate).toLocaleString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
