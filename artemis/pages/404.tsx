import Link from 'next/link'

import Layout from '@utils/components/Layout'

export default function NotFound() {
  return (
    <Layout requireLogin header={false} title="CRM | Not Found">
      <div className="grid place-content-center h-screen">
        <div className="flex flex-col items-center gap-8">
          <img
            className="w-[300px]"
            src="/illus/not_found.svg"
            alt="not found figure"
          />

          <div className="text-center">
            <div className="font-bold text-2xl">Oops!</div>
            <div className="mb-2">
              It's seemed like you followed a bad link.
            </div>

            <Link href="/">
              <a className="crm-button mx-auto inline-block hover:text-white">
                <span className="fa fa-home mr-2" />
                Back to Home
              </a>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
