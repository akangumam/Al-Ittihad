'use client'

import { useState } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'

export default function DataMigrationPage() {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [results, setResults] = useState<any>(null)
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [loadingStatus, setLoadingStatus] = useState(false)

  const checkDatabaseStatus = async () => {
    try {
      setLoadingStatus(true)
      const response = await fetch('/api/seed')
      const data = await response.json()

      setDbStatus(data)
    } catch (error) {
      console.error('Error checking database:', error)
    } finally {
      setLoadingStatus(false)
    }
  }

  const seedInitialData = async () => {
    try {
      setMigrationStatus('loading')
      setMessage('Seeding initial data...')

      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ includeTestData: false })
      })

      const data = await response.json()

      if (response.ok) {
        setMigrationStatus('success')
        setMessage(data.message)
        setResults(data.results)
        await checkDatabaseStatus()
      } else {
        setMigrationStatus('error')
        setMessage(data.error || 'Failed to seed data')
      }
    } catch (error: any) {
      setMigrationStatus('error')
      setMessage(error.message || 'An error occurred')
    }
  }

  const migrateFromLocalStorage = async () => {
    try {
      setMigrationStatus('loading')
      setMessage('Migrating data from localStorage...')

      // Get data from localStorage
      const appData = localStorage.getItem('app_data')

      if (!appData) {
        setMigrationStatus('error')
        setMessage('No data found in localStorage')

        return
      }

      const data = JSON.parse(appData)

      // Send to API
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (response.ok) {
        setMigrationStatus('success')
        setMessage(result.message)
        setResults(result.results)
        await checkDatabaseStatus()

        // Optional: Clear localStorage after successful migration
        // localStorage.removeItem('app_data')
      } else {
        setMigrationStatus('error')
        setMessage(result.error || 'Migration failed')
      }
    } catch (error: any) {
      setMigrationStatus('error')
      setMessage(error.message || 'An error occurred during migration')
    }
  }

  // Not currently used in UI, commenting out to satisfy lint
  /*
  const runMigration = async () => {
    try {
      setMigrationStatus('loading')
      setMessage('Running Prisma migration...')

      const response = await fetch('/api/prisma-migrate', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setMigrationStatus('success')
        setMessage(data.message)
      } else {
        setMigrationStatus('error')
        setMessage(data.error || 'Migration failed')
      }
    } catch (error: any) {
      setMigrationStatus('error')
      setMessage(error.message || 'An error occurred')
    }
  }
  */

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <Card>
        <CardHeader
          title='Database Migration Tool'
          subheader='Migrate your data from localStorage to PostgreSQL/MySQL database'
        />
      </Card>

      {/* Database Status */}
      <Card>
        <CardHeader title='Database Status' action={<Button onClick={checkDatabaseStatus}>Refresh</Button>} />
        <CardContent>
          {loadingStatus ? (
            <LinearProgress />
          ) : dbStatus ? (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Typography variant='body1'>Database Status:</Typography>
                <Chip
                  label={dbStatus.isEmpty ? 'Empty' : 'Has Data'}
                  color={dbStatus.isEmpty ? 'default' : 'success'}
                />
              </div>

              <Divider />

              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                <div>
                  <Typography variant='caption' color='text.secondary'>
                    Students
                  </Typography>
                  <Typography variant='h6'>{dbStatus.counts?.students || 0}</Typography>
                </div>
                <div>
                  <Typography variant='caption' color='text.secondary'>
                    Classes
                  </Typography>
                  <Typography variant='h6'>{dbStatus.counts?.classes || 0}</Typography>
                </div>
                <div>
                  <Typography variant='caption' color='text.secondary'>
                    Teachers
                  </Typography>
                  <Typography variant='h6'>{dbStatus.counts?.teachers || 0}</Typography>
                </div>
                <div>
                  <Typography variant='caption' color='text.secondary'>
                    Categories
                  </Typography>
                  <Typography variant='h6'>{dbStatus.counts?.categories || 0}</Typography>
                </div>
                <div>
                  <Typography variant='caption' color='text.secondary'>
                    Accounts
                  </Typography>
                  <Typography variant='h6'>{dbStatus.counts?.accounts || 0}</Typography>
                </div>
                <div>
                  <Typography variant='caption' color='text.secondary'>
                    SPP Payments
                  </Typography>
                  <Typography variant='h6'>{dbStatus.counts?.sppPayments || 0}</Typography>
                </div>
              </div>
            </div>
          ) : (
            <Typography color='text.secondary'>Click refresh to check database status</Typography>
          )}
        </CardContent>
      </Card>

      {/* Migration Actions */}
      <Card>
        <CardHeader title='Migration Steps' subheader='Follow these steps in order' />
        <CardContent className='space-y-6'>
          {/* Step 1 */}
          <Box>
            <div className='flex items-center justify-between mb-2'>
              <div>
                <Typography variant='h6' className='mb-1'>
                  1. Seed Initial Data
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Create default categories, accounts, and academic year data
                </Typography>
              </div>
              <Button variant='outlined' onClick={seedInitialData} disabled={migrationStatus === 'loading'}>
                Seed Data
              </Button>
            </div>
          </Box>

          <Divider />

          {/* Step 2 */}
          <Box>
            <div className='flex items-center justify-between mb-2'>
              <div>
                <Typography variant='h6' className='mb-1'>
                  2. Migrate from localStorage
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Transfer existing student, SPP, and transaction data from localStorage to database
                </Typography>
              </div>
              <Button variant='contained' onClick={migrateFromLocalStorage} disabled={migrationStatus === 'loading'}>
                Migrate Data
              </Button>
            </div>
          </Box>

          {migrationStatus === 'loading' && (
            <Box className='mt-4'>
              <LinearProgress />
              <Typography variant='body2' className='mt-2' align='center'>
                {message}
              </Typography>
            </Box>
          )}

          {migrationStatus === 'success' && (
            <Alert severity='success' className='mt-4'>
              <Typography variant='subtitle2' className='mb-2'>
                {message}
              </Typography>
              {results && (
                <div className='grid grid-cols-2 md:grid-cols-4 gap-2 mt-2'>
                  {Object.entries(results).map(([key, value]) => (
                    <div key={key}>
                      <Typography variant='caption'>{key}:</Typography>
                      <Typography variant='body2' fontWeight='bold'>
                        {String(value)}
                      </Typography>
                    </div>
                  ))}
                </div>
              )}
            </Alert>
          )}

          {migrationStatus === 'error' && (
            <Alert severity='error' className='mt-4'>
              <Typography>{message}</Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Warning */}
      <Alert severity='warning'>
        <Typography variant='subtitle2' className='mb-1'>
          ⚠️ Important Notes:
        </Typography>
        <ul className='list-disc list-inside space-y-1'>
          <li>Make sure your database is properly configured in .env file</li>
          <li>Prisma migrations should be run before migrating data</li>
          <li>Migration will clear existing database data before importing</li>
          <li>Make a backup of your localStorage data before migrating</li>
        </ul>
      </Alert>
    </div>
  )
}
