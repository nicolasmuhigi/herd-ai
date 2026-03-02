"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Thin top bar */}
      <div className="border-b border-border/60 bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-2">
          <p className="text-xs text-muted-foreground">
            New: LivestockAI Enterprise is now available.{" "}
            <Link href="#" className="text-primary underline underline-offset-2">Learn more</Link>
          </p>
        </div>
      </div>

      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-sm bg-primary" />
            <span className="text-[15px] font-medium text-foreground tracking-[-0.01em]">LivestockAI</span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {["Platform", "Solutions", "Developers", "Company"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
              Log in
            </Link>
            <Link href="/signup" className="rounded-md bg-primary px-3.5 py-1.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Get started
            </Link>
            <Link href="#" className="rounded-md border border-border px-3.5 py-1.5 text-[13px] text-foreground transition-colors hover:bg-card">
              Contact sales
            </Link>
          </div>

          <button
            className="lg:hidden p-1.5 text-muted-foreground"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-border bg-background px-6 py-5 lg:hidden">
            <div className="flex flex-col gap-4">
              {["Platform", "Solutions", "Developers", "Company"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted-foreground"
                >
                  {item}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
                <Link href="/login" className="text-sm text-foreground">Log in</Link>
                <Link href="/signup" className="rounded-md bg-primary py-2 text-center text-sm font-medium text-primary-foreground">
                  Get started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
