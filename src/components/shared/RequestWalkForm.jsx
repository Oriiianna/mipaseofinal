import { useState } from "react";
import toast from "react-hot-toast";
import FormField from "../ui/FormField";
import { validateWalkForm } from "../../utils/validators";
import {
  getToday,
  getWeekday,
  getStartTimes,
  hasSlot,
  toTimestamp,
} from "../../utils/schedule";

const EMPTY_FORM = { petId: "", date: "", timeSlotId: "", time: "", notes: "" };

/**
 * Formulario para pedirle un paseo a un paseador.
 * @param {{ walker: object, pets: Array<object>, timeSlots: Array<object>, onSubmit: (walk: object) => Promise<void>, onCancel: () => void }} props
 */
export default function RequestWalkForm({
  walker,
  pets,
  timeSlots,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Si cambia el día, hay que volver a elegir franja y horario
      if (name === "date") {
        next.timeSlotId = "";
        next.time = "";
      }
      // Si cambia la franja, hay que volver a elegir horario
      if (name === "timeSlotId") {
        next.time = "";
      }
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateWalkForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        petId: Number(form.petId),
        scheduledAt: toTimestamp(form.date, form.time),
        notes: form.notes,
      });
    } catch (error) {
      toast.error(error.message || "No se pudo enviar la solicitud.");
      setSubmitting(false);
    }
  }

  // Mascota elegida y sus franjas preferidas
  const selectedPet = pets.find((pet) => pet.id === Number(form.petId));
  const petSlotNames = selectedPet
    ? timeSlots
        .filter((slot) =>
          selectedPet.pet_time_slots.some((s) => s.time_slot_id === slot.id),
        )
        .map((slot) => slot.name)
    : [];

  // Franjas en las que el paseador trabaja el día elegido
  const weekday = form.date ? getWeekday(form.date) : null;
  const availableSlots = weekday
    ? timeSlots.filter((slot) =>
        hasSlot(walker.walker_availability, weekday, slot.id),
      )
    : [];

  // Horarios posibles dentro de la franja elegida
  const selectedSlot = timeSlots.find(
    (slot) => slot.id === Number(form.timeSlotId),
  );
  const startTimes = selectedSlot ? getStartTimes(selectedSlot) : [];

  if (pets.length === 0) {
    return (
      <p className="text-gray-600">
        Primero cargá una mascota en "Mis mascotas" para poder pedir un paseo.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormField id="petId" label="Mascota" error={errors.petId}>
        <select
          id="petId"
          name="petId"
          value={form.petId}
          onChange={handleChange}
          className="input"
        >
          <option value="">Elegí una mascota</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name}
            </option>
          ))}
        </select>
      </FormField>

      {selectedPet && (
        <p className="text-sm text-gray-600">
          {petSlotNames.length > 0
            ? `${selectedPet.name} suele salir a la: ${petSlotNames.join(", ")}.`
            : `${selectedPet.name} no tiene franjas preferidas cargadas.`}
        </p>
      )}

      <FormField id="date" label="Día" error={errors.date}>
        <input
          id="date"
          name="date"
          type="date"
          min={getToday()}
          value={form.date}
          onChange={handleChange}
          className="input"
        />
      </FormField>

      <FormField id="timeSlotId" label="Franja" error={errors.timeSlotId}>
        <select
          id="timeSlotId"
          name="timeSlotId"
          value={form.timeSlotId}
          onChange={handleChange}
          disabled={availableSlots.length === 0}
          className="input"
        >
          <option value="">Elegí una franja</option>
          {availableSlots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.name}
            </option>
          ))}
        </select>
      </FormField>

      {form.date && availableSlots.length === 0 && (
        <p className="text-sm text-gray-600">
          El paseador no trabaja ese día. Probá con otro.
        </p>
      )}

      <FormField id="time" label="Horario" error={errors.time}>
        <select
          id="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          disabled={startTimes.length === 0}
          className="input"
        >
          <option value="">Elegí un horario</option>
          {startTimes.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        id="notes"
        label="Notas para el paseador (opcional)"
        error={errors.notes}
      >
        <textarea
          id="notes"
          name="notes"
          rows="2"
          maxLength={500}
          value={form.notes}
          onChange={handleChange}
          className="input h-auto"
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-outline">
          Cancelar
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Enviando…" : "Enviar solicitud"}
        </button>
      </div>
    </form>
  );
}
