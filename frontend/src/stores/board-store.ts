import { create } from 'zustand'
import { move } from '@dnd-kit/helpers'
import type { DragDropProvider } from '@dnd-kit/react'
import type { IssueWithTags, Status } from '@/types/kanban'

type DragEvent = Parameters<
  NonNullable<Parameters<typeof DragDropProvider>[0]['onDragOver']>
>[0]

interface BoardState {
  groupedItems: Record<string, IssueWithTags[]>
  isDragging: boolean

  syncFromServer: (statuses: Status[], issues: IssueWithTags[]) => void
  applyDragOver: (event: DragEvent) => void
  applyDragEnd: (
    event: DragEvent,
  ) => Array<{ id: string; changes: { statusId: string; sortOrder: number } }>
}

export const useBoardStore = create<BoardState>((set, get) => ({
  groupedItems: {},
  isDragging: false,

  syncFromServer: (statuses, issues) => {
    if (get().isDragging) return
    const groups: Record<string, IssueWithTags[]> = {}
    for (const status of statuses) {
      groups[status.id] = issues
        .filter((i) => i.statusId === status.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    }
    set({ groupedItems: groups })
  },

  applyDragOver: (event) => {
    const next = move(get().groupedItems, event)
    set({ groupedItems: next, isDragging: true })
  },

  applyDragEnd: (event) => {
    const current = get().groupedItems
    const updated = move(current, event)
    set({ groupedItems: updated })

    const updates: Array<{
      id: string
      changes: { statusId: string; sortOrder: number }
    }> = []
    for (const [statusId, items] of Object.entries(updated)) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.statusId !== statusId || item.sortOrder !== i) {
          updates.push({ id: item.id, changes: { statusId, sortOrder: i } })
        }
      }
    }

    setTimeout(() => {
      useBoardStore.setState({ isDragging: false })
    }, 500)

    return updates
  },
}))
