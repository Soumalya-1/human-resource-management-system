import { Card, CardHeader } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Avatar } from "@/components/ui/Avatar"

interface EmployeeSummary {
  id: number
  employee_id?: string
  name?: string | null
  email?: string
  job_title?: string | null
  role: string
  profile_picture?: string | null
  [key: string]: unknown
}

export function RecentEmployees({ employees, searchQuery = "", onSelectEmployee }: { employees: EmployeeSummary[]; searchQuery?: string; onSelectEmployee?: (id: number) => void }) {
  const q = searchQuery.toLowerCase()
  const filtered = q
    ? employees.filter((e) =>
        [e.name, e.email, e.employee_id, e.job_title, e.role]
          .some((v) => v?.toLowerCase().includes(q))
      )
    : employees

  return (
    <Card hover>
      <CardHeader
        title="Employee Directory"
        subtitle={filtered.length === employees.length
          ? "Active registered members of your team"
          : `${filtered.length} of ${employees.length} members match`}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-y border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Role / Role Type</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Employee ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((emp) => (
              <tr
                key={emp.id}
                className="cursor-pointer transition-colors hover:bg-muted"
                onClick={() => onSelectEmployee?.(emp.id)}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={emp.profile_picture}
                      name={emp.name || "User"}
                      size="md"
                      className="bg-white"
                    />
                    <div>
                      <p className="font-medium text-foreground">{emp.name || "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground">{emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {emp.job_title || emp.role}
                </td>
                <td className="px-5 py-3">
                  <Badge tone={emp.role === 'Admin' ? 'primary' : 'success'}>
                    {emp.role === 'Admin' ? 'Admin / HR' : 'Active'}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-muted-foreground font-mono text-xs">
                  {emp.employee_id}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                  {q ? "No employees match your search" : "No employees registered yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
