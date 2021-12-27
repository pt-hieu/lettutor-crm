import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'

export enum ContactDetailSections {
  Deals = 'Deals',
  OpenActivities = 'Open Activities',
  ClosedActivities = 'Closed Activities',
}

const SideBarItems: SidebarStructure = [
  {
    title: 'Related List',
    options: Object.values(ContactDetailSections).map((item) => ({
      label: item,
    })),
  },
]

const ContactDetailSidebar = () => {
  return <DetailPageSidebar data={SideBarItems} />
}

export default ContactDetailSidebar
