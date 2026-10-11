"use client";

import Link from "next/link";
import { EXAMPLE_SEARCHES } from "@/lib/examples";
import { searchHref } from "@/lib/format";

export function ExampleSearches({
  examples = EXAMPLE_SEARCHES,
  label = "Try an example:",
}: {
  examples?: readonly string[];
  label?: string;
}) {
  return (
    <div>
      <p className="text-sm text-muted">{label}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {examples.map((example) => (
          <li key={example}>
            <Link
              href={searchHref(example)}
              className="inline-flex rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink/80 hover:border-forest hover:text-forest"
            >
              {example}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
