import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Automatizaciones con y sin IA",
  description:
    "Integramos herramientas y automatizamos procesos con o sin inteligencia artificial.",
};

const deliverables = [
  "Mapeo de procesos y puntos críticos",
  "Integraciones entre CRM, ERP, eCommerce y soporte",
  "Workflows con validaciones y alertas",
  "Automatizaciones con IA para clasificación y respuestas",
  "Tableros de seguimiento y control",
];

const outcomes = [
  {
    title: "Menos tareas manuales",
    description:
      "Liberamos tiempo del equipo y reducimos errores operativos.",
  },
  {
    title: "Procesos conectados",
    description:
      "Información sincronizada entre todas tus plataformas.",
  },
];

const stack = [
  "Integraciones API",
  "Workflows custom",
  "RPA ligero",
  "Modelos IA aplicados",
  "Observabilidad",
];

export default function AutomatizacionesPage() {
  return (
    <main>
      <section className="border-b border-slate-200">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Servicios
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900 sm:text-5xl">
            Automatizaciones con y sin IA para escalar tu operación.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Diseñamos flujos que conectan tus herramientas y eliminan fricciones
            en cada etapa del negocio.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contacto"
              className="btn-primary"
            >
              Solicitar propuesta
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
              Qué incluye
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Flujos inteligentes de principio a fin.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {deliverables.map((item) => (
              <div key={item} className="glass rounded-2xl px-5 py-4 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-16">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Impacto esperado
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Procesos más rápidos y trazables.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {outcomes.map((item) => (
              <div key={item.title} className="glass rounded-2xl p-6">
                <p className="text-lg font-semibold text-slate-900">
                  {item.title}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-16">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Stack
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Automatización flexible y escalable.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {stack.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase text-slate-600"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
