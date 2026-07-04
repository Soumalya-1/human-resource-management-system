import { Card, CardHeader } from "@/components/ui/Card"
import { calendarEvents } from "@/data/hrms"
import { cn } from "@/lib/utils"

const dayLabels = ["S", "M", "T", "W", "T", "F", "S"]
const eventColors = {
  leave: "bg-[var(--color-warning)]",
  holiday: "bg-[var(--color-danger)]",
  meeting: "bg-primary",
}

export function CalendarCard() {
  // July 2026 starts on a Wednesday (offset 3), 31 days
  const daysInMonth = 31
  const startOffset = 3
  const today = 4
  const cells = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <Card hover className="h-full">
      <CardHeader
        title="July 2026"
        subtitle="Team calendar"
        action={
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary" /> Meeting
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]" /> Leave
            </span>
          </div>
        }
      />
      <div className="p-5 pt-1">
        <div className="grid grid-cols-7 gap-1 text-center">
          {dayLabels.map((d, i) => (
            <div key={i} className="py-1 text-xs font-semibold text-muted-foreground">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />
            const event = calendarEvents[day]
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
                {event && !isToday && (
                  <span className={cn("absolute bottom-1 h-1 w-1 rounded-full", eventColors[event])} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
