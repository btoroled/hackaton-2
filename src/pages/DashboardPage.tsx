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
      .catch(() => setStatus("error"));
    return () => controller.abort();
  }, []);

  if (status === "loading") return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 rounded-xl bg-gray-200" />
      ))}
    </div>
  );

  if (status === "error") return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 text-sm">
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
    LEVE: "bg-green-100 text-green-800",
    MODERADO: "bg-yellow-100 text-yellow-800",
    GRAVE: "bg-orange-100 text-orange-800",
    CRITICO: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <h1 className="font-mono text-2xl font-semibold">Control Room</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border bg-white p-4">
            <p className="text-xs text-gray-400 mb-1">{k.label}</p>
            <p className="text-3xl font-semibold">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-4">
        <p className="text-sm font-medium mb-3">Señales por severidad</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(data.signalsBySeverity).map(([sev, count]) => (
            <span key={sev} className={`rounded-full px-3 py-1 text-sm font-medium ${severityColor[sev] ?? "bg-gray-100 text-gray-700"}`}>
              {sev}: {count}
            </span>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Actualizado: {new Date(data.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}
