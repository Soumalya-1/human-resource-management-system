import type { ReactNode } from "react"
import { CheckCircle2 } from "lucide-react"
import { Logo } from "@/components/ui/Logo"

export function AuthLayout({
  children,
  heading,
  subheading,
}: {
  children: ReactNode
  heading: string
  subheading: string
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.25) 0, transparent 45%)",
          }}
          aria-hidden="true"
        />
        <div className="relative">
          <Logo className="[&_span]:text-primary-foreground [&_div]:bg-primary-foreground [&_div]:text-primary" />
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight text-balance">
            Manage your entire workforce in one calm, modern place.
          </h2>
          <p className="mt-4 text-primary-foreground/80 leading-relaxed">
            Attendance, leave, payroll and people analytics — beautifully organized so your HR team
            can focus on what matters.
          </p>
          <ul className="mt-8 space-y-3">
            {["Real-time attendance tracking", "One-click leave approvals", "Insightful people analytics"].map(
              (item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <p className="relative text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} Nimbus HR. Crafted for modern teams.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center px-5 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">{heading}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subheading}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
