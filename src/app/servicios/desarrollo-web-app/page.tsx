import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Desarrollo Web y App",
  description:
    "Diseño y desarrollo de plataformas web y apps con UX moderna y alto rendimiento.",
};

const deliverables = [
  "Diseño UX/UI y prototipos interactivos",
  "Desarrollo web y apps responsive",
  "Arquitectura frontend y backend escalable",
  "Integraciones con APIs y servicios externos",
  "Pruebas, performance y seguridad",
];

const outcomes = [
  {
    title: "Experiencias rápidas",
    description:
      "Aplicaciones optimizadas para conversión y retención de usuarios.",
  },
  {
    title: "Escalabilidad",
    description:
      "Código listo para crecer sin fricción ni retrabajo.",
  },
];

const stack = [
  "Next.js / React",
  "Node.js",
  "PostgreSQL",
  "Cloud Functions",
  "CI/CD automatizado",
];

export default function DesarrolloWebAppPage() {
  return (
    <main>
      <section className="border-b border-slate-200">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Servicios
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900 sm:text-5xl">
            Desarrollo web y app con foco en resultados.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Construimos productos digitales modernos, rápidos y seguros para
            convertir visitas en clientes.
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
              Una base sólida para crecer.
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
              Resultados visibles desde el primer release.
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
              Tecnología moderna, fácil de mantener.
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
