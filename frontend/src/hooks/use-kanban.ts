import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateSessionRequest, Issue } from '@/types/kanban'
import { kanbanApi } from '@/lib/kanban-api'
import { useBoardStore } from '@/stores/board-store'

export const queryKeys = {
  projects: () => ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  statuses: (projectId: string) => ['projects', projectId, 'statuses'] as const,
  issues: (projectId: string) => ['projects', projectId, 'issues'] as const,
  issue: (projectId: string, issueId: string) =>
    ['projects', projectId, 'issues', issueId] as const,
  sessions: (projectId: string) => ['projects', projectId, 'sessions'] as const,
  sessionsByIssue: (projectId: string, issueId: string) =>
    ['projects', projectId, 'sessions', 'issue', issueId] as const,
  session: (projectId: string, sessionId: string) =>
    ['projects', projectId, 'sessions', sessionId] as const,
  sessionLogs: (projectId: string, sessionId: string) =>
    ['projects', projectId, 'sessions', sessionId, 'logs'] as const,
}

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects(),
    queryFn: () => kanbanApi.getProjects(),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name: string
      description?: string
      directory?: string
      repositoryUrl?: string
    }) => kanbanApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects() })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      id: string
      name?: string
      description?: string
      directory?: string
      repositoryUrl?: string
    }) => {
      const { id, ...rest } = data
      return kanbanApi.updateProject(id, rest)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects() })
      queryClient.invalidateQueries({
        queryKey: queryKeys.project(variables.id),
      })
    },
  })
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => kanbanApi.getProject(projectId),
    enabled: !!projectId,
  })
}

export function useStatuses(projectId: string) {
  return useQuery({
    queryKey: queryKeys.statuses(projectId),
    queryFn: () => kanbanApi.getStatuses(projectId),
    enabled: !!projectId,
  })
}

export function useIssues(projectId: string) {
  return useQuery({
    queryKey: queryKeys.issues(projectId),
    queryFn: () => kanbanApi.getIssues(projectId),
    enabled: !!projectId,
  })
}

export function useIssue(projectId: string, issueId: string) {
  return useQuery({
    queryKey: queryKeys.issue(projectId, issueId),
    queryFn: () => kanbanApi.getIssue(projectId, issueId),
    enabled: !!projectId && !!issueId,
  })
}

export function useCreateIssue(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      title: string
      statusId: string
      priority?: string
      useWorktree?: boolean
    }) => kanbanApi.createIssue(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues(projectId) })
    },
  })
}

export function useBulkUpdateIssues(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (
      updates: Array<{
        id: string
        changes: { statusId?: string; sortOrder?: number }
      }>,
    ) => kanbanApi.bulkUpdateIssues(projectId, updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.issues(projectId),
      })
      const previous = queryClient.getQueryData<Issue[]>(
        queryKeys.issues(projectId),
      )

      if (previous) {
        const updated = previous.map((issue) => {
          const update = updates.find((u) => u.id === issue.id)
          if (update) {
            return {
              ...issue,
              ...update.changes,
              updatedAt: new Date().toISOString(),
            }
          }
          return issue
        })
        queryClient.setQueryData(queryKeys.issues(projectId), updated)
      }

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.issues(projectId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues(projectId) })
      useBoardStore.getState().resetDragging()
    },
  })
}

// --- Session hooks ---

export function useSessionsByIssue(projectId: string, issueId: string) {
  return useQuery({
    queryKey: queryKeys.sessionsByIssue(projectId, issueId),
    queryFn: () => kanbanApi.getSessionsByIssue(projectId, issueId),
    enabled: !!projectId && !!issueId,
  })
}

export function useSession(projectId: string, sessionId: string) {
  return useQuery({
    queryKey: queryKeys.session(projectId, sessionId),
    queryFn: () => kanbanApi.getSession(projectId, sessionId),
    enabled: !!projectId && !!sessionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'running' || status === 'pending' ? 2000 : false
    },
  })
}

export function useCreateSession(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSessionRequest) =>
      kanbanApi.createSession(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessions(projectId),
      })
    },
  })
}

export function useExecuteSession(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) =>
      kanbanApi.executeSession(projectId, sessionId),
    onSuccess: (_data, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.session(projectId, sessionId),
      })
    },
  })
}

export function useFollowUpSession(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { sessionId: string; prompt: string }) =>
      kanbanApi.followUpSession(projectId, args.sessionId, args.prompt),
    onSuccess: (_data, args) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.session(projectId, args.sessionId),
      })
    },
  })
}

export function useCancelSession(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) =>
      kanbanApi.cancelSession(projectId, sessionId),
    onSuccess: (_data, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.session(projectId, sessionId),
      })
    },
  })
}
