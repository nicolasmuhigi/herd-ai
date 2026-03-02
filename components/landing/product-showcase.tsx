"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Upload, BarChart3, MessageSquare, CalendarCheck, Check, AlertTriangle, ImageIcon, Send } from "lucide-react"

interface ShowcaseItem {
  badge: string
  title: string
  description: string
  mock: ReactNode
}

function UploadMock() {
  return (
    <div className="rounded-3xl bg-card border border-border/50 p-6 shadow-xl shadow-primary/5">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Upload className="h-4 w-4 text-primary" />
        </div>
        <span className="font-semibold text-foreground text-sm">Upload Image</span>
      </div>
      <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center bg-background">
        <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-sm font-semibold text-foreground">Drop your image here</p>
        <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
        <div className="mt-4 inline-flex rounded-xl bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
          Select File
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        {["cattle_img_01.jpg", "cattle_img_02.jpg"].map((f) => (
          <div key={f} className="flex-1 rounded-xl bg-background border border-border/50 p-3 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-secondary/30 flex items-center justify-center">
              <ImageIcon className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-foreground truncate">{f}</div>
              <div className="text-[10px] text-muted-foreground">2.4 MB</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ResultsMock() {
  return (
    <div className="rounded-3xl bg-card border border-border/50 p-6 shadow-xl shadow-primary/5">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <BarChart3 className="h-4 w-4 text-primary" />
        </div>
        <span className="font-semibold text-foreground text-sm">Analysis Results</span>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl bg-background p-4 border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-foreground">Foot-and-Mouth Disease</span>
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">High Risk</span>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-[#09637E] to-[#088395] transition-all duration-1000" />
            </div>
            <span className="text-sm font-bold text-foreground">94%</span>
          </div>
          <p className="text-xs text-muted-foreground">Vesicles detected on tongue and oral cavity. Immediate veterinary consultation recommended.</p>
        </div>
        <div className="rounded-2xl bg-background p-4 border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-foreground">Lumpy Skin Disease</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-[#7AB2B2] to-[#088395]" />
            </div>
            <span className="text-sm font-bold text-foreground">42%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatMock() {
  return (
    <div className="rounded-3xl bg-card border border-border/50 p-6 shadow-xl shadow-primary/5">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-primary" />
        </div>
        <span className="font-semibold text-foreground text-sm">AI Assistant</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
        </span>
      </div>
      <div className="space-y-3 mb-4">
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-tr-md bg-primary px-4 py-2.5 text-sm text-primary-foreground max-w-[80%]">
            What treatment do you recommend for Foot-and-Mouth?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-tl-md bg-secondary/30 px-4 py-2.5 text-sm text-foreground max-w-[80%]">
            Based on the analysis, I recommend isolating affected animals immediately. Apply antiseptic solutions to lesions and ensure soft, nutritious feed...
          </div>
        </div>
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-tr-md bg-primary px-4 py-2.5 text-sm text-primary-foreground max-w-[80%]">
            Should I schedule a vet visit?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-tl-md bg-secondary/30 px-4 py-2.5 text-sm text-foreground max-w-[80%] flex items-center gap-2">
            <Check className="h-4 w-4 text-primary flex-shrink-0" />
            Absolutely. I can connect you with Dr. Sarah — available today at 2:00 PM.
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-background border border-border/50 p-2">
        <input type="text" placeholder="Ask a follow-up..." className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground text-foreground" readOnly />
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Send className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

function BookingMock() {
  return (
    <div className="rounded-3xl bg-card border border-border/50 p-6 shadow-xl shadow-primary/5">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <CalendarCheck className="h-4 w-4 text-primary" />
        </div>
        <span className="font-semibold text-foreground text-sm">Book a Vet</span>
      </div>
      <div className="space-y-3">
        <div className="rounded-2xl bg-background p-4 border border-border/50 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-secondary/30 flex items-center justify-center text-lg font-bold text-primary">S</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-foreground">Dr. Sarah Mitchell</div>
            <div className="text-xs text-muted-foreground">Large Animal Specialist</div>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Available
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["Mon 10am", "Tue 2pm", "Wed 9am"].map((slot, i) => (
            <div key={slot} className={`rounded-xl p-3 text-center text-xs font-semibold transition-all cursor-pointer ${i === 1 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-background text-foreground border border-border/50 hover:border-primary/30"}`}>
              {slot}
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10">
          <div className="flex items-center gap-2 text-xs text-primary font-medium">
            <AlertTriangle className="h-3.5 w-3.5" />
            Appointment includes: On-site visit, full diagnostics, treatment plan
          </div>
        </div>
      </div>
    </div>
  )
}

const showcaseItems: ShowcaseItem[] = [
  {
    badge: "Step 1",
    title: "Upload and Analyze",
    description: "Simply upload a photo of your livestock. Our AI model processes the image in seconds, detecting visual markers across dozens of known diseases.",
    mock: <UploadMock />,
  },
  {
    badge: "Step 2",
    title: "Understand Your Results",
    description: "Receive detailed analysis with confidence percentages, risk levels, and preliminary advisory. Know exactly what's happening with your herd.",
    mock: <ResultsMock />,
  },
  {
    badge: "Step 3",
    title: "Chat with AI Assistant",
    description: "Ask follow-up questions, get treatment recommendations, and receive expert-level care guidance through our conversational AI interface.",
    mock: <ChatMock />,
  },
  {
    badge: "Step 4",
    title: "Book a Veterinary Expert",
    description: "When professional intervention is needed, seamlessly connect with certified veterinary specialists directly from the platform.",
    mock: <BookingMock />,
  },
]

export function ProductShowcase() {
  return (
    <section id="product" className="py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
            How It Works
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            A Modern Stack for Modern Farming
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            From image upload to veterinary consultation, experience a seamless health management workflow.
          </p>
        </div>

        <div className="flex flex-col gap-20 lg:gap-28">
          {showcaseItems.map((item, i) => (
            <ShowcaseRow key={item.title} item={item} index={i} reversed={i % 2 !== 0} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ShowcaseRow({ item, index, reversed }: { item: ShowcaseItem; index: number; reversed: boolean }) {
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

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center gap-12 lg:gap-16 ${
        reversed ? "lg:flex-row-reverse" : "lg:flex-row"
      } ${visible ? "animate-fade-in-up" : "opacity-0"}`}
    >
      {/* Text */}
      <div className="flex-1 max-w-lg">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
          {item.badge}
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          {item.title}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground lg:text-lg">
          {item.description}
        </p>
      </div>

      {/* Mock */}
      <div className="flex-1 w-full max-w-lg">
        {item.mock}
      </div>
    </div>
  )
}
