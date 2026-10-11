export type Platform = {
  id: string;
  name: string;
  url: string;
  tagline: string;
  description: string;
  categories: string[];
  keywords: string[];
  strengths: string[];
  coverage: string;
  verification_notes: string;
};

export type Recommendation = Platform & {
  rank: number;
  score: number;
  cosine_similarity: number;
  matched_terms: string[];
  explanation: string;
};

export type CategoryCandidate = {
  name: string;
  confidence: number;
  similarity: number;
};

export type RecommendResponse = {
  query: string;
  expanded_query: string;
  detected_category: CategoryCandidate | null;
  category_candidates: CategoryCandidate[];
  method: string;
  message: string | null;
  count: number;
  results: Recommendation[];
};

export type CatalogResponse = {
  count: number;
  platforms: Platform[];
};

export type HealthResponse = {
  status: string;
  service: string;
  platforms: number;
  engine: string;
};
