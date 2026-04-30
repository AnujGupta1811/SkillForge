// components/activity-heatmap.tsx
"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const activityData = [
  0, 0, 1, 0, 2, 1, 0, 0, 1, 2, 3, 2, 1, 0, 0, 1, 2, 3, 4, 3, 2, 1,
  1, 2, 3, 2, 1, 0, 0, 1, 1, 2, 2, 1, 0, 0, 1, 2, 3, 3, 2, 1, 0, 0,
  0, 1, 2, 3, 4, 3, 2, 1, 1, 1, 2, 1, 0, 0, 0, 1, 2, 2, 1, 0, 1, 2,
  3, 2, 1, 0, 0, 1, 1, 2, 3, 2, 1, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 1, 0, 0,
]

const activityColors: Record<number, string> = {
  0: "bg-[#f1f5f9]",
  1: "bg-[#ddd6fe]",
  2: "bg-[#a78bfa]",
  3: "bg-[#7c3aed]",
  4: "bg-[#5b21b6]",
}

const activityLabels: Record<number, string> = {
  0: "No activity",
  1: "Low activity",
  2: "Medium activity",
  3: "High activity",
  4: "Max activity",
}

export function ActivityHeatmap() {
  const activeDays = activityData.filter((v) => v > 0).length

  // Generate dates for the last 90 days
  const getDayLabel = (index: number) => {
    const date = new Date()
    date.setDate(date.getDate() - (89 - index))
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#0f172a]">
        Activity — last 90 days
      </h3>

      <TooltipProvider delayDuration={100}>
        <div className="overflow-x-auto pb-2">
          <div
            className="grid gap-[2px]"
            style={{
              gridTemplateColumns: "repeat(13, 10px)",
              gridTemplateRows: "repeat(7, 10px)",
            }}
          >
            {activityData.map((level, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div
                    className={`h-[10px] w-[10px] rounded-[2px] ${activityColors[level]} cursor-pointer transition-transform hover:scale-110`}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>
                    {activityLabels[level]} on {getDayLabel(index)}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </TooltipProvider>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-[#64748b]">
        <span>Less</span>
        <div className="flex gap-[2px]">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-[10px] w-[10px] rounded-[2px] ${activityColors[level]}`}
            />
          ))}
        </div>
        <span>More</span>
      </div>

      <p className="text-sm text-[#64748b]">
        {activeDays} active days in the last 90 days
      </p>
    </div>
  )
}
