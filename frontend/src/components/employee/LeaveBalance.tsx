import { Card, CardHeader } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

interface LeaveBalanceItem {
  label: string
  total: number
  used: number
  color: string
}

export function LeaveBalance({ leaves, onRequest }: { leaves?: LeaveBalanceItem[]; onRequest?: () => void }) {
  const items = leaves && leaves.length > 0 ? leaves : null

  return (
    <Card hover className="h-full">
      <CardHeader
        title="Leave Balance"
        subtitle="Current allowance"
        action={
          <Button variant="soft" size="sm" onClick={onRequest}>
            Request
          </Button>
        }
      />
      <div className="space-y-5 p-5 pt-1">
        {items ? items.map((leave) => {
          const remaining = leave.total - leave.used
          const pct = leave.total > 0 ? (leave.used / leave.total) * 100 : 0
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
        }) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Leave balances will appear here
          </div>
        )}
      </div>
    </Card>
  )
}
