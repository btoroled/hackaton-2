import { useEffect, useState } from "react";
import { fetchSectorStory } from "../../lib/api";
import type { SectorStoryResponse } from "../../types";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: SectorStoryResponse };

/** Carga la historia del sector y descarta respuestas obsoletas al cambiar de id. */
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

    fetchSectorStory(id, controller.signal)
      .then((data) => {
        // Ordenar por `order` y validar que existan etapas.
        const stages = [...data.stages].sort((a, b) => a.order - b.order);
        if (stages.length === 0) {
          setState({ status: "error", message: "El sector no tiene historia" });
          return;
        }
        setState({ status: "ready", data: { ...data, stages } });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message =
          err instanceof Error ? err.message : "Error al cargar la historia";
        setState({ status: "error", message });
      });

    return () => controller.abort();
  }, [id, nonce]);

  return { ...state, reload: () => setNonce((n) => n + 1) };
}
