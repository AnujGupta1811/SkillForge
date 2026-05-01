// components/activity-heatmap.tsx
"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ActivityDay {
  date: string  // 'YYYY-MM-DD'
  count: number
}

interface ActivityHeatmapProps {
  activity?: ActivityDay[]
}

function getColorClass(count: number): string {
  if (count === 0) return "bg-gray-100"
  if (count === 1) return "bg-violet-200"
  if (count <= 3) return "bg-violet-400"
  return "bg-violet-600"
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function ActivityHeatmap({ activity = [] }: ActivityHeatmapProps) {
  const activeDays = activity.filter((d) => d.count > 0).length

  // Ensure we always show exactly 90 days
  const days: ActivityDay[] = activity.length === 90
    ? activity
    : Array.from({ length: 90 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (89 - i))
        const key = d.toISOString().slice(0, 10)
        const found = activity.find((a) => a.date === key)
        return found ?? { date: key, count: 0 }
      })

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#0f172a]">
        Activity — last 90 days
      </h3>

      <TooltipProvider delayDuration={100}>
        <div className="overflow-x-auto pb-2">
          <div
            className="grid gap-[3px]"
            style={{
              gridTemplateRows: "repeat(7, 12px)",
              gridTemplateColumns: `repeat(${Math.ceil(90 / 7)}, 12px)`,
              gridAutoFlow: "column",
            }}
          >
            {days.map((day) => (
              <Tooltip key={day.date}>
                <TooltipTrigger asChild>
                  <div
                    className={`h-[12px] w-[12px] rounded-sm ${getColorClass(day.count)} cursor-pointer transition-transform hover:scale-110`}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>
                    {formatDate(day.date)} — {day.count === 0 ? "No activity" : `${day.count} event${day.count > 1 ? "s" : ""}`}
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
        <div className="flex gap-[3px]">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-[12px] w-[12px] rounded-sm ${getColorClass(level)}`}
            />
          ))}
        </div>
        <span>More</span>
      </div>

      <p className="text-sm text-[#64748b]">
        {activeDays} active day{activeDays !== 1 ? "s" : ""} in the last 90 days
      </p>
    </div>
  )
}
