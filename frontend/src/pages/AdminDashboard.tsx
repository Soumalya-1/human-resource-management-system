import { useEffect, useState } from "react"
import { UserPlus, Download } from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { StatCard } from "@/components/dashboard/StatCard"
import { AttendanceSummary } from "@/components/dashboard/AttendanceSummary"
import { LeaveRequestsCard } from "@/components/dashboard/LeaveRequestsCard"
import { RecentEmployees } from "@/components/dashboard/RecentEmployees"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { getProfile, getUsers } from "@/lib/api"

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<{ name?: string | null; role?: string | null; profile_picture?: string | null; [key: string]: unknown } | null>(null)
  const [employees, setEmployees] = useState<{ id: number; role: string; [key: string]: unknown }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  async function loadData(cancelled?: { v: boolean }) {
    try {
      const [profileData, usersData] = await Promise.all([getProfile(), getUsers()])
      if (!cancelled?.v) { setAdmin(profileData); setEmployees(usersData); setLoading(false) }
    } catch (err: unknown) {
      if (!cancelled?.v) { setError(err instanceof Error ? err.message : "Failed to load dashboard"); setLoading(false) }
    }
  }

  useEffect(() => {
    const c = { v: false }
    loadData(c)
    return () => { c.v = true }
  }, [])

  if (loading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>

  // Dynamically count total employees from PostgreSQL
  const totalEmployeesCount = employees.length > 0 ? employees.length : 0

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
        {/* Page header */}
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
            <Button variant="outline" size="md">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="md">
              <UserPlus className="h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Employees" value={totalEmployeesCount.toString()} change={`+${totalEmployeesCount}`} trend="up" icon="users" />
          <StatCard label="Present Today" value="—" change="—" trend="up" icon="check" />
          <StatCard label="On Leave" value="—" change="—" trend="down" icon="calendar" />
          <StatCard label="Open Positions" value="—" change="—" trend="up" icon="briefcase" />
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AttendanceSummary />
          </div>
          <LeaveRequestsCard />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Pass the dynamic employee directory into the table */}
            <RecentEmployees employees={employees} searchQuery={searchQuery} />
          </div>
          <QuickActions onEmployeeCreated={() => loadData()} />
        </div>
      </div>
    </DashboardLayout>
  )
}