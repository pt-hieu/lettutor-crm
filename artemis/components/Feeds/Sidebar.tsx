import Link from 'next/link'
import React from 'react'

import { toCapitalizedWords } from '@components/Module/OverviewView'

const feeds: { name: string }[] = [{ name: 'all' }]

const active = 'text-blue-600 font-semibold'

export const FeedsSidebar = () => {
  return (
    <div className="h-full text-gray-700 bg-gray-100 flex flex-col gap-3 p-4 rounded-md">
      <div className="font-semibold text-[17px]">Feeds</div>
      {feeds.map(({ name }) => (
        <Link
          href={{
            pathname: '/feeds',
            // query: { type: name },
          }}
          key={name}
        >
          <a
            className={`w-full text-left hover:text-blue-500 ${
              name === 'all' || !name ? active : ''
            }`}
          >
            {toCapitalizedWords(name + ' Feeds')}
          </a>
        </Link>
      ))}
    </div>
  )
}
