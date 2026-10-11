import { health, platforms, recommend as rank } from "./catalog";
import { EngineError } from "./engine";
import type { CatalogResponse, HealthResponse, RecommendResponse } from "./types";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("The operation was aborted.", "AbortError");
  }
}

function guard<T>(work: () => T): T {
  try {
    return work();
  } catch (error) {
    if (error instanceof EngineError) {
      throw new ApiError(error.message, error.status);
    }
    throw error;
  }
}

export function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  throwIfAborted(signal);
  return Promise.resolve(guard(() => health()));
}

export function fetchPlatforms(signal?: AbortSignal): Promise<CatalogResponse> {
  throwIfAborted(signal);
  return Promise.resolve(guard(() => platforms()));
}

export function recommend(query: string, topK = 8, signal?: AbortSignal): Promise<RecommendResponse> {
  throwIfAborted(signal);
  return Promise.resolve(guard(() => rank(query, topK)));
}
