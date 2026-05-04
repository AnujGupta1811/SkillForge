// app/dashboard/page.tsx
"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  TrendingUp,
  FolderOpen,
  CheckSquare,
  GitMerge,
  Trophy,
  Zap,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { StatCard } from "@/components/stat-card"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { PointsHistory, type PointEventRow } from "@/components/points-history"
import { ProjectTimeline, type ProjectRow } from "@/components/project-timeline"
import { Avatar } from "@/components/avatar"

// ── Types ──────────────────────────────────────────────────────────────────────

interface DashboardData {
  profile: {
    id: string
    full_name: string
    avatar_url: string | null
    email: string
    points: number
    role: string
    company_domain: string
  }
  stats: {
    projects_created: number
    features_completed: number
    contributions_approved: number
    points_this_month: number
  }
  rank: {
    percentile: number
    rank_number: number
    total_engineers: number
  }
  skill_tags: string[]
  point_events: PointEventRow[]
  projects: ProjectRow[]
  activity: { date: string; count: number }[]
}

// ── Skeleton helpers ───────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${className}`} />
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Profile header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <SkeletonBlock className="h-6 w-40" />
            <SkeletonBlock className="h-4 w-56" />
            <SkeletonBlock className="h-3 w-32" />
          </div>
        </div>
        <div className="space-y-2 text-right">
          <SkeletonBlock className="ml-auto h-10 w-20" />
          <SkeletonBlock className="ml-auto h-4 w-28" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonBlock key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Heatmap */}
      <SkeletonBlock className="h-48 rounded-xl" />

      {/* Skill tags */}
      <div className="space-y-3">
        <SkeletonBlock className="h-5 w-40" />
        <div className="flex flex-wrap gap-2">
          {[...Array(6)].map((_, i) => (
            <SkeletonBlock key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* Points history */}
      <SkeletonBlock className="h-72 rounded-xl" />

      {/* Projects */}
      <div className="space-y-3">
        <SkeletonBlock className="h-5 w-32" />
        {[...Array(3)].map((_, i) => (
          <SkeletonBlock key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// ── Main Page Content ──────────────────────────────────────────────────────────

function DashboardContent() {
  const searchParams = useSearchParams()
  const userIdParam = searchParams.get("userId")
  
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showKeyBanner, setShowKeyBanner] = useState(false)

  async function loadDashboard() {
    setLoading(true)
    setError(null)
    try {
      // Load dashboard data
      const url = userIdParam ? `/api/dashboard?userId=${userIdParam}` : "/api/dashboard"
      const res = await fetch(url)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
      const json: DashboardData = await res.json()
      setData(json)

      // Check if API key is missing
      if (!userIdParam) {
        const keyRes = await fetch('/api/user/api-key')
        const keyData = await keyRes.json()
        if (keyData.has_key === false) {
          setShowKeyBanner(true)
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [userIdParam])

  return (
    <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
      {loading && <DashboardSkeleton />}

      {!loading && error && (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <h2 className="text-lg font-semibold text-[#0f172a]">
            Something went wrong
          </h2>
          <p className="text-sm text-[#64748b]">{error}</p>
          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9]"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="mx-auto max-w-5xl">
          {/* API Key Missing Banner */}
          {showKeyBanner && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-amber-500 text-xl">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-amber-900">API Key Missing</p>
                  <p className="text-xs text-amber-700">
                    Add your Anthropic API key in Settings to unlock AI features
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href="/dashboard/settings"
                   className="bg-amber-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-amber-600">
                  Add Key
                </a>
                <button 
                  onClick={() => setShowKeyBanner(false)}
                  className="text-amber-500 hover:text-amber-700 text-sm px-2">
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* ── Section 1: Profile Header ────────────────────────────────── */}
          <section className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                url={data.profile.avatar_url}
                name={data.profile.full_name}
                size="lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a]">
                  {data.profile.full_name}
                </h1>
                <p className="text-sm text-[#64748b]">
                  {data.profile.role} · {data.profile.company_domain}
                </p>
                <p className="mt-1 text-xs text-[#64748b]">
                  Rank #{data.rank.rank_number} of {data.rank.total_engineers} engineers
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#7c3aed]" />
                <p className="text-4xl font-bold text-[#7c3aed]">
                  {data.profile.points}
                </p>
              </div>
              <p className="text-sm text-[#64748b]">points</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#ede9fe] px-2.5 py-0.5 text-xs font-medium text-[#7c3aed]">
                  Top {100 - data.rank.percentile}%
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[#64748b]">
                  <TrendingUp className="h-3 w-3 text-[#15803d]" />
                  {data.rank.percentile}th percentile
                </span>
              </div>
            </div>
          </section>

          {/* ── Section 2: Stat Cards ────────────────────────────────────── */}
          <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              value={data.stats.projects_created}
              label="Projects created"
              icon={FolderOpen}
              iconColor="text-[#7c3aed]"
            />
            <StatCard
              value={data.stats.features_completed}
              label="Features completed"
              icon={CheckSquare}
              iconColor="text-[#7c3aed]"
            />
            <StatCard
              value={data.stats.contributions_approved}
              label="Contributions approved"
              icon={GitMerge}
              iconColor="text-[#7c3aed]"
            />
            <StatCard
              value={data.stats.points_this_month}
              label="Points this month"
              icon={Zap}
              iconColor="text-[#f59e0b]"
              valueColor="text-[#f59e0b]"
            />
          </section>

          {/* ── Section 3: Activity Heatmap ──────────────────────────────── */}
          <section className="mb-8 rounded-xl border border-[#e2e8f0] bg-white p-6">
            <ActivityHeatmap activity={data.activity} />
          </section>

          {/* ── Section 4: Skill Tags ────────────────────────────────────── */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-[#0f172a]">
              Skills demonstrated
            </h3>
            <p className="mb-4 text-sm text-[#64748b]">
              Based on projects and features you have worked on.
            </p>
            {data.skill_tags.length === 0 ? (
              <p className="text-sm text-[#64748b]">
                Complete features to earn skill tags
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.skill_tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-[#ede9fe] px-3 py-1.5 text-sm font-medium text-[#6d28d9]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* ── Section 5: Points History ────────────────────────────────── */}
          <section className="mb-8 rounded-xl border border-[#e2e8f0] bg-white p-6">
            <PointsHistory
              events={data.point_events}
              totalPoints={data.profile.points}
            />
          </section>

          {/* ── Section 6: Project Timeline ──────────────────────────────── */}
          <section className="mb-8">
            <ProjectTimeline projects={data.projects} />
          </section>
        </div>
      )}
    </main>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeHref="/dashboard" />
      <div className="flex flex-1 flex-col">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" /></div>}>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  )
}
