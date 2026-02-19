import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for news articles
    const news = [
      {
        id: '1',
        judul: 'Prestasi Gemilang MTs Al-Ittihad di Lomba Olimpiade Matematika Tingkat Kabupaten',
        slug: 'prestasi-gemilang-olimpiade-matematika',
        konten:
          'Siswa MTs Al-Ittihad berhasil meraih juara 1 dalam Olimpiade Matematika tingkat Kabupaten Banyuwangi. Prestasi ini diraih oleh Ahmad Fauzi dari kelas IX A yang berhasil mengalahkan peserta dari 45 sekolah lainnya...',
        excerpt: 'Siswa MTs Al-Ittihad meraih juara 1 Olimpiade Matematika Kabupaten Banyuwangi',
        foto: '/images/news/olimpiade-matematika.jpg',
        kategori: 'Prestasi',
        status: 'published',
        publishedAt: '2026-01-05T10:00:00Z',
        penulis: 'Tim Redaksi',
        views: 245,
        createdAt: '2026-01-05T09:30:00Z'
      },
      {
        id: '2',
        judul: 'Peringatan Maulid Nabi Muhammad SAW 1446 H di MTs Al-Ittihad',
        slug: 'peringatan-maulid-nabi-muhammad-saw-1446-h',
        konten:
          'Dalam rangka memperingati Maulid Nabi Muhammad SAW 1446 H, MTs Al-Ittihad mengadakan serangkaian kegiatan keagamaan yang diikuti oleh seluruh siswa, guru, dan staff...',
        excerpt: 'Peringatan Maulid Nabi Muhammad SAW dengan kegiatan shalawat dan ceramah agama',
        foto: '/images/news/maulid-nabi.jpg',
        kategori: 'Keagamaan',
        status: 'published',
        publishedAt: '2026-01-03T08:00:00Z',
        penulis: 'Tim Redaksi',
        views: 189,
        createdAt: '2026-01-02T15:45:00Z'
      },
      {
        id: '3',
        judul: 'Sosialisasi PPDB 2026/2027 MTs Al-Ittihad Pedaleman',
        slug: 'sosialisasi-ppdb-2026-2027',
        konten:
          'MTs Al-Ittihad Pedaleman akan membuka pendaftaran peserta didik baru untuk tahun ajaran 2026/2027. Pendaftaran akan dibuka mulai 1 Februari 2026...',
        excerpt: 'Pembukaan pendaftaran PPDB 2026/2027 dengan kuota 150 siswa baru',
        foto: '/images/news/ppdb-2026.jpg',
        kategori: 'Pengumuman',
        status: 'draft',
        publishedAt: null,
        penulis: 'Admin',
        views: 0,
        createdAt: '2026-01-01T14:20:00Z'
      },
      {
        id: '4',
        judul: 'Workshop Peningkatan Kompetensi Guru dalam Pembelajaran Digital',
        slug: 'workshop-kompetensi-guru-pembelajaran-digital',
        konten:
          'Dalam upaya meningkatkan kualitas pembelajaran, MTs Al-Ittihad mengadakan workshop peningkatan kompetensi guru dalam pembelajaran digital...',
        excerpt: 'Workshop untuk meningkatkan kemampuan guru dalam menggunakan teknologi pembelajaran',
        foto: '/images/news/workshop-guru.jpg',
        kategori: 'Pendidikan',
        status: 'published',
        publishedAt: '2025-12-28T13:15:00Z',
        penulis: 'Tim Redaksi',
        views: 156,
        createdAt: '2025-12-27T10:30:00Z'
      }
    ]

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error fetching news:', error)

    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Here you would save to database
    console.log('Saving news article:', body)

    // Generate slug from title
    const slug = body.judul
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Mock response
    const newArticle = {
      id: Date.now().toString(),
      ...body,
      slug,
      views: 0,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json(newArticle, { status: 201 })
  } catch (error) {
    console.error('Error saving news article:', error)

    return NextResponse.json({ error: 'Failed to save news article' }, { status: 500 })
  }
}
