import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  Species,
  TropelQuery,
  TropelSort,
  VitalState,
} from "../../api/types";

export const PAGE_SIZES = [10, 20, 50] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export const SPECIES: Species[] = [
  "BLOBITO",
  "CHISPA",
  "GRUNON",
  "DORMILON",
  "GLITCHY",
];

export const VITAL_STATES: VitalState[] = [
  "ESTABLE",
  "HAMBRIENTO",
  "AGITADO",
  "MUTANDO",
  "CRITICO",
];

export const SORTS: TropelSort[] = [
  "updatedAt,desc",
  "name,asc",
  "chaosIndex,desc",
];

export const SORT_LABELS: Record<TropelSort, string> = {
  "updatedAt,desc": "Actualizado (mas reciente)",
  "name,asc": "Nombre (A-Z)",
  "chaosIndex,desc": "Caos (mayor primero)",
};

const DEFAULT_SIZE: PageSize = 20;
const DEFAULT_SORT: TropelSort = "updatedAt,desc";
const MAX_Q_LENGTH = 80;

function parsePage(raw: string | null): number {
  if (!raw) return 0;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) return 0;
  return n;
}

function parseSize(raw: string | null): PageSize {
  const n = Number(raw);
  if (PAGE_SIZES.includes(n as PageSize)) return n as PageSize;
  return DEFAULT_SIZE;
}

function parseSpecies(raw: string | null): Species | undefined {
  return SPECIES.includes(raw as Species) ? (raw as Species) : undefined;
}

function parseVitalState(raw: string | null): VitalState | undefined {
  return VITAL_STATES.includes(raw as VitalState)
    ? (raw as VitalState)
    : undefined;
}

function parseSort(raw: string | null): TropelSort {
  return SORTS.includes(raw as TropelSort) ? (raw as TropelSort) : DEFAULT_SORT;
}

function parseSectorId(raw: string | null): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseQ(raw: string | null): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.slice(0, MAX_Q_LENGTH).trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export interface TropelesFilters {
  species?: Species;
  vitalState?: VitalState;
  sectorId?: string;
  q?: string;
}

export interface TropelesUrlState {
  page: number;
  size: PageSize;
  sort: TropelSort;
  filters: TropelesFilters;
}

export function urlStateToQuery(s: TropelesUrlState): TropelQuery {
  return {
    page: s.page,
    size: s.size,
    sort: s.sort,
    species: s.filters.species,
    vitalState: s.filters.vitalState,
    sectorId: s.filters.sectorId,
    q: s.filters.q,
  };
}

export interface TropelesUrlControls {
  state: TropelesUrlState;
  setPage: (page: number) => void;
  setSize: (size: PageSize) => void;
  setSort: (sort: TropelSort) => void;
  setFilter: <K extends keyof TropelesFilters>(
    key: K,
    value: TropelesFilters[K],
  ) => void;
  resetFilters: () => void;
}

export function useTropelesUrlState(): TropelesUrlControls {
  const [params, setParams] = useSearchParams();

  const state = useMemo<TropelesUrlState>(
    () => ({
      page: parsePage(params.get("page")),
      size: parseSize(params.get("size")),
      sort: parseSort(params.get("sort")),
      filters: {
        species: parseSpecies(params.get("species")),
        vitalState: parseVitalState(params.get("vitalState")),
        sectorId: parseSectorId(params.get("sectorId")),
        q: parseQ(params.get("q")),
      },
    }),
    [params],
  );

  const update = useCallback(
    (mutator: (next: URLSearchParams) => void) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          mutator(next);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setPage = useCallback(
    (page: number) => {
      update((next) => {
        if (page <= 0) next.delete("page");
        else next.set("page", String(page));
      });
    },
    [update],
  );

  const setSize = useCallback(
    (size: PageSize) => {
      update((next) => {
        if (size === DEFAULT_SIZE) next.delete("size");
        else next.set("size", String(size));
        next.delete("page");
      });
    },
    [update],
  );

  const setSort = useCallback(
    (sort: TropelSort) => {
      update((next) => {
        if (sort === DEFAULT_SORT) next.delete("sort");
        else next.set("sort", sort);
        next.delete("page");
      });
    },
    [update],
  );

  const setFilter = useCallback<TropelesUrlControls["setFilter"]>(
    (key, value) => {
      update((next) => {
        if (value === undefined || value === "" || value === null) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
        next.delete("page");
      });
    },
    [update],
  );

  const resetFilters = useCallback(() => {
    update((next) => {
      next.delete("species");
      next.delete("vitalState");
      next.delete("sectorId");
      next.delete("q");
      next.delete("page");
    });
  }, [update]);

  return { state, setPage, setSize, setSort, setFilter, resetFilters };
}
