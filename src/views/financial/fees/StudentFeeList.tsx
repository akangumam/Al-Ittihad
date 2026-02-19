'use client'

import { useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import LinearProgress from '@mui/material/LinearProgress'
import InputAdornment from '@mui/material/InputAdornment'
import { Search, Filter, CreditCard } from 'lucide-react'

import { useAppContext } from '@/contexts/AppContext'

interface StudentFeeListProps {
  onSelectFee: (studentFeeId: string) => void
}

const StudentFeeList = ({ onSelectFee }: StudentFeeListProps) => {
  const { priorityStudentFees, students } = useAppContext()
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LUNAS':
        return 'success'
      case 'CICILAN':
        return 'warning'
      case 'BELUM_LUNAS':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'LUNAS':
        return 'Lunas'
      case 'CICILAN':
        return 'Mencicil'
      case 'BELUM_LUNAS':
        return 'Belum Bayar'
      default:
        return status
    }
  }

  // Join priorityStudentFees with student data
  const feesWithStudentData = useMemo(() => {
    return priorityStudentFees.map(fee => {
      const student = students.find(s => s.id === fee.studentId)

      return {
        ...fee,
        studentName: student?.name || 'Unknown',
        studentNis: student?.nis || 'N/A',
        studentGrade: student?.grade || 'N/A',
        studentClass: student?.class || 'N/A'
      }
    })
  }, [priorityStudentFees, students])

  const filteredFees = useMemo(() => {
    return feesWithStudentData.filter(fee => {
      const matchSearch =
        fee.studentName.toLowerCase().includes(search.toLowerCase()) || fee.studentNis.includes(search)

      const matchGrade = !gradeFilter || fee.studentGrade === gradeFilter
      const matchStatus = !statusFilter || fee.status === statusFilter

      return matchSearch && matchGrade && matchStatus
    })
  }, [feesWithStudentData, search, gradeFilter, statusFilter])

  const uniqueGrades = useMemo(() => {
    return Array.from(new Set(students.map(s => s.grade))).sort()
  }, [students])

  return (
    <Box>
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant='h5' fontWeight={700}>
          Daftar Tagihan Siswa
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{ p: 4, display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <TextField
              size='small'
              placeholder='Cari Nama/NIS...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search size={18} />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              size='small'
              select
              label='Grade'
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
              sx={{ minWidth: 150 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Filter size={18} />
                  </InputAdornment>
                )
              }}
            >
              <MenuItem value=''>Semua Grade</MenuItem>
              {uniqueGrades.map(g => (
                <MenuItem key={g} value={g}>
                  Grade {g}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              size='small'
              select
              label='Status'
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value=''>Semua Status</MenuItem>
              <MenuItem value='LUNAS'>Lunas</MenuItem>
              <MenuItem value='CICILAN'>Mencicil</MenuItem>
              <MenuItem value='BELUM_LUNAS'>Belum Bayar</MenuItem>
            </TextField>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell>Siswa</TableCell>
                  <TableCell>Jenis Tagihan</TableCell>
                  <TableCell align='right'>Total Tagihan</TableCell>
                  <TableCell align='right'>Terbayar</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align='right'>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFees.map(fee => {
                  const progress = (fee.paidAmount / fee.totalAmount) * 100

                  return (
                    <TableRow key={fee.id} hover>
                      <TableCell>
                        <Typography variant='body2' fontWeight={600}>
                          {fee.studentName}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {fee.studentNis} • Grade {fee.studentGrade}-{fee.studentClass}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>{fee.template?.name || 'N/A'}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          TA {fee.academicYear}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body2' fontWeight={600}>
                          {formatCurrency(fee.totalAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Box sx={{ minWidth: 100 }}>
                          <Typography variant='body2' fontWeight={600}>
                            {formatCurrency(fee.paidAmount)}
                          </Typography>
                          <LinearProgress
                            variant='determinate'
                            value={progress}
                            sx={{ height: 4, borderRadius: 2, mt: 1 }}
                            color={progress === 100 ? 'success' : 'primary'}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(fee.status)}
                          color={getStatusColor(fee.status) as any}
                          size='small'
                          variant='tonal'
                        />
                      </TableCell>
                      <TableCell align='right'>
                        <Button
                          variant='contained'
                          size='small'
                          startIcon={<CreditCard size={14} />}
                          onClick={() => onSelectFee(fee.id)}
                          disabled={fee.status === 'LUNAS'}
                        >
                          Bayar
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}

                {filteredFees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align='center' sx={{ py: 10 }}>
                      <Typography variant='body1' color='text.secondary'>
                        Tidak ada data tagihan yang ditemukan
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

export default StudentFeeList
