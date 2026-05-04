import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { api_key } = await req.json()

  // Basic validation — Anthropic keys start with sk-ant-
  if (!api_key || !api_key.startsWith('sk-ant-')) {
    return NextResponse.json({ 
      error: 'Invalid API key. Anthropic keys start with sk-ant-' 
    }, { status: 400 })
  }

  // Verify the key works by making a minimal test call to Anthropic
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

  // Save to database
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

  await supabase
    .from('users')
    .update({ anthropic_api_key: null })
    .eq('id', user.id)

  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('users')
    .select('anthropic_api_key')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ 
    has_key: !!data?.anthropic_api_key,
    // Show last 4 chars only so user knows which key is saved
    key_preview: data?.anthropic_api_key 
      ? '••••••••••••••••' + data.anthropic_api_key.slice(-4)
      : null
  })
}
