'use client'

import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

import styles from './styles.module.css'

const NewsletterForm = () => {
  return (
    <div className='flex gap-4'>
      <TextField
        id='footer-newsletter-email'
        size='small'
        className={styles.inputBorder}
        label='Berlangganan Berita'
        placeholder='Email Anda'
        sx={{
          ' & .MuiInputBase-root:hover:not(.Mui-focused) fieldset': {
            borderColor: 'rgb(var(--mui-mainColorChannels-dark) / 0.6) !important'
          },
          '& .MuiInputBase-root.Mui-focused fieldset': {
            borderColor: 'var(--mui-palette-primary-main)!important'
          },
          '& .MuiFormLabel-root.Mui-focused': {
            color: 'var(--mui-palette-primary-main) !important'
          }
        }}
      />
      <Button variant='contained' color='primary'>
        Kirim
      </Button>
    </div>
  )
}

export default NewsletterForm
