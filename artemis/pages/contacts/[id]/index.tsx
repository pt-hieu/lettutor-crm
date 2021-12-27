import ContactDetailNavbar from '@components/Contacts/ContactDetailNavbar'
import ContactDetailSidebar, {
  ContactDetailSections,
} from '@components/Contacts/ContactDetailSidebar'
import DealInfo from '@utils/components/DealInfo'
import Layout from '@utils/components/Layout'
import TaskList from '@utils/components/TaskList'
import { getSessionToken } from '@utils/libs/getToken'
import { investigate } from '@utils/libs/investigate'
import { Contact } from '@utils/models/contact'
import { TaskStatus } from '@utils/models/task'
import { getContact } from '@utils/service/contact'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { ReactNode, useMemo } from 'react'
import { dehydrate, QueryClient, useQuery } from 'react-query'

type ContactInfo = {
  label: string
  value: ReactNode
}

const ContactDetail = () => {
  const { query } = useRouter()
  const id = query.id as string

  const { data: contact } = useQuery<Contact>(['contact', id], {
    enabled: false,
  })

  const contactInfo = useMemo(
    (): ContactInfo[] => [
      {
        label: 'Contact Owner',
        value: contact?.owner?.name,
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

  const openTasks = useMemo(
    () =>
      contact?.tasksOfContact?.filter(
        (task) => task.status !== TaskStatus.COMPLETED,
      ),
    [contact],
  )
  const closedTasks = useMemo(
    () =>
      contact?.tasksOfContact?.filter(
        (task) => task.status === TaskStatus.COMPLETED,
      ),
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
              <div
                className="font-semibold mb-4 text-[17px]"
                id={ContactDetailSections.Deals}
              >
                {ContactDetailSections.Deals}
              </div>
              {contact?.deals?.map(
                ({ id, fullName, amount, stage, closingDate }) => (
                  <DealInfo
                    key={id}
                    id={id}
                    fullName={fullName}
                    amount={amount}
                    stage={stage}
                    closingDate={closingDate}
                  />
                ),
              )}
            </div>
            <div className="pt-4">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={ContactDetailSections.OpenActivities}
              >
                {ContactDetailSections.OpenActivities}
              </div>
              {openTasks && openTasks.length > 0 ? (
                <TaskList tasks={openTasks} />
              ) : (
                <p className="text-gray-500 font-medium">No records found</p>
              )}
            </div>
            <div className="pt-4">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={ContactDetailSections.ClosedActivities}
              >
                {ContactDetailSections.ClosedActivities}
              </div>
              {closedTasks && closedTasks.length > 0 ? (
                <TaskList tasks={closedTasks} />
              ) : (
                <p className="text-gray-500 font-medium">No records found</p>
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
      client.prefetchQuery(['contact', id], getContact(id, token)),
    ])
  }

  return {
    notFound: investigate(client, ['contact', id]).isError,
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default ContactDetail
