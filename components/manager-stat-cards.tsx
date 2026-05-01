import { Users, Activity, FolderOpen, AlertCircle } from "lucide-react"

interface StatCard {
  value: string | number
  label: string
  icon: React.ElementType
  iconColor: string
  valueColor?: string
}

interface ManagerStatCardsProps {
  stats: {
    total_engineers: number
    total_projects: number
    total_features_completed: number
    avg_points: number
  } | null
  isLoading?: boolean
}

export function ManagerStatCards({ stats, isLoading }: ManagerStatCardsProps) {
  const cards: StatCard[] = [
    {
      value: isLoading ? "..." : stats?.total_engineers || 0,
      label: "Total Engineers",
      icon: Users,
      iconColor: "text-[#7c3aed]",
    },
    {
      value: isLoading ? "..." : stats?.total_projects || 0,
      label: "Active Projects",
      icon: FolderOpen,
      iconColor: "text-[#7c3aed]",
    },
    {
      value: isLoading ? "..." : stats?.total_features_completed || 0,
      label: "Features Completed",
      icon: Activity,
      iconColor: "text-[#15803d]",
      valueColor: "text-[#15803d]",
    },
    {
      value: isLoading ? "..." : stats?.avg_points || 0,
      label: "Avg Points",
      icon: AlertCircle,
      iconColor: "text-[#b45309]",
      valueColor: "text-[#b45309]",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl bg-[#f8fafc] p-5 border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${stat.valueColor || "text-[#0f172a]"}`}>
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-[#64748b]">{stat.label}</p>
            </div>
            <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
          </div>
        </div>
      ))}
    </div>
  )
}
