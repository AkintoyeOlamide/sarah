import seedPlatforms from "../data/platforms.json";
import { RecommendationEngine } from "./engine";
import type { HealthResponse, Platform, RecommendResponse } from "./types";

let engine: RecommendationEngine | null = null;

export function getEngine(): RecommendationEngine {
  if (!engine) {
    engine = new RecommendationEngine(seedPlatforms);
  }
  return engine;
}

export function health(): HealthResponse {
  return {
    status: "ok",
    service: "sarah-recommender",
    platforms: getEngine().count(),
    engine: "tfidf-cosine",
  };
}

export function platforms(): { count: number; platforms: Platform[] } {
  const records = getEngine().listPlatforms();
  return { count: records.length, platforms: records };
}

export function recommend(query: string, topK = 8): RecommendResponse {
  return getEngine().recommend(query, topK);
}
