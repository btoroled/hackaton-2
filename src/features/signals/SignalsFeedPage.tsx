import { SignalFilters } from "./SignalFilters";
import { SignalsList } from "./SignalsList";
import { useSignalsFeedUrlState } from "./signalsFeedQuery";
import { useSignalsFeed } from "./useSignalsFeed";

export function SignalsFeedPage() {
  const controls = useSignalsFeedUrlState();
  const feed = useSignalsFeed(controls.filters);

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
      />
    </section>
  );
}
