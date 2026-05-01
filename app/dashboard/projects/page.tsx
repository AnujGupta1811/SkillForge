// app/dashboard/projects/page.tsx
"use client"

import { useEffect, useState } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { ProjectTimeline, type ProjectRow } from "@/components/project-timeline"

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${className}`} />
}

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/dashboard")
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
      const data = await res.json()
      setProjects(data.projects ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeHref="/dashboard/projects" />

      <div className="flex flex-1 flex-col">
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-5xl">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-[#0f172a] sm:text-3xl">
                My Projects
              </h1>
              <p className="text-sm text-[#64748b]">
                Manage and track the progress of your active and completed projects.
              </p>
            </header>

            <section className="mb-8">
              {loading && (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonBlock key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              )}

              {!loading && error && (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                  <AlertCircle className="h-10 w-10 text-red-400" />
                  <p className="text-sm text-[#64748b]">{error}</p>
                  <button
                    onClick={load}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9]"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && (
                <ProjectTimeline projects={projects} hideHeader={true} />
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
