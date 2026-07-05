import { useNavigate } from "react-router-dom"
import { Menu, Search, Bell, ChevronDown, LogOut } from "lucide-react"
import { Avatar } from "@/components/ui/Avatar"
import { setAuthToken } from "@/lib/api"

export function Navbar({
  onMenu,
  userName,
  userRole,
  avatar,
}: {
  onMenu: () => void
  userName: string
  userRole: string
  avatar?: string | null
}) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search employees, requests..."
          className="h-10 w-full rounded-xl border border-border bg-muted/60 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          className="relative rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-danger)] ring-2 ring-card" />
        </button>

        <div className="hidden h-8 w-px bg-border sm:block" />

        <div className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition-colors hover:bg-muted sm:pl-2 sm:pr-3">
          <Avatar src={avatar} name={userName} size="sm" />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold leading-tight text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">{userRole}</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
        </div>

        <button
          onClick={() => { setAuthToken(null); navigate("/login"); }}
          className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
          aria-label="Log out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
