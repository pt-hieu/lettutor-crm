import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'

export enum LeadDetailSections {
  OpenActivities = 'Open Activities',
  ClosedActivities = 'Closed Activities',
}

const SideBarItems: SidebarStructure = [
  {
    title: 'Related List',
    options: Object.values(LeadDetailSections).map((item) => ({
      label: item,
    })),
  },
]

const LeadDetailSidebar = () => {
  return <DetailPageSidebar data={SideBarItems} />
}

export default LeadDetailSidebar
