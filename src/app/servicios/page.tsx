import type { Metadata } from "next";
import Link from "next/link";

import { serviceLinks } from "@/data/site";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Desarrollo web y app, automatizaciones, CRM/ERP a medida, cloud services y soporte técnico.",
};

const differentiators = [
  {
    title: "Entrega rápida",
    description:
      "Sprints cortos y visibilidad constante del avance.",
  },
  {
    title: "Escalabilidad real",
    description:
      "Arquitecturas pensadas para crecer sin deuda técnica.",
  },
  {
    title: "Equipo senior",
    description:
      "Especialistas en producto, backend, cloud y automatización.",
  },
];

export default function ServiciosPage() {
  return (
    <main>
      <section className="border-b border-slate-200">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Servicios
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900 sm:text-5xl">
            Soluciones digitales completas, de punta a punta.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Diseñamos, desarrollamos y operamos tecnología para equipos que
            necesitan velocidad sin perder control.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contacto"
              className="btn-primary"
            >
              Solicitar propuesta
            </Link>
            <Link
              href="/nosotros"
              className="btn-primary"
            >
              Conocer al equipo
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-16">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Líneas de servicio
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Cada servicio está diseñado para generar impacto medible.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {serviceLinks.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                className="glass group rounded-2xl p-6 transition hover:-translate-y-1"
              >
                <p className="text-lg font-semibold text-slate-900">
                  {service.title}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {service.description}
                </p>
                <span className="mt-6 inline-flex text-xs font-semibold uppercase text-accent">
                  Ver detalle
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-16">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Diferenciales
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Tecnología moderna con foco en negocio.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {differentiators.map((item) => (
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
    </main>
  );
}
