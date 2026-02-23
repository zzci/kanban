import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Link, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useIssue, useStatuses } from '@/hooks/use-kanban'
import { IssueDetail } from './IssueDetail'
import { ChatInput } from './ChatInput'
import { DiffPanel } from './DiffPanel'
import { ReviewDialog } from './ReviewDialog'
import { Button } from '@/components/ui/button'

export function ChatArea({
  projectId,
  issueId,
  showDiff,
  diffWidth,
  onToggleDiff,
  onDiffWidthChange,
  onCloseDiff,
}: {
  projectId: string
  issueId: string
  showDiff: boolean
  diffWidth: number
  onToggleDiff: () => void
  onDiffWidthChange: (w: number) => void
  onCloseDiff: () => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: issue, isLoading, isError } = useIssue(projectId, issueId)
  const { data: statuses } = useStatuses(projectId)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showReview, setShowReview] = useState(false)
  const [copied, setCopied] = useState(false)

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      </div>
    )
  }

  if (isError || !issue) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-destructive">{t('issue.notFound')}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            {t('issue.backToBoard')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 min-w-0 bg-background">
      {/* Chat column */}
      <div className="flex flex-1 min-w-0 flex-col">
        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b shrink-0 min-h-[45px]">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground shrink-0"
            onClick={() => navigate(`/projects/${projectId}`)}
            title={t('issue.backToBoard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground shrink-0">
                {issue.displayId}
              </span>
              <span className="text-sm font-medium truncate">
                {issue.title}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 shrink-0 ${copied ? 'text-green-500' : 'text-muted-foreground'}`}
            title={t('issue.copyLink')}
            onClick={() => {
              const url = `${window.location.origin}/projects/${projectId}/issues/${issueId}`
              navigator.clipboard
                .writeText(url)
                .then(() => {
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                })
                .catch(() => {})
            }}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Link className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 text-xs h-7 px-3"
            onClick={() => setShowReview(true)}
          >
            <Play className="h-3 w-3" />
            {t('review.startReview')}
          </Button>
        </div>

        {/* Issue detail + messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-2">
          <IssueDetail
            issue={issue}
            status={statuses?.find((s) => s.id === issue.statusId)}
          />
        </div>

        {/* Input */}
        <ChatInput diffOpen={showDiff} onToggleDiff={onToggleDiff} />
      </div>

      {/* Diff panel */}
      {showDiff ? (
        <DiffPanel
          width={diffWidth}
          onWidthChange={onDiffWidthChange}
          onClose={onCloseDiff}
        />
      ) : null}

      {/* Review dialog */}
      {showReview ? (
        <ReviewDialog onClose={() => setShowReview(false)} />
      ) : null}
    </div>
  )
}
