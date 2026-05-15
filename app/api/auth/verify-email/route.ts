import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  if (!token) {
    return NextResponse.redirect(`${appUrl}/auth?error=invalid_token`)
  }

  const admin = createAdminClient()

  const { data: verification } = await admin
    .from('email_verifications')
    .select('user_id, expires_at')
    .eq('token', token)
    .single()

  if (!verification) {
    return NextResponse.redirect(`${appUrl}/auth?error=invalid_token`)
  }

  if (new Date(verification.expires_at) < new Date()) {
    await admin.from('email_verifications').delete().eq('token', token)
    return NextResponse.redirect(`${appUrl}/auth?error=token_expired`)
  }

  await admin
    .from('users')
    .update({ email_verified_at: new Date().toISOString() })
    .eq('id', verification.user_id)

  await admin.from('email_verifications').delete().eq('token', token)

  return NextResponse.redirect(`${appUrl}/dashboard?verified=true`)
}
