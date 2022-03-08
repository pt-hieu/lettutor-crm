import { memo, ReactNode, useEffect, useRef } from 'react'
import { useHoverDirty } from 'react-use'
import Animate from './Animate'

type Props = {
  title: string
  children: ReactNode
  offset?: number
  disabled?: boolean
}

export default memo(function Tooltip({
  title,
  disabled,
  children,
  offset,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  const isHover = useHoverDirty(containerRef)

  useEffect(() => {
    if (!isHover) return
    if (!popupRef.current) return

    popupRef.current.style.minWidth = title.length + 5 + 'ch'
  }, [title, isHover])

  useEffect(() => {
    if (!isHover) return
    if (!popupRef.current) return
    if (!containerRef.current) return

    const toTopOfViewport =
      containerRef.current.offsetTop - window.scrollY - (offset || 60)

    const { width: popupWidth, height: popupHeight } =
      popupRef.current.getBoundingClientRect()
    const { width: containerWidth, height: containerHeight } =
      containerRef.current.getBoundingClientRect()

    let translateY = -popupHeight - 5
    if (toTopOfViewport < popupHeight + 5) {
      translateY = 5 + containerHeight
    }

    popupRef.current.style.transform = `translate(${
      -popupWidth / 2 + containerWidth / 2
    }px, ${translateY}px)`
  }, [isHover])

  return (
    <div className="inline-block relative z-[998]" ref={containerRef}>
      {children}

      <Animate
        shouldAnimateOnExit
        animation={{
          start: { opacity: 0 },
          animate: { opacity: 1 },
          end: { opacity: 0 },
        }}
        transition={{ delay: 0.15, duration: 0.25, ease: 'linear' }}
        on={disabled ? false : isHover}
      >
        <div
          ref={popupRef}
          className="absolute z-[1000] text-center left-0 top-0 bg-blue-600 text-white rounded-md p-2 px-3 shadow-md"
        >
          {title}
        </div>
      </Animate>
    </div>
  )
})
