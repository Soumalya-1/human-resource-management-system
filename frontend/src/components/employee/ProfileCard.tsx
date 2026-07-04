import { Mail, Phone, MapPin, User2, Building2 } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Avatar } from "@/components/ui/Avatar"
import { currentEmployee } from "@/data/hrms"

export function ProfileCard() {
  const rows = [
    { icon: Mail, label: "Email", value: currentEmployee.email },
    { icon: Phone, label: "Phone", value: currentEmployee.phone },
    { icon: MapPin, label: "Location", value: currentEmployee.location },
    { icon: User2, label: "Manager", value: currentEmployee.manager },
  ]

  return (
    <Card hover className="overflow-hidden">
      <div className="h-20 bg-primary" />
      <div className="px-5 pb-5">
        <div className="-mt-10 flex items-end gap-4">
          <Avatar src={currentEmployee.avatar} name={currentEmployee.name} size="xl" className="ring-4 ring-card" />
          <div className="pb-1">
            <Badge tone="success">Active</Badge>
          </div>
        </div>
        <div className="mt-3">
          <h2 className="text-lg font-semibold text-foreground">{currentEmployee.name}</h2>
          <p className="text-sm text-muted-foreground">{currentEmployee.role}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {currentEmployee.department}
            </span>
            <span className="text-border">·</span>
            <span>ID {currentEmployee.employeeId}</span>
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
