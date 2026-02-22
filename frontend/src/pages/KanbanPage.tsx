import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { GripVertical } from 'lucide-react'
import { useProject, useIssues, useStatuses } from '@/hooks/use-kanban'
import { usePanelStore } from '@/stores/panel-store'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { KanbanHeader } from '@/components/kanban/KanbanHeader'
import { AppSidebar } from '@/components/kanban/AppSidebar'
import { IssuePanel } from '@/components/kanban/IssuePanel'
import { CreateIssueDialog } from '@/components/kanban/CreateIssueDialog'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

export default function KanbanPage() {
  const { projectId = 'default' } = useParams<{ projectId: string }>()
  const { data: project, isLoading, isError } = useProject(projectId)
  const { data: issues } = useIssues(projectId)
  const { data: statuses } = useStatuses(projectId)

  const { panel, isPanelOpen, width, close } = usePanelStore()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Loading project...</p>
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-destructive">Project not found</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Left Sidebar */}
      <AppSidebar activeProjectId={projectId} />

      {/* Main Content */}
      <div className="flex flex-1 min-w-0 flex-col">
        <KanbanHeader
          project={project}
          issueCount={issues?.length ?? 0}
          defaultStatusId={statuses?.[0]?.id}
        />

        <div className="flex flex-1 min-h-0">
          <div className="flex-1 min-w-0 overflow-hidden">
            <KanbanBoard projectId={projectId} />
          </div>
        </div>
      </div>

      {/* Create Issue Dialog */}
      <CreateIssueDialog />

      {/* Issue View Sheet */}
      <Sheet open={isPanelOpen} onOpenChange={(open) => !open && close()}>
        <SheetContent
          className="flex-row p-0 gap-0"
          style={{ width }}
          aria-describedby={undefined}
        >
          <SheetTitle className="sr-only">Issue Details</SheetTitle>

          {/* Resize handle */}
          <ResizeHandle />

          {/* Panel content */}
          {statuses && panel.kind === 'view' ? (
            <div className="flex-1 min-w-0 overflow-hidden">
              <IssuePanel
                projectId={projectId}
                statuses={statuses}
                issue={panel.issue}
                onClose={close}
              />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function ResizeHandle() {
  const setWidth = usePanelStore((s) => s.setWidth)
  const width = usePanelStore((s) => s.width)
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null)

  return (
    <div
      className="w-4 shrink-0 cursor-col-resize flex items-center justify-center group relative"
      onPointerDown={(e) => {
        if (e.button !== 0) return
        e.preventDefault()
        e.stopPropagation()
        e.currentTarget.setPointerCapture(e.pointerId)
        dragRef.current = { startX: e.clientX, startWidth: width }
      }}
      onPointerMove={(e) => {
        if (!dragRef.current) return
        const dx = dragRef.current.startX - e.clientX
        setWidth(dragRef.current.startWidth + dx)
      }}
      onPointerUp={() => {
        dragRef.current = null
      }}
    >
      {/* Top border segment */}
      <div className="absolute top-0 left-0 w-[6px] bottom-[calc(50%+12px)] bg-border group-hover:bg-primary/70 group-active:bg-primary transition-colors rounded-b-sm" />
      {/* Drag grip indicator */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(50%-3px)] pointer-events-none">
        <GripVertical className="h-5 w-5 text-muted-foreground/50 group-hover:text-muted-foreground group-active:text-foreground transition-colors" />
      </div>
      {/* Bottom border segment */}
      <div className="absolute bottom-0 left-0 w-[6px] top-[calc(50%+12px)] bg-border group-hover:bg-primary/70 group-active:bg-primary transition-colors rounded-t-sm" />
    </div>
  )
}
