// components/manager-stat-cards.tsx
"use client"

import { Users, Activity, FolderOpen, AlertCircle } from "lucide-react"

interface StatCard {
  value: string
  label: string
  icon: React.ElementType
  iconColor: string
  valueColor?: string
}

const stats: StatCard[] = [
  {
    value: "12",
    label: "Engineers on bench",
    icon: Users,
    iconColor: "text-[#7c3aed]",
  },
  {
    value: "8",
    label: "Active this week",
    icon: Activity,
    iconColor: "text-[#15803d]",
    valueColor: "text-[#15803d]",
  },
  {
    value: "5",
    label: "Projects in progress",
    icon: FolderOpen,
    iconColor: "text-[#7c3aed]",
  },
  {
    value: "3",
    label: "Inactive 7+ days",
    icon: AlertCircle,
    iconColor: "text-[#b91c1c]",
    valueColor: "text-[#b91c1c]",
  },
]

export function ManagerStatCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl bg-[#f8fafc] p-5"
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
