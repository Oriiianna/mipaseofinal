import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Dog, Footprints, User, Mail, Phone, Lock, MapPin } from "lucide-react";
import FormField from "../../components/ui/FormField";
import { getNeighborhoods } from "../../services/catalogs";
import { signUp, getAuthErrorMessage } from "../../services/auth";
import { validateRegisterForm } from "../../utils/validators";
import { HOME_BY_ROLE } from "../../utils/roles";

const ROLE_OPTIONS = [
  {
    value: "owner",
    label: "Dueño",
    description: "Busco paseadores",
    icon: Dog,
  },
  {
    value: "walker",
    label: "Paseador",
    description: "Paseo perros",
    icon: Footprints,
  },
];

const INITIAL_FORM = {
  role: "owner",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  neighborhoodId: "",
  address: "",
  experienceYears: "",
  bio: "",
};

/** Formulario de registro: elige el rol y pide los datos según el rol. */
export default function Register() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getNeighborhoods()
      .then(setNeighborhoods)
      .catch(() => toast.error("No se pudieron cargar los barrios."));
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateRegisterForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await signUp(form);
      if (form.role === "walker") {
        toast.success(
          "¡Cuenta creada! Marcá tu disponibilidad para recibir paseos.",
        );
        navigate("/paseador/perfil");
      } else {
        toast.success("¡Cuenta creada!");
        navigate(HOME_BY_ROLE[form.role]);
      }
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <header className="text-center">
          <img src="/logoperro.svg" alt="" className="h-20 w-20 mx-auto" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Crear cuenta
          </h1>
          <p className="mt-2 text-gray-600">
            ¿Ya tenés cuenta?{" "}
            <Link
              to="/ingresar"
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              Ingresá
            </Link>
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="card p-8 space-y-4">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">
              ¿Cómo vas a usar MiPaseo?
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {ROLE_OPTIONS.map(({ value, label, description, icon: Icon }) => (
                <label
                  key={value}
                  className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500 ${
                    form.role === value
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-primary-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={form.role === value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <Icon
                    className="h-7 w-7 mx-auto mb-2 text-primary-600"
                    aria-hidden="true"
                  />
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-xs text-gray-500">
                    {description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <FormField
            id="fullName"
            label="Nombre completo"
            icon={User}
            error={errors.fullName}
          >
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={handleChange}
              className="input pl-10"
            />
          </FormField>

          <FormField id="email" label="Email" icon={Mail} error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="input pl-10"
            />
          </FormField>

          <FormField
            id="phone"
            label="Teléfono"
            icon={Phone}
            error={errors.phone}
          >
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={handleChange}
              className="input pl-10"
            />
          </FormField>

          <FormField
            id="neighborhoodId"
            label="Barrio"
            error={errors.neighborhoodId}
          >
            <select
              id="neighborhoodId"
              name="neighborhoodId"
              value={form.neighborhoodId}
              onChange={handleChange}
              className="input"
            >
              <option value="">Elegí tu barrio</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </FormField>

          {form.role === "owner" && (
            <FormField
              id="address"
              label="Dirección"
              icon={MapPin}
              error={errors.address}
            >
              <input
                id="address"
                name="address"
                type="text"
                autoComplete="street-address"
                value={form.address}
                onChange={handleChange}
                className="input pl-10"
              />
            </FormField>
          )}

          {form.role === "walker" && (
            <>
              <FormField
                id="experienceYears"
                label="Años de experiencia"
                error={errors.experienceYears}
              >
                <input
                  id="experienceYears"
                  name="experienceYears"
                  type="number"
                  min="0"
                  max="50"
                  value={form.experienceYears}
                  onChange={handleChange}
                  className="input"
                />
              </FormField>

              <FormField
                id="bio"
                label="Sobre vos (opcional)"
                error={errors.bio}
              >
                <textarea
                  id="bio"
                  name="bio"
                  rows="3"
                  maxLength={500}
                  value={form.bio}
                  onChange={handleChange}
                  className="input h-auto"
                />
              </FormField>
            </>
          )}

          <FormField
            id="password"
            label="Contraseña"
            icon={Lock}
            error={errors.password}
          >
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className="input pl-10"
            />
          </FormField>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>
      </div>
    </main>
  );
}
