// components/filters-bar.tsx
"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type SortOption = "newest" | "most_contributors" | "most_progress"

export type BoardFilters = {
    search: string
    stack: string
    sort: SortOption
}

interface FiltersBarProps {
    filters: BoardFilters
    onChange: (filters: BoardFilters) => void
    availableStacks: string[]
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Newest first" },
    { value: "most_contributors", label: "Most contributors" },
    { value: "most_progress", label: "Most progress" },
]

export function FiltersBar({ filters, onChange, availableStacks }: FiltersBarProps) {
    const stackOptions = ["All stacks", ...availableStacks]

    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
                <Input
                    type="search"
                    placeholder="Search projects…"
                    value={filters.search}
                    onChange={(e) => onChange({ ...filters, search: e.target.value })}
                    className="h-10 border-[#e2e8f0] bg-white pl-9 text-[#0f172a] placeholder:text-[#94a3b8] focus-visible:ring-[#7c3aed]"
                />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-nowrap">
                <FilterSelect
                    value={filters.stack}
                    onChange={(v) => onChange({ ...filters, stack: v })}
                    options={stackOptions}
                    placeholder="All stacks"
                />
                <Select
                    value={filters.sort}
                    onValueChange={(v) => onChange({ ...filters, sort: v as SortOption })}
                >
                    <SelectTrigger className="h-10 min-w-[160px] border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:ring-[#7c3aed]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

function FilterSelect({
    value,
    onChange,
    options,
    placeholder,
}: {
    value: string
    onChange: (v: string) => void
    options: string[]
    placeholder: string
}) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-10 min-w-[140px] border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:ring-[#7c3aed]">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                        {opt}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
