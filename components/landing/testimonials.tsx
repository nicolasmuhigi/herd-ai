"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

const testimonials = [
  {
    quote:
      "Every single person we worked with was just a total rock star. In fact, without being asked, the head of our engineering team told me that the LivestockAI API was the best he had seen from every single vendor we dealt with.",
    name: "James Okonkwo",
    role: "CEO",
    company: "AgriTech Solutions",
    initial: "J",
  },
  {
    quote:
      "LivestockAI's infrastructure for disease detection across our herds made it a perfect fit for this stage of our growth. We've been amazed by the flexibility with which the platform operates.",
    name: "Sarah Mitchell",
    role: "COO",
    company: "HerdVault",
    initial: "S",
  },
  {
    quote:
      "LivestockAI's developer-friendly APIs represent a departure from legacy providers which often have bulky, complex processes and lack the ability to customize and scale at the velocity our customers need.",
    name: "Maria Chen",
    role: "CTO",
    company: "FarmWise AI",
    initial: "M",
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1))

  const t = testimonials[current]

  return (
    <section className="py-24 lg:py-32 border-t border-border">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="relative">
          <Quote className="absolute -top-2 -left-2 h-10 w-10 text-primary/20 lg:h-14 lg:w-14 lg:-top-4 lg:-left-6" />

          <blockquote className="relative pl-6 lg:pl-10">
            <p className="text-xl leading-relaxed text-foreground lg:text-2xl font-medium">
              {`"${t.quote}"`}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                {t.initial}
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">{t.name}</div>
                <div className="text-sm text-muted-foreground">
                  {t.role}, {t.company}
                </div>
              </div>
            </div>
          </blockquote>

          {/* Navigation */}
          <div className="mt-10 flex items-center gap-3">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === current ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
