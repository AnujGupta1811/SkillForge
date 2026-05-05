import { NextRequest, NextResponse } from 'next/server'
import { fetchGithubIssues } from '@/lib/apis/github'
import { fetchHackerNews } from '@/lib/apis/hackernews'
import { fetchStackOverflow } from '@/lib/apis/stackoverflow'
import { getUserAIConfig } from '@/lib/get-user-api-key'
import { callAI } from '@/lib/ai-call'

export async function POST(req: NextRequest) {
  try {
    const { skill, subtopics, difficulty, sources } = await req.json()
    console.log('[/api/problems] Request:', { skill, subtopics, difficulty, sources })

    const fetchers: { name: string; promise: Promise<any> }[] = []
    if (sources.includes('github'))
      fetchers.push({ name: 'github', promise: fetchGithubIssues(skill, subtopics) })
    if (sources.includes('hackernews'))
      fetchers.push({ name: 'hackernews', promise: fetchHackerNews(skill) })
    if (sources.includes('stackoverflow'))
      fetchers.push({ name: 'stackoverflow', promise: fetchStackOverflow(skill, subtopics) })

    const results = await Promise.allSettled(fetchers.map(f => f.promise))

    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`[/api/problems] ${fetchers[i].name} failed:`, r.reason)
      } else {
        console.log(`[/api/problems] ${fetchers[i].name} returned ${r.value?.length ?? 0} items`)
      }
    })

    const rawProblems = results
      .filter(r => r.status === 'fulfilled')
      .flatMap((r: any) => r.value)
      .slice(0, 20)

    console.log(`[/api/problems] Total raw problems: ${rawProblems.length}`)

    if (rawProblems.length === 0) {
      return NextResponse.json({ problems: [] })
    }

    const prompt = `You are a technical problem curator for software engineers.

The engineer wants to practice: ${skill}
Subtopics: ${subtopics.join(', ')}
Difficulty level: ${difficulty}

Here are raw problems fetched from the web:
${JSON.stringify(rawProblems, null, 2)}

Your job:
1. Pick the 6 best problems that match the skill and difficulty
2. For each, write a 2-sentence AI summary explaining what the engineer will learn
3. Return ONLY a valid JSON array, no markdown, no explanation

Return this exact structure:
[
  {
    "id": "p1",
    "title": "...",
    "description": "...",
    "source": "GitHub Issues" | "Hacker News" | "Stack Overflow",
    "difficulty": "Beginner" | "Intermediate" | "Advanced",
    "source_url": "...",
    "tags": ["..."],
    "aiSummary": "..."
  }
]

Make sure each item has a unique "id" like "p1", "p2", etc.
Use "aiSummary" (camelCase) for the AI explanation field.
Use human-readable source names: "GitHub Issues", "Hacker News", "Stack Overflow".
Map the difficulty to title case: "Beginner", "Intermediate", or "Advanced".`

    console.log('[/api/problems] Calling AI API...')

    let config: { provider: string; apiKey: string }
    try {
      config = await getUserAIConfig()
    } catch (e: any) {
      if (e.message === 'NO_API_KEY') {
        return NextResponse.json({
          error: 'NO_API_KEY',
          message: 'Please add your Anthropic or Gemini API key in Settings to use this feature.'
        }, { status: 402 })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const raw = await callAI(config, prompt)
    console.log('[/api/problems] AI response received')

    const clean = raw.replace(/```json|```/g, '').trim()
    const problems = JSON.parse(clean)

    console.log(`[/api/problems] Parsed ${problems.length} problems from AI`)

    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      await supabase.from('problems').insert(problems)
    } catch (cacheError) {
      console.warn('[/api/problems] Failed to cache to Supabase:', cacheError)
    }

    return NextResponse.json({ problems })
  } catch (error: any) {
    console.error('[/api/problems] ERROR:', error?.message || error)
    console.error('[/api/problems] Stack:', error?.stack)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch problems. Please try again.' },
      { status: 500 }
    )
  }
}
