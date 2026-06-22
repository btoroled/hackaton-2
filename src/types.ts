// Tipos del contrato congelado de la API (Checkpoint 5).
// Sin `any`: todas las respuestas usadas por la Story Engine quedan tipadas aqui.

export type Climate =
  | "PIXEL_FOREST"
  | "NEON_CAVE"
  | "CLOUD_AQUARIUM"
  | "RETRO_ARCADE";

export type SignalType =
  | "HAMBRE"
  | "ABANDONO"
  | "MUTACION"
  | "FUGA"
  | "CONFLICTO"
  | "REPRODUCCION_MASIVA"
  | "SENAL_CORRUPTA";

/** Item liviano de `GET /sectors`. */
export interface SectorListItem {
  id: string;
  sectorCode: string;
  name: string;
  climate: Climate;
  capacity: number;
  currentLoad: number;
  stabilityLevel: number;
}

export interface SectorsResponse {
  items: SectorListItem[];
}

/** Cabecera del sector dentro de `GET /sectors/:id/story`. */
export interface StorySector {
  id: string;
  name: string;
  climate: Climate;
}

export interface StageMetrics {
  stability: number;
  energy: number;
  alerts: number;
}

/** Una de las 8 etapas de la historia del sector. */
export interface StoryStage {
  id: string;
  order: number;
  title: string;
  narrative: string;
  dominantEvent: SignalType;
  metrics: StageMetrics;
  assetKey: string;
  colorToken: string;
  progress: number;
}

export interface SectorStoryResponse {
  sector: StorySector;
  stages: StoryStage[];
}
