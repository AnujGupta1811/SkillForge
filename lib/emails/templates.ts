function emailShell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="background:#0f172a;padding:24px 32px;text-align:center;">
              <span style="background:#7c3aed;border-radius:8px;padding:6px 10px;font-size:14px;color:#ffffff;font-weight:700;">⚒ SkillForge</span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">You're receiving this because you use SkillForge.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Verification ────────────────────────────────────────────────────────────

export function verificationEmail({
  email,
  verificationUrl,
}: {
  email: string
  verificationUrl: string
}): string {
  return emailShell('Verify your SkillForge account', `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#0f172a;">Confirm your email</h1>
    <p style="margin:0 0 8px;font-size:15px;color:#475569;line-height:1.6;">
      Thanks for signing up! Click the button below to verify <strong>${email}</strong> and activate your account.
    </p>
    <p style="margin:0 0 28px;font-size:13px;color:#94a3b8;">This link expires in 24 hours.</p>
    <a href="${verificationUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:13px 28px;border-radius:8px;">
      Verify my email
    </a>
    <p style="margin:28px 0 0;font-size:12px;color:#94a3b8;line-height:1.6;">
      Or copy this link:<br/>
      <span style="color:#7c3aed;word-break:break-all;">${verificationUrl}</span>
    </p>
  `)
}

// ── Contribution Request → Lead Engineer ─────────────────────────────────────

export function contributionRequestEmail({
  leadName,
  engineerName,
  featureTitle,
  projectName,
}: {
  leadName: string
  engineerName: string
  featureTitle: string
  projectName: string
}): string {
  return emailShell('New contribution request on SkillForge', `
    <h1 style="margin:0 0 8px;font-size:21px;font-weight:700;color:#0f172a;">New contribution request</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      Hi ${leadName}, <strong>${engineerName}</strong> wants to contribute to your project.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">Feature</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${featureTitle}</p>
      </td></tr>
      <tr><td style="padding:0 20px 16px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">Project</p>
        <p style="margin:0;font-size:14px;color:#475569;">${projectName}</p>
      </td></tr>
    </table>
    <p style="margin:0;font-size:14px;color:#64748b;">Sign in to SkillForge to approve or reject this request.</p>
  `)
}

// ── Contribution Approved → Engineer ─────────────────────────────────────────

export function contributionApprovedEmail({
  engineerName,
  featureTitle,
  projectName,
}: {
  engineerName: string
  featureTitle: string
  projectName: string
}): string {
  return emailShell('Your contribution was approved', `
    <h1 style="margin:0 0 8px;font-size:21px;font-weight:700;color:#0f172a;">Contribution approved 🎉</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      Hi ${engineerName}, your contribution request was approved and the feature is now assigned to you.
      You've earned <strong>10 points</strong>.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">Feature assigned to you</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${featureTitle}</p>
      </td></tr>
      <tr><td style="padding:0 20px 16px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">Project</p>
        <p style="margin:0;font-size:14px;color:#475569;">${projectName}</p>
      </td></tr>
    </table>
    <p style="margin:0;font-size:14px;color:#64748b;">Head to SkillForge to start working on it.</p>
  `)
}

// ── Contribution Rejected → Engineer ─────────────────────────────────────────

export function contributionRejectedEmail({
  engineerName,
  featureTitle,
  projectName,
}: {
  engineerName: string
  featureTitle: string
  projectName: string
}): string {
  return emailShell('Contribution request declined', `
    <h1 style="margin:0 0 8px;font-size:21px;font-weight:700;color:#0f172a;">Contribution request declined</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      Hi ${engineerName}, the lead engineer has declined your contribution request.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">Feature</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${featureTitle}</p>
      </td></tr>
      <tr><td style="padding:0 20px 16px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">Project</p>
        <p style="margin:0;font-size:14px;color:#475569;">${projectName}</p>
      </td></tr>
    </table>
    <p style="margin:0;font-size:14px;color:#64748b;">You can browse other open features on the project board.</p>
  `)
}

// ── Feature Submitted for Review → Lead Engineer ──────────────────────────────

export function featureInReviewEmail({
  leadName,
  contributorName,
  featureTitle,
  projectName,
  notes,
}: {
  leadName: string
  contributorName: string
  featureTitle: string
  projectName: string
  notes?: string | null
}): string {
  const notesBlock = notes
    ? `<tr><td style="padding:0 20px 16px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">Notes from contributor</p>
        <p style="margin:0;font-size:14px;color:#475569;white-space:pre-wrap;">${notes}</p>
      </td></tr>`
    : ''
  return emailShell('Feature ready for review on SkillForge', `
    <h1 style="margin:0 0 8px;font-size:21px;font-weight:700;color:#0f172a;">Feature ready for review</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      Hi ${leadName}, <strong>${contributorName}</strong> has submitted a feature for your review.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">Feature</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${featureTitle}</p>
      </td></tr>
      <tr><td style="padding:0 20px 16px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">Project</p>
        <p style="margin:0;font-size:14px;color:#475569;">${projectName}</p>
      </td></tr>
      ${notesBlock}
    </table>
    <p style="margin:0;font-size:14px;color:#64748b;">Sign in to SkillForge to review and mark it as done.</p>
  `)
}

// ── Changes Requested → Contributor ──────────────────────────────────────────

export function featureChangesRequestedEmail({
  contributorName,
  featureTitle,
  projectName,
  comments,
}: {
  contributorName: string
  featureTitle: string
  projectName: string
  comments: string
}): string {
  return emailShell('Changes requested on your feature', `
    <h1 style="margin:0 0 8px;font-size:21px;font-weight:700;color:#0f172a;">Changes requested</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      Hi ${contributorName}, the lead engineer has reviewed your feature and requested some changes.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">Feature</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${featureTitle}</p>
      </td></tr>
      <tr><td style="padding:0 20px 16px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">Project</p>
        <p style="margin:0;font-size:14px;color:#475569;">${projectName}</p>
      </td></tr>
      <tr><td style="padding:0 20px 20px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">Feedback from lead</p>
        <p style="margin:0;font-size:14px;color:#0f172a;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;padding:12px;white-space:pre-wrap;">${comments}</p>
      </td></tr>
    </table>
    <p style="margin:0;font-size:14px;color:#64748b;">Update your work and re-submit for review when ready.</p>
  `)
}

// ── Feature Marked Done → Contributor ────────────────────────────────────────

export function featureCompletedEmail({
  contributorName,
  featureTitle,
  projectName,
}: {
  contributorName: string
  featureTitle: string
  projectName: string
}): string {
  return emailShell('Your feature was marked as done', `
    <h1 style="margin:0 0 8px;font-size:21px;font-weight:700;color:#0f172a;">Feature completed 🚀</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      Hi ${contributorName}, the lead engineer has marked your feature as done.
      You've earned <strong>20 points</strong> for completing it.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">Completed feature</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${featureTitle}</p>
      </td></tr>
      <tr><td style="padding:0 20px 16px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">Project</p>
        <p style="margin:0;font-size:14px;color:#475569;">${projectName}</p>
      </td></tr>
    </table>
    <p style="margin:0;font-size:14px;color:#64748b;">Check your dashboard to see your updated points and rank.</p>
  `)
}
