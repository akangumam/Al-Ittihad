import { Resend } from 'resend'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev'
const APP_NAME = process.env.APP_NAME || 'Al-Ittihad School'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

/**
 * Send email using Resend
 */
export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html
    })

    if (error) {
      console.error('Error sending email:', error)

      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)

    return { success: false, error }
  }
}

/**
 * Send welcome email with password setup link
 */
export async function sendWelcomeEmail(to: string, name: string, username: string, token: string) {
  const resetLink = `${APP_URL}/auth/set-password?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Selamat Datang di ${APP_NAME}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="margin: 0;">Selamat Datang!</h1>
        </div>

        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px;">
          <h2 style="color: #4CAF50; margin-top: 0;">Halo ${name},</h2>

          <p>Selamat datang di <strong>${APP_NAME}</strong>!</p>

          <p>Akun Anda telah berhasil dibuat dengan informasi berikut:</p>

          <div style="background-color: white; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Username:</strong> ${username}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${to}</p>
          </div>

          <p>Untuk keamanan akun Anda, silakan buat password dengan mengklik tombol di bawah ini:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
               style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Buat Password
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">Atau salin link berikut ke browser Anda:</p>
          <p style="background-color: #f0f0f0; padding: 10px; border-radius: 3px; word-break: break-all; font-size: 12px;">
            ${resetLink}
          </p>

          <p style="color: #999; font-size: 13px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            <strong>Link ini akan kadaluarsa dalam 24 jam.</strong><br>
            Jika Anda tidak meminta pembuatan akun ini, abaikan email ini.
          </p>
        </div>

        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
          <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Selamat Datang di ${APP_NAME} - Buat Password Anda`,
    html
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetLink = `${APP_URL}/auth/reset-password?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password - ${APP_NAME}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="margin: 0;">Reset Password</h1>
        </div>

        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px;">
          <h2 style="color: #2196F3; margin-top: 0;">Halo ${name},</h2>

          <p>Kami menerima permintaan untuk mereset password akun Anda di <strong>${APP_NAME}</strong>.</p>

          <p>Klik tombol di bawah ini untuk membuat password baru:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
               style="background-color: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">Atau salin link berikut ke browser Anda:</p>
          <p style="background-color: #f0f0f0; padding: 10px; border-radius: 3px; word-break: break-all; font-size: 12px;">
            ${resetLink}
          </p>

          <p style="color: #999; font-size: 13px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            <strong>Link ini akan kadaluarsa dalam 1 jam.</strong><br>
            Jika Anda tidak meminta reset password, abaikan email ini dan password Anda tidak akan berubah.
          </p>
        </div>

        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
          <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Reset Password - ${APP_NAME}`,
    html
  })
}

/**
 * Send password change confirmation email
 */
export async function sendPasswordChangedEmail(to: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Berhasil Diubah - ${APP_NAME}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="margin: 0;">Password Berhasil Diubah</h1>
        </div>

        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px;">
          <h2 style="color: #4CAF50; margin-top: 0;">Halo ${name},</h2>

          <p>Password Anda di <strong>${APP_NAME}</strong> telah berhasil diubah.</p>

          <p>Jika Anda tidak melakukan perubahan ini, segera hubungi administrator untuk mengamankan akun Anda.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}"
               style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Login Sekarang
            </a>
          </div>
        </div>

        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
          <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Password Berhasil Diubah - ${APP_NAME}`,
    html
  })
}
