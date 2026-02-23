import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { IssueWithTags } from '@/types/kanban'
import { kanbanApi } from '@/lib/kanban-api'
import { useBoardStore } from '@/stores/board-store'

export const queryKeys = {
  projects: () => ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  statuses: (projectId: string) =>
    ['projects', projectId, 'statuses'] as const,
  issues: (projectId: string) => ['projects', projectId, 'issues'] as const,
  issue: (projectId: string, issueId: string) =>
    ['projects', projectId, 'issues', issueId] as const,
  tags: (projectId: string) => ['projects', projectId, 'tags'] as const,
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

export function useTags(projectId: string) {
  return useQuery({
    queryKey: queryKeys.tags(projectId),
    queryFn: () => kanbanApi.getTags(projectId),
    enabled: !!projectId,
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
      const previous = queryClient.getQueryData<IssueWithTags[]>(
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

export function useCreateTag(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; color: string }) =>
      kanbanApi.createTag(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags(projectId) })
    },
  })
}

export function useDeleteTag(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tagId: string) => kanbanApi.deleteTag(projectId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags(projectId) })
    },
  })
}
