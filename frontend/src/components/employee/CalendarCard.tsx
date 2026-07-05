import { useMemo } from "react"
import { Card, CardHeader } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

const dayLabels = ["S", "M", "T", "W", "T", "F", "S"]

export function CalendarCard() {
  const { year, month, daysInMonth, startOffset, today } = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.toLocaleString("default", { month: "long", year: "numeric" })
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const offset = firstDay.getDay()
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const day = now.getDate()
    return { year: y, month: m, daysInMonth: days, startOffset: offset, today: day }
  }, [])

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
            return (
              <div
                key={day}
                className={cn(
                  "relative flex aspect-square items-center justify-center rounded-lg text-sm transition-colors",
                  isToday
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "text-foreground hover:bg-muted",
                )}
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
