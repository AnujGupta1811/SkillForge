export function verificationEmail({
  email,
  verificationUrl,
}: {
  email: string
  verificationUrl: string
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your SkillForge account</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:28px 32px;text-align:center;">
              <span style="display:inline-flex;align-items:center;gap:8px;">
                <span style="background:#7c3aed;border-radius:8px;padding:6px 10px;font-size:14px;color:#ffffff;font-weight:700;">⚒ SkillForge</span>
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#0f172a;">Confirm your email</h1>
              <p style="margin:0 0 8px;font-size:15px;color:#475569;line-height:1.6;">
                Thanks for signing up! Click the button below to verify <strong>${email}</strong> and activate your account.
              </p>
              <p style="margin:0 0 28px;font-size:13px;color:#94a3b8;">This link expires in 24 hours.</p>

              <a href="${verificationUrl}"
                 style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:13px 28px;border-radius:8px;">
                Verify my email
              </a>

              <p style="margin:28px 0 0;font-size:12px;color:#94a3b8;line-height:1.6;">
                Or copy this link into your browser:<br />
                <span style="color:#7c3aed;word-break:break-all;">${verificationUrl}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                If you didn't create a SkillForge account you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
