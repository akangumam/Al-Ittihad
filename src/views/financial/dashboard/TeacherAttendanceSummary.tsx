'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import { useTheme } from '@mui/material/styles'

// Type Imports
import type { Locale } from '@configs/i18n'

// Utils
import { getLocalizedUrl } from '@/utils/i18n'
import { teacherAttendanceAPI } from '@/services/api'

type StatItem = {
  label: string
  count: number
  icon: string
  color: string
  bgColor: string
}

const TeacherAttendanceSummary = () => {
  const router = useRouter()
  const theme = useTheme()
  const { lang: locale } = useParams()

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState<StatItem[]>([])
  const [totalTeachers, setTotalTeachers] = useState(0)
  const [attendancePercentage, setAttendancePercentage] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchTodayAttendance = useCallback(
    async (showRefreshingState = false) => {
      try {
        if (showRefreshingState) {
          setIsRefreshing(true)
        } else {
          setIsLoading(true)
        }

        const today = new Date().toISOString().split('T')[0]
        const response = await teacherAttendanceAPI.getForDate({ date: today })

        if (response.success && response.data) {
          // API returns: { teachers: [...], summary: {...} }
          // Each teacher object: { teacherId, teacherName, nip, attendance: { status, ... } }
          const teachersData = response.data.teachers || []

          // Extract attendances from teachers array (only those with recorded attendance)
          const attendances = teachersData.map((t: any) => t.attendance).filter((att: any) => att && att.status) // Only count teachers with status

          const total = teachersData.length

          // Count by status
          const statusCounts: Record<string, number> = {
            Hadir: 0,
            Terlambat: 0,
            Izin: 0,
            Sakit: 0,
            Alpa: 0,
            'Dinas Luar': 0
          }

          attendances.forEach((att: any) => {
            if (att.status && statusCounts[att.status] !== undefined) {
              statusCounts[att.status]++
            }
          })

          // Calculate not yet recorded
          const recorded = Object.values(statusCounts).reduce((a, b) => a + b, 0)
          const belumAbsen = Math.max(0, total - recorded)

          // Group stats for cleaner display
          const statItems: StatItem[] = [
            {
              label: 'Hadir',
              count: statusCounts['Hadir'] + statusCounts['Terlambat'],
              icon: 'ri-checkbox-circle-fill',
              color: theme.palette.success.main,
              bgColor: 'rgba(40, 199, 111, 0.12)'
            },
            {
              label: 'Izin/Sakit',
              count: statusCounts['Izin'] + statusCounts['Sakit'],
              icon: 'ri-file-list-3-fill',
              color: theme.palette.info.main,
              bgColor: 'rgba(0, 207, 232, 0.12)'
            },
            {
              label: 'Alpa',
              count: statusCounts['Alpa'],
              icon: 'ri-close-circle-fill',
              color: theme.palette.error.main,
              bgColor: 'rgba(255, 76, 81, 0.12)'
            },
            {
              label: 'Belum Absen',
              count: belumAbsen,
              icon: 'ri-time-fill',
              color: theme.palette.warning.main,
              bgColor: 'rgba(255, 159, 67, 0.12)'
            }
          ]

          setStats(statItems)
          setTotalTeachers(total)
          setLastUpdate(new Date())

          // Calculate attendance percentage (Hadir + Terlambat + Dinas Luar = present)
          const present = statusCounts['Hadir'] + statusCounts['Terlambat'] + statusCounts['Dinas Luar']
          const percentage = total > 0 ? Math.round((present / total) * 100) : 0

          setAttendancePercentage(percentage)
        }
      } catch (error) {
        console.error('Error fetching attendance:', error)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [theme]
  )

  // Initial fetch
  useEffect(() => {
    fetchTodayAttendance(false)
  }, [fetchTodayAttendance])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTodayAttendance(true)
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [fetchTodayAttendance])

  const handleRefresh = () => {
    fetchTodayAttendance(true)
  }

  const handleNavigate = () => {
    router.push(getLocalizedUrl('/akademik/absensi-guru', locale as Locale))
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return theme.palette.success.main
    if (percentage >= 70) return theme.palette.warning.main

    return theme.palette.error.main
  }

  // Circular progress component
  const CircularProgressWithLabel = ({ value }: { value: number }) => {
    const size = 120
    const strokeWidth = 10
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (value / 100) * circumference
    const color = getProgressColor(value)

    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <svg width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill='none'
            stroke={theme.palette.action.hover}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill='none'
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap='round'
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant='h4' fontWeight='bold' color={color}>
            {value}%
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Kehadiran
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title='Absensi Guru Hari Ini'
        subheader={
          <Box>
            <Typography variant='caption' color='text.secondary'>
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'short'
              })}
            </Typography>
            {!isLoading && (
              <Typography variant='caption' color='text.disabled' display='block'>
                Update: {lastUpdate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            )}
          </Box>
        }
        action={
          <Box display='flex' gap={0.5}>
            <Tooltip title={isRefreshing ? 'Refreshing...' : 'Refresh Data'}>
              <IconButton size='small' onClick={handleRefresh} disabled={isRefreshing}>
                <i
                  className='ri-refresh-line'
                  style={{
                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                  }}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title='Kelola Absensi'>
              <IconButton size='small' onClick={handleNavigate}>
                <i className='ri-arrow-right-line' />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {isLoading ? (
          <Box display='flex' flexDirection='column' alignItems='center' gap={3}>
            <Skeleton variant='circular' width={120} height={120} />
            <Box display='grid' gridTemplateColumns='1fr 1fr' gap={2} width='100%'>
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} variant='rounded' height={60} />
              ))}
            </Box>
          </Box>
        ) : totalTeachers === 0 ? (
          <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' flex={1} py={4}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'action.hover', mb: 2 }}>
              <i className='ri-user-line' style={{ fontSize: '1.75rem', color: theme.palette.text.secondary }} />
            </Avatar>
            <Typography variant='body2' color='text.secondary' textAlign='center'>
              Belum ada data guru
            </Typography>
            <Typography variant='caption' color='text.disabled'>
              Tambahkan guru untuk memulai absensi
            </Typography>
          </Box>
        ) : (
          <>
            {/* Circular Progress */}
            <Box display='flex' justifyContent='center' mb={3}>
              <CircularProgressWithLabel value={attendancePercentage} />
            </Box>

            {/* Stats Grid */}
            <Box display='grid' gridTemplateColumns='1fr 1fr' gap={2}>
              {stats.map(stat => (
                <Box
                  key={stat.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: stat.bgColor,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: stat.color,
                      fontSize: '1rem'
                    }}
                  >
                    <i className={stat.icon} />
                  </Avatar>
                  <Box>
                    <Typography variant='h6' fontWeight='bold' lineHeight={1.2}>
                      {stat.count}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Total info */}
            <Box mt={2} pt={2} borderTop={1} borderColor='divider' display='flex' justifyContent='center'>
              <Typography variant='body2' color='text.secondary'>
                Total Guru: <strong>{totalTeachers}</strong> orang
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default TeacherAttendanceSummary
