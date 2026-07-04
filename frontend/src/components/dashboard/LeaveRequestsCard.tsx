import { useState } from "react"
import { Check, X } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Avatar } from "@/components/ui/Avatar"

// Start with some mock data
const initialRequests = [
  { id: "lr1", name: "Aria Montgomery", type: "Sick Leave", from: "Jul 5", to: "Jul 6", days: 2, status: "Pending", avatar: "https://i.pravatar.cc/120?img=47" },
  { id: "lr2", name: "Marcus Chen", type: "Vacation", from: "Jul 10", to: "Jul 18", days: 8, status: "Pending", avatar: "https://i.pravatar.cc/120?img=12" },
  { id: "lr3", name: "Priya Nair", type: "Work From Home", from: "Jul 4", to: "Jul 4", days: 1, status: "Approved", avatar: "https://i.pravatar.cc/120?img=32" },
]

const statusTone: any = {
  Pending: "warning",
  Approved: "success",
  Rejected: "danger",
}

export function LeaveRequestsCard() {
  const [requests, setRequests] = useState(initialRequests)

  function updateStatus(id: string, newStatus: "Approved" | "Rejected") {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    )
  }

  return (
    <Card hover className="h-full">
      <CardHeader
        title="Leave Requests"
        subtitle="Awaiting your review (demo)"
      />
      <div className="divide-y divide-border px-2 pb-2">
        {requests.map((req) => (
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
                  onClick={() => updateStatus(req.id, "Approved")}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-success-soft)] text-[var(--color-success)] transition-transform hover:scale-105"
                  aria-label="Approve"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => updateStatus(req.id, "Rejected")}
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
