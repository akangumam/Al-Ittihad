import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for portal users
    const users = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@mtsalittihad.sch.id',
        fullName: 'Administrator Sistem',
        role: 'admin',
        status: 'active',
        lastLogin: '2026-01-06T10:00:00Z',
        createdAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '2',
        username: 'kepala_sekolah',
        email: 'kepsek@mtsalittihad.sch.id',
        fullName: 'Drs. H. Ahmad Sulaikha, M.Pd.I',
        role: 'editor',
        status: 'active',
        lastLogin: '2026-01-05T14:30:00Z',
        createdAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '3',
        username: 'staff_tu',
        email: 'tu@mtsalittihad.sch.id',
        fullName: 'Staff Tata Usaha',
        role: 'editor',
        status: 'active',
        lastLogin: '2026-01-04T09:15:00Z',
        createdAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '4',
        username: 'guru_piket',
        email: 'piket@mtsalittihad.sch.id',
        fullName: 'Guru Piket',
        role: 'viewer',
        status: 'active',
        createdAt: '2025-06-01T00:00:00Z'
      },
      {
        id: '5',
        username: 'wakakur',
        email: 'wakakur@mtsalittihad.sch.id',
        fullName: 'Wakil Kepala Kurikulum',
        role: 'editor',
        status: 'inactive',
        lastLogin: '2025-12-15T16:45:00Z',
        createdAt: '2025-03-01T00:00:00Z'
      }
    ]

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching portal users:', error)

    return NextResponse.json({ error: 'Failed to fetch portal users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Here you would save to database
    console.log('Saving portal user:', body)

    // Mock response
    const newUser = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error saving portal user:', error)

    return NextResponse.json({ error: 'Failed to save portal user' }, { status: 500 })
  }
}
