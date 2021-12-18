import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  useEffect,
  useRef,
} from 'react'

type Props = Omit<
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
  'ref'
> & {
  indeterminate?: boolean
}

export default function IndeterminateCheckbox({
  indeterminate,
  ...rest
}: Props) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.indeterminate = indeterminate || false
  }, [indeterminate])

  return <input type="checkbox" {...rest} />
}
