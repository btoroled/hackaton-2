import type {
  Climate,
  SectorListItem,
  SectorStoryResponse,
  SignalType,
  StoryStage,
} from "../types";

// Datos mock deterministicos para desarrollar la Story Engine sin credenciales.
// Mismo `id` -> misma historia. Se reemplaza por la API real con VITE_API_BASE_URL.

export const MOCK_SECTORS: SectorListItem[] = [
  {
    id: "sec_001",
    sectorCode: "SEC-01",
    name: "Bosque Norte",
    climate: "PIXEL_FOREST",
    capacity: 20,
    currentLoad: 13,
    stabilityLevel: 68,
  },
  {
    id: "sec_002",
    sectorCode: "SEC-02",
    name: "Caverna Neon",
    climate: "NEON_CAVE",
    capacity: 24,
    currentLoad: 19,
    stabilityLevel: 41,
  },
  {
    id: "sec_003",
    sectorCode: "SEC-03",
    name: "Acuario Nube",
    climate: "CLOUD_AQUARIUM",
    capacity: 18,
    currentLoad: 7,
    stabilityLevel: 82,
  },
  {
    id: "sec_004",
    sectorCode: "SEC-04",
    name: "Arcade Retro",
    climate: "RETRO_ARCADE",
    capacity: 30,
    currentLoad: 26,
    stabilityLevel: 55,
  },
];

const EVENTS: SignalType[] = [
  "HAMBRE",
  "ABANDONO",
  "MUTACION",
  "FUGA",
  "CONFLICTO",
  "REPRODUCCION_MASIVA",
  "SENAL_CORRUPTA",
  "MUTACION",
];

const COLOR_TOKENS = [
  "emerald",
  "cyan",
  "violet",
  "amber",
  "rose",
  "sky",
  "lime",
  "fuchsia",
];

const TITLES = [
  "Primer pulso",
  "El despertar",
  "Tension creciente",
  "Punto de quiebre",
  "Caos en cascada",
  "Intervencion",
  "Estabilizacion",
  "Nuevo equilibrio",
];

const NARRATIVES = [
  "La actividad despierta entre pixeles. Los Tropeles abren sus sensores y prueban el entorno.",
  "Un primer evento sacude el sector. Las senales empiezan a acumularse en la consola.",
  "La energia sube y la estabilidad cede. Los operadores priorizan los casos criticos.",
  "El sector alcanza su momento mas fragil: cada decision cuenta para no perder control.",
  "Varias senales se disparan en cadena. El indice de caos escala con rapidez.",
  "El equipo interviene. Los protocolos de contencion empiezan a surtir efecto.",
  "La estabilidad se recupera poco a poco mientras las alertas descienden.",
  "El sector encuentra un nuevo equilibrio, distinto al inicial pero sostenible.",
];

function climateOf(id: string): Climate {
  const found = MOCK_SECTORS.find((s) => s.id === id);
  return found ? found.climate : "PIXEL_FOREST";
}

function nameOf(id: string): string {
  const found = MOCK_SECTORS.find((s) => s.id === id);
  return found ? found.name : "Sector";
}

export function buildMockStory(id: string): SectorStoryResponse {
  // Semilla simple derivada del id para variar metricas de forma determinista.
  const seed = Array.from(id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  const stages: StoryStage[] = Array.from({ length: 8 }, (_, i) => {
    const wave = Math.sin((i / 7) * Math.PI); // sube y baja a lo largo del recorrido
    return {
      id: `${id}_stage_${i}`,
      order: i,
      title: TITLES[i],
      narrative: NARRATIVES[i],
      dominantEvent: EVENTS[i],
      metrics: {
        stability: clamp(85 - Math.round(wave * 55) + ((seed + i) % 7)),
        energy: clamp(40 + Math.round(wave * 50) + ((seed * (i + 1)) % 11)),
        alerts: Math.max(0, Math.round(wave * 12) + ((seed + i * 3) % 4)),
      },
      assetKey: `${climateOf(id).toLowerCase()}-stage-${i}`,
      colorToken: COLOR_TOKENS[i % COLOR_TOKENS.length],
      progress: i / 7,
    };
  });

  return {
    sector: { id, name: nameOf(id), climate: climateOf(id) },
    stages,
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}
