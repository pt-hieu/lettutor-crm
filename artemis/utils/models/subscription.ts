export enum OpCode {
  CONNECT_SUCCESSFULLY = 'connect successfully',
  INVALIDATE_SESSION = 'invalidate session',
}

export type MessageData = {
  opcode: OpCode
  payload: any
}

export interface Message extends MessageEvent {
  data: MessageData
}
