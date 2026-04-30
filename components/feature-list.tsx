// components/feature-list.tsx
"use client"

import { useState } from "react"
import { Pencil, Trash2, Plus, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type FeatureType = "Frontend" | "Backend" | "API" | "Database" | "DevOps" | "Testing"

export interface Feature {
    id: string
    type: FeatureType
    name: string
    description: string
}

interface FeatureListProps {
    features: Feature[]
    onChange: (next: Feature[]) => void
}

const typeStyles: Record<FeatureType, string> = {
    Frontend: "bg-[#dbeafe] text-[#1d4ed8]",
    Backend: "bg-[#ede9fe] text-[#6d28d9]",
    API: "bg-[#dcfce7] text-[#15803d]",
    Database: "bg-[#ffedd5] text-[#c2410c]",
    DevOps: "bg-[#f1f5f9] text-[#475569]",
    Testing: "bg-[#fef9c3] text-[#854d0e]",
}

const FEATURE_TYPES: FeatureType[] = ["Frontend", "Backend", "API", "Database", "DevOps", "Testing"]

export function FeatureList({ features, onChange }: FeatureListProps) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [draftName, setDraftName] = useState("")
    const [draftDescription, setDraftDescription] = useState("")
    const [draftType, setDraftType] = useState<FeatureType>("Backend")

    const startEdit = (feature: Feature) => {
        setEditingId(feature.id)
        setDraftName(feature.name)
        setDraftDescription(feature.description)
        setDraftType(feature.type)
    }

    const saveEdit = () => {
        if (!editingId) return
        onChange(
            features.map((f) =>
                f.id === editingId
                    ? { ...f, name: draftName.trim() || f.name, description: draftDescription.trim(), type: draftType }
                    : f,
            ),
        )
        setEditingId(null)
    }

    const cancelEdit = () => {
        setEditingId(null)
    }

    const remove = (id: string) => {
        onChange(features.filter((f) => f.id !== id))
        if (editingId === id) setEditingId(null)
    }

    const addFeature = () => {
        const newFeature: Feature = {
            id: `feat-${Date.now()}`,
            type: "Backend",
            name: "New feature",
            description: "Describe this feature.",
        }
        onChange([...features, newFeature])
        startEdit(newFeature)
    }

    return (
        <div className="space-y-2">
            <ul className="divide-y divide-[#e2e8f0] rounded-lg border border-[#e2e8f0]">
                {features.map((feature) => {
                    const isEditing = editingId === feature.id
                    return (
                        <li key={feature.id} className="group p-4 transition-colors hover:bg-[#f8fafc]">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {FEATURE_TYPES.map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setDraftType(t)}
                                                className={cn(
                                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all",
                                                    typeStyles[t],
                                                    draftType === t ? "ring-2 ring-[#7c3aed] ring-offset-1" : "opacity-60 hover:opacity-100",
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        value={draftName}
                                        onChange={(e) => setDraftName(e.target.value)}
                                        placeholder="Feature name"
                                        className="w-full rounded-md border border-[#e2e8f0] bg-white px-3 py-2 text-sm font-medium text-[#0f172a] outline-none ring-[#7c3aed]/20 placeholder:text-[#94a3b8] focus:border-[#7c3aed] focus:ring-2"
                                    />
                                    <textarea
                                        value={draftDescription}
                                        onChange={(e) => setDraftDescription(e.target.value)}
                                        placeholder="Description"
                                        rows={2}
                                        className="w-full resize-none rounded-md border border-[#e2e8f0] bg-white px-3 py-2 text-sm leading-6 text-[#475569] outline-none ring-[#7c3aed]/20 placeholder:text-[#94a3b8] focus:border-[#7c3aed] focus:ring-2"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="inline-flex items-center gap-1 rounded-md border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] transition-colors hover:bg-[#f8fafc]"
                                        >
                                            <X className="h-3 w-3" />
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={saveEdit}
                                            className="inline-flex items-center gap-1 rounded-md bg-[#7c3aed] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#6d28d9]"
                                        >
                                            <Check className="h-3 w-3" />
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                    typeStyles[feature.type],
                                                )}
                                            >
                                                {feature.type}
                                            </span>
                                            <h4 className="text-sm font-semibold text-[#0f172a]">{feature.name}</h4>
                                        </div>
                                        <p className="mt-1.5 text-sm leading-6 text-[#64748b] text-pretty">{feature.description}</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(feature)}
                                            className="rounded-md p-1.5 text-[#64748b] transition-colors hover:bg-[#ede9fe] hover:text-[#7c3aed]"
                                            aria-label="Edit feature"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => remove(feature.id)}
                                            className="rounded-md p-1.5 text-[#64748b] transition-colors hover:bg-[#fee2e2] hover:text-[#b91c1c]"
                                            aria-label="Delete feature"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    )
                })}
            </ul>

            <button
                type="button"
                onClick={addFeature}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#cbd5e1] bg-white px-3 py-2 text-sm font-medium text-[#7c3aed] transition-colors hover:border-[#7c3aed] hover:bg-[#faf5ff]"
            >
                <Plus className="h-4 w-4" />
                Add feature
            </button>
        </div>
    )
}
