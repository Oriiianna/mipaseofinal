import PetTraits from "./PetTraits";
import { WALK_STATUS, formatWalkDate } from "../../utils/walks";

const ONE_HOUR = 60 * 60 * 1000;

/**
 * Tarjeta de un paseo con sus datos y las acciones según el rol.
 * @param {object} props
 * @param {object} props.walk Paseo con mascota, dueño y paseador
 * @param {"owner" | "walker" | "admin"} props.role Rol de quien mira la tarjeta
 * @param {number} props.now Hora actual en milisegundos
 * @param {boolean} props.busy Si hay una acción en curso sobre este paseo
 * @param {Function} props.onStatusChange Recibe (walk, estadoNuevo)
 * @param {Function} props.onCancel Recibe (walk)
 * @param {Function} [props.onReview] Recibe (walk)
 */
export default function WalkCard({
  walk,
  role,
  now,
  busy,
  onStatusChange,
  onCancel,
  onReview,
}) {
  const status = WALK_STATUS[walk.status];
  const owner = walk.pets.owners;
  const walker = walk.walkers.profiles;

  // Momentos del paseo
  const start = new Date(walk.scheduled_at).getTime();
  const hasStarted = now >= start;
  const hasEnded = now >= start + ONE_HOUR;

  // Dueño y admin cancelan si está pendiente o aceptado; el paseador, solo si lo aceptó.
  // Nadie cancela un paseo que ya empezó.
  const canCancel =
    !hasStarted &&
    (walk.status === "accepted" ||
      (walk.status === "pending" && role !== "walker"));

  return (
    <article className="card p-4 space-y-3">
      {/* 1. Encabezado: mascota, fecha y estado */}
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-lg">{walk.pets.name}</h3>
          <p className="text-sm text-gray-600">
            {formatWalkDate(walk.scheduled_at)}
          </p>
        </div>
        <span className={status.badge}>{status.label}</span>
      </header>

      {/* 2. Datos: dueño y mascota (los ven paseador y admin) y paseador (lo ven dueño y admin) */}
      {role !== "owner" && (
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Dueño:</strong> {owner.profiles.full_name} ·{" "}
            {owner.profiles.phone}
          </p>
          <p>
            <strong>Dirección:</strong> {owner.address},{" "}
            {owner.neighborhoods.name}
          </p>
          <PetTraits pet={walk.pets} />
          {walk.pets.feeding_notes && (
            <p>
              <strong>Alimentación:</strong> {walk.pets.feeding_notes}
            </p>
          )}
          {walk.pets.special_care && (
            <p>
              <strong>Cuidados especiales:</strong> {walk.pets.special_care}
            </p>
          )}
        </div>
      )}
      {role !== "walker" && (
        <p className="text-sm text-gray-700">
          <strong>Paseador:</strong> {walker.full_name} · {walker.phone}
        </p>
      )}

      {/* 3. Notas y motivo de cancelación */}
      {walk.notes && (
        <p className="text-sm text-gray-700">
          <strong>Notas:</strong> {walk.notes}
        </p>
      )}
      {walk.status === "cancelled" && walk.cancel_reason && (
        <p className="text-sm text-red-700">
          <strong>Motivo de la cancelación:</strong> {walk.cancel_reason}
        </p>
      )}

      {/* 4. Acciones según el rol y el estado */}
      <div className="flex flex-wrap gap-2">
        {role === "walker" && walk.status === "pending" && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onStatusChange(walk, "accepted")}
              className="btn-primary"
            >
              Aceptar
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onStatusChange(walk, "rejected")}
              className="btn-outline"
            >
              Rechazar
            </button>
          </>
        )}

        {role === "walker" && walk.status === "accepted" && (
          <button
            type="button"
            disabled={busy || !hasEnded}
            onClick={() => onStatusChange(walk, "done")}
            className="btn-primary"
          >
            Marcar como realizado
          </button>
        )}

        {role === "owner" && walk.status === "done" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onStatusChange(walk, "confirmed")}
            className="btn-primary"
          >
            Confirmar paseo
          </button>
        )}

        {role === "owner" && walk.status === "confirmed" && !walk.reviews && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onReview(walk)}
            className="btn-primary"
          >
            Dejar reseña
          </button>
        )}

        {canCancel && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onCancel(walk)}
            className="btn-outline text-red-600"
          >
            Cancelar paseo
          </button>
        )}
      </div>

      {role === "walker" && walk.status === "accepted" && !hasEnded && (
        <p className="text-xs text-gray-500">
          Vas a poder marcarlo como realizado cuando termine el horario del
          paseo.
        </p>
      )}
    </article>
  );
}
