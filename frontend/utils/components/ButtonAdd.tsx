import { useOnClickOutside } from '@utils/hooks/useOnClickOutSide'
import React, { ReactNode, useCallback, useRef, useState } from 'react'

interface IProps {
  onClick: () => void
  title: string
  menuItems: ReactNode
}

const ButtonAdd = ({ onClick: onAdd, title, menuItems }: IProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useOnClickOutside(
    menuRef,
    useCallback(() => setShowMenu(false), []),
  )

  return (
    <div>
      <button
        className="crm-button h-full tracking-wide font-medium rounded-r-none"
        onClick={onAdd}
      >
        <span className="fa fa-plus mr-2" />
        {title}
      </button>

      <button
        className="crm-button h-full rounded-l-none border-blue-300 border-l"
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
    </div>
  )
}

export default ButtonAdd
