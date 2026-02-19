'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import LinearProgress from '@mui/material/LinearProgress'

// Third-party Imports
import { useDropzone } from 'react-dropzone'

// Context Imports
import type { StudentType } from '@/contexts/AppContext'
import { studentAPI } from '@/services/api'

type ImportStudentModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const ImportStudentModal = ({ open, onClose, onSuccess }: ImportStudentModalProps) => {
  const [students, setStudents] = useState<StudentType[]>([])

  // Fetch existing students for duplicate checking
  const fetchExistingStudents = async () => {
    try {
      const data = await studentAPI.getAll()

      setStudents(data)
    } catch (error) {
      console.error('Error fetching existing students:', error)
    }
  }

  // Fetch on mount/open
  if (open && students.length === 0) {
    fetchExistingStudents()
  }

  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<Partial<StudentType>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      const selectedFile = acceptedFiles[0]

      if (selectedFile) {
        setFile(selectedFile)
        parseCSV(selectedFile)
      }
    }
  })

  const parseCSV = (file: File) => {
    setIsProcessing(true)
    setError(null)

    const reader = new FileReader()

    reader.onload = event => {
      try {
        const text = event.target?.result as string
        const lines = text.split('\n')

        // Auto-detect delimiter: check first line for comma or semicolon
        const firstLine = lines[0]
        const delimiter = firstLine.includes(';') ? ';' : ','

        const headers = firstLine.split(delimiter).map(h => h.trim().replace(/"/g, ''))

        // Mapping from Indonesian Header to Internal Field Key
        const headerMap: { [key: string]: keyof StudentType | string } = {
          NIS: 'nis',
          NISN: 'nisn',
          'Nama Lengkap': 'name',
          'Nama Panggilan': 'nickname',
          'Jenis Kelamin (L/P)': 'gender',
          'Tempat Lahir': 'birthPlace',
          'Tanggal Lahir (YYYY-MM-DD)': 'birthDate',
          Agama: 'religion',
          'Nama Ayah': 'fatherName',
          'Nama Ibu': 'motherName',
          'Nama Wali': 'guardianName',
          'Hubungan Wali': 'guardianRelation',
          'No HP Siswa': 'phone',
          'No HP Ortu': 'parentPhone',
          Email: 'email',
          Alamat: 'address',
          RT: 'rt',
          RW: 'rw',
          Kelurahan: 'kelurahan',
          Kecamatan: 'kecamatan',
          'Kota/Kabupaten': 'city',
          Provinsi: 'province',
          'Kode Pos': 'postalCode',
          'Tingkat (7/8/9)': 'grade',
          'Kelas (A/B/C)': 'class',
          'Tahun Ajaran': 'academicYear',
          'Tanggal Masuk (YYYY-MM-DD)': 'enrollmentDate',
          'Asal Sekolah': 'previousSchool',
          Status: 'status'
        }

        const requiredHeaders = [
          'NIS',
          'NISN',
          'Nama Lengkap',
          'Jenis Kelamin (L/P)',
          'Tingkat (7/8/9)',
          'Kelas (A/B/C)'
        ]

        // Check if headers exist (case insensitive)
        const missingHeaders = requiredHeaders.filter(req => !headers.some(h => h.toLowerCase() === req.toLowerCase()))

        if (missingHeaders.length > 0) {
          setError(`Format CSV tidak valid. Header berikut hilang: ${missingHeaders.join(', ')}`)
          setIsProcessing(false)

          return
        }

        const parsedData: Partial<StudentType>[] = []

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue

          const values = lines[i].split(delimiter).map(v => v.trim().replace(/"/g, ''))
          const rowData: any = {}

          headers.forEach((header, index) => {
            // Find the internal key for this header
            const internalKey = Object.keys(headerMap).find(key => key.toLowerCase() === header.toLowerCase())

            if (internalKey) {
              rowData[headerMap[internalKey]] = values[index]
            }
          })

          // Basic validation
          if (rowData.nis && rowData.name) {
            parsedData.push({
              ...rowData,
              status: rowData.status || 'Aktif',
              academicYear: rowData.academicYear || '2024/2025'
            })
          }
        }

        setPreviewData(parsedData)
      } catch (err) {
        setError('Gagal memproses file CSV. Pastikan format file benar.')
        console.error(err)
      } finally {
        setIsProcessing(false)
      }
    }

    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (previewData.length === 0) return

    const newStudents: StudentType[] = previewData.map(data => ({
      id: `STD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nis: data.nis || '',
      nisn: data.nisn || '',
      name: data.name || '',
      nickname: data.nickname || '',
      grade: data.grade || '',
      class: data.class || '',
      birthPlace: data.birthPlace || '',
      birthDate: data.birthDate || '',
      gender: (data.gender as 'L' | 'P') || 'L',
      religion: data.religion || '',
      address: data.address || '',
      rt: data.rt || '',
      rw: data.rw || '',
      kelurahan: data.kelurahan || '',
      kecamatan: data.kecamatan || '',
      city: data.city || '',
      province: data.province || '',
      postalCode: data.postalCode || '',
      parentName: data.parentName || data.fatherName || '', // Use mapped parentName or fallback to fatherName
      fatherName: data.fatherName || '',
      motherName: data.motherName || '',
      guardianName: data.guardianName || '',
      guardianRelation: data.guardianRelation || '',
      phone: data.phone || '',
      parentPhone: data.parentPhone || '',
      email: data.email || '',
      enrollmentDate: data.enrollmentDate || '',
      previousSchool: data.previousSchool || '',
      status: (data.status as any) || 'Aktif',
      photo: undefined,
      academicYear: data.academicYear || '2024/2025'
    }))

    // Filter out duplicates based on NIS
    const uniqueNewStudents = newStudents.filter(
      newStudent => !students.some(existing => existing.nis === newStudent.nis)
    )

    if (uniqueNewStudents.length < newStudents.length) {
      alert(`${newStudents.length - uniqueNewStudents.length} siswa duplikat (NIS sama) diabaikan.`)
    }

    // Process imports sequentially to avoid race conditions
    setIsProcessing(true)
    let successCount = 0
    let failCount = 0

    try {
      for (const student of uniqueNewStudents) {
        try {
          await studentAPI.create(student)
          successCount++
        } catch (error) {
          console.error(`Failed to import student ${student.name}:`, error)
          failCount++
        }
      }

      if (failCount > 0) {
        alert(`Import selesai. ${successCount} berhasil, ${failCount} gagal.`)
      } else {
        // toast.success(`Berhasil mengimport ${successCount} siswa`)
      }

      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Import error:', error)
      setError('Terjadi kesalahan saat menyimpan data.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreviewData([])
    setError(null)
    onClose()
  }

  const downloadTemplate = () => {
    const headers = [
      'NIS',
      'NISN',
      'Nama Lengkap',
      'Nama Panggilan',
      'Jenis Kelamin (L/P)',
      'Tempat Lahir',
      'Tanggal Lahir (YYYY-MM-DD)',
      'Agama',
      'Nama Ayah',
      'Nama Ibu',
      'Nama Wali',
      'Hubungan Wali',
      'No HP Siswa',
      'No HP Ortu',
      'Email',
      'Alamat',
      'RT',
      'RW',
      'Kelurahan',
      'Kecamatan',
      'Kota/Kabupaten',
      'Provinsi',
      'Kode Pos',
      'Tingkat (7/8/9)',
      'Kelas (A/B/C)',
      'Tahun Ajaran',
      'Tanggal Masuk (YYYY-MM-DD)',
      'Asal Sekolah',
      'Status'
    ]

    const sampleRow = [
      '2024001',
      '0012345678',
      'Ahmad Fauzi',
      'Fauzi',
      'L',
      'Jakarta',
      '2010-01-01',
      'Islam',
      'Budi Santoso',
      'Siti Aminah',
      '',
      '',
      '08123456789',
      '08198765432',
      'fauzi@example.com',
      'Jl. Merdeka No. 10',
      '001',
      '002',
      'Menteng',
      'Menteng',
      'Jakarta Pusat',
      'DKI Jakarta',
      '10310',
      '7',
      'A',
      '2024/2025',
      '2024-07-15',
      'SDN 01 Pagi',
      'Aktif'
    ]

    // Use semicolon (;) for Excel compatibility in Indonesia
    const csvContent = [headers.join(';'), sampleRow.join(';')].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = 'template_import_siswa.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>Import Data Siswa</DialogTitle>
      <DialogContent>
        <Box className='mb-4'>
          <Typography variant='body2' className='mb-2'>
            Silakan upload file CSV dengan format yang sesuai. Field wajib: NIS, NISN, Nama, Gender (L/P), Kelas,
            Tingkat.
          </Typography>
          <Button variant='text' size='small' onClick={downloadTemplate} startIcon={<i className='ri-download-line' />}>
            Download Template CSV
          </Button>
        </Box>

        <Box
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            file ? 'border-primary bg-primary-light/10' : 'border-gray-300 hover:border-primary'
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className='flex flex-col items-center gap-2'>
              <i className='ri-file-excel-2-line text-4xl text-success' />
              <Typography variant='h6'>{file.name}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {(file.size / 1024).toFixed(2)} KB
              </Typography>
              <Button
                size='small'
                color='error'
                onClick={e => {
                  e.stopPropagation()
                  setFile(null)
                  setPreviewData([])
                }}
              >
                Ganti File
              </Button>
            </div>
          ) : (
            <div className='flex flex-col items-center gap-2'>
              <i className='ri-upload-cloud-line text-4xl text-textSecondary' />
              <Typography variant='h6'>Klik atau drag file CSV ke sini</Typography>
              <Typography variant='body2' color='text.secondary'>
                Hanya file .csv yang didukung
              </Typography>
            </div>
          )}
        </Box>

        {isProcessing && <LinearProgress className='mt-4' />}

        {error && (
          <Alert severity='error' className='mt-4'>
            {error}
          </Alert>
        )}

        {previewData.length > 0 && (
          <Box className='mt-6'>
            <Typography variant='h6' className='mb-2'>
              Preview Data ({previewData.length} siswa)
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
              <Table stickyHeader size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>NIS</TableCell>
                    <TableCell>Nama</TableCell>
                    <TableCell>Kelas</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Ortu</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.nis}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>
                        {row.grade}
                        {row.class}
                      </TableCell>
                      <TableCell>{row.gender}</TableCell>
                      <TableCell>{row.parentName || row.fatherName}</TableCell>
                    </TableRow>
                  ))}
                  {previewData.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={5} align='center'>
                        ... dan {previewData.length - 10} data lainnya
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='secondary'>
          Batal
        </Button>
        <Button onClick={handleImport} variant='contained' disabled={previewData.length === 0 || isProcessing}>
          Import Data
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ImportStudentModal
