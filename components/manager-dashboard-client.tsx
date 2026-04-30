"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ManagerStatCards } from "@/components/manager-stat-cards"
import { ManagerFilters } from "@/components/manager-filters"
import { EngineerTable, type Engineer } from "@/components/engineer-table"
import { EngineerDrawer } from "@/components/engineer-drawer"

const mockEngineers: Engineer[] = [
    {
        name: "Arjun Kapoor",
        initials: "AK",
        status: "active",
        role: "lead",
        projects: "RateMaster",
        skills: ["Node.js", "Redis", "Backend"],
        activityScore: 340,
        lastActive: "Today",
    },
    {
        name: "Sanya Malhotra",
        initials: "SM",
        status: "active",
        role: "contributor",
        projects: "FlowQueue",
        skills: ["React", "TypeScript", "Frontend"],
        activityScore: 210,
        lastActive: "Today",
    },
    {
        name: "Rahul Verma",
        initials: "RV",
        status: "recent",
        role: "none",
        projects: "—",
        skills: ["Python", "PostgreSQL", "Backend"],
        activityScore: 120,
        lastActive: "Yesterday",
    },
    {
        name: "Priya Singh",
        initials: "PS",
        status: "active",
        role: "lead",
        projects: "SkillForge",
        skills: ["Next.js", "TypeScript", "PostgreSQL"],
        activityScore: 280,
        lastActive: "Today",
    },
    {
        name: "Vikram Mehta",
        initials: "VM",
        status: "inactive",
        role: "none",
        projects: "—",
        skills: ["Docker", "Node.js", "System Design"],
        activityScore: 45,
        lastActive: "9 days ago",
    },
]

export function ManagerDashboardClient() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [roleFilter, setRoleFilter] = useState("all")
    const [skillFilter, setSkillFilter] = useState("all")
    const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    const filteredEngineers = mockEngineers.filter((engineer) => {
        const matchesSearch = engineer.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || engineer.status === statusFilter
        const matchesRole = roleFilter === "all" || engineer.role === roleFilter
        const matchesSkill = skillFilter === "all" || engineer.skills.includes(skillFilter)
        return matchesSearch && matchesStatus && matchesRole && matchesSkill
    })

    const handleRowClick = (engineer: Engineer) => {
        setSelectedEngineer(engineer)
        setIsDrawerOpen(true)
    }

    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar activeHref="/dashboard/manager" />

            <div className="flex flex-1 flex-col">
                <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
                    <div className="mx-auto max-w-6xl space-y-8">
                        {/* Header */}
                        <header className="space-y-1">
                            <h1 className="text-2xl font-bold text-[#0f172a] sm:text-3xl">
                                Engineering Manager Dashboard
                            </h1>
                            <p className="text-sm text-[#64748b]">
                                Monitor your team's bench activity, project contributions, and skill growth.
                            </p>
                        </header>

                        {/* Stats Section */}
                        <ManagerStatCards />

                        {/* Filters and Table Section */}
                        <div className="space-y-4">
                            <ManagerFilters
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                statusFilter={statusFilter}
                                onStatusChange={setStatusFilter}
                                roleFilter={roleFilter}
                                onRoleChange={setRoleFilter}
                                skillFilter={skillFilter}
                                onSkillChange={setSkillFilter}
                                resultCount={filteredEngineers.length}
                            />

                            <EngineerTable
                                engineers={filteredEngineers}
                                onRowClick={handleRowClick}
                            />
                        </div>
                    </div>
                </main>
            </div>

            <EngineerDrawer
                engineer={selectedEngineer}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
            />
        </div>
    )
}
