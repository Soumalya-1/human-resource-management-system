import { useState, useEffect } from "react"
import { Clock, FileText, UserCog, Wallet } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/Card"
import { getActivity } from "@/lib/api"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  attendance: Clock,
  leave: FileText,
  profile: UserCog,
  payroll: Wallet,
}

interface ActivityItem {
  id: string
  type: string
  title: string
  time: string
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin} min ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  return d.toLocaleDateString()
}

export function RecentActivity({ items: propItems }: { items?: ActivityItem[] }) {
  const [items, setItems] = useState<ActivityItem[] | null>(propItems ?? null)
  const [loading, setLoading] = useState(!propItems)

  useEffect(() => {
    if (propItems) { setItems(propItems); setLoading(false); return }
    let cancelled = false
    getActivity().then((data: ActivityItem[]) => {
      if (!cancelled) { setItems(data); setLoading(false) }
    }).catch(() => { if (!cancelled) { setItems([]); setLoading(false) } })
    return () => { cancelled = true }
  }, [propItems])

  const activities = items || []

  return (
    <Card hover className="h-full">
      <CardHeader title="Recent Activity" subtitle="Your latest actions" />
      <div className="px-5 pb-5 pt-1">
        {loading && (
          <div className="py-6 text-center text-sm text-muted-foreground">Loading...</div>
        )}
        {!loading && activities.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No recent activity
          </div>
        )}
        <ol className="relative space-y-5 border-l border-border pl-6">
          {activities.map((item) => {
            const Icon = iconMap[item.type] || Clock
            return (
              <li key={item.id} className="relative">
                <span className="absolute -left-[34px] flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-primary ring-4 ring-card">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{formatTime(item.time)}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </Card>
  )
}
