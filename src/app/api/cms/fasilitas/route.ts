import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for facilities
    const facilities = [
      {
        id: '1',
        nama: 'Laboratorium Komputer',
        deskripsi:
          'Laboratorium komputer dengan 30 unit PC modern untuk pembelajaran teknologi informasi dan komunikasi',
        foto: ['/images/fasilitas/lab-komputer-1.jpg', '/images/fasilitas/lab-komputer-2.jpg'],
        kategori: 'Laboratorium',
        status: 'aktif',
        kapasitas: '30 siswa',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        nama: 'Perpustakaan',
        deskripsi:
          'Perpustakaan dengan koleksi buku lebih dari 5000 judul, dilengkapi dengan area baca yang nyaman dan akses internet',
        foto: ['/images/fasilitas/perpustakaan-1.jpg', '/images/fasilitas/perpustakaan-2.jpg'],
        kategori: 'Akademik',
        status: 'aktif',
        kapasitas: '50 siswa',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        nama: 'Masjid Al-Ittihad',
        deskripsi: 'Masjid sekolah untuk kegiatan ibadah harian, sholat berjamaah, dan pembelajaran agama Islam',
        foto: ['/images/fasilitas/masjid-1.jpg'],
        kategori: 'Ibadah',
        status: 'aktif',
        kapasitas: '200 jamaah',
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        nama: 'Laboratorium IPA',
        deskripsi: 'Laboratorium untuk praktikum mata pelajaran IPA dengan peralatan lengkap sesuai standar nasional',
        foto: ['/images/fasilitas/lab-ipa.jpg'],
        kategori: 'Laboratorium',
        status: 'aktif',
        kapasitas: '25 siswa',
        createdAt: new Date().toISOString()
      },
      {
        id: '5',
        nama: 'Lapangan Olahraga',
        deskripsi: 'Lapangan serbaguna untuk kegiatan olahraga dan upacara sekolah',
        foto: ['/images/fasilitas/lapangan.jpg'],
        kategori: 'Olahraga',
        status: 'maintenance',
        kapasitas: '500 orang',
        createdAt: new Date().toISOString()
      },
      {
        id: '6',
        nama: 'Kantin Sehat',
        deskripsi: 'Kantin sekolah yang menyediakan makanan sehat dan bergizi untuk siswa dan guru',
        foto: ['/images/fasilitas/kantin.jpg'],
        kategori: 'Pendukung',
        status: 'aktif',
        kapasitas: '100 orang',
        createdAt: new Date().toISOString()
      }
    ]

    return NextResponse.json(facilities)
  } catch (error) {
    console.error('Error fetching facilities:', error)

    return NextResponse.json({ error: 'Failed to fetch facilities' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Here you would save to database
    console.log('Saving facility:', body)

    // Mock response
    const newFacility = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json(newFacility, { status: 201 })
  } catch (error) {
    console.error('Error saving facility:', error)

    return NextResponse.json({ error: 'Failed to save facility' }, { status: 500 })
  }
}
