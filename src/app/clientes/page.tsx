import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Clientes",
  description:
    "Trabajamos con equipos que buscan mejorar operaciones, ventas y experiencia digital.",
};

const segments = [
  "Retail y eCommerce",
  "Logística y supply chain",
  "Servicios financieros",
  "Salud y bienestar",
  "Educación y capacitación",
  "Servicios profesionales",
];

const useCases = [
  {
    title: "Modernización de plataformas",
    description:
      "Replanteamos productos existentes para hacerlos rápidos, seguros y escalables.",
  },
  {
    title: "Automatización de operaciones",
    description:
      "Conectamos sistemas para reducir tiempos y errores en procesos críticos.",
  },
  {
    title: "Datos accionables",
    description:
      "Dashboards, reportes y flujos que convierten datos en decisiones.",
  },
];

export default function ClientesPage() {
  return (
    <main>
      <section className="border-b border-slate-200">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Clientes
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900 sm:text-5xl">
            Equipos que quieren mover su negocio más rápido.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Trabajamos con compañías que necesitan productos digitales sólidos,
            automatización inteligente y una operación tecnológica confiable.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contacto"
              className="btn-primary"
            >
              Quiero una propuesta
            </Link>
            <Link
              href="/servicios"
              className="btn-primary"
            >
              Ver servicios
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-16">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Sectores
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Experiencia transversal, enfoque personalizado.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {segments.map((segment) => (
              <div key={segment} className="glass rounded-2xl p-6 text-sm text-slate-600">
                {segment}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-16">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Casos de uso
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Escenarios reales donde generamos impacto.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="glass rounded-2xl p-6">
                <p className="text-lg font-semibold text-slate-900">
                  {useCase.title}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
