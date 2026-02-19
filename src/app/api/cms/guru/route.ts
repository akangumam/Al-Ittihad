import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for teachers
    const teachers = [
      {
        id: '1',
        nama: 'Drs. H. Ahmad Sulaikha, M.Pd.I',
        nip: '196505121990031001',
        jabatan: 'Kepala Sekolah',
        mataPelajaran: 'Pendidikan Agama Islam',
        pendidikan: 'S2 Pendidikan Islam',
        foto: '/images/teachers/kepala-sekolah.jpg',
        kontak: {
          email: 'kepsek@mtsalittihad.sch.id',
          telepon: '081234567890'
        },
        status: 'aktif',
        mulaiTugas: '2015-07-01',
        alamat: 'Jl. Raya Pedaleman No. 45, Banyuwangi',
        createdAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '2',
        nama: 'Dra. Siti Khodijah, M.Pd',
        nip: '196812151992032005',
        jabatan: 'Wakil Kepala Kurikulum',
        mataPelajaran: 'Bahasa Indonesia',
        pendidikan: 'S2 Pendidikan Bahasa Indonesia',
        foto: '/images/teachers/wakakur.jpg',
        kontak: {
          email: 'wakakur@mtsalittihad.sch.id',
          telepon: '081234567891'
        },
        status: 'aktif',
        mulaiTugas: '1992-03-01',
        alamat: 'Jl. Diponegoro No. 12, Banyuwangi',
        createdAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '3',
        nama: 'Ahmad Fauzi, S.Pd',
        nip: '198503101998021001',
        jabatan: 'Guru',
        mataPelajaran: 'Matematika',
        pendidikan: 'S1 Pendidikan Matematika',
        foto: '/images/teachers/guru-matematika.jpg',
        kontak: {
          email: 'fauzi@mtsalittihad.sch.id',
          telepon: '081234567892'
        },
        status: 'aktif',
        mulaiTugas: '2008-07-15',
        alamat: 'Jl. Basuki Rahmat No. 8, Banyuwangi',
        createdAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '4',
        nama: 'Siti Nur Rohmah, S.Pd',
        nip: '198907252011012008',
        jabatan: 'Guru',
        mataPelajaran: 'IPA',
        pendidikan: 'S1 Pendidikan Biologi',
        foto: '/images/teachers/guru-ipa.jpg',
        kontak: {
          email: 'rohmah@mtsalittihad.sch.id',
          telepon: '081234567893'
        },
        status: 'aktif',
        mulaiTugas: '2011-01-10',
        alamat: 'Jl. Gajah Mada No. 22, Banyuwangi',
        createdAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '5',
        nama: 'Muhammad Yusuf, S.Pd',
        nip: '199012102015031002',
        jabatan: 'Guru',
        mataPelajaran: 'Bahasa Inggris',
        pendidikan: 'S1 Pendidikan Bahasa Inggris',
        foto: '/images/teachers/guru-inggris.jpg',
        kontak: {
          email: 'yusuf@mtsalittihad.sch.id',
          telepon: '081234567894'
        },
        status: 'aktif',
        mulaiTugas: '2015-03-01',
        alamat: 'Jl. Ahmad Yani No. 15, Banyuwangi',
        createdAt: '2025-01-01T00:00:00Z'
      }
    ]

    return NextResponse.json(teachers)
  } catch (error) {
    console.error('Error fetching teachers:', error)

    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Here you would save to database
    console.log('Saving teacher:', body)

    // Mock response
    const newTeacher = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json(newTeacher, { status: 201 })
  } catch (error) {
    console.error('Error saving teacher:', error)

    return NextResponse.json({ error: 'Failed to save teacher' }, { status: 500 })
  }
}
