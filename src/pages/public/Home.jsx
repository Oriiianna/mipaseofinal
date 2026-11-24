import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { HOME_BY_ROLE } from "../../utils/roles";
import Footer from "../../components/layout/Footer";

const STEPS = [
  {
    title: "Buscá un paseador",
    text: "Filtrá por barrio y horario y mirá las reseñas de otros dueños.",
  },
  {
    title: "Pedí el paseo",
    text: "Elegí día y hora dentro de su disponibilidad y esperá que lo acepte.",
  },
  {
    title: "Confirmá y reseñá",
    text: "Cuando termina el paseo, lo confirmás y dejás tu opinión.",
  },
];

const AUDIENCES = [
  {
    id: "owners",
    title: "Para dueños",
    items: [
      "Cargá tus mascotas con sus cuidados y horarios preferidos.",
      "Encontrá paseadores en tu barrio.",
      "Seguí el estado de cada paseo.",
    ],
  },
  {
    id: "walkers",
    title: "Para paseadores",
    items: [
      "Armá tu perfil y tu disponibilidad semanal.",
      "Aceptá o rechazá las solicitudes.",
      "Sumá reseñas de los dueños.",
    ],
  },
];

/** Portada pública de MiPaseo. */
export default function Home() {
  const { profile, loading } = useAuth();

  if (loading) return <p className="p-8 text-gray-500">Cargando…</p>;
  if (profile) return <Navigate to={HOME_BY_ROLE[profile.role]} replace />;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logoperro.svg" alt="" className="h-9 w-9" />
            <span className="logo-mipaseo">
              <span className="mi">Mi</span>
              <span className="paseo">Paseo</span>
            </span>
          </Link>
          <nav aria-label="Acceso" className="flex gap-2">
            <Link to="/ingresar" className="btn-outline">
              Ingresar
            </Link>
            <Link to="/registro" className="btn-primary">
              Registrarme
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section aria-labelledby="hero-title" className="relative">
          <img
            src="/banner-img1.webp"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative max-w-6xl mx-auto px-4 py-40 text-center">
            <h1 id="hero-title" className="text-4xl font-bold text-white">
              Paseadores de confianza en tu barrio
            </h1>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-gray-100">
              Encontrá un paseador en CABA, elegí el horario que te queda cómodo
              y seguí cada paseo desde la app.
            </p>
            <Link to="/registro" className="btn-primary mt-8">
              Empezar ahora
            </Link>
          </div>
        </section>
        <section
          aria-labelledby="steps-title"
          className="max-w-6xl mx-auto px-4 py-16"
        >
          <h2
            id="steps-title"
            className="text-center text-2xl font-bold text-gray-900"
          >
            Cómo funciona
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="card p-6">
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 place-items-center rounded-full bg-primary-500 font-semibold text-white"
                >
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-gray-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section
          aria-labelledby="audiences-title"
          className="max-w-6xl mx-auto px-4 pb-16"
        >
          <h2
            id="audiences-title"
            className="text-center text-2xl font-bold text-gray-900"
          >
            ¿Para quién es MiPaseo?
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {AUDIENCES.map((audience) => (
              <article key={audience.id} className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {audience.title}
                </h3>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600">
                  {audience.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link to="/registro" className="btn-outline mt-6">
                  Crear cuenta
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
