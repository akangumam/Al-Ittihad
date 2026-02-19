'use client'

import { Card, CardContent, Button, Typography, Alert } from '@mui/material'

const DebugPage = () => {
  const handleForceReload = () => {
    // Clear localStorage
    localStorage.removeItem('app_data')

    // Reload page
    window.location.reload()
  }

  const handleCheckData = () => {
    const data = localStorage.getItem('app_data')

    if (data) {
      const parsed = JSON.parse(data)

      console.log('=== Current Data in localStorage ===')
      console.log('Students:', parsed.students?.length || 0)
      console.log('Incomes:', parsed.incomes?.length || 0)
      console.log('Expenses:', parsed.expenses?.length || 0)
      console.log('Categories:', parsed.categories?.length || 0)
      console.log('Accounts:', parsed.accounts?.length || 0)
      console.log('Full data:', parsed)
      alert(
        `Data found!\nIncomes: ${parsed.incomes?.length || 0}\nExpenses: ${parsed.expenses?.length || 0}\nCheck console for details.`
      )
    } else {
      alert('No data in localStorage!')
    }
  }

  return (
    <div className='p-6'>
      <Typography variant='h4' className='mb-4'>
        Debug & Data Reset
      </Typography>

      <Card className='mb-4'>
        <CardContent>
          <Typography variant='h6' className='mb-2'>
            Force Clear & Reload Data
          </Typography>
          <Typography variant='body2' color='text.secondary' className='mb-4'>
            This will clear all data in localStorage and reload the page with fresh initial data.
          </Typography>
          <Button variant='contained' color='error' onClick={handleForceReload}>
            Clear & Reload
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant='h6' className='mb-2'>
            Check Current Data
          </Typography>
          <Typography variant='body2' color='text.secondary' className='mb-4'>
            Check what data is currently stored in localStorage (see console).
          </Typography>
          <Button variant='contained' onClick={handleCheckData}>
            Check Data
          </Button>
        </CardContent>
      </Card>

      <Alert severity='info' className='mt-4'>
        <Typography variant='body2'>
          <strong>Instructions:</strong>
          <ol className='mt-2 ml-4'>
            <li>Click &quot;Clear &amp; Reload&quot; button</li>
            <li>Wait for page to reload</li>
            <li>Navigate to /keuangan/pemasukan</li>
            <li>Click &quot;Lihat Detail&quot; on any income</li>
            <li>Should work now!</li>
          </ol>
        </Typography>
      </Alert>
    </div>
  )
}

export default DebugPage
