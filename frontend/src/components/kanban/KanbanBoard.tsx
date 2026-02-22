import { DragDropProvider } from '@dnd-kit/react'
import { useEffect, useMemo } from 'react'
import { useBulkUpdateIssues, useIssues, useStatuses } from '@/hooks/use-kanban'
import type { IssueWithTags } from '@/types/kanban'
import { useBoardStore } from '@/stores/board-store'
import { usePanelStore } from '@/stores/panel-store'
import { KanbanColumn } from './KanbanColumn'

export function KanbanBoard({ projectId }: { projectId: string }) {
  const { data: statuses, isLoading: statusesLoading } = useStatuses(projectId)
  const { data: issues, isLoading: issuesLoading } = useIssues(projectId)
  const bulkUpdate = useBulkUpdateIssues(projectId)

  const { groupedItems, syncFromServer, applyDragOver, applyDragEnd } =
    useBoardStore()
  const selectedIssueId = usePanelStore((s) => s.selectedIssueId)

  // Map issues to IssueWithTags (tags default to [] if not embedded by API)
  const issuesWithTags = useMemo<IssueWithTags[] | undefined>(() => {
    if (!issues) return undefined
    return issues.map((issue) => ({
      ...issue,
      tags: (issue as Partial<IssueWithTags>).tags ?? [],
    }))
  }, [issues])

  useEffect(() => {
    if (!statuses || !issuesWithTags) return
    syncFromServer(statuses, issuesWithTags)
  }, [statuses, issuesWithTags, syncFromServer])

  const issuesByStatus = useMemo(() => {
    if (!statuses) return new Map<string, IssueWithTags[]>()
    const map = new Map<string, IssueWithTags[]>()
    for (const status of statuses) {
      map.set(status.id, groupedItems[status.id] ?? [])
    }
    return map
  }, [statuses, groupedItems])

  if (statusesLoading || issuesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">Loading board...</div>
      </div>
    )
  }

  if (!statuses?.length) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">
          No columns configured
        </div>
      </div>
    )
  }

  return (
    <DragDropProvider
      onDragOver={applyDragOver}
      onDragEnd={(event) => {
        const updates = applyDragEnd(event)
        if (updates.length > 0) {
          bulkUpdate.mutate(updates)
        }
      }}
    >
      <div className="flex h-full gap-3 overflow-x-auto p-3">
        {statuses.map((status) => (
          <KanbanColumn
            key={status.id}
            status={status}
            issues={issuesByStatus.get(status.id) ?? []}
            selectedIssueId={selectedIssueId}
          />
        ))}
      </div>
    </DragDropProvider>
  )
}
