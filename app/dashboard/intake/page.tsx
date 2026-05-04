// app/dashboard/intake/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { DifficultySelector } from "@/components/difficulty-selector"
import { SourceSelector } from "@/components/source-selector"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"

type DifficultyLevel = "beginner" | "intermediate" | "advanced"
type Source = "github" | "hackernews" | "stackoverflow"

export default function IntakePage() {
  const router = useRouter()
  const [skill, setSkill] = useState("")
  const [subtopic, setSubtopic] = useState("")
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("intermediate")
  const [sources, setSources] = useState<Source[]>([
    "github",
    "hackernews",
    "stackoverflow",
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showSettingsPrompt, setShowSettingsPrompt] = useState(false)

  const subtopics = subtopic.trim() ? [subtopic.trim()] : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!skill.trim()) return

    setIsLoading(true)
    setError("")
    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill, subtopics, difficulty, sources }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'NO_API_KEY') {
          setError('You need to add your Anthropic API key before using AI features.')
          setShowSettingsPrompt(true)
          setIsLoading(false)
          return
        }
        throw new Error(data.error || 'Failed to fetch problems')
      }

      sessionStorage.setItem("problems", JSON.stringify(data.problems))
      sessionStorage.setItem(
        "searchContext",
        JSON.stringify({ skill, subtopics, difficulty })
      )

      router.push("/dashboard/problems")
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.")
    }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeHref="/dashboard/intake" />

      {/* Main content */}
      <main className="flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-2xl px-4 py-12 lg:px-8 lg:py-16">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
              What do you want to learn?
            </h1>
            <p className="mt-3 text-lg text-slate-600">
              Tell us your focus area and we&apos;ll find real problems from
              GitHub, Hacker News, and Stack Overflow for you to work on.
            </p>
          </div>

          {/* Form card */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  {/* Skill / Topic */}
                  <Field>
                    <FieldLabel htmlFor="skill">Skill or topic</FieldLabel>
                    <Input
                      id="skill"
                      type="text"
                      placeholder="e.g. System Design, React, Node.js, Kafka, Docker…"
                      value={skill}
                      onChange={(e) => setSkill(e.target.value)}
                      required
                      className="h-11"
                    />
                    <FieldDescription>
                      Enter the main technology or concept you want to get
                      hands-on with.
                    </FieldDescription>
                  </Field>

                  {/* Subtopic */}
                  <Field>
                    <FieldLabel htmlFor="subtopic">
                      Subtopic{" "}
                      <span className="font-normal text-slate-500">
                        (optional)
                      </span>
                    </FieldLabel>
                    <Input
                      id="subtopic"
                      type="text"
                      placeholder="e.g. caching, authentication, rate limiting…"
                      value={subtopic}
                      onChange={(e) => setSubtopic(e.target.value)}
                      className="h-11"
                    />
                    <FieldDescription>
                      Narrow it down if you have something specific in mind.
                    </FieldDescription>
                  </Field>

                  {/* Difficulty Level */}
                  <Field>
                    <FieldLabel>Difficulty level</FieldLabel>
                    <DifficultySelector
                      value={difficulty}
                      onChange={setDifficulty}
                    />
                  </Field>

                  {/* Problem Sources */}
                  <Field>
                    <FieldLabel>
                      Where to search{" "}
                      <span className="font-normal text-slate-500">
                        (optional)
                      </span>
                    </FieldLabel>
                    <FieldDescription className="mb-2">
                      We&apos;ll search all sources by default.
                    </FieldDescription>
                    <SourceSelector value={sources} onChange={setSources} />
                  </Field>

                  {/* Error message */}
                  {error && (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                      
                      {showSettingsPrompt && (
                        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-violet-900">API Key Required</p>
                            <p className="text-xs text-violet-700">Add your Anthropic API key to start finding problems</p>
                          </div>
                          <a 
                            href="/dashboard/settings"
                            className="bg-violet-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-violet-700"
                          >
                            Go to Settings
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit button */}
                  <Button
                    type="submit"
                    disabled={!skill.trim() || isLoading}
                    className="mt-2 h-12 w-full bg-violet-600 text-base font-medium text-white hover:bg-violet-700"
                  >
                    {isLoading ? (
                      <>
                        <Spinner className="mr-2" />
                        Searching for problems…
                      </>
                    ) : (
                      <>
                        Find problems
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
