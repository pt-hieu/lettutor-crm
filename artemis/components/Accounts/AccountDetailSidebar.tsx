import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'

export enum AccountDetailSections {
  Deals = 'Deals',
  OpenActivities = 'Open Activities',
  ClosedActivities = 'Closed Activities',
}

const SideBarItems: SidebarStructure = [
  {
    title: 'Related List',
    options: Object.values(AccountDetailSections).map((item) => ({
      label: item,
    })),
  },
]

const AccountDetailSidebar = () => {
  return <DetailPageSidebar data={SideBarItems} />
}

export default AccountDetailSidebar
