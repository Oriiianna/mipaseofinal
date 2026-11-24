import { useState } from "react";
import toast from "react-hot-toast";
import FormField from "../ui/FormField";

/**
 * Formulario para cancelar un paseo indicando el motivo.
 * @param {{ onSubmit: (reason: string) => Promise<void>, onCancel: () => void }} props
 */
export default function CancelWalkForm({ onSubmit, onCancel }) {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!reason.trim()) {
      setReasonError("Contá por qué cancelás el paseo.");
      return;
    }
    setReasonError("");

    setSubmitting(true);
    try {
      await onSubmit(reason.trim());
    } catch (error) {
      toast.error(error.message || "No se pudo cancelar el paseo.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormField
        id="cancelReason"
        label="Motivo de la cancelación"
        error={reasonError}
      >
        <textarea
          id="cancelReason"
          rows="3"
          maxLength={300}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="input h-auto"
        />
      </FormField>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-outline">
          Volver
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Cancelando…" : "Cancelar paseo"}
        </button>
      </div>
    </form>
  );
}
