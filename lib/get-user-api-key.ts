import { createClient } from '@/lib/supabase/server'

export async function getUserApiKey(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const { data } = await supabase
    .from('users')
    .select('anthropic_api_key')
    .eq('id', user.id)
    .single()

  if (!data?.anthropic_api_key) {
    throw new Error('NO_API_KEY')
  }

  return data.anthropic_api_key
}
