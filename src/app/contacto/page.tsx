import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Cuéntanos sobre tu proyecto y diseñemos una propuesta a medida.",
};

const info = [
  {
    title: "Diagnóstico inicial",
    description: "Revisamos objetivos, riesgos y oportunidades clave.",
  },
  {
    title: "Roadmap claro",
    description: "Definimos alcance, hitos y entregables desde el inicio.",
  },
  {
    title: "Equipo dedicado",
    description: "Trabajas con especialistas senior durante todo el proceso.",
  },
];

export default function ContactoPage() {
  return (
    <main>
      <section className="border-b border-slate-200">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Contacto
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900 sm:text-5xl">
            Hablemos sobre tu próximo paso digital.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Cuéntanos qué necesitas y armamos una propuesta con foco en impacto
            y velocidad.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <form className="glass space-y-5 rounded-2xl p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Tu nombre"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent/60 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Empresa
                </label>
                <input
                  type="text"
                  name="empresa"
                  placeholder="Nombre de la empresa"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent/60 focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-500">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="tucorreo@empresa.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent/60 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-500">
                Mensaje
              </label>
              <textarea
                name="mensaje"
                rows={5}
                placeholder="Cuéntanos sobre el desafío que quieres resolver"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent/60 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
            >
              Enviar solicitud
            </button>
          </form>

          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Qué puedes esperar
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                Una propuesta clara, sin rodeos.
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Te compartimos un plan con alcance, cronograma y próximos pasos
                concretos.
              </p>
            </div>
            <div className="grid gap-4">
              {info.map((item) => (
                <div key={item.title} className="glass rounded-2xl p-5">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
