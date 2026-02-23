import { useCallback, useEffect, useRef, useState } from 'react'
import type { NormalizedLogEntry, SessionStatus } from '@/types/kanban'

interface UseSessionStreamOptions {
  projectId: string
  sessionId: string | null
  enabled?: boolean
}

interface UseSessionStreamReturn {
  logs: NormalizedLogEntry[]
  status: SessionStatus | null
  isConnected: boolean
  error: string | null
  clearLogs: () => void
}

const MAX_RECONNECT_DELAY = 30_000
const BASE_RECONNECT_DELAY = 1_000

export function useSessionStream({
  projectId,
  sessionId,
  enabled = true,
}: UseSessionStreamOptions): UseSessionStreamReturn {
  const [logs, setLogs] = useState<NormalizedLogEntry[]>([])
  const [status, setStatus] = useState<SessionStatus | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectDelayRef = useRef(BASE_RECONNECT_DELAY)

  const clearLogs = useCallback(() => {
    setLogs([])
    setStatus(null)
    setError(null)
  }, [])

  useEffect(() => {
    if (!sessionId || !enabled) {
      return
    }

    const TERMINAL: Set<string> = new Set(['completed', 'failed', 'cancelled'])

    function connect() {
      const url = `/api/projects/${projectId}/sessions/${sessionId}/stream`
      const es = new EventSource(url)
      eventSourceRef.current = es

      es.onopen = () => {
        setIsConnected(true)
        setError(null)
        reconnectDelayRef.current = BASE_RECONNECT_DELAY
      }

      es.addEventListener('log', (e) => {
        try {
          const entry = JSON.parse(e.data) as NormalizedLogEntry
          setLogs((prev) => [...prev, entry])
        } catch {
          /* ignore parse errors */
        }
      })

      es.addEventListener('state', (e) => {
        try {
          const data = JSON.parse(e.data) as { state: SessionStatus }
          setStatus(data.state)
        } catch {
          /* ignore */
        }
      })

      es.addEventListener('done', (e) => {
        try {
          const data = JSON.parse(e.data) as { finalStatus: SessionStatus }
          setStatus(data.finalStatus)
        } catch {
          /* ignore */
        }
        es.close()
        setIsConnected(false)
      })

      es.onerror = () => {
        es.close()
        setIsConnected(false)

        // Only reconnect if session might still be active
        if (status && TERMINAL.has(status)) {
          return
        }

        const delay = reconnectDelayRef.current
        reconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_DELAY)
        setError(
          `Connection lost, reconnecting in ${Math.round(delay / 1000)}s...`,
        )
        reconnectTimerRef.current = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      eventSourceRef.current?.close()
      eventSourceRef.current = null
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      setIsConnected(false)
    }
  }, [projectId, sessionId, enabled])

  return { logs, status, isConnected, error, clearLogs }
}
