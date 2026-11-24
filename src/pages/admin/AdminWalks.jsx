import WalksBoard from "../../components/shared/WalksBoard";

/**
 * Página con todos los paseos de la plataforma, para el admin.
 */
export default function AdminWalks() {
  return (
    <section aria-labelledby="admin-walks-title" className="space-y-6">
      <h1 id="admin-walks-title" className="text-2xl font-bold text-gray-900">
        Paseos
      </h1>
      <WalksBoard role="admin" />
    </section>
  );
}
