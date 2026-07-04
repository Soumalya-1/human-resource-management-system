import { Check, X } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Avatar } from "@/components/ui/Avatar"
import { leaveRequests } from "@/data/hrms"

const statusTone = {
  Pending: "warning",
  Approved: "success",
  Rejected: "danger",
} as const

export function LeaveRequestsCard() {
  return (
    <Card hover className="h-full">
      <CardHeader
        title="Leave Requests"
        subtitle="Awaiting your review"
        action={
          <button className="text-sm font-medium text-primary hover:underline">View all</button>
        }
      />
      <div className="divide-y divide-border px-2 pb-2">
        {leaveRequests.map((req) => (
          <div key={req.id} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted">
            <Avatar src={req.avatar} name={req.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{req.name}</p>
              <p className="text-xs text-muted-foreground">
                {req.type} · {req.from}–{req.to} · {req.days}d
              </p>
            </div>
            {req.status === "Pending" ? (
              <div className="flex items-center gap-1.5">
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-success-soft)] text-[var(--color-success)] transition-transform hover:scale-105"
                  aria-label="Approve"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-danger-soft)] text-[var(--color-danger)] transition-transform hover:scale-105"
                  aria-label="Reject"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Badge tone={statusTone[req.status]}>{req.status}</Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
