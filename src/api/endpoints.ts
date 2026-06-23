import { apiRequest } from "./client";
import type {
  AuthUser,
  DashboardSummary,
  LoginRequest,
  LoginResponse,
  SectorListResponse,
  SectorStoryResponse,
  Signal,
  SignalFeedQuery,
  SignalFeedResponse,
  SignalStatus,
  Tropel,
  TropelPage,
  TropelQuery,
} from "./types";

export function login(body: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body,
    auth: false,
  });
}

export function me(signal?: AbortSignal): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me", { signal });
}

export function getDashboardSummary(
  signal?: AbortSignal,
): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>("/dashboard/summary", { signal });
}

export function getTropels(
  query: TropelQuery,
  signal?: AbortSignal,
): Promise<TropelPage> {
  return apiRequest<TropelPage>("/tropels", {
    query: {
      page: query.page,
      size: query.size,
      species: query.species,
      vitalState: query.vitalState,
      sectorId: query.sectorId,
      q: query.q,
      sort: query.sort,
    },
    signal,
  });
}

export function getTropel(id: string, signal?: AbortSignal): Promise<Tropel> {
  return apiRequest<Tropel>(`/tropels/${id}`, { signal });
}

export function getSignalsFeed(
  query: SignalFeedQuery,
  signal?: AbortSignal,
): Promise<SignalFeedResponse> {
  return apiRequest<SignalFeedResponse>("/signals/feed", {
    query: {
      cursor: query.cursor,
      limit: query.limit,
      signalType: query.signalType,
      severity: query.severity,
      status: query.status,
      q: query.q,
    },
    signal,
  });
}

export function getSignal(id: string, signal?: AbortSignal): Promise<Signal> {
  return apiRequest<Signal>(`/signals/${id}`, { signal });
}

export function updateSignalStatus(
  id: string,
  status: Extract<SignalStatus, "PROCESANDO" | "ATENDIDA">,
  signal?: AbortSignal,
): Promise<Signal> {
  return apiRequest<Signal>(`/signals/${id}/status`, {
    method: "PATCH",
    body: { status },
    signal,
  });
}

export function getSectors(
  signal?: AbortSignal,
): Promise<SectorListResponse> {
  return apiRequest<SectorListResponse>("/sectors", { signal });
}

export function getSectorStory(
  id: string,
  signal?: AbortSignal,
): Promise<SectorStoryResponse> {
  return apiRequest<SectorStoryResponse>(`/sectors/${id}/story`, { signal });
}
