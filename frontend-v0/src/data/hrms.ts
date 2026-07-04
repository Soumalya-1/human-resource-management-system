export type Employee = {
  id: string
  name: string
  role: string
  department: string
  email: string
  status: "Active" | "On Leave" | "Remote"
  joined: string
  avatar: string
}

export type LeaveRequest = {
  id: string
  name: string
  type: string
  from: string
  to: string
  days: number
  status: "Pending" | "Approved" | "Rejected"
  avatar: string
}

export type Activity = {
  id: string
  title: string
  time: string
  type: "attendance" | "leave" | "profile" | "payroll"
}

export const adminStats = [
  { label: "Total Employees", value: "248", change: "+12", trend: "up" as const, icon: "users" },
  { label: "Present Today", value: "213", change: "+5%", trend: "up" as const, icon: "check" },
  { label: "On Leave", value: "18", change: "-3", trend: "down" as const, icon: "calendar" },
  { label: "Open Positions", value: "9", change: "+2", trend: "up" as const, icon: "briefcase" },
]

export const attendanceSummary = [
  { day: "Mon", present: 228 },
  { day: "Tue", present: 236 },
  { day: "Wed", present: 219 },
  { day: "Thu", present: 241 },
  { day: "Fri", present: 213 },
  { day: "Sat", present: 96 },
]

export const attendanceBreakdown = [
  { label: "Present", value: 213, color: "var(--color-success)" },
  { label: "Late", value: 17, color: "var(--color-warning)" },
  { label: "Absent", value: 18, color: "var(--color-danger)" },
]

export const leaveRequests: LeaveRequest[] = [
  {
    id: "lr1",
    name: "Aria Montgomery",
    type: "Sick Leave",
    from: "Jul 5",
    to: "Jul 6",
    days: 2,
    status: "Pending",
    avatar: "https://i.pravatar.cc/120?img=47",
  },
  {
    id: "lr2",
    name: "Marcus Chen",
    type: "Vacation",
    from: "Jul 10",
    to: "Jul 18",
    days: 8,
    status: "Pending",
    avatar: "https://i.pravatar.cc/120?img=12",
  },
  {
    id: "lr3",
    name: "Priya Nair",
    type: "Work From Home",
    from: "Jul 4",
    to: "Jul 4",
    days: 1,
    status: "Approved",
    avatar: "https://i.pravatar.cc/120?img=32",
  },
  {
    id: "lr4",
    name: "David Okafor",
    type: "Personal",
    from: "Jul 8",
    to: "Jul 9",
    days: 2,
    status: "Rejected",
    avatar: "https://i.pravatar.cc/120?img=15",
  },
]

export const recentEmployees: Employee[] = [
  {
    id: "e1",
    name: "Sofia Rossi",
    role: "Product Designer",
    department: "Design",
    email: "sofia.rossi@nimbus.co",
    status: "Active",
    joined: "Jul 1, 2026",
    avatar: "https://i.pravatar.cc/120?img=45",
  },
  {
    id: "e2",
    name: "James Whitfield",
    role: "Backend Engineer",
    department: "Engineering",
    email: "james.w@nimbus.co",
    status: "Remote",
    joined: "Jun 28, 2026",
    avatar: "https://i.pravatar.cc/120?img=8",
  },
  {
    id: "e3",
    name: "Leila Haddad",
    role: "HR Specialist",
    department: "People Ops",
    email: "leila.h@nimbus.co",
    status: "Active",
    joined: "Jun 24, 2026",
    avatar: "https://i.pravatar.cc/120?img=25",
  },
  {
    id: "e4",
    name: "Tobias Berg",
    role: "Data Analyst",
    department: "Analytics",
    email: "tobias.b@nimbus.co",
    status: "On Leave",
    joined: "Jun 20, 2026",
    avatar: "https://i.pravatar.cc/120?img=53",
  },
]

export const currentEmployee = {
  name: "Aria Montgomery",
  role: "Senior Product Designer",
  department: "Design",
  employeeId: "NB-1042",
  email: "aria.montgomery@nimbus.co",
  phone: "+1 (415) 555-0142",
  location: "San Francisco, CA",
  manager: "Nadia Fischer",
  avatar: "https://i.pravatar.cc/160?img=47",
}

export const leaveBalances = [
  { label: "Annual Leave", used: 8, total: 20, color: "var(--color-primary)" },
  { label: "Sick Leave", used: 3, total: 10, color: "var(--color-accent)" },
  { label: "Personal", used: 1, total: 5, color: "var(--color-warning)" },
]

export const employeeActivity: Activity[] = [
  { id: "a1", title: "Checked in at 9:02 AM", time: "Today", type: "attendance" },
  { id: "a2", title: "Sick leave request submitted", time: "Today", type: "leave" },
  { id: "a3", title: "Updated emergency contact", time: "Yesterday", type: "profile" },
  { id: "a4", title: "June payslip available", time: "2 days ago", type: "payroll" },
  { id: "a5", title: "Checked out at 6:14 PM", time: "2 days ago", type: "attendance" },
]

export const notifications = [
  { id: "n1", title: "Performance review scheduled", detail: "With Nadia F. on Jul 9, 2:00 PM", unread: true },
  { id: "n2", title: "Team offsite announced", detail: "Company-wide event on Jul 22", unread: true },
  { id: "n3", title: "Timesheet reminder", detail: "Submit hours before Friday", unread: false },
]

export const weeklyAttendance = [
  { day: "Mon", status: "present" as const, hours: "8h 12m" },
  { day: "Tue", status: "present" as const, hours: "8h 04m" },
  { day: "Wed", status: "remote" as const, hours: "7h 58m" },
  { day: "Thu", status: "present" as const, hours: "8h 21m" },
  { day: "Fri", status: "today" as const, hours: "3h 45m" },
]

export const quickActions = [
  { label: "Add Employee", icon: "user-plus", tone: "primary" as const },
  { label: "Approve Leaves", icon: "check-circle", tone: "success" as const },
  { label: "Run Payroll", icon: "wallet", tone: "accent" as const },
  { label: "Post Announcement", icon: "megaphone", tone: "warning" as const },
]

/* Calendar helpers for employee dashboard */
export const calendarEvents: Record<number, "leave" | "holiday" | "meeting"> = {
  4: "meeting",
  9: "meeting",
  10: "leave",
  16: "holiday",
  22: "meeting",
}
