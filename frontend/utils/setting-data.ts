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
        title: 'Update Persional Information',
        link: '',
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
    ],
  },
]