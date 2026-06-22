import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSectors, USING_MOCK } from "../../lib/api";
import type { SectorListItem } from "../../types";
import { climateGradient } from "./visualTokens";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: SectorListItem[] };

export default function SectorsPage() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetchSectors(controller.signal)
      .then((res) => setState({ status: "ready", items: res.items }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Error al cargar sectores",
        });
      });
    return () => controller.abort();
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      {USING_MOCK && (
        <div className="mb-6 rounded-lg bg-amber-500/15 px-4 py-2 text-sm text-amber-200">
          Modo demo (datos mock). Configura VITE_API_BASE_URL para la API real.
        </div>
      )}
      <h1 className="text-3xl font-bold">Sectores</h1>
      <p className="mt-1 text-white/60">Elige un sector para recorrer su historia.</p>

      {state.status === "loading" && (
        <p className="mt-10 text-white/60">Cargando sectores...</p>
      )}
      {state.status === "error" && (
        <p className="mt-10 text-rose-400">{state.message}</p>
      )}
      {state.status === "ready" && (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.items.map((s) => (
            <li key={s.id}>
              <Link
                to={`/sectors/${s.id}/story`}
                className="block rounded-2xl border border-white/10 p-5 transition hover:border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{ background: climateGradient(s.climate) }}
              >
                <p className="text-xs uppercase tracking-widest text-white/60">
                  {s.sectorCode} · {s.climate.replace("_", " ")}
                </p>
                <h2 className="mt-1 text-xl font-semibold">{s.name}</h2>
                <p className="mt-3 text-sm text-white/70">
                  Carga {s.currentLoad}/{s.capacity} · Estabilidad {s.stabilityLevel}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
