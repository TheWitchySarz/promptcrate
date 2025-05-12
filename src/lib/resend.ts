import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing env.RESEND_API_KEY')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) => {
  try {
    const data = await resend.emails.send({
      from: 'Your App <noreply@yourdomain.com>',
      to,
      subject,
      html,
    })
    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
} 