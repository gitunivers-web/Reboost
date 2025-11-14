"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-md bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-gradient-to-r from-[#0059ff] to-[#1e7fff] transition-all duration-[600ms] ease-out relative"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    >
      <div 
        className="absolute top-0 left-0 h-full w-[30%] bg-gradient-to-r from-transparent via-white/80 to-transparent animate-progress-glow"
        style={{ 
          animationDuration: '2.2s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'linear'
        }}
      />
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
