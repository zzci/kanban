import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Maximize2, Link, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Issue, Status, Tag } from '@/types/kanban'
import { Badge } from '@/components/ui/badge'
import { PriorityIcon } from './PriorityIcon'
import { ChatInput } from '@/components/issue-detail/ChatInput'
import { tStatus, tTag, tPriority } from '@/lib/i18n-utils'

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
  const { t } = useTranslation()
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)

  const [copied, setCopied] = useState(false)

  const displayId = issue?.displayId ?? 'Issue'
  const issueTags = issue?.tags ?? []

  // Auto-focus the panel container on mount so Escape works immediately
  useEffect(() => {
    panelRef.current?.focus()
  }, [])

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

  const handleCopyLink = () => {
    const url = `${window.location.origin}/projects/${projectId}/issues/${issue?.id}`
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {})
  }

  return (
    <div
      ref={panelRef}
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
                onClick={handleCopyLink}
                className={`p-1 rounded-sm transition-colors ${copied ? 'text-green-500' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                aria-label={t('issue.copyLink')}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Link className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate(`/projects/${projectId}/issues/${issue?.id}`)
                  onClose()
                }}
                className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label={t('issue.openFullPage')}
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label={t('issue.closePanel')}
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
            <span className="text-xs text-muted-foreground">
              {t('issue.status')}
            </span>
            <Badge variant="secondary" className="text-xs">
              <span
                className="mr-1 h-2 w-2 rounded-full inline-block"
                style={{
                  backgroundColor: statuses.find(
                    (s) => s.id === issue?.statusId,
                  )?.color,
                }}
              />
              {tStatus(
                t,
                statuses.find((s) => s.id === issue?.statusId)?.name ?? '',
              )}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t('issue.priority')}
            </span>
            <div className="flex items-center gap-1">
              <PriorityIcon priority={issue?.priority ?? 'medium'} />
              <span className="text-sm capitalize">
                {tPriority(t, issue?.priority ?? 'medium')}
              </span>
            </div>
          </div>
        </div>

        {/* Tags Row */}
        {issueTags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b">
            <span className="text-xs text-muted-foreground">
              {t('issue.tags')}
            </span>
            {issueTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs"
                style={{ borderColor: tag.color, color: tag.color }}
              >
                {tTag(t, tag.name)}
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
              {t('issue.noDescription')}
            </p>
          )}
        </div>

        {/* Metadata */}
        {issue ? (
          <div className="px-4 py-3 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {t('issue.created')}{' '}
                {new Date(issue.createdAt).toLocaleDateString()}
              </span>
              <span>
                {t('issue.updated')}{' '}
                {new Date(issue.updatedAt).toLocaleDateString()}
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
