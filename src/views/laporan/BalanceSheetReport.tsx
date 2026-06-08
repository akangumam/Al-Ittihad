'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

// Service Imports
import { accountAPI } from '@/services/api'

// Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

const BalanceSheetReport = () => {
  const [reportDate, setReportDate] = useState<Date | null>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [assets, setAssets] = useState<{ name: string; amount: number }[]>([])
  const [liabilities, setLiabilities] = useState<{ name: string; amount: number }[]>([])

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const accounts = await accountAPI.getAll()

      const currentAssets = accounts.map((acc: any) => ({
        name: acc.accountName,
        amount: acc.balance
      }))

      setAssets(currentAssets)
      setLiabilities([]) // Reset liabilities as it's not implemented yet
    } catch (error) {
      console.error('Error fetching balance sheet:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePrint = () => window.print()

  const handleExportCSV = () => {
    const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n)
    const rows = [
      ['Pos', 'Nama', 'Jumlah'],
      ...assets.map(a => ['AKTIVA', a.name, fmt(a.amount)]),
      ['AKTIVA', 'TOTAL AKTIVA', fmt(assets.reduce((s, a) => s + a.amount, 0))],
      ...liabilities.map(l => ['PASIVA', l.name, fmt(l.amount)]),
      ['PASIVA', 'TOTAL PASIVA', fmt(liabilities.reduce((s, l) => s + l.amount, 0))]
    ]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = `neraca-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalAssets = assets.reduce((acc, curr) => acc + curr.amount, 0)
  const totalLiabilities = liabilities.reduce((acc, curr) => acc + curr.amount, 0)

  // Auto-calculate equity to balance the sheet
  const calculatedEquity = totalAssets - totalLiabilities
  const equityItems = calculatedEquity > 0 ? [{ name: 'Modal (Saldo Awal)', amount: calculatedEquity }] : []

  const totalEquity = equityItems.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <Card>
      <CardContent>
        <div className='flex flex-col gap-4 mb-6'>
          <div className='flex justify-between items-center flex-wrap gap-4'>
            <Typography variant='h5'>Neraca Sederhana</Typography>
            <div className='flex gap-2'>
              <Button variant='outlined' startIcon={<i className='ri-printer-line' />} onClick={handlePrint}>
                Cetak
              </Button>
              <Button variant='contained' startIcon={<i className='ri-download-line' />} onClick={handleExportCSV}>
                Export CSV
              </Button>
            </div>
          </div>

          <div className='flex gap-4 flex-wrap items-end'>
            <AppReactDatepicker
              selected={reportDate}
              id='report-date-picker'
              onChange={date => setReportDate(date)}
              placeholderText='Pilih Tanggal'
              customInput={<TextField size='small' label='Per Tanggal' />}
            />
          </div>
        </div>

        {isLoading ? (
          <div className='flex justify-center items-center py-20'>
            <CircularProgress size={40} />
            <Typography className='ml-4'>Memuat data neraca...</Typography>
          </div>
        ) : (
          <Grid container spacing={6}>
            {/* Assets Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant='outlined' className='h-full'>
                <CardContent>
                  <Typography variant='h6' className='mb-4 text-primary'>
                    AKTIVA (ASET)
                  </Typography>

                  <div className='flex flex-col gap-3'>
                    <Typography variant='subtitle1' className='font-bold'>
                      Aset Lancar
                    </Typography>
                    {assets.length === 0 ? (
                      <Typography variant='body2' color='text.secondary' className='italic'>
                        Tidak ada aset terdaftar
                      </Typography>
                    ) : (
                      assets.map((item, index) => (
                        <div key={index} className='flex justify-between'>
                          <Typography>{item.name}</Typography>
                          <Typography>
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.amount)}
                          </Typography>
                        </div>
                      ))
                    )}

                    <Divider className='my-2' />

                    <Typography variant='subtitle1' className='font-bold text-disabled'>
                      Aset Tetap (Mock)
                    </Typography>
                    <Typography variant='body2' color='text.secondary' className='italic'>
                      Integrasi aset tetap belum tersedia
                    </Typography>
                  </div>

                  <div className='mt-8 pt-4 border-t-2 border-primary flex justify-between items-center'>
                    <Typography variant='h6'>TOTAL ASET</Typography>
                    <Typography variant='h6' color='primary.main'>
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalAssets)}
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </Grid>

            {/* Liabilities & Equity Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant='outlined' className='h-full'>
                <CardContent>
                  <Typography variant='h6' className='mb-4 text-error'>
                    PASIVA (KEWAJIBAN & EKUITAS)
                  </Typography>

                  <div className='flex flex-col gap-3'>
                    <Typography variant='subtitle1' className='font-bold'>
                      Kewajiban (Hutang)
                    </Typography>
                    {liabilities.length === 0 ? (
                      <Typography variant='body2' color='text.secondary' className='italic'>
                        Tidak ada transaksi kewajiban
                      </Typography>
                    ) : (
                      liabilities.map((item, index) => (
                        <div key={index} className='flex justify-between'>
                          <Typography>{item.name}</Typography>
                          <Typography>
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.amount)}
                          </Typography>
                        </div>
                      ))
                    )}
                    <div className='flex justify-between font-medium pl-4 border-t border-dashed pt-1'>
                      <Typography variant='body2'>Total Kewajiban</Typography>
                      <Typography variant='body2'>
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
                          totalLiabilities
                        )}
                      </Typography>
                    </div>

                    <Divider className='my-2' />

                    <Typography variant='subtitle1' className='font-bold'>
                      Ekuitas (Modal)
                    </Typography>
                    {equityItems.length === 0 ? (
                      <Typography variant='body2' color='text.secondary' className='italic'>
                        Tidak ada transaksi ekuitas
                      </Typography>
                    ) : (
                      equityItems.map((item, index) => (
                        <div key={index} className='flex justify-between'>
                          <Typography>{item.name}</Typography>
                          <Typography>
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.amount)}
                          </Typography>
                        </div>
                      ))
                    )}
                  </div>

                  <div className='mt-8 pt-4 border-t-2 border-error flex justify-between items-center'>
                    <Typography variant='h6'>TOTAL PASIVA</Typography>
                    <Typography variant='h6' color='error.main'>
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
                        totalLiabilities + totalEquity
                      )}
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  )
}

export default BalanceSheetReport
