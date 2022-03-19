export type TransformParams<O = object, V = any> = {
  value: V
  obj: O
}

export enum Entity {
  LEAD = 'lead',
  TASK = 'task',
  DEAL = 'deal',
  ACCOUNT = 'account',
  CONTACT = 'contact',
}
