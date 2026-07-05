import { useState, useEffect, useRef } from "react"
import { Clock, LogIn, LogOut } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { checkIn, checkOut, getAuthToken, API_BASE } from "@/lib/api"

function formatHours(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}h ${m.toString().padStart(2, "0")}m`
}

export function AttendanceWidget() {
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkedOut, setCheckedOut] = useState(false)
  const [checkInTime, setCheckInTime] = useState<number | null>(null)
  const [checkOutTime, setCheckOutTime] = useState<number | null>(null)
  const [hours, setHours] = useState("0h 00m")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadToday() {
      try {
        const token = getAuthToken()
        if (!token) { setInitialLoading(false); return }
        const res = await fetch(`${API_BASE}/api/attendance/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const records: { date: string; check_in: string | null; check_out: string | null; status: string }[] = await res.json()
          const todayStr = new Date().toISOString().slice(0, 10)
          const today = records.find((r) => r.date === todayStr)
          if (today && today.check_in) {
            setCheckedIn(true)
            const ci = new Date(today.check_in).getTime()
            setCheckInTime(ci)
            if (today.check_out) {
              const co = new Date(today.check_out).getTime()
              setCheckedOut(true)
              setCheckOutTime(co)
              setHours(formatHours(co - ci))
            } else {
              setHours(formatHours(Date.now() - ci))
            }
          }
        }
      } catch { /* ignore */ }
      if (!cancelled) setInitialLoading(false)
    }
    loadToday()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (checkedIn && !checkedOut && checkInTime) {
      timerRef.current = setInterval(() => {
        setHours(formatHours(Date.now() - checkInTime))
      }, 30000)
      return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }
  }, [checkedIn, checkedOut, checkInTime])

  async function doCheckIn() {
    setLoading(true)
    setMsg(null)
    try {
      await checkIn()
      const now = Date.now()
      setCheckedIn(true)
      setCheckInTime(now)
      setCheckedOut(false)
      setCheckOutTime(null)
      setHours("0h 01m")
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
      const now = Date.now()
      setCheckedOut(true)
      setCheckOutTime(now)
      if (checkInTime) {
        setHours(formatHours(now - checkInTime))
      }
      setMsg("Checked out")
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Check-out failed")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) return (
    <Card hover className="h-full">
      <CardHeader title="Attendance" subtitle="Today" />
      <div className="p-5 text-center text-sm text-muted-foreground">Loading...</div>
    </Card>
  )

  const showCheckIn = !checkedIn || checkedOut

  return (
    <Card hover className="h-full">
      <CardHeader
        title="Attendance"
        subtitle="Today"
        action={
          showCheckIn ? (
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
              {checkedOut ? "Checked out today" : checkedIn ? "Checked in today" : "Not checked in yet"}
            </p>
            <p className="text-lg font-semibold text-foreground">
              {checkedIn ? (checkedOut ? "Done" : "Working") : "—"} · {hours}
            </p>
          </div>
        </div>
        {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
      </div>
    </Card>
  )
}
