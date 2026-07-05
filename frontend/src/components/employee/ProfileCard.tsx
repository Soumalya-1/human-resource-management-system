import { useState } from "react"
import { Mail, Phone, MapPin, User2, Building2, Pencil } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Avatar } from "@/components/ui/Avatar"
import { Button } from "@/components/ui/Button"
import { updateProfile } from "@/lib/api"

interface UserProfile {
  id?: number
  name?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  employee_id?: string | null
  job_title?: string | null
  role?: string | null
  profile_picture?: string | null
}

export function ProfileCard({ user }: { user?: UserProfile | null }) {
  const [editing, setEditing] = useState(false)
  const [phone, setPhone] = useState(user?.phone || "")
  const [address, setAddress] = useState(user?.address || "")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setMsg(null)
    try {
      await updateProfile({ phone: phone || undefined, address: address || undefined })
      setEditing(false)
      setMsg("Profile updated")
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Update failed")
    } finally {
      setSaving(false)
    }
  }

  const rows = [
    { icon: Mail, label: "Email", value: user?.email || "N/A" },
    { icon: Phone, label: "Phone", value: user?.phone || "Not provided" },
    { icon: MapPin, label: "Address", value: user?.address || "Not provided" },
    { icon: User2, label: "Employee ID", value: user?.employee_id || "N/A" },
  ]

  return (
    <Card hover className="overflow-hidden">
      <div className="h-20 bg-primary" />
      <div className="px-5 pb-5">
        <div className="-mt-10 flex items-end gap-4">
          <Avatar
            src={user?.profile_picture || undefined}
            name={user?.name || "User"}
            size="xl"
            className="ring-4 ring-card bg-white"
          />
          <div className="flex flex-1 items-center justify-between pb-1">
            <Badge tone="success">Active</Badge>
            <Button variant="ghost" size="sm" onClick={() => { setEditing(!editing); setMsg(null) }}>
              <Pencil className="h-3.5 w-3.5" />
              {editing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </div>
        <div className="mt-3">
          <h2 className="text-lg font-semibold text-foreground">{user?.name}</h2>
          <p className="text-sm text-muted-foreground">{user?.job_title || user?.role}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {user?.address || "N/A"}
            </span>
            <span className="text-border">·</span>
            <span>ID: {user?.employee_id}</span>
          </div>
        </div>

        <dl className="mt-5 space-y-3 border-t border-border pt-4">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <row.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <dt className="text-xs text-muted-foreground">{row.label}</dt>
                {editing && (row.label === "Phone" || row.label === "Address") ? (
                  <input
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-2 py-1 text-sm font-medium text-foreground"
                    value={row.label === "Phone" ? phone : address}
                    onChange={(e) => row.label === "Phone" ? setPhone(e.target.value) : setAddress(e.target.value)}
                  />
                ) : (
                  <dd className="truncate text-sm font-medium text-foreground">{row.value}</dd>
                )}
              </div>
            </div>
          ))}
        </dl>

        {editing && (
          <div className="mt-4 flex items-center gap-3">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
          </div>
        )}
      </div>
    </Card>
  )
}
