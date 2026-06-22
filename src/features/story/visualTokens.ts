import type { Climate } from "../../types";

// El backend entrega `colorToken` y `assetKey` como identificadores, no URLs.
// El frontend construye el visual con CSS a partir de estos mapas locales.

const COLOR_HEX: Record<string, string> = {
  emerald: "#10b981",
  cyan: "#06b6d4",
  violet: "#8b5cf6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  sky: "#0ea5e9",
  lime: "#84cc16",
  fuchsia: "#d946ef",
};

export function colorFor(token: string): string {
  return COLOR_HEX[token] ?? "#64748b";
}

const CLIMATE_GRADIENT: Record<Climate, [string, string]> = {
  PIXEL_FOREST: ["#052e16", "#064e3b"],
  NEON_CAVE: ["#1e0a3c", "#3b0764"],
  CLOUD_AQUARIUM: ["#082f49", "#0c4a6e"],
  RETRO_ARCADE: ["#3f0a1e", "#581c2f"],
};

export function climateGradient(climate: Climate): string {
  const [a, b] = CLIMATE_GRADIENT[climate];
  return `linear-gradient(160deg, ${a}, ${b})`;
}
