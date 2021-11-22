import Search from '@components/Settings/Search'
import SettingsLayout from '@components/Settings/SettingsLayout'

export default function UsersSettings() {
  return (
    <SettingsLayout title="CRM | Users">
      <div>
        <Search />
        <div></div>
      </div>
    </SettingsLayout>
  )
}
