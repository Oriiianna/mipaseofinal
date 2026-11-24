import { useState } from "react";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";
import FormField from "../../components/ui/FormField";
import { changePassword, getAuthErrorMessage } from "../../services/auth";
import { validatePasswordForm } from "../../utils/validators";

const EMPTY_FORM = { password: "", confirmPassword: "" };

/**
 * Formulario para cambiar la contraseña del usuario logueado.
 */
export default function PasswordForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validatePasswordForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    try {
      await changePassword(form.password);
      setForm(EMPTY_FORM);
      toast.success("Contraseña actualizada.");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="password-title"
      className="card p-6 space-y-4"
    >
      <h2 id="password-title" className="text-lg font-semibold text-gray-900">
        Cambiar contraseña
      </h2>

      <FormField
        id="password"
        label="Contraseña nueva"
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

      <FormField
        id="confirmPassword"
        label="Repetí la contraseña nueva"
        icon={Lock}
        error={errors.confirmPassword}
      >
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="input pl-10"
        />
      </FormField>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
