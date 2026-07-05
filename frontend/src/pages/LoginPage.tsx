import { useState, type FormEvent, type ChangeEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { User, Lock, Eye, EyeOff, ArrowRight, WifiOff } from "lucide-react"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { login } from "@/lib/api"

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<"admin" | "employee">("admin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsOffline(false)
    setLoading(true)
    try {
      const res = await login(email, password, role)
      const actualRole = (res.role || role) === "admin" ? "admin" : "employee"
      if (actualRole !== role) {
        setError(role === "admin"
          ? "This account does not have admin access. Select the employee tab."
          : "This account has admin access. Select the admin tab.")
        return
      }
      navigate(actualRole === "admin" ? "/admin" : "/employee")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed"
      if (err instanceof TypeError || msg.includes("Failed to fetch")) {
        setIsOffline(true)
        setError("Backend unreachable. Running in offline demo mode.")
        const { mockLogin, mockGetProfile } = await import("@/lib/api")
        await mockLogin(email, password, role)
        const profile = await mockGetProfile()
        const targetRole = profile?.role?.toLowerCase().includes("admin") ? "admin" : "employee"
        navigate(targetRole === "admin" ? "/admin" : "/employee")
      } else {
        setError("Incorrect email or password. Don't have an account? Sign up above.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout heading="Welcome back" subheading="Sign in to your HR workspace to continue.">
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
          label="Login ID / Email"
          type="text"
          placeholder="you@nimbus.co"
          icon={<User className="h-4 w-4" />}
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
        />

        <Input
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          icon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 rounded border-input accent-[var(--color-primary)]" />
            Remember me
          </label>
        </div>

        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
          <ArrowRight className="h-4 w-4" />
        </Button>

        {isOffline && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
            <WifiOff className="h-4 w-4 shrink-0" />
            Offline mode — data is not persisted.
          </div>
        )}
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
