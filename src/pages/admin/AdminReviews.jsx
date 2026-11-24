import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Star, Trash2 } from "lucide-react";
import { getAllReviews, deleteReview } from "../../services/reviews";

/** Todas las reseñas, con la opción de borrarlas. */
export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    getAllReviews()
      .then(setReviews)
      .catch(() => toast.error("No se pudieron cargar las reseñas."))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(review) {
    if (!window.confirm("¿Borrar esta reseña? No se puede deshacer.")) return;

    setBusyId(review.id);
    try {
      await deleteReview(review.id);
      toast.success("Reseña borrada.");
      setReviews(await getAllReviews());
    } catch {
      toast.error("No se pudo borrar la reseña.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section aria-labelledby="reviews-admin-title" className="space-y-6">
      <h1 id="reviews-admin-title" className="text-2xl font-bold text-gray-900">
        Reseñas
      </h1>

      {loading ? (
        <p className="text-gray-500">Cargando reseñas…</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-600">Todavía no hay reseñas.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review.id}>
              <article className="card p-4 flex gap-4">
                <div className="flex-1 space-y-1">
                  <p className="flex items-center gap-1 font-semibold">
                    <Star
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      aria-hidden="true"
                    />
                    {review.rating} de 5
                  </p>
                  {review.comment && (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {review.walks.pets.owners.profiles.full_name} con{" "}
                    {review.walks.pets.name} → paseador:{" "}
                    {review.walks.walkers.profiles.full_name} ·{" "}
                    {new Date(review.created_at).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busyId === review.id}
                  onClick={() => handleDelete(review)}
                  aria-label="Borrar reseña"
                  className="self-start p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                </button>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
