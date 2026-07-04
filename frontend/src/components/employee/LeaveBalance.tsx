import { Card, CardHeader } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { leaveBalances } from "@/data/hrms"

export function LeaveBalance() {
  return (
    <Card hover className="h-full">
      <CardHeader
        title="Leave Balance"
        subtitle="2026 allowance"
        action={<Button variant="soft" size="sm">Request</Button>}
      />
      <div className="space-y-5 p-5 pt-1">
        {leaveBalances.map((leave) => {
          const remaining = leave.total - leave.used
          const pct = (leave.used / leave.total) * 100
          return (
            <div key={leave.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{leave.label}</span>
                <span className="text-muted-foreground">
                  {remaining} of {leave.total} left
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: leave.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
