import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiRequestError } from "../../api/client";
import { getSectors } from "../../api/endpoints";
import type { SectorSummary } from "../../api/types";
import { climateGradient } from "./visualTokens";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: SectorSummary[] };

export function SectorsPage() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    getSectors(controller.signal)
      .then((res) => setState({ status: "ready", items: res.items }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message =
          err instanceof ApiRequestError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Error al cargar sectores";
        setState({ status: "error", message });
      });
    return () => controller.abort();
  }, []);

  return (
    <section>
      <header className="mb-6">
        <h1 className="font-mono text-2xl text-text">Sectores</h1>
        <p className="text-sm text-muted">
          Elige un sector para recorrer su historia.
        </p>
      </header>

      {state.status === "loading" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-edge bg-surface"
            />
          ))}
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-6 text-center text-sm text-red-300">
          {state.message}
        </div>
      )}

      {state.status === "ready" && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <h2 className="mt-1 text-xl font-semibold text-white">
                  {s.name}
                </h2>
                <p className="mt-3 text-sm text-white/70">
                  Carga {s.currentLoad}/{s.capacity} · Estabilidad{" "}
                  {s.stabilityLevel}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
