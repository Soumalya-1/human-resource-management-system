import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Avatar } from "@/components/ui/Avatar"
import { getLeaves, approveLeave } from "@/lib/api"

interface LeaveRequest {
  id: number
  user_id: number
  name?: string
  leave_type: string
  start_date: string
  end_date: string
  status: string
}

export function LeaveRequestsCard() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getLeaves().then((data: LeaveRequest[]) => {
      if (!cancelled) {
        setRequests(data.filter((l) => l.status === "Pending").slice(0, 5))
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  async function handleUpdate(id: number, status: "Approved" | "Rejected") {
    setError(null)
    try {
      await approveLeave(id, status)
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed")
    }
  }

  if (loading) return (
    <Card hover className="h-full">
      <CardHeader title="Leave Requests" subtitle="Awaiting your review" />
      <div className="p-5 text-center text-sm text-muted-foreground">Loading...</div>
    </Card>
  )

  return (
    <Card hover className="h-full">
      <CardHeader
        title="Leave Requests"
        subtitle={requests.length > 0 ? `${requests.length} pending` : "Awaiting your review"}
      />
      <div className="divide-y divide-border px-2 pb-2">
        {error && <p className="px-3 py-2 text-xs text-[var(--color-danger)]">{error}</p>}
        {requests.length === 0 && (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No pending leave requests
          </div>
        )}
        {requests.map((req) => (
          <div key={req.id} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted">
            <Avatar name={`User ${req.user_id}`} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">User #{req.user_id}</p>
              <p className="text-xs text-muted-foreground">
                {req.leave_type} · {req.start_date}–{req.end_date}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleUpdate(req.id, "Approved")}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-success-soft)] text-[var(--color-success)] transition-transform hover:scale-105"
                aria-label="Approve"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleUpdate(req.id, "Rejected")}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-danger-soft)] text-[var(--color-danger)] transition-transform hover:scale-105"
                aria-label="Reject"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
