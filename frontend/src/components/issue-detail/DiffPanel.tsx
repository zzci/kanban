import { useRef } from 'react'
import { X } from 'lucide-react'

const MIN_WIDTH = 260

export function DiffPanel({
  width,
  onWidthChange,
  onClose,
}: {
  width: number
  onWidthChange: (w: number) => void
  onClose: () => void
}) {
  return (
    <div
      className="relative h-full shrink-0 border-l border-border bg-white"
      style={{ width }}
    >
      {/* Resize handle — absolutely positioned, no layout space */}
      <ResizeHandle width={width} onWidthChange={onWidthChange} />

      {/* Panel content */}
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0 min-h-[45px]">
          <span className="text-sm font-medium">更改</span>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center h-7 w-7 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Close diff panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm text-muted-foreground">
            没有要显示的更改
          </span>
        </div>
      </div>
    </div>
  )
}

export { MIN_WIDTH as DIFF_MIN_WIDTH }

function ResizeHandle({
  width,
  onWidthChange,
}: {
  width: number
  onWidthChange: (w: number) => void
}) {
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null)

  return (
    <div
      className="absolute left-0 top-0 bottom-0 w-2 -translate-x-1/2 z-10 cursor-col-resize group select-none"
      onPointerDown={(e) => {
        if (e.button !== 0) return
        e.preventDefault()
        e.stopPropagation()
        e.currentTarget.setPointerCapture(e.pointerId)
        dragRef.current = { startX: e.clientX, startWidth: width }
      }}
      onPointerMove={(e) => {
        if (!dragRef.current) return
        const dx = dragRef.current.startX - e.clientX
        const next = dragRef.current.startWidth + dx
        onWidthChange(Math.max(MIN_WIDTH, next))
      }}
      onPointerUp={() => {
        dragRef.current = null
      }}
    >
      {/* Invisible by default, highlight on hover/drag */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 rounded-full opacity-0 group-hover:opacity-100 group-active:opacity-100 bg-primary/50 group-active:bg-primary transition-opacity" />
    </div>
  )
}
