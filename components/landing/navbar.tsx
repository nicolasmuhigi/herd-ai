"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ArrowRight } from "lucide-react"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top announcement banner */}
      <div className="bg-primary/10 border-b border-primary/20">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-2.5">
          <Link href="#" className="group flex items-center gap-2 text-sm text-primary font-medium">
            LivestockAI Enterprise Playbook: The Complete Guide to Herd Health Management
            <span className="text-xs opacity-70 group-hover:opacity-100 transition-opacity">Download Now</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Main nav */}
      <nav className="bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">LivestockAI</span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Platform
            </Link>
            <Link href="#product" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Solutions
            </Link>
            <Link href="#developers" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Developers
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Company
            </Link>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="group flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#"
              className="group flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Contact Sales
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button
            className="lg:hidden rounded-lg p-2 text-foreground hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-background lg:hidden">
            <div className="flex flex-col px-6 py-4">
              <Link href="#features" onClick={() => setMobileOpen(false)} className="py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">Platform</Link>
              <Link href="#product" onClick={() => setMobileOpen(false)} className="py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">Solutions</Link>
              <Link href="#developers" onClick={() => setMobileOpen(false)} className="py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">Developers</Link>
              <Link href="#about" onClick={() => setMobileOpen(false)} className="py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">Company</Link>
              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                <Link href="/login" className="py-2.5 text-center text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors">Log In</Link>
                <Link href="/signup" className="py-2.5 text-center text-sm font-semibold bg-primary text-primary-foreground rounded-lg">Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
