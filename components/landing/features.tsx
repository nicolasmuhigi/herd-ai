"use client"

import { useEffect, useRef, useState } from "react"
import {
  Scan,
  BarChart3,
  MessageSquare,
  CalendarCheck,
  Layers,
  Shield,
  LayoutDashboard,
  TrendingUp,
} from "lucide-react"

const features = [
  {
    icon: Layers,
    title: "Complete Health Solution",
    description:
      "Our fully integrated platform handles your livestock health needs seamlessly, whether you need to detect diseases, analyze results, or consult experts.",
    size: "large",
  },
  {
    icon: BarChart3,
    title: "Unified Ledger",
    description:
      "Our AI-driven ledger provides full visibility into all health events across your herd with detailed tracking of all activity.",
    size: "small",
  },
  {
    icon: Scan,
    title: "Rich Analysis Detail",
    description:
      "Receive detailed detection payloads with confidence scores, risk markers, and advisory data that empower you to make informed decisions.",
    size: "detail",
  },
  {
    icon: MessageSquare,
    title: "AI-Powered Consultation",
    description:
      "Get instant, expert-level guidance through our conversational AI assistant trained on veterinary science literature.",
    size: "small",
  },
  {
    icon: CalendarCheck,
    title: "Full Care Management",
    description:
      "We are with you every step of the way, from image upload to ongoing health optimization and veterinary booking.",
    size: "small",
  },
  {
    icon: LayoutDashboard,
    title: "World-Class Dashboard",
    description:
      "Streamline your operations and support your herd from LivestockAI's user-friendly Dashboard.",
    size: "small",
  },
  {
    icon: Shield,
    title: "Enterprise-Ready Security",
    description:
      "Our secure platform scales with you and is trusted by independent farmers and large agricultural corporations alike.",
    size: "small",
  },
  {
    icon: TrendingUp,
    title: "Designed for Scale",
    description:
      "Whether you manage 10 animals or 10,000, our infrastructure handles it without breaking a sweat.",
    size: "small",
  },
]

const detailFields = [
  "Disease Type",
  "Confidence Score",
  "Risk Level",
  "Detection Method",
  "Affected Region",
  "Recommended Action",
  "Species Detected",
  "Herd ID",
  "Image Quality Score",
  "Analysis Duration",
  "Secondary Matches",
  "Severity Index",
  "Treatment Protocol",
  "Quarantine Advice",
  "Follow-Up Date",
  "Vet Referral Status",
]

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16 lg:mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            A Purpose Built Health Platform
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Built for innovators seeking a better livestock health solution. LivestockAI helps reduce losses, improve outcomes, and optimize your operation for success.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[number]
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
  const isLarge = feature.size === "large"
  const isDetail = feature.size === "detail"

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:border-primary/30 lg:p-8 ${
        isLarge ? "md:col-span-2 lg:col-span-2 lg:row-span-1" : ""
      } ${isDetail ? "md:col-span-2 lg:col-span-1 lg:row-span-2" : ""} ${
        visible ? "animate-fade-in-up opacity-100" : "opacity-0"
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground mb-6">
        {feature.description}
      </p>

      {/* Detail card shows scrolling field tags like Highnote's "Rich Transaction Detail" */}
      {isDetail && (
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {detailFields.map((field) => (
            <div
              key={field}
              className="rounded-md bg-secondary/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground border border-border/50 truncate"
            >
              {field}
            </div>
          ))}
        </div>
      )}

      {/* Large card shows a mock dashboard snippet */}
      {isLarge && (
        <div className="mt-2 flex gap-3">
          {[
            { label: "Detection", icon: Scan },
            { label: "Analytics", icon: BarChart3 },
            { label: "Consultation", icon: MessageSquare },
          ].map((item) => {
            const ItemIcon = item.icon
            return (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-lg bg-secondary/50 border border-border/50 px-3 py-2 text-xs font-medium text-muted-foreground"
              >
                <ItemIcon className="h-3.5 w-3.5 text-primary" />
                {item.label}
              </div>
            )
          })}
        </div>
      )}

      {/* Small card icon in bottom-right */}
      {!isLarge && !isDetail && (
        <div className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary opacity-50 transition-opacity group-hover:opacity-100 lg:bottom-8 lg:right-8">
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  )
}
