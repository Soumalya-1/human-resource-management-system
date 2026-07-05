import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Menu, Search, Bell, ChevronDown, LogOut } from "lucide-react"
import { Avatar } from "@/components/ui/Avatar"
import { setAuthToken, getUnreadCount, getNotifications, markNotificationsRead } from "@/lib/api"

export function Navbar({
  onMenu,
  userName,
  userRole,
  avatar,
  onSearch,
}: {
  onMenu: () => void
  userName: string
  userRole: string
  avatar?: string | null
  onSearch?: (q: string) => void
}) {
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifList, setNotifList] = useState<{ id: string; title: string; detail: string }[]>([])
  const userRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    getUnreadCount().then((d: { count: number }) => { if (!cancelled) setUnreadCount(d.count) }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function openNotifPanel() {
    if (notifOpen) { setNotifOpen(false); return }
    setNotifOpen(true)
    try {
      const list = await getNotifications()
      setNotifList(list.slice(0, 5).map((n: { id: number; title: string; detail?: string }) => ({
        id: String(n.id), title: n.title, detail: n.detail || ""
      })))
      await markNotificationsRead()
      setUnreadCount(0)
    } catch { /* ignore */ }
  }

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
            onChange={(e) => onSearch?.(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-muted/60 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div ref={notifRef} className="relative">
          <button
            onClick={openNotifPanel}
            className="relative rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card shadow-lg ring-1 ring-black/5">
              <div className="p-3 text-sm font-semibold text-foreground border-b border-border">Notifications</div>
              {notifList.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
              ) : (
                notifList.map((n) => (
                  <div key={n.id} className="px-3 py-2.5 text-sm border-b border-border last:border-0 hover:bg-muted">
                    <p className="font-medium text-foreground">{n.title}</p>
                    {n.detail && <p className="text-xs text-muted-foreground mt-0.5">{n.detail}</p>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="hidden h-8 w-px bg-border sm:block" />

        <div ref={userRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition-colors hover:bg-muted sm:pl-2 sm:pr-3"
          >
            <Avatar src={avatar} name={userName} size="sm" />
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold leading-tight text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{userRole}</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card shadow-lg ring-1 ring-black/5">
              <button
                onClick={() => { setAuthToken(null); navigate("/login"); }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
