import { useNavigate } from 'react-router-dom'
import { X, Maximize2, Link } from 'lucide-react'
import type { Issue, Status, Tag } from '@/types/kanban'
import { Badge } from '@/components/ui/badge'
import { PriorityIcon } from './PriorityIcon'
import { ChatInput } from '@/components/issue-detail/ChatInput'

interface IssuePanelProps {
  projectId: string
  statuses: Status[]
  issue?: (Issue & { tags?: Tag[] }) | null
  onClose: () => void
  hideHeaderActions?: boolean
}

export function IssuePanel({
  projectId,
  statuses,
  issue,
  onClose,
  hideHeaderActions,
}: IssuePanelProps) {
  const navigate = useNavigate()

  const displayId = issue?.displayId ?? 'Issue'
  const issueTags = (issue as Issue & { tags?: Tag[] })?.tags ?? []

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      const target = e.target as HTMLElement
      const isEditable =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      if (isEditable) {
        target.blur()
        e.stopPropagation()
      } else {
        onClose()
      }
    }
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden bg-card outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
        <div className="flex items-center gap-2 min-w-0 font-mono">
          <span className="text-sm text-foreground truncate">{displayId}</span>
        </div>
        <div className="flex items-center gap-1">
          {!hideHeaderActions ? (
            <>
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/projects/${projectId}/issues/${issue?.id}`
                  navigator.clipboard.writeText(url)
                }}
                className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Copy link"
              >
                <Link className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate(`/projects/${projectId}/issues/${issue?.id}`)
                  onClose()
                }}
                className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Open in full page"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Property Row */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status</span>
            <Badge variant="secondary" className="text-xs">
              <span
                className="mr-1 h-2 w-2 rounded-full inline-block"
                style={{
                  backgroundColor: statuses.find(
                    (s) => s.id === issue?.statusId,
                  )?.color,
                }}
              />
              {statuses.find((s) => s.id === issue?.statusId)?.name}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Priority</span>
            <div className="flex items-center gap-1">
              <PriorityIcon priority={issue?.priority ?? 'medium'} />
              <span className="text-sm capitalize">{issue?.priority}</span>
            </div>
          </div>
        </div>

        {/* Tags Row */}
        {issueTags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b">
            <span className="text-xs text-muted-foreground">Tags</span>
            {issueTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs"
                style={{ borderColor: tag.color, color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        ) : null}

        {/* Title */}
        <div className="px-4 pt-4">
          <h2 className="text-lg font-medium">{issue?.title}</h2>
        </div>

        {/* Description */}
        <div className="px-4 pt-2 pb-4">
          {issue?.description ? (
            <p className="text-sm text-muted-foreground">{issue.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">
              No description
            </p>
          )}
        </div>

        {/* Metadata */}
        {issue ? (
          <div className="px-4 py-3 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Created {new Date(issue.createdAt).toLocaleDateString()}
              </span>
              <span>
                Updated {new Date(issue.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Chat input */}
      {issue ? <ChatInput /> : null}
    </div>
  )
}
