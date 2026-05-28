import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Minus, X, Zap } from "lucide-react";
import { ProductPreview } from "@/components/marketing/ProductPreview";
import {
  COMPARISON,
  EFFECTIVE_RETRO_ARTICLE,
  FAQ_ITEMS,
  FREE_FOREVER,
  REMOTE_TEAMS_ARTICLE,
  RETRO_FAILURES,
  RETRO_STEPS,
  SPRINT_RETRO_ARTICLE,
  TEMPLATES,
  WHY_TEAMS_LOVE
} from "@/lib/marketing/content";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { SupportCoffeeTrigger } from "@/components/marketing/SupportCoffeeTrigger";
import { PRODUCT_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

function SectionIntro({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3f7463]">{eyebrow}</p>
      ) : null}
      <h2 className={cn("text-3xl font-bold tracking-tight text-[#1a1828] sm:text-4xl", eyebrow && "mt-3")}>{title}</h2>
      {description ? <p className="mt-4 text-lg leading-8 text-[#3f5f4e]">{description}</p> : null}
    </div>
  );
}

function PrimaryCta({
  className,
  children = "Start free retro",
  size = "default"
}: {
  className?: string;
  children?: string;
  size?: "default" | "lg";
}) {
  return (
    <Link
      href="/retro"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl border border-[#FFBFA8] bg-[#FFBFA8] text-[#3d4038] font-semibold transition hover:bg-[#FFD9C7]",
        size === "lg" ? "px-7 py-4 text-lg shadow-[0_22px_50px_-24px_rgba(255,191,168,0.55)]" : "px-6 py-3.5 text-base",
        className
      )}
    >
      {children}
      <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
    </Link>
  );
}

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="mx-auto h-5 w-5 text-emerald-600" aria-label="Yes" />;
  }
  if (value === false) {
    return <X className="mx-auto h-5 w-5 text-[#c9c2d7]" aria-label="No" />;
  }
  if (value === "limited") {
    return <Minus className="mx-auto h-5 w-5 text-amber-600" aria-label="Limited" />;
  }
  return <span className="text-sm text-[#3f5f4e]">{value}</span>;
}

