import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PresenceIndicatorProps {
  status: "online" | "away" | "offline";
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  tooltipText?: string;
  className?: string;
}

const sizeMap = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

const statusConfig = {
  online: {
    color: "bg-green-500",
    label: "En ligne",
    pulse: true,
  },
  away: {
    color: "bg-yellow-500",
    label: "Absent",
    pulse: false,
  },
  offline: {
    color: "bg-muted-foreground",
    label: "Hors ligne",
    pulse: false,
  },
};

export function PresenceIndicator({
  status,
  size = "md",
  showTooltip = true,
  tooltipText,
  className,
}: PresenceIndicatorProps) {
  const config = statusConfig[status];
  const displayText = tooltipText || config.label;

  const indicator = (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "rounded-full",
          sizeMap[size],
          config.color
        )}
        data-testid={`presence-${status}`}
      />
      {config.pulse && (
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full",
            config.color,
            "opacity-75"
          )}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.75, 0, 0.75],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );

  if (!showTooltip) {
    return indicator;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-block cursor-help">
          {indicator}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p data-testid="text-presence-tooltip">{displayText}</p>
      </TooltipContent>
    </Tooltip>
  );
}
