import { useState } from "react"
import { Card, CardHeader } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { applyLeave } from "@/lib/api"

export function LeaveRequestForm() {
  const [type, setType] = useState("Paid")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [remarks, setRemarks] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!start || !end) return
    setLoading(true)
    setResult(null)
    try {
      await applyLeave({
        leave_type: type,
        start_date: start,
        end_date: end,
        remarks: remarks || undefined,
      })
      setResult("Leave request submitted.")
      setStart("")
      setEnd("")
      setRemarks("")
    } catch (err: unknown) {
      setResult(err instanceof Error ? err.message : "Failed to submit")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card hover>
      <CardHeader title="Request Time Off" subtitle="Submit a new leave request" />
      <form onSubmit={submit} className="space-y-3 p-5 pt-2">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs text-muted-foreground">Type</label>
            <select
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option>Paid</option>
              <option>Sick</option>
              <option>Unpaid</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Start</label>
            <input
              type="date"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">End</label>
            <input
              type="date"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Remarks (optional)</label>
          <input
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            placeholder="Short note..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <Button type="submit" size="md" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </Button>

        {result && <p className="text-xs text-muted-foreground">{result}</p>}
      </form>
    </Card>
  )
}
