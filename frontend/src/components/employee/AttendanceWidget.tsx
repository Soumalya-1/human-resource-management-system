import { useState } from "react"
import { Clock, LogIn, LogOut } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { checkIn, checkOut } from "@/lib/api"

const statusStyles = {
  present: "bg-[var(--color-success-soft)] text-[var(--color-success)] border-transparent",
  remote: "bg-sky-100 text-[var(--color-accent)] border-transparent",
  today: "bg-[var(--color-primary-soft)] text-primary border-primary/30",
}

export function AttendanceWidget() {
  const [today, setToday] = useState({ checkedIn: false, hours: "0h 00m" })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function doCheckIn() {
    setLoading(true)
    setMsg(null)
    try {
      await checkIn()
      setToday({ checkedIn: true, hours: "0h 01m" })
      setMsg("Checked in (live or mock)")
    } catch (e: any) {
      setMsg(e?.message || "Check-in failed")
    } finally {
      setLoading(false)
    }
  }

  async function doCheckOut() {
    setLoading(true)
    setMsg(null)
    try {
      await checkOut()
      setToday({ checkedIn: false, hours: "8h 05m" })
      setMsg("Checked out (live or mock)")
    } catch (e: any) {
      setMsg(e?.message || "Check-out failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card hover className="h-full">
      <CardHeader
        title="Attendance"
        subtitle="This week"
        action={
          !today.checkedIn ? (
            <Button size="sm" onClick={doCheckIn} disabled={loading}>
              <LogIn className="h-4 w-4" />
              Check In
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={doCheckOut} disabled={loading}>
              <LogOut className="h-4 w-4" />
              Check Out
            </Button>
          )
        }
      />
      <div className="p-5 pt-1">
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-muted p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Clock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">
              {today.checkedIn ? "Checked in today" : "Last check-out"}
            </p>
            <p className="text-lg font-semibold text-foreground">
              {today.checkedIn ? "Just now" : "Earlier"} · {today.hours}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[
            { day: "Mon", status: "present", hours: "8h 10m" },
            { day: "Tue", status: "present", hours: "8h 02m" },
            { day: "Wed", status: "remote", hours: "7h 50m" },
            { day: "Thu", status: "present", hours: "8h 15m" },
            { day: "Fri", status: "today", hours: today.hours },
          ].map((d, idx) => (
            <div key={idx} className={"rounded-xl border p-2.5 text-center " + (statusStyles as any)[d.status]}>
              <p className="text-xs font-semibold">{d.day}</p>
              <p className="mt-1 text-[10px] font-medium opacity-80">{d.hours}</p>
            </div>
          ))}
        </div>
        {msg && <p className="mt-3 text-xs text-muted-foreground">{msg}</p>}
      </div>
    </Card>
  )
}
