import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calendar,
  Minus,
  Tag,
} from 'lucide-react'
import type { IssueWithTags, Status } from '@/types/kanban'

const PRIORITY_CONFIG = {
  urgent: {
    label: '紧急',
    icon: AlertTriangle,
    className: 'text-red-500',
  },
  high: { label: '高', icon: ArrowUp, className: 'text-orange-500' },
  medium: { label: '中', icon: Minus, className: 'text-yellow-500' },
  low: { label: '低', icon: ArrowDown, className: 'text-blue-500' },
} as const

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function IssueDetail({
  issue,
  status,
}: {
  issue: IssueWithTags
  status?: Status
}) {
  const prio = PRIORITY_CONFIG[issue.priority] ?? PRIORITY_CONFIG.medium
  const PrioIcon = prio.icon

  return (
    <div className="px-4 py-3 space-y-4">
      {/* Description */}
      {issue.description ? (
        <div className="rounded-lg border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">
            描述
          </span>
          <p className="text-sm mt-1.5 whitespace-pre-wrap">
            {issue.description}
          </p>
        </div>
      ) : null}

      {/* Metadata */}
      <div className="flex flex-wrap gap-2">
        {/* Status */}
        {status ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: status.color }}
            />
            {status.name}
          </span>
        ) : null}

        {/* Priority */}
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${prio.className}`}
        >
          <PrioIcon className="h-3 w-3" />
          {prio.label}
        </span>

        {/* Tags */}
        {issue.tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
          >
            <Tag className="h-3 w-3 text-muted-foreground" />
            <span style={{ color: tag.color }}>{tag.name}</span>
          </span>
        ))}

        {/* Created */}
        <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatDate(issue.createdAt)}
        </span>
      </div>

      {/* Empty chat state */}
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground/50">
          暂无对话记录，发送消息开始交流
        </p>
      </div>
    </div>
  )
}
