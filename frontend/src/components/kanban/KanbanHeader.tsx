import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import type { Project } from '@/types/kanban'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePanelStore } from '@/stores/panel-store'

export function KanbanHeader({
  project,
  issueCount,
  defaultStatusId,
}: {
  project: Project
  issueCount: number
  defaultStatusId?: string
}) {
  const openCreateDialog = usePanelStore((s) => s.openCreateDialog)

  return (
    <div className="shrink-0 border-b border-border bg-card">
      {/* Top row: project name + actions */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-foreground">
            {project.name}
          </h1>
          <span className="text-xs text-muted-foreground tabular-nums">
            {issueCount} issues
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-28 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Filter */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </Button>

          <Separator orientation="vertical" className="h-5" />

          {/* New issue button */}
          <Button
            size="sm"
            onClick={() => openCreateDialog(defaultStatusId)}
            className="h-8 gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            New Issue
          </Button>
        </div>
      </div>
    </div>
  )
}
