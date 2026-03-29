"use client"

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react"
import { Send, Bot, User } from "lucide-react"
import { getDiseaseAdvice } from "@/lib/disease-advice"
import { parseApiResponse } from "@/lib/http"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface AnalysisData {
  detectedDisease?: string
  confidence?: number
  classLabels?: string[]
  classScores?: Record<string, number>
  uploadDistrict?: string | null
  nearestClinic?: {
    name: string
    address: string
    phone: string | null
    distanceKm: number
  } | null
}

type ResponseMode = "concise" | "detailed"

const SUPPORTED_DISEASES = [
  "HEALTHY",
  "FOOT_AND_MOUTH",
  "LUMPY_SKIN",
  "ANTHRAX",
  "MASTITIS",
] as const

type SupportedDisease = (typeof SUPPORTED_DISEASES)[number]

function toSupportedDisease(value?: string): SupportedDisease | undefined {
  if (!value) return undefined
  return SUPPORTED_DISEASES.includes(value as SupportedDisease)
    ? (value as SupportedDisease)
    : undefined
}

function renderInlineMarkdown(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    return <span key={index}>{part}</span>
  })
}

function renderAssistantMarkdown(content: string): ReactNode[] {
  const lines = content.split("\n")
  const blocks: ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      blocks.push(<div key={`space-${i}`} className="h-2" />)
      continue
    }

    if (
      /^[-*]\s+/.test(line) ||
      /^-\s+\[\s?[xX]?\s?\]\s+/.test(line) ||
      /^\[\s?[xX]?\s?\]\s+/.test(line)
    ) {
      const items: string[] = []
      let j = i
      while (j < lines.length) {
        const current = lines[j].trim()
        if (
          !(
            /^[-*]\s+/.test(current) ||
            /^-\s+\[\s?[xX]?\s?\]\s+/.test(current) ||
            /^\[\s?[xX]?\s?\]\s+/.test(current)
          )
        ) {
          break
        }
        items.push(
          current
            .replace(/^[-*]\s+\[\s?[xX]?\s?\]\s+/, "")
            .replace(/^\[\s?[xX]?\s?\]\s+/, "")
            .replace(/^[-*]\s+/, "")
        )
        j++
      }
      blocks.push(
        <ul key={`ul-${i}`} className="list-disc space-y-1 pl-5">
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      )
      i = j - 1
      continue
    }

    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = []
      let j = i
      while (j < lines.length) {
        const current = lines[j].trim()
        if (!/^\d+[.)]\s+/.test(current)) break
        items.push(current.replace(/^\d+[.)]\s+/, ""))
        j++
      }
      blocks.push(
        <ol key={`ol-${i}`} className="list-decimal space-y-1 pl-5">
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>
      )
      i = j - 1
      continue
    }

    blocks.push(
      <p key={`p-${i}`} className="whitespace-pre-wrap">
        {renderInlineMarkdown(line)}
      </p>
    )
  }

  return blocks
}

function formatDiseaseLabel(disease?: string): string {
  if (!disease) return "an unknown condition"
  return disease
    .split("_")
    .map((chunk) => chunk.charAt(0) + chunk.slice(1).toLowerCase())
    .join(" ")
}

function normalizeDistrictLabel(raw?: string | null): string | null {
  if (!raw) return null
  const value = raw.trim()
  if (!value) return null
  if (/^near\s+-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/i.test(value)) {
    return null
  }

  const knownDistricts = [
    "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Kigali City", "Muhanga",
    "Nyarugenge", "Kamonyi", "Kicukiro", "Gasabo", "Rulindo", "Musanze", "Gicumbi",
    "Gakenke", "Burera", "Nyabihu", "Rubavu", "Rusizi", "Karongi", "Rutsiro", "Huye",
    "Nyanza", "Nyamagabe", "Nyaruguru",
  ]
  const upper = value.toUpperCase()
  for (const district of knownDistricts) {
    if (upper.includes(district.toUpperCase())) return district
  }

  const kinyarwanda = value.match(/akarere\s+ka\s+([a-z\-]+)/i)
  if (kinyarwanda?.[1]) {
    const token = kinyarwanda[1].trim().toLowerCase()
    const match = knownDistricts.find((district) => district.toLowerCase() === token)
    if (match) return match
  }

  return value
}

