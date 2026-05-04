export function contributionRequestEmail({
  leadName,
  contributorName,
  contributorEmail,
  featureTitle,
  projectName,
  projectUrl,
}: {
  leadName: string
  contributorName: string
  contributorEmail: string
  featureTitle: string
  projectName: string
  projectUrl: string
}) {
  return {
    subject: `New contribution request on ${projectName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: #7c3aed; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">SkillForge</h1>
        </div>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-top: none; padding: 32px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #0f172a; margin-top: 0;">New Contribution Request</h2>
          <p style="color: #64748b;">Hi ${leadName},</p>
          <p style="color: #64748b;">
            <strong style="color: #0f172a;">${contributorName}</strong> (${contributorEmail}) 
            has requested to contribute to your project.
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">PROJECT</p>
            <p style="margin: 0 0 16px; color: #0f172a; font-weight: 600;">${projectName}</p>
            <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">FEATURE REQUESTED</p>
            <p style="margin: 0; color: #0f172a; font-weight: 600;">${featureTitle}</p>
          </div>
          <a href="${projectUrl}" 
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Review Request
          </a>
          <p style="color: #64748b; font-size: 14px; margin-top: 32px;">
            You can approve or decline this request from your project workspace.
          </p>
        </div>
      </div>
    `
  }
}

export function contributionApprovedEmail({
  contributorName,
  featureTitle,
  projectName,
  projectUrl,
}: {
  contributorName: string
  featureTitle: string
  projectName: string
  projectUrl: string
}) {
  return {
    subject: `Your contribution request was approved — ${projectName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: #7c3aed; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">SkillForge</h1>
        </div>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-top: none; padding: 32px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #0f172a; margin-top: 0;">🎉 Contribution Approved!</h2>
          <p style="color: #64748b;">Hi ${contributorName},</p>
          <p style="color: #64748b;">
            Great news! Your request to contribute has been approved.
            You have been assigned the feature and it is now In Progress.
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">PROJECT</p>
            <p style="margin: 0 0 16px; color: #0f172a; font-weight: 600;">${projectName}</p>
            <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">YOUR FEATURE</p>
            <p style="margin: 0; color: #0f172a; font-weight: 600;">${featureTitle}</p>
          </div>
          <div style="background: #ede9fe; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #7c3aed; font-weight: 600;">+10 points awarded to your profile!</p>
          </div>
          <a href="${projectUrl}"
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Open Workspace
          </a>
        </div>
      </div>
    `
  }
}

export function contributionRejectedEmail({
  contributorName,
  featureTitle,
  projectName,
  projectUrl,
}: {
  contributorName: string
  featureTitle: string
  projectName: string
  projectUrl: string
}) {
  return {
    subject: `Contribution request update — ${projectName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: #7c3aed; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">SkillForge</h1>
        </div>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-top: none; padding: 32px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #0f172a; margin-top: 0;">Contribution Request Update</h2>
          <p style="color: #64748b;">Hi ${contributorName},</p>
          <p style="color: #64748b;">
            Your contribution request was not approved this time.
            The feature is still available — you can explore other features on the project board.
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">PROJECT</p>
            <p style="margin: 0 0 16px; color: #0f172a; font-weight: 600;">${projectName}</p>
            <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">FEATURE</p>
            <p style="margin: 0; color: #0f172a; font-weight: 600;">${featureTitle}</p>
          </div>
          <a href="${projectUrl}"
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Browse Projects
          </a>
        </div>
      </div>
    `
  }
}

export function featureSubmittedForReviewEmail({
  leadName,
  contributorName,
  featureTitle,
  projectName,
  projectUrl,
}: {
  leadName: string
  contributorName: string
  featureTitle: string
  projectName: string
  projectUrl: string
}) {
  return {
    subject: `Feature ready for review — ${projectName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: #7c3aed; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">SkillForge</h1>
        </div>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-top: none; padding: 32px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #0f172a; margin-top: 0;">Feature Ready for Review</h2>
          <p style="color: #64748b;">Hi ${leadName},</p>
          <p style="color: #64748b;">
            <strong style="color: #0f172a;">${contributorName}</strong> has submitted a feature for your review.
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">PROJECT</p>
            <p style="margin: 0 0 16px; color: #0f172a; font-weight: 600;">${projectName}</p>
            <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">FEATURE</p>
            <p style="margin: 0; color: #0f172a; font-weight: 600;">${featureTitle}</p>
          </div>
          <a href="${projectUrl}"
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Review Now
          </a>
        </div>
      </div>
    `
  }
}

export function featureApprovedEmail({
  contributorName,
  featureTitle,
  projectName,
  projectUrl,
}: {
  contributorName: string
  featureTitle: string
  projectName: string
  projectUrl: string
}) {
  return {
    subject: `Feature approved — ${projectName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: #7c3aed; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">SkillForge</h1>
        </div>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-top: none; padding: 32px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #0f172a; margin-top: 0;">✅ Feature Approved!</h2>
          <p style="color: #64748b;">Hi ${contributorName},</p>
          <p style="color: #64748b;">
            Your feature has been reviewed and approved by the lead engineer. 
            It is now marked as Done.
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">PROJECT</p>
            <p style="margin: 0 0 16px; color: #0f172a; font-weight: 600;">${projectName}</p>
            <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">FEATURE</p>
            <p style="margin: 0; color: #0f172a; font-weight: 600;">${featureTitle}</p>
          </div>
          <div style="background: #ede9fe; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #7c3aed; font-weight: 600;">+20 points awarded to your profile!</p>
          </div>
          <a href="${projectUrl}"
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View Project
          </a>
        </div>
      </div>
    `
  }
}
