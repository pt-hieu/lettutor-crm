import { StrapiTimestamp } from "./base";

export interface ChangeLog extends StrapiTimestamp {
  version: string
  changes: string
  releasedAt: Date
}