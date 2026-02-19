'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormLabel from '@mui/material/FormLabel'
import Chip from '@mui/material/Chip'

// Third-party Imports
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-toastify'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { StudentType } from '@/contexts/AppContext'

// Utils Imports
import { academicYearAPI, classAPI } from '@/services/api'
import { getLocalizedUrl } from '@/utils/i18n'

type StudentFormData = {
  nis: string
  nisn: string
  fullName: string
  nickname: string
  gender: 'L' | 'P' | ''
  birthPlace: string
  birthDate: string
  religion: string

  // Data Orang Tua/Wali
  fatherName: string
  motherName: string
  guardianName: string
  guardianRelation: string

  // Data Kontak
  phone: string
  parentPhone: string
  guardianPhone: string
  email: string

  // Alamat
  address: string
  rt: string
  rw: string
  kelurahan: string
  kecamatan: string
  city: string
  province: string
  postalCode: string

  // Data Akademik
  grade: string
  class: string
  academicYear: string
  enrollmentDate: string
  sppStartDate: string
  previousSchool: string

  // Status
  status: 'Aktif' | 'Keluar' | ''
}

const AddStudentForm = () => {
  const router = useRouter()
  const { lang: locale } = useParams()

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState<StudentFormData>({
    nis: '',
    nisn: '',
    fullName: '',
    nickname: '',
    gender: '',
    birthPlace: '',
    birthDate: '',
    religion: '',
    fatherName: '',
    motherName: '',
    guardianName: '',
    guardianRelation: '',
    phone: '',
    parentPhone: '',
    guardianPhone: '',
    email: '',
    address: '',
    rt: '',
    rw: '',
    kelurahan: '',
    kecamatan: '',
    city: '',
    province: '',
    postalCode: '',
    grade: '',
    class: '',
    academicYear: '2024/2025',
    enrollmentDate: '',
    sppStartDate: '',
    previousSchool: '',
    status: 'Aktif'
  })

  // Dynamic Data States
  const [academicYears, setAcademicYears] = useState<any[]>([])
  const [allClasses, setAllClasses] = useState<any[]>([])

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [years, classes] = await Promise.all([academicYearAPI.getAll(), classAPI.getAll()])

        setAcademicYears(years)
        setAllClasses(classes)

        // Set default academic year to active one
        const activeYear = years.find((y: any) => y.isActive)

        if (activeYear) {
          setFormData(prev => ({ ...prev, academicYear: activeYear.name }))
        }
      } catch (error) {
        console.error('Error fetching dynamic data:', error)
        toast.error('Gagal memuat data akademik')
      }
    }

    fetchData()
  }, [])

  // Filtered classes based on grade and academic year
  const availableClasses = useMemo(() => {
    return allClasses.filter(c => c.grade === formData.grade && c.academicYear === formData.academicYear)
  }, [allClasses, formData.grade, formData.academicYear])

  // Reset class when grade or academic year changes
  useEffect(() => {
    if (formData.class && !availableClasses.find(c => c.name === formData.class)) {
      setFormData(prev => ({ ...prev, class: '' }))
    }
  }, [availableClasses, formData.class])

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0]

      if (file) {
        const reader = new FileReader()

        reader.onload = () => {
          setPhotoPreview(reader.result as string)
        }

        reader.readAsDataURL(file)
      }
    }
  })

  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user types
    if (submitError) setSubmitError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.nis) {
      setSubmitError('NIS wajib diisi')

      return false
    }

    if (!formData.nisn) {
      setSubmitError('NISN wajib diisi')

      return false
    }

    if (!formData.fullName) {
      setSubmitError('Nama lengkap wajib diisi')

      return false
    }

    if (!formData.gender) {
      setSubmitError('Jenis kelamin wajib dipilih')

      return false
    }

    if (!formData.grade) {
      setSubmitError('Tingkat/Kelas wajib dipilih')

      return false
    }

    if (!formData.class) {
      setSubmitError('Kelas wajib dipilih')

      return false
    }

    if (!formData.parentPhone && !formData.guardianPhone) {
      setSubmitError('Nomor HP orang tua/wali wajib diisi')

      return false
    }

    return true
  }

  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const studentData: Omit<StudentType, 'id'> = {
        nis: formData.nis,
        nisn: formData.nisn,
        name: formData.fullName,
        nickname: formData.nickname,
        grade: formData.grade,
        class: formData.class,
        birthPlace: formData.birthPlace,
        birthDate: formData.birthDate,
        gender: formData.gender as 'L' | 'P',
        religion: formData.religion,
        address: formData.address,
        rt: formData.rt,
        rw: formData.rw,
        kelurahan: formData.kelurahan,
        kecamatan: formData.kecamatan,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        parentName: formData.fatherName || formData.motherName || formData.guardianName,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        guardianName: formData.guardianName,
        guardianRelation: formData.guardianRelation,
        phone: formData.phone,
        parentPhone: formData.guardianPhone,
        email: formData.email,
        enrollmentDate: formData.enrollmentDate,
        sppStartDate: formData.sppStartDate,
        previousSchool: formData.previousSchool,
        status: formData.status as 'Aktif' | 'Lulus' | 'Keluar' | 'Cuti',
        photo: photoPreview || undefined
      }

      // Call API to create student
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
      })

      if (!response.ok) {
        const error = await response.json()

        throw new Error(error.error || 'Gagal menambahkan siswa')
      }

      const newStudent = await response.json()

      // Show success toast
      toast.success(`Siswa ${newStudent.name} berhasil ditambahkan!`, {
        position: 'top-right',
        autoClose: 3000
      })

      // Redirect to student list
      router.push(getLocalizedUrl('/akademik/data-siswa', locale as Locale))
    } catch (error: any) {
      console.error('Error creating student:', error)
      setSubmitError(error.message || 'Terjadi kesalahan saat menambahkan siswa')

      toast.error(error.message || 'Gagal menambahkan siswa', {
        position: 'top-right',
        autoClose: 5000
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(getLocalizedUrl('/akademik/data-siswa', locale as Locale))
  }

  const isFormValid = formData.nis && formData.nisn && formData.fullName && formData.gender && formData.grade

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Alert
          severity='info'
          variant='standard'
          icon={<i className='ri-information-line' />}
          sx={{ '& .MuiAlert-message': { width: '100%' } }}
        >
          <div className='flex flex-col sm:flex-row justify-between items-center gap-2'>
            <Typography variant='body2' className='font-medium'>
              <span className='text-error'>*</span> Menunjukkan field yang wajib diisi. Mohon lengkapi data utama untuk
              melanjutkan.
            </Typography>
            <Chip label='Sistem Penomoran Otomatis Aktif' size='small' color='primary' variant='outlined' />
          </div>
        </Alert>
      </Grid>

      {/* Data Pribadi */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Data Pribadi Siswa' />
          <CardContent>
            <Grid container spacing={5}>
              {/* Photo Upload */}
              <Grid size={{ xs: 12 }}>
                <Typography variant='body2' className='mbe-2'>
                  Foto Siswa (Opsional)
                </Typography>
                <div
                  {...getRootProps({
                    className:
                      'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors'
                  })}
                >
                  <input {...getInputProps()} />
                  {photoPreview ? (
                    <div className='flex flex-col items-center gap-4'>
                      <img src={photoPreview} alt='Preview' className='w-32 h-32 object-cover rounded-lg' />
                      <Typography variant='body2' color='text.secondary'>
                        Klik untuk ganti foto
                      </Typography>
                    </div>
                  ) : (
                    <div className='flex flex-col items-center gap-2'>
                      <i className='ri-upload-cloud-line text-4xl text-textSecondary' />
                      <Typography variant='body2' color='text.secondary'>
                        Klik atau drag foto siswa ke sini
                      </Typography>
                      <Typography variant='caption' color='text.disabled'>
                        Format: JPG, PNG (Max 2MB)
                      </Typography>
                    </div>
                  )}
                </div>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  label='NIS'
                  value={formData.nis}
                  onChange={e => handleChange('nis', e.target.value)}
                  placeholder='202400001'
                  helperText='Contoh: 202400001'
                  sx={{ '& .MuiFormLabel-asterisk': { color: 'error.main' } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  label='NISN'
                  value={formData.nisn}
                  onChange={e => handleChange('nisn', e.target.value)}
                  placeholder='0012345678'
                  helperText='10 digit nomor induk nasional'
                  sx={{ '& .MuiFormLabel-asterisk': { color: 'error.main' } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  required
                  label='Nama Lengkap'
                  value={formData.fullName}
                  onChange={e => handleChange('fullName', e.target.value)}
                  placeholder='Masukkan nama sesuai ijazah'
                  sx={{ '& .MuiFormLabel-asterisk': { color: 'error.main' } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label='Nama Panggilan'
                  value={formData.nickname}
                  onChange={e => handleChange('nickname', e.target.value)}
                  placeholder='Fauzi'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <FormLabel sx={{ '& .MuiFormLabel-asterisk': { color: 'error.main' } }}>Jenis Kelamin</FormLabel>
                  <RadioGroup row value={formData.gender} onChange={e => handleChange('gender', e.target.value)}>
                    <FormControlLabel value='L' control={<Radio />} label='Laki-laki' />
                    <FormControlLabel value='P' control={<Radio />} label='Perempuan' />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Agama</InputLabel>
                  <Select
                    value={formData.religion}
                    onChange={e => handleChange('religion', e.target.value)}
                    label='Agama'
                  >
                    <MenuItem value='Islam'>Islam</MenuItem>
                    <MenuItem value='Kristen'>Kristen</MenuItem>
                    <MenuItem value='Katolik'>Katolik</MenuItem>
                    <MenuItem value='Hindu'>Hindu</MenuItem>
                    <MenuItem value='Buddha'>Buddha</MenuItem>
                    <MenuItem value='Konghucu'>Konghucu</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Tempat Lahir'
                  value={formData.birthPlace}
                  onChange={e => handleChange('birthPlace', e.target.value)}
                  placeholder='Serang'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type='date'
                  label='Tanggal Lahir'
                  value={formData.birthDate}
                  onChange={e => handleChange('birthDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Data Orang Tua/Wali */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Data Orang Tua / Wali' />
          <CardContent>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Nama Ayah'
                  value={formData.fatherName}
                  onChange={e => handleChange('fatherName', e.target.value)}
                  placeholder='Bapak Rahman'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Nama Ibu'
                  value={formData.motherName}
                  onChange={e => handleChange('motherName', e.target.value)}
                  placeholder='Ibu Siti'
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider>
                  <Typography variant='caption' color='text.secondary'>
                    Wali (Jika berbeda dengan orang tua)
                  </Typography>
                </Divider>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Nama Wali'
                  value={formData.guardianName}
                  onChange={e => handleChange('guardianName', e.target.value)}
                  placeholder='Nama lengkap wali'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Hubungan dengan Siswa'
                  value={formData.guardianRelation}
                  onChange={e => handleChange('guardianRelation', e.target.value)}
                  placeholder='Paman, Kakek, dll'
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Data Kontak */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Informasi Kontak' />
          <CardContent>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label='Nomor HP Siswa'
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder='081234567890'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  required
                  label='No. HP Orang Tua/Wali'
                  value={formData.guardianPhone}
                  onChange={e => handleChange('guardianPhone', e.target.value)}
                  placeholder='081234567890'
                  helperText='Untuk pengiriman info tagihan/absensi'
                  sx={{ '& .MuiFormLabel-asterisk': { color: 'error.main' } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type='email'
                  label='Email (Opsional)'
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder='email@example.com'
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Alamat */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Alamat Lengkap' />
          <CardContent>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Alamat'
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder='Jalan, nomor rumah, nama perumahan, dll'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  label='RT'
                  value={formData.rt}
                  onChange={e => handleChange('rt', e.target.value)}
                  placeholder='001'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  label='RW'
                  value={formData.rw}
                  onChange={e => handleChange('rw', e.target.value)}
                  placeholder='005'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Kelurahan/Desa'
                  value={formData.kelurahan}
                  onChange={e => handleChange('kelurahan', e.target.value)}
                  placeholder='Kelurahan'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Kecamatan'
                  value={formData.kecamatan}
                  onChange={e => handleChange('kecamatan', e.target.value)}
                  placeholder='Kecamatan'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Kota/Kabupaten'
                  value={formData.city}
                  onChange={e => handleChange('city', e.target.value)}
                  placeholder='Serang'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Provinsi'
                  value={formData.province}
                  onChange={e => handleChange('province', e.target.value)}
                  placeholder='Banten'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Kode Pos'
                  value={formData.postalCode}
                  onChange={e => handleChange('postalCode', e.target.value)}
                  placeholder='12345'
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Data Akademik */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Informasi Akademik' />
          <CardContent>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth required sx={{ '& .MuiFormLabel-asterisk': { color: 'error.main' } }}>
                  <InputLabel>Tingkat/Kelas</InputLabel>
                  <Select
                    value={formData.grade}
                    onChange={e => handleChange('grade', e.target.value)}
                    label='Tingkat/Kelas'
                  >
                    <MenuItem value='7'>Kelas 7</MenuItem>
                    <MenuItem value='8'>Kelas 8</MenuItem>
                    <MenuItem value='9'>Kelas 9</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth required sx={{ '& .MuiFormLabel-asterisk': { color: 'error.main' } }}>
                  <InputLabel>Kelas</InputLabel>
                  <Select
                    value={formData.class}
                    onChange={e => handleChange('class', e.target.value)}
                    label='Kelas'
                    disabled={!formData.grade || !formData.academicYear}
                  >
                    {availableClasses.length > 0 ? (
                      availableClasses.map(cls => (
                        <MenuItem key={cls.id} value={cls.name}>
                          {cls.name} (Tersedia: {cls.capacity - cls.currentStudents})
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value=''>
                        {!formData.grade ? 'Pilih tingkat dahulu' : 'Belum ada kelas di tingkat ini'}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth required sx={{ '& .MuiFormLabel-asterisk': { color: 'error.main' } }}>
                  <InputLabel>Tahun Ajaran</InputLabel>
                  <Select
                    value={formData.academicYear}
                    onChange={e => handleChange('academicYear', e.target.value)}
                    label='Tahun Ajaran'
                  >
                    {academicYears.map(year => (
                      <MenuItem key={year.id} value={year.name}>
                        {year.name} {year.isActive ? '(Aktif)' : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type='date'
                  label='Tanggal Masuk'
                  value={formData.enrollmentDate}
                  onChange={e => handleChange('enrollmentDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type='date'
                  label='Tanggal Mulai SPP'
                  value={formData.sppStartDate}
                  onChange={e => handleChange('sppStartDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText='Kosongkan jika sama dengan tanggal masuk'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Asal Sekolah'
                  value={formData.previousSchool}
                  onChange={e => handleChange('previousSchool', e.target.value)}
                  placeholder='SD/MI'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status Siswa</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={e => handleChange('status', e.target.value)}
                    label='Status Siswa'
                  >
                    <MenuItem value='Aktif'>Aktif</MenuItem>
                    <MenuItem value='Keluar'>Keluar</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Error Alert */}
      {submitError && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='error' onClose={() => setSubmitError(null)}>
            <Typography variant='body2'>{submitError}</Typography>
          </Alert>
        </Grid>
      )}

      {/* Action Buttons */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex justify-between items-center'>
            <Button variant='outlined' color='secondary' onClick={handleCancel} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              startIcon={isSubmitting && <i className='ri-loader-4-line animate-spin' />}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Data Siswa'}
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AddStudentForm
