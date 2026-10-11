import { ENGLISH_STOP_WORDS } from "./stop-words";

/** Sparse TF-IDF row: vocabulary index to L2-normalized weight. */
export type SparseVector = Map<number, number>;

const TOKEN_PATTERN = /[\p{L}\p{N}_]{2,}/gu;

/**
 * Tokenize like scikit-learn: lowercase, drop English stop words, then
 * unigrams followed by adjacent bigrams.
 */
export function analyze(text: string): string[] {
  const tokens = (text.toLowerCase().match(TOKEN_PATTERN) ?? []).filter(
    (token) => !ENGLISH_STOP_WORDS.has(token),
  );
  const terms = tokens.slice();
  for (let index = 0; index < tokens.length - 1; index += 1) {
    terms.push(`${tokens[index]} ${tokens[index + 1]}`);
  }
  return terms;
}

/**
 * TF-IDF with the same defaults Sarah's scikit-learn vectorizer uses:
 * smoothed IDF, sublinear term frequency, and L2 normalization.
 */
export class TfidfVectorizer {
  private vocabulary = new Map<string, number>();
  private idf: number[] = [];
  featureNames: string[] = [];

  fitTransform(documents: string[]): SparseVector[] {
    const analyzed = documents.map((document) => analyze(document));
    const unique = new Set<string>();
    for (const terms of analyzed) {
      for (const term of terms) {
        unique.add(term);
      }
    }
    // scikit-learn sorts the fitted vocabulary by term before assigning columns.
    const ordered = [...unique].sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
    this.vocabulary = new Map(ordered.map((term, index) => [term, index]));
    this.featureNames = ordered;
    const counts = analyzed.map((terms) => this.countTerms(terms));
    this.idf = this.computeIdf(counts);
    return counts.map((count) => this.weight(count));
  }

  transform(documents: string[]): SparseVector[] {
    return documents.map((document) => this.weight(this.countTerms(analyze(document))));
  }

  private countTerms(terms: string[]): Map<number, number> {
    const counts = new Map<number, number>();
    for (const term of terms) {
      const index = this.vocabulary.get(term);
      if (index === undefined) {
        continue;
      }
      counts.set(index, (counts.get(index) ?? 0) + 1);
    }
    return counts;
  }

  private computeIdf(counts: Map<number, number>[]): number[] {
    const documents = counts.length;
    const documentFrequency = new Array<number>(this.vocabulary.size).fill(0);
    for (const count of counts) {
      for (const index of count.keys()) {
        documentFrequency[index] += 1;
      }
    }
    return documentFrequency.map(
      (frequency) => Math.log((documents + 1) / (frequency + 1)) + 1,
    );
  }

  private weight(counts: Map<number, number>): SparseVector {
    const weighted: SparseVector = new Map();
    let sumOfSquares = 0;
    for (const [index, rawCount] of counts) {
      const value = (1 + Math.log(rawCount)) * this.idf[index];
      weighted.set(index, value);
      sumOfSquares += value * value;
    }
    if (sumOfSquares === 0) {
      return weighted;
    }
    const scale = 1 / Math.sqrt(sumOfSquares);
    for (const [index, value] of weighted) {
      weighted.set(index, value * scale);
    }
    return weighted;
  }
}

/** Cosine similarity, including the extra L2 normalization scikit-learn applies. */
export function cosineSimilarity(left: SparseVector, right: SparseVector): number {
  if (left.size === 0 || right.size === 0) {
    return 0;
  }
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (const value of left.values()) {
    leftNorm += value * value;
  }
  for (const value of right.values()) {
    rightNorm += value * value;
  }
  const smaller = left.size <= right.size ? left : right;
  const larger = smaller === left ? right : left;
  for (const [index, value] of smaller) {
    const other = larger.get(index);
    if (other !== undefined) {
      dot += value * other;
    }
  }
  const denominator = Math.sqrt(leftNorm) * Math.sqrt(rightNorm);
  if (denominator === 0) {
    return 0;
  }
  return dot / denominator;
}

export function overlapTerms(
  query: SparseVector,
  document: SparseVector,
  featureNames: string[],
  limit = 6,
): string[] {
  const pairs: { weight: number; column: number }[] = [];
  for (const [column, queryWeight] of query) {
    const documentWeight = document.get(column);
    if (documentWeight === undefined || queryWeight === 0 || documentWeight === 0) {
      continue;
    }
    pairs.push({ weight: queryWeight * documentWeight, column });
  }
  pairs.sort((left, right) => right.weight - left.weight || right.column - left.column);
  const terms: string[] = [];
  for (const pair of pairs) {
    const term = featureNames[pair.column];
    if (term && !terms.includes(term)) {
      terms.push(term);
    }
    if (terms.length >= limit) {
      break;
    }
  }
  return terms;
}
