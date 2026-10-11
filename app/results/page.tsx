import { Suspense } from "react";
import { ResultsExplorer } from "@/components/ResultsExplorer";

export const metadata = {
  title: "Results",
  description: "Ranked Nigerian e-commerce websites for a shopping search.",
};

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <ResultsExplorer />
    </Suspense>
  );
}

function ResultsSkeleton() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <p className="mt-8 text-sm text-muted">Finding websites…</p>
    </main>
  );
}
