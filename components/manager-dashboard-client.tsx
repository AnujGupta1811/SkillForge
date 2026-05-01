"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ManagerStatCards } from "@/components/manager-stat-cards"
import { ManagerFilters } from "@/components/manager-filters"
import { EngineerTable, type Engineer } from "@/components/engineer-table"
import { EngineerDrawer } from "@/components/engineer-drawer"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TeamStats {
    total_engineers: number
    total_projects: number
    total_features_completed: number
    avg_points: number
}

export function ManagerDashboardClient() {
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [engineers, setEngineers] = useState<Engineer[]>([])
    const [stats, setStats] = useState<TeamStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchTeam() {
            try {
                const res = await fetch('/api/manager/team')
                if (res.ok) {
                    const data = await res.json()
                    setEngineers(data.engineers || [])
                    setStats(data.stats || null)
                }
            } catch (e) {
                console.error("Failed to fetch team data", e)
            } finally {
                setIsLoading(false)
            }
        }
        fetchTeam()
    }, [])

    const filteredEngineers = engineers.filter((engineer) => {
        const query = searchQuery.toLowerCase()
        const matchesSearch = engineer.full_name?.toLowerCase().includes(query) || engineer.email?.toLowerCase().includes(query)
        const matchesRole = roleFilter === "all" || engineer.role === roleFilter
        return matchesSearch && matchesRole
    })

    const handleRowClick = (engineer: Engineer) => {
        setSelectedEngineer(engineer)
        setIsDrawerOpen(true)
    }

    const exportCsv = () => {
        const csv = [
            ['Name', 'Email', 'Role', 'Points', 'Features', 'Projects', 'Activity Score', 'Last Active'],
            ...filteredEngineers.map(e => [
                e.full_name,
                e.email,
                e.role,
                e.points || 0,
                e.features_completed || 0,
                e.projects_created || 0,
                e.activity_score || 0,
                e.last_active || 'Never'
            ])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `skillforge-team-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar activeHref="/dashboard/manager" />

            <div className="flex flex-1 flex-col">
                <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
                    <div className="mx-auto max-w-6xl space-y-8">
                        {/* Header */}
                        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold text-[#0f172a] sm:text-3xl">
                                    Engineering Manager Dashboard
                                </h1>
                                <p className="text-sm text-[#64748b]">
                                    Monitor your team's project contributions and activity.
                                </p>
                            </div>
                            <Button 
                                onClick={exportCsv}
                                variant="outline"
                                className="flex items-center gap-2"
                                disabled={isLoading || filteredEngineers.length === 0}
                            >
                                <Download className="h-4 w-4" />
                                Export CSV
                            </Button>
                        </header>

                        {/* Stats Section */}
                        <ManagerStatCards stats={stats} isLoading={isLoading} />

                        {/* Filters and Table Section */}
                        <div className="space-y-4">
                            <ManagerFilters
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                roleFilter={roleFilter}
                                onRoleChange={setRoleFilter}
                                resultCount={filteredEngineers.length}
                            />

                            {isLoading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-gray-100" />
                                    ))}
                                </div>
                            ) : filteredEngineers.length === 0 ? (
                                <div className="rounded-xl border border-[#e2e8f0] bg-white p-8 text-center text-slate-500">
                                    No engineers match your search
                                </div>
                            ) : (
                                <EngineerTable
                                    engineers={filteredEngineers}
                                    onRowClick={handleRowClick}
                                />
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <EngineerDrawer
                engineerId={selectedEngineer?.id || null}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
            />
        </div>
    )
}
