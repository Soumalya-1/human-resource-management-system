import { useState, useEffect } from "react"
import { Check, X, Loader2 } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { getLeaves, approveLeave } from "@/lib/api"

interface LeaveRequest {
  id: number
  user_id: number
  leave_type: string
  start_date: string
  end_date: string
  status: string
  name?: string
}

export function ApproveLeaveModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getLeaves().then((data: LeaveRequest[]) => {
      if (!cancelled) {
        setRequests(data.filter((l) => l.status === "Pending"))
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) { setError("Failed to load leaves"); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [open])

  async function handleAction(id: number, status: "Approved" | "Rejected") {
    setError(null)
    try {
      await approveLeave(id, status)
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed")
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Approve Leaves">
      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      )}
      {error && <p className="mb-3 text-xs text-[var(--color-danger)]">{error}</p>}
      {!loading && requests.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No pending leave requests
        </div>
      )}
      {!loading && requests.map((req) => (
        <div key={req.id} className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-muted">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">User #{req.user_id}</p>
            <p className="text-xs text-muted-foreground">
              {req.leave_type} &middot; {req.start_date}&ndash;{req.end_date}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleAction(req.id, "Approved")}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-success-soft)] text-[var(--color-success)] transition-transform hover:scale-105"
              aria-label="Approve"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleAction(req.id, "Rejected")}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-danger-soft)] text-[var(--color-danger)] transition-transform hover:scale-105"
              aria-label="Reject"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </Modal>
  )
}