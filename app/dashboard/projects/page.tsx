// app/dashboard/projects/page.tsx
"use client"

import { Sidebar } from "@/components/sidebar"
import { ProjectTimeline } from "@/components/project-timeline"

export default function MyProjectsPage() {
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
              <ProjectTimeline hideHeader={true} />
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
