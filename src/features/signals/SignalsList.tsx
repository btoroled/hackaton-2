import { useEffect, useRef } from "react";
import type { Signal } from "../../api/types";
import { SignalCard } from "./SignalCard";
import type { FeedStatus } from "./useSignalsFeed";

interface Props {
  items: Signal[];
  status: FeedStatus;
  error: string | null;
  hasMore: boolean;
  totalEstimate: number;
  onReachEnd: () => void;
  onRetryInitial: () => void;
  onRetryMore: () => void;
  onOpenSignal: (id: string) => void;
}

export function SignalsList({
  items,
  status,
  error,
  hasMore,
  totalEstimate,
  onReachEnd,
  onRetryInitial,
  onRetryMore,
  onOpenSignal,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onReachEndRef = useRef(onReachEnd);
  onReachEndRef.current = onReachEnd;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          onReachEndRef.current();
        }
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isInitialLoading = status === "loading-initial";
  const isLoadingMore = status === "loading-more";
  const isInitialError = status === "error-initial";
  const isMoreError = status === "error-more";
  const isEmpty = status === "success" && items.length === 0;

  if (isInitialLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-lg border border-edge bg-surface"
          />
        ))}
      </div>
    );
  }

  if (isInitialError) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-6 text-center text-sm">
        <p className="mb-3 text-red-300">{error ?? "Error al cargar feed"}</p>
        <button
          type="button"
          onClick={onRetryInitial}
          className="rounded-md border border-edge bg-bg px-3 py-1.5 text-text hover:border-accent hover:text-accent"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-lg border border-edge bg-surface p-6 text-center text-sm text-muted">
        No hay senales que coincidan con los filtros.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-muted">
        <span>
          Mostrando <span className="text-text">{items.length}</span> de
          aprox. <span className="text-text">{totalEstimate}</span>
        </span>
        {isLoadingMore ? <span>Cargando mas...</span> : null}
      </div>

      <ul className="space-y-3">
        {items.map((sig) => (
          <li key={sig.id}>
            <SignalCard signal={sig} onOpen={onOpenSignal} />
          </li>
        ))}
      </ul>

      <div className="mt-4">
        {isMoreError ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-center text-sm">
            <p className="mb-2 text-red-300">
              {error ?? "Error al cargar mas senales"}
            </p>
            <button
              type="button"
              onClick={onRetryMore}
              className="rounded-md border border-edge bg-bg px-3 py-1.5 text-text hover:border-accent hover:text-accent"
            >
              Reintentar
            </button>
          </div>
        ) : null}

        {!hasMore ? (
          <div className="border-t border-edge pt-4 text-center text-xs text-muted">
            Fin del feed.
          </div>
        ) : null}

        {isLoadingMore ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-lg border border-edge bg-surface"
              />
            ))}
          </div>
        ) : null}

        {hasMore && !isMoreError ? (
          <div ref={sentinelRef} aria-hidden="true" className="h-1" />
        ) : null}
      </div>
    </div>
  );
}
