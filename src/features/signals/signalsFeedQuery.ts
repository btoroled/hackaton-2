import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  Severity,
  SignalStatus,
  SignalType,
} from "../../api/types";

export const SIGNAL_TYPES: SignalType[] = [
  "HAMBRE",
  "ABANDONO",
  "MUTACION",
  "FUGA",
  "CONFLICTO",
  "REPRODUCCION_MASIVA",
  "SENAL_CORRUPTA",
];

export const SEVERITIES: Severity[] = [
  "LEVE",
  "MODERADO",
  "GRAVE",
  "CRITICO",
];

export const SIGNAL_STATUSES: SignalStatus[] = [
  "RECIBIDA",
  "PROCESANDO",
  "ATENDIDA",
];

export const FEED_LIMIT = 15;
const MAX_Q_LENGTH = 80;

export interface SignalsFilters {
  signalType?: SignalType;
  severity?: Severity;
  status?: SignalStatus;
  q?: string;
}

function parseSignalType(raw: string | null): SignalType | undefined {
  return SIGNAL_TYPES.includes(raw as SignalType)
    ? (raw as SignalType)
    : undefined;
}
function parseSeverity(raw: string | null): Severity | undefined {
  return SEVERITIES.includes(raw as Severity) ? (raw as Severity) : undefined;
}
function parseStatus(raw: string | null): SignalStatus | undefined {
  return SIGNAL_STATUSES.includes(raw as SignalStatus)
    ? (raw as SignalStatus)
    : undefined;
}
function parseQ(raw: string | null): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.slice(0, MAX_Q_LENGTH).trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export interface SignalsFeedUrlControls {
  filters: SignalsFilters;
  setFilter: <K extends keyof SignalsFilters>(
    key: K,
    value: SignalsFilters[K],
  ) => void;
  resetFilters: () => void;
}

export function useSignalsFeedUrlState(): SignalsFeedUrlControls {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<SignalsFilters>(
    () => ({
      signalType: parseSignalType(params.get("signalType")),
      severity: parseSeverity(params.get("severity")),
      status: parseStatus(params.get("status")),
      q: parseQ(params.get("q")),
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

  const setFilter = useCallback<SignalsFeedUrlControls["setFilter"]>(
    (key, value) => {
      update((next) => {
        if (value === undefined || value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
    },
    [update],
  );

  const resetFilters = useCallback(() => {
    update((next) => {
      next.delete("signalType");
      next.delete("severity");
      next.delete("status");
      next.delete("q");
    });
  }, [update]);

  return { filters, setFilter, resetFilters };
}
