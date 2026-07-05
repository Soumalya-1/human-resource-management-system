import { Bell } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

interface NotificationItem {
  id: string
  title: string
  detail: string
  unread: boolean
}

export function Notifications({ items }: { items?: NotificationItem[] }) {
  const notifications = items || []
  const unread = notifications.filter((n) => n.unread).length

  return (
    <Card hover className="h-full">
      <CardHeader
        title="Notifications"
        subtitle="Latest updates"
        action={unread > 0 ? <Badge tone="primary">{unread} new</Badge> : undefined}
      />
      <div className="space-y-1 px-2 pb-3">
        {notifications.length === 0 && (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No new notifications
          </div>
        )}
        {notifications.map((n) => (
          <div key={n.id} className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-muted">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-primary">
              <Bell className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                {n.title}
                {n.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
              </p>
              <p className="text-xs text-muted-foreground">{n.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
