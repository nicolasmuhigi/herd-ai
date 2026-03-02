export function LogoMarquee() {
  const logos = [
    "AgriTech Co",
    "FarmWise",
    "HerdVault",
    "VetCloud",
    "CattleIQ",
    "PastureAI",
    "RanchOS",
    "LiveBase",
    "BovineNet",
    "DairyFlow",
    "FieldSync",
    "GrazeSmart",
  ]

  return (
    <section className="border-y border-border py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase">
            Powering modern livestock solutions
          </p>
          <p className="mt-2 text-base text-muted-foreground">
            From visionary agri-startups to industry leaders.
          </p>
        </div>

        {/* Marquee */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div className="flex animate-marquee whitespace-nowrap">
            {[...logos, ...logos].map((logo, i) => (
              <div
                key={`${logo}-${i}`}
                className="mx-8 flex items-center justify-center"
              >
                <div className="flex h-10 items-center gap-2 text-muted-foreground/40 font-bold text-lg tracking-tight select-none">
                  <div className="h-6 w-6 rounded bg-muted-foreground/10" />
                  {logo}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
