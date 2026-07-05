import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { getPayrolls, updatePayroll, getUsers } from "@/lib/api"

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

interface UserRecord {
  id: number
  name?: string | null
  employee_id?: string
}

type PayrollMap = Record<number, PayrollRecord>

export function PayrollModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [payrollMap, setPayrollMap] = useState<PayrollMap>({})
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([getPayrolls(), getUsers()]).then(([payrolls, allUsers]) => {
      if (cancelled) return
      const map: PayrollMap = {}
      for (const p of payrolls as PayrollRecord[]) {
        map[p.user_id] = p
      }
      setPayrollMap(map)
      setUsers(allUsers as UserRecord[])
      setLoading(false)
    }).catch(() => {
      if (!cancelled) { setError("Failed to load data"); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [open])

  function updateField(userId: number, field: "basic_salary" | "allowances" | "deductions", value: number) {
    setPayrollMap((prev) => {
      const rec = prev[userId]
      if (!rec) {
        const user = users.find((u) => u.id === userId)
        return { ...prev, [userId]: { id: 0, user_id: userId, name: user?.name, employee_id: user?.employee_id, basic_salary: 0, allowances: 0, deductions: 0, net_salary: 0, [field]: value } }
      }
      return { ...prev, [userId]: { ...rec, [field]: value } }
    })
  }

  async function handleSave(userId: number) {
    const record = payrollMap[userId]
    if (!record) return
    setSaving(userId)
    setError(null)
    try {
      await updatePayroll(userId, {
        basic_salary: record.basic_salary,
        allowances: record.allowances,
        deductions: record.deductions,
      })
      const updated = await getPayrolls()
      const map: PayrollMap = {}
      for (const p of updated as PayrollRecord[]) {
        map[p.user_id] = p
      }
      setPayrollMap((prev) => ({ ...prev, ...map }))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(null)
    }
  }

  const allEmployees = users.filter((u) => u.id).sort((a, b) => {
    const aHas = payrollMap[a.id] !== undefined ? 0 : 1
    const bHas = payrollMap[b.id] !== undefined ? 0 : 1
    return aHas - bHas
  })

  return (
    <Modal open={open} onClose={onClose} title="Payroll">
      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      )}
      {error && <p className="mb-3 text-xs text-[var(--color-danger)]">{error}</p>}
      {!loading && allEmployees.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No employees found.
        </div>
      )}
      {!loading && allEmployees.map((user) => {
        const rec = payrollMap[user.id]
        const hasPayroll = rec !== undefined
        const b = hasPayroll ? rec.basic_salary : 0
        const a = hasPayroll ? rec.allowances : 0
        const d = hasPayroll ? rec.deductions : 0
        return (
          <div key={user.id} className="rounded-xl border border-border p-4 mb-3">
            <p className="text-sm font-medium text-foreground mb-2">
              {user.name || `User #${user.id}`}
              {user.employee_id && <span className="ml-2 text-xs text-muted-foreground">({user.employee_id})</span>}
              {!hasPayroll && <span className="ml-2 text-xs text-amber-600">— no salary set</span>}
            </p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-xs text-muted-foreground">Basic</label>
                <input
                  type="number"
                  value={b}
                  onChange={(e) => updateField(user.id, "basic_salary", Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Allowances</label>
                <input
                  type="number"
                  value={a}
                  onChange={(e) => updateField(user.id, "allowances", Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Deductions</label>
                <input
                  type="number"
                  value={d}
                  onChange={(e) => updateField(user.id, "deductions", Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Net: <strong className="text-foreground">{(b + a - d).toLocaleString()}</strong>
              </span>
              <Button size="sm" onClick={() => handleSave(user.id)} disabled={saving === user.id}>
                {saving === user.id ? "Saving..." : hasPayroll ? "Save" : "Set Salary"}
              </Button>
            </div>
          </div>
        )
      })}
    </Modal>
  )
}
