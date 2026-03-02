import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { LogoMarquee } from "@/components/landing/logo-marquee"
import { Features } from "@/components/landing/features"
import { ProductShowcase } from "@/components/landing/product-showcase"
import { Testimonials } from "@/components/landing/testimonials"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <LogoMarquee />
      <Features />
      <ProductShowcase />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
