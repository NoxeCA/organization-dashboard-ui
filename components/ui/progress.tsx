"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string
}

function Progress({
  className,
  value,
  indicatorClassName,
  style,
  ...props
}: ProgressProps) {
  // Support custom color via CSS variable --progress-foreground
  const indicatorStyle: React.CSSProperties = {
    transform: `translateX(-${100 - (value || 0)}%)`,
    ...(style?.['--progress-foreground' as keyof React.CSSProperties]
      ? { backgroundColor: style['--progress-foreground' as keyof React.CSSProperties] as string }
      : {}
    ),
  }

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      style={style}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn("bg-primary h-full w-full flex-1 transition-all", indicatorClassName)}
        style={indicatorStyle}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
