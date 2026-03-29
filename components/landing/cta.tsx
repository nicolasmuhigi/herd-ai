import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section id="pricing" className="py-24 lg:py-32 relative scroll-mt-28">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="mx-auto max-w-6xl px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-3xl">Every hour without AI detection is money lost. Disease doesn't wait. Neither should you.</p>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          {/* Left side - Creative copy */}
          <div>
            <h3 className="text-5xl md:text-6xl font-black text-foreground mb-6 leading-[1.1]">
              Every hour without AI detection is <span className="text-emerald-500">money lost</span>
            </h3>

            <div className="space-y-4 mb-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Disease doesn't wait. Neither should you. Our AI detects health issues <span className="text-muted-foreground">2-3 days before symptoms appear</span>, giving you time to act.
              </p>
            </div>
          </div>

          {/* Right side - Interactive CTA box */}
          <div className="relative">
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent rounded-2xl blur-xl opacity-50"></div>
            
            <div className="relative rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-8 lg:p-10 overflow-hidden animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-transparent"></div>
              </div>

              <div className="relative z-10">
                {/* Counter/testimonial */}
                <div className="mb-8">
                  <p className="text-5xl font-black bg-gradient-to-r from-emerald-400 to-primary bg-clip-text text-transparent mb-2">97%</p>
                  <p className="text-sm text-muted-foreground">of preventable diseases caught early</p>
                </div>

                {/* Buttons */}
                <div className="space-y-3 mb-8">
                  <Link
                    href="/signup"
                    className="group relative inline-flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-500 px-6 py-4 text-sm font-bold text-white transition-all duration-300 overflow-hidden hover:bg-emerald-600"
                  >
                    <span className="relative flex items-center gap-2">
                      Start Your Free Trial
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                  
                  <div className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-primary/40 text-foreground font-semibold transition-all duration-300 hover:border-primary/70 hover:bg-primary/5 hover:shadow-lg cursor-pointer">
                    Book 15-Min Strategy Call
                  </div>
                </div>

                {/* Quick setup */}
                <div className="rounded-lg bg-card/50 border border-border/30 p-4 mb-8">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3">Get running now:</p>
                  <div className="flex items-center gap-2 bg-background/50 rounded-lg p-3 font-mono text-sm mb-3">
                    <span className="text-primary flex-shrink-0">$</span>
                    <span className="text-muted-foreground flex-1 truncate">npm create herd-ai@latest</span>
                    <div className="text-xs px-2 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-bold flex-shrink-0 cursor-pointer">Copy</div>
                  </div>
                  <p className="text-xs text-muted-foreground">Takes just 30 seconds to get started </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
