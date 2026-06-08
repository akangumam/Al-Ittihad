'use client'

import { useState, useCallback } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

type AspectOption = '1:1' | '3:4' | 'free'

interface Props {
  open: boolean
  imageSrc: string
  onComplete: (croppedBase64: string) => void
  onClose: () => void
}

const getCroppedImg = (imageSrc: string, pixelCrop: Area): Promise<string> =>
  new Promise((resolve, reject) => {
    const image = new Image()

    image.crossOrigin = 'anonymous'
    image.src = imageSrc

    image.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) return reject(new Error('Canvas not supported'))

      // Output size: max 400×400 to keep base64 reasonable
      const outputSize = 400
      canvas.width = outputSize
      canvas.height = pixelCrop.height === 0 ? outputSize : Math.round(outputSize * (pixelCrop.height / pixelCrop.width))

      ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, canvas.width, canvas.height)

      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }

    image.onerror = () => reject(new Error('Failed to load image'))
  })

const ASPECT_MAP: Record<AspectOption, number | undefined> = {
  '1:1': 1,
  '3:4': 3 / 4,
  free: undefined
}

export default function ImageCropDialog({ open, imageSrc, onComplete, onClose }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [aspectKey, setAspectKey] = useState<AspectOption>('1:1')
  const [isSaving, setIsSaving] = useState(false)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return

    try {
      setIsSaving(true)
      const result = await getCroppedImg(imageSrc, croppedAreaPixels)

      onComplete(result)
    } catch (err) {
      console.error('Crop error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setAspectKey('1:1')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle component='div' sx={{ pb: 1 }}>
        <Typography variant='h6' component='p'>Sesuaikan Foto</Typography>
        <Typography variant='caption' component='p' color='text.secondary'>
          Geser dan zoom untuk menyesuaikan posisi foto
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Crop area */}
        <div style={{ position: 'relative', width: '100%', height: 340, background: '#1a1a2e' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT_MAP[aspectKey]}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape={aspectKey === '1:1' ? 'round' : 'rect'}
            showGrid
          />
        </div>

        {/* Controls */}
        <div className='px-6 pt-4 pb-2 flex flex-col gap-4'>
          {/* Aspect ratio selector */}
          <div className='flex items-center gap-3'>
            <Typography variant='caption' color='text.secondary' sx={{ minWidth: 60 }}>
              Rasio
            </Typography>
            <ToggleButtonGroup
              value={aspectKey}
              exclusive
              size='small'
              onChange={(_, v) => { if (v) setAspectKey(v as AspectOption) }}
            >
              <ToggleButton value='1:1'>
                <i className='ri-square-line mr-1 text-sm' />
                <span className='text-xs'>Kotak</span>
              </ToggleButton>
              <ToggleButton value='3:4'>
                <i className='ri-rectangle-line mr-1 text-sm' />
                <span className='text-xs'>Portrait</span>
              </ToggleButton>
              <ToggleButton value='free'>
                <i className='ri-crop-line mr-1 text-sm' />
                <span className='text-xs'>Bebas</span>
              </ToggleButton>
            </ToggleButtonGroup>
          </div>

          {/* Zoom slider */}
          <div className='flex items-center gap-3'>
            <Typography variant='caption' color='text.secondary' sx={{ minWidth: 60 }}>
              Zoom
            </Typography>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.05}
              onChange={(_, v) => setZoom(v as number)}
              size='small'
              sx={{ flex: 1 }}
            />
            <Typography variant='caption' color='text.secondary' sx={{ minWidth: 32, textAlign: 'right' }}>
              {zoom.toFixed(1)}×
            </Typography>
          </div>
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant='outlined' color='secondary' onClick={handleClose} disabled={isSaving}>
          Batal
        </Button>
        <Button
          variant='contained'
          onClick={handleConfirm}
          disabled={isSaving}
          startIcon={isSaving ? <i className='ri-loader-4-line animate-spin' /> : <i className='ri-check-line' />}
        >
          {isSaving ? 'Memproses...' : 'Gunakan Foto'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
