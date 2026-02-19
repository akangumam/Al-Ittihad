'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'react-toastify'

import { studentAPI, priorityFeeTemplateAPI, priorityStudentFeeAPI, academicYearAPI, classAPI } from '@/services/api'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'
import tableStyles from '@core/styles/table.module.css'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog'

const columnHelper = createColumnHelper<any>()

const StudentFeeTable = () => {
  const [students, setStudents] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [academicYears, setAcademicYears] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [selectedYear, setSelectedYear] = useState('')
  const [globalFilter, setGlobalFilter] = useState('')

  // Bulk Assign States
  const [openAssignDialog, setOpenAssignDialog] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [targetGrade, setTargetGrade] = useState('Semua')
  const [targetClassId, setTargetClassId] = useState('Semua')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Confirmation Dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const { lang: locale } = useParams()

  const fetchData = useCallback(async () => {
    try {
      const [studentsData, templatesData, yearsData, classesData] = await Promise.all([
        studentAPI.getAll(),
        priorityFeeTemplateAPI.getAll(),
        academicYearAPI.getAll(),
        classAPI.getAll()
      ])

      setStudents(studentsData)
      setTemplates(templatesData)
      setAcademicYears(yearsData)
      setClasses(classesData)

      const activeYear = yearsData.find((y: any) => y.isActive)

      if (activeYear) {
        setSelectedYear(activeYear.name)
      }
    } catch {
      toast.error('Gagal memuat data')
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleConfirmBulkAssign = () => {
    if (!selectedTemplateId || !selectedYear) {
      toast.error('Pilih template biaya dan pastikan tahun ajaran terpilih')

      return
    }

    setConfirmDialogOpen(true)
  }

  const handleBulkAssign = async () => {
    try {
      setIsSubmitting(true)

      let targetStudents = students

      if (targetGrade !== 'Semua') {
        targetStudents = targetStudents.filter(s => s.grade === targetGrade)
      }

      if (targetClassId !== 'Semua') {
        targetStudents = targetStudents.filter(s => s.classId === targetClassId)
      }

      if (targetStudents.length === 0) {
        toast.error('Tidak ada siswa yang sesuai kriteria filter')
        setConfirmDialogOpen(false)

        return
      }

      const studentIds = targetStudents.map(s => s.id)

      await priorityStudentFeeAPI.assignBulk({
        studentIds,
        templateId: selectedTemplateId,
        academicYear: selectedYear
      })

      toast.success(`Berhasil menetapkan tagihan ke ${targetStudents.length} siswa`)
      setConfirmDialogOpen(false)
      setOpenAssignDialog(false)
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menetapkan tagihan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      columnHelper.accessor('nis', {
        header: 'NIS',
        cell: ({ row }) => <Typography>{row.original.nis}</Typography>
      }),
      columnHelper.accessor('name', {
        header: 'Nama Siswa',
        cell: ({ row }) => (
          <div>
            <Typography className='font-medium'>{row.original.name}</Typography>
            <Typography variant='caption'>
              {row.original.grade}
              {row.original.class}
            </Typography>
          </div>
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
          <Button
            size='small'
            variant='outlined'
            component={Link}
            href={getLocalizedUrl(`/biaya/tagihan/${row.original.id}`, locale as Locale)}
            startIcon={<i className='ri-eye-line' />}
          >
            Detail
          </Button>
        )
      })
    ],
    [locale]
  )

  const table = useReactTable({
    data: students,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      fuzzy: () => true
    }
  })

  return (
    <>
      <Card>
        <CardContent className='flex flex-col gap-4'>
          <div className='flex justify-between items-center flex-wrap gap-4'>
            <div>
              <Typography variant='h5'>Penetapan Tagihan Siswa</Typography>
              <Typography variant='body2' color='text.secondary'>
                Tetapkan kategori pembayaran ke siswa
              </Typography>
            </div>
            <Button
              variant='contained'
              startIcon={<i className='ri-file-add-line' />}
              onClick={() => setOpenAssignDialog(true)}
              disabled={students.length === 0 || templates.length === 0}
            >
              Tetapkan Tagihan Massal
            </Button>
          </div>

          <div className='flex gap-4 items-center flex-wrap'>
            <TextField
              size='small'
              placeholder='Cari Nama/NIS...'
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
            />
            <FormControl size='small' className='min-w-[150px]'>
              <InputLabel>Tahun Ajaran</InputLabel>
              <Select label='Tahun Ajaran' value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                {academicYears.map(y => (
                  <MenuItem key={y.id} value={y.name}>
                    {y.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </CardContent>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {students.length === 0 && (
          <div className='p-6 text-center'>
            <Typography variant='body1' color='text.secondary'>
              Belum ada data siswa. Silakan tambahkan data siswa terlebih dahulu.
            </Typography>
          </div>
        )}

        {students.length > 0 && templates.length === 0 && (
          <div className='p-6 text-center'>
            <Typography variant='body1' color='text.secondary'>
              Belum ada template pembayaran. Silakan tambahkan template pembayaran terlebih dahulu.
            </Typography>
          </div>
        )}
      </Card>

      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Tetapkan Tagihan Massal</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Pilih Template Biaya</InputLabel>
                <Select
                  value={selectedTemplateId}
                  onChange={e => setSelectedTemplateId(e.target.value)}
                  label='Pilih Template Biaya'
                >
                  {templates.map(tpl => (
                    <MenuItem key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.academicYear})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Tahun Ajaran'
                value={selectedYear}
                disabled
                helperText='Mengikuti tahun ajaran aktif'
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Filter Tingkat</InputLabel>
                <Select value={targetGrade} onChange={e => setTargetGrade(e.target.value)} label='Filter Tingkat'>
                  <MenuItem value='Semua'>Semua Tingkat</MenuItem>
                  <MenuItem value='7'>Kelas 7</MenuItem>
                  <MenuItem value='8'>Kelas 8</MenuItem>
                  <MenuItem value='9'>Kelas 9</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Filter Kelas Spesifik</InputLabel>
                <Select
                  value={targetClassId}
                  onChange={e => setTargetClassId(e.target.value)}
                  label='Filter Kelas Spesifik'
                  disabled={targetGrade === 'Semua'}
                >
                  <MenuItem value='Semua'>Semua Kelas di Tingkat Ini</MenuItem>
                  {classes
                    .filter(c => c.grade === targetGrade)
                    .map(cls => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Alert severity='info' sx={{ mt: 4 }}>
            Proses ini akan menetapkan komponen biaya dari template yang dipilih ke semua siswa yang sesuai filter di
            atas.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ pb: 4, px: 6 }}>
          <Button onClick={() => setOpenAssignDialog(false)} color='secondary'>
            Batal
          </Button>
          <Button
            onClick={handleConfirmBulkAssign}
            variant='contained'
            color='primary'
            startIcon={<i className='ri-check-line' />}
          >
            Tetapkan Tagihan
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={confirmDialogOpen}
        setOpen={setConfirmDialogOpen}
        onConfirm={handleBulkAssign}
        title='Konfirmasi Penetapan Tagihan'
        content={`Apakah Anda yakin ingin menetapkan tagihan ke siswa yang dipilih? Pastikan data sudah sesuai.`}
        isSubmitting={isSubmitting}
      />
    </>
  )
}

export default StudentFeeTable
