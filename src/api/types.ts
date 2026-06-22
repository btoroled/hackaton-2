export type Species = "BLOBITO" | "CHISPA" | "GRUNON" | "DORMILON" | "GLITCHY";

export type VitalState =
  | "ESTABLE"
  | "HAMBRIENTO"
  | "AGITADO"
  | "MUTANDO"
  | "CRITICO";

export type SignalType =
  | "HAMBRE"
  | "ABANDONO"
  | "MUTACION"
  | "FUGA"
  | "CONFLICTO"
  | "REPRODUCCION_MASIVA"
  | "SENAL_CORRUPTA";

export type Severity = "LEVE" | "MODERADO" | "GRAVE" | "CRITICO";

export type SignalStatus = "RECIBIDA" | "PROCESANDO" | "ATENDIDA";

export type Climate =
  | "PIXEL_FOREST"
  | "NEON_CAVE"
  | "CLOUD_AQUARIUM"
  | "RETRO_ARCADE";

export type TropelSort =
  | "name,asc"
  | "updatedAt,desc"
  | "chaosIndex,desc";

export interface LoginRequest {
  teamCode: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  displayName: string;
  email: string;
  teamCode: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export interface DashboardSummary {
  totalTropels: number;
  criticalTropels: number;
  openSignals: number;
  sectorStabilityAvg: number;
  signalsBySeverity: Record<Severity, number>;
  generatedAt: string;
}

export interface SectorRef {
  id: string;
  name: string;
  sectorCode: string;
}

export interface Tropel {
  id: string;
  name: string;
  species: Species;
  vitalState: VitalState;
  energyLevel: number;
  chaosIndex: number;
  mutationStage: number;
  guardianName: string;
  sector: SectorRef;
  createdAt: string;
  updatedAt: string;
}

export interface TropelPage {
  content: Tropel[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface TropelQuery {
  page: number;
  size: 10 | 20 | 50;
  species?: Species;
  vitalState?: VitalState;
  sectorId?: string;
  q?: string;
  sort?: TropelSort;
}

export interface SignalTropelRef {
  id: string;
  name: string;
  species: Species;
}

export interface Signal {
  id: string;
  signalType: SignalType;
  severity: Severity;
  status: SignalStatus;
  rawContent: string;
  tropel: SignalTropelRef;
  createdAt: string;
  updatedAt: string;
}

export interface SignalFeedResponse {
  items: Signal[];
  nextCursor: string | null;
  hasMore: boolean;
  totalEstimate: number;
}

export interface SignalFeedQuery {
  cursor?: string;
  limit?: number;
  signalType?: SignalType;
  severity?: Severity;
  status?: SignalStatus;
  q?: string;
}

export interface SectorSummary {
  id: string;
  sectorCode: string;
  name: string;
  climate: Climate;
  capacity: number;
  currentLoad: number;
  stabilityLevel: number;
}

export interface SectorListResponse {
  items: SectorSummary[];
}

export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  path: string;
  details?: Record<string, unknown>;
}
