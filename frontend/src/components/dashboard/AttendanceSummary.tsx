import { useState, useEffect } from "react"
import { Card, CardHeader } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { getAuthToken, API_BASE } from "@/lib/api"

interface AttendanceRow {
  date: string
  status: string
  user_id: number
}

export function AttendanceSummary() {
  const [summary, setSummary] = useState<{ day: string; present: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const token = getAuthToken()
        if (!token) { if (!cancelled) setLoading(false); return }

        const res = await fetch(`${API_BASE}/api/attendance/weekly`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data: AttendanceRow[] = await res.json()
          const dayMap: Record<string, number> = {}
          const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          data.forEach((row) => {
            const d = new Date(row.date)
            const dayLabel = dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1]
            dayMap[dayLabel] = (dayMap[dayLabel] || 0) + 1
          })
          const result = dayNames.map((day) => ({ day, present: dayMap[day] || 0 }))
          if (!cancelled) setSummary(result)
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) return (
    <Card hover className="h-full">
      <CardHeader title="Attendance Summary" subtitle="This week" action={<Badge tone="success">Live</Badge>} />
      <div className="p-5 text-center text-sm text-muted-foreground">Loading...</div>
    </Card>
  )

  const max = Math.max(...summary.map((d) => d.present), 1)

  return (
    <Card hover className="h-full">
      <CardHeader
        title="Attendance Summary"
        subtitle="This week"
        action={<Badge tone="success">Live</Badge>}
      />
      <div className="px-5 pb-5">
        <div className="flex h-40 justify-between gap-2 sm:gap-3">
          {summary.map((d) => (
            <div key={d.day} className="flex h-full flex-1 flex-col items-center gap-2">
              <div className="flex h-full w-full items-end">
                <div
                  className="w-full rounded-lg bg-primary/60 transition-all duration-500 hover:bg-primary"
                  style={{ height: `${(d.present / max) * 100}%` }}
                  title={`${d.present} present`}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
