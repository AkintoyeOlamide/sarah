import { contentTokens } from "./related-terms";

const SINGLE_WORD_GAPS_MS = [2500, 3000];
const PHRASE_GAPS_MS = [900, 1800];

export function isSingleWordSearch(query: string): boolean {
  return contentTokens(query).length === 1;
}

export function searchResultLimit(query: string): number {
  return isSingleWordSearch(query) ? 12 : 8;
}

/** Delays between chat lines. The last line is when the ranked websites appear. */
export function searchPassGaps(query: string): number[] {
  return isSingleWordSearch(query) ? SINGLE_WORD_GAPS_MS : PHRASE_GAPS_MS;
}

export function searchPassLines(input: {
  query: string;
  step: number;
  detectedCategory: string | null;
  resultCount: number | null;
}): string[] {
  const lines = ["Comparing that wording with our websites."];

  if (input.step < 1) {
    return lines;
  }

  if (input.detectedCategory) {
    lines.push(`The closest shelf is ${input.detectedCategory}.`);
  } else if (input.resultCount === null) {
    lines.push("Detecting the closest shelf from the wording.");
  } else {
    lines.push("No single shelf stood out, so I am ranking the words on their own.");
  }

  if (input.step < 2) {
    return lines;
  }

  if (input.resultCount === null) {
    lines.push("Scoring cosine similarity for the websites that overlap.");
  } else if (input.resultCount === 0) {
    lines.push("The pass finished, and none of the websites overlapped with that wording.");
  } else {
    const noun = input.resultCount === 1 ? "website is" : "websites are";
    lines.push(`The closest ${noun} ready, ranked by how closely their wording matches.`);
  }

  return lines;
}
