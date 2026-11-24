/** Días de la semana, con el número que se guarda en la base y sus nombres. */
export const WEEKDAYS = [
  { value: 1, short: "Lu", label: "Lunes" },
  { value: 2, short: "Ma", label: "Martes" },
  { value: 3, short: "Mi", label: "Miércoles" },
  { value: 4, short: "Ju", label: "Jueves" },
  { value: 5, short: "Vi", label: "Viernes" },
  { value: 6, short: "Sa", label: "Sábado" },
  { value: 7, short: "Do", label: "Domingo" },
];

/**
 * Indica si un día y una franja están en la lista de disponibilidad.
 * @param {Array<{weekday: number, time_slot_id: number}>} slots Disponibilidad
 * @param {number} weekday Día de la semana (1 = lunes, 7 = domingo)
 * @param {number} timeSlotId id de la franja
 * @returns {boolean}
 */
export function hasSlot(slots, weekday, timeSlotId) {
  return slots.some(
    (slot) => slot.weekday === weekday && slot.time_slot_id === timeSlotId,
  );
}

/**
 * Devuelve el día de la semana de una fecha (1 = lunes, 7 = domingo).
 * @param {string} date Fecha en formato "AAAA-MM-DD"
 * @returns {number}
 */
export function getWeekday(date) {
  const day = new Date(`${date}T12:00:00`).getDay();
  return day === 0 ? 7 : day;
}

/**
 * Horarios de inicio posibles dentro de una franja, cada 30 minutos,
 * dejando lugar para un paseo de 60 minutos.
 * @param {{ start_time: string, end_time: string }} slot Franja horaria
 * @returns {string[]} Horarios en formato "HH:MM"
 */
export function getStartTimes(slot) {
  const startHour = Number(slot.start_time.slice(0, 2));
  const endHour = Number(slot.end_time.slice(0, 2));
  const times = [];

  for (
    let minutes = startHour * 60;
    minutes <= (endHour - 1) * 60;
    minutes += 30
  ) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mins = String(minutes % 60).padStart(2, "0");
    times.push(`${hours}:${mins}`);
  }

  return times;
}

/**
 * Une una fecha y una hora de Argentina en un valor para la base.
 * @param {string} date Fecha "AAAA-MM-DD"
 * @param {string} time Hora "HH:MM"
 * @returns {string} Fecha y hora con zona horaria, por ejemplo "2026-11-26T09:30:00-03:00"
 */
export function toTimestamp(date, time) {
  return `${date}T${time}:00-03:00`;
}

/**
 * Devuelve la fecha en formato "AAAA-MM-DD" en horario local.
 * @returns {string}
 */
export function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
