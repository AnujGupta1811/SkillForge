import { createClient } from '@/lib/supabase/server'

export async function getUserAIConfig(): Promise<{
  provider: 'anthropic' | 'gemini'
  apiKey: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data } = await supabase
    .from('users')
    .select('anthropic_api_key, gemini_api_key, preferred_ai_provider')
    .eq('id', user.id)
    .single()

  const provider = data?.preferred_ai_provider || 'anthropic'

  if (provider === 'gemini') {
    if (!data?.gemini_api_key) throw new Error('NO_API_KEY')
    return { provider: 'gemini', apiKey: data.gemini_api_key }
  }

  if (!data?.anthropic_api_key) throw new Error('NO_API_KEY')
  return { provider: 'anthropic', apiKey: data.anthropic_api_key }
}
