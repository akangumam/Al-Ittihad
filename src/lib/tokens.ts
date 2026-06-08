import crypto from 'crypto'

import { prisma } from './prisma'

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// DB stores SHA-256 hash of the token; raw token only travels in email link
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await prisma.passwordResetToken.create({
    data: {
      token: hashToken(token),
      userId,
      expiresAt
    }
  })

  return token
}

export async function createWelcomeToken(userId: string): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await prisma.passwordResetToken.create({
    data: {
      token: hashToken(token),
      userId,
      expiresAt
    }
  })

  return token
}

export async function verifyResetToken(token: string): Promise<string | null> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: hashToken(token) }
  })

  if (!resetToken) {
    return null
  }

  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    })

    return null
  }

  return resetToken.userId
}

export async function consumeResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken
    .delete({
      where: { token: hashToken(token) }
    })
    .catch(() => {})
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