function buildInitialAssistantMessage(analysisData: AnalysisData): string {
  const confidenceText = analysisData.confidence
    ? `${(analysisData.confidence * 100).toFixed(0)}%`
    : "unknown"
  const diseaseKey = analysisData.detectedDisease || ""
  const diseaseLabel = formatDiseaseLabel(analysisData.detectedDisease)
  const advice = getDiseaseAdvice(diseaseKey)
  const normalizedDistrict =
    normalizeDistrictLabel(analysisData.uploadDistrict) ||
    normalizeDistrictLabel(analysisData.nearestClinic?.address)
  const districtText = normalizedDistrict
    ? `from **${normalizedDistrict} district**`
    : "from your area"

  const firstTreatment = advice.treatment[0]
  const firstPrevention = advice.prevention[0]

  const locationDisplay = normalizedDistrict || "your area"
  const vetRecommendation = analysisData.nearestClinic
    ? [
        `**Nearest veterinary clinic according to your location (${locationDisplay}):**`,
        `- **${analysisData.nearestClinic.name}**`,
        `- Address: ${analysisData.nearestClinic.address}`,
        ...(analysisData.nearestClinic.phone ? [`- Phone: ${analysisData.nearestClinic.phone}`] : []),
        `- Distance: ${analysisData.nearestClinic.distanceKm} km away`,
      ].join("\n")
    : [
        `**Nearest veterinary clinic according to your location (${locationDisplay}):**`,
        `- **AVEP Co Ltd**`,
        `- Address: KN 5 Rd, Kigali`,
        `- Phone: 0788 508 343`,
      ].join("\n")

  return [
    `I reviewed your latest analysis ${districtText}.`,
    `The top detected concern is **${diseaseLabel}** at **${confidenceText}** confidence.`,
    ``,
    `**What to do next right now:**`,
    `- ${advice.recommendedAction}`,
    ...(firstTreatment ? [`- ${firstTreatment}`] : []),
    ...(firstPrevention ? [`- ${firstPrevention}`] : []),
    ``,
    vetRecommendation,
    ``,
    `You can now ask follow-up questions and I will guide you step by step.`,
  ].join("\n")
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [input, setInput] = useState("")
  const [responseMode, setResponseMode] = useState<ResponseMode>("concise")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load analysis on mount and initialize messages
  useEffect(() => {
    const savedAnalysis = localStorage.getItem("latestAnalysis")
    
    if (savedAnalysis) {
      try {
        const analysisData = JSON.parse(savedAnalysis) as AnalysisData
        setAnalysis(analysisData)

        const initialMsg: Message = {
          id: "1",
          role: "assistant",
          content: buildInitialAssistantMessage(analysisData),
        }
        setMessages([initialMsg])
      } catch {
        const fallbackMsg: Message = {
          id: "1",
          role: "assistant",
          content: "Hello! I'm your Herd AI assistant. Please analyze an image first, and I'll provide expert guidance based on the results. How can I help you?",
        }
        setMessages([fallbackMsg])
      }
    } else {
      const fallbackMsg: Message = {
        id: "1",
        role: "assistant",
        content: "Hello! I'm your Herd AI assistant. Please analyze an image first, and I'll provide expert guidance based on the results. How can I help you?",
      }
      setMessages([fallbackMsg])
    }
    
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isTyping) return

    const trimmedInput = input.trim()
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedInput,
    }
    const historyForApi = [...messages, userMsg].slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("authToken") : null

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          message: trimmedInput,
          disease: toSupportedDisease(analysis?.detectedDisease),
          history: historyForApi,
          responseMode,
        }),
      })

      const parsed = await parseApiResponse<{ response?: string; error?: string }>(
        response,
        "Failed to get AI response"
      )

      if (!response.ok) {
        throw new Error(parsed.errorMessage || "Failed to get AI response")
      }

      const payload = parsed.data

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: payload && payload.response ? payload.response : "I couldn't generate a response. Please try again.",
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "I couldn't reach the AI service right now. Please try again in a moment."

      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorMessage,
      }
      setMessages((prev) => [...prev, fallbackMsg])
    } finally {
      setIsTyping(false)
    }
  }, [input, isTyping, analysis?.detectedDisease, messages, responseMode])

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col lg:h-[calc(100vh-4rem)]">
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">AI Assistant</h1>
          <div className="inline-flex items-center rounded-lg border border-border bg-secondary/40 p-1">
            <div
              onClick={() => setResponseMode("concise")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                responseMode === "concise"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Concise
            </div>
            <div
              onClick={() => setResponseMode("detailed")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                responseMode === "detailed"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Detailed
            </div>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Get expert-level guidance based on your analysis results.
        </p>
      </div>

      <div className="flex-1 rounded-2xl border border-border bg-card flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <Bot className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">Herd AI Assistant</span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
            </span>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 sm:px-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground border border-border"
                }`}
              >
                {msg.role === "assistant" ? renderAssistantMarkdown(msg.content) : msg.content}
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0 h-7 w-7 rounded-md bg-secondary flex items-center justify-center mt-0.5 border border-border">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2.5 justify-start">
              <div className="flex-shrink-0 h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center mt-0.5">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground border border-border">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce animation-delay-200" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce animation-delay-400" />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 rounded-xl bg-secondary border border-border p-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Ask about your results..."
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground text-foreground"
            />
            <div
              onClick={() => {
                if (input.trim() && !isTyping) {
                  sendMessage()
                }
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 ${
                !input.trim() || isTyping ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              role="button"
              aria-label="Send message"
            >
              <Send className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground/60">
            AI responses are advisory only. Always consult a licensed veterinarian for medical decisions.
          </p>
        </div>
      </div>
    </div>
  )
}
