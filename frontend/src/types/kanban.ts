export type Priority = 'urgent' | 'high' | 'medium' | 'low'

export type Project = {
  id: string
  name: string
  description?: string
  directory?: string
  repositoryUrl?: string
  createdAt: string
  updatedAt: string
}

export type Status = {
  id: string
  projectId: string
  name: string
  color: string
  sortOrder: number
}

export type Issue = {
  id: string
  projectId: string
  statusId: string
  issueNumber: number
  displayId: string
  title: string
  description: string | null
  priority: Priority
  sortOrder: number
  parentIssueId: string | null
  useWorktree: boolean
  createdAt: string
  updatedAt: string
}

export type Tag = {
  id: string
  projectId: string
  name: string
  color: string
}

export type IssueWithTags = Issue & { tags: Tag[] }

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }
