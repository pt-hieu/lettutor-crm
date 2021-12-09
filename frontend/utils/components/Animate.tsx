import {
  motion,
  AnimatePresence,
  AnimatePresenceProps,
  Transition,
} from 'framer-motion'
import {
  CSSProperties,
  DetailedHTMLProps,
  HTMLAttributes,
  useMemo,
} from 'react'

export type Animation = {
  start: CSSProperties
  animate: CSSProperties
}

export type AnimationWithExit = Animation & { end: CSSProperties }

type Props = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  transition?: Transition
} & (
    | {
        shouldAnimateOnExit: true
        presenceProps?: AnimatePresenceProps
        animation: AnimationWithExit
        on?: any
      }
    | {
        shouldAnimateOnExit?: false
        presenceProps?: never
        animation: Animation
        on?: never
      }
  )

export default function Animate({
  shouldAnimateOnExit,
  transition,
  animation,
  presenceProps,
  children,
  on,
  ...rest
}: Props) {
  const animatedChildren = useMemo(
    () =>
      !shouldAnimateOnExit || !!on ? (
        //@ts-ignore
        <motion.div
          initial="start"
          key={on}
          animate="animate"
          exit={shouldAnimateOnExit ? 'end' : undefined}
          variants={animation as any}
          transition={transition}
          {...rest}
        >
          {children}
        </motion.div>
      ) : null,
    [animation, transition, shouldAnimateOnExit, children, on, rest],
  )

  if (shouldAnimateOnExit)
    return (
      <AnimatePresence {...presenceProps}>{animatedChildren}</AnimatePresence>
    )

  return animatedChildren
}
