import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import WalkCard from "./WalkCard";
import CancelWalkForm from "./CancelWalkForm";
import ReviewForm from "./ReviewForm";
import { createReview } from "../../services/reviews";
import {
  getMyWalks,
  updateWalkStatus,
  subscribeToWalks,
} from "../../services/walks";

const SECTIONS = [
  { id: "pending", title: "Pendientes", statuses: ["pending"] },
  { id: "accepted", title: "Próximos", statuses: ["accepted"] },
  { id: "done", title: "Realizados sin confirmar", statuses: ["done"] },
  {
    id: "history",
    title: "Historial",
    statuses: ["confirmed", "rejected", "cancelled"],
  },
];

const SUCCESS_MESSAGES = {
  accepted: "Paseo aceptado.",
  rejected: "Paseo rechazado.",
  done: "Paseo marcado como realizado.",
  confirmed: "Paseo confirmado.",
};

const EMPTY_MESSAGES = {
  owner: "Todavía no pediste ningún paseo. Buscá un paseador para empezar.",
  walker: "Todavía no te pidieron ningún paseo.",
  admin: "Todavía no hay paseos en la plataforma.",
};

/**
 * Paseos del usuario agrupados por estado, con sus acciones.
 * @param {{ role: "owner" | "walker" | "admin"}} props
 */
export default function WalksBoard({ role }) {
  const [walks, setWalks] = useState([]);
  const [now, setNow] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [cancelling, setCancelling] = useState(null); // paseo que se está cancelando
  const [reviewing, setReviewing] = useState(null); // paseo que se está reseñando

  const loadWalks = useCallback(() => {
    return getMyWalks()
      .then((data) => {
        setWalks(data);
        setNow(Date.now());
      })
      .catch(() => toast.error("No se pudieron cargar tus paseos."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadWalks();
    const unsubscribe = subscribeToWalks((payload) => {
      loadWalks();
      if (role === "walker" && payload.eventType === "INSERT") {
        toast("Te llegó una nueva solicitud de paseo.");
      }
    });
    return unsubscribe;
  }, [loadWalks, role]);

  async function handleStatusChange(walk, status) {
    setBusyId(walk.id);
    try {
      await updateWalkStatus(walk.id, status);
      toast.success(SUCCESS_MESSAGES[status]);
      await loadWalks();
    } catch (error) {
      toast.error(error.message || "No se pudo actualizar el paseo.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(reason) {
    await updateWalkStatus(cancelling.id, "cancelled", reason);
    toast.success("Paseo cancelado.");
    setCancelling(null);
    await loadWalks();
  }

  async function handleReview(rating, comment) {
    await createReview(reviewing.id, rating, comment);
    toast.success("¡Gracias por tu reseña!");
    setReviewing(null);
    await loadWalks();
  }

  if (loading) return <p className="text-gray-500">Cargando tus paseos…</p>;

  if (walks.length === 0)
    return <p className="text-gray-600">{EMPTY_MESSAGES[role]}</p>;

  return (
    <div className="space-y-8">
      {SECTIONS.map((section) => {
        const sectionWalks = walks.filter((walk) =>
          section.statuses.includes(walk.status),
        );
        if (sectionWalks.length === 0) return null;

        return (
          <section
            key={section.id}
            aria-labelledby={`section-${section.id}`}
            className="space-y-3"
          >
            <h2
              id={`section-${section.id}`}
              className="text-lg font-semibold text-gray-900"
            >
              {section.title} ({sectionWalks.length})
            </h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {sectionWalks.map((walk) => (
                <li key={walk.id}>
                  <WalkCard
                    walk={walk}
                    role={role}
                    now={now}
                    busy={busyId === walk.id}
                    onStatusChange={handleStatusChange}
                    onCancel={setCancelling}
                    onReview={setReviewing}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <Modal
        open={cancelling !== null}
        title="Cancelar paseo"
        onClose={() => setCancelling(null)}
      >
        <CancelWalkForm
          onSubmit={handleCancel}
          onCancel={() => setCancelling(null)}
        />
      </Modal>

      <Modal
        open={reviewing !== null}
        title="Reseñar paseo"
        onClose={() => setReviewing(null)}
      >
        <ReviewForm
          onSubmit={handleReview}
          onCancel={() => setReviewing(null)}
        />
      </Modal>
    </div>
  );
}
