import { Star } from "lucide-react";

/**
 * Lista de reseñas con estrellas, comentario, autor y fecha.
 * @param {{ reviews: Array<object> }} props
 */
export default function ReviewList({ reviews }) {
  if (reviews.length === 0) {
    return <p className="text-gray-600">Todavía no tiene reseñas.</p>;
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review.id} className="card p-4 space-y-1">
          <p className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                aria-hidden="true"
                className={`h-4 w-4 ${
                  index < review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="sr-only">{review.rating} de 5 estrellas</span>
          </p>
          {review.comment && <p className="text-gray-700">{review.comment}</p>}
          <p className="text-sm text-gray-500">
            {review.owner_name} con {review.pet_name} ·{" "}
            {new Date(review.created_at).toLocaleDateString("es-AR")}
          </p>
        </li>
      ))}
    </ul>
  );
}
