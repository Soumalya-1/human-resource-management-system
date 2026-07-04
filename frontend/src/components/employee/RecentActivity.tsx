import { Clock, FileText, UserCog, Wallet } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/Card"
import { employeeActivity } from "@/data/hrms"

const icons = {
  attendance: Clock,
  leave: FileText,
  profile: UserCog,
  payroll: Wallet,
}

export function RecentActivity() {
  return (
    <Card hover className="h-full">
      <CardHeader title="Recent Activity" subtitle="Your latest actions" />
      <div className="px-5 pb-5 pt-1">
        <ol className="relative space-y-5 border-l border-border pl-6">
          {employeeActivity.map((item) => {
            const Icon = icons[item.type]
            return (
              <li key={item.id} className="relative">
                <span className="absolute -left-[34px] flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-primary ring-4 ring-card">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </Card>
  )
}
