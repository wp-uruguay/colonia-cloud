import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Equipo especializado en producto digital, automatización y cloud para negocios en crecimiento.",
};

const values = [
  {
    title: "Claridad operativa",
    description:
      "Traducimos objetivos de negocio en sistemas simples y medibles.",
  },
  {
    title: "Ejecución precisa",
    description:
      "Metodologías ágiles, diseño con intención y entregas continuas.",
  },
  {
    title: "Socios de largo plazo",
    description:
      "Nos involucramos en la evolución y no solo en el lanzamiento.",
  },
];

const pillars = [
  {
    title: "Producto digital",
    description:
      "UX, UI y desarrollo alineado a métricas de negocio.",
  },
  {
    title: "Automatización",
    description:
      "Integraciones que conectan tus herramientas y eliminan tareas manuales.",
  },
  {
    title: "Infraestructura",
    description:
      "Cloud segura, escalable y preparada para crecer contigo.",
  },
];

export default function NosotrosPage() {
  return (
    <main>
      <section className="border-b border-slate-200">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Nosotros
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900 sm:text-5xl">
            Un equipo compacto con visión de negocio y foco en resultados.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Colonia Cloud es un estudio tecnológico que combina estrategia,
            diseño y desarrollo para construir sistemas que realmente se usan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contacto"
              className="btn-primary"
            >
              Conversemos
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
              Principios
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Lo que guía cada proyecto.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="glass rounded-2xl p-6">
                <p className="text-lg font-semibold text-slate-900">
                  {value.title}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-16">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Capacidades
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Somos multidisciplinarios para que no dependas de terceros.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="glass rounded-2xl p-6">
                <p className="text-lg font-semibold text-slate-900">
                  {pillar.title}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
