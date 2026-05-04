import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

import { getUserApiKey } from '@/lib/get-user-api-key'

export async function POST(req: NextRequest) {
    try {
        let apiKey: string
        try {
          apiKey = await getUserApiKey()
        } catch (e: any) {
          if (e.message === 'NO_API_KEY') {
            return NextResponse.json({ 
              error: 'NO_API_KEY',
              message: 'Please add your Anthropic API key in Settings to use this feature.'
            }, { status: 402 })
          }
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const anthropic = new Anthropic({ apiKey })

        const { problem, skill, difficulty } = await req.json()

        console.log('[generate-project] Request received:', { title: problem?.title, skill, difficulty })

        const prompt = `You are a technical project architect for software engineers.

An engineer selected this problem to solve:
Title: ${problem.title}
Description: ${problem.description}
Source: ${problem.source}
Tags: ${problem.tags?.join(', ')}
Difficulty: ${difficulty}
Skill focus: ${skill}

Generate a complete project spec they can build to solve this problem.
Return ONLY valid JSON, no markdown, no explanation.

{
  "name": "short project name (3-5 words)",
  "pitch": "one sentence explaining what this project does and why it matters",
  "problem": "2-3 sentences describing the problem this project solves",
  "tech_stack": ["list", "of", "5-7", "technologies"],
  "features": [
    {
      "id": "f1",
      "type": "Backend",
      "title": "Feature name",
      "description": "What this feature does and what the engineer will learn building it"
    }
  ]
}

Rules:
- Generate exactly 5-7 features
- Features should be ordered from foundational to advanced
- Tech stack should match the skill: ${skill}
- Keep feature titles short (4-6 words max)
- Each feature must have a "type" field: one of "Backend", "Frontend", "API", "Testing", "DevOps", or "Feature"
- Make it genuinely useful, not a toy project`

        console.log('[generate-project] Calling Anthropic API...')

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-5',
            max_tokens: 1500,
            messages: [{ role: 'user', content: prompt }],
        })

        console.log('[generate-project] Anthropic response received')

        const raw = (message.content[0] as any).text
        const clean = raw.replace(/```json|```/g, '').trim()

        let project
        try {
            project = JSON.parse(clean)
        } catch (parseErr) {
            console.error('[generate-project] JSON parse error:', parseErr)
            console.error('[generate-project] Raw response:', raw)
            return NextResponse.json(
                { error: 'Failed to parse AI response' },
                { status: 500 }
            )
        }

        console.log('[generate-project] Generated project:', project.name)

        return NextResponse.json({ project })
    } catch (err: any) {
        console.error('[generate-project] Error:', err?.message || err)
        console.error('[generate-project] Stack:', err?.stack)
        return NextResponse.json(
            { error: err?.message || 'Generation failed' },
            { status: 500 }
        )
    }
}