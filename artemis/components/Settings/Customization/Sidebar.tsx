import React from 'react'

export const Sidebar = () => {
  return (
    <div className="bg-gray-700 text-white h-full w-full p-5">
      <div>Side bar</div>
      <div className="grid grid-cols-2 gap-2 auto-rows-[32px]">
        {[...Array(10).keys()].map((i) => (
          <div
            key={i}
            className="bg-slate-50 rounded-sm text-gray-700 cursor-grab"
          >
            {i}
          </div>
        ))}
        <div className="bg-slate-50 rounded-sm text-gray-700 cursor-grab col-span-2">
          New section
        </div>
      </div>
    </div>
  )
}
