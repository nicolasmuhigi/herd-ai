"use client"

import Link from "next/link"
import { ArrowRight, Scan, BarChart3, Layers } from "lucide-react"

const productCards = [
  {
    icon: Scan,
    title: "Detection",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconBg: "bg-emerald-500/20 text-emerald-400",
    description: "Analyze livestock images with AI-powered detection for both common and rare diseases.",
    tags: ["Image Analysis", "Multi-Disease", "Real-Time"],
  },
  {
    icon: BarChart3,
    title: "Analytics",
    color: "from-sky-500/20 to-sky-500/5",
    iconBg: "bg-sky-500/20 text-sky-400",
    description: "Get detailed confidence scores, risk assessments, and actionable health insights instantly.",
    tags: ["Confidence Scores", "Risk Levels", "Trends"],
  },
  {
    icon: Layers,
    title: "Unified Health",
    color: "from-amber-500/20 to-amber-500/5",
    iconBg: "bg-amber-500/20 text-amber-400",
    description: "Detect, consult, and treat on one platform to unlock unparalleled herd management.",
    tags: ["End-to-End"],
  },
]

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* Subtle gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Headline */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-7xl text-balance">
            The New Standard for{" "}
            <span className="text-primary">Livestock Health</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Meet the first true end-to-end AI health platform.
            <br className="hidden sm:block" />
            Detect diseases, analyze results, consult AI, and more.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 sm:w-auto"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#"
              className="group flex w-full items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:w-auto"
            >
              Contact Sales
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Product Cards - like Highnote's three cards */}
        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {productCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b ${card.color} p-6 transition-all hover:border-primary/30 hover:-translate-y-1 lg:p-8`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-foreground lg:text-2xl">{card.title}</h2>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                  {card.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {card.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-background/50 px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border/50">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
