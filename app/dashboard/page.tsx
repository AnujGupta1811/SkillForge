// app/dashboard/page.tsx
import { TrendingUp, Zap, FolderOpen, CheckSquare, Flame } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { StatCard } from "@/components/stat-card"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { PointsHistory } from "@/components/points-history"
import { ProjectTimeline } from "@/components/project-timeline"

const skillTags = [
  { name: "Node.js", bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]" },
  { name: "Redis", bg: "bg-[#ede9fe]", text: "text-[#6d28d9]" },
  { name: "System Design", bg: "bg-[#ffedd5]", text: "text-[#c2410c]" },
  { name: "Backend", bg: "bg-[#ede9fe]", text: "text-[#6d28d9]" },
  { name: "PostgreSQL", bg: "bg-[#dcfce7]", text: "text-[#15803d]" },
  { name: "API Design", bg: "bg-[#ccfbf1]", text: "text-[#0f766e]" },
  { name: "Docker", bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]" },
  { name: "Express", bg: "bg-[#f1f5f9]", text: "text-[#475569]" },
]

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeHref="/dashboard" />

      <div className="flex flex-1 flex-col">
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-5xl">
          {/* Section 1: Engineer Profile Header */}
          <section className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ede9fe] text-xl font-bold text-[#7c3aed]">
                AK
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a]">
                  Arjun Kapoor
                </h1>
                <p className="text-sm text-[#64748b]">
                  Bench Engineer · Infosys ·{" "}
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-[#15803d]" />
                    <span className="text-[#15803d]">Active</span>
                  </span>
                </p>
                <p className="text-xs text-[#64748b]">
                  Member since January 2026
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-4xl font-bold text-[#7c3aed]">340</p>
              <p className="text-sm text-[#64748b]">points</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-[#64748b] sm:justify-end">
                <TrendingUp className="h-3 w-3 text-[#15803d]" />
                Top 18% of engineers
              </p>
            </div>
          </section>

          {/* Section 2: Stat Cards Row */}
          <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              value={7}
              label="Problems solved"
              icon={Zap}
              iconColor="text-[#7c3aed]"
            />
            <StatCard
              value={2}
              label="Projects created"
              icon={FolderOpen}
              iconColor="text-[#7c3aed]"
            />
            <StatCard
              value={5}
              label="Features built"
              icon={CheckSquare}
              iconColor="text-[#7c3aed]"
            />
            <StatCard
              value={14}
              label="Day streak"
              icon={Flame}
              iconColor="text-[#f59e0b]"
              valueColor="text-[#f59e0b]"
            />
          </section>

          {/* Section 3: Activity Heatmap */}
          <section className="mb-8 rounded-xl border border-[#e2e8f0] bg-white p-6">
            <ActivityHeatmap />
          </section>

          {/* Section 4: Skill Tags */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-[#0f172a]">
              Skills demonstrated
            </h3>
            <p className="mb-4 text-sm text-[#64748b]">
              Based on projects and features you have worked on.
            </p>
            <div className="flex flex-wrap gap-2">
              {skillTags.map((tag) => (
                <span
                  key={tag.name}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tag.bg} ${tag.text}`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </section>

          {/* Section 5: Points Breakdown */}
          <section className="mb-8 rounded-xl border border-[#e2e8f0] bg-white p-6">
            <PointsHistory />
          </section>

          {/* Section 6: Project Timeline */}
          <section className="mb-8">
            <ProjectTimeline />
          </section>
          </div>
        </main>
      </div>
    </div>
  )
}
