/**
 * Test Email System - Simple Version
 *
 * Test email tanpa database dependency
 *
 * Usage:
 *   npm run test-email <email-address>
 */

import { sendWelcomeEmail, sendPasswordResetEmail } from '../src/lib/email'

const testEmail = process.argv[2]

if (!testEmail || !testEmail.includes('@')) {
  console.error('❌ Error: Please provide a valid email address')
  console.log('Usage: npm run test-email your@email.com')
  process.exit(1)
}

console.log('🧪 Testing Email System...\n')
console.log(`📧 Test email will be sent to: ${testEmail}\n`)

async function testEmailSystem() {
  try {
    // Check environment variables
    console.log('1️⃣ Checking environment variables...')

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not set in .env file')
      console.log('   Get your API key from: https://resend.com/api-keys')
      process.exit(1)
    }

    console.log('✅ RESEND_API_KEY is set\n')

    // Generate dummy tokens for testing (tidak perlu database)
    const dummyWelcomeToken = 'test_welcome_' + Math.random().toString(36).substring(7)
    const dummyResetToken = 'test_reset_' + Math.random().toString(36).substring(7)

    // Test 1: Welcome Email
    console.log('2️⃣ Testing Welcome Email...')

    const welcomeResult = await sendWelcomeEmail(testEmail, 'Test User', 'testuser', dummyWelcomeToken)

    if (welcomeResult.success) {
      console.log('✅ Welcome email sent successfully!')
      console.log(`   Email ID: ${welcomeResult.data?.id}\n`)
    } else {
      console.error('❌ Failed to send welcome email:', welcomeResult.error)
      process.exit(1)
    }

    // Test 2: Password Reset Email
    console.log('3️⃣ Testing Password Reset Email...')

    const resetResult = await sendPasswordResetEmail(testEmail, 'Test User', dummyResetToken)

    if (resetResult.success) {
      console.log('✅ Password reset email sent successfully!')
      console.log(`   Email ID: ${resetResult.data?.id}\n`)
    } else {
      console.error('❌ Failed to send reset email:', resetResult.error)
      process.exit(1)
    }

    // Success summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 All email tests passed!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n📬 Please check your inbox at:', testEmail)
    console.log('   You should receive 2 emails:')
    console.log('   1. Welcome email with password setup link')
    console.log('   2. Password reset email\n')
    console.log('💡 Tip: Check your spam folder if emails are not in inbox')
    console.log("⚠️  Note: Links in test emails won't work (dummy tokens)")
    console.log('    This is just to test email delivery.\n')
  } catch (error: any) {
    console.error('❌ Error:', error.message)

    if (error.response) {
      console.error('Response:', error.response)
    }

    console.error(error)
    process.exit(1)
  }
}

testEmailSystem()
