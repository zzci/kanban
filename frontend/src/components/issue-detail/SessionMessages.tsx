import { useEffect } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { NormalizedLogEntry, SessionStatus } from '@/types/kanban'
import { SessionStatusBadge } from './SessionStatusBadge'
import { LogEntry } from './LogEntry'

export function SessionMessages({
  logs,
  status,
  isConnected,
  error,
  scrollRef,
}: {
  logs: NormalizedLogEntry[]
  status: SessionStatus | null
  isConnected: boolean
  error: string | null
  scrollRef?: React.RefObject<HTMLDivElement | null>
}) {
  const { t } = useTranslation()

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    scrollRef?.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [logs.length, scrollRef])

  if (!status && logs.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-1 py-2">
      {/* Status header */}
      {status ? (
        <div className="flex items-center gap-2 px-4 py-1.5">
          <SessionStatusBadge status={status} />
          {isConnected ? (
            <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400">
              <Wifi className="h-3 w-3" />
              {t('session.connected')}
            </span>
          ) : error ? (
            <span className="flex items-center gap-1 text-[10px] text-destructive">
              <WifiOff className="h-3 w-3" />
              {error}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Log entries */}
      {logs.map((entry, i) => (
        <LogEntry key={i} entry={entry} />
      ))}
    </div>
  )
}
