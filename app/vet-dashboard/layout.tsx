"use client"

import { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, CheckCircle2, Clock, History, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VetDashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    router.push("/login")
  }

  const isAppointmentsActive = pathname === "/vet-dashboard/appointments"
  const isHistoryActive = pathname.includes("/vet-dashboard/history")
  const isAnalysesActive = pathname.includes("/vet-dashboard/analyses-history")
  const isDashboardActive = pathname === "/vet-dashboard"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/Herd-AI Logo.png"
              alt="Herd AI Logo"
              width={100}
              height={100}
            />
          </Link>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-4">
              <Link
                href="/vet-dashboard"
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  isDashboardActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/vet-dashboard/appointments"
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  isAppointmentsActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock className="h-4 w-4" />
                Pending Appointments
              </Link>
              <Link
                href="/vet-dashboard/history"
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  isHistoryActive && !isAnalysesActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <History className="h-4 w-4" />
                Appointment History
              </Link>
              <Link
                href="/vet-dashboard/analyses-history"
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  isAnalysesActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <History className="h-4 w-4" />
                Analyses History
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 mt-4">
        {children}
      </main>
    </div>
  )
}
