"use client"

import { useEffect, useRef, useState } from "react"
import { Scan, BarChart3, MessageSquare, CalendarCheck } from "lucide-react"

const features = [
  {
    icon: Scan,
    title: "Multi-Disease Detection",
    description:
      "Upload images of your livestock and our AI analyzes them against a comprehensive database of known diseases with high accuracy.",
  },
  {
    icon: BarChart3,
    title: "Instant AI Confidence Results",
    description:
      "Get immediate results with confidence percentages, severity indicators, and actionable health status badges.",
  },
  {
    icon: MessageSquare,
    title: "Conversational AI Assistant",
    description:
      "Ask follow-up questions, get treatment recommendations, and receive personalized care advice through our intelligent chat.",
  },
  {
    icon: CalendarCheck,
    title: "Veterinary Appointment Booking",
    description:
      "Seamlessly connect with certified veterinary professionals and book consultations directly from your dashboard.",
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-24 lg:py-32 bg-card">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
            Platform Capabilities
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            A Purpose Built Health Platform
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Built for modern farmers and veterinary professionals seeking better livestock health outcomes.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, index }: { feature: (typeof features)[number]; index: number }) {
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
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const Icon = feature.icon

  return (
    <div
      ref={ref}
      className={`group relative rounded-3xl bg-background p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 border border-border/50 ${
        visible ? "animate-fade-in-up opacity-100" : "opacity-0"
      }`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-3 text-lg font-bold text-foreground">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
    </div>
  )
}
