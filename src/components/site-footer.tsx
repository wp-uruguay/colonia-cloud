import Link from "next/link";

import { mainNav, serviceLinks } from "@/data/site";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700">
              CC
            </span>
            <span className="text-sm font-semibold text-slate-900">
              Colonia Cloud
            </span>
          </div>
          <p className="text-sm text-slate-600">
            Tecnología a medida para equipos que necesitan velocidad, claridad y
            resultados sostenibles.
          </p>
          <Link
            href="/contacto"
            className="btn-primary"
          >
            Hablemos de tu proyecto
          </Link>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Servicios
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            {serviceLinks.map((service) => (
              <li key={service.href}>
                <Link
                  href={service.href}
                  className="transition hover:text-slate-900"
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Compañía
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-slate-900">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl border-t border-slate-200 px-6 py-6 text-xs text-slate-500">
        © {new Date().getFullYear()} Colonia Cloud. Todos los derechos reservados.
      </div>
    </footer>
  );
}
