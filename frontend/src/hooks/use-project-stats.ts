import { useIssues, useStatuses } from './use-kanban'

export function useProjectStats(projectId: string) {
  const { data: issues } = useIssues(projectId)
  const { data: statuses } = useStatuses(projectId)

  return {
    issueCount: issues?.length ?? 0,
    statusCount: statuses?.length ?? 0,
  }
}
