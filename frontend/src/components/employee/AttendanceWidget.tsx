import { Clock, LogIn } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { weeklyAttendance } from "@/data/hrms"

const statusStyles = {
  present: "bg-[var(--color-success-soft)] text-[var(--color-success)] border-transparent",
  remote: "bg-sky-100 text-[var(--color-accent)] border-transparent",
  today: "bg-[var(--color-primary-soft)] text-primary border-primary/30",
}

export function AttendanceWidget() {
  return (
    <Card hover className="h-full">
      <CardHeader
        title="Attendance"
        subtitle="This week"
        action={
          <Button size="sm">
            <LogIn className="h-4 w-4" />
            Check In
          </Button>
        }
      />
      <div className="p-5 pt-1">
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-muted p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Clock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Checked in today</p>
            <p className="text-lg font-semibold text-foreground">9:02 AM · 3h 45m</p>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {weeklyAttendance.map((d) => (
            <div
              key={d.day}
              className={"rounded-xl border p-2.5 text-center " + statusStyles[d.status]}
            >
              <p className="text-xs font-semibold">{d.day}</p>
              <p className="mt-1 text-[10px] font-medium opacity-80">{d.hours}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
