import { useState } from "react";
import toast from "react-hot-toast";
import FormField from "../ui/FormField";
import { validatePetForm } from "../../utils/validators";

const EMPTY_PET = {
  name: "",
  breed: "",
  age: "",
  weightKg: "",
  feedingNotes: "",
  specialCare: "",
  isSociable: true,
  needsMuzzle: false,
  timeSlotIds: [],
  photoFile: null,
  currentPhotoUrl: null,
};

/**
 * Pasa una mascota de la base al formato del formulario.
 * @param {object|null} pet Mascota de la base, o null si es nueva
 * @returns {object} Valores iniciales del formulario
 */
function toFormValues(pet) {
  if (!pet) return EMPTY_PET;
  return {
    name: pet.name,
    breed: pet.breed,
    age: String(pet.age),
    weightKg: String(pet.weight_kg),
    feedingNotes: pet.feeding_notes,
    specialCare: pet.special_care,
    isSociable: pet.is_sociable,
    needsMuzzle: pet.needs_muzzle,
    timeSlotIds: pet.pet_time_slots.map((slot) => slot.time_slot_id),
    photoFile: null,
    currentPhotoUrl: pet.photo_url,
  };
}

/**
 * Formulario para crear o editar una mascota.
 * @param {{ pet: object|null, timeSlots: Array<object>, onSubmit: (values: object) => Promise<void>, onCancel: () => void }} props
 */
export default function PetForm({ pet, timeSlots, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => toFormValues(pet));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function toggleTimeSlot(timeSlotId) {
    setForm((prev) => ({
      ...prev,
      timeSlotIds: prev.timeSlotIds.includes(timeSlotId)
        ? prev.timeSlotIds.filter((id) => id !== timeSlotId)
        : [...prev.timeSlotIds, timeSlotId],
    }));
  }

  function handlePhotoChange(event) {
    const file = event.target.files[0] ?? null;
    setForm((prev) => ({ ...prev, photoFile: file }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validatePetForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch {
      toast.error("No se pudo guardar la mascota.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormField id="photo" label="Foto" error={errors.photoFile}>
        <div className="flex items-center gap-4">
          {pet?.photo_url && !form.photoFile && (
            <img
              src={pet.photo_url}
              alt={`Foto actual de ${pet.name}`}
              className="h-16 w-16 rounded-lg object-cover"
            />
          )}
          <input
            id="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-primary-700 hover:file:bg-primary-100"
          />
        </div>
      </FormField>

      <FormField id="name" label="Nombre" error={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          className="input"
        />
      </FormField>

      <FormField id="breed" label="Raza" error={errors.breed}>
        <input
          id="breed"
          name="breed"
          type="text"
          value={form.breed}
          onChange={handleChange}
          className="input"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField id="age" label="Edad (años)" error={errors.age}>
          <input
            id="age"
            name="age"
            type="number"
            min="0"
            max="30"
            value={form.age}
            onChange={handleChange}
            className="input"
          />
        </FormField>
        <FormField id="weightKg" label="Peso (kg)" error={errors.weightKg}>
          <input
            id="weightKg"
            name="weightKg"
            type="number"
            min="0.1"
            max="100"
            step="0.1"
            value={form.weightKg}
            onChange={handleChange}
            className="input"
          />
        </FormField>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">
          Características
        </legend>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isSociable"
            checked={form.isSociable}
            onChange={handleChange}
            className="h-4 w-4 accent-primary-600"
          />
          Se lleva bien con otros perros
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="needsMuzzle"
            checked={form.needsMuzzle}
            onChange={handleChange}
            className="h-4 w-4 accent-primary-600"
          />
          Necesita bozal
        </label>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">
          ¿En qué franjas suele salir?
        </legend>
        {timeSlots.map((slot) => (
          <label key={slot.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.timeSlotIds.includes(slot.id)}
              onChange={() => toggleTimeSlot(slot.id)}
              className="h-4 w-4 accent-primary-600"
            />
            {slot.name} ({slot.start_time.slice(0, 5)} a{" "}
            {slot.end_time.slice(0, 5)})
          </label>
        ))}
      </fieldset>

      <FormField
        id="feedingNotes"
        label="Alimentación (opcional)"
        error={errors.feedingNotes}
      >
        <textarea
          id="feedingNotes"
          name="feedingNotes"
          rows="2"
          maxLength={300}
          value={form.feedingNotes}
          onChange={handleChange}
          className="input h-auto"
        />
      </FormField>

      <FormField
        id="specialCare"
        label="Cuidados especiales (opcional)"
        error={errors.specialCare}
      >
        <textarea
          id="specialCare"
          name="specialCare"
          rows="2"
          maxLength={300}
          value={form.specialCare}
          onChange={handleChange}
          className="input h-auto"
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-outline">
          Cancelar
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
