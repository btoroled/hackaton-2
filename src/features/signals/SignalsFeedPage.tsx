import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SignalDetailDrawer } from "./SignalDetailDrawer";
import { SignalFilters } from "./SignalFilters";
import { SignalsList } from "./SignalsList";
import { useSignalsFeedUrlState } from "./signalsFeedQuery";
import { useSignalsFeed } from "./useSignalsFeed";

export function SignalsFeedPage() {
  const controls = useSignalsFeedUrlState();
  const feed = useSignalsFeed(controls.filters);

  // El detalle se abre como panel sobre el feed (el feed sigue montado:
  // conserva scroll y paginas). El id seleccionado vive en la URL (?signal=).
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("signal");

  const openDetail = useCallback(
    (id: string) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set("signal", id);
          return next;
        },
        { replace: false }, // permite volver con el boton atras
      );
    },
    [setParams],
  );

  const closeDetail = useCallback(() => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("signal");
        return next;
      },
      { replace: false },
    );
  }, [setParams]);

  return (
    <section>
      <header className="mb-4">
        <h1 className="font-mono text-2xl text-text">Feed de Senales</h1>
        <p className="text-sm text-muted">
          Cursor-based infinito, dedup por ID, filtros persistidos en URL.
        </p>
      </header>

      <SignalFilters controls={controls} />

      <SignalsList
        items={feed.items}
        status={feed.status}
        error={feed.error}
        hasMore={feed.hasMore}
        totalEstimate={feed.totalEstimate}
        onReachEnd={feed.loadMore}
        onRetryInitial={feed.retryInitial}
        onRetryMore={feed.retryMore}
        onOpenSignal={openDetail}
      />

      {selectedId && (
        <SignalDetailDrawer
          signalId={selectedId}
          onClose={closeDetail}
          onUpdated={feed.updateSignal}
        />
      )}
    </section>
  );
}
