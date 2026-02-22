import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  Database,
  Monitor,
  MoonStar,
  RefreshCw,
  Router,
  Sun,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type HealthResponse = {
  status: string
  db: 'ok' | 'error'
  timestamp: string
}

type Theme = 'dark' | 'light'
type ThemeMode = Theme | 'system'

const THEME_KEY = 'ui-theme-mode'

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'system'
  }
  const saved = window.localStorage.getItem(THEME_KEY)
  if (saved === 'dark' || saved === 'light' || saved === 'system') {
    return saved
  }
  return 'system'
}

function resolveTheme(mode: ThemeMode): Theme {
  return mode === 'system' ? getSystemTheme() : mode
}

function applyTheme(mode: ThemeMode) {
  const resolvedTheme = resolveTheme(mode)
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  window.localStorage.setItem(THEME_KEY, mode)
}

async function fetchApiHealth(): Promise<HealthResponse> {
  const response = await fetch('/api/health')
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }
  return response.json()
}

export default function HomePage() {
  const [polling, setPolling] = useState(true)
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)

  const healthQuery = useQuery({
    queryKey: ['api-health'],
    queryFn: fetchApiHealth,
    refetchInterval: polling ? 5000 : false,
  })

  const updatedAt = useMemo(() => {
    if (!healthQuery.data?.timestamp) {
      return '--'
    }
    return new Date(healthQuery.data.timestamp).toLocaleString()
  }, [healthQuery.data?.timestamp])

  const statusBadge = useMemo(() => {
    if (healthQuery.isPending) {
      return <Badge variant="secondary">Loading</Badge>
    }
    if (healthQuery.isError) {
      return <Badge variant="destructive">Error</Badge>
    }
    return (
      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
        Healthy
      </Badge>
    )
  }, [healthQuery.isError, healthQuery.isPending])

  useEffect(() => {
    applyTheme(themeMode)

    if (themeMode !== 'system') {
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyTheme('system')
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [themeMode])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-primary/15 p-2 text-primary">
              <Router className="h-5 w-5" />
            </span>
            <h1 className="text-3xl font-semibold tracking-tight">
              React Router + TanStack Query Demo
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={themeMode === 'light' ? 'default' : 'secondary'}
              onClick={() => setThemeMode('light')}
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              type="button"
              variant={themeMode === 'dark' ? 'default' : 'secondary'}
              onClick={() => setThemeMode('dark')}
            >
              <MoonStar className="h-4 w-4" />
              Dark
            </Button>
            <Button
              type="button"
              variant={themeMode === 'system' ? 'default' : 'secondary'}
              onClick={() => setThemeMode('system')}
            >
              <Monitor className="h-4 w-4" />
              System
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card/70">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  <CardTitle>API Health</CardTitle>
                </div>
                {statusBadge}
              </div>
              <CardDescription>
                Live endpoint check through TanStack Query.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">Endpoint:</span>{' '}
                <code className="rounded bg-muted px-2 py-1">/api/health</code>
              </p>
              <p>
                <span className="text-muted-foreground">Updated:</span>{' '}
                {updatedAt}
              </p>
              {healthQuery.isError && (
                <p className="text-destructive">{healthQuery.error.message}</p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => healthQuery.refetch()}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/70">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-cyan-500" />
                <CardTitle>Query Controls</CardTitle>
              </div>
              <CardDescription>
                Toggle background polling and inspect cache in devtools.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <label className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span>Auto refresh (5s)</span>
                <input
                  type="checkbox"
                  checked={polling}
                  onChange={(e) => setPolling(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
              </label>

              <p className="text-muted-foreground">
                Open React Query Devtools in the bottom-right corner during
                development.
              </p>

              <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                {`queryKey: ['api-health']
refetchInterval: ${polling ? '5000' : 'false'}
source: fetch('/api/health')
themeMode: ${themeMode}
resolvedTheme: ${resolveTheme(themeMode)}`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
