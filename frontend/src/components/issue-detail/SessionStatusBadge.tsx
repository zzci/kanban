import { Ban, CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { SessionStatus } from '@/types/kanban'

const statusConfig: Record<
  SessionStatus,
  {
    icon: typeof Clock
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    className?: string
  }
> = {
  pending: { icon: Clock, variant: 'outline' },
  running: {
    icon: Loader2,
    variant: 'secondary',
    className: 'text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:bg-blue-950',
  },
  completed: {
    icon: CheckCircle2,
    variant: 'secondary',
    className: 'text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950',
  },
  failed: { icon: XCircle, variant: 'destructive' },
  cancelled: { icon: Ban, variant: 'outline', className: 'text-muted-foreground' },
}

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  const { t } = useTranslation()
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon
        className={`h-3 w-3 ${status === 'running' ? 'animate-spin' : ''}`}
      />
      {t(`session.status.${status}`)}
    </Badge>
  )
}
