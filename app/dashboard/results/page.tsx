"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MessageSquare, CalendarCheck, ImageIcon, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react"

const results = [
  {
    disease: "Foot-and-Mouth Disease",
    confidence: 94,
    status: "High Risk",
    statusColor: "bg-red-500/10 text-red-400 border border-red-500/20",
    progressColor: "from-red-500 to-red-400",
    advisory: "Vesicular lesions detected on oral cavity and hooves. Immediate isolation of affected animals recommended. Contact veterinary authorities as this is a reportable disease.",
  },
  {
    disease: "Lumpy Skin Disease",
    confidence: 42,
    status: "Moderate",
    statusColor: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    progressColor: "from-amber-500 to-amber-400",
    advisory: "Possible nodular patterns detected on skin. Further observation recommended. Monitor for fever and lymph node enlargement.",
  },
  {
    disease: "Mastitis",
    confidence: 18,
    status: "Low Risk",
    statusColor: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
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
    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
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
        <p className="mt-2 text-sm text-muted-foreground">
          Review the AI-powered analysis of your uploaded livestock image.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
        {/* Left: Image preview */}
        <div className="lg:w-2/5">
          <div className="rounded-2xl border border-border bg-card p-5 sticky top-8">
            <div className="aspect-square rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">livestock_scan_01.jpg</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Uploaded 2 minutes ago</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-secondary border border-border p-3 text-center">
                <div className="text-lg font-bold text-foreground">3</div>
                <div className="text-xs text-muted-foreground">Diseases Checked</div>
              </div>
              <div className="rounded-lg bg-secondary border border-border p-3 text-center">
                <div className="text-lg font-bold text-primary">94%</div>
                <div className="text-xs text-muted-foreground">Top Confidence</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="flex-1 space-y-3">
          {results.map((result) => (
            <div
              key={result.disease}
              className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/20"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  {result.confidence >= 70 ? (
                    <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  ) : result.confidence >= 30 ? (
                    <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  )}
                  <h3 className="text-base font-bold text-foreground">{result.disease}</h3>
                </div>
                <span className={`flex-shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${result.statusColor}`}>
                  {result.status}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <AnimatedBar target={result.confidence} color={result.progressColor} />
                <span className="text-sm font-bold text-foreground w-10 text-right">{result.confidence}%</span>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">{result.advisory}</p>

              {result.confidence >= 50 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/dashboard/assistant"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Talk to AI Assistant
                  </Link>
                  <Link
                    href="/dashboard/booking"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                  >
                    <CalendarCheck className="h-3 w-3" />
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
