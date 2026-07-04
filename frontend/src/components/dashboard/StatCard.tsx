import { Users, CheckCircle2, Calendar, Briefcase, TrendingUp, TrendingDown } from "lucide-react"
import { Card } from "@/components/ui/Card"

const icons = {
  users: Users,
  check: CheckCircle2,
  calendar: Calendar,
  briefcase: Briefcase,
}

export function StatCard({
  label,
  value,
  change,
  trend,
  icon,
}: {
  label: string
  value: string
  change: string
  trend: "up" | "down"
  icon: keyof typeof icons
}) {
  const Icon = icons[icon]
  const positive = trend === "up"

  return (
    <Card hover className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium " +
            (positive
              ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
              : "bg-[var(--color-danger-soft)] text-[var(--color-danger)]")
          }
        >
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {change}
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </Card>
  )
}
