import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAdminStats } from "../../services/admin";
import { getMyWalks } from "../../services/walks";
import { WALK_STATUS, formatWalkDate } from "../../utils/walks";

const TWO_DAYS = 48 * 60 * 60 * 1000;

/** Panel del admin: totales, paseos por estado y realizados sin confirmar. */
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [walks, setWalks] = useState([]);
  const [now, setNow] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminStats(), getMyWalks()])
      .then(([statsData, walkList]) => {
        setStats(statsData);
        setWalks(walkList);
        setNow(Date.now());
      })
      .catch(() => toast.error("No se pudo cargar el panel."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Cargando panel…</p>;
  if (!stats)
    return <p className="text-gray-600">No se pudo cargar el panel.</p>;

  const totals = [
    { label: "Dueños", value: stats.owners },
    { label: "Paseadores", value: stats.walkers },
    { label: "Mascotas", value: stats.pets },
    { label: "Paseos", value: stats.walks },
  ];

  // Paseos marcados como realizados que el dueño no confirmó en 48 horas
  const unconfirmed = walks.filter(
    (walk) =>
      walk.status === "done" &&
      now - new Date(walk.scheduled_at).getTime() > TWO_DAYS,
  );

  return (
    <section aria-labelledby="dashboard-title" className="space-y-8">
      <h1 id="dashboard-title" className="text-2xl font-bold text-gray-900">
        Panel
      </h1>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {totals.map((item) => (
          <div key={item.label} className="card p-4">
            <dt className="text-sm text-gray-600">{item.label}</dt>
            <dd className="text-3xl font-bold text-gray-900">{item.value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="status-title" className="space-y-3">
        <h2 id="status-title" className="text-lg font-semibold text-gray-900">
          Paseos por estado
        </h2>
        <ul className="flex flex-wrap gap-2">
          {Object.entries(WALK_STATUS).map(([status, info]) => (
            <li key={status} className={info.badge}>
              {info.label}:{" "}
              {walks.filter((walk) => walk.status === status).length}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="alert-title" className="space-y-3">
        <h2 id="alert-title" className="text-lg font-semibold text-gray-900">
          Realizados sin confirmar hace más de 48 horas
        </h2>
        {unconfirmed.length === 0 ? (
          <p className="text-gray-600">No hay paseos esperando confirmación.</p>
        ) : (
          <ul className="space-y-2">
            {unconfirmed.map((walk) => (
              <li key={walk.id} className="card p-3 text-sm text-gray-700">
                <strong>{walk.pets.name}</strong> · paseador:{" "}
                {walk.walkers.profiles.full_name} · dueño:{" "}
                {walk.pets.owners.profiles.full_name} ·{" "}
                {formatWalkDate(walk.scheduled_at)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
