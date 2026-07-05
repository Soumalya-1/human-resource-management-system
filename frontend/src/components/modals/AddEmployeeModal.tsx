import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { apiSignup } from "@/lib/api"

export function AddEmployeeModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !password) return
    setLoading(true)
    setError(null)
    try {
      await apiSignup({ email, password, name, role: "Employee" })
      setName("")
      setEmail("")
      setPassword("")
      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create employee")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Employee">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="modal-name"
          label="Full Name"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          id="modal-email"
          label="Email"
          type="email"
          placeholder="jane@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="modal-password"
          label="Password"
          type="password"
          placeholder="Set a temporary password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" size="md" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="md" disabled={loading}>
            {loading ? "Creating..." : "Create Employee"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}