import { Card, CardHeader } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { attendanceSummary, attendanceBreakdown } from "@/data/hrms"

export function AttendanceSummary() {
  const max = Math.max(...attendanceSummary.map((d) => d.present))
  const totalTracked = attendanceBreakdown.reduce((sum, b) => sum + b.value, 0)

  return (
    <Card hover className="h-full">
      <CardHeader
        title="Attendance Summary"
        subtitle="This week"
        action={<Badge tone="success">Live</Badge>}
      />
      <div className="px-5 pb-5">
        <div className="flex h-40 justify-between gap-2 sm:gap-3">
          {attendanceSummary.map((d) => (
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

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
          {attendanceBreakdown.map((b) => (
            <div key={b.label}>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                <span className="text-xs text-muted-foreground">{b.label}</span>
              </div>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {Math.round((b.value / totalTracked) * 100)}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
