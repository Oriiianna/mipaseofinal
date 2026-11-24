import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormField from "../../components/ui/FormField";
import AvailabilityGrid from "../../components/shared/AvailabilityGrid";
import { useAuth } from "../../hooks/useAuth";
import { getNeighborhoods, getTimeSlots } from "../../services/catalogs";
import {
  getWalker,
  updateWalker,
  setAvailability,
} from "../../services/walkers";
import { validateWalkerForm } from "../../utils/validators";
import { hasSlot } from "../../utils/schedule";

/** Perfil profesional del paseador: datos, disponibilidad y pausa. */
export default function WalkerSettings() {
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [slots, setSlots] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pausing, setPausing] = useState(false);

  useEffect(() => {
    Promise.all([getWalker(user.id), getNeighborhoods(), getTimeSlots()])
      .then(([walker, neighborhoodList, timeSlotList]) => {
        setForm({
          neighborhoodId: String(walker.neighborhood_id),
          experienceYears: String(walker.experience_years),
          bio: walker.bio,
        });
        setSlots(walker.walker_availability);
        setIsPaused(walker.is_paused);
        setNeighborhoods(neighborhoodList);
        setTimeSlots(timeSlotList);
      })
      .catch(() => toast.error("No se pudo cargar tu perfil."))
      .finally(() => setLoading(false));
  }, [user.id]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleSlot(weekday, timeSlotId) {
    setSlots((prev) =>
      hasSlot(prev, weekday, timeSlotId)
        ? prev.filter(
            (slot) =>
              !(slot.weekday === weekday && slot.time_slot_id === timeSlotId),
          )
        : [...prev, { weekday, time_slot_id: timeSlotId }],
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateWalkerForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    try {
      await updateWalker(user.id, {
        neighborhood_id: Number(form.neighborhoodId),
        experience_years: Number(form.experienceYears),
        bio: form.bio.trim(),
      });
      await setAvailability(user.id, slots);
      toast.success("Perfil actualizado.");
    } catch {
      toast.error("No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePause() {
    setPausing(true);
    try {
      await updateWalker(user.id, { is_paused: !isPaused });
      setIsPaused(!isPaused);
      toast.success(
        isPaused ? "Volviste a recibir solicitudes." : "Pausaste tu perfil.",
      );
    } catch {
      toast.error("No se pudo cambiar el estado de tu perfil.");
    } finally {
      setPausing(false);
    }
  }

  if (loading) return <p className="text-gray-500">Cargando tu perfil…</p>;
  if (!form)
    return <p className="text-gray-600">No se pudo cargar tu perfil.</p>;

  return (
    <section
      aria-labelledby="walker-settings-title"
      className="max-w-3xl space-y-6"
    >
      <h1
        id="walker-settings-title"
        className="text-2xl font-bold text-gray-900"
      >
        Mi perfil profesional
      </h1>

      <div className="card p-4 flex items-center justify-between gap-4">
        <p>
          <span className="block font-semibold">
            {isPaused
              ? "Tu perfil está pausado"
              : "Estás recibiendo solicitudes"}
          </span>
          <span className="text-sm text-gray-500">
            {isPaused
              ? "No aparecés en las búsquedas ni recibís pedidos nuevos."
              : "Los dueños pueden encontrarte y pedirte paseos."}
          </span>
        </p>
        <button
          type="button"
          onClick={handleTogglePause}
          disabled={pausing}
          className={isPaused ? "btn-primary" : "btn-outline"}
        >
          {pausing ? "Guardando…" : isPaused ? "Reactivar" : "Pausar"}
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="card p-6 space-y-6">
        <FormField
          id="neighborhoodId"
          label="Barrio donde trabajás"
          error={errors.neighborhoodId}
        >
          <select
            id="neighborhoodId"
            name="neighborhoodId"
            value={form.neighborhoodId}
            onChange={handleChange}
            className="input"
          >
            <option value="">Elegí un barrio</option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          id="experienceYears"
          label="Años de experiencia"
          error={errors.experienceYears}
        >
          <input
            id="experienceYears"
            name="experienceYears"
            type="number"
            min="0"
            max="50"
            value={form.experienceYears}
            onChange={handleChange}
            className="input"
          />
        </FormField>

        <FormField id="bio" label="Sobre vos" error={errors.bio}>
          <textarea
            id="bio"
            name="bio"
            rows="3"
            maxLength={500}
            value={form.bio}
            onChange={handleChange}
            className="input h-auto"
          />
        </FormField>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">
            ¿Cuándo podés pasear?
          </legend>
          <p className="text-sm text-gray-500">
            Tildá los días y las franjas en las que trabajás.
          </p>
          <AvailabilityGrid
            timeSlots={timeSlots}
            slots={slots}
            onToggle={toggleSlot}
          />
        </fieldset>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </section>
  );
}
