import { useState } from 'react'
import { Plus, Search, Settings, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Project } from '@/types/kanban'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePanelStore } from '@/stores/panel-store'
import { ProjectSettingsDialog } from '@/components/ProjectSettingsDialog'

export function KanbanHeader({
  project,
  issueCount,
  defaultStatusId,
  mobileNav,
}: {
  project: Project
  issueCount: number
  defaultStatusId?: string
  mobileNav?: React.ReactNode
}) {
  const { t } = useTranslation()
  const openCreateDialog = usePanelStore((s) => s.openCreateDialog)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="shrink-0 border-b border-border bg-card">
      {/* Top row: project name + actions */}
      <div className="flex items-center justify-between px-3 py-3 md:px-5">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          {mobileNav}
          <h1 className="text-base font-semibold text-foreground truncate">
            {project.name}
          </h1>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.07] transition-colors shrink-0"
            aria-label={t('project.settings')}
            title={t('project.settings')}
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs text-muted-foreground tabular-nums hidden md:inline">
            {t('project.issueCount', { count: issueCount })}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Search — hidden on mobile */}
          <div className="hidden md:flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('common.search')}
              className="w-28 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Filter — icon only on mobile */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs text-muted-foreground md:gap-1.5"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{t('kanban.filter')}</span>
          </Button>

          <Separator orientation="vertical" className="h-5 hidden md:block" />

          {/* New issue button — icon only on mobile */}
          <Button
            size="sm"
            onClick={() => openCreateDialog(defaultStatusId)}
            className="h-8 text-xs md:gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{t('kanban.newIssue')}</span>
          </Button>
        </div>
      </div>
      <ProjectSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        project={project}
      />
    </div>
  )
}
