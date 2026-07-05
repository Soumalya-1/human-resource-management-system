import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { getUsers, adminUpdateUser } from "@/lib/api"

export function EditEmployeeModal({
  open,
  userId,
  onClose,
  onSuccess,
}: {
  open: boolean
  userId: number
  onClose: () => void
  onSuccess: () => void
}) {
  const [jobTitle, setJobTitle] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [role, setRole] = useState("Employee")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    if (!open || !userId) return
    setInitialLoading(true)
    setError(null)
    getUsers().then((users: { id: number; job_title?: string; phone?: string; address?: string; role?: string }[]) => {
      const u = users.find((x: { id: number }) => x.id === userId)
      if (u) {
        setJobTitle(u.job_title || "")
        setPhone(u.phone || "")
        setAddress(u.address || "")
        setRole(u.role || "Employee")
      }
      setInitialLoading(false)
    }).catch(() => {
      setError("Failed to load user data")
      setInitialLoading(false)
    })
  }, [open, userId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await adminUpdateUser(userId, {
        job_title: jobTitle || null,
        phone: phone || null,
        address: address || null,
        role: role,
      })
      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Employee">
      {initialLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="edit-job" label="Job Title" placeholder="Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
          <Input id="edit-phone" label="Phone" placeholder="+1 (555) 0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input id="edit-address" label="Address" placeholder="123 Main St" value={address} onChange={(e) => setAddress(e.target.value)} />
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Role</label>
            <select
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option>Employee</option>
              <option>HR</option>
              <option>Admin</option>
            </select>
          </div>
          {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" size="md" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="md" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
