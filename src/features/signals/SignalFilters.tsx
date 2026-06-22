import { useEffect, useState } from "react";
import type { Severity, SignalStatus, SignalType } from "../../api/types";
import {
  SEVERITIES,
  SIGNAL_STATUSES,
  SIGNAL_TYPES,
  type SignalsFeedUrlControls,
} from "./signalsFeedQuery";
import { useDebouncedValue } from "../tropeles/useDebouncedValue";

interface Props {
  controls: SignalsFeedUrlControls;
}

const inputCls =
  "rounded-md border border-edge bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent";

export function SignalFilters({ controls }: Props) {
  const { filters, setFilter, resetFilters } = controls;

  const [qDraft, setQDraft] = useState<string>(filters.q ?? "");
  useEffect(() => {
    setQDraft(filters.q ?? "");
  }, [filters.q]);

  const debouncedQ = useDebouncedValue(qDraft, 350);
  useEffect(() => {
    const next = debouncedQ.trim();
    const current = filters.q ?? "";
    if (next === current) return;
    setFilter("q", next.length > 0 ? next.slice(0, 80) : undefined);
  }, [debouncedQ, filters.q, setFilter]);

  const hasFilters = Boolean(
    filters.signalType || filters.severity || filters.status || filters.q,
  );

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-edge bg-surface p-4">
      <label className="flex flex-col text-xs text-muted">
        <span className="mb-1">Buscar</span>
        <input
          type="search"
          value={qDraft}
          onChange={(e) => setQDraft(e.target.value)}
          placeholder="Contenido, tropel..."
          maxLength={80}
          className={`${inputCls} w-64`}
        />
      </label>

      <label className="flex flex-col text-xs text-muted">
        <span className="mb-1">Tipo</span>
        <select
          value={filters.signalType ?? ""}
          onChange={(e) =>
            setFilter(
              "signalType",
              e.target.value ? (e.target.value as SignalType) : undefined,
            )
          }
          className={`${inputCls} w-52`}
        >
          <option value="">Todos</option>
          {SIGNAL_TYPES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-xs text-muted">
        <span className="mb-1">Severidad</span>
        <select
          value={filters.severity ?? ""}
          onChange={(e) =>
            setFilter(
              "severity",
              e.target.value ? (e.target.value as Severity) : undefined,
            )
          }
          className={`${inputCls} w-40`}
        >
          <option value="">Todas</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-xs text-muted">
        <span className="mb-1">Estado</span>
        <select
          value={filters.status ?? ""}
          onChange={(e) =>
            setFilter(
              "status",
              e.target.value ? (e.target.value as SignalStatus) : undefined,
            )
          }
          className={`${inputCls} w-40`}
        >
          <option value="">Todos</option>
          {SIGNAL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={resetFilters}
        disabled={!hasFilters}
        className="ml-auto rounded-md border border-edge bg-bg px-3 py-2 text-sm text-muted hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
