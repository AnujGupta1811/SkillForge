// components/tech-stack-input.tsx
"use client"

import { useRef, useState, type KeyboardEvent } from "react"
import { Plus, X } from "lucide-react"

interface TechStackInputProps {
    value: string[]
    onChange: (next: string[]) => void
}

export function TechStackInput({ value, onChange }: TechStackInputProps) {
    const [adding, setAdding] = useState(false)
    const [draft, setDraft] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    const startAdding = () => {
        setAdding(true)
        setDraft("")
        // Focus on next tick so the input is mounted
        setTimeout(() => inputRef.current?.focus(), 0)
    }

    const commit = () => {
        const trimmed = draft.trim()
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed])
        }
        setDraft("")
        setAdding(false)
    }

    const cancel = () => {
        setDraft("")
        setAdding(false)
    }

    const remove = (tag: string) => {
        onChange(value.filter((t) => t !== tag))
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            commit()
        } else if (e.key === "Escape") {
            e.preventDefault()
            cancel()
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {value.map((tag) => (
                <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1 text-sm font-medium text-[#475569]"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={() => remove(tag)}
                        className="-mr-1 rounded-full p-0.5 text-[#64748b] transition-colors hover:bg-[#e2e8f0] hover:text-[#0f172a]"
                        aria-label={`Remove ${tag}`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            ))}

            {adding ? (
                <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={handleKeyDown}
                    placeholder="Technology name"
                    className="h-7 rounded-full border border-[#e2e8f0] bg-white px-3 text-sm text-[#0f172a] outline-none ring-[#7c3aed]/20 placeholder:text-[#94a3b8] focus:border-[#7c3aed] focus:ring-2"
                />
            ) : (
                <button
                    type="button"
                    onClick={startAdding}
                    className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#cbd5e1] px-3 py-1 text-sm font-medium text-[#64748b] transition-colors hover:border-[#7c3aed] hover:text-[#7c3aed]"
                >
                    <Plus className="h-3 w-3" />
                    Add technology
                </button>
            )}
        </div>
    )
}
