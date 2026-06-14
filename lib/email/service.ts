import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string
  subject: string
  html: string
}

/**
 * Send email using Resend
 * Errors are logged but don't block the response
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const fromEmail = process.env.FROM_EMAIL || 'noreply@cargoplus.com'

    await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    console.log(`Email sent to ${options.to}`)
  } catch (error) {
    console.error('Failed to send email:', {
      to: options.to,
      subject: options.subject,
      error: error instanceof Error ? error.message : String(error),
    })
    // Don't throw - allow API response to continue
  }
}
