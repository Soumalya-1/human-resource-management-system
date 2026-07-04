import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProfileCard } from "@/components/employee/ProfileCard"
import { AttendanceWidget } from "@/components/employee/AttendanceWidget"
import { LeaveBalance } from "@/components/employee/LeaveBalance"
import { CalendarCard } from "@/components/employee/CalendarCard"
import { Notifications } from "@/components/employee/Notifications"
import { RecentActivity } from "@/components/employee/RecentActivity"
import { currentEmployee } from "@/data/hrms"

export default function EmployeeDashboard() {
  return (
    <DashboardLayout
      role="employee"
      userName={currentEmployee.name}
      userRole={currentEmployee.role}
      avatar={currentEmployee.avatar}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
            Welcome back, {currentEmployee.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s your personal workspace overview for today.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column: profile */}
          <div className="lg:col-span-1">
            <ProfileCard />
          </div>

          {/* Right columns */}
          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <AttendanceWidget />
              <LeaveBalance />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <CalendarCard />
              <Notifications />
            </div>
          </div>
        </div>

        <RecentActivity />
      </div>
    </DashboardLayout>
  )
}
