import { Mail, Phone, MapPin, User2, Building2 } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Avatar } from "@/components/ui/Avatar"

// Accept the 'user' prop from the dashboard
export function ProfileCard({ user }: { user: any }) {
  // Map the real FastAPI data
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
            src={user?.profile_picture}
            name={user?.name || "User"}
            size="xl"
            className="ring-4 ring-card bg-white"
          />
          <div className="pb-1">
            <Badge tone="success">Active</Badge>
          </div>
        </div>
        <div className="mt-3">
          <h2 className="text-lg font-semibold text-foreground">{user?.name}</h2>
          <p className="text-sm text-muted-foreground">{user?.job_title || user?.role}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              HQ Office
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
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">{row.label}</dt>
                <dd className="truncate text-sm font-medium text-foreground">{row.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  )
}