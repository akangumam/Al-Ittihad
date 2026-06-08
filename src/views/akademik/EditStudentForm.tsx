'use client'

// React Imports
import { useState, useEffect, useMemo, useRef } from 'react'

// Next Imports
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

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
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormLabel from '@mui/material/FormLabel'
import Skeleton from '@mui/material/Skeleton'

// Third-party Imports

import { toast } from 'react-toastify'

// Type Imports
import type { Locale } from '@configs/i18n'

// Utils Imports
import { academicYearAPI, classAPI } from '@/services/api'
import { getLocalizedUrl } from '@/utils/i18n'
import ImageCropDialog from '@/components/ImageCropDialog'

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
  status: 'Aktif' | 'Keluar' | 'Lulus' | ''
}

const EditStudentForm = ({ studentId }: { studentId: string }) => {
  const router = useRouter()
  const { lang: locale } = useParams()

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    academicYear: '',
    enrollmentDate: '',
    sppStartDate: '',
    previousSchool: '',
    status: ''
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

  // Reset class when grade or academic year changes (if it's not in the new available list)
  useEffect(() => {
    // Only reset if availableClasses is loaded and current class is not in it
    if (allClasses.length > 0 && formData.class && !availableClasses.find(c => c.name === formData.class)) {
      setFormData(prev => ({ ...prev, class: '' }))
    }
  }, [availableClasses, allClasses.length, formData.class])

  // Fetch student data
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(`/api/students/${studentId}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Data siswa tidak ditemukan')
          }

          throw new Error('Gagal mengambil data siswa')
        }

        const student = await response.json()

        setFormData({
          nis: student.nis || '',
          nisn: student.nisn || '',
          fullName: student.name || '',
          nickname: student.nickname || '',
          gender: student.gender || '',
          birthPlace: student.birthPlace || '',
          birthDate: student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : '',
          religion: student.religion || '',
          fatherName: student.fatherName || '',
          motherName: student.motherName || '',
          guardianName: student.guardianName || '',
          guardianRelation: student.guardianRelation || '',
          phone: student.phone || '',
          guardianPhone: student.parentPhone || '', // Note: API returns parentPhone
          email: student.email || '',
          address: student.address || '',
          rt: student.rt || '',
          rw: student.rw || '',
          kelurahan: student.kelurahan || '',
          kecamatan: student.kecamatan || '',
          city: student.city || '',
          province: student.province || '',
          postalCode: student.postalCode || '',
          grade: student.grade || '',
          class: student.class || '',
          academicYear: '2024/2025', // Default or fetch from somewhere else if needed
          enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate).toISOString().split('T')[0] : '',
          sppStartDate: student.sppStartDate ? new Date(student.sppStartDate).toISOString().split('T')[0] : '',
          previousSchool: student.previousSchool || '',
          status: student.status || 'Aktif'
        })

        if (student.photo) {
          setPhotoPreview(student.photo)
        }
      } catch (err: any) {
        console.error('Error fetching student:', err)
        toast.error('Gagal memuat data siswa')
      } finally {
        setIsLoading(false)
      }
    }

    if (studentId) {
      fetchStudent()
    }
  }, [studentId])

  const openFilePicker = () => fileInputRef.current?.click()

  const handleFileSelected = (file: File) => {
    const reader = new FileReader()

    reader.onload = () => setCropSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

    if (!formData.guardianPhone) {
      setSubmitError('Nomor HP orang tua/wali wajib diisi')

      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const updatedStudent = {
        nis: formData.nis,
        nisn: formData.nisn,
        name: formData.fullName,
        nickname: formData.nickname,
        grade: formData.grade,
        class: formData.class,
        birthPlace: formData.birthPlace,
        birthDate: formData.birthDate,
        gender: formData.gender,
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
        status: formData.status,
        photo: photoPreview || undefined
      }

      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedStudent)
      })

      if (!response.ok) {
        const errorData = await response.json()
        const detail = errorData.details ? ` (${errorData.details})` : ''

        throw new Error((errorData.error || 'Gagal memperbarui data siswa') + detail)
      }

      toast.success(`Data siswa ${formData.fullName} berhasil diperbarui!`, {
        position: 'top-right',
        autoClose: 3000
      })

      router.push(getLocalizedUrl('/akademik/data-siswa', locale as Locale))
    } catch (err: any) {
      console.error('Error updating student:', err)
      setSubmitError(err.message || 'Terjadi kesalahan saat menyimpan data')
      toast.error(err.message || 'Gagal menyimpan perubahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const isFormValid = formData.nis && formData.nisn && formData.fullName && formData.gender && formData.grade

  if (isLoading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Skeleton variant='rectangular' height={100} className='rounded-lg' />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Skeleton variant='rectangular' height={400} className='rounded-lg' />
        </Grid>
      </Grid>
    )
  }

  return (
    <>
      <Button
        startIcon={<i className='ri-arrow-left-line' />}
        component={Link}
        href={getLocalizedUrl('/akademik/data-siswa', locale as Locale)}
        className='mb-4'
      >
        Kembali ke Daftar Siswa
      </Button>
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
                <span className='text-error'>*</span> Mode Edit: Anda sedang mengubah data siswa{' '}
                <strong>{formData.fullName}</strong>.
              </Typography>
              <Chip label='Pastikan Data Valid' size='small' color='warning' variant='outlined' />
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
                    Foto Siswa
                  </Typography>
                  <div className='flex flex-col items-center gap-3'>
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt='Foto Siswa'
                        className='w-32 h-32 object-cover rounded-full border-2 border-primary'
                      />
                    ) : (
                      <div className='w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300'>
                        <span className='text-3xl font-bold text-gray-400'>{formData.fullName.charAt(0)}</span>
                      </div>
                    )}
                    <div className='flex gap-2'>
                      <Button
                        variant='outlined'
                        size='small'
                        startIcon={<i className='ri-upload-2-line' />}
                        onClick={openFilePicker}
                      >
                        {photoPreview ? 'Ganti Foto' : 'Upload Foto'}
                      </Button>
                      {photoPreview && (
                        <Button
                          variant='outlined'
                          size='small'
                          color='error'
                          startIcon={<i className='ri-delete-bin-line' />}
                          onClick={() => setPhotoPreview(null)}
                        >
                          Hapus
                        </Button>
                      )}
                    </div>
                    <Typography variant='caption' color='text.secondary'>
                      JPG, PNG · Maks 5MB · Akan di-crop otomatis
                    </Typography>
                  </div>

                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    hidden
                    onChange={e => {
                      const file = e.target.files?.[0]

                      if (file) handleFileSelected(file)
                      e.target.value = ''
                    }}
                  />

                  {cropSrc && (
                    <ImageCropDialog
                      open={!!cropSrc}
                      imageSrc={cropSrc}
                      onComplete={cropped => {
                        setPhotoPreview(cropped)
                        setCropSrc(null)
                      }}
                      onClose={() => setCropSrc(null)}
                    />
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    label='NIS'
                    value={formData.nis}
                    onChange={e => handleChange('nis', e.target.value)}
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
                    sx={{ '& .MuiFormLabel-asterisk': { color: 'error.main' } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label='Nama Panggilan'
                    value={formData.nickname}
                    onChange={e => handleChange('nickname', e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <FormLabel sx={{ '& .MuiFormLabel-asterisk': { color: 'error.main' } }}>Jenis Kelamin</FormLabel>
                    <RadioGroup
                      row
                      value={formData.gender}
                      onChange={(e: any) => handleChange('gender', e.target.value)}
                    >
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
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label='Nama Ibu'
                    value={formData.motherName}
                    onChange={e => handleChange('motherName', e.target.value)}
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
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label='Hubungan dengan Siswa'
                    value={formData.guardianRelation}
                    onChange={e => handleChange('guardianRelation', e.target.value)}
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
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    required
                    label='No. HP Orang Tua/Wali'
                    value={formData.guardianPhone}
                    onChange={e => handleChange('guardianPhone', e.target.value)}
                    helperText='Sangat penting untuk info tagihan'
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
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label='RT'
                    value={formData.rt}
                    onChange={e => handleChange('rt', e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label='RW'
                    value={formData.rw}
                    onChange={e => handleChange('rw', e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label='Kelurahan/Desa'
                    value={formData.kelurahan}
                    onChange={e => handleChange('kelurahan', e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label='Kecamatan'
                    value={formData.kecamatan}
                    onChange={e => handleChange('kecamatan', e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label='Kota/Kabupaten'
                    value={formData.city}
                    onChange={e => handleChange('city', e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label='Provinsi'
                    value={formData.province}
                    onChange={e => handleChange('province', e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label='Kode Pos'
                    value={formData.postalCode}
                    onChange={e => handleChange('postalCode', e.target.value)}
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
                      <MenuItem value='Lulus'>Lulus</MenuItem>
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
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default EditStudentForm
