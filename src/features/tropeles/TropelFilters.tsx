import { useEffect, useState } from "react";
import type { Species, TropelSort, VitalState } from "../../api/types";
import {
  SORTS,
  SORT_LABELS,
  SPECIES,
  VITAL_STATES,
  type TropelesUrlControls,
} from "./tropelesQuery";
import { useDebouncedValue } from "./useDebouncedValue";

interface Props {
  controls: TropelesUrlControls;
}

const inputCls =
  "rounded-md border border-edge bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent disabled:opacity-60";

export function TropelFilters({ controls }: Props) {
  const { state, setFilter, setSort, resetFilters } = controls;
  const { filters, sort } = state;

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
    filters.species || filters.vitalState || filters.sectorId || filters.q,
  );

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-edge bg-surface p-4">
      <label className="flex flex-col text-xs text-muted">
        <span className="mb-1">Buscar</span>
        <input
          type="search"
          value={qDraft}
          onChange={(e) => setQDraft(e.target.value)}
          placeholder="Nombre, guardian..."
          maxLength={80}
          className={`${inputCls} w-56`}
        />
      </label>

      <label className="flex flex-col text-xs text-muted">
        <span className="mb-1">Especie</span>
        <select
          value={filters.species ?? ""}
          onChange={(e) =>
            setFilter(
              "species",
              e.target.value ? (e.target.value as Species) : undefined,
            )
          }
          className={`${inputCls} w-40`}
        >
          <option value="">Todas</option>
          {SPECIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-xs text-muted">
        <span className="mb-1">Estado vital</span>
        <select
          value={filters.vitalState ?? ""}
          onChange={(e) =>
            setFilter(
              "vitalState",
              e.target.value ? (e.target.value as VitalState) : undefined,
            )
          }
          className={`${inputCls} w-40`}
        >
          <option value="">Todos</option>
          {VITAL_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-xs text-muted">
        <span className="mb-1">Sector ID</span>
        <input
          value={filters.sectorId ?? ""}
          onChange={(e) =>
            setFilter("sectorId", e.target.value || undefined)
          }
          placeholder="sec_..."
          className={`${inputCls} w-44`}
        />
      </label>

      <label className="flex flex-col text-xs text-muted">
        <span className="mb-1">Ordenar por</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as TropelSort)}
          className={`${inputCls} w-56`}
        >
          {SORTS.map((s) => (
            <option key={s} value={s}>
              {SORT_LABELS[s]}
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
