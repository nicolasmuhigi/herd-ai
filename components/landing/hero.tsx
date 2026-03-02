import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-32">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#09637E] via-[#088395] to-[#09637E]" />

      {/* Animated blobs */}
      <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-[#7AB2B2]/20 blur-3xl animate-blob" />
      <div className="absolute top-40 right-10 h-96 w-96 rounded-full bg-[#088395]/20 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-[#EBF4F6]/10 blur-3xl animate-blob animation-delay-4000" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-20">
          {/* Left: Text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm mb-8 border border-white/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Now in Beta - Try Free
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl text-balance">
              AI-Powered Livestock Health Intelligence
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75 lg:text-xl">
              Detect diseases early with advanced AI image analysis. Get instant results, consult our AI assistant, and connect with veterinary experts.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/signup"
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-[#09637E] shadow-xl shadow-black/10 transition-all hover:shadow-2xl hover:-translate-y-0.5 sm:w-auto"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#product"
                className="group flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-white/25 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/40 sm:w-auto"
              >
                <Play className="h-4 w-4" />
                See How It Works
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex items-center gap-6 justify-center lg:justify-start">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-white">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm text-white/70">
                <span className="font-semibold text-white">2,400+</span> farmers already using LivestockAI
              </div>
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative animate-float">
              <div className="rounded-3xl bg-white/10 p-1.5 backdrop-blur-xl shadow-2xl shadow-black/20 border border-white/15">
                <div className="rounded-[22px] bg-card p-6 overflow-hidden">
                  {/* Mock Dashboard Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Dashboard</div>
                      <div className="text-lg font-bold text-foreground">Analysis Overview</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                    </div>
                  </div>

                  {/* Mock Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: "Scans Today", value: "142", color: "bg-[#09637E]/10 text-[#09637E]" },
                      { label: "Healthy", value: "89%", color: "bg-emerald-50 text-emerald-600" },
                      { label: "Alerts", value: "3", color: "bg-amber-50 text-amber-600" },
                    ].map((stat) => (
                      <div key={stat.label} className={`rounded-2xl p-3 ${stat.color}`}>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-xs font-medium opacity-70">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mock Chart Lines */}
                  <div className="rounded-2xl bg-background p-4">
                    <div className="text-xs font-medium text-muted-foreground mb-3">Detection Confidence</div>
                    <div className="flex flex-col gap-2">
                      {[
                        { name: "Foot & Mouth", pct: 94 },
                        { name: "Lumpy Skin", pct: 87 },
                        { name: "Mastitis", pct: 72 },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center gap-3">
                          <span className="text-xs font-medium text-foreground w-24 truncate">{item.name}</span>
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#09637E] to-[#088395]"
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-foreground w-8 text-right">{item.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
