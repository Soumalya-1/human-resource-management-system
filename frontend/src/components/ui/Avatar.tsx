import { useState } from "react"
import { cn } from "@/lib/utils"

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-2xl",
}

// Deterministic pastel background based on the name.
const palette = [
  "bg-indigo-100 text-indigo-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
]

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string | null
  name: string
  size?: keyof typeof sizes
  className?: string
}) {
  const [imgError, setImgError] = useState(false)
  const colorIndex = name.charCodeAt(0) % palette.length

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={cn(
          "shrink-0 rounded-full object-cover ring-2 ring-card",
          sizes[size],
          className,
        )}
      />
    )
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-card",
        sizes[size],
        palette[colorIndex],
        className,
      )}
      aria-label={name}
      role="img"
    >
      {initials(name)}
    </span>
  )
}
