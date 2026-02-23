import type {
  AgentSession,
  ApiResponse,
  CreateSessionRequest,
  ExecuteSessionResponse,
  Issue,
  Project,
  SessionLogsResponse,
  Status,
} from '@/types/kanban'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = (await res.json()) as ApiResponse<T>
  if (!json.success) {
    throw new Error(json.error)
  }
  return json.data
}

function get<T>(url: string) {
  return request<T>(url)
}

function post<T>(url: string, body: unknown) {
  return request<T>(url, { method: 'POST', body: JSON.stringify(body) })
}

function patch<T>(url: string, body: unknown) {
  return request<T>(url, { method: 'PATCH', body: JSON.stringify(body) })
}

export const kanbanApi = {
  // Filesystem
  listDirs: (path?: string) =>
    get<{ current: string; parent: string | null; dirs: string[] }>(
      `/api/filesystem/dirs${path ? `?path=${encodeURIComponent(path)}` : ''}`,
    ),

  // Projects
  getProjects: () => get<Project[]>('/api/projects'),
  getProject: (id: string) => get<Project>(`/api/projects/${id}`),
  createProject: (data: {
    name: string
    description?: string
    directory?: string
    repositoryUrl?: string
  }) => post<Project>('/api/projects', data),
  updateProject: (
    id: string,
    data: {
      name?: string
      description?: string
      directory?: string
      repositoryUrl?: string
    },
  ) => patch<Project>(`/api/projects/${id}`, data),

  // Statuses
  getStatuses: (projectId: string) =>
    get<Status[]>(`/api/projects/${projectId}/statuses`),

  // Issues
  getIssues: (projectId: string) =>
    get<Issue[]>(`/api/projects/${projectId}/issues`),
  createIssue: (
    projectId: string,
    data: {
      title: string
      statusId: string
      priority?: string
      useWorktree?: boolean
    },
  ) => post<Issue>(`/api/projects/${projectId}/issues`, data),
  updateIssue: (projectId: string, id: string, data: Partial<Issue>) =>
    patch<Issue>(`/api/projects/${projectId}/issues/${id}`, data),
  bulkUpdateIssues: (
    projectId: string,
    updates: Array<{
      id: string
      changes: { statusId?: string; sortOrder?: number }
    }>,
  ) => patch<Issue[]>(`/api/projects/${projectId}/issues/bulk`, { updates }),

  getIssue: (projectId: string, issueId: string) =>
    get<Issue>(`/api/projects/${projectId}/issues/${issueId}`),

  // Sessions
  getSessionsByProject: (projectId: string) =>
    get<AgentSession[]>(`/api/projects/${projectId}/sessions`),

  getSessionsByIssue: (projectId: string, issueId: string) =>
    get<AgentSession[]>(
      `/api/projects/${projectId}/sessions?issueId=${encodeURIComponent(issueId)}`,
    ),

  getSession: (projectId: string, sessionId: string) =>
    get<AgentSession>(`/api/projects/${projectId}/sessions/${sessionId}`),

  getSessionLogs: (projectId: string, sessionId: string) =>
    get<SessionLogsResponse>(
      `/api/projects/${projectId}/sessions/${sessionId}/logs`,
    ),

  createSession: (projectId: string, data: CreateSessionRequest) =>
    post<AgentSession>(`/api/projects/${projectId}/sessions`, data),

  executeSession: (projectId: string, sessionId: string) =>
    post<ExecuteSessionResponse>(
      `/api/projects/${projectId}/sessions/${sessionId}/execute`,
      {},
    ),

  followUpSession: (projectId: string, sessionId: string, prompt: string) =>
    post<ExecuteSessionResponse>(
      `/api/projects/${projectId}/sessions/${sessionId}/follow-up`,
      { prompt },
    ),

  cancelSession: (projectId: string, sessionId: string) =>
    post<{ sessionId: string; status: string }>(
      `/api/projects/${projectId}/sessions/${sessionId}/cancel`,
      {},
    ),
}
