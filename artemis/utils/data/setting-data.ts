export interface SGItems {
  title: string
  link: string
  isPrivate?: boolean
  target?: string
}

export interface SG {
  title: string
  items: SGItems[]
}

export const SettingData: SG[] = [
  {
    title: 'General',
    items: [
      {
        title: 'Update Personal Information',
        link: '/settings/update-information',
      },
    ],
  },
  {
    title: 'Users and Controls',
    items: [
      {
        title: 'Users',
        link: '/settings/users',
        isPrivate: true,
        target: 'user',
      },
      {
        title: 'Roles',
        link: '/settings/roles',
        isPrivate: true,
        target: 'role',
      },
    ],
  },
  {
    title: 'Customization',
    items: [
      {
        title: 'Modules and Fields',
        link: '/settings/modules',
        isPrivate: true,
        target: 'admin',
      },
    ],
  },
]
