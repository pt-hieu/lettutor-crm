import AccountDetailNavbar from '@components/Accounts/AccountDetailNavbar'
import AccountDetailSidebar from '@components/Accounts/AccountDetailSidebar'
import Layout from '@utils/components/Layout'
import { getSessionToken } from '@utils/libs/getToken'
import { Account } from '@utils/models/account'
import { getAccount } from '@utils/service/account'
import moment from 'moment'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode, useMemo } from 'react'
import { dehydrate, QueryClient, useQuery } from 'react-query'

type AccountInfo = {
  label: string
  value: ReactNode
}

const AccountDetail = () => {
  const { query } = useRouter()
  const id = query.id as string

  const { data: account } = useQuery<Account>(['account', id], {
    enabled: false,
  })

  const accountInfo = useMemo(
    (): AccountInfo[] => [
      {
        label: 'Account Owner',
        value: account?.owner.name,
      },
      {
        label: 'Account Type',
        value: account?.type,
      },
      {
        label: 'Phone',
        value: account?.phoneNum,
      },
      {
        label: 'Address',
        value: account?.address,
      },
      {
        label: 'Description',
        value: account?.description,
      },
    ],
    [account],
  )

  return (
    <Layout title={`CRM | Account | ${account?.fullName}`} requireLogin>
      <div className="crm-container">
        <AccountDetailNavbar
          fullName={account?.fullName || ''}
          id={account?.id || ''}
        />

        <div className="grid grid-cols-[250px,1fr]">
          <AccountDetailSidebar />

          <div className="flex flex-col divide-y gap-4">
            <div>
              <div className="font-semibold mb-4 text-[17px]">Overview</div>
              <ul className="flex flex-col gap-4">
                {accountInfo.map(({ label, value }) => (
                  <li key={label} className="grid grid-cols-[250px,1fr] gap-4">
                    <span className="inline-block text-right font-medium">
                      {label}
                    </span>
                    {value}
                  </li>
                ))}
              </ul>
            </div>
            {/* FakeData */}
            <div className="pt-4">
              <div className="font-semibold mb-4 text-[17px]">Deals</div>
              {account?.deals?.map(
                ({ id, fullName, amount, stage, closingDate }) => (
                  <div key={id}>
                    <p className="font-semibold">
                      <Link href={`/deals/${id}`}>
                        <a className=" text-gray-700 hover:text-gray-600">
                          {fullName}
                        </a>
                      </Link>
                      <span className="bg-red-400 px-2 ml-4 text-white rounded-sm">
                        $ {amount}
                      </span>
                    </p>
                    <p>
                      <span>{stage}</span>
                      <span className="ml-4">
                        {moment(closingDate).format('DD/MM/YYYY')}
                      </span>
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)
  const id = params?.id as string

  if (token) {
    await Promise.all([
      client.prefetchQuery(['account', id], getAccount(id, token)),
    ])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default AccountDetail
