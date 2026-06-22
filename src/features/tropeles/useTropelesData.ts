import { useEffect, useRef, useState } from "react";
import { ApiRequestError } from "../../api/client";
import { getTropels } from "../../api/endpoints";
import type { TropelPage, TropelQuery } from "../../api/types";

interface State {
  status: "idle" | "loading" | "success" | "error";
  data: TropelPage | null;
  error: string | null;
}

const INITIAL: State = { status: "idle", data: null, error: null };

export interface TropelesData {
  status: State["status"];
  data: TropelPage | null;
  error: string | null;
  isFetching: boolean;
  refetch: () => void;
}

export function useTropelesData(query: TropelQuery): TropelesData {
  const [state, setState] = useState<State>(INITIAL);
  const [refetchTick, setRefetchTick] = useState(0);
  const generationRef = useRef(0);

  useEffect(() => {
    const generation = ++generationRef.current;
    const controller = new AbortController();

    setState((prev) => ({
      status: "loading",
      data: prev.data,
      error: null,
    }));

    getTropels(query, controller.signal)
      .then((data) => {
        if (generation !== generationRef.current) return;
        setState({ status: "success", data, error: null });
      })
      .catch((err: unknown) => {
        if (generation !== generationRef.current) return;
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message =
          err instanceof ApiRequestError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Error desconocido";
        setState((prev) => ({
          status: "error",
          data: prev.data,
          error: message,
        }));
      });

    return () => {
      controller.abort();
    };
    // We want to refetch whenever any query field or refetchTick changes.
  }, [
    query.page,
    query.size,
    query.sort,
    query.species,
    query.vitalState,
    query.sectorId,
    query.q,
    refetchTick,
  ]);

  return {
    status: state.status,
    data: state.data,
    error: state.error,
    isFetching: state.status === "loading",
    refetch: () => setRefetchTick((n) => n + 1),
  };
}
