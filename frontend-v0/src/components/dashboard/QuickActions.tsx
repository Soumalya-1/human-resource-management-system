import { UserPlus, CheckCircle2, Wallet, Megaphone } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/Card"
import { quickActions } from "@/data/hrms"

const icons = {
  "user-plus": UserPlus,
  "check-circle": CheckCircle2,
  wallet: Wallet,
  megaphone: Megaphone,
}

const tones = {
  primary: "bg-[var(--color-primary-soft)] text-primary",
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  accent: "bg-sky-100 text-[var(--color-accent)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
}

export function QuickActions() {
  return (
    <Card hover className="h-full">
      <CardHeader title="Quick Actions" subtitle="Common HR tasks" />
      <div className="grid grid-cols-2 gap-3 p-5 pt-0">
        {quickActions.map((action) => {
          const Icon = icons[action.icon as keyof typeof icons]
          return (
            <button
              key={action.label}
              className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-hover)]"
            >
              <span className={"flex h-10 w-10 items-center justify-center rounded-xl " + tones[action.tone]}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
