"use client";

import { useEffect, useState } from "react";
import { ApiError, fetchPlatforms } from "@/lib/api";
import type { Platform } from "@/lib/types";
import { initials } from "@/lib/format";

export function CatalogStrip() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchPlatforms(controller.signal)
      .then((catalog) => setPlatforms(catalog.platforms))
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") {
          return;
        }
        setError(reason instanceof ApiError ? reason.message : "The catalog could not be loaded.");
      });
    return () => controller.abort();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-4xl leading-tight">The catalog</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Every website Sarah can rank is listed here, including animals, utilities, banks, schools,
            hospitals, and everyday shops. A search reorders them for the words you used.
          </p>
        </div>
        {platforms.length > 0 ? (
          <p className="text-sm text-muted">{platforms.length} verified listings</p>
        ) : null}
      </div>
      {error ? (
        <p className="mt-6 rounded-2xl border border-line bg-paper px-4 py-4 text-sm leading-6 text-muted">
          {error}
        </p>
      ) : platforms.length === 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-3xl bg-paper" />
          ))}
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((platform) => (
            <li key={platform.id} className="border border-line bg-paper p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gold-soft text-xs font-semibold text-forest">
                  {initials(platform.name)}
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold">{platform.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">{platform.tagline}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted">{platform.categories.slice(0, 2).join(" · ")}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
