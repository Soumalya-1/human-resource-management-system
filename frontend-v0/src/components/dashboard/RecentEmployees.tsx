import { Card, CardHeader } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Avatar } from "@/components/ui/Avatar"
import { recentEmployees } from "@/data/hrms"

const statusTone = {
  Active: "success",
  "On Leave": "warning",
  Remote: "accent",
} as const

export function RecentEmployees() {
  return (
    <Card hover>
      <CardHeader
        title="Recent Employees"
        subtitle="Newest additions to your team"
        action={<button className="text-sm font-medium text-primary hover:underline">View all</button>}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-y border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Department</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recentEmployees.map((emp) => (
              <tr key={emp.id} className="transition-colors hover:bg-muted">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={emp.avatar} name={emp.name} size="md" />
                    <div>
                      <p className="font-medium text-foreground">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{emp.department}</td>
                <td className="px-5 py-3">
                  <Badge tone={statusTone[emp.status]}>{emp.status}</Badge>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{emp.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
