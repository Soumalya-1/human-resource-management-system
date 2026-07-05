import { useMemo } from "react"
import { Card, CardHeader } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

const dayLabels = ["S", "M", "T", "W", "T", "F", "S"]

interface LeaveSummary {
  start_date: string
  end_date: string
  leave_type: string
}

export function CalendarCard({ leaves }: { leaves?: LeaveSummary[] }) {
  const { year, month, daysInMonth, startOffset, today, leaveDates } = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const mLabel = now.toLocaleString("default", { month: "long", year: "numeric" })
    const firstDay = new Date(y, m, 1)
    const offset = firstDay.getDay()
    const days = new Date(y, m + 1, 0).getDate()
    const day = now.getDate()

    const ld = new Set<string>()
    if (leaves) {
      for (const lv of leaves) {
        const s = new Date(lv.start_date)
        const e = new Date(lv.end_date)
        for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
          if (d.getFullYear() === y && d.getMonth() === m) {
            ld.add(String(d.getDate()))
          }
        }
      }
    }
    return { year: y, month: mLabel, daysInMonth: days, startOffset: offset, today: day, leaveDates: ld }
  }, [leaves])

  const cells = useMemo(
    () => [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)],
    [startOffset, daysInMonth]
  )

  return (
    <Card hover className="h-full">
      <CardHeader title={month} subtitle="Team calendar" />
      <div className="p-5 pt-1">
        <div className="grid grid-cols-7 gap-1 text-center">
          {dayLabels.map((d, i) => (
            <div key={i} className="py-1 text-xs font-semibold text-muted-foreground">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />
            const isToday = day === today
            const isLeave = leaveDates.has(String(day))
            return (
              <div
                key={day}
                className={cn(
                  "relative flex aspect-square items-center justify-center rounded-lg text-sm transition-colors",
                  isToday
                    ? "bg-primary font-semibold text-primary-foreground"
                    : isLeave
                      ? "bg-amber-100 font-medium text-amber-700"
                      : "text-foreground hover:bg-muted",
                )}
                title={isLeave ? "On leave" : undefined}
              >
                {day}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
