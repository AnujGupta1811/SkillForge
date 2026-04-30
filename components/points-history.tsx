// components/points-history.tsx
import { CheckSquare, FolderOpen, Zap, Star, type LucideIcon } from "lucide-react"

interface PointEvent {
  icon: LucideIcon
  iconColor: string
  event: string
  project: string
  points: string
  date: string
}

const pointEvents: PointEvent[] = [
  {
    icon: CheckSquare,
    iconColor: "text-[#15803d]",
    event: "Feature completed — Token bucket algorithm",
    project: "RateMaster",
    points: "+20",
    date: "2 days ago",
  },
  {
    icon: CheckSquare,
    iconColor: "text-[#15803d]",
    event: "Feature completed — Redis integration",
    project: "RateMaster",
    points: "+20",
    date: "4 days ago",
  },
  {
    icon: FolderOpen,
    iconColor: "text-[#7c3aed]",
    event: "Project published",
    project: "RateMaster",
    points: "+25",
    date: "6 days ago",
  },
  {
    icon: Zap,
    iconColor: "text-[#7c3aed]",
    event: "Problem solved",
    project: "—",
    points: "+10",
    date: "6 days ago",
  },
  {
    icon: Zap,
    iconColor: "text-[#7c3aed]",
    event: "Problem solved",
    project: "—",
    points: "+10",
    date: "8 days ago",
  },
  {
    icon: Star,
    iconColor: "text-[#f59e0b]",
    event: "Project completed",
    project: "FlowQueue",
    points: "+50",
    date: "12 days ago",
  },
]

export function PointsHistory() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[#0f172a]">Points history</h3>
        <p className="text-sm text-[#64748b]">
          How you earned your 340 points.
        </p>
      </div>

      <div className="divide-y divide-[#e2e8f0]">
        {pointEvents.map((event, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-4 first:pt-0"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg bg-[#f8fafc] ${event.iconColor}`}
              >
                <event.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0f172a]">
                  {event.event}
                </p>
                <p className="text-xs text-[#64748b]">{event.project}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[#15803d]">{event.points}</p>
              <p className="text-xs text-[#64748b]">{event.date}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#e2e8f0] pt-4 text-right">
        <p className="text-sm font-bold text-[#7c3aed]">Total: 340 points</p>
      </div>
    </div>
  )
}
