import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  Wallet,
  Settings,
  LifeBuoy,
  X,
} from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import { cn } from "@/lib/utils"

type Role = "admin" | "employee"

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/employees", label: "Employees", icon: Users },
  { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/admin/leaves", label: "Leave Requests", icon: FileText },
  { to: "/admin/payroll", label: "Payroll", icon: Wallet },
]

const employeeNav = [
  { to: "/employee", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/employee/attendance", label: "My Attendance", icon: CalendarCheck },
  { to: "/employee/leaves", label: "My Leaves", icon: FileText },
  { to: "/employee/payslips", label: "Payslips", icon: Wallet },
]

export function Sidebar({
  role,
  open,
  onClose,
}: {
  role: Role
  open: boolean
  onClose: () => void
}) {
  const nav = role === "admin" ? adminNav : employeeNav

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Logo />
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </p>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}

          <p className="px-3 pb-2 pt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            General
          </p>
          {[
            { label: "Settings", icon: Settings },
            { label: "Help Center", icon: LifeBuoy },
          ].map((item) => (
            <button
              key={item.label}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="m-4 rounded-2xl bg-[var(--color-primary-soft)] p-4">
          <p className="text-sm font-semibold text-foreground">Upgrade to Pro</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Unlock advanced analytics and payroll automation.
          </p>
          <button className="mt-3 w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-[var(--color-primary-hover)]">
            Upgrade Now
          </button>
        </div>
      </aside>
    </>
  )
}
