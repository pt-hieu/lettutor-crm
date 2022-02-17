import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'

export enum LeadDetailSections {
  OpenActivities = 'Open Activities',
  ClosedActivities = 'Closed Activities',
}

const LeadDetailSidebar = () => {
  const SideBarItems: SidebarStructure = [
    {
      title: 'Related List',
      options: [
        {
          label: LeadDetailSections.OpenActivities,
          choices: [
            {
              label: 'Task',
              onClick: () => console.log('Open add task!'),
            },
          ],
        },
        {
          label: LeadDetailSections.ClosedActivities,
        },
      ],
    },
  ]

  return <DetailPageSidebar data={SideBarItems} />
}

export default LeadDetailSidebar
