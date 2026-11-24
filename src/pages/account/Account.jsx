import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";

/**
 * Página para que el usuario edite sus datos y contraseña.
 */
export default function Account() {
  return (
    <section aria-labelledby="account-title" className="max-w-2xl space-y-6">
      <h1 id="account-title" className="text-2xl font-bold text-gray-900">
        Mi cuenta
      </h1>
      <ProfileForm />
      <PasswordForm />
    </section>
  );
}
