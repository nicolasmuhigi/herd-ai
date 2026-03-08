"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    district: "",
    password: "",
    role: "USER" as "USER" | "VET",
  })

  const isLogin = mode === "login"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup"
      
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            email: formData.email,
            name: formData.name,
            district: formData.role === "VET" ? formData.district : undefined,
            password: formData.password,
            role: formData.role,
          }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `${isLogin ? "Login" : "Sign up"} failed`
        )
      }

      const data = await response.json()

      // Store token and user info
      localStorage.setItem("authToken", data.token)
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          district: data.user.district,
        })
      )

      toast.success(data.message || `${isLogin ? "Login" : "Account created"} successful!`)

      // Redirect based on user role
      const dashboardPath = data.user.role === "VET" ? "/vet-dashboard" : "/dashboard"
      setTimeout(() => {
        router.push(dashboardPath)
      }, 500)
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="mb-10 flex items-center justify-center gap-2.5">
          <Image
            src="/Herd-AI Logo.png"
            alt="Herd AI Logo"
            width={100}
            height={100}
          />
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isLogin
                ? "Log in to access your dashboard and manage livestock health."
                : "Start detecting livestock diseases with AI today."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div>
                <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-foreground">
                  Account Type
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/30"
                >
                  <option value="USER">Farmer / Cattle Owner</option>
                  <option value="VET">Veterinarian</option>
                </select>
              </div>
            )}

            {!isLogin && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </div>
            )}

            {!isLogin && formData.role === "VET" && (
              <div>
                <label htmlFor="district" className="mb-1.5 block text-sm font-medium text-foreground">
                  District
                </label>
                <input
                  id="district"
                  type="text"
                  placeholder="your district"
                  value={formData.district}
                  onChange={handleInputChange}
                  required={formData.role === "VET"}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  role="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-end">
                <Link href="#" className="text-xs font-medium text-primary hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`group mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {loading ? (
                <>
                  <div className="inline-block animate-spin">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  </div>
                  {isLogin ? "Logging in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {isLogin ? "Log In" : "Create Account"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Switch mode */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <Link
            href={isLogin ? "/signup" : "/login"}
            className="font-semibold text-primary hover:underline transition-colors"
          >
            {isLogin ? "Sign up" : "Log in"}
          </Link>
        </p>
      </div>
    </div>
  )
}
