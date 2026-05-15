import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  try {
    await transporter.sendMail({
      from: `SkillForge <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('[sendEmail] Failed to send to', to, '-', err instanceof Error ? err.message : err);
  }
}
