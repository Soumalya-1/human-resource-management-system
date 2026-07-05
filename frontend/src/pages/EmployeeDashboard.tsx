import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProfileCard } from "@/components/employee/ProfileCard"
import { AttendanceWidget } from "@/components/employee/AttendanceWidget"
import { LeaveBalance } from "@/components/employee/LeaveBalance"
import { CalendarCard } from "@/components/employee/CalendarCard"
import { Notifications } from "@/components/employee/Notifications"
import { RecentActivity } from "@/components/employee/RecentActivity"
import { LeaveRequestForm } from "@/components/employee/LeaveRequestForm"
import { getProfile, getLeaveBalance, getNotifications, getActivity, getLeaves } from "@/lib/api"

interface ProfileData {
  name?: string | null
  email?: string | null
  role?: string | null
  profile_picture?: string | null
  [key: string]: unknown
}

interface LeaveRecord {
  id: number
  leave_type: string
  start_date: string
  end_date: string
  status: string
}

export default function EmployeeDashboard() {
  const [user, setUser] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leaveBalance, setLeaveBalance] = useState<{ paid: { total: number; used: number; remaining: number }; sick: { total: number; used: number; remaining: number }; unpaid: { total: number; used: number; remaining: number } } | null>(null)
  const [leaves, setLeaves] = useState<LeaveRecord[]>([])
  const [notifications, setNotifications] = useState<{ id: string; title: string; detail: string; unread: boolean }[]>([])
  const [activity, setActivity] = useState<{ id: string; type: string; title: string; time: string }[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getProfile()
        if (!cancelled) setUser(data)
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load profile")
      }
      try {
        const [lb, l, n, a] = await Promise.allSettled([
          getLeaveBalance(), getLeaves(), getNotifications(), getActivity()
        ])
        if (!cancelled) {
          if (lb.status === "fulfilled") setLeaveBalance(lb.value)
          if (l.status === "fulfilled") setLeaves(l.value.filter((r: LeaveRecord) => r.status === "Approved"))
          if (n.status === "fulfilled") setNotifications(n.value.map((item: { id: number; title: string; detail?: string; unread: boolean; created_at: string }) => ({
            id: String(item.id), title: item.title, detail: item.detail || "", unread: item.unread
          })))
          if (a.status === "fulfilled") setActivity(a.value.map((item: { id: number; type: string; title: string; time: string }) => ({
            id: String(item.id), type: item.type, title: item.title, time: item.time
          })))
        }
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const leaveBalanceItems = leaveBalance
    ? [
        { label: "Paid Leave", total: leaveBalance.paid.total, used: leaveBalance.paid.used, color: "#6366f1" },
        { label: "Sick Leave", total: leaveBalance.sick.total, used: leaveBalance.sick.used, color: "#f59e0b" },
        { label: "Unpaid Leave", total: leaveBalance.unpaid.total, used: leaveBalance.unpaid.used, color: "#ef4444" },
      ]
    : undefined

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
          <div className="lg:col-span-1">
            <ProfileCard user={user} />
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <AttendanceWidget />
              <LeaveBalance leaves={leaveBalanceItems} onRequest={() => document.getElementById("leave-request-form")?.scrollIntoView({ behavior: "smooth" })} />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <CalendarCard leaves={leaves} />
              <Notifications items={notifications} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div id="leave-request-form">
            <LeaveRequestForm />
          </div>
          <RecentActivity items={activity} />
        </div>
      </div>
    </DashboardLayout>
  )
}
