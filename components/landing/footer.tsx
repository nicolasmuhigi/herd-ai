import Link from "next/link"

const links = {
  Platform: [
    { label: "Detection", href: "#features" },
    { label: "Analytics", href: "#features" },
    { label: "AI Assistant", href: "#features" },
    { label: "Booking", href: "#features" },
  ],
  Developers: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "SDKs", href: "#" },
    { label: "Status", href: "#" },
  ],
  Company: [
    { label: "About", href: "#about" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
    { label: "Compliance", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer id="about" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Brand */}
          <div className="max-w-xs">
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
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The new standard for livestock health intelligence.
            </p>
          </div>

          {/* Link Columns */}
          <div className="flex-1 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {Object.entries(links).map(([group, items]) => (
              <div key={group}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group}</h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {items.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            2026 LivestockAI, Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Twitter", "GitHub", "LinkedIn"].map((social) => (
              <Link key={social} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
