import type { SectorStoryResponse, SectorsResponse } from "../types";
import { MOCK_SECTORS, buildMockStory } from "./mockStory";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/** Clave compartida con el login del equipo (integrante A). */
const TOKEN_KEY = "tropelcare.token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Modo mock: activo cuando no hay una URL real configurada todavia.
 * Permite desarrollar y demostrar la Story Engine sin credenciales.
 * En la entrega, con VITE_API_BASE_URL real, se consume la API deterministica.
 */
export const USING_MOCK =
  !BASE_URL || BASE_URL.includes("backend-url");

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal,
  });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body: unknown = await res.json();
      if (
        body &&
        typeof body === "object" &&
        "message" in body &&
        typeof (body as { message: unknown }).message === "string"
      ) {
        message = (body as { message: string }).message;
      }
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    throw new ApiError(res.status, message);
  }

  return (await res.json()) as T;
}

export async function fetchSectors(
  signal?: AbortSignal
): Promise<SectorsResponse> {
  if (USING_MOCK) {
    await delay(300, signal);
    return { items: MOCK_SECTORS };
  }
  return apiGet<SectorsResponse>("/sectors", signal);
}

export async function fetchSectorStory(
  id: string,
  signal?: AbortSignal
): Promise<SectorStoryResponse> {
  if (USING_MOCK) {
    await delay(400, signal);
    return buildMockStory(id);
  }
  return apiGet<SectorStoryResponse>(`/sectors/${id}/story`, signal);
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}
