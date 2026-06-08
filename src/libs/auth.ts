// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { NextAuthOptions } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'

// In-memory rate limiter: max 5 failed attempts per email per 15 minutes
const loginAttempts = new Map<string, { count: number; windowStart: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000

function isRateLimited(email: string): boolean {
  const now = Date.now()
  const record = loginAttempts.get(email)

  if (!record || now - record.windowStart > WINDOW_MS) {
    loginAttempts.set(email, { count: 0, windowStart: now })
    return false
  }

  return record.count >= MAX_ATTEMPTS
}

function recordFailedAttempt(email: string): void {
  const now = Date.now()
  const record = loginAttempts.get(email)

  if (!record || now - record.windowStart > WINDOW_MS) {
    loginAttempts.set(email, { count: 1, windowStart: now })
  } else {
    record.count++
  }
}

function clearAttempts(email: string): void {
  loginAttempts.delete(email)
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,

  // ** Configure one or more authentication providers
  // ** Please refer to https://next-auth.js.org/configuration/options#providers for more `providers` options
  providers: [
    CredentialProvider({
      // ** The name to display on the sign in form (e.g. 'Sign in with...')
      // ** For more details on Credentials Provider, visit https://next-auth.js.org/providers/credentials
      name: 'Credentials',
      type: 'credentials',

      /*
       * As we are using our own Sign-in page, we do not need to change
       * username or password attributes manually in following credentials object.
       */
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string }

        if (!email || !password) {
          return null
        }

        // Block brute force: reject if too many failed attempts in window
        if (isRateLimited(email)) {
          throw new Error('TooManyAttempts')
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: email }
        })

        // Check if user exists and has a password
        if (!user || !user.password) {
          recordFailedAttempt(email)
          return null
        }

        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
          recordFailedAttempt(email)
          return null
        }

        // Clear failed attempts on successful login
        clearAttempts(email)

        // Return user object for session
        return {
          id: user.id,
          name: user.name || 'User',
          email: user.email,
          image: user.image || '/images/avatars/1.png',
          role: user.role || 'member'
        }
      }
    }),

  ],

  // ** Please refer to https://next-auth.js.org/configuration/options#session for more `session` options
  session: {
    /*
     * Choose how you want to save the user session.
     * The default is `jwt`, an encrypted JWT (JWE) stored in the session cookie.
     * If you use an `adapter` however, NextAuth default it to `database` instead.
     * You can still force a JWT session by explicitly defining `jwt`.
     * When using `database`, the session cookie will only contain a `sessionToken` value,
     * which is used to look up the session in the database.
     * If you use a custom credentials provider, user accounts will not be persisted in a database by NextAuth.js (even if one is configured).
     * The option to use JSON Web Tokens for session tokens must be enabled to use a custom credentials provider.
     */
    strategy: 'jwt',

    // ** Seconds - How long until an idle session expires and is no longer valid
    maxAge: 7 * 24 * 60 * 60 // 7 days
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#pages for more `pages` options
  pages: {
    signIn: '/login'
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#callbacks for more `callbacks` options
  callbacks: {
    /*
     * While using `jwt` as a strategy, `jwt()` callback will be called before
     * the `session()` callback. So we have to add custom parameters in `token`
     * via `jwt()` callback to make them accessible in the `session()` callback
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.picture = user.image
        token.role = (user as any).role
      }

      // Update token when session is updated
      if (trigger === 'update' && session) {
        if (token.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string }
          })

          if (dbUser) {
            token.name = dbUser.name
            token.picture = dbUser.image
            token.role = dbUser.role as string
          }
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name
        session.user.image = token.picture as string
        session.user.role = token.role as string
      }

      return session
    }
  }
}
