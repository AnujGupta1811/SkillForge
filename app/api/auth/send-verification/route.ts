import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/emails/send'
import { verificationEmail } from '@/lib/emails/templates'

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Remove any previous tokens for this user
    await admin.from('email_verifications').delete().eq('user_id', userId)

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { error: insertError } = await admin.from('email_verifications').insert({
      user_id: userId,
      email,
      token,
      expires_at: expiresAt,
    })

    if (insertError) {
      console.error('[send-verification] insert:', insertError)
      return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`

    await sendEmail({
      to: email,
      subject: 'Verify your SkillForge account',
      html: verificationEmail({ email, verificationUrl }),
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('[send-verification]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
