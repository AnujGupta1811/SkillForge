export async function callAI(
  config: { provider: string; apiKey: string },
  prompt: string
): Promise<string> {
  if (config.provider === 'anthropic') {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic = new Anthropic({ apiKey: config.apiKey })
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })
    return (message.content[0] as any).text
  }

  if (config.provider === 'gemini') {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': config.apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 8192 }
        })
      }
    )
    const data = await res.json()

    if (!res.ok) {
      console.error('[callAI] Gemini error:', data)
      throw new Error(data.error?.message || 'Gemini API call failed')
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }

  throw new Error('Unknown provider')
}
