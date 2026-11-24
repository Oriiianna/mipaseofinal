import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock } from "lucide-react";
import FormField from "../../components/ui/FormField";
import { signIn, getAuthErrorMessage } from "../../services/auth";
import { validateLoginForm } from "../../utils/validators";
import { HOME_BY_ROLE } from "../../utils/roles";
import { useAuth } from "../../hooks/useAuth";

/** Formulario de ingreso con email y contraseña. */
export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) navigate(HOME_BY_ROLE[profile.role], { replace: true });
  }, [profile, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateLoginForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await signIn(form.email, form.password);
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <header className="text-center">
          <img src="/logoperro.svg" alt="" className="h-20 w-20 mx-auto" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Ingresar</h1>
          <p className="mt-2 text-gray-600">
            ¿No tenés cuenta?{" "}
            <Link
              to="/registro"
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              Registrate
            </Link>
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="card p-8 space-y-4">
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
            id="password"
            label="Contraseña"
            icon={Lock}
            error={errors.password}
          >
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className="input pl-10"
            />
          </FormField>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
