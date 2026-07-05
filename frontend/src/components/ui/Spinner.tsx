import { Loader2 } from "lucide-react"

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  )
}
