import { aliasFor, contentTokens, singularize } from "./related-terms";
import type { CategoryCandidate, Platform, RecommendResponse, Recommendation } from "./types";
import { cosineSimilarity, overlapTerms, TfidfVectorizer, type SparseVector } from "./tfidf";

export const CATEGORY_HINTS: Record<string, string[]> = {
  "General shopping": ["buy", "shop", "order online", "marketplace", "online mall", "deals", "everything"],
  Electronics: [
    "tv",
    "television",
    "smart tv",
    "fridge",
    "refrigerator",
    "generator",
    "inverter",
    "solar",
    "air conditioner",
    "appliance",
    "home theater",
    "washing machine",
    "freezer",
  ],
  "Computers and laptops": [
    "laptop",
    "laptops",
    "school laptop",
    "laptop for school",
    "macbook",
    "hp",
    "dell",
    "lenovo",
    "computer",
    "notebook",
    "desktop",
    "printer",
    "office",
  ],
  "Mobile phones and accessories": [
    "phone",
    "iphone",
    "samsung",
    "tecno",
    "infinix",
    "smartphone",
    "airpods",
    "android",
    "tablet",
    "xiaomi",
  ],
  "Fashion and clothing": [
    "dress",
    "ankara",
    "gown",
    "shirt",
    "shoe",
    "shoes",
    "sandals",
    "loafers",
    "slippers",
    "footwear",
    "sneakers",
    "jeans",
    "suit",
    "fashion",
    "clothes",
    "handbag",
    "aso ebi",
    "agbada",
  ],
  "Home and furniture": [
    "sofa",
    "furniture",
    "bed",
    "mattress",
    "chair",
    "curtain",
    "home",
    "kitchen",
    "table",
    "tables",
    "desk",
    "dining table",
    "wardrobe",
    "cabinet",
  ],
  "Beauty and personal care": [
    "skincare",
    "makeup",
    "perfume",
    "cream",
    "lotion",
    "hair",
    "wig",
    "cosmetics",
    "beauty",
  ],
  "Groceries and food": [
    "grocery",
    "groceries",
    "rice",
    "foodstuff",
    "vegetable",
    "tomato",
    "provision",
    "supermarket",
    "yam",
    "garri",
    "palm oil",
    "meat",
    "fish",
  ],
  "Automotive and used cars": [
    "car",
    "cars",
    "tokunbo",
    "toyota",
    "camry",
    "corolla",
    "vehicle",
    "suv",
    "honda",
    "lexus",
  ],
  "Books and educational materials": [
    "book",
    "printing",
    "stationery",
    "notebook",
    "business card",
    "textbook",
    "flyer",
    "journal",
  ],
  "Pharmacy and health": [
    "pharmacy",
    "medicine",
    "drug",
    "vitamin",
    "prescription",
    "pharmacist",
    "wellness",
    "drugstore",
  ],
  "Food delivery": [
    "jollof",
    "suya",
    "restaurant",
    "lunch",
    "dinner",
    "meal",
    "takeaway",
    "food delivery",
    "chow",
  ],
  "Digital products": [
    "ebook",
    "online course",
    "digital product",
    "template",
    "download",
    "creator",
    "masterclass",
  ],
  "Travel and tickets": ["flight", "ticket", "hotel", "travel", "airline", "air peace", "visa", "lagos to abuja"],
  "Houses and property": [
    "house",
    "houses",
    "home",
    "rent",
    "apartment",
    "flat",
    "duplex",
    "land",
    "estate",
    "tolet",
    "bedroom",
    "bungalow",
    "property",
  ],
  "Animals and pets": [
    "dog",
    "dogs",
    "cat",
    "cats",
    "pet",
    "pets",
    "puppy",
    "kitten",
    "veterinary",
    "vet",
    "goat",
    "cow",
    "cattle",
    "poultry",
    "livestock",
    "animal",
    "animals",
    "bird",
    "rabbit",
    "hatchery",
    "fish farm",
  ],
  "Utilities and bills": [
    "electricity",
    "nepa",
    "phcn",
    "prepaid",
    "meter",
    "disco",
    "water bill",
    "waste",
    "dstv",
    "airtime",
    "data plan",
    "diesel",
    "petrol",
    "utility",
    "recharge",
    "ikeja electric",
    "light bill",
  ],
  "Banking and payments": [
    "bank",
    "banking",
    "transfer",
    "loan",
    "savings",
    "account",
    "opay",
    "kuda",
    "atm",
    "ussd",
  ],
  "Government services": [
    "nin",
    "passport",
    "drivers license",
    "tax",
    "cac",
    "immigration",
    "frsc",
    "firs",
    "national id",
  ],
  "Jobs and careers": ["job", "jobs", "vacancy", "career", "hiring", "cv", "recruitment"],
  Insurance: ["insurance", "hmo", "premium", "motor insurance", "health insurance"],
  "Logistics and courier": ["courier", "waybill", "parcel", "cargo", "haulage", "dispatch", "logistics"],
  "News and media": ["news", "newspaper", "headline", "punch", "channels", "broadcast"],
};

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CATEGORY_CONFIDENCE_FLOOR = 0.08;

