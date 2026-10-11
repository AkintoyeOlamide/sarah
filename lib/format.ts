export function formatScore(score: number): string {
  if (!Number.isFinite(score)) {
    return "0.0%";
  }
  const clamped = Math.min(1, Math.max(0, score));
  return `${(clamped * 100).toFixed(1)}%`;
}

export function isBlankQuery(query: string): boolean {
  return query.trim().length === 0;
}

export function searchHref(query: string): string {
  return `/results?q=${encodeURIComponent(query.trim())}`;
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) {
    return "S";
  }
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function splitList(value: string): string[] {
  const seen = new Set<string>();
  const items: string[] = [];
  for (const part of value.split(",")) {
    const cleaned = part.trim().replace(/\s+/g, " ");
    if (!cleaned) {
      continue;
    }
    const key = cleaned.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    items.push(cleaned);
  }
  return items;
}
