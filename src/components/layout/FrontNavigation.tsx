'use client'

import { useState } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import useScrollTrigger from '@mui/material/useScrollTrigger'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import Button from '@mui/material/Button'

import FrontLogo from '@components/layout/shared/FrontLogo'

// Util Imports
import { frontLayoutClasses } from '@layouts/utils/layoutClasses'

// Styles Imports
import styles from '@components/layout/front-pages/styles.module.css'

// Styled Components
const StyledMenu = styled(Menu)(() => ({
  '& .MuiPaper-root': {
    marginTop: '8px',
    minWidth: 200,
    boxShadow: '0px 4px 16px rgba(0,0,0,0.1)',
    borderRadius: '8px'
  }
}))

const menuItems = [
  { label: 'Beranda', href: '/' },
  {
    label: 'Profil',
    submenu: [
      { label: 'Sambutan', href: '/profil/sambutan' },
      { label: 'Visi & Misi', href: '/profil/visi-misi' },
      { label: 'Sejarah', href: '/profil/sejarah' },
      { label: 'Struktur Organisasi', href: '/profil/struktur-organisasi' },
      { label: 'Dewan Guru', href: '/profil/dewan-guru' },
      { label: 'Fasilitas', href: '/profil/fasilitas' }
    ]
  },
  {
    label: 'Akademik',
    submenu: [
      { label: 'Kurikulum', href: '/akademik/kurikulum' },
      { label: 'Ekstrakurikuler', href: '/akademik/ekstrakurikuler' }
    ]
  },
  { label: 'Berita', href: '/berita' },
  { label: 'Alumni', href: '/alumni' },
  { label: 'PPDB', href: '/ppdb' },
  { label: 'Kontak', href: '/kontak' }
]

export default function FrontNavigation() {
  const pathname = usePathname()
  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({})
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState<{ [key: string]: boolean }>({})

  // Detect window scroll
  const trigger = useScrollTrigger({
    threshold: 0,
    disableHysteresis: true
  })

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, label: string) => {
    setAnchorEl(prev => ({ ...prev, [label]: event.currentTarget }))
  }

  const handleMenuClose = (label: string) => {
    setAnchorEl(prev => ({ ...prev, [label]: null }))
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleExpandMenu = (label: string) => {
    setExpandedMenu(prev => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <header className={classnames(frontLayoutClasses.header, styles.header)}>
      <div className={classnames(frontLayoutClasses.navbar, styles.navbar, { [styles.headerScrolled]: trigger })}>
        <div className={classnames(frontLayoutClasses.navbarContent, styles.navbarContent)}>
          <div className='flex items-center gap-10'>
            <Link href='/' style={{ display: 'flex', alignItems: 'center' }}>
              <FrontLogo />
            </Link>
            <nav className='hidden md:flex items-center gap-2'>
              {menuItems.map(item => {
                const hasSubmenu = 'submenu' in item

                const isActive = hasSubmenu
                  ? item.submenu?.some(sub => pathname.startsWith(sub.href))
                  : pathname === item.href

                return hasSubmenu ? (
                  <div key={item.label}>
                    <Button
                      onClick={e => handleMenuOpen(e, item.label)}
                      className={classnames('capitalize', {
                        'text-primary': isActive
                      })}
                      sx={{
                        color: isActive ? 'primary.main' : 'text.primary',
                        fontWeight: isActive ? 600 : 500,
                        '&:hover': { color: 'primary.main' }
                      }}
                      endIcon={<span style={{ marginLeft: '-4px', fontSize: '18px' }}>▾</span>}
                    >
                      {item.label}
                    </Button>
                    <StyledMenu
                      anchorEl={anchorEl[item.label]}
                      open={Boolean(anchorEl[item.label])}
                      onClose={() => handleMenuClose(item.label)}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    >
                      {item.submenu?.map(sub => (
                        <MenuItem
                          key={sub.href}
                          component={Link}
                          href={sub.href}
                          onClick={() => handleMenuClose(item.label)}
                          selected={pathname === sub.href}
                          sx={{
                            py: 1.5,
                            px: 2,
                            '&.Mui-selected': {
                              backgroundColor: 'primary.main',
                              color: 'common.white',
                              '&:hover': {
                                backgroundColor: 'primary.dark'
                              }
                            }
                          }}
                        >
                          {sub.label}
                        </MenuItem>
                      ))}
                    </StyledMenu>
                  </div>
                ) : (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    className={classnames('capitalize', {
                      'text-primary': isActive
                    })}
                    sx={{
                      color: isActive ? 'primary.main' : 'text.primary',
                      fontWeight: isActive ? 600 : 500,
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    {item.label}
                  </Button>
                )
              })}
            </nav>
          </div>
          <div className='flex items-center gap-2 sm:gap-4'>
            <IconButton
              color='inherit'
              aria-label='open drawer'
              edge='start'
              onClick={handleDrawerToggle}
              className='md:hidden'
            >
              <i className='ri-menu-line text-2xl' />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        anchor='left'
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 }
        }}
      >
        <div className='p-4'>
          <div className='flex items-center justify-between mb-4'>
            <img
              src='/images/logos/aliet_logo_color.png'
              alt='Al-Ittihad Logo'
              style={{ height: '40px', width: 'auto' }}
            />
            <IconButton onClick={handleDrawerToggle}>
              <i className='ri-close-line' />
            </IconButton>
          </div>
          <Divider />
          <List>
            {menuItems.map(item => {
              const hasSubmenu = 'submenu' in item

              const isActive = hasSubmenu
                ? item.submenu?.some(sub => pathname.startsWith(sub.href))
                : pathname === item.href

              return hasSubmenu ? (
                <div key={item.label}>
                  <ListItemButton
                    onClick={() => handleExpandMenu(item.label)}
                    sx={{
                      color: isActive ? 'primary.main' : 'text.primary',
                      fontWeight: isActive ? 600 : 500
                    }}
                  >
                    <ListItemText primary={item.label} />
                    <i className={`ri-arrow-${expandedMenu[item.label] ? 'up' : 'down'}-s-line`} />
                  </ListItemButton>
                  <Collapse in={expandedMenu[item.label]} timeout='auto' unmountOnExit>
                    <List component='div' disablePadding>
                      {item.submenu?.map(sub => (
                        <ListItemButton
                          key={sub.href}
                          component={Link}
                          href={sub.href}
                          onClick={handleDrawerToggle}
                          sx={{
                            pl: 4,
                            backgroundColor: pathname === sub.href ? 'primary.main' : 'transparent',
                            color: pathname === sub.href ? 'common.white' : 'text.primary',
                            '&:hover': {
                              backgroundColor: pathname === sub.href ? 'primary.dark' : 'action.hover'
                            }
                          }}
                        >
                          <ListItemText primary={sub.label} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </div>
              ) : (
                <ListItem key={item.href} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    onClick={handleDrawerToggle}
                    sx={{
                      color: isActive ? 'primary.main' : 'text.primary',
                      fontWeight: isActive ? 600 : 500,
                      backgroundColor: isActive ? 'action.selected' : 'transparent'
                    }}
                  >
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </div>
      </Drawer>
    </header>
  )
}
