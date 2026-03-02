import Link from "next/link"
import { ArrowRight, Rocket, RefreshCw } from "lucide-react"

export function CTA() {
  return (
    <section className="py-24 lg:py-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Launch card */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-8 transition-all hover:border-primary/30 lg:p-10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Rocket className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-foreground lg:text-3xl">Launch</h3>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground max-w-sm">
              Fast access to everything you need and experts to help you launch your first AI-powered health monitoring product.
            </p>
            <Link
              href="/signup"
              className="group/btn mt-8 inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Launch Your Program
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </div>

          {/* Migrate card */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-sky-500/10 to-sky-500/5 p-8 transition-all hover:border-sky-400/30 lg:p-10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-foreground lg:text-3xl">Migrate</h3>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground max-w-sm">
              Detailed documentation and experts to help you easily migrate your existing health monitoring to a modern platform.
            </p>
            <Link
              href="#"
              className="group/btn mt-8 inline-flex items-center gap-1.5 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary"
            >
              Migrate Your Program
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
