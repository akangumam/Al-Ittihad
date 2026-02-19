'use client'

import { useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import { Search, CheckCircle, User } from 'lucide-react'

import { toast } from 'react-toastify'

import { useAppContext } from '@/contexts/AppContext'
import { priorityStudentFeeAPI } from '@/services/api'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount)
}

const StudentFeeAssignment = () => {
  const { students, feeTemplates, refreshData } = useAppContext()

  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')

  const selectedTemplate = useMemo(
    () => feeTemplates.find(t => t.id === selectedTemplateId),
    [selectedTemplateId, feeTemplates]
  )

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchGrade = !gradeFilter || student.grade === gradeFilter

      const matchSearch =
        !search || student.name.toLowerCase().includes(search.toLowerCase()) || student.nis.includes(search)

      return matchGrade && matchSearch && student.status === 'Aktif'
    })
  }, [students, gradeFilter, search])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(filteredStudents.map(s => s.id))
    } else {
      setSelectedStudentIds([])
    }
  }

  const handleSelectStudent = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId))
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId])
    }
  }

  const handleAssign = async () => {
    if (!selectedTemplateId || selectedStudentIds.length === 0) {
      toast.error('Pilih template dan setidaknya satu siswa')

      return
    }

    try {
      setLoading(true)
      await priorityStudentFeeAPI.assignBulk({
        templateId: selectedTemplateId,
        studentIds: selectedStudentIds,
        academicYear: selectedTemplate?.academicYear || ''
      })

      toast.success(`${selectedStudentIds.length} siswa berhasil diberikan tagihan`)
      setSelectedStudentIds([])
      refreshData()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menetapkan tagihan')
    } finally {
      setLoading(false)
    }
  }

  const uniqueGrades = useMemo(() => {
    return Array.from(new Set(students.map(s => s.grade))).sort()
  }, [students])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title='1. Pilih Template' avatar={<User size={20} />} />
          <Divider />
          <CardContent>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  label='Pilih Template Biaya'
                  value={selectedTemplateId}
                  onChange={e => setSelectedTemplateId(e.target.value)}
                  required
                >
                  {feeTemplates
                    .filter(t => t.isActive)
                    .map(t => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.name} (TA {t.academicYear})
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
            </Grid>

            {selectedTemplateId && selectedTemplate && (
              <Box sx={{ p: 4, bgcolor: 'action.hover', borderRadius: 1, mt: 4 }}>
                <Typography variant='subtitle2' gutterBottom color='primary'>
                  Detil Template:
                </Typography>
                {selectedTemplate.components.map((comp: any) => (
                  <Box key={comp.id} sx={{ mb: 2, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Grid container justifyContent='space-between' alignItems='center'>
                      <Grid size={{ xs: 8 }}>
                        <Typography variant='body2' fontWeight={600}>
                          {comp.name}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Prioritas: {comp.priority}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 4 }} sx={{ textAlign: 'right' }}>
                        <Typography variant='body2' fontWeight={700}>
                          {formatCurrency(comp.amount)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' fontWeight={700}>
                    Total Tagihan:
                  </Typography>
                  <Typography variant='body2' fontWeight={700} color='primary'>
                    {formatCurrency(selectedTemplate.components.reduce((s: number, c: any) => s + c.amount, 0))}
                  </Typography>
                </Box>
              </Box>
            )}

            {selectedStudentIds.length > 0 && selectedTemplateId && (
              <Box sx={{ mt: 6 }}>
                <Typography variant='body2' align='center' color='text.secondary'>
                  Akan menetapkan tagihan ke <strong>{selectedStudentIds.length}</strong> siswa.
                </Typography>
                <Button
                  fullWidth
                  variant='outlined'
                  color='primary'
                  sx={{ mt: 4 }}
                  onClick={handleAssign}
                  startIcon={<CheckCircle size={18} />}
                  loading={loading}
                >
                  Tetapkan Sekarang
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title='Pilih Siswa'
            avatar={<User size={20} />}
            action={
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size='small'
                  placeholder='Cari NIS/Nama...'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  InputProps={{ startAdornment: <Search size={16} style={{ marginRight: 8 }} /> }}
                />
              </Box>
            }
          />
          <Divider />
          <Box sx={{ p: 4, display: 'flex', gap: 2, flexWrap: 'wrap', bgcolor: 'action.hover' }}>
            <FormControl size='small' sx={{ minWidth: 120 }}>
              <InputLabel>Grade</InputLabel>
              <Select label='Grade' value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
                <MenuItem value=''>Semua Grade</MenuItem>
                {uniqueGrades.map(g => (
                  <MenuItem key={g} value={g}>
                    Grade {g}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding='checkbox'>
                    <Checkbox
                      indeterminate={
                        selectedStudentIds.length > 0 && selectedStudentIds.length < filteredStudents.length
                      }
                      checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                      onChange={e => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>NIS</TableCell>
                  <TableCell>Nama Siswa</TableCell>
                  <TableCell>Grade/Kelas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map(student => (
                  <TableRow
                    key={student.id}
                    hover
                    onClick={() => handleSelectStudent(student.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding='checkbox'>
                      <Checkbox checked={selectedStudentIds.includes(student.id)} />
                    </TableCell>
                    <TableCell>{student.nis}</TableCell>
                    <TableCell>
                      <Typography variant='body2' fontWeight={600}>
                        {student.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {student.grade} / {student.class}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align='center' sx={{ py: 10 }}>
                      <Typography variant='body2' color='text.secondary'>
                        Tidak ada siswa yang cocok dengan kriteria
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>
    </Grid>
  )
}

export default StudentFeeAssignment
