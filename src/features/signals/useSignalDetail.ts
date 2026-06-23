import { useEffect, useState } from "react";
import { ApiRequestError } from "../../api/client";
import { getSignal } from "../../api/endpoints";
import type { Signal } from "../../api/types";

export type DetailStatus = "loading" | "success" | "error";

interface State {
  status: DetailStatus;
  signal: Signal | null;
  error: string | null;
}

function toMessage(err: unknown): string {
  if (err instanceof ApiRequestError) return err.message;
  if (err instanceof Error) return err.message;
  return "Error al cargar la senal";
}

/**
 * Carga el detalle de una Senal por id, con loading/error y reintento.
 * Descarta respuestas obsoletas al cambiar de id.
 */
export function useSignalDetail(id: string | null) {
  const [state, setState] = useState<State>({
    status: "loading",
    signal: null,
    error: null,
  });
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    setState({ status: "loading", signal: null, error: null });

    getSignal(id, controller.signal)
      .then((signal) => {
        if (controller.signal.aborted) return;
        setState({ status: "success", signal, error: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ status: "error", signal: null, error: toMessage(err) });
      });

    return () => controller.abort();
  }, [id, retryTick]);

  /** Actualiza el detalle en memoria tras un PATCH exitoso. */
  const setSignal = (signal: Signal) =>
    setState({ status: "success", signal, error: null });

  const reload = () => setRetryTick((n) => n + 1);

  return { ...state, setSignal, reload };
}
