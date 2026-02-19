// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const horizontalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): HorizontalMenuDataType[] => [
  // Dashboard - Only Academy
  {
    label: dictionary['navigation'].dashboards,
    icon: 'ri-home-smile-line',
    children: [
      {
        label: dictionary['navigation'].academy,
        icon: 'ri-graduation-cap-line',
        href: '/dashboards/academy'
      }
    ]
  },
  {
    label: dictionary['navigation'].apps,
    icon: 'ri-mail-open-line',
    children: [
      // Academy - Main focus for school management
      {
        label: dictionary['navigation'].academy,
        icon: 'ri-graduation-cap-line',
        children: [
          {
            label: dictionary['navigation'].dashboard,
            href: '/apps/academy/dashboard'
          },
          {
            label: dictionary['navigation'].myCourses,
            href: '/apps/academy/my-courses'
          },
          {
            label: dictionary['navigation'].courseDetails,
            href: '/apps/academy/course-details'
          }
        ]
      },

      // User Management - Important for school system
      {
        label: dictionary['navigation'].user,
        icon: 'ri-user-line',
        children: [
          {
            label: dictionary['navigation'].list,
            href: '/apps/user/list'
          },
          {
            label: dictionary['navigation'].view,
            href: '/apps/user/view'
          }
        ]
      },

      // Roles & Permissions - For teachers, students, admin
      {
        label: dictionary['navigation'].rolesPermissions,
        icon: 'ri-lock-line',
        children: [
          {
            label: dictionary['navigation'].roles,
            href: '/apps/roles'
          },
          {
            label: dictionary['navigation'].permissions,
            href: '/apps/permissions'
          }
        ]
      }
    ]
  }
]

export default horizontalMenuData
