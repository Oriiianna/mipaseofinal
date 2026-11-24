import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getUsers } from "../../services/admin";
import { updateProfile } from "../../services/profiles";
import { ROLE_LABELS } from "../../utils/roles";

/** Lista de dueños y paseadores, con la opción de suspender o reactivar. */
export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => toast.error("No se pudieron cargar los usuarios."))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggleSuspended(user) {
    setBusyId(user.id);
    try {
      await updateProfile(user.id, { is_suspended: !user.is_suspended });
      toast.success(
        user.is_suspended
          ? `${user.full_name} fue reactivado.`
          : `${user.full_name} fue suspendido.`,
      );
      setUsers(await getUsers());
    } catch {
      toast.error("No se pudo cambiar el estado del usuario.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section aria-labelledby="users-title" className="space-y-6">
      <h1 id="users-title" className="text-2xl font-bold text-gray-900">
        Usuarios
      </h1>

      {loading ? (
        <p className="text-gray-500">Cargando usuarios…</p>
      ) : users.length === 0 ? (
        <p className="text-gray-600">Todavía no hay usuarios registrados.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Dueños y paseadores registrados
            </caption>
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th scope="col" className="p-3">
                  Nombre
                </th>
                <th scope="col" className="p-3">
                  Rol
                </th>
                <th scope="col" className="p-3">
                  Teléfono
                </th>
                <th scope="col" className="p-3">
                  Alta
                </th>
                <th scope="col" className="p-3">
                  Estado
                </th>
                <th scope="col" className="p-3">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-3 font-medium">
                    {user.role === "walker" ? (
                      <Link
                        to={`/paseadores/${user.id}`}
                        className="text-primary-600 hover:underline"
                      >
                        {user.full_name}
                      </Link>
                    ) : (
                      user.full_name
                    )}
                  </td>
                  <td className="p-3">{ROLE_LABELS[user.role]}</td>
                  <td className="p-3">{user.phone}</td>
                  <td className="p-3">
                    {new Date(user.created_at).toLocaleDateString("es-AR")}
                  </td>
                  <td className="p-3">
                    <span
                      className={
                        user.is_suspended ? "badge-error" : "badge-success"
                      }
                    >
                      {user.is_suspended ? "Suspendido" : "Activo"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      disabled={busyId === user.id}
                      onClick={() => handleToggleSuspended(user)}
                      className="btn-outline"
                    >
                      {user.is_suspended ? "Reactivar" : "Suspender"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
