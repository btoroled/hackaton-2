import type { Severity, Signal, SignalStatus } from "../../api/types";

const severityCls: Record<Severity, string> = {
  LEVE: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  MODERADO: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  GRAVE: "bg-orange-500/10 text-orange-300 border-orange-500/30",
  CRITICO: "bg-red-500/10 text-red-300 border-red-500/30",
};

const statusCls: Record<SignalStatus, string> = {
  RECIBIDA: "bg-edge text-muted border-edge",
  PROCESANDO: "bg-purple-500/10 text-purple-300 border-purple-500/30",
  ATENDIDA: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
};

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function SignalCard({
  signal,
  onOpen,
}: {
  signal: Signal;
  onOpen: (id: string) => void;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(signal.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(signal.id);
        }
      }}
      className="cursor-pointer rounded-lg border border-edge bg-surface p-4 transition-colors hover:border-accent/60 focus:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent"
    >
      <header className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted">{signal.id}</span>
        <Badge className="border-edge bg-bg text-text">
          {signal.signalType}
        </Badge>
        <Badge className={severityCls[signal.severity]}>
          {signal.severity}
        </Badge>
        <Badge className={statusCls[signal.status]}>{signal.status}</Badge>
        <span className="ml-auto text-xs text-muted">
          {formatTime(signal.createdAt)}
        </span>
      </header>

      <p className="mb-3 text-sm text-text">{signal.rawContent}</p>

      <footer className="flex items-center justify-between text-xs text-muted">
        <span>
          Tropel{" "}
          <span className="text-text">{signal.tropel.name}</span>{" "}
          <span className="font-mono">({signal.tropel.species})</span>
        </span>
        <span className="font-mono">{signal.tropel.id}</span>
      </footer>
    </article>
  );
}
