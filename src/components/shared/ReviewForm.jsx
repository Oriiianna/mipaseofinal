import { useState } from "react";
import toast from "react-hot-toast";
import FormField from "../ui/FormField";

const RATING_OPTIONS = [
  { value: 5, label: "5 · Excelente" },
  { value: 4, label: "4 · Muy bueno" },
  { value: 3, label: "3 · Bueno" },
  { value: 2, label: "2 · Regular" },
  { value: 1, label: "1 · Malo" },
];

/**
 * Formulario para reseñar un paseo confirmado.
 * @param {{ onSubmit: (rating: number, comment: string) => Promise<void>, onCancel: () => void }} props
 */
export default function ReviewForm({ onSubmit, onCancel }) {
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    try {
      await onSubmit(Number(rating), comment);
    } catch (error) {
      toast.error(error.message || "No se pudo guardar la reseña.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormField id="rating" label="Puntaje">
        <select
          id="rating"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="input"
        >
          {RATING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="comment" label="Comentario (opcional)">
        <textarea
          id="comment"
          rows="3"
          maxLength={500}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="input h-auto"
        />
      </FormField>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-outline">
          Volver
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Guardando…" : "Enviar reseña"}
        </button>
      </div>
    </form>
  );
}
