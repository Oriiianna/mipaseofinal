import WalksBoard from "../../components/shared/WalksBoard";

/**
 * Página con los paseos que pidió el dueño.
 */
export default function OwnerWalks() {
  return (
    <section aria-labelledby="owner-walks-title" className="space-y-6">
      <h1 id="owner-walks-title" className="text-2xl font-bold text-gray-900">
        Mis paseos
      </h1>
      <WalksBoard role="owner" />
    </section>
  );
}
