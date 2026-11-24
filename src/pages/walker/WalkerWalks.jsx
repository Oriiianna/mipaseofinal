import WalksBoard from "../../components/shared/WalksBoard";

/**
 * Página con los paseos que le pidieron al paseador.
 */
export default function WalkerWalks() {
  return (
    <section aria-labelledby="walker-walks-title" className="space-y-6">
      <h1 id="walker-walks-title" className="text-2xl font-bold text-gray-900">
        Mis paseos
      </h1>
      <WalksBoard role="walker" />
    </section>
  );
}
