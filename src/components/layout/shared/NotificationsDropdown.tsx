'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'
import type { MouseEvent, ReactNode } from 'react'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'
import type { Theme } from '@mui/material/styles'

// Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { CustomAvatarProps } from '@core/components/mui/Avatar'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getInitials } from '@/utils/getInitials'

export type NotificationsType = {
  title: string
  subtitle: string
  time: string
  read: boolean
} & (
  | {
      avatarImage?: string
      avatarIcon?: never
      avatarText?: never
      avatarColor?: never
      avatarSkin?: never
    }
  | {
      avatarIcon?: string
      avatarColor?: ThemeColor
      avatarSkin?: CustomAvatarProps['skin']
      avatarImage?: never
      avatarText?: never
    }
  | {
      avatarText?: string
      avatarColor?: ThemeColor
      avatarSkin?: CustomAvatarProps['skin']
      avatarImage?: never
      avatarIcon?: never
    }
)

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return <div className='overflow-x-hidden bs-full'>{children}</div>
  } else {
    return (
      <PerfectScrollbar className='bs-full' options={{ wheelPropagation: false, suppressScrollX: true }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const getAvatar = (
  params: Pick<NotificationsType, 'avatarImage' | 'avatarIcon' | 'title' | 'avatarText' | 'avatarColor' | 'avatarSkin'>
) => {
  const { avatarImage, avatarIcon, avatarText, title, avatarColor, avatarSkin } = params

  if (avatarImage) {
    return <Avatar src={avatarImage} />
  } else if (avatarIcon) {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        <i className={avatarIcon} />
      </CustomAvatar>
    )
  } else {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        {avatarText || getInitials(title)}
      </CustomAvatar>
    )
  }
}

const NotificationDropdown = ({ notifications: data }: { notifications?: NotificationsType[] }) => {
  // States
  const [open, setOpen] = useState(false)
  const [notificationsState, setNotificationsState] = useState<NotificationsType[]>(data || [])
  const [loading, setLoading] = useState(false)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/system/notifications')
      const json = await response.json()
      const data: NotificationsType[] = Array.isArray(json) ? json : (json?.data ?? json?.notifications ?? [])

      // Filter out manually dismissed notifications using localStorage
      const dismissedIds = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]')
      const filteredData = data.filter((notif: any) => !dismissedIds.includes(notif.title))

      setNotificationsState(filteredData)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Vars
  const notificationCount = notificationsState.filter(notification => !notification.read).length
  const readAll = notificationsState.every(notification => notification.read)

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)
  const ref = useRef<HTMLDivElement | null>(null)

  // Hooks
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const { settings } = useSettings()

  const handleClose = () => {
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  // Read notification when notification is clicked
  const handleReadNotification = (event: MouseEvent<HTMLElement>, value: boolean, index: number) => {
    event.stopPropagation()
    const newNotifications = [...notificationsState]

    newNotifications[index].read = value
    setNotificationsState(newNotifications)
  }

  // Remove notification when close icon is clicked
  const handleRemoveNotification = (event: MouseEvent<HTMLElement>, index: number) => {
    event.stopPropagation()
    const notificationToRemove = notificationsState[index]
    const newNotifications = [...notificationsState]

    newNotifications.splice(index, 1)
    setNotificationsState(newNotifications)

    // Store dismissed notification title in localStorage to keep it hidden after refresh
    const dismissedIds = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]')

    if (!dismissedIds.includes(notificationToRemove.title)) {
      dismissedIds.push(notificationToRemove.title)
      localStorage.setItem('dismissedNotifications', JSON.stringify(dismissedIds))
    }
  }

  // Read or unread all notifications when read all icon is clicked
  const readAllNotifications = () => {
    const newNotifications = [...notificationsState]

    newNotifications.forEach(notification => {
      notification.read = !readAll
    })
    setNotificationsState(newNotifications)
  }

  useEffect(() => {
    const adjustPopoverHeight = () => {
      if (ref.current) {
        // Calculate available height, subtracting any fixed UI elements' height as necessary
        const availableHeight = window.innerHeight - 100

        ref.current.style.height = `${Math.min(availableHeight, 550)}px`
      }
    }

    window.addEventListener('resize', adjustPopoverHeight)
  }, [])

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
        <Badge
          color='error'
          className='cursor-pointer'
          overlap='circular'
          badgeContent={notificationCount > 0 ? notificationCount : null}
          invisible={notificationCount === 0}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <i className='ri-notification-2-line' />
        </Badge>
      </IconButton>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        ref={ref}
        anchorEl={anchorRef.current}
        {...(isSmallScreen
          ? {
              className: 'is-full !mbs-4 z-[1] max-bs-[550px] bs-[550px]',
              modifiers: [
                {
                  name: 'preventOverflow',
                  options: {
                    padding: themeConfig.layoutPadding
                  }
                }
              ]
            }
          : { className: 'is-96 !mbs-4 z-[1] max-bs-[550px] bs-[550px]' })}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper className={classnames('bs-full', settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg')}>
              <ClickAwayListener onClickAway={handleClose}>
                <div className='bs-full flex flex-col'>
                  <div className='flex items-center justify-between plb-3 pli-4 is-full gap-2'>
                    <Typography variant='h6' className='flex-auto'>
                      Notifikasi
                    </Typography>
                    {notificationCount > 0 && (
                      <Chip variant='tonal' size='small' color='primary' label={`${notificationCount} Baru`} />
                    )}
                    {notificationsState.length > 0 && (
                      <Tooltip
                        title={readAll ? 'Tandai semua belum dibaca' : 'Tandai semua sudah dibaca'}
                        placement={placement === 'bottom-end' ? 'left' : 'right'}
                        slotProps={{
                          popper: {
                            sx: {
                              '& .MuiTooltip-tooltip': {
                                transformOrigin:
                                  placement === 'bottom-end' ? 'right center !important' : 'right center !important'
                              }
                            }
                          }
                        }}
                      >
                        <IconButton size='small' onClick={() => readAllNotifications()} className='text-textPrimary'>
                          <i className={classnames(readAll ? 'ri-mail-line' : 'ri-mail-open-line', 'text-xl')} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                  <Divider />
                  <ScrollWrapper hidden={hidden}>
                    {loading && notificationsState.length === 0 ? (
                      <div className='p-4 text-center'>
                        <i className='ri-loader-2-line animate-spin text-2xl mb-2' />
                        <Typography variant='caption' display='block'>
                          Menganalisa sistem...
                        </Typography>
                      </div>
                    ) : notificationsState.length === 0 ? (
                      <div className='p-8 text-center'>
                        <i className='ri-checkbox-circle-line text-success text-4xl mb-2' />
                        <Typography variant='body2'>Semua aman!</Typography>
                        <Typography variant='caption'>Tidak ada peringatan mendesak saat ini.</Typography>
                      </div>
                    ) : (
                      notificationsState.map((notification, index) => {
                        const {
                          title,
                          subtitle,
                          time,
                          read,
                          avatarImage,
                          avatarIcon,
                          avatarText,
                          avatarColor,
                          avatarSkin
                        } = notification

                        return (
                          <div
                            key={index}
                            className={classnames('flex plb-3 pli-4 gap-3 cursor-pointer hover:bg-actionHover group', {
                              'border-be': index !== notificationsState.length - 1
                            })}
                            onClick={e => handleReadNotification(e, true, index)}
                          >
                            {getAvatar({ avatarImage, avatarIcon, title, avatarText, avatarColor, avatarSkin })}
                            <div className='flex flex-col flex-auto'>
                              <Typography variant='body2' className='font-medium mbe-1' color='text.primary'>
                                {title}
                              </Typography>
                              <Typography variant='caption' className='mbe-2' color='text.secondary'>
                                {subtitle}
                              </Typography>
                              <Typography variant='caption' color='text.disabled'>
                                {time}
                              </Typography>
                            </div>
                            <div className='flex flex-col items-end gap-2'>
                              <Badge
                                variant='dot'
                                color={read ? 'secondary' : 'primary'}
                                onClick={e => handleReadNotification(e, !read, index)}
                                className={classnames('mbs-1 mie-1', {
                                  'invisible group-hover:visible': read
                                })}
                              />
                              <i
                                className='ri-close-line text-xl invisible group-hover:visible text-textSecondary'
                                onClick={e => handleRemoveNotification(e, index)}
                              />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </ScrollWrapper>
                  <Divider />
                  <div className='p-4'>
                    <Button fullWidth variant='contained' size='small'>
                      Lihat Semua Notifikasi
                    </Button>
                  </div>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default NotificationDropdown
