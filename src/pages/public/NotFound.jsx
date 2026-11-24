import { Link } from "react-router-dom";

/** Página que se muestra cuando la dirección no existe. */
export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <img src="/logoperro.svg" alt="" className="h-20 w-20" />
      <h1 className="text-3xl font-bold text-gray-900">Página no encontrada</h1>
      <p className="text-gray-600">
        La dirección que buscás no existe o cambió.
      </p>
      <Link to="/" className="btn-primary">
        Volver al inicio
      </Link>
    </main>
  );
}
