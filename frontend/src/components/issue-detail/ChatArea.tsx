import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Link, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  useIssue,
  useSession,
  useSessionsByIssue,
  useStatuses,
} from '@/hooks/use-kanban'
import { useSessionStream } from '@/hooks/use-session-stream'
import { useIsMobile } from '@/hooks/use-mobile'
import { useSessionStore } from '@/stores/session-store'
import { IssueDetail } from './IssueDetail'
import { ChatInput } from './ChatInput'
import { DiffPanel } from './DiffPanel'
import { ReviewDialog } from './ReviewDialog'
import { SessionMessages } from './SessionMessages'
import { Button } from '@/components/ui/button'

export function ChatArea({
  projectId,
  issueId,
  showDiff,
  diffWidth,
  onToggleDiff,
  onDiffWidthChange,
  onCloseDiff,
  showBackToList,
}: {
  projectId: string
  issueId: string
  showDiff: boolean
  diffWidth: number
  onToggleDiff: () => void
  onDiffWidthChange: (w: number) => void
  onCloseDiff: () => void
  showBackToList?: boolean
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: issue, isLoading, isError } = useIssue(projectId, issueId)
  const { data: statuses } = useStatuses(projectId)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showReview, setShowReview] = useState(false)
  const [copied, setCopied] = useState(false)
  const isMobile = useIsMobile()

  // Session state
  const activeSessionId = useSessionStore((s) => s.getActiveSession(issueId))
  const setActiveSession = useSessionStore((s) => s.setActiveSession)

  const {
    logs,
    status: streamStatus,
    isConnected,
    error: streamError,
    clearLogs,
  } = useSessionStream({
    projectId,
    sessionId: activeSessionId,
    enabled: !!activeSessionId,
  })

  const { data: session } = useSession(projectId, activeSessionId ?? '')
  const sessionStatus = streamStatus ?? session?.status ?? null

  // Auto-load latest session on mount
  const { data: issueSessions } = useSessionsByIssue(projectId, issueId)
  useEffect(() => {
    if (!activeSessionId && issueSessions?.length) {
      const latest = issueSessions[issueSessions.length - 1]
      setActiveSession(issueId, latest.id)
    }
  }, [issueSessions, activeSessionId, issueId, setActiveSession])

  const handleSessionCreated = (sessionId: string) => {
    clearLogs()
    setActiveSession(issueId, sessionId)
  }

  const handleSessionSwitch = (sessionId: string) => {
    clearLogs()
    setActiveSession(issueId, sessionId)
  }

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
    <div className="flex flex-1 min-w-0 bg-background overflow-hidden">
      {/* Chat column */}
      <div className="flex flex-1 min-w-0 flex-col">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b shrink-0 min-h-[45px] md:gap-3 md:px-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground shrink-0"
            onClick={() =>
              showBackToList
                ? navigate(`/projects/${projectId}/issues`)
                : navigate(`/projects/${projectId}`)
            }
            title={
              showBackToList ? t('issue.backToList') : t('issue.backToBoard')
            }
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
            className="shrink-0 gap-1.5 text-xs h-7 px-2 md:px-3"
            onClick={() => setShowReview(true)}
          >
            <Play className="h-3 w-3" />
            <span className="hidden md:inline">{t('review.startReview')}</span>
          </Button>
        </div>

        {/* Issue detail + messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="flex flex-col min-h-full justify-end py-2">
            <IssueDetail
              issue={issue}
              status={statuses?.find((s) => s.id === issue.statusId)}
            />
            <SessionMessages
              logs={logs}
              status={sessionStatus}
              isConnected={isConnected}
              error={streamError}
              scrollRef={scrollRef}
            />
          </div>
        </div>

        {/* Input */}
        <ChatInput
          projectId={projectId}
          activeSessionId={activeSessionId}
          sessionStatus={sessionStatus}
          sessions={issueSessions ?? []}
          onSessionSwitch={handleSessionSwitch}
          diffOpen={showDiff}
          onToggleDiff={onToggleDiff}
          scrollRef={scrollRef}
        />
      </div>

      {/* Diff panel — full-screen overlay on mobile, inline on desktop */}
      {showDiff ? (
        isMobile ? (
          <div className="fixed inset-0 z-40 bg-background flex flex-col">
            <DiffPanel
              width={0}
              onWidthChange={onDiffWidthChange}
              onClose={onCloseDiff}
              fullScreen
            />
          </div>
        ) : (
          <DiffPanel
            width={diffWidth}
            onWidthChange={onDiffWidthChange}
            onClose={onCloseDiff}
          />
        )
      ) : null}

      {/* Review dialog */}
      <ReviewDialog
        projectId={projectId}
        issueId={issueId}
        open={showReview}
        onOpenChange={setShowReview}
        onSessionCreated={handleSessionCreated}
      />
    </div>
  )
}
