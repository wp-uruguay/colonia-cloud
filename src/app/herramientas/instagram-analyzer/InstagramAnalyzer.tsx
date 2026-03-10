"use client";

import { useState, useRef } from "react";

interface AnalysisResult {
  username: string;
  profile: {
    followers: number;
    following: number;
    posts: number;
    isVerified: boolean;
    accountType: string;
    bio: string;
    fullName?: string;
    profilePic?: string | null;
  };
  engagement: {
    rate: number;
    avgLikes: number;
    avgComments: number;
    benchmark: number;
    status: "above" | "below";
  };
  shadowban: {
    status: "clean" | "warning" | "shadowbanned" | "unknown";
    score: number | null;
    hashtagReach: string;
    reelsReach: string;
    exploreReach: string;
    note?: string;
  };
  posting: {
    frequency: number;
    bestDays: string[] | null;
    bestHours: string[] | null;
  };
  ratios: {
    followerFollowing: number;
    engagementPerPost: number;
  };
  demo: boolean;
  authenticated?: boolean;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function EngagementBar({ rate, benchmark }: { rate: number; benchmark: number }) {
  const max = Math.max(rate, benchmark, 5);
  const rateWidth = Math.min((rate / max) * 100, 100);
  const benchWidth = Math.min((benchmark / max) * 100, 100);
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Tu engagement</span>
          <span className="font-semibold text-slate-900">{rate}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-black transition-all duration-700"
            style={{ width: `${rateWidth}%` }}
          />
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Benchmark industria</span>
          <span className="font-semibold text-slate-500">{benchmark}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-300 transition-all duration-700"
            style={{ width: `${benchWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function ShadowbanBadge({ status }: { status: string }) {
  const config = {
    clean: { label: "Sin shadowban", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500" },
    warning: { label: "Posible shadowban", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-500" },
    shadowbanned: { label: "Shadowban activo", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
    unknown: { label: "No determinado", bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
  };
  const c = config[status as keyof typeof config] ?? config.unknown;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${c.bg} ${c.text} ${c.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function ReachRow({ label, value }: { label: string; value: string }) {
  const config: Record<string, { icon: string; text: string }> = {
    normal: { icon: "✓", text: "text-green-600" },
    reduced: { icon: "⚠", text: "text-yellow-600" },
    blocked: { icon: "✕", text: "text-red-600" },
    restricted: { icon: "✕", text: "text-red-600" },
    unknown: { icon: "—", text: "text-slate-400" },
  };
  const c = config[value] ?? config.unknown;
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm font-semibold ${c.text}`}>
        {c.icon} {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    </div>
  );
}

// Instagram logo SVG
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

export default function InstagramAnalyzer() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  async function analyzeDemo(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `/api/instagram/analyze?username=${encodeURIComponent(username.trim().replace("@", ""))}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al analizar");
      setResult(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setUsername("");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 space-y-12">
      {/* Hero */}
      <div className="space-y-4 text-center">
        <p className="text-xs font-semibold uppercase text-slate-500">Herramienta gratuita</p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
          Analizador de Instagram
        </h1>
        <p className="mx-auto max-w-xl text-slate-600">
          Analizá cualquier cuenta publica de Instagram: engagement, metricas de alcance y datos de perfil.
        </p>
      </div>

      {/* Search */}
      {!result && (
        <div className="mx-auto max-w-xl">
          <form onSubmit={analyzeDemo} className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium select-none">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="nombre_de_usuario"
                className="w-full rounded-xl border border-green-500 bg-white py-3 pl-8 pr-4 text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-black focus:ring-1 focus:ring-black"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analizando
                </span>
              ) : "Analizar"}
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-6 animate-pulse">
          <div className="grid gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-6 h-28 bg-slate-100" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass rounded-2xl p-6 h-48 bg-slate-100" />
            <div className="glass rounded-2xl p-6 h-48 bg-slate-100" />
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div ref={resultsRef} className="space-y-6">
          {/* Banners */}
          {!result.demo && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 flex items-center justify-between gap-4">
              <span><strong>Datos reales.</strong> Informacion obtenida de la cuenta publica de Instagram.</span>
              <button onClick={reset} className="shrink-0 text-xs font-semibold text-green-700 hover:text-green-900 underline">
                Nueva busqueda
              </button>
            </div>
          )}
          {result.demo && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 flex items-center justify-between gap-4">
              <span><strong>Modo demo:</strong> No se pudo obtener datos reales. Los datos son una simulacion ilustrativa.</span>
              <button onClick={reset} className="shrink-0 text-xs font-semibold text-yellow-700 hover:text-yellow-900 underline">
                Nueva busqueda
              </button>
            </div>
          )}

          {/* Profile header */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-4">
              {result.profile.profilePic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.profile.profilePic}
                  alt={result.username}
                  className="h-14 w-14 flex-shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white text-xl font-bold">
                  {(result.profile.fullName ?? result.username)[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">@{result.username}</h2>
                  {result.profile.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      ✓ Verificado
                    </span>
                  )}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 capitalize">
                    {result.profile.accountType}
                  </span>
                </div>
                {result.profile.fullName && result.profile.fullName !== result.username && (
                  <p className="text-sm text-slate-600">{result.profile.fullName}</p>
                )}
                {result.profile.bio && (
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{result.profile.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Seguidores", value: formatNumber(result.profile.followers) },
              { label: "Siguiendo", value: formatNumber(result.profile.following) },
              { label: "Publicaciones", value: formatNumber(result.profile.posts) },
              {
                label: "Ratio F/F",
                value: `${result.ratios.followerFollowing}x`,
              },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-5 text-center">
                <p className="text-xs font-semibold uppercase text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Engagement + Shadowban */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Engagement */}
            <div className="glass rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Engagement</h3>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  result.engagement.status === "above"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {result.engagement.status === "above" ? "↑ Sobre benchmark" : "↓ Bajo benchmark"}
                </span>
              </div>
              <EngagementBar rate={result.engagement.rate} benchmark={result.engagement.benchmark} />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">Likes promedio</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{formatNumber(result.engagement.avgLikes)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">Comentarios prom.</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{formatNumber(result.engagement.avgComments)}</p>
                </div>
              </div>
            </div>

            {/* Shadowban */}
            <div className="glass rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Shadowban</h3>
                <ShadowbanBadge status={result.shadowban.status} />
              </div>
              {result.shadowban.note ? (
                <p className="text-sm text-slate-500">{result.shadowban.note}</p>
              ) : (
                <div className="space-y-2">
                  <ReachRow label="Alcance en hashtags" value={result.shadowban.hashtagReach} />
                  <ReachRow label="Alcance en Reels" value={result.shadowban.reelsReach} />
                  <ReachRow label="Alcance en Explorar" value={result.shadowban.exploreReach} />
                </div>
              )}
              {result.shadowban.status === "shadowbanned" && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                  Tu contenido puede no aparecer en busquedas ni en Explorar. Evita hashtags prohibidos y revisa el contenido reciente.
                </div>
              )}
              {result.shadowban.status === "warning" && (
                <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-3 text-xs text-yellow-700">
                  Senales de alcance reducido detectadas. Reduce el uso masivo de hashtags y evita acciones repetitivas.
                </div>
              )}
            </div>
          </div>

          {/* Posting frequency */}
          <div className="glass rounded-2xl p-6 space-y-5">
            <h3 className="font-semibold text-slate-900">Frecuencia de publicacion</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Posts / semana</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{result.posting.frequency}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {result.posting.frequency >= 3 ? "Frecuencia alta" : result.posting.frequency >= 1 ? "Frecuencia media" : "Frecuencia baja"}
                </p>
              </div>
              {result.posting.bestDays && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">Mejores dias</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {result.posting.bestDays.map((day) => (
                      <span key={day} className="rounded-lg bg-black px-2 py-1 text-xs font-semibold text-white">{day}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.posting.bestHours && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">Mejores horarios</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {result.posting.bestHours.map((hour) => (
                      <span key={hour} className="rounded-lg bg-black px-2 py-1 text-xs font-semibold text-white">{hour}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="glass rounded-2xl p-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="font-semibold text-slate-900">¿Queres mejorar tu estrategia en redes?</p>
              <p className="text-sm text-slate-600">Trabajamos contigo para escalar tu presencia digital con datos reales.</p>
            </div>
            <a href="/contacto" className="btn-primary flex-shrink-0">Contactar</a>
          </div>
        </div>
      )}

      {/* Feature cards (shown when no result) */}
      {!result && !loading && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Engagement Rate",
              desc: "Mide la interaccion real de tu audiencia con tu contenido en base a likes y comentarios vs. seguidores.",
            },
            {
              title: "Shadowban",
              desc: "Detecta si tu cuenta tiene alcance reducido en hashtags, Explorar o Reels por violar politicas de Instagram.",
            },
            {
              title: "Metricas clave",
              desc: "Ratio followers/following, frecuencia de publicacion y benchmarks por rango de seguidores.",
            },
          ].map((item) => (
            <div key={item.title} className="glass rounded-2xl p-5">
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
