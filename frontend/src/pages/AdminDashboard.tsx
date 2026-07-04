import { UserPlus, Download } from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { StatCard } from "@/components/dashboard/StatCard"
import { AttendanceSummary } from "@/components/dashboard/AttendanceSummary"
import { LeaveRequestsCard } from "@/components/dashboard/LeaveRequestsCard"
import { RecentEmployees } from "@/components/dashboard/RecentEmployees"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { adminStats } from "@/data/hrms"

export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin" userName="Nadia Fischer" userRole="HR Administrator" avatar="https://i.pravatar.cc/120?img=41">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
              Good morning, Nadia
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
          {adminStats.map((stat) => (
            <StatCard key={stat.label} {...stat} icon={stat.icon as never} />
          ))}
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
            <RecentEmployees />
          </div>
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  )
}
