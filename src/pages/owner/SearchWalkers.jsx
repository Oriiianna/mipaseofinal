import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { MapPin, Star } from "lucide-react";
import Avatar from "../../components/ui/Avatar";
import FormField from "../../components/ui/FormField";
import { getNeighborhoods, getTimeSlots } from "../../services/catalogs";
import { searchWalkers } from "../../services/walkers";
import { getWalkerRatings } from "../../services/reviews";

/** Búsqueda de paseadores con filtros por barrio y franja. */
export default function SearchWalkers() {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [walkers, setWalkers] = useState([]);
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [timeSlotId, setTimeSlotId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getNeighborhoods(), getTimeSlots(), getWalkerRatings()])
      .then(([neighborhoodList, timeSlotList, ratingList]) => {
        setNeighborhoods(neighborhoodList);
        setTimeSlots(timeSlotList);
        setRatings(ratingList);
      })
      .catch(() => toast.error("No se pudieron cargar los filtros."));
  }, []);

  useEffect(() => {
    searchWalkers(neighborhoodId ? Number(neighborhoodId) : null)
      .then(setWalkers)
      .catch(() => toast.error("No se pudieron cargar los paseadores."))
      .finally(() => setLoading(false));
  }, [neighborhoodId]);

  function handleNeighborhoodChange(event) {
    setLoading(true);
    setNeighborhoodId(event.target.value);
  }

  const visibleWalkers = timeSlotId
    ? walkers.filter((walker) =>
        walker.walker_availability.some(
          (slot) => slot.time_slot_id === Number(timeSlotId),
        ),
      )
    : walkers;

  return (
    <section aria-labelledby="search-title" className="space-y-6">
      <h1 id="search-title" className="text-2xl font-bold text-gray-900">
        Buscar paseadores
      </h1>

      <div className="card p-4 grid gap-4 sm:grid-cols-2">
        <FormField id="neighborhood" label="Barrio">
          <select
            id="neighborhood"
            value={neighborhoodId}
            onChange={handleNeighborhoodChange}
            className="input"
          >
            <option value="">Todos los barrios</option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="timeSlot" label="Franja horaria">
          <select
            id="timeSlot"
            value={timeSlotId}
            onChange={(event) => setTimeSlotId(event.target.value)}
            className="input"
          >
            <option value="">Cualquier franja</option>
            {timeSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {loading ? (
        <p className="text-gray-500">Buscando paseadores…</p>
      ) : visibleWalkers.length === 0 ? (
        <p className="text-gray-600">
          No hay paseadores con esos filtros. Probá con otro barrio o franja.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleWalkers.map((walker) => {
            const rating = ratings.find(
              (r) => r.walker_id === walker.profile_id,
            );
            return (
              <li key={walker.profile_id}>
                <article className="card p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={walker.profiles.full_name}
                      url={walker.profiles.avatar_url}
                    />
                    <div>
                      <h2 className="font-semibold text-lg">
                        {walker.profiles.full_name}
                      </h2>
                      <p className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" aria-hidden="true" />
                        {walker.neighborhoods.name}
                      </p>
                    </div>
                  </div>
                  <p className="flex items-center gap-1 text-sm text-gray-700">
                    <Star
                      className="h-4 w-4 text-yellow-500"
                      aria-hidden="true"
                    />
                    {rating
                      ? `${rating.average} (${rating.total} ${rating.total === 1 ? "reseña" : "reseñas"})`
                      : "Sin reseñas todavía"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {walker.experience_years} años de experiencia
                  </p>
                  <Link
                    to={`/paseadores/${walker.profile_id}`}
                    className="btn-outline w-full"
                  >
                    Ver perfil
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
