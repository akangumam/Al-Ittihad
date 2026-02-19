import crypto from 'crypto'

import { prisma } from './prisma'

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create a password reset token for user
 * Token expires in 1 hour
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId,
      expiresAt
    }
  })

  return token
}

/**
 * Create a welcome/setup password token for new user
 * Token expires in 24 hours
 */
export async function createWelcomeToken(userId: string): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId,
      expiresAt
    }
  })

  return token
}

/**
 * Verify and consume a reset token
 * Returns userId if valid, null if invalid/expired
 */
export async function verifyResetToken(token: string): Promise<string | null> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token }
  })

  if (!resetToken) {
    return null
  }

  // Check if token is expired
  if (resetToken.expiresAt < new Date()) {
    // Delete expired token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    })

    return null
  }

  return resetToken.userId
}

/**
 * Delete (consume) a reset token after it's been used
 */
export async function consumeResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken
    .delete({
      where: { token }
    })
    .catch(() => {
      // Ignore error if token doesn't exist
    })
}

/**
 * Delete all expired tokens (cleanup)
 */
export async function deleteExpiredTokens(): Promise<void> {
  await prisma.passwordResetToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  })
}
