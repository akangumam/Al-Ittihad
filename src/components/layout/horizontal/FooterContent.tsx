'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  // Hooks
  const { isBreakpointReached } = useHorizontalNav()

  return (
    <div
      className={classnames(horizontalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span className='text-textSecondary'>{`© ${new Date().getFullYear()}, Made with `}</span>
        <span>{`❤️`}</span>
        <span className='text-textSecondary'>{` by `}</span>
        <Link href='https://khaerulumam.id/' target='_blank' className='text-primary uppercase'>
          Khaerul Umam
        </Link>
      </p>
      {!isBreakpointReached && (
        <p className='text-textSecondary text-sm'>Sistem Informasi Manajemen MTs Al-Ittihad Pedaleman</p>
      )}
    </div>
  )
}

export default FooterContent
