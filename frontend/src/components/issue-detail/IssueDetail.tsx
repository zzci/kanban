import { Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Issue, Status } from '@/types/kanban'
import { tStatus, tPriority } from '@/lib/i18n-utils'
import { PriorityIcon } from '@/components/kanban/PriorityIcon'

function formatDate(iso: string, lang: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
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
  issue: Issue
  status?: Status
}) {
  const { t, i18n } = useTranslation()

  return (
    <div className="px-4 py-3 space-y-4">
      {/* Description */}
      {issue.description ? (
        <div className="rounded-lg border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">
            {t('issue.description')}
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
            {tStatus(t, status.name)}
          </span>
        ) : null}

        {/* Priority */}
        <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium">
          <PriorityIcon priority={issue.priority} />
          {tPriority(t, issue.priority)}
        </span>

        {/* Created */}
        <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatDate(issue.createdAt, i18n.language)}
        </span>
      </div>

      {/* Empty chat state */}
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground/50">
          {t('issue.noChatMessages')}
        </p>
      </div>
    </div>
  )
}
