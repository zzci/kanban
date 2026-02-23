import { create } from 'zustand'

interface SessionStoreState {
  activeSessionByIssue: Record<string, string> // issueId -> sessionId
  setActiveSession: (issueId: string, sessionId: string) => void
  clearActiveSession: (issueId: string) => void
  getActiveSession: (issueId: string) => string | null
}

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  activeSessionByIssue: {},

  setActiveSession: (issueId, sessionId) =>
    set((state) => ({
      activeSessionByIssue: {
        ...state.activeSessionByIssue,
        [issueId]: sessionId,
      },
    })),

  clearActiveSession: (issueId) =>
    set((state) => {
      const { [issueId]: _, ...rest } = state.activeSessionByIssue
      return { activeSessionByIssue: rest }
    }),

  getActiveSession: (issueId) =>
    get().activeSessionByIssue[issueId] ?? null,
}))
