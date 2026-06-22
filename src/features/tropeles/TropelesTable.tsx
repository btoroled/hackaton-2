import type { Tropel } from "../../api/types";

interface Props {
  rows: Tropel[];
  placeholderRows: number;
  state: "idle" | "loading" | "success" | "error";
  error: string | null;
  onRetry: () => void;
}

const vitalCls: Record<string, string> = {
  ESTABLE: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  HAMBRIENTO: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  AGITADO: "bg-orange-500/10 text-orange-300 border-orange-500/30",
  MUTANDO: "bg-purple-500/10 text-purple-300 border-purple-500/30",
  CRITICO: "bg-red-500/10 text-red-300 border-red-500/30",
};

function VitalBadge({ value }: { value: Tropel["vitalState"] }) {
  const cls = vitalCls[value] ?? "bg-edge text-muted border-edge";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {value}
    </span>
  );
}

function MetricBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-edge">
        <div
          className="h-full bg-accent"
          style={{ width: `${clamped}%` }}
          aria-label={label}
        />
      </div>
      <span className="w-8 text-right font-mono text-xs text-muted">
        {value}
      </span>
    </div>
  );
}

export function TropelesTable({
  rows,
  placeholderRows,
  state,
  error,
  onRetry,
}: Props) {
  const showSkeleton = state === "loading" && rows.length === 0;
  const showEmpty = state === "success" && rows.length === 0;
  const showError = state === "error" && rows.length === 0;

  return (
    <div className="relative overflow-hidden rounded-lg border border-edge bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed text-left text-sm">
          <thead className="bg-bg/40 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="w-1/4 px-4 py-3">Tropel</th>
              <th className="w-1/6 px-4 py-3">Especie</th>
              <th className="w-1/6 px-4 py-3">Estado vital</th>
              <th className="w-1/6 px-4 py-3">Energia</th>
              <th className="w-1/6 px-4 py-3">Caos</th>
              <th className="w-1/6 px-4 py-3">Sector</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr
                key={t.id}
                className="border-t border-edge hover:bg-bg/40"
              >
                <td className="truncate px-4 py-3">
                  <div className="font-medium text-text">{t.name}</div>
                  <div className="font-mono text-xs text-muted">
                    {t.id} · guardian {t.guardianName}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted">
                  {t.species}
                </td>
                <td className="px-4 py-3">
                  <VitalBadge value={t.vitalState} />
                </td>
                <td className="px-4 py-3">
                  <MetricBar value={t.energyLevel} label="Energia" />
                </td>
                <td className="px-4 py-3">
                  <MetricBar value={t.chaosIndex} label="Indice de caos" />
                </td>
                <td className="truncate px-4 py-3 text-xs text-muted">
                  <div className="text-text">{t.sector.name}</div>
                  <div className="font-mono">{t.sector.sectorCode}</div>
                </td>
              </tr>
            ))}

            {showSkeleton
              ? Array.from({ length: placeholderRows }).map((_, i) => (
                  <tr
                    key={`skeleton-${i}`}
                    className="border-t border-edge"
                  >
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-6 w-full animate-pulse rounded bg-edge/60" />
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      {showEmpty ? (
        <div className="border-t border-edge px-6 py-10 text-center text-sm text-muted">
          No hay tropeles que coincidan con los filtros.
        </div>
      ) : null}

      {showError ? (
        <div className="border-t border-edge px-6 py-10 text-center text-sm">
          <p className="mb-3 text-red-300">{error ?? "Error al cargar"}</p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-edge bg-bg px-3 py-1.5 text-sm text-text hover:border-accent hover:text-accent"
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {state === "error" && rows.length > 0 ? (
        <div className="flex items-center justify-between gap-3 border-t border-edge bg-red-500/5 px-4 py-2 text-xs text-red-300">
          <span>Error al actualizar: {error}</span>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-red-500/40 px-2 py-1 hover:bg-red-500/10"
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {state === "loading" && rows.length > 0 ? (
        <div className="pointer-events-none absolute right-3 top-3 rounded-md border border-edge bg-bg/80 px-2 py-1 text-xs text-muted">
          Cargando...
        </div>
      ) : null}
    </div>
  );
}
