import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { signOut } from "../../services/auth";
import { HOME_BY_ROLE, NAV_BY_ROLE, ROLE_LABELS } from "../../utils/roles";
import SuspendedModal from "./SuspendedModal";
import Footer from "./Footer";

/**
 * Estructura de las páginas privadas: barra de navegación según el rol,
 * contenido de la página (Outlet) y pie.
 */
export default function Layout() {
  const { profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/ingresar", { replace: true });
    } catch {
      toast.error("No se pudo cerrar la sesión.");
    }
  }

  function linkClass({ isActive }) {
    return `block px-4 py-2 rounded-lg font-medium transition-colors ${
      isActive
        ? "bg-primary-50 text-primary-700"
        : "text-gray-700 hover:bg-gray-100"
    }`;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to={HOME_BY_ROLE[profile.role]}
            className="flex items-center gap-2"
          >
            <img src="/logoperro.svg" alt="" className="h-9 w-9" />
            <span className="logo-mipaseo">
              <span className="mi">Mi</span>
              <span className="paseo">Paseo</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          <nav
            id="main-nav"
            aria-label="Principal"
            className={`${menuOpen ? "block" : "hidden"} absolute top-16 inset-x-0 bg-white border-b p-4
              md:static md:flex md:items-center md:border-0 md:p-0`}
          >
            <ul className="space-y-1 md:space-y-0 md:flex md:gap-1">
              {NAV_BY_ROLE[profile.role].map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={linkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <NavLink
                  to="/cuenta"
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Mi cuenta
                </NavLink>
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t flex items-center gap-3 md:mt-0 md:pt-0 md:border-0 md:ml-4">
              <p className="text-sm leading-tight">
                <span className="block font-semibold">{profile.full_name}</span>
                <span className="text-gray-500">
                  {ROLE_LABELS[profile.role]}
                </span>
              </p>
              <button
                type="button"
                onClick={handleSignOut}
                className="btn-outline gap-2"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Salir
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
      {profile.is_suspended && <SuspendedModal onSignOut={handleSignOut} />}
    </div>
  );
}
