import { useEffect, useState } from "react";
import { ApiRequestError } from "../../api/client";
import { updateSignalStatus } from "../../api/endpoints";
import type { Severity, Signal, SignalStatus } from "../../api/types";
import { useSignalDetail } from "./useSignalDetail";

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

type SaveState =
  | { kind: "idle" }
  | { kind: "saving"; target: "PROCESANDO" | "ATENDIDA" }
  | { kind: "success"; target: "PROCESANDO" | "ATENDIDA" }
  | { kind: "error"; target: "PROCESANDO" | "ATENDIDA"; message: string };

interface Props {
  signalId: string;
  onClose: () => void;
  onUpdated: (signal: Signal) => void;
}

export function SignalDetailDrawer({ signalId, onClose, onUpdated }: Props) {
  const detail = useSignalDetail(signalId);
  const [save, setSave] = useState<SaveState>({ kind: "idle" });

  // Cerrar con Escape y bloquear scroll del fondo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Reinicia el estado del PATCH al cambiar de senal.
  useEffect(() => {
    setSave({ kind: "idle" });
  }, [signalId]);

  function apply(target: "PROCESANDO" | "ATENDIDA") {
    if (save.kind === "saving") return;
    setSave({ kind: "saving", target });
    updateSignalStatus(signalId, target)
      .then((updated) => {
        detail.setSignal(updated); // refleja en el detalle
        onUpdated(updated); // refleja en el feed
        setSave({ kind: "success", target });
      })
      .catch((err: unknown) => {
        // Conserva el estado anterior; solo muestra el error accionable.
        const message =
          err instanceof ApiRequestError
            ? err.message
            : err instanceof Error
              ? err.message
              : "No se pudo actualizar la senal";
        setSave({ kind: "error", target, message });
      });
  }

  const signal = detail.signal;
  const saving = save.kind === "saving";

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Detalle de senal"
    >
      {/* Fondo */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      {/* Panel */}
      <aside className="relative h-full w-full max-w-md overflow-y-auto border-l border-edge bg-bg p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-lg text-text">Detalle de senal</h2>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="rounded-md border border-edge px-2 py-1 text-sm text-muted hover:border-accent hover:text-accent"
          >
            Cerrar
          </button>
        </div>

        {detail.status === "loading" && (
          <div className="space-y-3">
            <div className="h-6 w-1/3 animate-pulse rounded bg-surface" />
            <div className="h-24 animate-pulse rounded bg-surface" />
          </div>
        )}

        {detail.status === "error" && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm">
            <p className="mb-3 text-red-300">{detail.error}</p>
            <button
              type="button"
              onClick={detail.reload}
              className="rounded-md border border-edge bg-surface px-3 py-1.5 text-text hover:border-accent hover:text-accent"
            >
              Reintentar
            </button>
          </div>
        )}

        {detail.status === "success" && signal && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted">{signal.id}</span>
              <Badge className="border-edge bg-surface text-text">
                {signal.signalType}
              </Badge>
              <Badge className={severityCls[signal.severity]}>
                {signal.severity}
              </Badge>
              <Badge className={statusCls[signal.status]}>{signal.status}</Badge>
            </div>

            <p className="rounded-lg border border-edge bg-surface p-3 text-sm text-text">
              {signal.rawContent}
            </p>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Tropel" value={signal.tropel.name} />
              <Field label="Especie" value={signal.tropel.species} mono />
              <Field label="Creada" value={fmt(signal.createdAt)} />
              <Field label="Actualizada" value={fmt(signal.updatedAt)} />
            </dl>

            {/* Acciones de estado */}
            <div className="border-t border-edge pt-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-muted">
                Actualizar estado
              </p>
              <div className="flex gap-3">
                <ActionButton
                  label="Marcar PROCESANDO"
                  disabled={saving || signal.status === "PROCESANDO"}
                  loading={saving && save.target === "PROCESANDO"}
                  onClick={() => apply("PROCESANDO")}
                />
                <ActionButton
                  label="Marcar ATENDIDA"
                  disabled={saving || signal.status === "ATENDIDA"}
                  loading={saving && save.target === "ATENDIDA"}
                  onClick={() => apply("ATENDIDA")}
                />
              </div>

              {save.kind === "success" && (
                <p
                  role="status"
                  className="mt-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
                >
                  Estado actualizado a {save.target}.
                </p>
              )}

              {save.kind === "error" && (
                <div
                  role="alert"
                  className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm"
                >
                  <p className="mb-2 text-red-300">{save.message}</p>
                  <button
                    type="button"
                    onClick={() => apply(save.target)}
                    className="rounded-md border border-edge bg-surface px-3 py-1.5 text-text hover:border-accent hover:text-accent"
                  >
                    Reintentar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

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

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`text-text ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  loading,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading}
      className="flex-1 rounded-md border border-edge bg-surface px-3 py-2 text-sm text-text transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-edge disabled:hover:text-text"
    >
      {loading ? "Guardando..." : label}
    </button>
  );
}

function fmt(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
