import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for gallery
    const gallery = [
      {
        id: '1',
        judul: 'Upacara Bendera Senin',
        deskripsi: 'Upacara bendera rutin setiap hari Senin di halaman sekolah',
        foto: '/images/gallery/upacara-bendera.jpg',
        kategori: 'Kegiatan Sekolah',
        tanggal: '2026-01-06',
        tags: ['upacara', 'senin', 'bendera'],
        status: 'published',
        createdAt: '2026-01-06T07:30:00Z'
      },
      {
        id: '2',
        judul: 'Pembelajaran di Laboratorium Komputer',
        deskripsi: 'Siswa sedang belajar TIK di laboratorium komputer yang modern',
        foto: '/images/gallery/lab-komputer.jpg',
        kategori: 'Pembelajaran',
        tanggal: '2026-01-05',
        tags: ['laboratorium', 'komputer', 'TIK'],
        status: 'published',
        createdAt: '2026-01-05T10:15:00Z'
      },
      {
        id: '3',
        judul: 'Kegiatan Ekstrakurikuler Pramuka',
        deskripsi: 'Latihan rutin ekstrakurikuler pramuka setiap Jumat sore',
        foto: '/images/gallery/pramuka.jpg',
        kategori: 'Ekstrakurikuler',
        tanggal: '2026-01-03',
        tags: ['pramuka', 'ekstrakurikuler', 'kepanduan'],
        status: 'published',
        createdAt: '2026-01-03T15:00:00Z'
      },
      {
        id: '4',
        judul: 'Sholat Berjamaah di Masjid Sekolah',
        deskripsi: 'Kegiatan sholat berjamaah yang rutin dilaksanakan setiap hari',
        foto: '/images/gallery/sholat-berjamaah.jpg',
        kategori: 'Keagamaan',
        tanggal: '2026-01-02',
        tags: ['sholat', 'masjid', 'jamaah'],
        status: 'published',
        createdAt: '2026-01-02T12:30:00Z'
      },
      {
        id: '5',
        judul: 'Praktikum IPA',
        deskripsi: 'Siswa melakukan praktikum mata pelajaran IPA di laboratorium',
        foto: '/images/gallery/praktikum-ipa.jpg',
        kategori: 'Pembelajaran',
        tanggal: '2025-12-30',
        tags: ['praktikum', 'IPA', 'laboratorium'],
        status: 'published',
        createdAt: '2025-12-30T09:45:00Z'
      },
      {
        id: '6',
        judul: 'Lomba Cerdas Cermat',
        deskripsi: 'Kompetisi cerdas cermat antar kelas untuk mengasah kemampuan siswa',
        foto: '/images/gallery/cerdas-cermat.jpg',
        kategori: 'Kompetisi',
        tanggal: '2025-12-28',
        tags: ['lomba', 'cerdas cermat', 'kompetisi'],
        status: 'published',
        createdAt: '2025-12-28T14:20:00Z'
      }
    ]

    return NextResponse.json(gallery)
  } catch (error) {
    console.error('Error fetching gallery:', error)

    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Here you would save to database
    console.log('Saving gallery item:', body)

    // Mock response
    const newGalleryItem = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json(newGalleryItem, { status: 201 })
  } catch (error) {
    console.error('Error saving gallery item:', error)

    return NextResponse.json({ error: 'Failed to save gallery item' }, { status: 500 })
  }
}
