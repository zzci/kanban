import { useSortable } from '@dnd-kit/react/sortable'
import type { Issue, Tag } from '@/types/kanban'
import { Badge } from '@/components/ui/badge'
import { usePanelStore } from '@/stores/panel-store'
import { PriorityIcon } from './PriorityIcon'

export function KanbanCard({
  issue,
  tags,
  index,
  columnStatusId,
  isSelected,
}: {
  issue: Issue & { tags?: Tag[] }
  tags: Tag[]
  index: number
  columnStatusId: string
  isSelected?: boolean
}) {
  const openView = usePanelStore((s) => s.openView)

  const { ref, isDragging } = useSortable({
    id: issue.id,
    index,
    group: columnStatusId,
    type: 'item',
    data: { issue },
  })

  return (
    <div
      ref={ref}
      onClick={() => openView(issue)}
      className={`group rounded-lg border bg-card px-3 py-2.5 transition-all cursor-pointer hover:shadow-sm ${
        isDragging ? 'opacity-40 shadow-lg' : ''
      } ${
        isSelected
          ? 'border-primary/50 shadow-sm ring-1 ring-primary/20'
          : 'border-transparent hover:border-border'
      }`}
    >
      {/* Top row: ID + Priority */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium text-muted-foreground font-mono">
          {issue.displayId}
        </span>
        <PriorityIcon priority={issue.priority} />
      </div>

      {/* Title */}
      <p className="text-sm font-medium leading-snug text-foreground">
        {issue.title}
      </p>

      {/* Description */}
      {issue.description ? (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {issue.description}
        </p>
      ) : null}

      {/* Tags */}
      {tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-[10px] px-1.5 py-0 font-normal"
              style={{ borderColor: tag.color, color: tag.color }}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  )
}
