import { useState } from "react";
import toast from "react-hot-toast";
import { User, Phone } from "lucide-react";
import FormField from "../../components/ui/FormField";
import { useAuth } from "../../hooks/useAuth";
import { updateProfile } from "../../services/profiles";
import { uploadImage } from "../../services/storage";
import { validateAccountForm } from "../../utils/validators";
import Avatar from "../../components/ui/Avatar";

/**
 * Formulario para editar el nombre, el teléfono y la foto de perfil.
 */
export default function ProfileForm() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    fullName: profile.full_name,
    phone: profile.phone,
    avatarFile: null,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAvatarChange(event) {
    const file = event.target.files[0] ?? null;
    setForm((prev) => ({ ...prev, avatarFile: file }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateAccountForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    try {
      const changes = {
        full_name: form.fullName.trim(),
        phone: form.phone.trim(),
      };
      if (form.avatarFile) {
        changes.avatar_url = await uploadImage(
          "avatars",
          user.id,
          "avatar",
          form.avatarFile,
        );
      }
      await updateProfile(user.id, changes);
      await refreshProfile();
      toast.success("Datos actualizados.");
    } catch {
      toast.error("No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="profile-title"
      className="card p-6 space-y-4"
    >
      <h2 id="profile-title" className="text-lg font-semibold text-gray-900">
        Datos personales
      </h2>

      <div className="flex items-center gap-4">
        <Avatar
          name={profile.full_name}
          url={profile.avatar_url}
          size="h-16 w-16"
        />
        <div className="flex-1">
          <FormField
            id="avatar"
            label="Foto de perfil (opcional)"
            error={errors.avatarFile}
          >
            <input
              id="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-primary-700 hover:file:bg-primary-100"
            />
          </FormField>
        </div>
      </div>

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

      <FormField id="phone" label="Teléfono" icon={Phone} error={errors.phone}>
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

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
