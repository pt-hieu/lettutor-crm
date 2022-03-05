export interface SGItems {
  title: string
  link: string
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
      },
      {
        title: 'Roles',
        link: '/settings/roles',
      },
    ],
  },
  {
    title: 'Customization',
    items: [
      {
        title: 'Modules and Fields',
        link: '/settings/modules',
      },
    ],
  },
]
