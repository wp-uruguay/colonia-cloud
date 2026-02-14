import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CRM y ERP a medida",
  description:
    "Plataformas comerciales y operativas diseñadas para tu proceso real.",
};

const deliverables = [
  "Diagnóstico de procesos comerciales y operativos",
  "Diseño de módulos a medida",
  "Gestión de leads, ventas y postventa",
  "Inventario, órdenes y facturación",
  "Reportería y analítica en tiempo real",
];

const outcomes = [
  {
    title: "Operación centralizada",
    description:
      "Toda la información en un solo lugar y accesible para el equipo.",
  },
  {
    title: "Mejor toma de decisiones",
    description:
      "Indicadores claros para ventas, finanzas y operaciones.",
  },
];

const stack = [
  "Arquitectura modular",
  "Integraciones con ERP externos",
  "Automatización de reportes",
  "Roles y permisos",
  "Backups y continuidad",
];

export default function CrmErpPage() {
  return (
    <main>
      <section className="border-b border-slate-200">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Servicios
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900 sm:text-5xl">
            CRM y ERP a medida para operar con claridad.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Diseñamos plataformas alineadas a tu proceso real, sin rigidez ni
            módulos innecesarios.
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
              Sistemas que reflejan tu operación.
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
              Visibilidad completa y procesos controlados.
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
              Tecnología robusta para procesos críticos.
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
