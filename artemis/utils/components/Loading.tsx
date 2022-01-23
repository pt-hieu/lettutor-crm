import { CSSProperties, ReactNode } from 'react'
import UseAnimations from 'react-useanimations'
import loading from 'react-useanimations/lib/loading'

interface Props {
  children?: ReactNode
  wrapperStyle?: CSSProperties
  containerClass?: string
  on?: boolean
}

export default function Loading({
  on,
  children,
  wrapperStyle,
  containerClass,
}: Props) {
  return (
    <div
      className={
        'min-h-[24px] flex items-center justify-center ' + containerClass || ''
      }
    >
      {on ?? true ? (
        <UseAnimations
          animation={loading}
          wrapperStyle={wrapperStyle || { margin: 'auto' }}
          strokeColor="#fff"
        />
      ) : (
        children
      )}
    </div>
  )
}
