import ContactDetailNavbar from '@components/Contacts/ContactDetailNavbar'
import ContactDetailSidebar from '@components/Contacts/ContactDetailSidebar'
import Layout from '@utils/components/Layout'
import { getSessionToken } from '@utils/libs/getToken'
import { Contact } from '@utils/models/contact'
import { getContact } from '@utils/service/contact'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { ReactNode, useMemo } from 'react'
import { dehydrate, QueryClient, useQuery } from 'react-query'
import Link from 'next/link'

type ContactInfo = {
  label: string
  value: ReactNode
}

type Deal = {
  id: string
  name: string
  amount: number
  stage: string
  closingDate: string
}

const DealData: Deal = {
  name: 'Deal Name',
  amount: 60000,
  id: 'id',
  stage: 'Value Proposition',
  closingDate: '01/12/2021',
}

const ContactDetail = () => {
  const { query } = useRouter()
  const id = query.id as string

  const { data: contact } = useQuery<Contact>(['contacts', id], {
    enabled: false,
  })

  const contactInfo = useMemo(
    (): ContactInfo[] => [
      {
        label: 'Contact Owner',
        value: contact?.owner.name,
      },
      {
        label: 'Full Name',
        value: contact?.fullName,
      },
      {
        label: 'Email',
        value: contact?.email,
      },
      {
        label: 'Phone',
        value: contact?.phoneNum,
      },
    ],
    [contact],
  )

  return (
    <Layout title={`CRM | Contact | ${contact?.fullName}`} requireLogin>
      <div className="crm-container">
        <ContactDetailNavbar
          fullName={contact?.fullName || ''}
          id={contact?.id || ''}
        />

        <div className="grid grid-cols-[250px,1fr]">
          <ContactDetailSidebar />

          <div className="flex flex-col divide-y gap-4">
            <div>
              <div className="font-semibold mb-4 text-[17px]">Overview</div>
              <ul className="flex flex-col gap-4">
                {contactInfo.map(({ label, value }) => (
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
              <p className="font-semibold">
                <Link href={`leads/${DealData.id}`}>
                  <a className=" text-gray-700 hover:text-gray-600">
                    {DealData.name}
                  </a>
                </Link>
                <span className="bg-red-400 px-2 ml-4 text-white rounded-sm">
                  VND {DealData.amount}
                </span>
              </p>
              <p>
                <span>{DealData.stage}</span>
                <span className="ml-4">{DealData.closingDate}</span>
              </p>
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
      client.prefetchQuery(['contacts', id], getContact(id, token)),
    ])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default ContactDetail
