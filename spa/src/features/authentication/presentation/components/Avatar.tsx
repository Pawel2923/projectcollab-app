import { PrimitiveAvatar, AvatarFallback, AvatarImage } from "@/shared/ui"
import { cn } from "@/shared/lib/utils"

export interface AvatarProps {
  initials: string
  size: "small" | "medium" | "large"
  ariaLabel?: string
  isCircle?: boolean
  className?: string
  src?: string
  onClick?: () => void
}

export function Avatar({
  initials,
  size,
  ariaLabel,
  isCircle = true,
  className,
  src,
  onClick,
}: AvatarProps) {
  const sizeClass =
    size === "small"
      ? "h-6 w-6 text-xs"
      : size === "large"
        ? "h-10 w-10 text-sm"
        : "h-8 w-8 text-sm"

  const rounding = isCircle ? "rounded-full" : "rounded-lg"

  return (
    <PrimitiveAvatar
      className={cn(sizeClass, rounding, className)}
      onClick={onClick}
    >
      <AvatarImage src={src} alt={ariaLabel || `Avatar ${initials}`} />
      <AvatarFallback
        className="flex items-center justify-center bg-primary font-medium text-primary-foreground"
        aria-label={ariaLabel || `Avatar ${initials}`}
      >
        {initials}
      </AvatarFallback>
    </PrimitiveAvatar>
  )
}
