'use client'

// MUI Imports
import { useParams } from 'next/navigation'

import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'

// Utils
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
}

const PageHeader = ({ title, subtitle, breadcrumbs }: PageHeaderProps) => {
  const { lang: locale } = useParams()

  return (
    <div className='mbe-6'>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs aria-label='breadcrumb' className='mbe-2'>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1

            if (isLast || !crumb.href) {
              return (
                <Typography key={index} color='text.primary' className='text-sm'>
                  {crumb.label}
                </Typography>
              )
            }

            return (
              <Link
                key={index}
                href={getLocalizedUrl(crumb.href, locale as Locale)}
                underline='hover'
                color='inherit'
                className='text-sm'
              >
                {crumb.label}
              </Link>
            )
          })}
        </Breadcrumbs>
      )}

      <div className='flex flex-col gap-1'>
        <Typography variant='h4' className='font-semibold'>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant='body2' color='text.secondary'>
            {subtitle}
          </Typography>
        )}
      </div>
    </div>
  )
}

export default PageHeader