export class EngineError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "EngineError";
    this.status = status;
  }
}

type CategoryProfile = {
  names: string[];
  vectorizer: TfidfVectorizer;
  matrix: SparseVector[];
};

export class RecommendationEngine {
  private platforms: Platform[] = [];
  private vectorizer: TfidfVectorizer | null = null;
  private matrix: SparseVector[] = [];
  private categories: CategoryProfile | null = null;

  constructor(records: unknown) {
    if (!Array.isArray(records)) {
      throw new EngineError("The platform dataset must be a JSON list.", 500);
    }
    const seen = new Set<string>();
    for (const item of records) {
      const platform = this.validate(item, { updating: false, seenIds: seen, persistCheck: false });
      seen.add(platform.id);
      this.platforms.push(platform);
    }
    this.fit();
  }

  count(): number {
    return this.platforms.length;
  }

  listPlatforms(): Platform[] {
    return this.platforms.map((platform) => ({ ...platform }));
  }

  listCategories(): { name: string; platforms: number }[] {
    const counts = new Map<string, number>();
    for (const platform of this.platforms) {
      for (const category of platform.categories) {
        counts.set(category, (counts.get(category) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([name, platforms]) => ({ name, platforms }));
  }

  addPlatform(payload: unknown): Platform {
    const platform = this.validate(payload, { updating: false, persistCheck: true });
    this.platforms.push(platform);
    this.fit();
    return { ...platform };
  }

  updatePlatform(platformId: string, payload: unknown): Platform {
    const index = this.indexOf(platformId);
    if (index === null) {
      throw new EngineError("Platform not found.", 404);
    }
    const platform = this.validate(payload, { updating: true, platformId });
    this.platforms[index] = platform;
    this.fit();
    return { ...platform };
  }

  deletePlatform(platformId: string): Platform {
    const index = this.indexOf(platformId);
    if (index === null) {
      throw new EngineError("Platform not found.", 404);
    }
    const [removed] = this.platforms.splice(index, 1);
    this.fit();
    return { ...removed };
  }

  recommend(query: unknown, topK: unknown = 8): RecommendResponse {
    const cleaned = this.cleanQuery(query);
    const limit = this.cleanTopK(topK);

    if (this.platforms.length === 0 || !this.vectorizer) {
      return this.emptyResponse(cleaned, "The platform catalog is empty.");
    }

    const direct = this.rank(cleaned, limit);
    if (direct.count > 0) {
      return direct;
    }

    const related = this.relatedQuery(cleaned);
    if (related) {
      const broadened = this.rank(related, limit);
      if (broadened.count > 0) {
        const missing = contentTokens(cleaned).filter((token) => !this.knownTerm(token));
        const quoted = missing.map((token) => `“${token}”`).join(", ");
        const verb = missing.length === 1 ? "is" : "are";
        return {
          ...broadened,
          query: cleaned,
          message: `${quoted} ${verb} not an exact catalog word. Sarah matched it to related shopping terms and ranked the closest websites.`,
        };
      }
    }

    const tokens = contentTokens(cleaned);
    if (tokens.length > 0) {
      const general = this.rank("shop marketplace buy online mall", limit);
      if (general.count > 0) {
        return {
          ...general,
          query: cleaned,
          message: null,
        };
      }
    }

    return direct;
  }

  private rank(searchText: string, limit: number): RecommendResponse {
    if (!this.vectorizer) {
      return this.emptyResponse(searchText, "The platform catalog is empty.");
    }

    const detection = this.detectCategory(searchText);
    const categoryName = detection?.name ?? null;
    const expanded = categoryName ? `${searchText} ${categoryName}` : searchText;
    const queryVector = this.vectorizer.transform([expanded])[0];
    if (queryVector.size === 0) {
      return this.emptyResponse(
        searchText,
        "Try naming a product, brand, or category. Common words such as 'the' and 'and' are ignored.",
        expanded,
        detection,
      );
    }

    const originalVector = this.vectorizer.transform([searchText])[0];
    const similarities = this.matrix.map((document) => cosineSimilarity(queryVector, document));
    const order = similarities
      .map((_, index) => index)
      .sort((left, right) => {
        const scoreDiff = similarities[right] - similarities[left];
        if (scoreDiff !== 0) {
          return scoreDiff;
        }
        return compareText(this.platforms[left].name, this.platforms[right].name);
      });
    const ranked = order.filter((index) => similarities[index] > 0).slice(0, limit);

    const results: Recommendation[] = ranked.map((index, position) => {
      const platform = this.platforms[index];
      const score = round4(similarities[index]);
      const matched = overlapTerms(originalVector, this.matrix[index], this.vectorizer!.featureNames);
      return {
        ...platform,
        rank: position + 1,
        score,
        cosine_similarity: score,
        matched_terms: matched,
        explanation: this.explain(platform, matched, categoryName, score),
      };
    });

    let message: string | null = null;
    if (results.length === 0) {
      message = "No close website match yet. Try a product name, brand, or shopping category.";
    } else if (results[0].score < 0.02) {
      message = "These matches are light. A product name or brand usually produces a sharper ranking.";
    }

    return {
      query: searchText,
      expanded_query: expanded,
      detected_category: detection,
      category_candidates: this.categoryCandidates(searchText),
      method: "tfidf-cosine",
      message,
      count: results.length,
      results,
    };
  }

  private relatedQuery(query: string): string | null {
    const tokens = contentTokens(query);
    if (tokens.length === 0) {
      return null;
    }
    const pieces: string[] = [];
    let replaced = false;
    for (const token of tokens) {
      if (this.knownTerm(token)) {
        pieces.push(token);
        continue;
      }
      const singular = singularize(token);
      if (singular !== token && this.knownTerm(singular)) {
        pieces.push(singular);
        replaced = true;
        continue;
      }
      const alias = aliasFor(token);
      if (alias) {
        pieces.push(alias);
        replaced = true;
      }
    }
    if (!replaced || pieces.length === 0) {
      return null;
    }
    return pieces.join(" ");
  }

  private knownTerm(token: string): boolean {
    return Boolean(this.vectorizer && this.vectorizer.transform([token])[0].size > 0);
  }

  private emptyResponse(
    query: string,
    message: string,
    expanded?: string,
    detection: CategoryCandidate | null = null,
  ): RecommendResponse {
    return {
      query,
      expanded_query: expanded ?? query,
      detected_category: detection,
      category_candidates: this.categories ? this.categoryCandidates(query) : [],
      method: "tfidf-cosine",
      message,
      count: 0,
      results: [],
    };
  }

  private detectCategory(query: string): CategoryCandidate | null {
    const candidates = this.categoryCandidates(query);
    if (candidates.length === 0 || candidates[0].similarity < CATEGORY_CONFIDENCE_FLOOR) {
      return null;
    }
    return candidates[0];
  }

  private categoryCandidates(query: string): CategoryCandidate[] {
    if (!this.categories || this.categories.names.length === 0) {
      return [];
    }
    const vector = this.categories.vectorizer.transform([query])[0];
    if (vector.size === 0) {
      return [];
    }
    const similarities = this.categories.matrix.map((document) => cosineSimilarity(vector, document));
    const probabilities = softmax(similarities.map((score) => score / 0.18));
    const order = similarities
      .map((similarity, index) => ({ similarity, index }))
      .sort((left, right) => right.similarity - left.similarity || left.index - right.index);

    return order.slice(0, 3).map(({ similarity, index }) => ({
      name: this.categories!.names[index],
      confidence: round4(probabilities[index]),
      similarity: round4(similarity),
    }));
  }

  private explain(
    platform: Platform,
    matched: string[],
    categoryName: string | null,
    score: number,
  ): string {
    const sentences: string[] = [];
    if (matched.length > 0) {
      sentences.push(`Your search overlaps this catalog on ${matched.slice(0, 5).join(", ")}.`);
    } else {
      sentences.push("This website is the closest lexical match for the wording of your search.");
    }
    if (categoryName && platform.categories.includes(categoryName)) {
      sentences.push(`It sells in ${categoryName}, the shopping category detected from your query.`);
    } else if (platform.categories.length > 0) {
      sentences.push(`Its main shelves include ${platform.categories.slice(0, 3).join(", ")}.`);
    }
    if (score >= 0.35) {
      sentences.push(
        "The TF-IDF cosine similarity is strong, so your wording is close to how this website describes its products.",
      );
    } else if (score >= 0.12) {
      sentences.push(
        "The cosine similarity is moderate: several product terms line up, with some wording that differs.",
      );
    } else {
      sentences.push(
        "The cosine similarity is lighter, so treat this as a related option rather than an exact shelf match.",
      );
    }
    if (platform.strengths.length > 0) {
      sentences.push(`${platform.strengths[0].replace(/\.+$/, "")}.`);
    }
    return sentences.join(" ");
  }

  private fit(): void {
    if (this.platforms.length === 0) {
      this.vectorizer = null;
      this.matrix = [];
      this.categories = null;
      return;
    }
    const vectorizer = new TfidfVectorizer();
    this.matrix = vectorizer.fitTransform(this.platforms.map((platform) => documentFor(platform)));
    this.vectorizer = vectorizer;
    this.categories = this.fitCategories();
  }

  private fitCategories(): CategoryProfile {
    const grouped = new Map<string, string[]>();
    for (const platform of this.platforms) {
      const primary = platform.categories[0];
      const keywords = grouped.get(primary) ?? [];
      keywords.push(...platform.keywords);
      grouped.set(primary, keywords);
      for (const category of platform.categories) {
        if (!grouped.has(category)) {
          grouped.set(category, []);
        }
      }
    }

    const names: string[] = [];
    const documents: string[] = [];
    for (const [name, keywords] of grouped) {
      const hints = CATEGORY_HINTS[name] ?? [];
      names.push(name);
      documents.push([name, name, name, ...hints, ...hints, ...hints, ...keywords].join(" "));
    }

    const vectorizer = new TfidfVectorizer();
    return {
      names,
      vectorizer,
      matrix: vectorizer.fitTransform(documents),
    };
  }

  private indexOf(platformId: string): number | null {
    const index = this.platforms.findIndex((platform) => platform.id === platformId);
    return index === -1 ? null : index;
  }

  private validate(
    payload: unknown,
    options: {
      updating: boolean;
      platformId?: string;
      seenIds?: Set<string>;
      persistCheck?: boolean;
    },
  ): Platform {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new EngineError("Platform details must be a JSON object.");
    }
    const record = payload as Record<string, unknown>;
    let recordId: string;
    if (options.updating) {
      const incomingId = record.id ?? options.platformId;
      if (incomingId !== options.platformId) {
        throw new EngineError("The platform id cannot be changed.");
      }
      recordId = options.platformId ?? "";
    } else {
      recordId = requiredText(record, "id", 64);
      if (!ID_PATTERN.test(recordId)) {
        throw new EngineError("Id must use lowercase letters, numbers, and hyphens.");
      }
      if (options.seenIds?.has(recordId)) {
        throw new EngineError("The dataset contains a duplicate platform id.");
      }
      if (options.persistCheck && this.platforms.some((item) => item.id === recordId)) {
        throw new EngineError("A platform with this id already exists.", 409);
      }
    }

    return {
      id: recordId,
      name: requiredText(record, "name", 120),
      url: requiredUrl(record.url),
      tagline: requiredText(record, "tagline", 180),
      description: requiredText(record, "description", 1200),
      categories: requiredList(record, "categories", 1, 8),
      keywords: requiredList(record, "keywords", 3, 40),
      strengths: requiredList(record, "strengths", 1, 6),
      coverage: requiredText(record, "coverage", 180),
      verification_notes: requiredText(record, "verification_notes", 400),
    };
  }

  private cleanQuery(query: unknown): string {
    if (typeof query !== "string") {
      throw new EngineError("Query must be text.");
    }
    const cleaned = collapse(query);
    if (!cleaned) {
      throw new EngineError("Enter what you are looking for.");
    }
    if (cleaned.length > 300) {
      throw new EngineError("Search text must be 300 characters or fewer.");
    }
    return cleaned;
  }

  private cleanTopK(topK: unknown): number {
    if (typeof topK !== "number" || !Number.isInteger(topK)) {
      throw new EngineError("top_k must be a whole number.");
    }
    if (topK < 1 || topK > 20) {
      throw new EngineError("top_k must be between 1 and 20.");
    }
    return topK;
  }
}

function documentFor(platform: Platform): string {
  return [
    platform.name,
    platform.name,
    platform.tagline,
    platform.description,
    platform.categories.join(" "),
    platform.categories.join(" "),
    platform.keywords.join(" "),
    platform.keywords.join(" "),
    platform.strengths.join(" "),
    platform.coverage,
  ].join(" ");
}

function requiredText(payload: Record<string, unknown>, field: string, limit: number): string {
  const value = payload[field];
  if (typeof value !== "string" || !value.trim()) {
    throw new EngineError(`${field} is required.`);
  }
  const cleaned = collapse(value);
  if (cleaned.length > limit) {
    throw new EngineError(`${field} must be ${limit} characters or fewer.`);
  }
  return cleaned;
}

function requiredUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new EngineError("url is required.");
  }
  const cleaned = value.trim();
  let parsed: URL;
  try {
    parsed = new URL(cleaned);
  } catch {
    throw new EngineError("url must start with http:// or https://.");
  }
  if ((parsed.protocol !== "http:" && parsed.protocol !== "https:") || !parsed.host) {
    throw new EngineError("url must start with http:// or https://.");
  }
  return cleaned;
}

