import { Children, ReactNode } from 'react'

interface Props {
  children?: ReactNode
  on: boolean
}

export default function Loading({ on, children }: Props) {
  return <>{on ? 'Loading...' : children}</>
}
