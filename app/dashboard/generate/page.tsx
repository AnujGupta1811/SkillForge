// app/dashboard/generate/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { ProjectContextBar } from '@/components/project-context-bar'
import { TechStackInput } from '@/components/tech-stack-input'
import { FeatureList, type Feature } from '@/components/feature-list'

export default function GenerateProjectPage() {
    const router = useRouter()

    const [problem, setProblem] = useState<any>(null)
    const [context, setContext] = useState<any>(null)
    const [project, setProject] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [publishing, setPublishing] = useState(false)
    const [error, setError] = useState('')

    // Load selected problem from sessionStorage
    useEffect(() => {
        const p = sessionStorage.getItem('selectedProblem')
        const c = sessionStorage.getItem('searchContext')
        if (!p) { router.push('/dashboard/problems'); return }
        setProblem(JSON.parse(p))
        if (c) setContext(JSON.parse(c))
    }, [])

    // Auto-generate on page load once problem is set
    useEffect(() => {
        if (problem) handleGenerate()
    }, [problem])

    async function handleGenerate() {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/generate-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problem,
                    skill: context?.skill,
                    difficulty: context?.difficulty,
                }),
            })
            const data = await res.json()
            setProject(data.project)
        } catch (e) {
            setError('Generation failed. Try again.')
        }
        setLoading(false)
    }

    async function handlePublish() {
        setPublishing(true)
        try {
            const res = await fetch('/api/publish-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...project,
                    problem_id: null,
                }),
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Publish failed. Try again.')
                setPublishing(false)
                return
            }

            // Clear sessionStorage
            sessionStorage.removeItem('selectedProblem')
            sessionStorage.removeItem('problems')
            sessionStorage.removeItem('searchContext')

            router.push(`/dashboard/workspace/${data.project_id}`)
        } catch (e) {
            setError('Publish failed. Try again.')
        }
        setPublishing(false)
    }

    // Editable handlers
    function updateFeatureTitle(index: number, title: string) {
        setProject((prev: any) => {
            const features = [...prev.features]
            features[index] = { ...features[index], title }
            return { ...prev, features }
        })
    }

    function updateFeatureDescription(index: number, description: string) {
        setProject((prev: any) => {
            const features = [...prev.features]
            features[index] = { ...features[index], description }
            return { ...prev, features }
        })
    }

    function addFeature() {
        setProject((prev: any) => ({
            ...prev,
            features: [...prev.features, { id: `f${Date.now()}`, title: 'New Feature', description: '' }]
        }))
    }

    function deleteFeature(index: number) {
        setProject((prev: any) => ({
            ...prev,
            features: prev.features.filter((_: any, i: number) => i !== index)
        }))
    }

    // Map project.features to the Feature[] shape the FeatureList component expects
    const mappedFeatures: Feature[] = (project?.features ?? []).map((f: any, i: number) => ({
        id: f.id ?? `feat-${i}`,
        type: f.type ?? 'Feature',
        name: f.title ?? f.name ?? '',
        description: f.description ?? '',
    }))

    // When FeatureList fires onChange, sync back to project state
    function handleFeaturesChange(updatedFeatures: Feature[]) {
        setProject((prev: any) => ({
            ...prev,
            features: updatedFeatures.map((f) => ({
                id: f.id,
                type: f.type,
                title: f.name,
                name: f.name,
                description: f.description,
            })),
        }))
    }

    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar activeHref="/dashboard/intake" />

            <main className="flex-1 overflow-x-hidden">
                <div className="mx-auto max-w-3xl px-4 py-8 pb-32 sm:px-6 sm:py-10">
                    {/* Selected problem context banner */}
                    <ProjectContextBar
                        title={problem?.title ?? 'Loading…'}
                        source={problem?.source ?? ''}
                        difficulty={context?.difficulty ?? ''}
                    />

                    {/* Page heading */}
                    <div className="mt-8">
                        <h1 className="text-2xl font-bold text-[#0f172a] text-balance sm:text-3xl">
                            Your AI-generated project idea
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-[#64748b] text-pretty">
                            Review and edit anything below, then publish your project to the board.
                        </p>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Loading skeleton */}
                    {loading && (
                        <div className="mt-6 animate-pulse space-y-6 rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm sm:p-8">
                            <div className="space-y-3">
                                <div className="h-4 w-24 rounded bg-[#e2e8f0]" />
                                <div className="h-10 w-full rounded-md bg-[#e2e8f0]" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 w-20 rounded bg-[#e2e8f0]" />
                                <div className="h-10 w-full rounded-md bg-[#e2e8f0]" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 w-32 rounded bg-[#e2e8f0]" />
                                <div className="h-20 w-full rounded-md bg-[#e2e8f0]" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 w-20 rounded bg-[#e2e8f0]" />
                                <div className="flex gap-2">
                                    <div className="h-8 w-16 rounded-full bg-[#e2e8f0]" />
                                    <div className="h-8 w-20 rounded-full bg-[#e2e8f0]" />
                                    <div className="h-8 w-14 rounded-full bg-[#e2e8f0]" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 w-16 rounded bg-[#e2e8f0]" />
                                <div className="space-y-2">
                                    <div className="h-14 w-full rounded-lg bg-[#e2e8f0]" />
                                    <div className="h-14 w-full rounded-lg bg-[#e2e8f0]" />
                                    <div className="h-14 w-full rounded-lg bg-[#e2e8f0]" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Generated project card — only show when we have data and not loading */}
                    {!loading && project && (
                        <div className="mt-6 rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm sm:p-8">
                            <div className="space-y-8">
                                {/* Project name */}
                                <div>
                                    <label htmlFor="project-name" className="block text-sm font-medium text-[#0f172a]">
                                        Project name
                                    </label>
                                    <input
                                        id="project-name"
                                        value={project.name ?? ''}
                                        onChange={(e) => setProject((prev: any) => ({ ...prev, name: e.target.value }))}
                                        className="mt-2 w-full rounded-md border border-[#e2e8f0] bg-white px-3 py-2 text-sm font-medium text-[#0f172a] outline-none ring-[#7c3aed]/20 placeholder:text-[#94a3b8] focus:border-[#7c3aed] focus:ring-2"
                                    />
                                </div>

                                {/* One-line pitch */}
                                <div>
                                    <label htmlFor="pitch" className="block text-sm font-medium text-[#0f172a]">
                                        One-line pitch
                                    </label>
                                    <input
                                        id="pitch"
                                        value={project.pitch ?? ''}
                                        onChange={(e) => setProject((prev: any) => ({ ...prev, pitch: e.target.value }))}
                                        className="mt-2 w-full rounded-md border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] outline-none ring-[#7c3aed]/20 placeholder:text-[#94a3b8] focus:border-[#7c3aed] focus:ring-2"
                                    />
                                    <p className="mt-1.5 text-xs leading-5 text-[#64748b]">
                                        This is what other engineers see on the project board.
                                    </p>
                                </div>

                                {/* Problem it solves */}
                                <div>
                                    <label htmlFor="problem" className="block text-sm font-medium text-[#0f172a]">
                                        Problem it solves
                                    </label>
                                    <textarea
                                        id="problem"
                                        value={project.problem ?? ''}
                                        onChange={(e) => setProject((prev: any) => ({ ...prev, problem: e.target.value }))}
                                        rows={3}
                                        className="mt-2 w-full resize-none rounded-md border border-[#e2e8f0] bg-white px-3 py-2 text-sm leading-6 text-[#0f172a] outline-none ring-[#7c3aed]/20 placeholder:text-[#94a3b8] focus:border-[#7c3aed] focus:ring-2"
                                    />
                                </div>

                                {/* Tech stack */}
                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a]">Tech stack</label>
                                    <div className="mt-2">
                                        <TechStackInput
                                            value={project.tech_stack ?? []}
                                            onChange={(newStack: string[]) => setProject((prev: any) => ({ ...prev, tech_stack: newStack }))}
                                        />
                                    </div>
                                </div>

                                {/* Features */}
                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a]">Features</label>
                                    <p className="mt-1 mb-3 text-xs leading-5 text-[#64748b]">
                                        These become the tasks contributors can pick up. You can add, edit, or remove them.
                                    </p>
                                    <FeatureList features={mappedFeatures} onChange={handleFeaturesChange} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky bottom action bar */}
                <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e2e8f0] bg-white/95 backdrop-blur md:left-64">
                    <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
                        <div className="text-sm">
                            <p className="font-medium text-[#0f172a]">
                                {project?.features?.length ?? 0} {(project?.features?.length ?? 0) === 1 ? 'feature' : 'features'}
                            </p>
                            <p className="text-xs text-[#64748b]">You&apos;ll be set as Lead Engineer</p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <button
                                type="button"
                                onClick={handleGenerate}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#7c3aed] bg-white px-4 py-2 text-sm font-medium text-[#7c3aed] transition-colors hover:bg-[#faf5ff] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                {loading ? 'Regenerating…' : 'Regenerate idea'}
                            </button>
                            <button
                                type="button"
                                onClick={handlePublish}
                                disabled={publishing || loading || !project}
                                className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {publishing ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Publishing…
                                    </>
                                ) : (
                                    `Publish to board (${project?.features?.length ?? 0}) →`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
