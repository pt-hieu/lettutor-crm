import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

import { toCapitalizedWords } from '@components/Module/OverviewView'

const reports: { name: string }[] = [{ name: 'deal' }, { name: 'lead' }]

const active = 'text-blue-600 font-semibold'

export const ReportsSidebar = () => {
  const {
    push,
    query: { module },
  } = useRouter()

  useEffect(() => {
    if (!module) {
      push(
        {
          pathname: '/reports',
          query: { module: reports[0].name },
        },
        undefined,
        { shallow: true },
      )
    }
  }, [module])

  return (
    <div className="h-full text-gray-700 bg-gray-100 flex flex-col gap-3 p-4 rounded-md">
      <div className="font-semibold text-[17px]">Folders</div>
      {reports.map(({ name }) => (
        <Link
          href={{
            pathname: '/reports',
            query: { module: name },
          }}
          key={name}
        >
          <a
            className={`w-full text-left hover:text-blue-500 ${
              name === module ? active : ''
            }`}
          >
            {toCapitalizedWords(name + ' Reports')}
          </a>
        </Link>
      ))}
    </div>
  )
}
