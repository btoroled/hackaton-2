import { useEffect, useState } from "react";
import { ApiRequestError } from "../../api/client";
import { getSectorStory } from "../../api/endpoints";
import type { SectorStoryResponse } from "../../api/types";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: SectorStoryResponse };

export function useSectorStory(id: string | undefined): State & {
  reload: () => void;
} {
  const [state, setState] = useState<State>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!id) {
      setState({ status: "error", message: "Sector no especificado" });
      return;
    }

    const controller = new AbortController();
    setState({ status: "loading" });

    getSectorStory(id, controller.signal)
      .then((data) => {
        const stages = [...data.stages].sort((a, b) => a.order - b.order);
        if (stages.length === 0) {
          setState({
            status: "error",
            message: "El sector no tiene historia",
          });
          return;
        }
        setState({ status: "ready", data: { ...data, stages } });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message =
          err instanceof ApiRequestError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Error al cargar la historia";
        setState({ status: "error", message });
      });

    return () => controller.abort();
  }, [id, nonce]);

  return { ...state, reload: () => setNonce((n) => n + 1) };
}
