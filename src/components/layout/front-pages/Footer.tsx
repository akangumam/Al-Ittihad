'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import Link from '@components/Link'
import FrontLogo from '@components/layout/shared/FrontLogo'

// Util Imports
import { frontLayoutClasses } from '@layouts/utils/layoutClasses'

// Styles Imports
import styles from './styles.module.css'

const Footer = () => {
  return (
    <footer className={frontLayoutClasses.footer}>
      <div className='relative'>
        <img
          src='/images/front-pages/footer-bg.png'
          alt='footer bg'
          className='absolute inset-0 is-full bs-full object-cover -z-[1]'
        />
        <div className={classnames('plb-12 text-white px-6')}>
          <Grid container rowSpacing={10} columnSpacing={12}>
            <Grid size={{ xs: 12, lg: 5 }}>
              <div className='flex flex-col items-start gap-6'>
                <Link href='/'>
                  <FrontLogo />
                </Link>
                <Typography color='white' className='lg:max-is-[390px] opacity-[0.78]'>
                  Sekolah Al-Ittihad adalah lembaga pendidikan Islam terpadu yang menggabungkan kurikulum nasional
                  dengan nilai-nilai kepesantrenan untuk membentuk generasi Qur&apos;ani yang berprestasi.
                </Typography>
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
              </div>
            </Grid>
            <Grid size={{ xs: 12, sm: 3, lg: 2 }}>
              <Typography color='white' className='font-medium mbe-6 opacity-[0.92]'>
                Profil
              </Typography>
              <div className='flex flex-col gap-4'>
                <Typography component={Link} href='/profil/sambutan' color='white' className='opacity-[0.78]'>
                  Sambutan
                </Typography>
                <Typography component={Link} href='/profil/visi-misi' color='white' className='opacity-[0.78]'>
                  Visi & Misi
                </Typography>
                <Typography component={Link} href='/profil/sejarah' color='white' className='opacity-[0.78]'>
                  Sejarah
                </Typography>
                <Typography component={Link} href='/profil/fasilitas' color='white' className='opacity-[0.78]'>
                  Fasilitas
                </Typography>
              </div>
            </Grid>
            <Grid size={{ xs: 12, sm: 3, lg: 2 }}>
              <Typography color='white' className='font-medium mbe-6 opacity-[0.92]'>
                Akademik
              </Typography>
              <div className='flex flex-col gap-4'>
                <Typography component={Link} href='/akademik/kurikulum' color='white' className='opacity-[0.78]'>
                  Kurikulum
                </Typography>
                <Typography component={Link} href='/akademik/jenjang' color='white' className='opacity-[0.78]'>
                  Jenjang
                </Typography>
                <Typography component={Link} href='/akademik/ekstrakurikuler' color='white' className='opacity-[0.78]'>
                  Ekstrakurikuler
                </Typography>
                <Typography component={Link} href='/berita' color='white' className='opacity-[0.78]'>
                  Berita & Kegiatan
                </Typography>
              </div>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Typography color='white' className='font-medium mbe-6 opacity-[0.92]'>
                Hubungi Kami
              </Typography>
              <div className='flex flex-col gap-4'>
                <div className='flex items-start gap-3'>
                  <i className='ri-map-pin-line text-xl' />
                  <div>
                    <Typography variant='body2' color='white' className='opacity-[0.92]'>
                      Jl. Syeh Nawawi Tanara Kp Pesisir Ds. Pedaleman No. 123, Kab. Serang - Banten
                    </Typography>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <i className='ri-phone-line text-xl' />
                  <Typography color='white' className='opacity-[0.92]'>
                    (021) 1234-5678
                  </Typography>
                </div>
                <div className='flex items-center gap-3'>
                  <i className='ri-mail-line text-xl' />
                  <Typography color='white' className='opacity-[0.92]'>
                    info@al-ittihad.sch.id
                  </Typography>
                </div>
                <div className='flex items-center gap-3'>
                  <i className='ri-time-line text-xl' />
                  <Typography color='white' className='opacity-[0.92]'>
                    Senin - Jumat: 07.00 - 16.00
                  </Typography>
                </div>
              </div>
            </Grid>
          </Grid>
        </div>
      </div>
      <div className='bg-[#211B2C]'>
        <div className='flex flex-wrap items-center justify-center sm:justify-between gap-4 plb-[15px] px-6'>
          <Typography className='text-white opacity-[0.92]' variant='body2'>
            <span>{`© ${new Date().getFullYear()}, Made with `}</span>
            <span>{`❤️`}</span>
            <span>{` by `}</span>
            <Link href='https://khaerulumam.id/' target='_blank' className='font-medium text-white'>
              Khaerul Umam
            </Link>
          </Typography>
          <div className='flex gap-1.5 items-center opacity-[0.78]'>
            <IconButton component={Link} size='small' href='https://github.com/pixinvent' target='_blank'>
              <i className='ri-github-fill text-white text-lg' />
            </IconButton>
            <IconButton component={Link} size='small' href='https://www.facebook.com/pixinvents/' target='_blank'>
              <i className='ri-facebook-fill text-white text-lg' />
            </IconButton>
            <IconButton component={Link} size='small' href='https://twitter.com/pixinvents' target='_blank'>
              <i className='ri-twitter-fill text-white text-lg' />
            </IconButton>
            <IconButton component={Link} size='small' href='https://www.linkedin.com/company/pixinvent' target='_blank'>
              <i className='ri-linkedin-fill text-white text-lg' />
            </IconButton>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
