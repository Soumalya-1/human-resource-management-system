import { cn } from "@/lib/utils"

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-soft)]">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <path
            d="M4 17c2.5-3 5-4.5 8-4.5S17.5 14 20 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="7" r="3.2" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      {showText && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Nimbus<span className="text-primary">HR</span>
        </span>
      )}
    </div>
  )
}
