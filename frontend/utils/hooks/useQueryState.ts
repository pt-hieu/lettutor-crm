import { useRouter } from 'next/router'
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { stringifyUrl } from 'query-string'

type Type = string | number | undefined

export const useQueryState = <Type>(
  name: string,
  initValue: Type,
): [Type, Dispatch<SetStateAction<Type>>] => {
  const { query, pathname, asPath, replace } = useRouter()

  const [state, setState] = useState(
    (query[name] as unknown as Type) || initValue,
  )

  useEffect(() => {
    const newPathname = stringifyUrl({
      url: pathname,
      query: { ...query, [name]: state + '' },
    })

    const newAsPath = stringifyUrl({
      url: asPath,
      query: { ...query, [name]: state + '' },
    })

    console.log({ newPathname, state });


    replace(newPathname, newAsPath, { shallow: true })
  }, [state])

  return [state, setState]
}
