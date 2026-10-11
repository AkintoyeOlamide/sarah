import { Link2, MessageSquare, Search, Sparkles } from "lucide-react";
import { ExampleSearches } from "@/components/ExampleSearches";
import { SearchPanel } from "@/components/SearchPanel";
import { HOME_EXAMPLES } from "@/lib/examples";

const STEPS = [
  {
    icon: MessageSquare,
    title: "1. Describe what you need",
    text: "Type your shopping request in natural language.",
  },
  {
    icon: Sparkles,
    title: "2. Sarah analyzes your request",
    text: "We use machine learning and NLP to understand your needs.",
  },
  {
    icon: Search,
    title: "3. Get recommended websites",
    text: "We compare and rank Nigerian e-commerce platforms.",
  },
  {
    icon: Link2,
    title: "4. Visit the best platform",
    text: "Click to visit the website that matches your needs.",
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute right-0 top-16 hidden h-64 w-[36%] md:block lg:top-6 lg:h-[28rem] lg:w-[46%]"
          aria-hidden="true"
        >
          <svg viewBox="0 0 200 180" className="absolute inset-8 text-sky-100">
            <path
              fill="currentColor"
              d="M48 18h78l18 16 6 28-8 22 16 18 4 26-18 22-28 12-36 8-34-6-22-24-10-36 2-28 8-24z"
            />
          </svg>
          <img
            src="/hero/products.png"
            alt=""
            className="relative h-full w-full object-contain object-right"
          />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16 lg:min-h-[34rem] lg:py-20">
          <div className="max-w-xl md:max-w-[60%] lg:max-w-[34rem]">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              Find the Right Place to Shop.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted sm:text-lg">
              Tell us what you&apos;re looking for, and Sarah will recommend the most relevant
              e-commerce websites in Nigeria.
            </p>
            <div className="mt-8">
              <SearchPanel variant="hero" />
            </div>
            <div className="mt-5">
              <ExampleSearches examples={HOME_EXAMPLES} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold tracking-tight">How Sarah Works</h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-4">
            {STEPS.map((step) => (
              <li key={step.title} className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-soft text-forest">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
