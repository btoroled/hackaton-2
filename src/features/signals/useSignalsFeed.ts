import { useCallback, useEffect, useRef, useState } from "react";
import { ApiRequestError } from "../../api/client";
import { getSignalsFeed } from "../../api/endpoints";
import type { Signal } from "../../api/types";
import { FEED_LIMIT, type SignalsFilters } from "./signalsFeedQuery";

export type FeedStatus =
  | "idle"
  | "loading-initial"
  | "loading-more"
  | "success"
  | "error-initial"
  | "error-more";

interface State {
  items: Signal[];
  itemIds: Set<string>;
  cursor: string | null;
  hasMore: boolean;
  totalEstimate: number;
  status: FeedStatus;
  error: string | null;
}

const INITIAL: State = {
  items: [],
  itemIds: new Set(),
  cursor: null,
  hasMore: true,
  totalEstimate: 0,
  status: "idle",
  error: null,
};

function toMessage(err: unknown): string {
  if (err instanceof ApiRequestError) return err.message;
  if (err instanceof Error) return err.message;
  return "Error desconocido";
}

export interface SignalsFeed {
  items: Signal[];
  hasMore: boolean;
  totalEstimate: number;
  status: FeedStatus;
  error: string | null;
  loadMore: () => void;
  retryInitial: () => void;
  retryMore: () => void;
}

export function useSignalsFeed(filters: SignalsFilters): SignalsFeed {
  const [state, setState] = useState<State>(INITIAL);
  const [retryTick, setRetryTick] = useState(0);

  const generationRef = useRef(0);
  const inFlightRef = useRef<AbortController | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchPage = useCallback(
    (cursor: string | null, mode: "initial" | "more") => {
      const generation = ++generationRef.current;
      inFlightRef.current?.abort();
      const controller = new AbortController();
      inFlightRef.current = controller;

      setState((prev) =>
        mode === "initial"
          ? {
              items: [],
              itemIds: new Set(),
              cursor: null,
              hasMore: true,
              totalEstimate: 0,
              status: "loading-initial",
              error: null,
            }
          : {
              ...prev,
              status: "loading-more",
              error: null,
            },
      );

      getSignalsFeed(
        {
          cursor: cursor ?? undefined,
          limit: FEED_LIMIT,
          ...filtersRef.current,
        },
        controller.signal,
      )
        .then((res) => {
          if (generation !== generationRef.current) return;
          setState((prev) => {
            const baseItems = mode === "initial" ? [] : prev.items;
            const baseIds =
              mode === "initial" ? new Set<string>() : new Set(prev.itemIds);
            const nextItems: Signal[] = [...baseItems];
            for (const it of res.items) {
              if (baseIds.has(it.id)) continue;
              baseIds.add(it.id);
              nextItems.push(it);
            }
            return {
              items: nextItems,
              itemIds: baseIds,
              cursor: res.nextCursor,
              hasMore: res.hasMore,
              totalEstimate: res.totalEstimate,
              status: "success",
              error: null,
            };
          });
        })
        .catch((err: unknown) => {
          if (generation !== generationRef.current) return;
          if (controller.signal.aborted) return;
          if (err instanceof DOMException && err.name === "AbortError") return;
          const message = toMessage(err);
          setState((prev) => ({
            ...prev,
            status: mode === "initial" ? "error-initial" : "error-more",
            error: message,
          }));
        });
    },
    [],
  );

  useEffect(() => {
    fetchPage(null, "initial");
    return () => {
      inFlightRef.current?.abort();
    };
  }, [
    filters.signalType,
    filters.severity,
    filters.status,
    filters.q,
    retryTick,
    fetchPage,
  ]);

  const loadMore = useCallback(() => {
    const s = stateRef.current;
    if (s.status === "loading-initial" || s.status === "loading-more") return;
    if (s.status === "error-more") return;
    if (!s.hasMore) return;
    fetchPage(s.cursor, "more");
  }, [fetchPage]);

  const retryInitial = useCallback(() => {
    setRetryTick((n) => n + 1);
  }, []);

  const retryMore = useCallback(() => {
    const s = stateRef.current;
    fetchPage(s.cursor, "more");
  }, [fetchPage]);

  return {
    items: state.items,
    hasMore: state.hasMore,
    totalEstimate: state.totalEstimate,
    status: state.status,
    error: state.error,
    loadMore,
    retryInitial,
    retryMore,
  };
}
