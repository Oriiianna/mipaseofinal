/**
 * Bloquea la app cuando la cuenta está suspendida.
 * Solo permite cerrar sesión.
 * @param {{ onSignOut: () => void }} props
 */
export default function SuspendedModal({ onSignOut }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="suspended-title"
        className="card max-w-sm p-6 text-center space-y-4"
      >
        <h2 id="suspended-title" className="text-xl font-bold text-gray-900">
          Tu cuenta está suspendida
        </h2>
        <p className="text-gray-600">
          Para más información, escribinos a{" "}
          <strong>soporte@mipaseo.com</strong>.
        </p>
        <button
          type="button"
          onClick={onSignOut}
          className="btn-primary w-full"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
