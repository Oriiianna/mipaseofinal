import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { MapPin, Star } from "lucide-react";
import Avatar from "../../components/ui/Avatar";
import AvailabilityGrid from "../../components/shared/AvailabilityGrid";
import ReviewList from "../../components/shared/ReviewList";
import { getTimeSlots } from "../../services/catalogs";
import { getWalker } from "../../services/walkers";
import { getWalkerReviews } from "../../services/reviews";
import Modal from "../../components/ui/Modal";
import RequestWalkForm from "../../components/shared/RequestWalkForm";
import { useAuth } from "../../hooks/useAuth";
import { getMyPets } from "../../services/pets";
import { createWalk } from "../../services/walks";

/** Perfil público de un paseador, con su disponibilidad, reseñas y el pedido de paseo. */
export default function WalkerProfile() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [pets, setPets] = useState([]);
  const [requestOpen, setRequestOpen] = useState(false);
  const [walker, setWalker] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getWalker(id), getTimeSlots(), getWalkerReviews(id)])
      .then(([walkerData, timeSlotList, reviewList]) => {
        setWalker(walkerData);
        setTimeSlots(timeSlotList);
        setReviews(reviewList);
      })
      .catch(() => toast.error("No se pudo cargar el perfil."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (profile.role !== "owner") return;
    getMyPets(user.id)
      .then(setPets)
      .catch(() => toast.error("No se pudieron cargar tus mascotas."));
  }, [profile.role, user.id]);

  async function handleRequest(values) {
    await createWalk({ ...values, walkerId: walker.profile_id });
    toast.success("Solicitud enviada.");
    setRequestOpen(false);
  }

  if (loading) return <p className="text-gray-500">Cargando perfil…</p>;
  if (!walker)
    return <p className="text-gray-600">No encontramos a este paseador.</p>;

  const average =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : null;

  return (
    <article aria-labelledby="walker-name" className="max-w-3xl space-y-6">
      <header className="card p-6 flex items-center gap-4">
        <Avatar
          name={walker.profiles.full_name}
          url={walker.profiles.avatar_url}
          size="h-20 w-20"
        />
        <div className="space-y-1">
          <h1 id="walker-name" className="text-2xl font-bold text-gray-900">
            {walker.profiles.full_name}
          </h1>
          <p className="flex items-center gap-1 text-gray-600">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {walker.neighborhoods.name} · {walker.experience_years} años de
            experiencia
          </p>
          <p className="flex items-center gap-1 text-gray-700">
            <Star className="h-4 w-4 text-yellow-500" aria-hidden="true" />
            {average
              ? `${average} (${reviews.length} ${reviews.length === 1 ? "reseña" : "reseñas"})`
              : "Sin reseñas todavía"}
          </p>
        </div>
        {profile.role === "owner" && (
          <div className="ml-auto">
            {walker.is_paused ? (
              <p className="text-sm text-gray-500">
                No está tomando paseos por ahora.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setRequestOpen(true)}
                className="btn-primary"
              >
                Solicitar paseo
              </button>
            )}
          </div>
        )}
      </header>

      {walker.bio && (
        <section aria-labelledby="bio-title" className="space-y-2">
          <h2 id="bio-title" className="text-lg font-semibold text-gray-900">
            Sobre mí
          </h2>
          <p className="text-gray-700">{walker.bio}</p>
        </section>
      )}

      <section aria-labelledby="availability-title" className="space-y-2">
        <h2
          id="availability-title"
          className="text-lg font-semibold text-gray-900"
        >
          Disponibilidad
        </h2>
        <div className="card p-4">
          <AvailabilityGrid
            timeSlots={timeSlots}
            slots={walker.walker_availability}
          />
        </div>
      </section>

      <section aria-labelledby="reviews-title" className="space-y-2">
        <h2 id="reviews-title" className="text-lg font-semibold text-gray-900">
          Reseñas
        </h2>
        <ReviewList reviews={reviews} />
      </section>
      <Modal
        open={requestOpen}
        title="Solicitar paseo"
        onClose={() => setRequestOpen(false)}
      >
        <RequestWalkForm
          walker={walker}
          pets={pets}
          timeSlots={timeSlots}
          onSubmit={handleRequest}
          onCancel={() => setRequestOpen(false)}
        />
      </Modal>
    </article>
  );
}
