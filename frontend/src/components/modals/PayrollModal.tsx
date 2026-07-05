import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { getPayrolls, updatePayroll } from "@/lib/api"

interface PayrollRecord {
  id: number
  user_id: number
  employee_id?: string
  name?: string | null
  basic_salary: number
  allowances: number
  deductions: number
  net_salary: number
}

export function PayrollModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [records, setRecords] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getPayrolls().then((data: PayrollRecord[]) => {
      if (!cancelled) { setRecords(data); setLoading(false) }
    }).catch(() => {
      if (!cancelled) { setError("Failed to load payroll data"); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [open])

  function updateField(userId: number, field: "basic_salary" | "allowances" | "deductions", value: number) {
    setRecords((prev) =>
      prev.map((r) => (r.user_id === userId ? { ...r, [field]: value } : r))
    )
  }

  async function handleSave(userId: number) {
    const record = records.find((r) => r.user_id === userId)
    if (!record) return
    setSaving(userId)
    setError(null)
    try {
      await updatePayroll(userId, {
        basic_salary: record.basic_salary,
        allowances: record.allowances,
        deductions: record.deductions,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Payroll">
      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      )}
      {error && <p className="mb-3 text-xs text-[var(--color-danger)]">{error}</p>}
      {!loading && records.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No payroll records yet. Set salaries for employees above.
        </div>
      )}
      {!loading && records.map((rec) => (
        <div key={rec.user_id} className="rounded-xl border border-border p-4 mb-3">
          <p className="text-sm font-medium text-foreground mb-2">
            {rec.name || `User #${rec.user_id}`}
            {rec.employee_id && <span className="ml-2 text-xs text-muted-foreground">({rec.employee_id})</span>}
          </p>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs text-muted-foreground">Basic</label>
              <input
                type="number"
                value={rec.basic_salary}
                onChange={(e) => updateField(rec.user_id, "basic_salary", Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Allowances</label>
              <input
                type="number"
                value={rec.allowances}
                onChange={(e) => updateField(rec.user_id, "allowances", Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Deductions</label>
              <input
                type="number"
                value={rec.deductions}
                onChange={(e) => updateField(rec.user_id, "deductions", Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Net: <strong className="text-foreground">{(rec.basic_salary + rec.allowances - rec.deductions).toLocaleString()}</strong>
            </span>
            <Button size="sm" onClick={() => handleSave(rec.user_id)} disabled={saving === rec.user_id}>
              {saving === rec.user_id ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      ))}
    </Modal>
  )
}