export function MarketingHome() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#B7F0D1]/70 bg-[#F5F2E8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <BrandLogo href="/" theme="light" priority />
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
            <a
              href="https://github.com/Raph13009/retro"
              target="_blank"
              rel="noreferrer"
              className="group hidden rounded-xl px-3 py-2 text-sm font-semibold text-[#3f5f4e] transition hover:bg-white/70 hover:text-[#2f7a57] md:inline-flex md:items-center md:gap-2"
              aria-label="Contribute on GitHub"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M12 .5C5.73.5.75 5.49.75 11.78c0 5.03 3.26 9.3 7.78 10.81.57.1.78-.25.78-.55 0-.27-.01-1.18-.02-2.14-3.17.69-3.84-1.35-3.84-1.35-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.14.08 1.75 1.17 1.75 1.17 1.02 1.74 2.67 1.24 3.32.95.1-.73.4-1.24.72-1.52-2.53-.29-5.19-1.27-5.19-5.64 0-1.25.45-2.27 1.17-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.14 1.17a10.9 10.9 0 0 1 5.71 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.73.8 1.17 1.82 1.17 3.07 0 4.38-2.67 5.35-5.21 5.64.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.65.79.55 4.51-1.51 7.77-5.78 7.77-10.81C23.25 5.49 18.27.5 12 .5z" />
              </svg>
              <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-[11rem] group-hover:opacity-100">
                Contribute on GitHub
              </span>
            </a>
            <SupportCoffeeTrigger variant="header" />
            <Link
              href="/templates"
              className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-[#3f5f4e] transition hover:bg-white/70 hover:text-[#2f7a57] sm:inline"
            >
              Templates
            </Link>
            <Link
              href="/blog"
              className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-[#3f5f4e] transition hover:bg-white/70 hover:text-[#2f7a57] md:inline"
            >
              Guides
            </Link>
            <a
              href="#faq"
              className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-[#3f5f4e] transition hover:bg-white/70 hover:text-[#2f7a57] md:inline"
            >
              FAQ
            </a>
            <PrimaryCta className="!px-4 !py-2.5 !text-sm" />
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-[#B7F0D1]/65">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                "radial-gradient(ellipse 75% 55% at 8% -5%, rgba(143, 231, 225, 0.35), transparent 55%), radial-gradient(ellipse 60% 45% at 92% 8%, rgba(183, 240, 209, 0.35), transparent 50%)"
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
            <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-20 xl:gap-28">
              <div className="max-w-md lg:max-w-lg">
                <p className="text-sm font-medium tracking-wide text-[#3f7463]">Free forever · No signup</p>
                <h1 className="mt-5 text-balance text-[2.35rem] font-bold leading-[1.08] tracking-[-0.05em] text-[#1a1828] sm:text-5xl lg:text-[3.25rem]">
                  Retros people don&apos;t{" "}
                  <span className="bg-gradient-to-r from-[#8FE7E1] via-[#B7F0D1] to-[#FFBFA8] bg-clip-text text-transparent">
                    hate
                  </span>
                  .
                </h1>
                <p className="mt-6 max-w-sm text-pretty text-lg leading-8 text-[#3f5f4e]">
                  Run collaborative retros in seconds.
                  <br />
                  Built for agile teams.
                </p>
                <div className="mt-12">
                  <PrimaryCta size="lg">Start free retro</PrimaryCta>
                </div>
              </div>
              <div className="relative lg:pl-2 xl:pl-6">
                <ProductPreview variant="hero" />
              </div>
            </div>
          </div>
        </section>

        {/* WHY TEAMS LOVE IT */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="why-heading">
          <SectionIntro
            eyebrow="Why teams love it"
            title="Simple, engaging, actionable retrospectives"
            description="Everything competitors promise—fast setup, remote collaboration, honest feedback, and real follow-through—without the clutter."
          />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_TEAMS_LOVE.map(({ title, description }) => (
              <li key={title} className="liquid-panel group rounded-2xl p-6 transition hover:shadow-[0_28px_80px_-48px_rgba(143,231,225,0.55)]">
                <div className="mb-4 inline-flex rounded-xl bg-[#B7F0D1] p-3 text-[#3f7463] transition group-hover:bg-[#8FE7E1] group-hover:text-[#2f3c34]">
                  <Zap className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="text-xl font-semibold text-[#1a1828]">{title}</h3>
                <p className="mt-2 leading-7 text-[#3f5f4e]">{description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* PRODUCT PREVIEW */}
        <section className="border-y border-[#d7e9df]/60 bg-white" aria-labelledby="preview-heading">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <SectionIntro
              eyebrow="See the board"
              title="Your retrospective, live on one collaborative canvas"
              description="Columns, cards, votes, reactions, and action items—the full retro flow your team runs every sprint."
            />
            <div className="mt-10 max-w-4xl mx-auto">
              <ProductPreview variant="showcase" />
            </div>
            <div className="mt-10 flex justify-center">
              <PrimaryCta>Create retro board</PrimaryCta>
            </div>
          </div>
        </section>

        {/* HOW TO RUN */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="run-heading">
          <SectionIntro
            eyebrow="Facilitation guide"
            title="How to run an effective retrospective"
            description="A proven five-step flow that keeps your retro meeting focused, fair, and actionable."
          />
          <ol className="mt-12 grid gap-6 md:grid-cols-5">
            {RETRO_STEPS.map(({ title, body }, index) => (
              <li key={title} className="liquid-panel rounded-2xl p-5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#3f7463] text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold text-[#1a1828]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#3f5f4e]">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* SUPPORT */}
        <section className="relative border-y border-[#B7F0D1]/35 bg-[#2f3c34]" aria-labelledby="support-heading">
          <div
            className="pointer-events-none absolute inset-0 opacity-85"
            aria-hidden
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 10% 22%, rgba(143, 231, 225, 0.22), transparent 60%), radial-gradient(ellipse 65% 50% at 88% 78%, rgba(255, 191, 168, 0.2), transparent 60%)"
            }}
          />
          <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#B7F0D1]">Support</p>
              <h2 id="support-heading" className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Keep paraboll online and shipping <span aria-hidden>☕</span>
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#e9f7ef]">
                Love the product? Support development with a coffee and help us ship more features, faster.
              </p>
            </div>
            <SupportCoffeeTrigger variant="section" className="shrink-0" />
          </div>
        </section>

        {/* SEO ARTICLES */}
        <section className="border-t border-[#d7e9df]/60 bg-[#F5F2E8]" aria-labelledby="what-heading">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <article className="liquid-panel rounded-[1.75rem] p-6 sm:p-10">
              <h2 id="what-heading" className="text-3xl font-bold tracking-tight text-[#1a1828] sm:text-4xl">
                What is a sprint retrospective?
              </h2>
              <div className="prose-retro mt-6 space-y-4 text-base leading-8 text-[#3f5f4e]">
                {SPRINT_RETRO_ARTICLE.split("\n\n").map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </article>
            <article className="liquid-panel mt-8 rounded-[1.75rem] p-6 sm:p-10">
              <h2 className="text-3xl font-bold tracking-tight text-[#1a1828] sm:text-4xl">
                How to run an effective retrospective
              </h2>
              <div className="prose-retro mt-6 space-y-4 text-base leading-8 text-[#3f5f4e]">
                {EFFECTIVE_RETRO_ARTICLE.split("\n\n").map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </article>
          </div>
        </section>

        {/* TEMPLATES */}
        <section id="templates" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="templates-heading">
          <SectionIntro
            eyebrow="Retrospective templates"
            title="Popular formats for every sprint mood"
            description={`Start with Start Stop Continue built into ${PRODUCT_NAME}, or explore classic structures your team can adopt next.`}
          />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.map((template) => {
              const isAvailable = template.slug === "start-stop-continue";

              return (
                <li
                  key={template.slug}
                  className={cn("liquid-panel flex flex-col rounded-2xl p-5", !isAvailable && "opacity-65 saturate-75")}
                >
                  <span className="text-3xl" aria-hidden>
                    {template.emoji}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-[#1a1828]">{template.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[#3f5f4e]">{template.description}</p>
                  <span
                    className={cn(
                      "mt-3 inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      isAvailable ? "bg-[#B7F0D1] text-[#3f7463]" : "bg-[#f1eee4] text-[#7a6a56]"
                    )}
                  >
                    {isAvailable ? "Built in" : "Coming soon"}
                  </span>
                  {isAvailable ? (
                    <Link
                      href="/retro"
                      className="ghost-button mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                    >
                      Use template
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-[#e6ded1] bg-[#f7f3ea] px-4 py-2.5 text-sm font-semibold text-[#9b8c77] cursor-not-allowed"
                    >
                      Not available
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* FREE FOREVER */}
        <section className="border-y border-[#d7e9df]/60 bg-[#3f7463] text-white" aria-labelledby="free-heading">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 id="free-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Free online retrospective tool
                </h2>
                <p className="mt-4 text-lg leading-8 text-[#e7f5ed]">
                  Run unlimited sprint retros with your whole team. No signup walls, no credit card, no trial countdown—just
                  a fast retro board that stays free.
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {FREE_FOREVER.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#c9b8ff]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* REMOTE TEAMS */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="remote-heading">
          <article className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <SectionIntro
                eyebrow="Remote & hybrid"
                title="Built for remote agile teams"
              />
              <ul className="mt-6 space-y-2 text-sm font-semibold text-[#3f5f4e]">
                {["Remote retrospective tool", "Online retro board", "Hybrid teams", "Distributed Scrum teams"].map(
                  (kw) => (
                    <li key={kw} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#3f7463]" />
                      {kw}
                    </li>
                  )
                )}
              </ul>
              <PrimaryCta className="mt-8">Run your sprint retro</PrimaryCta>
            </div>
            <div className="liquid-panel rounded-[1.75rem] p-6 sm:p-8">
              <div className="space-y-4 text-base leading-8 text-[#3f5f4e]">
                {REMOTE_TEAMS_ARTICLE.split("\n\n").map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </div>
          </article>
        </section>

        {/* WHY RETROS FAIL */}
        <section className="border-t border-[#d7e9df]/60 bg-white" aria-labelledby="fail-heading">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <SectionIntro
              eyebrow="Problem → solution"
              title="Why most retrospectives fail"
              description={`Sound familiar? ${PRODUCT_NAME} fixes the patterns that drain energy from your agile ceremonies.`}
            />
            <ul className="mt-12 space-y-4">
              {RETRO_FAILURES.map(({ problem, solution }) => (
                <li key={problem} className="liquid-panel grid gap-4 rounded-2xl p-6 md:grid-cols-[1fr_1.2fr] md:items-center">
                  <p className="text-lg font-semibold text-[#1a1828]">{problem}</p>
                  <p className="leading-7 text-[#3f5f4e]">{solution}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* COMPARISON */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="compare-heading">
          <SectionIntro
            eyebrow="Compare tools"
            title={`How ${PRODUCT_NAME} compares to other retrospective tools`}
            description="Looking for the best free retrospective tool or an EasyRetro alternative? See how we stack up."
          />
          <div className="liquid-panel mt-10 overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <caption className="sr-only">Feature comparison between {PRODUCT_NAME} and other retrospective tools</caption>
              <thead>
                <tr className="border-b border-[#B7F0D1]/70">
                  {COMPARISON.headers.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className={cn(
                        "px-4 py-4 font-bold text-[#1a1828]",
                        header !== "Feature" && "text-center",
                        header === PRODUCT_NAME && "bg-[#B7F0D1]/60 text-[#3f7463]"
                      )}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.rows.map((row) => (
                  <tr key={row.feature} className="border-b border-[#B7F0D1]/80 last:border-0">
                    <th scope="row" className="px-4 py-3.5 font-semibold text-[#3f7463]">
                      {row.feature}
                    </th>
                    <td className="bg-[#B7F0D1]/30 px-4 py-3.5 text-center">
                      <ComparisonCell value={row.paraboll} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <ComparisonCell value={row.easyRetro} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <ComparisonCell value={row.teamRetro} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <ComparisonCell value={row.parabol} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-[#d7e9df]/60 bg-[#F5F2E8]" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <SectionIntro
              eyebrow="FAQ"
              title="Retrospective questions, answered"
              description="Everything facilitators and Scrum teams ask before choosing an online retro board."
            />
            <dl className="mt-10 space-y-3">
              {FAQ_ITEMS.map(({ question, answer }) => (
                <details key={question} name="faq-accordion" className="liquid-panel group rounded-2xl px-5 py-1 open:pb-5">
                  <summary className="cursor-pointer list-none py-4 text-lg font-semibold text-[#1a1828] marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {question}
                      <span className="text-[#3f5f4e] transition group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <dd className="pb-4 leading-7 text-[#3f5f4e]">{answer}</dd>
                </details>
              ))}
            </dl>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="border-t border-[#B7F0D1]/70 bg-gradient-to-br from-[#8FE7E1] via-[#B7F0D1] to-[#FFD9C7] text-[#2f3c34]">
          <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Start your free retrospective
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-[#3f5f4e]">
              Run better retros with your team today. No signup. Start in seconds.
            </p>
            <PrimaryCta className="mt-9">Start free retro</PrimaryCta>
          </div>
        </section>
      </main>

      <MarketingSiteFooter showFaqLink />
    </>
  );
}
