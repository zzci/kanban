import { useSortable } from '@dnd-kit/react/sortable'
import type { Issue, Tag } from '@/types/kanban'
import { Badge } from '@/components/ui/badge'
import { PriorityIcon } from './PriorityIcon'

export function KanbanCard({
  issue,
  tags,
  index,
  columnStatusId,
  isSelected,
  onCardClick,
}: {
  issue: Issue & { tags?: Tag[] }
  tags: Tag[]
  index: number
  columnStatusId: string
  isSelected?: boolean
  onCardClick?: (issue: Issue & { tags?: Tag[] }) => void
}) {
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
      onClick={() => onCardClick?.(issue)}
      className={`group rounded-lg border bg-card px-3 py-2.5 cursor-pointer hover:shadow-sm animate-card-enter ${
        isDragging
          ? 'opacity-50 scale-105 shadow-xl rotate-1 ring-2 ring-primary/30 transition-none'
          : 'transition-all'
      } ${
        isSelected
          ? 'border-primary/50 shadow-sm ring-1 ring-primary/20'
          : 'border-transparent hover:border-border'
      }`}
      style={{ animationDelay: `${index * 40}ms` }}
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
