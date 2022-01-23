import Layout from '@utils/components/Layout'
import { SettingData, SG } from '@utils/data/setting-data'
import Link from 'next/link'

export default function Settings() {
  return (
    <Layout requireLogin title="CRM | Settings">
      <div className="crm-container">
        <div className="font-semibold text-xl">Settings</div>
        <div
          className="grid gap-4 mt-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 260px))',
          }}
        >
          {SettingData.map(({ items, title }) => (
            <SettingGroup items={items} key={title} title={title} />
          ))}
        </div>
      </div>
    </Layout>
  )
}

function SettingGroup({ items, title }: SG) {
  return (
    <div className="bg-gray-100 rounded-lg h-[300px] p-4">
      <div className="truncate font-medium">{title}</div>
      <div className="mt-3 flex flex-col gap-2">
        {items.map(({ link, title }) => (
          <Link href={link} key={link}>
            <a className="crm-link">{title}</a>
          </Link>
        ))}
      </div>
    </div>
  )
}
