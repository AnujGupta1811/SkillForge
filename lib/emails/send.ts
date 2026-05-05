// Email sending disabled — will be re-enabled once custom domain is configured

// import { Resend } from 'resend'
//
// const resend = new Resend(process.env.RESEND_API_KEY)
//
// export async function sendEmail({
//   to,
//   subject,
//   html,
// }: {
//   to: string
//   subject: string
//   html: string
// }) {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: 'SkillForge <onboarding@resend.dev>',
//       to,
//       subject,
//       html,
//     })
//     if (error) {
//       console.error('[sendEmail] Resend error:', error)
//       return { success: false, error }
//     }
//     console.log('[sendEmail] Sent to:', to, '| id:', data?.id)
//     return { success: true, data }
//   } catch (err) {
//     console.error('[sendEmail] Exception:', err)
//     return { success: false, error: err }
//   }
// }
