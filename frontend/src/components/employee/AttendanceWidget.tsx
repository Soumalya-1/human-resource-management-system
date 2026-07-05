import { useState } from "react"
import { Clock, LogIn, LogOut } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { checkIn, checkOut } from "@/lib/api"

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
      setMsg("Checked in")
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Check-in failed")
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
      setMsg("Checked out")
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Check-out failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card hover className="h-full">
      <CardHeader
        title="Attendance"
        subtitle="Today"
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
              {today.checkedIn ? "Checked in today" : "Not checked in yet"}
            </p>
            <p className="text-lg font-semibold text-foreground">
              {today.checkedIn ? "Just now" : "—"} · {today.hours}
            </p>
          </div>
        </div>
        {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
      </div>
    </Card>
  )
}
