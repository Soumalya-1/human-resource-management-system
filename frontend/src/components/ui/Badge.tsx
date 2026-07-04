import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Tone = "primary" | "success" | "warning" | "danger" | "neutral" | "accent"

const tones: Record<Tone, string> = {
  primary: "bg-[var(--color-primary-soft)] text-primary",
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  danger: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
  accent: "bg-sky-100 text-[var(--color-accent)]",
  neutral: "bg-muted text-muted-foreground",
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
