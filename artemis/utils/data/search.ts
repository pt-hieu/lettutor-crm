enum SearchType {
  MODULE = '#',
  COMMAND = '>',
}

export enum Module {
  LEAD = 'lead',
  ACCOUNT = 'account',
  CONTACT = 'contact',
  DEAL = 'deal',
  TASK = 'task',
}

export type Command = {
  content: string
  action: string
  module?: Module
}

export const commands: Command[] = [
  {
    content: 'View users',
    action: '/settings/users',
  },
  {
    content: 'View leads',
    action: '/leads',
  },
  {
    content: 'Create a lead',
    action: '/leads/add-lead',
  },
  {
    content: 'Edit this lead',
    action: '/leads/[]/edit',
    module: Module.LEAD,
  },
  {
    content: 'Delete this lead',
    action: 'cmd:delete-lead',
    module: Module.LEAD,
  },
  {
    content: 'Convert this lead',
    action: 'cmd:convert-lead',
    module: Module.LEAD,
  },
  {
    content: 'View contacts',
    action: '/contacts',
  },
  {
    content: 'Create a contact',
    action: '/contacts/add-contact',
  },
  {
    content: 'Edit this contact',
    action: '/contacts/[]/edit',
    module: Module.CONTACT,
  },
  {
    content: 'Delete this contact',
    action: 'cmd:delete-contact',
    module: Module.CONTACT,
  },
  {
    content: 'View accounts',
    action: '/accounts',
  },
  {
    content: 'Create a account',
    action: '/accounts/add-account',
  },
  {
    content: 'Edit this accounts',
    action: '/accounts/[]/edit',
    module: Module.ACCOUNT,
  },
  {
    content: 'Delete this account',
    action: 'cmd:delete-account',
    module: Module.ACCOUNT,
  },
  {
    content: 'View deals',
    action: '/deals',
  },
  {
    content: 'Create a deal',
    action: '/deals/add-deal',
  },
  {
    content: 'Edit this deals',
    action: '/deals/[]/edit',
    module: Module.DEAL,
  },
  {
    content: 'Delete this deal',
    action: 'cmd:delete-deal',
    module: Module.DEAL,
  },
  {
    content: 'View tasks',
    action: '/tasks',
  },
  {
    content: 'Create a task',
    action: '/tasks/add-task',
  },
  {
    content: 'Edit this task',
    action: '/tasks/[]/edit',
    module: Module.TASK,
  },
  {
    content: 'Delete this task',
    action: 'cmd:delete-task',
    module: Module.TASK,
  },
]
