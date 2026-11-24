import { Heart, ShieldAlert, TriangleAlert } from "lucide-react";

/**
 * Características de una mascota, con ícono y texto.
 * Muestra solo lo que el paseador necesita saber.
 * @param {{ pet: { is_sociable: boolean, needs_muzzle: boolean } }} props
 */
export default function PetTraits({ pet }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {pet.is_sociable ? (
        <li className="badge-success gap-1">
          <Heart className="h-4 w-4" aria-hidden="true" />
          Sociable con otros perros
        </li>
      ) : (
        <li className="badge-warning gap-1">
          <TriangleAlert className="h-4 w-4" aria-hidden="true" />
          No se lleva bien con otros perros
        </li>
      )}
      {pet.needs_muzzle && (
        <li className="badge-error gap-1">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Necesita bozal
        </li>
      )}
    </ul>
  );
}
