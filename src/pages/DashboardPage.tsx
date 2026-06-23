import { useEffect, useState } from "react";
import { getDashboardSummary } from "../api/endpoints";
import type { DashboardSummary } from "../api/types";

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ok">("loading");

  useEffect(() => {
    const controller = new AbortController();
    getDashboardSummary(controller.signal)
      .then((d) => { setData(d); setStatus("ok"); })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, []);

  if (status === "loading") return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 rounded-xl border border-edge bg-surface" />
      ))}
    </div>
  );

  if (status === "error") return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 text-sm text-red-300">
      No se pudo cargar el resumen. Verifica tu conexión o recarga la página.
    </div>
  );

  if (!data) return null;

  const kpis = [
    { label: "Total Tropeles", value: data.totalTropels },
    { label: "Críticos", value: data.criticalTropels },
    { label: "Señales abiertas", value: data.openSignals },
    { label: "Estabilidad promedio", value: data.sectorStabilityAvg.toFixed(2) },
  ];

  const severityColor: Record<string, string> = {
    LEVE: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    MODERADO: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    GRAVE: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    CRITICO: "border-red-500/30 bg-red-500/10 text-red-300",
  };

  return (
    <div className="space-y-6">
      <h1 className="font-mono text-2xl font-semibold text-text">Control Room</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-edge bg-surface p-4">
            <p className="mb-1 text-xs text-muted">{k.label}</p>
            <p className="text-3xl font-semibold text-text">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-edge bg-surface p-4">
        <p className="mb-3 text-sm font-medium text-text">Señales por severidad</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(data.signalsBySeverity).map(([sev, count]) => (
            <span key={sev} className={`rounded-full border px-3 py-1 text-sm font-medium ${severityColor[sev] ?? "border-edge bg-bg text-muted"}`}>
              {sev}: {count}
            </span>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted">
        Actualizado: {new Date(data.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}