function requiredList(
  payload: Record<string, unknown>,
  field: string,
  minimum: number,
  limit: number,
): string[] {
  const value = payload[field];
  if (!Array.isArray(value)) {
    throw new EngineError(`${field} must be a list of text values.`);
  }
  const cleaned: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !item.trim()) {
      throw new EngineError(`Every ${field} entry must be text.`);
    }
    const text = collapse(item);
    if (text.length > 80) {
      throw new EngineError(`Each ${field} entry must be 80 characters or fewer.`);
    }
    if (!cleaned.some((existing) => existing.toLowerCase() === text.toLowerCase())) {
      cleaned.push(text);
    }
  }
  if (cleaned.length < minimum) {
    throw new EngineError(`${field} needs at least ${minimum} entries.`);
  }
  if (cleaned.length > limit) {
    throw new EngineError(`${field} can include at most ${limit} entries.`);
  }
  return cleaned;
}

function collapse(value: string): string {
  return value.split(/\s+/).filter(Boolean).join(" ");
}

function compareText(left: string, right: string): number {
  const a = left.toLowerCase();
  const b = right.toLowerCase();
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

/** Round half to even, matching Python's round(..., 4) for these scores. */
export function round4(value: number): number {
  const factor = 10000;
  const scaled = value * factor;
  const floor = Math.floor(scaled);
  const fraction = scaled - floor;
  let rounded: number;
  if (Math.abs(fraction - 0.5) < 1e-8) {
    rounded = floor % 2 === 0 ? floor : floor + 1;
  } else {
    rounded = Math.round(scaled);
  }
  return rounded / factor;
}

function softmax(scaled: number[]): number[] {
  if (scaled.length === 0) {
    return [];
  }
  const max = Math.max(...scaled);
  const exponential = scaled.map((score) => Math.exp(score - max));
  const total = exponential.reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return scaled.map(() => 0);
  }
  return exponential.map((value) => value / total);
}
