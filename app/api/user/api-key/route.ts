import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { api_key, provider, preferred_provider } = body

  if (preferred_provider) {
    if (!['anthropic', 'gemini'].includes(preferred_provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }
    const { error } = await supabase
      .from('users')
      .update({ preferred_ai_provider: preferred_provider })
      .eq('id', user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (!api_key) {
    return NextResponse.json({ error: 'api_key is required' }, { status: 400 })
  }

  if (provider === 'gemini') {
    if (!api_key.startsWith('AIza')) {
      return NextResponse.json({ error: 'Invalid API key. Gemini keys start with AIza' }, { status: 400 })
    }

    try {
      const testRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${api_key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hi' }] }]
          })
        }
      )
      if (!testRes.ok) {
        return NextResponse.json({ error: 'Invalid Gemini API key' }, { status: 400 })
      }
    } catch (e) {
      return NextResponse.json({ error: 'Could not validate Gemini API key' }, { status: 400 })
    }

    const { error } = await supabase
      .from('users')
      .update({ gemini_api_key: api_key })
      .eq('id', user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // Default: Anthropic
  if (!api_key.startsWith('sk-ant-')) {
    return NextResponse.json({
      error: 'Invalid API key. Anthropic keys start with sk-ant-'
    }, { status: 400 })
  }

  try {
    const testRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': api_key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    })

    if (!testRes.ok) {
      const err = await testRes.json()
      return NextResponse.json({
        error: 'API key validation failed: ' + (err.error?.message || 'Invalid key')
      }, { status: 400 })
    }
  } catch (e) {
    return NextResponse.json({ error: 'Could not validate API key' }, { status: 400 })
  }

  const { error } = await supabase
    .from('users')
    .update({ anthropic_api_key: api_key })
    .eq('id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const provider = searchParams.get('provider') || 'anthropic'

  if (provider === 'gemini') {
    await supabase.from('users').update({ gemini_api_key: null }).eq('id', user.id)
  } else {
    await supabase.from('users').update({ anthropic_api_key: null }).eq('id', user.id)
  }

  return NextResponse.json({ success: true })
}

export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('users')
    .select('anthropic_api_key, gemini_api_key, preferred_ai_provider')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    anthropic: {
      has_key: !!data?.anthropic_api_key,
      key_preview: data?.anthropic_api_key
        ? '••••••••••••••••' + data.anthropic_api_key.slice(-4)
        : null
    },
    gemini: {
      has_key: !!data?.gemini_api_key,
      key_preview: data?.gemini_api_key
        ? '••••••••••••••••' + data.gemini_api_key.slice(-4)
        : null
    },
    preferred_provider: data?.preferred_ai_provider || 'anthropic'
  })
}
