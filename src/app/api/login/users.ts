// This file is kept for type compatibility but is NOT used for authentication.
// Auth is handled by NextAuth via src/libs/auth.ts using the database (Prisma).
// Do NOT add real credentials here.

export type UserTable = {
  id: number
  name: string
  email: string
  image: string
  password: string
}

export const users: UserTable[] = []
