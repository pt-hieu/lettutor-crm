import { ModuleName } from 'src/module/default.entity'

import { Action, ActionType, DefaultActionTarget } from './action.entity'

export const defaultActions: Pick<Action, 'target' | 'type'>[] = [
  {
    target: DefaultActionTarget.ADMIN,
    type: ActionType.IS_ADMIN,
  },
  {
    target: DefaultActionTarget.ADMIN,
    type: ActionType.CAN_VIEW_ALL,
  },
  {
    target: DefaultActionTarget.USER,
    type: ActionType.CAN_VIEW_DETAIL_ANY,
  },
  {
    target: DefaultActionTarget.USER,
    type: ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
  },
  {
    target: DefaultActionTarget.USER,
    type: ActionType.CAN_CREATE_NEW,
  },
  {
    target: DefaultActionTarget.USER,
    type: ActionType.CAN_DELETE_ANY,
  },
  {
    target: DefaultActionTarget.ROLE,
    type: ActionType.CAN_DELETE_ANY,
  },
  {
    target: DefaultActionTarget.ROLE,
    type: ActionType.CAN_CREATE_NEW,
  },
  {
    target: DefaultActionTarget.ROLE,
    type: ActionType.CAN_RESTORE_REVERSED,
  },
  {
    target: DefaultActionTarget.ROLE,
    type: ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
  },
  {
    target: DefaultActionTarget.TASK,
    type: ActionType.CAN_VIEW_ALL,
  },
  {
    target: DefaultActionTarget.TASK,
    type: ActionType.CAN_VIEW_DETAIL_ANY,
  },
  {
    target: DefaultActionTarget.TASK,
    type: ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
  },
  {
    target: DefaultActionTarget.TASK,
    type: ActionType.CAN_CREATE_NEW,
  },
  {
    target: DefaultActionTarget.TASK,
    type: ActionType.CAN_CLOSE_ANY,
  },
  {
    target: DefaultActionTarget.TASK,
    type: ActionType.CAN_DELETE_ANY,
  },
  {
    target: DefaultActionTarget.NOTE,
    type: ActionType.CAN_VIEW_ALL,
  },
  {
    target: DefaultActionTarget.NOTE,
    type: ActionType.CAN_CREATE_NEW,
  },
  {
    target: DefaultActionTarget.NOTE,
    type: ActionType.CAN_DELETE_ANY,
  },
  {
    target: DefaultActionTarget.DEAL_STAGE,
    type: ActionType.CAN_VIEW_ALL,
  },
  {
    target: DefaultActionTarget.DEAL_STAGE,
    type: ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
  },
  {
    target: ModuleName.LEAD,
    type: ActionType.CAN_VIEW_ALL,
  },
  {
    target: ModuleName.LEAD,
    type: ActionType.CAN_VIEW_DETAIL_ANY,
  },
  {
    target: ModuleName.LEAD,
    type: ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
  },
  {
    target: ModuleName.LEAD,
    type: ActionType.CAN_CREATE_NEW,
  },
  {
    target: ModuleName.LEAD,
    type: ActionType.CAN_CONVERT_ANY,
  },
  {
    target: ModuleName.LEAD,
    type: ActionType.CAN_DELETE_ANY,
  },
  {
    target: ModuleName.CONTACT,
    type: ActionType.CAN_VIEW_ALL,
  },
  {
    target: ModuleName.CONTACT,
    type: ActionType.CAN_VIEW_DETAIL_ANY,
  },
  {
    target: ModuleName.CONTACT,
    type: ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
  },
  {
    target: ModuleName.CONTACT,
    type: ActionType.CAN_CREATE_NEW,
  },
  {
    target: ModuleName.CONTACT,
    type: ActionType.CAN_DELETE_ANY,
  },
  {
    target: ModuleName.ACCOUNT,
    type: ActionType.CAN_VIEW_ALL,
  },
  {
    target: ModuleName.ACCOUNT,
    type: ActionType.CAN_VIEW_DETAIL_ANY,
  },
  {
    target: ModuleName.ACCOUNT,
    type: ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
  },
  {
    target: ModuleName.ACCOUNT,
    type: ActionType.CAN_CREATE_NEW,
  },
  {
    target: ModuleName.ACCOUNT,
    type: ActionType.CAN_DELETE_ANY,
  },
  {
    target: ModuleName.DEAL,
    type: ActionType.CAN_VIEW_ALL,
  },
  {
    target: ModuleName.DEAL,
    type: ActionType.CAN_VIEW_DETAIL_ANY,
  },
  {
    target: ModuleName.DEAL,
    type: ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
  },
  {
    target: ModuleName.DEAL,
    type: ActionType.CAN_CREATE_NEW,
  },
  {
    target: ModuleName.DEAL,
    type: ActionType.CAN_DELETE_ANY,
  },
]
