'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

import { generateAllStudents, generateAllClasses, generateAllSPPRates } from '@/data/studentGenerator'

export default function GenerateDataButton() {
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleGenerateData = () => {
    try {
      setStatus('generating')
      setMessage('Generating data...')

      // Generate data
      const students = generateAllStudents()
      const classes = generateAllClasses(students)
      const sppRates = generateAllSPPRates()

      // Get existing data from localStorage
      const savedData = localStorage.getItem('app_data')
      const existingData = savedData ? JSON.parse(savedData) : {}

      // Merge with new data
      const newData = {
        ...existingData,
        students,
        classes,
        sppRates
      }

      // Save to localStorage
      localStorage.setItem('app_data', JSON.stringify(newData))

      setStatus('success')
      setMessage(
        `Successfully generated ${students.length} students, ${classes.length} classes, and ${sppRates.length} SPP rates!`
      )

      // Reload after 2 seconds
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      setStatus('error')
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <Button
        variant='contained'
        color='primary'
        onClick={handleGenerateData}
        disabled={status === 'generating'}
        startIcon={<i className='ri-database-2-line' />}
      >
        {status === 'generating' ? 'Generating...' : 'Generate Sample Data (335 Students)'}
      </Button>

      {status !== 'idle' && (
        <Alert severity={status === 'success' ? 'success' : status === 'error' ? 'error' : 'info'}>{message}</Alert>
      )}
    </div>
  )
}
