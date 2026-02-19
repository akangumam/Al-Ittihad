'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Type Imports
import type { Locale } from '@configs/i18n'

// Service Imports
import { teacherAPI } from '@/services/api'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const EditTeacherForm = ({ teacherId }: { teacherId: string }) => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isManualSubject, setIsManualSubject] = useState(false)

  const subjects = useMemo(
    () => [
      'Matematika',
      'Bahasa Indonesia',
      'Bahasa Inggris',
      'IPA',
      'IPS',
      'Pendidikan Agama Islam',
      'PJOK',
      'Seni Budaya',
      'PKN',
      'TIK',
      'Bahasa Arab',
      'Bahasa Sunda',
      'Prakarya',
      'Mulok'
    ],
    []
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      nip: '',
      nuptk: '',
      gender: '',
      birthPlace: '',
      birthDate: '',
      email: '',
      phone: '',
      address: '',
      status: 'Aktif',
      position: '',
      education: '',
      subject: ''
    }
  })

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        setIsLoading(true)
        const teacher = await teacherAPI.getById(teacherId)

        if (teacher) {
          reset({
            name: teacher.name,
            nip: teacher.nip,
            nuptk: teacher.nuptk,
            gender: teacher.gender,
            birthPlace: teacher.birthPlace || '',
            birthDate: teacher.birthDate || '',
            email: teacher.email,
            phone: teacher.phone,
            address: teacher.address,
            status: teacher.status,
            position: teacher.position,
            education: teacher.education || 'S1',
            subject: teacher.subject
          })

          // Check if subject is manual
          if (teacher.subject && !subjects.includes(teacher.subject)) {
            setIsManualSubject(true)
          }

          // Load existing photo
          if (teacher.photo) {
            setPhotoPreview(teacher.photo)
          }
        }
      } catch (error) {
        console.error('Error fetching teacher:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeacher()
  }, [teacherId, reset, subjects])

  const onSubmit = async (data: any) => {
    try {
      await teacherAPI.update(teacherId, {
        ...data,
        photo: photoPreview
      })

      // Navigate back to teacher list
      router.push(getLocalizedUrl('/akademik/data-guru', locale as Locale))
    } catch (error) {
      console.error('Error updating teacher:', error)
      alert('Gagal memperbarui data guru.')
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      setFile(file)

      // Create preview
      const reader = new FileReader()

      reader.onload = () => {
        setPhotoPreview(reader.result as string)
      }

      reader.readAsDataURL(file)
    }
  }

  return (
    <>
      <Button
        startIcon={<i className='ri-arrow-left-line' />}
        component={Link}
        href={getLocalizedUrl('/akademik/data-guru', locale as Locale)}
        className='mb-4'
      >
        Kembali ke Daftar Guru
      </Button>
      <Card>
        <CardContent>
          <div className='flex justify-between items-center mbe-6'>
            <Typography variant='h5'>Edit Data Guru</Typography>
            {isLoading && <i className='ri-loader-4-line animate-spin text-2xl' />}
          </div>

          <Alert severity='info' className='mb-6'>
            Anda sedang mengedit data guru. Pastikan data yang dimasukkan sudah benar.
          </Alert>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-6'>
              {/* Data Pribadi */}
              <div>
                <Typography variant='h6' className='mbe-4'>
                  Data Pribadi
                </Typography>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Photo Upload - Moved to top */}
                  <div className='md:col-span-2'>
                    <Typography variant='body2' className='mbe-2'>
                      Foto Profil (Opsional)
                    </Typography>
                    {photoPreview ? (
                      <div className='flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-lg'>
                        <img src={photoPreview} alt='Preview' className='w-32 h-32 object-cover rounded-lg' />
                        <Button component='label' variant='outlined' size='small'>
                          Ganti Foto
                          <input type='file' hidden accept='image/*' onChange={handleFileChange} />
                        </Button>
                        {file && (
                          <Typography variant='caption' color='text.secondary'>
                            {file.name}
                          </Typography>
                        )}
                      </div>
                    ) : (
                      <Button
                        component='label'
                        variant='outlined'
                        startIcon={<i className='ri-upload-2-line' />}
                        className='w-full h-[56px]'
                      >
                        Upload Foto Profil
                        <input type='file' hidden accept='image/*' onChange={handleFileChange} />
                      </Button>
                    )}
                  </div>

                  <Controller
                    name='name'
                    control={control}
                    rules={{ required: 'Nama lengkap wajib diisi' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Nama Lengkap'
                        placeholder='Nama lengkap beserta gelar'
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                  <Controller
                    name='nip'
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} fullWidth label='NIP' placeholder='Nomor Induk Pegawai' />
                    )}
                  />
                  <Controller
                    name='nuptk'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='NUPTK'
                        placeholder='Nomor Unik Pendidik dan Tenaga Kependidikan'
                      />
                    )}
                  />
                  <Controller
                    name='gender'
                    control={control}
                    rules={{ required: 'Jenis kelamin wajib dipilih' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.gender}>
                        <InputLabel>Jenis Kelamin</InputLabel>
                        <Select {...field} label='Jenis Kelamin'>
                          <MenuItem value='L'>Laki-laki</MenuItem>
                          <MenuItem value='P'>Perempuan</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                  <Controller
                    name='birthPlace'
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} fullWidth label='Tempat Lahir' placeholder='Kota kelahiran' />
                    )}
                  />
                  <Controller
                    name='birthDate'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type='date'
                        label='Tanggal Lahir'
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </div>
              </div>

              <Divider />

              {/* Kontak & Alamat */}
              <div>
                <Typography variant='h6' className='mbe-4'>
                  Kontak & Alamat
                </Typography>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <Controller
                    name='email'
                    control={control}
                    rules={{ required: 'Email wajib diisi' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type='email'
                        label='Email'
                        placeholder='alamat@email.com'
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    )}
                  />
                  <Controller
                    name='phone'
                    control={control}
                    rules={{ required: 'Nomor HP wajib diisi' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Nomor HP/WA'
                        placeholder='081234567890'
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                      />
                    )}
                  />
                  <div className='md:col-span-2'>
                    <Controller
                      name='address'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={3}
                          label='Alamat Lengkap'
                          placeholder='Jalan, RT/RW, Kelurahan, Kecamatan'
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              <Divider />

              {/* Data Kepegawaian */}
              <div>
                <Typography variant='h6' className='mbe-4'>
                  Data Kepegawaian
                </Typography>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <Controller
                    name='status'
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Status Kepegawaian</InputLabel>
                        <Select {...field} label='Status Kepegawaian'>
                          <MenuItem value='Aktif'>Aktif</MenuItem>
                          <MenuItem value='Cuti'>Cuti</MenuItem>
                          <MenuItem value='Keluar'>Keluar</MenuItem>
                          <MenuItem value='Pensiun'>Pensiun</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                  <Controller
                    name='position'
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Jabatan</InputLabel>
                        <Select {...field} label='Jabatan'>
                          <MenuItem value='Guru Mata Pelajaran'>Guru Mata Pelajaran</MenuItem>
                          <MenuItem value='Wali Kelas'>Wali Kelas</MenuItem>
                          <MenuItem value='Kepala Sekolah'>Kepala Sekolah</MenuItem>
                          <MenuItem value='Wakil Kepala Sekolah'>Wakil Kepala Sekolah</MenuItem>
                          <MenuItem value='Staff Tata Usaha'>Staff Tata Usaha</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                  <Controller
                    name='subject'
                    control={control}
                    render={({ field: { onChange, value } }) => {
                      return isManualSubject ? (
                        <TextField
                          fullWidth
                          label='Mata Pelajaran (Manual)'
                          value={value}
                          onChange={e => onChange(e.target.value)}
                          placeholder='Ketik mata pelajaran baru'
                          slotProps={{
                            input: {
                              endAdornment: (
                                <Button size='small' onClick={() => setIsManualSubject(false)}>
                                  Pilih dari Daftar
                                </Button>
                              )
                            }
                          }}
                        />
                      ) : (
                        <FormControl fullWidth>
                          <InputLabel>Mata Pelajaran</InputLabel>
                          <Select
                            value={subjects.includes(value) ? value : ''}
                            label='Mata Pelajaran'
                            onChange={e => {
                              if (e.target.value === 'manual') {
                                setIsManualSubject(true)
                              } else {
                                onChange(e.target.value)
                              }
                            }}
                          >
                            <MenuItem value=''>Pilih Mata Pelajaran</MenuItem>
                            {subjects.map(s => (
                              <MenuItem key={s} value={s}>
                                {s}
                              </MenuItem>
                            ))}
                            <Divider />
                            <MenuItem value='manual' sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                              <i className='ri-pencil-line me-2' /> Input Manual...
                            </MenuItem>
                          </Select>
                        </FormControl>
                      )
                    }}
                  />
                  <Controller
                    name='education'
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Pendidikan Terakhir</InputLabel>
                        <Select {...field} label='Pendidikan Terakhir'>
                          <MenuItem value='S1'>S1</MenuItem>
                          <MenuItem value='S2'>S2</MenuItem>
                          <MenuItem value='S3'>S3</MenuItem>
                          <MenuItem value='D3'>D3</MenuItem>
                          <MenuItem value='SMA/SMK'>SMA/SMK</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </div>
              </div>

              <div className='flex justify-end gap-4 mt-4'>
                <Button variant='outlined' color='secondary' onClick={() => router.back()}>
                  Batal
                </Button>
                <Button type='submit' variant='contained'>
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export default EditTeacherForm
