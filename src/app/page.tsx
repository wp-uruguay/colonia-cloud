import Image from "next/image";
import Link from "next/link";

import { serviceLinks } from "@/data/site";
import ColorBends from "@/components/ColorBends";

const highlights = [
  {
    title: "Estrategia y foco",
    description:
      "Alineamos objetivos, métricas y roadmap antes de escribir una sola línea de código.",
  },
  {
    title: "Stack moderno",
    description:
      "Frontend veloz, backends escalables y automatizaciones conectadas a tus herramientas.",
  },
  {
    title: "Operación continua",
    description:
      "Monitoreo, soporte y mejoras para mantener el rendimiento en el tiempo.",
  },
];

const steps = [
  {
    title: "Descubrimiento",
    description:
      "Entendemos tu operación, mapeamos procesos y definimos el impacto esperado.",
  },
  {
    title: "Construcción",
    description:
      "Diseñamos, desarrollamos y validamos en ciclos cortos con entregas visibles.",
  },
  {
    title: "Evolución",
    description:
      "Medimos resultados, optimizamos y escalamos con nuevas capacidades.",
  },
];

const clientTypes = [
  "Retail y eCommerce",
  "Servicios profesionales",
  "Logística y operación",
  "SaaS y plataformas",
  "Equipos internos de TI",
  "Startups en crecimiento",
];

