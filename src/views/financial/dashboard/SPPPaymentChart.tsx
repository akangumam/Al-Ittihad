'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'

// Recharts Imports
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

// Context Imports
import { useAppContext } from '@/contexts/AppContext'

const PriorityFeeChart = () => {
  const theme = useTheme()
  const { priorityStudentFees } = useAppContext()

  const data = useMemo(() => {
    const lunasFees = priorityStudentFees.filter(f => f.status === 'LUNAS')
    const partialFees = priorityStudentFees.filter(f => f.status === 'CICILAN')
    const unpaidFees = priorityStudentFees.filter(f => f.status === 'BELUM_LUNAS')

    const lunasCount = lunasFees.length
    const partialCount = partialFees.length
    const unpaidCount = unpaidFees.length

    // Calculate amounts
    const lunasAmount = lunasFees.reduce((acc, curr) => acc + curr.paidAmount, 0)
    const partialAmount = partialFees.reduce((acc, curr) => acc + curr.paidAmount, 0)
    const unpaidAmount = unpaidFees.reduce((acc, curr) => acc + (curr.totalAmount - curr.paidAmount), 0)

    return [
      { name: 'Lunas', value: lunasCount, amount: lunasAmount, color: theme.palette.success.main },
      { name: 'Mencicil', value: partialCount, amount: partialAmount, color: theme.palette.warning.main },
      { name: 'Belum Bayar', value: unpaidCount, amount: unpaidAmount, color: theme.palette.error.main }
    ]
  }, [priorityStudentFees, theme])

  const totalAssigned = priorityStudentFees.length
  const collectedAmount = data.reduce((acc, d) => (d.name !== 'Belum Bayar' ? acc + d.amount : acc), 0)

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}jt`
    }

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      return (
        <Card sx={{ p: 4, boxShadow: theme.shadows[4] }}>
          <Typography variant='body2' fontWeight={600} gutterBottom>
            {data.name}
          </Typography>
          <Typography variant='body2'>
            Tagihan: {data.value} ({totalAssigned > 0 ? ((data.value / totalAssigned) * 100).toFixed(1) : 0}%)
          </Typography>
          <Typography variant='body2'>
            {data.name === 'Belum Bayar' ? 'Piutang' : 'Terkumpul'}: {formatCurrency(data.amount)}
          </Typography>
        </Card>
      )
    }

    return null
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))

    if (percent < 0.05) return null

    return (
      <text x={x} y={y} fill='white' textAnchor='middle' dominantBaseline='central' fontWeight={600} fontSize={14}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader title='Status Piutang Biaya' subheader='Registrasi & Daftar Ulang' />
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary'>
            Total Tagihan Diturunkan
          </Typography>
          <Typography variant='h3' fontWeight={600} color='primary.main'>
            {totalAssigned}
          </Typography>
        </Box>

        <ResponsiveContainer width='100%' height={250}>
          <PieChart>
            <Pie
              data={data}
              cx='50%'
              cy='50%'
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={90}
              fill='#8884d8'
              dataKey='value'
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {data.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: item.color
                  }}
                />
                <Typography variant='body2' fontWeight={500}>
                  {item.name}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant='body2' fontWeight={600}>
                  {item.value} tagihan
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {item.name === 'Belum Bayar' ? 'Sisa' : 'Bayar'}: {formatCurrency(item.amount)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            mt: 4,
            p: 3,
            bgcolor: 'action.hover',
            borderRadius: 1,
            border: theme => `1px solid ${theme.palette.divider}`
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant='body2' fontWeight={600}>
              Total Dana Terkumpul
            </Typography>
            <Typography variant='body2' fontWeight={600} color='success.main'>
              {formatCurrency(collectedAmount)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default PriorityFeeChart
