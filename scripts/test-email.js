/**
 * Test Email System
 *
 * Script untuk test apakah email system sudah berfungsi dengan baik
 *
 * Usage:
 *   npm run test-email <email-address>
 *   atau
 *   node scripts/test-email.js your@email.com
 */

const { sendWelcomeEmail, sendPasswordResetEmail } = require('../src/lib/email')
const { createWelcomeToken, createPasswordResetToken } = require('../src/lib/tokens')

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

    // Test 1: Welcome Email
    console.log('2️⃣ Testing Welcome Email...')
    const welcomeToken = await createWelcomeToken('test-user-id')

    const welcomeResult = await sendWelcomeEmail(testEmail, 'Test User', 'testuser', welcomeToken)

    if (welcomeResult.success) {
      console.log('✅ Welcome email sent successfully!')
      console.log(`   Email ID: ${welcomeResult.data?.id}\n`)
    } else {
      console.error('❌ Failed to send welcome email:', welcomeResult.error)
      process.exit(1)
    }

    // Test 2: Password Reset Email
    console.log('3️⃣ Testing Password Reset Email...')
    const resetToken = await createPasswordResetToken('test-user-id')

    const resetResult = await sendPasswordResetEmail(testEmail, 'Test User', resetToken)

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
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

testEmailSystem()
