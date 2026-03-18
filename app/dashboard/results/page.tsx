"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MessageSquare, CalendarCheck, ImageIcon, AlertTriangle, CheckCircle2, AlertCircle, Shield, Heart } from "lucide-react"
import { getDiseaseAdvice } from "@/lib/disease-advice"

interface AnalysisData {
  imageUrl?: string
  detectedDisease?: string
  confidence?: number
  classLabels?: string[]
  classScores?: Record<string, number>
  predictions?: {
    healthy?: number
    footAndMouth?: number
    lumpySkin?: number
    anthrax?: number
  }
}

interface ResultCard {
  disease: string
  confidence: number
  status: string
  statusColor: string
  progressColor: string
  advisory: string
  isHealthy: boolean
}

function resolveAnalysisImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return imageUrl;
}

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
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null)

  useEffect(() => {
    const savedAnalysis = localStorage.getItem("latestAnalysis")
    const savedPreview = localStorage.getItem("latestUploadedPreview")

    if (savedAnalysis) {
      try {
        setAnalysis(JSON.parse(savedAnalysis))
      } catch {
        setAnalysis(null)
      }
    }

    if (savedPreview) {
      setUploadedPreview(savedPreview)
    }
  }, [])

  const predictions = analysis?.predictions || {}
  const classLabels = analysis?.classLabels ?? []
  const classScores = analysis?.classScores ?? {}

  const diseaseNameByKey: Record<string, string> = {
    HEALTHY: "Healthy",
    FOOT_AND_MOUTH: "Foot-and-Mouth Disease",
    LUMPY_SKIN: "Lumpy Skin Disease",
    ANTHRAX: "Anthrax",
    MASTITIS: "Mastitis",
  }

  const legacyScoreByKey: Record<string, number> = {
    HEALTHY: predictions.healthy ?? 0,
    FOOT_AND_MOUTH: predictions.footAndMouth ?? 0,
    LUMPY_SKIN: predictions.lumpySkin ?? 0,
    ANTHRAX: predictions.anthrax ?? 0,
  }

  const activeClassKeys = classLabels.length > 0
    ? classLabels
    : ["HEALTHY", "FOOT_AND_MOUTH", "LUMPY_SKIN", "ANTHRAX"]

  const predictionRows = activeClassKeys.map((key) => ({
    key,
    label: diseaseNameByKey[key] ?? key.replace(/_/g, " "),
    value: classScores[key] ?? legacyScoreByKey[key] ?? 0,
  }))

  // Sort to find top result first
  const sortedRows = [...predictionRows].sort((a, b) => b.value - a.value)
  const topKey = sortedRows[0]?.key
  const isHealthyTop = topKey === "HEALTHY"

  const results: ResultCard[] = predictionRows
    .map((item) => {
      const confidence = Math.round((item.value || 0) * 100)
      const isHealthy = item.key === "HEALTHY"
      const isTopResult = item.key === topKey

      let status: string
      let statusColor: string
      let progressColor: string

      // Enhanced styling for HEALTHY - always show positive green state
      if (isHealthy) {
        status = "Safe & Healthy"
        statusColor = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
        progressColor = "from-emerald-400 to-green-500"
      } else {
        // Disease detected - use warning colors
        if (confidence >= 70) {
          status = "High Risk"
          statusColor = "bg-red-500/10 text-red-400 border border-red-500/20"
          progressColor = "from-red-500 to-red-400"
        } else if (confidence >= 30) {
          status = "Moderate"
          statusColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          progressColor = "from-amber-500 to-amber-400"
        } else {
          status = "Low Risk"
          statusColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          progressColor = "from-emerald-500 to-emerald-400"
        }
      }

      return {
        disease: item.label,
        confidence,
        status,
        statusColor,
        progressColor,
        advisory: getDiseaseAdvice(item.key).recommendedAction,
        isHealthy,
      }
    })
    .sort((a, b) => b.confidence - a.confidence)

  const normalizedAnalysisImage = resolveAnalysisImageUrl(analysis?.imageUrl || null)

  // Prefer user's local preview first so results page always shows what was uploaded.
  const displayImage = uploadedPreview || normalizedAnalysisImage
  const topResult = results.length > 0 ? results[0] : null
  const topConfidence = topResult?.confidence ?? 0
  const isTopHealthy = topResult?.isHealthy ?? false

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
              {displayImage ? (
                <img
                  src={displayImage}
                  alt="Uploaded livestock"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">No image available</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Upload and analyze an image first</p>
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-secondary border border-border p-3 text-center">
                <div className="text-lg font-bold text-foreground">{results.length}</div>
                <div className="text-xs text-muted-foreground">Diseases Checked</div>
              </div>
              <div className={`rounded-lg border p-3 text-center transition-all ${
                isTopHealthy
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-secondary border-border"
              }`}>
                <div className={`text-lg font-bold ${
                  isTopHealthy
                    ? "text-emerald-400"
                    : "text-primary"
                }`}>{topConfidence}%</div>
                <div className="text-xs text-muted-foreground">Top Confidence</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="flex-1 space-y-3">
          {results.map((result, index) => {
            const isTopResult = index === 0
            const showPositiveStyle = result.isHealthy && isTopResult

            return (
              <div
                key={result.disease}
                className={`rounded-2xl border p-6 transition-all hover:border-primary/20 ${
                  showPositiveStyle
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    {result.isHealthy ? (
                      isTopResult ? (
                        <Shield className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Heart className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      )
                    ) : (
                      <>
                        {result.confidence >= 70 ? (
                          <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                        ) : result.confidence >= 30 ? (
                          <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        )}
                      </>
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

                {isTopResult && !result.isHealthy && (
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
            )
          })}
        </div>
      </div>
    </div>
  )
}
