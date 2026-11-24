import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PawPrint, Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import PetForm from "../../components/shared/PetForm";
import { useAuth } from "../../hooks/useAuth";
import {
  getMyPets,
  createPet,
  updatePet,
  deactivatePet,
  setPetTimeSlots,
  setPetPhoto,
} from "../../services/pets";
import { getTimeSlots } from "../../services/catalogs";
import { uploadImage } from "../../services/storage";

/** Mascotas del dueño: listar, agregar, editar y dar de baja. */
export default function MyPets() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState([]);
  const [editingPet, setEditingPet] = useState(undefined); // undefined = cerrado, null = nueva

  const loadPets = useCallback(() => {
    return getMyPets(user.id)
      .then(setPets)
      .catch(() => toast.error("No se pudieron cargar tus mascotas."))
      .finally(() => setLoading(false));
  }, [user.id]);

  useEffect(() => {
    loadPets();
    getTimeSlots()
      .then(setTimeSlots)
      .catch(() => toast.error("No se pudieron cargar las franjas."));
  }, [loadPets]);

  async function handleSave(values) {
    let petId;

    if (editingPet) {
      petId = editingPet.id;
      await updatePet(petId, values);
    } else {
      const created = await createPet(user.id, values);
      petId = created.id;
    }

    await setPetTimeSlots(petId, values.timeSlotIds);

    if (values.photoFile) {
      const photoUrl = await uploadImage(
        "pets",
        user.id,
        String(petId),
        values.photoFile,
      );
      await setPetPhoto(petId, photoUrl);
    }

    toast.success(editingPet ? "Mascota actualizada" : "Mascota agregada.");
    setEditingPet(undefined);
    await loadPets();
  }

  async function handleDeactivate(pet) {
    if (
      !window.confirm(
        `¿Dar de baja a ${pet.name}? Ya no va a aparecer en tu lista.`,
      )
    ) {
      return;
    }

    try {
      await deactivatePet(pet.id);
      toast.success(`${pet.name} se dio de baja.`);
      await loadPets();
    } catch {
      toast.error("No se pudo dar de baja la mascota.");
    }
  }

  return (
    <section aria-labelledby="pets-title" className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h1 id="pets-title" className="text-2xl font-bold text-gray-900">
          Mis mascotas
        </h1>
        <button
          type="button"
          onClick={() => setEditingPet(null)}
          className="btn-primary gap-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Agregar mascota
        </button>
      </header>

      {loading ? (
        <p className="text-gray-500">Cargando mascotas…</p>
      ) : pets.length === 0 ? (
        <p className="text-gray-600">Todavía no cargaste ninguna mascota.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <li key={pet.id}>
              <article className="card p-4 flex gap-4">
                {pet.photo_url ? (
                  <img
                    src={pet.photo_url}
                    alt=""
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-primary-50 grid place-items-center">
                    <PawPrint
                      className="h-8 w-8 text-primary-500"
                      aria-hidden="true"
                    />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-lg">{pet.name}</h2>
                  <p className="text-sm text-gray-600">{pet.breed}</p>
                  <p className="text-sm text-gray-600">
                    {pet.age} años · {pet.weight_kg} kg
                  </p>
                </div>
                <div className="ml-auto flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingPet(pet)}
                    aria-label={`Editar a ${pet.name}`}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary-600"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeactivate(pet)}
                    aria-label={`Dar de baja a ${pet.name}`}
                    className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={editingPet !== undefined}
        title={editingPet ? "Editar mascota" : "Nueva mascota"}
        onClose={() => setEditingPet(undefined)}
      >
        <PetForm
          pet={editingPet}
          timeSlots={timeSlots}
          onSubmit={handleSave}
          onCancel={() => setEditingPet(undefined)}
        />
      </Modal>
    </section>
  );
}
