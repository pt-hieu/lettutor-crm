import Layout from '@utils/components/Layout'
import Sidebar from '@components/Settings/Sidebar'
import Search from '@components/Settings/Search'

export default function UsersSettings() {
  return (
    <Layout requireLogin>
      <div className="crm-container grid grid-cols-[300px,1fr]">
        <Sidebar />
        <div>
          <Search />
          <div></div>
        </div>
      </div>
    </Layout>
  )
}
