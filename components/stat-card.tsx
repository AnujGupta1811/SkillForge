// components/stat-card.tsx
import { type LucideIcon } from "lucide-react"

interface StatCardProps {
  value: string | number
  label: string
  icon: LucideIcon
  iconColor?: string
  valueColor?: string
}

export function StatCard({
  value,
  label,
  icon: Icon,
  iconColor = "text-[#7c3aed]",
  valueColor = "text-[#0f172a]",
}: StatCardProps) {
  return (
    <div className="rounded-xl bg-[#f8fafc] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
          <p className="mt-1 text-sm text-[#64748b]">{label}</p>
        </div>
        <div className={`rounded-lg bg-white p-2 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
