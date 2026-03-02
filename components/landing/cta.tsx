import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-24 lg:py-32 bg-card">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#09637E] via-[#088395] to-[#09637E] px-8 py-16 text-center sm:px-16 lg:px-24 lg:py-24">
          {/* Blobs */}
          <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#7AB2B2]/10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl text-balance">
              Start Detecting Smarter Today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
              Join thousands of farmers using AI to protect their livestock. Free to start, no credit card required.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-[#09637E] shadow-xl shadow-black/10 transition-all hover:shadow-2xl hover:-translate-y-0.5 sm:w-auto"
              >
                Create Free Account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-white/25 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/40 sm:w-auto"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
