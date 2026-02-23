import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProject } from '@/hooks/use-kanban'
import { AppSidebar } from '@/components/kanban/AppSidebar'
import {
  CreateIssueDialog,
  CreateIssueForm,
} from '@/components/kanban/CreateIssueDialog'
import { IssueListPanel } from '@/components/issue-detail/IssueListPanel'
import { ChatArea } from '@/components/issue-detail/ChatArea'
import { DIFF_MIN_WIDTH } from '@/components/issue-detail/DiffPanel'

const SIDEBAR_WIDTH = 56
const MIN_CHAT_WIDTH = 300
const DEFAULT_DIFF_WIDTH = 360

export default function IssueDetailPage() {
  const { t } = useTranslation()
  const { projectId = 'default', issueId = '' } = useParams<{
    projectId: string
    issueId: string
  }>()

  const { data: project, isLoading, isError } = useProject(projectId)
  const [showDiff, setShowDiff] = useState(false)
  const [diffWidth, setDiffWidth] = useState(DEFAULT_DIFF_WIDTH)

  // Hide list panel when diff panel needs more than 50% of available space
  const availableWidth =
    typeof window !== 'undefined' ? window.innerWidth - SIDEBAR_WIDTH : 1200
  const hideListPanel = showDiff && diffWidth > availableWidth * 0.5

  const handleDiffWidthChange = useCallback((w: number) => {
    // Max = everything except sidebar + min chat area
    const maxWidth =
      (typeof window !== 'undefined' ? window.innerWidth : 1600) -
      SIDEBAR_WIDTH -
      MIN_CHAT_WIDTH
    setDiffWidth(Math.min(Math.max(DIFF_MIN_WIDTH, w), maxWidth))
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">
          {t('kanban.loadingProject')}
        </p>
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-destructive">
          {t('kanban.projectNotFound')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <AppSidebar activeProjectId={projectId} />
      {!hideListPanel ? (
        <IssueListPanel
          projectId={projectId}
          activeIssueId={issueId}
          projectName={project.name}
        />
      ) : null}
      {issueId ? (
        <ChatArea
          projectId={projectId}
          issueId={issueId}
          showDiff={showDiff}
          diffWidth={diffWidth}
          onToggleDiff={() => setShowDiff((v) => !v)}
          onDiffWidthChange={handleDiffWidthChange}
          onCloseDiff={() => setShowDiff(false)}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[580px] rounded-xl">
            <div className="px-5 pt-4 pb-2">
              <h2 className="text-sm font-semibold text-foreground">
                {t('issue.createTask')}
              </h2>
            </div>
            <CreateIssueForm projectId={projectId} autoFocus />
          </div>
        </div>
      )}
      <CreateIssueDialog />
    </div>
  )
}
