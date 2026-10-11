import { Info } from "lucide-react";

export const metadata = {
  title: "About",
  description: "A smarter way to find where to shop online in Nigeria.",
};

const STACK = [
  { mark: "N", name: "Next.js", role: "Frontend" },
  { mark: "TS", name: "TypeScript", role: "Application" },
  { mark: "TF", name: "TF-IDF", role: "Ranking" },
  { mark: "NLP", name: "NLP", role: "Text processing" },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-4xl font-extrabold tracking-tight">About Sarah</h1>
      <p className="mt-3 text-lg text-muted">A smarter way to find where to shop online in Nigeria.</p>

      <section className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight">What is Sarah?</h2>
        <p className="mt-3 leading-7 text-ink">
          Sarah is an automated website recommendation system that helps you find the most relevant
          Nigerian e-commerce websites based on what you want to buy. You simply describe what
          you&apos;re looking for in natural language, and Sarah uses machine learning and natural
          language processing to recommend the best platforms for your needs.
        </p>
        <p className="mt-4 flex gap-3 rounded-2xl border border-line bg-gold-soft px-4 py-3 text-sm leading-6 text-ink">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-forest" aria-hidden="true" />
          Sarah does not sell products. It only recommends e-commerce websites to help you decide
          where to shop.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight">Why it was created</h2>
        <p className="mt-3 leading-7">
          There are many e-commerce websites in Nigeria, and it can be confusing to know which one
          is best for your needs. Sarah simplifies the process by analyzing your request and
          matching it with the most relevant platforms.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight">Technology stack</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-4">
          {STACK.map((item) => (
            <li key={item.name} className="rounded-2xl border border-line bg-white p-4 text-center">
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-gold-soft text-xs font-bold text-forest">
                {item.mark}
              </span>
              <p className="mt-3 text-sm font-semibold">{item.name}</p>
              <p className="mt-1 text-xs text-muted">{item.role}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-6 text-muted">
          The ranking uses TF-IDF and cosine similarity in the browser, with the same term-weighting
          method as scikit-learn.
        </p>
      </section>
    </main>
  );
}
