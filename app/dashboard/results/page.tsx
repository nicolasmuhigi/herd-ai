"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BarChart3, MessageSquare, CalendarCheck, ImageIcon, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react"

const results = [
  {
    disease: "Foot-and-Mouth Disease",
    confidence: 94,
    status: "High Risk",
    statusColor: "bg-red-100 text-red-700",
    progressColor: "from-red-500 to-red-400",
    advisory: "Vesicular lesions detected on oral cavity and hooves. Immediate isolation of affected animals recommended. Contact veterinary authorities as this is a reportable disease.",
  },
  {
    disease: "Lumpy Skin Disease",
    confidence: 42,
    status: "Moderate",
    statusColor: "bg-amber-100 text-amber-700",
    progressColor: "from-amber-500 to-amber-400",
    advisory: "Possible nodular patterns detected on skin. Further observation recommended. Monitor for fever and lymph node enlargement.",
  },
  {
    disease: "Mastitis",
    confidence: 18,
    status: "Low Risk",
    statusColor: "bg-emerald-100 text-emerald-700",
    progressColor: "from-emerald-500 to-emerald-400",
    advisory: "Minor indicators present. Regular hygiene and monitoring should suffice. No immediate action required.",
  },
]

function AnimatedBar({ target, color }: { target: number; color: string }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => setWidth(target), 300)
    return () => clearTimeout(timer)
  }, [target])

  return (
    <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

export default function ResultsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Analysis Results</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Review the AI-powered analysis of your uploaded livestock image.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Left: Image preview */}
        <div className="lg:w-2/5">
          <div className="rounded-3xl bg-card border border-border/50 p-5 shadow-lg shadow-primary/5 sticky top-8">
            <div className="aspect-square rounded-2xl bg-background border border-border/50 flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">livestock_scan_01.jpg</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Uploaded 2 minutes ago</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-background border border-border/50 p-3 text-center">
                <div className="text-lg font-bold text-foreground">3</div>
                <div className="text-xs text-muted-foreground">Diseases Checked</div>
              </div>
              <div className="rounded-xl bg-background border border-border/50 p-3 text-center">
                <div className="text-lg font-bold text-primary">94%</div>
                <div className="text-xs text-muted-foreground">Top Confidence</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="flex-1 space-y-4">
          {results.map((result) => (
            <div
              key={result.disease}
              className="rounded-3xl bg-card border border-border/50 p-6 shadow-lg shadow-primary/5 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  {result.confidence >= 70 ? (
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  ) : result.confidence >= 30 ? (
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  )}
                  <h3 className="text-lg font-bold text-foreground">{result.disease}</h3>
                </div>
                <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold ${result.statusColor}`}>
                  {result.status}
                </span>
              </div>

              {/* Confidence bar */}
              <div className="flex items-center gap-3 mb-4">
                <AnimatedBar target={result.confidence} color={result.progressColor} />
                <span className="text-lg font-bold text-foreground w-12 text-right">{result.confidence}%</span>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">{result.advisory}</p>

              {result.confidence >= 50 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/dashboard/assistant"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Talk to AI Assistant
                  </Link>
                  <Link
                    href="/dashboard/booking"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-accent/10 px-4 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
                  >
                    <CalendarCheck className="h-3.5 w-3.5" />
                    Request Vet Support
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
