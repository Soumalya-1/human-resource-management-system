import { useEffect, useState } from "react"
import { UserPlus, Download } from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { StatCard } from "@/components/dashboard/StatCard"
import { AttendanceSummary } from "@/components/dashboard/AttendanceSummary"
import { LeaveRequestsCard } from "@/components/dashboard/LeaveRequestsCard"
import { RecentEmployees } from "@/components/dashboard/RecentEmployees"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { AddEmployeeModal } from "@/components/modals/AddEmployeeModal"
import { EditEmployeeModal } from "@/components/modals/EditEmployeeModal"
import { getProfile, getUsers, getDashboardStats } from "@/lib/api"

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<{ name?: string | null; role?: string | null; profile_picture?: string | null; [key: string]: unknown } | null>(null)
  const [employees, setEmployees] = useState<{ id: number; role: string; [key: string]: unknown }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editEmployeeId, setEditEmployeeId] = useState<number | null>(null)
  const [stats, setStats] = useState<{ present_today: string; on_leave_today: string; open_positions: string }>({
    present_today: "—",
    on_leave_today: "—",
    open_positions: "—",
  })

  async function loadData(cancelled?: { v: boolean }) {
    try {
      const [profileData, usersData] = await Promise.all([getProfile(), getUsers()])
      if (!cancelled?.v) { setAdmin(profileData); setEmployees(usersData) }
    } catch (err: unknown) {
      if (!cancelled?.v) { setError(err instanceof Error ? err.message : "Failed to load dashboard") }
    }
    try {
      const s = await getDashboardStats()
      if (!cancelled?.v) {
        setStats({
          present_today: String(s.present_today ?? "—"),
          on_leave_today: String(s.on_leave_today ?? "—"),
          open_positions: String(s.open_positions ?? "—"),
        })
      }
    } catch { /* stats are optional */ }
    if (!cancelled?.v) setLoading(false)
  }

  useEffect(() => {
    const c = { v: false }
    loadData(c)
    return () => { c.v = true }
  }, [])

  function exportCSV() {
    const headers = ["Name", "Email", "Role", "Job Title", "Employee ID"]
    const rows = employees.map((e: Record<string, unknown>) =>
      [e.name || "", e.email || "", e.role || "", e.job_title || "", e.employee_id || ""]
    )
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "employees.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>

  const totalEmployeesCount = employees.length

  return (
    <DashboardLayout
      role="admin"
      userName={admin?.name || "Admin"}
      userRole={admin?.role || "HR Administrator"}
      avatar={admin?.profile_picture || `https://ui-avatars.com/api/?name=${admin?.name || 'Admin'}&background=random`}
      onSearch={setSearchQuery}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
              Good morning, {admin?.name?.split(" ")[0]}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here&apos;s what&apos;s happening across your organization today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="md" onClick={exportCSV}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="md" onClick={() => setShowAddModal(true)}>
              <UserPlus className="h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Employees" value={String(totalEmployeesCount)} change={`+${totalEmployeesCount}`} trend="up" icon="users" />
          <StatCard label="Present Today" value={stats.present_today} change="—" trend="up" icon="check" />
          <StatCard label="On Leave" value={stats.on_leave_today} change="—" trend="down" icon="calendar" />
          <StatCard label="Open Positions" value={stats.open_positions} change="—" trend="up" icon="briefcase" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AttendanceSummary />
          </div>
          <LeaveRequestsCard />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentEmployees employees={employees} searchQuery={searchQuery} onSelectEmployee={(id) => setEditEmployeeId(id)} />
          </div>
          <QuickActions onEmployeeCreated={() => loadData()} />
        </div>
      </div>

      <AddEmployeeModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => { setShowAddModal(false); loadData() }}
      />
      <EditEmployeeModal
        open={editEmployeeId !== null}
        userId={editEmployeeId ?? 0}
        onClose={() => setEditEmployeeId(null)}
        onSuccess={() => { setEditEmployeeId(null); loadData() }}
      />
    </DashboardLayout>
  )
}
