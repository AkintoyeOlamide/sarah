"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { isBlankQuery, searchHref } from "@/lib/format";

export function SearchPanel({
  initialQuery = "",
  variant = "hero",
}: {
  initialQuery?: string;
  variant?: "hero" | "toolbar";
}) {
  const router = useRouter();
  const toolbar = variant === "toolbar";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const query = String(new FormData(event.currentTarget).get("q") ?? "");
    if (isBlankQuery(query)) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    router.push(searchHref(query));
  }

  return (
    <form action="/results" method="get" onSubmit={onSubmit} className="w-full" role="search">
      <label htmlFor="q" className="sr-only">
        What are you looking for?
      </label>
      <div className={`flex flex-col gap-3 ${toolbar ? "sm:flex-row" : "sm:flex-row"}`}>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="q"
            name="q"
            defaultValue={initialQuery}
            required
            placeholder="What are you looking for?"
            className={`w-full border border-line bg-white pl-11 pr-4 text-base text-ink outline-none ring-forest placeholder:text-muted/80 focus:ring-2 ${
              toolbar ? "h-12 rounded-xl" : "h-14 rounded-2xl"
            }`}
          />
        </div>
        <button
          type="submit"
          className={`inline-flex items-center justify-center gap-2 bg-forest font-semibold text-white transition hover:bg-forest-deep ${
            toolbar ? "h-12 rounded-xl px-5 text-sm" : "h-14 rounded-2xl px-6 text-base"
          }`}
        >
          {toolbar ? "Search" : "Find Websites"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
