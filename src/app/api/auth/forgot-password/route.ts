import { NextResponse } from 'next/server'

// Password reset via email is disabled — accounts are managed by admin.
// Admin resets passwords directly from the user management panel.
export async function POST() {
  return NextResponse.json(
    { error: 'Reset password via email tidak tersedia. Hubungi administrator.' },
    { status: 403 }
  )
}
