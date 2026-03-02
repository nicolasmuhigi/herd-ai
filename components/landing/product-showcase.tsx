"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, Code2, Bell, Package, Shield } from "lucide-react"

const devFeatures = [
  {
    icon: Code2,
    title: "REST & GraphQL API",
    description:
      "Rapidly build flexible, production-ready integrations with LivestockAI's comprehensive API.",
  },
  {
    icon: Bell,
    title: "Notifications & Webhooks",
    description:
      "Supercharge your workflows with our dynamic notification and webhook system for real-time alerts.",
  },
  {
    icon: Package,
    title: "Easy-to-Use SDKs",
    description:
      "Integrate complex detection flows easily by using our SDKs to simplify your development process.",
  },
  {
    icon: Shield,
    title: "Enterprise-Ready Security",
    description:
      "LivestockAI's platform offers best-in-class security and compliance practices for operations of all sizes.",
  },
]

export function ProductShowcase() {
  return (
    <section id="developers" className="py-24 lg:py-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between mb-16 lg:mb-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
              A Modern Stack for Modern Operations
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {"LivestockAI's API enables your team to bring your health monitoring product to market quickly. Focus on your customer and product experiences, while our modern tech stack handles the rest."}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/signup"
              className="group flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Start Building
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#"
              className="group flex items-center gap-1.5 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Read Docs
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Code preview mock */}
        <div className="mb-16 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-muted-foreground/20" />
              <div className="h-3 w-3 rounded-full bg-muted-foreground/20" />
              <div className="h-3 w-3 rounded-full bg-muted-foreground/20" />
            </div>
            <span className="ml-2 text-xs text-muted-foreground font-mono">analyze.ts</span>
          </div>
          <div className="p-6 font-mono text-sm leading-relaxed">
            <div className="text-muted-foreground/60">
              {"// Analyze a livestock image with LivestockAI"}
            </div>
            <div className="mt-2">
              <span className="text-sky-400">{"const"}</span>
              <span className="text-foreground">{" result "}</span>
              <span className="text-muted-foreground">{"= "}</span>
              <span className="text-sky-400">{"await"}</span>
              <span className="text-amber-400">{" livestockAI"}</span>
              <span className="text-foreground">{"."}</span>
              <span className="text-emerald-400">{"analyze"}</span>
              <span className="text-foreground">{"("}</span>
              <span className="text-foreground">{"{"}</span>
            </div>
            <div className="ml-4">
              <span className="text-foreground">{"image"}</span>
              <span className="text-muted-foreground">{": "}</span>
              <span className="text-amber-300">{"imageBuffer"}</span>
              <span className="text-foreground">{","}</span>
            </div>
            <div className="ml-4">
              <span className="text-foreground">{"species"}</span>
              <span className="text-muted-foreground">{": "}</span>
              <span className="text-primary">{"\"bovine\""}</span>
              <span className="text-foreground">{","}</span>
            </div>
            <div className="ml-4">
              <span className="text-foreground">{"detectionMode"}</span>
              <span className="text-muted-foreground">{": "}</span>
              <span className="text-primary">{"\"comprehensive\""}</span>
              <span className="text-foreground">{","}</span>
            </div>
            <div>
              <span className="text-foreground">{"})"}</span>
            </div>
            <div className="mt-4 text-muted-foreground/60">
              {"// Returns: { diseases: [...], confidence: 0.94, risk: \"high\" }"}
            </div>
          </div>
        </div>

        {/* Dev feature cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {devFeatures.map((feature, i) => (
            <DevFeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function DevFeatureCard({
  feature,
  index,
}: {
  feature: (typeof devFeatures)[number]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const Icon = feature.icon

  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:border-primary/30 ${
        visible ? "animate-fade-in-up opacity-100" : "opacity-0"
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-2">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {feature.description}
      </p>
    </div>
  )
}
