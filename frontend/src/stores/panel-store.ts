import { create } from 'zustand'
import type { Issue, Tag } from '@/types/kanban'

type PanelState =
  | { kind: 'closed' }
  | { kind: 'view'; issue: Issue & { tags?: Tag[] } }

const DEFAULT_WIDTH = 420
const MIN_WIDTH = 360
const MAX_WIDTH_RATIO = 0.5 // 50vw

interface PanelStore {
  panel: PanelState

  selectedIssueId: string | null
  isPanelOpen: boolean
  width: number

  // Create dialog (centered modal)
  createDialogOpen: boolean
  createDialogStatusId: string | undefined

  openView: (issue: Issue & { tags?: Tag[] }) => void
  close: () => void
  setWidth: (w: number) => void
  openCreateDialog: (statusId?: string) => void
  closeCreateDialog: () => void
}

function clampWidth(w: number): number {
  const maxW = window.innerWidth * MAX_WIDTH_RATIO
  return Math.max(MIN_WIDTH, Math.min(w, maxW))
}

export const usePanelStore = create<PanelStore>((set) => ({
  panel: { kind: 'closed' },
  selectedIssueId: null,
  isPanelOpen: false,
  width: DEFAULT_WIDTH,

  createDialogOpen: false,
  createDialogStatusId: undefined,

  openView: (issue) =>
    set({
      panel: { kind: 'view', issue },
      selectedIssueId: issue.id,
      isPanelOpen: true,
    }),

  close: () =>
    set({
      panel: { kind: 'closed' },
      selectedIssueId: null,
      isPanelOpen: false,
    }),

  setWidth: (w) => set({ width: clampWidth(w) }),

  openCreateDialog: (statusId) =>
    set({ createDialogOpen: true, createDialogStatusId: statusId }),

  closeCreateDialog: () =>
    set({ createDialogOpen: false, createDialogStatusId: undefined }),
}))
