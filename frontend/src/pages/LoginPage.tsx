import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<"admin" | "employee">("admin")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    navigate(role === "admin" ? "/admin" : "/employee")
  }

  return (
    <AuthLayout heading="Welcome back" subheading="Sign in to your Nimbus HR workspace to continue.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
          {(["admin", "employee"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={
                "rounded-lg py-2 text-sm font-medium capitalize transition-all " +
                (role === r
                  ? "bg-card text-foreground shadow-[var(--shadow-soft)]"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {r}
            </button>
          ))}
        </div>

        <Input
          id="loginId"
          label="Login ID"
          type="text"
          placeholder="you@nimbus.co"
          icon={<User className="h-4 w-4" />}
          defaultValue="demo@nimbus.co"
          required
        />

        <Input
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          icon={<Lock className="h-4 w-4" />}
          defaultValue="password"
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 rounded border-input accent-[var(--color-primary)]" />
            Remember me
          </label>
          <button type="button" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </button>
        </div>

        <Button type="submit" size="lg" className="w-full">
          Sign In
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 rounded-xl bg-[var(--color-primary-soft)] p-3 text-xs text-primary">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Demo mode — pick a role above and sign in with any credentials.
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="font-semibold text-primary hover:underline">
          Create one
        </Link>
      </p>

      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <button onClick={() => setShowPassword((v) => !v)} className="inline-flex items-center gap-1 hover:text-foreground">
          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showPassword ? "Hide" : "Show"} password
        </button>
      </div>
    </AuthLayout>
  )
}
