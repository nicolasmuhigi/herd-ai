"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Bot, User } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hello! I'm your LivestockAI assistant. I've reviewed your latest analysis results. The primary concern is a 94% confidence detection of Foot-and-Mouth Disease. How can I help you today?",
  },
]

const aiResponses = [
  "Based on the analysis, I recommend immediately isolating affected animals from the rest of the herd. Foot-and-Mouth Disease is highly contagious and spreads through direct contact, aerosol droplets, and contaminated materials.",
  "For treatment, apply antiseptic solutions to the vesicular lesions on the oral cavity and hooves. Ensure affected animals have access to soft, nutritious feed since oral lesions can make eating painful. Keep them hydrated.",
  "I strongly recommend scheduling a veterinary visit as soon as possible. FMD is a reportable disease in most jurisdictions. Dr. Sarah Mitchell, a large animal specialist, has availability this week. Would you like me to help you book an appointment?",
  "In terms of prevention for the rest of your herd, implement strict biosecurity measures: disinfect equipment, restrict animal movement, and monitor all animals for early signs like fever, drooling, or lameness.",
  "The recovery period for FMD typically takes 2-3 weeks with proper care. During this time, maintain isolation protocols and continue monitoring. I'm here to assist with any additional questions.",
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const responseIndex = useRef(0)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const sendMessage = useCallback(() => {
    if (!input.trim() || isTyping) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponses[responseIndex.current % aiResponses.length],
      }
      responseIndex.current++
      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, 1200)
  }, [input, isTyping])

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col lg:h-[calc(100vh-4rem)]">
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">AI Assistant</h1>
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
            <span className="text-sm font-semibold text-foreground">LivestockAI Assistant</span>
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
                {msg.content}
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
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground/60">
            AI responses are advisory only. Always consult a licensed veterinarian for medical decisions.
          </p>
        </div>
      </div>
    </div>
  )
}
