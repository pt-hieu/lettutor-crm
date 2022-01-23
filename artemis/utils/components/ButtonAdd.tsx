import { useOnClickOutside } from '@utils/hooks/useOnClickOutSide'
import React, {
  ReactNode,
  useCallback,
  useRef,
  useState,
  useMemo,
  MouseEventHandler,
} from 'react'
import Link from 'next/link'

type Props = {
  title: string
  menuItems?: ReactNode
} & (
  | { asLink: true; link: string; onClick?: never }
  | {
      asLink?: false
      link?: never
      onClick: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>
    }
)

const ButtonAdd = ({
  onClick: onAdd,
  title,
  menuItems,
  asLink,
  link,
}: Props) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useOnClickOutside(
    menuRef,
    useCallback(() => setShowMenu(false), []),
  )

  const Target = asLink ? 'a' : 'button'

  const target = useMemo(
    () => (
      <Target
        className={`crm-button h-full inline-block !text-white tracking-wide font-medium ${
          menuItems && 'rounded-r-none'
        }`}
        onClick={asLink ? undefined : onAdd}
      >
        <span className="fa fa-plus mr-2" />
        {title}
      </Target>
    ),
    [onAdd, title, asLink],
  )

  return (
    <div>
      {asLink ? <Link href={link || ''}>{target}</Link> : target}

      {menuItems && (
        <>
          <button
            className={`crm-button h-full rounded-l-none border-blue-300 border-l`}
            onClick={() => setShowMenu(!showMenu)}
            ref={menuRef}
          >
            <span className="fa fa-caret-down text-white" />
          </button>

          <div className="relative">
            {showMenu && (
              <div className="absolute right-0 top-1 min-w-[192px] rounded-md border bg-white overflow-hidden shadow-xl z-20 py-2">
                {menuItems}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ButtonAdd
