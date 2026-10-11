"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import { ExampleSearches } from "@/components/ExampleSearches";
import { SearchPanel } from "@/components/SearchPanel";
import { ApiError, recommend } from "@/lib/api";
import { formatScore, initials } from "@/lib/format";
import { HOME_EXAMPLES } from "@/lib/examples";
import type { RecommendResponse } from "@/lib/types";

const MARKS: Record<string, { bg: string; fg: string; label: string }> = {
  "jumia-ng": { bg: "#fff4e8", fg: "#f68b1e", label: "JUMIA" },
  konga: { bg: "#fff0f6", fg: "#ed017f", label: "konga" },
  "jiji-ng": { bg: "#e9f9ef", fg: "#128a3e", label: "Jiji" },
  "slot-ng": { bg: "#fff1f1", fg: "#e10600", label: "SLOT" },
  "kara-ng": { bg: "#eef8f1", fg: "#1f7a3a", label: "Kara" },
};

export function ResultsExplorer() {
  const params = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  const [data, setData] = useState<RecommendResponse | null>(null);
  const [error, setError] = useState("");
  const [settledQuery, setSettledQuery] = useState("");

  useEffect(() => {
    if (!query) {
      return;
    }

    const controller = new AbortController();
    let active = true;
    recommend(query, 5, controller.signal)
      .then((payload) => {
        if (!active) {
          return;
        }
        setData(payload);
        setError("");
        setSettledQuery(query);
      })
      .catch((reason: unknown) => {
        if (!active || (reason instanceof DOMException && reason.name === "AbortError")) {
          return;
        }
        setData(null);
        setError(reason instanceof ApiError ? reason.message : "The search could not be completed.");
        setSettledQuery(query);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [query]);

  const pending = Boolean(query) && settledQuery !== query;
  const failed = !pending && Boolean(error) && settledQuery === query;
  const ready = !pending && !failed && data !== null && settledQuery === query;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <p className="text-sm text-muted">
        <Link href="/" className="hover:text-forest">
          Home
        </Link>
        <span className="px-2">›</span>
        <span className="text-ink">Results</span>
      </p>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Your Recommended Websites
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Here are the best Nigerian e-commerce websites based on your request.
          </p>
        </div>
        <div className="w-full lg:max-w-xl">
          <SearchPanel key={query} initialQuery={query} variant="toolbar" />
        </div>
      </div>

      {!query ? (
        <div className="mt-8 rounded-3xl border border-line bg-white p-6">
          <ExampleSearches examples={HOME_EXAMPLES} />
        </div>
      ) : null}

      {pending ? (
        <p className="mt-8 text-sm text-muted" role="status">
          Finding websites for “{query}”…
        </p>
      ) : null}

      {failed ? (
        <p className="mt-8 rounded-2xl border border-line bg-white px-5 py-4 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {ready && data ? (
        <section className="mt-8">
          <div className="grid gap-3 lg:grid-cols-3">
            <article className="rounded-2xl border border-line bg-white p-4">
              <p className="text-xs font-medium text-muted">Your search</p>
              <p className="mt-2 font-semibold text-ink">“{data.query}”</p>
            </article>
            <article className="rounded-2xl border border-line bg-white p-4">
              <p className="text-xs font-medium text-muted">Detected category</p>
              {data.detected_category ? (
                <>
                  <p className="mt-2 font-semibold text-ink">{data.detected_category.name}</p>
                  <p className="mt-1 text-sm text-forest">
                    {formatScore(data.detected_category.confidence)} confidence
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted">No single category stood out.</p>
              )}
            </article>
            <article className="rounded-2xl border border-line bg-white p-4">
              <p className="text-sm leading-6 text-muted">
                We compared your request with Nigerian e-commerce platforms using machine learning
                and natural language processing.
              </p>
            </article>
          </div>

          {data.message ? (
            <p className="mt-4 rounded-2xl bg-gold-soft px-4 py-3 text-sm leading-6 text-ink">
              {data.message}
            </p>
          ) : null}

          {data.results.length === 0 ? (
            <div className="mt-6">
              <ExampleSearches examples={HOME_EXAMPLES} />
            </div>
          ) : (
            <ol className="mt-4 grid gap-3">
              {data.results.map((item) => {
                const mark = MARKS[item.id];
                return (
                  <li
                    key={item.id}
                    className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold-soft text-sm font-bold text-forest">
                          {item.rank}
                        </span>
                        <span
                          className="grid h-14 w-14 shrink-0 place-items-center rounded-xl text-center text-[11px] font-extrabold leading-tight"
                          style={{
                            background: mark?.bg ?? "#eef4ff",
                            color: mark?.fg ?? "#1d4ed8",
                          }}
                        >
                          {mark?.label ?? initials(item.name)}
                        </span>
                        <div className="min-w-0">
                          <h2 className="text-lg font-bold tracking-tight">{item.name}</h2>
                          <p className="mt-1 text-sm leading-6 text-muted">{item.tagline}</p>
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {item.categories.slice(0, 3).map((category) => (
                              <li
                                key={category}
                                className="rounded-full bg-cream px-2.5 py-1 text-xs text-muted"
                              >
                                {category}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="w-full shrink-0 md:w-36">
                        <p className="text-2xl font-bold text-ink">{formatScore(item.score)}</p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gold-soft">
                          <div
                            className="h-full rounded-full bg-forest"
                            style={{ width: `${Math.min(100, item.score * 100)}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-muted">Relevance score</p>
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep md:w-auto"
                      >
                        Visit Website
                      </a>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      ) : null}

      <p className="mt-8 flex items-start gap-2 text-sm text-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Sarah recommends websites. It does not sell products or take payment.
      </p>
    </main>
  );
}
