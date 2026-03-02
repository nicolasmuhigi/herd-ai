import { AuthForm } from "@/components/auth/auth-form"

export const metadata = {
  title: "Sign Up - LivestockAI",
  description: "Create your free LivestockAI account and start detecting livestock diseases with AI.",
}

export default function SignupPage() {
  return <AuthForm mode="signup" />
}
