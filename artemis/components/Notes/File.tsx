import { useCallback, useMemo, useRef } from 'react'
import { useHoverDirty } from 'react-use'

import Animate from '@utils/components/Animate'

type Props = {
  location?: string
  filename: string
  onRemove?: () => void
}

function ImageFile({ src }: { src?: string }) {
  return <img src={src || '/artemis_logo.png'} />
}

export default function File({ filename, location, onRemove: remove }: Props) {
  const ext = useMemo(() => filename.split('.').slice(-1)[0], [])

  const linkRef = useRef<HTMLAnchorElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const isContainerHover = useHoverDirty(containerRef)

  const renderFile = useMemo(
    () => ({
      jpg: <ImageFile src={location} />,
      png: <ImageFile src={location} />,
      jpeg: <ImageFile src={location} />,
      txt: <span className="fa fa-file text-2xl" />,
      doc: <span className="fa fa-file-word text-2xl" />,
      docx: <span className="fa fa-file-word text-2xl" />,
      fallback: <></>,
    }),
    [],
  )

  const downloadFile = useCallback(() => {
    if (!linkRef.current) return
    linkRef.current.click()
  }, [])

  return (
    <div className="w-[120px] ">
      <div
        ref={containerRef}
        className="bg-white h-[120px] ring-1 ring-gray-200 grid place-content-center relative rounded overflow-hidden"
      >
        {/* @ts-ignore */}
        {renderFile[ext] || renderFile['fallback']}

        <Animate
          shouldAnimateOnExit
          on={isContainerHover}
          animation={{
            start: { opacity: 0 },
            end: { opacity: 0 },
            animate: { opacity: 1 },
          }}
          transition={{ duration: 0.15, ease: 'linear' }}
        >
          <button
            className="absolute w-full h-full top-0 left-0 text-white bg-gray-600/60"
            onClick={downloadFile}
          >
            <span className="fa fa-download" />
            <div className="text-center">Download</div>
          </button>
        </Animate>
      </div>

      <a
        ref={linkRef}
        className="hidden"
        href={location}
        target="_blank"
        rel="noopener noreferrer"
        download={filename}
      />

      <div className="w-full flex gap-2 items-center">
        {remove && (
          <button
            onClick={remove}
            className="crm-button-danger rounded-full w-2 h-2 text-xs aspect-square !p-2 grid place-content-center"
          >
            <span className="fa fa-times" />
          </button>
        )}
        <div className="w-full text-[12px] truncate text-center mt-1 mb-2">
          {filename}
        </div>
      </div>
    </div>
  )
}
