import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Settings, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useIssues, useStatuses, useProject } from '@/hooks/use-kanban'
import type { IssueWithTags, Status } from '@/types/kanban'
import { Button } from '@/components/ui/button'
import { usePanelStore } from '@/stores/panel-store'
import { ProjectSettingsDialog } from '@/components/ProjectSettingsDialog'
import { tStatus } from '@/lib/i18n-utils'

export function IssueListPanel({
  projectId,
  activeIssueId,
  projectName,
}: {
  projectId: string
  activeIssueId: string
  projectName: string
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: issues } = useIssues(projectId)
  const { data: statuses } = useStatuses(projectId)
  const { data: project } = useProject(projectId)
  const openCreateDialog = usePanelStore((s) => s.openCreateDialog)
  const [search, setSearch] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const filtered = useMemo(
    () =>
      issues?.filter((issue) =>
        issue.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [issues, search],
  )

  const grouped = useMemo(() => {
    if (!statuses || !filtered) return []
    const map = new Map<string, IssueWithTags[]>()
    for (const issue of filtered) {
      const list = map.get(issue.statusId) ?? []
      list.push(issue)
      map.set(issue.statusId, list)
    }
    return statuses
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((status) => ({
        status,
        issues: map.get(status.id) ?? [],
      }))
  }, [statuses, filtered])

  const toggleCollapse = (statusId: string) => {
    setCollapsed((prev) => ({ ...prev, [statusId]: !prev[statusId] }))
  }

  return (
    <div className="flex flex-col h-full w-[280px] border-r border-border bg-secondary shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b min-h-[45px]">
        <span className="text-sm font-semibold truncate">{projectName}</span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => openCreateDialog()}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 rounded-lg bg-card px-2.5 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      {project ? (
        <ProjectSettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
          project={project}
        />
      ) : null}

      {/* Grouped issue list */}
      <div className="flex-1 overflow-y-auto">
        {grouped.map(({ status, issues: groupIssues }) => (
          <StatusGroup
            key={status.id}
            status={status}
            issues={groupIssues}
            isCollapsed={!!collapsed[status.id]}
            onToggle={() => toggleCollapse(status.id)}
            activeIssueId={activeIssueId}
            onNavigate={(issueId) =>
              navigate(`/projects/${projectId}/issues/${issueId}`)
            }
          />
        ))}
      </div>
    </div>
  )
}

function StatusGroup({
  status,
  issues,
  isCollapsed,
  onToggle,
  activeIssueId,
  onNavigate,
}: {
  status: Status
  issues: IssueWithTags[]
  isCollapsed: boolean
  onToggle: () => void
  activeIssueId: string
  onNavigate: (issueId: string) => void
}) {
  const { t } = useTranslation()
  return (
    <div>
      {/* Status header bar — tinted with the status color */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs sticky top-0 z-10 transition-colors"
        style={{ backgroundColor: `${status.color}14` }}
      >
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: status.color }}
        />
        <span className="font-semibold text-foreground/80 truncate">
          {tStatus(t, status.name)}
        </span>
        <span className="text-[10px] text-muted-foreground/50 ml-auto shrink-0">
          ({issues.length})
        </span>
      </button>

      {/* Column sub-header */}
      {!isCollapsed ? (
        <>
          {/* Issue rows */}
          {issues.map((issue) => {
            const isActive = issue.id === activeIssueId
            return (
              <button
                key={issue.id}
                type="button"
                onClick={() => onNavigate(issue.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2 text-left border-b border-border/20 transition-colors ${
                  isActive ? 'bg-accent/70' : 'hover:bg-accent/40'
                }`}
              >
                <span
                  className={`text-[11px] font-mono shrink-0 w-[52px] ${
                    isActive
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground/70'
                  }`}
                >
                  {issue.displayId}
                </span>
                <span
                  className={`text-[13px] truncate ${
                    isActive
                      ? 'text-foreground font-medium'
                      : 'text-foreground/90'
                  }`}
                >
                  {issue.title}
                </span>
              </button>
            )
          })}
        </>
      ) : null}
    </div>
  )
}
