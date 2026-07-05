import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProfileCard } from "@/components/employee/ProfileCard"
import { AttendanceWidget } from "@/components/employee/AttendanceWidget"
import { LeaveBalance } from "@/components/employee/LeaveBalance"
import { CalendarCard } from "@/components/employee/CalendarCard"
import { Notifications } from "@/components/employee/Notifications"
import { RecentActivity } from "@/components/employee/RecentActivity"
import { LeaveRequestForm } from "@/components/employee/LeaveRequestForm"
import { getProfile } from "@/lib/api"

interface ProfileData {
  name?: string | null
  email?: string | null
  role?: string | null
  profile_picture?: string | null
  [key: string]: unknown
}

export default function EmployeeDashboard() {
  const [user, setUser] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getProfile().then((data) => {
      if (!cancelled) { setUser(data); setLoading(false) }
    }).catch((err: unknown) => {
      if (!cancelled) { setError(err instanceof Error ? err.message : "Failed to load profile"); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [])

  if (loading) return <div className="p-8 text-center">Loading your dashboard...</div>

  return (
    <DashboardLayout
      role="employee"
      userName={user?.name || "Employee"}
      userRole={user?.role || "Employee"}
      avatar={user?.profile_picture || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
            Welcome back, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's your personal workspace overview for today.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column: profile */}
          <div className="lg:col-span-1">
            {/* Pass the real user data into the Profile Card */}
            <ProfileCard user={user} />
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

        {/* Live action: Request Leave */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LeaveRequestForm />
          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  )
}