'use client'

import { useState } from 'react'

import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

import { Layers, UserPlus, CreditCard, History, ChevronRight } from 'lucide-react'

// Component Imports
import TemplateList from '@/views/financial/fees/TemplateList'
import TemplateForm from '@/views/financial/fees/TemplateForm'
import StudentFeeAssignment from '@/views/financial/fees/StudentFeeAssignment'
import StudentFeeList from '@/views/financial/fees/StudentFeeList'
import PaymentForm from '@/views/financial/fees/PaymentForm'
import PaymentHistory from '@/views/financial/fees/PaymentHistory'

const FeeServicePage = () => {
  const [activeTab, setActiveTab] = useState('templates')
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedStudentFeeId, setSelectedStudentFeeId] = useState<string | null>(null)

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)
    setShowForm(false)
    setEditingTemplateId(null)
    setSelectedStudentFeeId(null)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant='h4' fontWeight={700} gutterBottom>
            Manajemen Biaya Prioritas
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Kelola template biaya pendaftaran & daftar ulang dengan sistem pelunasan otomatis berdasarkan prioritas
            komponen.
          </Typography>
        </Box>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <TabContext value={activeTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <TabList onChange={handleTabChange} aria-label='fee management tabs'>
              <Tab value='templates' label='Template Biaya' icon={<Layers size={18} />} iconPosition='start' />
              <Tab value='assignment' label='Penetapan Tagihan' icon={<UserPlus size={18} />} iconPosition='start' />
              <Tab value='payments' label='Entri Pembayaran' icon={<CreditCard size={18} />} iconPosition='start' />
              <Tab value='history' label='Riwayat & Laporan' icon={<History size={18} />} iconPosition='start' />
            </TabList>
          </Box>

          <TabPanel value='templates' sx={{ p: 0 }}>
            {showForm ? (
              <TemplateForm
                id={editingTemplateId || undefined}
                onClose={() => {
                  setShowForm(false)
                  setEditingTemplateId(null)
                }}
              />
            ) : (
              <TemplateList />
            )}

            {!showForm && (
              <Box sx={{ mt: 4, textAlign: 'right' }}>
                <Button
                  variant='contained'
                  onClick={() => {
                    setEditingTemplateId(null)
                    setShowForm(true)
                  }}
                >
                  Buat Template Baru
                </Button>
              </Box>
            )}
          </TabPanel>

          <TabPanel value='assignment' sx={{ p: 0 }}>
            <StudentFeeAssignment />
          </TabPanel>

          <TabPanel value='payments' sx={{ p: 0 }}>
            {selectedStudentFeeId ? (
              <Box>
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={<ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />}
                  onClick={() => setSelectedStudentFeeId(null)}
                  sx={{ mb: 4 }}
                >
                  Kembali ke Daftar Tagihan
                </Button>
                <PaymentForm
                  studentFeeId={selectedStudentFeeId}
                  onSuccess={() => {
                    // Stay on form or go back? Let's stay but maybe show success
                  }}
                />
              </Box>
            ) : (
              <StudentFeeList onSelectFee={id => setSelectedStudentFeeId(id)} />
            )}
          </TabPanel>

          <TabPanel value='history' sx={{ p: 0 }}>
            <PaymentHistory />
          </TabPanel>
        </TabContext>
      </Grid>
    </Grid>
  )
}

export default FeeServicePage
