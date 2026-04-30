// app/dashboard/board/page.tsx
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, SearchX, Loader2 } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/project-card"
import { ContributeModal } from "@/components/contribute-modal"
import { FiltersBar, type BoardFilters, type SortOption } from "@/components/filters-bar"
import type { ProjectListItem } from "@/lib/types"

const DEFAULT_FILTERS: BoardFilters = {
  search: "",
  stack: "All stacks",
  sort: "newest" as SortOption,
}

function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#e2e8f0] bg-white p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="h-5 w-3/4 rounded bg-[#f1f5f9]" />
        <div className="h-5 w-16 rounded-full bg-[#f1f5f9]" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-[#f1f5f9]" />
        <div className="h-3 w-2/3 rounded bg-[#f1f5f9]" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-14 rounded-full bg-[#f1f5f9]" />
        <div className="h-5 w-16 rounded-full bg-[#f1f5f9]" />
        <div className="h-5 w-12 rounded-full bg-[#f1f5f9]" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-[#f1f5f9]" />
        <div className="h-1.5 w-full rounded bg-[#f1f5f9]" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-[#f1f5f9]" />
        <div className="h-3 w-24 rounded bg-[#f1f5f9]" />
      </div>
      <div className="border-t border-[#e2e8f0] pt-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <div className="h-7 w-7 rounded-full bg-[#f1f5f9]" />
            <div className="h-7 w-7 rounded-full bg-[#f1f5f9]" />
          </div>
          <div className="h-8 w-24 rounded bg-[#f1f5f9]" />
        </div>
      </div>
    </div>
  )
}

export default function BoardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<BoardFilters>(DEFAULT_FILTERS)
  const [selected, setSelected] = useState<ProjectListItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/projects")
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Derive unique tech stacks from projects
  const availableStacks = useMemo(() => {
    const stacks = new Set<string>()
    projects.forEach((p) => p.tech_stack.forEach((t) => stacks.add(t)))
    return Array.from(stacks).sort()
  }, [projects])

  // Client-side filtering and sorting
  const filtered = useMemo(() => {
    let result = projects.filter((p) => {
      const q = filters.search.trim().toLowerCase()
      if (q) {
        const haystack = `${p.name} ${p.pitch} ${p.tech_stack.join(" ")}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (filters.stack !== "All stacks" && !p.tech_stack.includes(filters.stack)) {
        return false
      }
      return true
    })

    // Sorting
    switch (filters.sort) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "most_contributors":
        result.sort((a, b) => b.contributors.length - a.contributors.length)
        break
      case "most_progress":
        result.sort((a, b) => {
          const pctA = a.feature_total > 0 ? a.feature_done / a.feature_total : 0
          const pctB = b.feature_total > 0 ? b.feature_done / b.feature_total : 0
          return pctB - pctA
        })
        break
    }

    return result
  }, [projects, filters])

  const handleView = (project: ProjectListItem) => {
    setSelected(project)
    setModalOpen(true)
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeHref="/dashboard/board" />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          {/* Header */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a]">Project board</h1>
              <p className="mt-1 text-sm text-[#64748b]">
                Browse open projects and contribute to features that match your skills.
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/intake")}
              className="bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Start a project
            </Button>
          </header>

          {/* Filters */}
          <div className="mt-6">
            <FiltersBar
              filters={filters}
              onChange={setFilters}
              availableStacks={availableStacks}
            />
            {!loading && (
              <p className="mt-3 text-xs text-[#64748b]">
                Showing {filtered.length} project{filtered.length === 1 ? "" : "s"}
              </p>
            )}
          </div>

          {/* Loading skeletons */}
          {loading ? (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            /* Empty state */
            <div className="mt-16 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e2e8f0] bg-white px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f5f9]">
                <SearchX className="h-6 w-6 text-[#64748b]" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-[#0f172a]">
                {projects.length === 0
                  ? "No projects yet"
                  : "No projects match your filters"}
              </h2>
              <p className="mt-1 max-w-sm text-sm text-[#64748b]">
                {projects.length === 0
                  ? "Be the first to start a project for your team."
                  : "Try adjusting your filters or start a new project."}
              </p>
              {projects.length === 0 ? (
                <Button
                  onClick={() => router.push("/dashboard/intake")}
                  className="mt-5 bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Start a project
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="mt-5 border-[#7c3aed] bg-white text-[#7c3aed] hover:bg-[#ede9fe] hover:text-[#7c3aed]"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            /* Project cards grid */
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project) => (
                <ProjectCard key={project.id} project={project} onView={handleView} />
              ))}
            </div>
          )}
        </div>
      </main>

      <ContributeModal project={selected} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
