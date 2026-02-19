import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for school info
    const data = {
      sambutan: {
        judulSambutan: 'Sambutan Kepala Sekolah',
        namaPenyambut: 'Drs. H. Ahmad Sulaikha, M.Pd.I',
        jabatan: 'Kepala MTs Al-Ittihad Pedaleman',
        isiSambutan:
          "Bismillahirrahmanirrahim. Assalamu'alaikum Warahmatullahi Wabarakatuh. Segala puji bagi Allah SWT yang telah memberikan rahmat dan hidayah-Nya, sehingga MTs Al-Ittihad Pedaleman dapat terus berkembang dan memberikan pendidikan terbaik bagi putra-putri bangsa...",
        foto: '/images/kepala-sekolah.jpg'
      },
      visiMisi: {
        visi: 'Menjadi madrasah unggulan yang menghasilkan lulusan berakhlak mulia, cerdas, terampil, dan berwawasan global',
        misi: [
          'Menyelenggarakan pendidikan yang bermutu dan berkarakter Islami',
          'Mengembangkan potensi peserta didik secara optimal',
          'Membangun budaya sekolah yang religius dan disiplin',
          'Meningkatkan kualitas tenaga pendidik dan kependidikan',
          'Mengembangkan sarana dan prasarana pendidikan'
        ]
      },
      sejarah: {
        judulSejarah: 'Sejarah MTs Al-Ittihad Pedaleman',
        isiSejarah:
          'MTs Al-Ittihad Pedaleman didirikan pada tahun 1996 dengan semangat untuk memberikan pendidikan berkualitas yang menggabungkan ilmu agama dan umum...',
        timeline: [
          { tahun: '1996', peristiwa: 'Pendirian Sekolah', deskripsi: 'Didirikan dengan 3 kelas dan 45 siswa' },
          { tahun: '2005', peristiwa: 'Pembangunan Gedung Baru', deskripsi: 'Membangun gedung berlantai 2' },
          { tahun: '2010', peristiwa: 'Akreditasi A', deskripsi: 'Memperoleh akreditasi A dari BAN-S/M' },
          { tahun: '2015', peristiwa: 'Laboratorium Komputer', deskripsi: 'Pembangunan lab komputer modern' },
          { tahun: '2020', peristiwa: 'Digitalisasi', deskripsi: 'Implementasi sistem pembelajaran digital' }
        ]
      },
      kontak: {
        alamat: 'Jl. Raya Pedaleman No. 123, Kabupaten Banyuwangi, Jawa Timur',
        telepon: '(0333) 123456',
        email: 'info@mtsalittihad-pedaleman.sch.id',
        website: 'https://mtsalittihad-pedaleman.sch.id',
        jamOperasional: 'Senin-Jumat: 07.00-15.00 WIB, Sabtu: 07.00-11.00 WIB',
        koordinat: { lat: -8.219, lng: 114.369 }
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching school info:', error)

    return NextResponse.json({ error: 'Failed to fetch school info' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Here you would save to database
    console.log('Saving school info:', body)

    return NextResponse.json({ message: 'School info updated successfully' })
  } catch (error) {
    console.error('Error saving school info:', error)

    return NextResponse.json({ error: 'Failed to save school info' }, { status: 500 })
  }
}
