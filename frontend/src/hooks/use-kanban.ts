import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { IssueWithTags } from '@/types/kanban'
import { kanbanApi } from '@/lib/kanban-api'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
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
      queryClient.invalidateQueries({ queryKey: ['projects'] })
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
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] })
    },
  })
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => kanbanApi.getProject(projectId),
  })
}

export function useStatuses(projectId: string) {
  return useQuery({
    queryKey: ['statuses', projectId],
    queryFn: () => kanbanApi.getStatuses(projectId),
  })
}

export function useIssues(projectId: string) {
  return useQuery({
    queryKey: ['issues', projectId],
    queryFn: () => kanbanApi.getIssues(projectId),
  })
}

export function useIssue(projectId: string, issueId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'issues', issueId],
    queryFn: () => kanbanApi.getIssue(projectId, issueId),
  })
}

export function useTags(projectId: string) {
  return useQuery({
    queryKey: ['tags', projectId],
    queryFn: () => kanbanApi.getTags(projectId),
  })
}

export function useCreateIssue(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      title: string
      statusId: string
      priority?: string
    }) => kanbanApi.createIssue(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] })
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
      await queryClient.cancelQueries({ queryKey: ['issues', projectId] })
      const previous = queryClient.getQueryData<IssueWithTags[]>([
        'issues',
        projectId,
      ])

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
        queryClient.setQueryData(['issues', projectId], updated)
      }

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['issues', projectId], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] })
    },
  })
}

export function useCreateTag(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; color: string }) =>
      kanbanApi.createTag(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags', projectId] })
    },
  })
}

export function useDeleteTag(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tagId: string) => kanbanApi.deleteTag(projectId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags', projectId] })
    },
  })
}
