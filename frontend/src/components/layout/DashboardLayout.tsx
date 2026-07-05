import { useState, type ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { Navbar } from "./Navbar"

export function DashboardLayout({
  role,
  userName,
  userRole,
  avatar,
  onSearch,
  children,
}: {
  role: "admin" | "employee"
  userName: string
  userRole: string
  avatar: string
  onSearch?: (q: string) => void
  children: ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          onMenu={() => setSidebarOpen(true)}
          userName={userName}
          userRole={userRole}
          avatar={avatar}
          onSearch={onSearch}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
