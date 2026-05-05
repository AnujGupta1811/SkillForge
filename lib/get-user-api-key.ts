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

  const preferred = (data?.preferred_ai_provider || 'anthropic') as 'anthropic' | 'gemini'

  // Use preferred provider if it has a key
  if (preferred === 'gemini' && data?.gemini_api_key) {
    return { provider: 'gemini', apiKey: data.gemini_api_key }
  }
  if (preferred === 'anthropic' && data?.anthropic_api_key) {
    return { provider: 'anthropic', apiKey: data.anthropic_api_key }
  }

  // Fall back to whichever provider has a key
  if (data?.gemini_api_key) {
    return { provider: 'gemini', apiKey: data.gemini_api_key }
  }
  if (data?.anthropic_api_key) {
    return { provider: 'anthropic', apiKey: data.anthropic_api_key }
  }

  throw new Error('NO_API_KEY')
}
