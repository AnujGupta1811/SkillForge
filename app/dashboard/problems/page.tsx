// app/dashboard/problems/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { ResultsContextBar } from "@/components/results-context-bar"
import { ProblemCard, type Problem } from "@/components/problem-card"
import { cn } from "@/lib/utils"

const fallbackProblems: Problem[] = [
  {
    id: "p1",
    source: "GitHub Issues",
    difficulty: "Intermediate",
    title: "Build a distributed rate limiter using Redis",
    description:
      "An open issue in a high-traffic API gateway repo. The team needs a token-bucket implementation that works across multiple nodes.",
    tags: ["Node.js", "Redis", "Backend"],
    aiSummary:
      "This problem will teach you distributed systems thinking and real-world API design. Implementing a token-bucket rate limiter in Redis forces you to handle concurrency and atomicity — skills that come up constantly in backend roles.",
  },
  {
    id: "p2",
    source: "Stack Overflow",
    difficulty: "Intermediate",
    title: "Why is my PostgreSQL query slow with large joins?",
    description:
      "A high-upvote question about diagnosing slow queries on two large tables without proper indexing. 142 upvotes, no accepted answer.",
    tags: ["PostgreSQL", "SQL", "Backend"],
    aiSummary:
      "Slow query debugging is one of the most common real-world backend problems. This will push you to learn EXPLAIN ANALYZE, index strategies, and query planning — all highly valued in senior engineering roles.",
  },
  {
    id: "p3",
    source: "Hacker News",
    difficulty: "Intermediate",
    title: "Ask HN: How do you handle background job failures at scale?",
    description:
      "Popular HN thread with no clear consensus on retry strategies, dead-letter queues, and observability for async workers.",
    tags: ["Backend", "Queues", "Node.js"],
    aiSummary:
      "Background job reliability is a gap in most junior engineers' knowledge. Building a solution here will expose you to retry logic, DLQ patterns, and worker observability — great for your portfolio.",
  },
  {
    id: "p4",
    source: "GitHub Issues",
    difficulty: "Advanced",
    title: "Implement consistent hashing for a distributed cache",
    description:
      "Open issue in a caching library. The team needs a consistent hashing ring to distribute cache keys evenly across nodes when nodes are added or removed.",
    tags: ["Node.js", "Distributed Systems", "Backend"],
    aiSummary:
      "Consistent hashing is a foundational concept in distributed systems. Building it from scratch will give you deep insight into how databases like Cassandra and caches like Memcached work internally.",
  },
  {
    id: "p5",
    source: "Stack Overflow",
    difficulty: "Beginner",
    title: "How to structure a REST API with proper error handling in Express?",
    description:
      "Frequently asked question about Express.js error middleware, status codes, and consistent error response formats. High traffic, multiple conflicting answers.",
    tags: ["Node.js", "Express", "API Design"],
    aiSummary:
      "Proper error handling is often skipped in tutorials but is critical in production code. This is a great starting point for understanding middleware patterns and API design conventions.",
  },
  {
    id: "p6",
    source: "Hacker News",
    difficulty: "Intermediate",
    title: "Show HN: I built a job queue — what would you do differently?",
    description:
      "A builder shares their Node.js job queue implementation and asks the community for architectural critique. Rich discussion on priorities, retries, and persistence.",
    tags: ["Node.js", "Architecture", "Backend"],
    aiSummary:
      "Reviewing and critiquing real code is one of the best learning methods. This thread gives you a real codebase to analyze, improve, and turn into your own project with a clear architecture rationale.",
  },
]

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-[#64748b]">
        <Loader2 className="h-4 w-4 animate-spin text-[#7c3aed]" />
        Finding the best problems for you…
      </div>
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-[#e2e8f0] bg-white p-6 animate-pulse"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-24 rounded-full bg-[#f1f5f9]" />
                  <div className="h-5 w-20 rounded-full bg-[#f1f5f9]" />
                </div>
                <div className="h-6 w-3/4 rounded bg-[#f1f5f9]" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-[#f1f5f9]" />
                  <div className="h-3 w-5/6 rounded bg-[#f1f5f9]" />
                </div>
                <div className="flex gap-1.5">
                  <div className="h-5 w-14 rounded-md bg-[#f1f5f9]" />
                  <div className="h-5 w-14 rounded-md bg-[#f1f5f9]" />
                  <div className="h-5 w-14 rounded-md bg-[#f1f5f9]" />
                </div>
              </div>
              <div className="h-9 w-24 rounded-lg bg-[#f1f5f9]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProblemsPage() {
  const router = useRouter()

  // ── Intake state ──
  const [skill, setSkill] = useState('')
  const [subtopics, setSubtopics] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState('intermediate')
  const [sources, setSources] = useState(['github', 'hackernews', 'stackoverflow'])
  const [fetchError, setFetchError] = useState('')

  // ── Results state ──
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // ── Search context (populated from sessionStorage or defaults) ──
  const [searchContext, setSearchContext] = useState<{
    skill: string
    subtopics: string[]
    difficulty: string
  }>({ skill: 'Node.js', subtopics: [], difficulty: 'Intermediate' })

  useEffect(() => {
    // Try to load problems & context from sessionStorage (set by intake flow)
    const storedProblems = sessionStorage.getItem('problems')
    const storedContext = sessionStorage.getItem('searchContext')

    if (storedProblems) {
      try {
        const parsed = JSON.parse(storedProblems) as Problem[]
        setProblems(parsed)
      } catch {
        setProblems(fallbackProblems)
      }
    } else {
      setProblems(fallbackProblems)
    }

    if (storedContext) {
      try {
        setSearchContext(JSON.parse(storedContext))
      } catch {
        // keep defaults
      }
    }

    // Simulate loading delay for smooth skeleton transition
    const t = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(t)
  }, [])

  // ── Intake handler: fetch problems from API ──
  async function handleFindProblems() {
    setLoading(true)
    setFetchError('')
    try {
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill, subtopics, difficulty, sources }),
      })
      const data = await res.json()

      // Store results in sessionStorage to persist across navigation
      sessionStorage.setItem('problems', JSON.stringify(data.problems))
      sessionStorage.setItem('searchContext', JSON.stringify({ skill, subtopics, difficulty }))

      setProblems(data.problems)
      setSearchContext({ skill, subtopics, difficulty })
    } catch (e) {
      setFetchError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
    // Store selected problem for the generator page
    const selected = problems.find((p) => p.id === id)
    if (selected) {
      sessionStorage.setItem("selectedProblem", JSON.stringify(selected))
    }
  }

  const handleGenerate = () => {
    if (selectedId) {
      router.push("/dashboard/generate")
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeHref="/dashboard/problems" />

      <div className="flex flex-1 flex-col">
        <main className="flex-1 px-4 py-6 pb-28 sm:px-8 sm:py-8 sm:pb-28">
          <div className="mx-auto w-full max-w-4xl space-y-6">
            {/* Heading */}
            <header className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a] text-balance sm:text-3xl">
                Problems we found for you
              </h1>
              <p className="text-sm leading-6 text-[#64748b] text-pretty">
                Pick one problem to work on. The AI will generate a project idea based on your choice.
              </p>
            </header>

            {/* Context bar */}
            <ResultsContextBar
              skill={searchContext.skill || "Node.js"}
              difficulty={searchContext.difficulty || "Intermediate"}
              sources={["GitHub", "Hacker News", "Stack Overflow"]}
            />

            {/* Error message */}
            {fetchError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {fetchError}
              </div>
            )}

            {/* Results */}
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-4">
                {problems.map((p) => (
                  <ProblemCard
                    key={p.id}
                    problem={p}
                    selected={selectedId === p.id}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Sticky bottom action bar */}
        <div className="sticky bottom-0 left-0 right-0 border-t border-[#e2e8f0] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
            <p className="text-sm font-medium text-[#475569]">
              {selectedId ? "1 problem selected" : "No problem selected"}
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!selectedId}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                selectedId
                  ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
                  : "cursor-not-allowed bg-[#e2e8f0] text-[#94a3b8]",
              )}
            >
              Generate project idea
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