export default function Home() {
  return (
    <main>
      <section className="relative -mt-[8rem] overflow-hidden pt-[9rem] sm:-mt-24 sm:pt-28 lg:-mt-28 lg:pt-32">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/video/drone.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/65" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center">
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              Construimos plataformas digitales que aceleran tu negocio.
            </h1>
            <p className="max-w-2xl text-lg text-white/75">
              Desarrollo web, apps, automatizaciones e infraestructura cloud con
              un enfoque en performance, seguridad y resultados medibles.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/servicios"
                className="btn-primary sm:px-6 sm:py-3"
              >
                Ver servicios
              </Link>
              <Link
                href="/contacto"
                className="btn-primary sm:px-6 sm:py-3"
              >
                Contactar
              </Link>
            </div>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-3 lg:max-w-md">
            {highlights.map((item) => (
              <div key={item.title} className="liquid-card rounded-2xl p-4">
                <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-4">
                  {item.title === "Estrategia y foco" && (
                    <div className="icon-animate flex flex-shrink-0 items-center justify-center">
                      <Image
                        src="/images/ui/crosshair.svg"
                        alt="Crosshair"
                        width={28}
                        height={28}
                        className="brightness-0 invert"
                      />
                    </div>
                  )}
                  {item.title === "Stack moderno" && (
                    <div className="icon-animate flex flex-shrink-0 items-center justify-center">
                      <Image
                        src="/images/ui/ai.svg"
                        alt="AI"
                        width={28}
                        height={28}
                        className="brightness-0 invert"
                      />
                    </div>
                  )}
                  {item.title === "Operación continua" && (
                    <div className="icon-animate flex flex-shrink-0 items-center justify-center">
                      <Image
                        src="/images/ui/org.svg"
                        alt="Org"
                        width={28}
                        height={28}
                        className="brightness-0 invert"
                      />
                    </div>
                  )}
                  <div className="flex-1 sm:flex-none">
                    <p className="text-base font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-2 text-xs text-white/80">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="relative mx-auto w-full max-w-6xl overflow-hidden px-6 py-8">
          <div className="flex items-center gap-8">
            <p className="flex-shrink-0 text-sm font-semibold text-black">
              Trabajamos con:
            </p>
            <div className="relative flex-1 overflow-hidden">
              <div className="absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-slate-50 to-transparent" />
              <div className="flex items-center gap-12">
                <div className="animate-scroll flex shrink-0 items-center gap-12">
                  <img src="https://img.shields.io/badge/WordPress-21759B?style=flat&logo=wordpress&logoColor=white" alt="WordPress" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Google_Cloud-4285F4?style=flat&logo=googlecloud&logoColor=white" alt="Google Cloud" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black" alt="React" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://cdn.simpleicons.org/woocommerce/96588A" alt="WooCommerce" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white" alt="Next.js" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Flutter-02569B?style=flat&logo=flutter&logoColor=white" alt="Flutter" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white" alt="Python" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="JavaScript" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Laravel-FF2D20?style=flat&logo=laravel&logoColor=white" alt="Laravel" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/AWS-232F3E?style=flat&logo=awslambda&logoColor=white" alt="AWS" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/OpenAI-412991?style=flat&logo=databricks&logoColor=white" alt="OpenAI" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Claude-181818?style=flat&logo=anthropic&logoColor=white" alt="Claude" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white" alt="Angular" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Alpine.js-8BC0D0?style=flat&logo=alpinedotjs&logoColor=black" alt="Alpine.js" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/PHP-777BB4?style=flat&logo=php&logoColor=white" alt="PHP" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Antel-00A2E8?style=flat&logoColor=white" alt="Antel" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                </div>
                <div className="animate-scroll flex shrink-0 items-center gap-12" aria-hidden="true">
                  <img src="https://img.shields.io/badge/WordPress-21759B?style=flat&logo=wordpress&logoColor=white" alt="WordPress" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Google_Cloud-4285F4?style=flat&logo=googlecloud&logoColor=white" alt="Google Cloud" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black" alt="React" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://cdn.simpleicons.org/woocommerce/96588A" alt="WooCommerce" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white" alt="Next.js" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Flutter-02569B?style=flat&logo=flutter&logoColor=white" alt="Flutter" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white" alt="Python" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="JavaScript" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Laravel-FF2D20?style=flat&logo=laravel&logoColor=white" alt="Laravel" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/AWS-232F3E?style=flat&logo=awslambda&logoColor=white" alt="AWS" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/OpenAI-412991?style=flat&logo=databricks&logoColor=white" alt="OpenAI" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Claude-181818?style=flat&logo=anthropic&logoColor=white" alt="Claude" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white" alt="Angular" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Alpine.js-8BC0D0?style=flat&logo=alpinedotjs&logoColor=black" alt="Alpine.js" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/PHP-777BB4?style=flat&logo=php&logoColor=white" alt="PHP" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  <img src="https://img.shields.io/badge/Antel-00A2E8?style=flat&logoColor=white" alt="Antel" className="h-6 shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-slate-200 bg-white">
        <div className="absolute inset-0">
          <ColorBends
            rotation={15}
            speed={0.4}
            colors={["#ffffff"]}
            transparent
            autoRotate={0}
            scale={0.7}
            frequency={1}
            warpStrength={0.9}
            mouseInfluence={1}
            parallax={0.5}
            noise={0.1}
          />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-6xl space-y-10 px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Servicios principales
              </p>
              <h2 className="text-3xl font-semibold text-slate-900">
                Servicios para que tu negocio despegue...
              </h2>
            </div>
            <Link
              href="/servicios"
              className="text-xs font-semibold uppercase text-slate-500 transition hover:text-slate-900"
            >
              Ver catálogo
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {serviceLinks.map((service, index) => (
              <Link
                key={service.href}
                href={service.href}
                className={`glass group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:bg-black ${
                  serviceLinks.length % 2 !== 0 && index === serviceLinks.length - 1
                    ? 'md:col-span-2'
                    : ''
                }`}
              >
                <div className="relative z-10">
                  <p className="text-lg font-semibold text-slate-900 transition-colors duration-500 group-hover:text-white">
                    {service.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 transition-colors duration-500 group-hover:text-slate-300">
                    {service.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-semibold uppercase text-white transition-colors duration-500 group-hover:bg-white group-hover:text-black">
                    Explorar
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 11L11 1M11 1H1M11 1V11"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200">
        <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-16">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Método de trabajo
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Diseñado para entregar valor rápido y sostenible.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="glass rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  0{index + 1}
                </p>
                <p className="mt-4 text-lg font-semibold text-slate-900">
                  {step.title}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200">
        <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-16">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Clientes
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Trabajamos con equipos que valoran la excelencia operativa.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clientTypes.map((client) => (
              <div
                key={client}
                className="glass rounded-2xl px-5 py-6 text-sm text-slate-600"
              >
                {client}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Colonia Cloud
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              ¿Listo para acelerar tu próximo lanzamiento?
            </h2>
            <p className="text-sm text-slate-600">
              Conversemos sobre tu roadmap y diseñemos un plan de ejecución.
            </p>
          </div>
          <Link
            href="/contacto"
            className="btn-primary"
          >
            Solicitar propuesta
          </Link>
        </div>
      </section>
    </main>
  );
}
