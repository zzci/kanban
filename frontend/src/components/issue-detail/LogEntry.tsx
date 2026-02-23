import {
  AlertCircle,
  Bot,
  Brain,
  FileEdit,
  FileText,
  Globe,
  Info,
  Loader2,
  Search,
  Terminal,
  User,
  Wrench,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { NormalizedLogEntry, ToolAction } from '@/types/kanban'

function getToolIcon(action?: ToolAction) {
  if (!action) return { Icon: Wrench, color: 'text-muted-foreground' }
  switch (action.kind) {
    case 'file-read':
      return { Icon: FileText, color: 'text-blue-500' }
    case 'file-edit':
      return { Icon: FileEdit, color: 'text-amber-500' }
    case 'command-run':
      return { Icon: Terminal, color: 'text-green-500' }
    case 'search':
      return { Icon: Search, color: 'text-purple-500' }
    case 'web-fetch':
      return { Icon: Globe, color: 'text-cyan-500' }
    default:
      return { Icon: Wrench, color: 'text-muted-foreground' }
  }
}

function getToolLabel(action: ToolAction | undefined, t: (key: string) => string) {
  if (!action) return ''
  switch (action.kind) {
    case 'file-read':
      return `${t('session.tool.fileRead')}: ${action.path}`
    case 'file-edit':
      return `${t('session.tool.fileEdit')}: ${action.path}`
    case 'command-run':
      return `${t('session.tool.commandRun')}: ${action.command}`
    case 'search':
      return `${t('session.tool.search')}: ${action.query}`
    case 'web-fetch':
      return `${t('session.tool.webFetch')}: ${action.url}`
    case 'tool':
      return action.toolName
    case 'other':
      return action.description
  }
}

export function LogEntry({ entry }: { entry: NormalizedLogEntry }) {
  const { t } = useTranslation()

  switch (entry.entryType) {
    case 'user-message':
      return (
        <div className="flex gap-2.5 px-4 py-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/10">
            <User className="h-3.5 w-3.5 text-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm whitespace-pre-wrap break-words">
              {entry.content}
            </p>
          </div>
        </div>
      )

    case 'assistant-message':
      return (
        <div className="flex gap-2.5 px-4 py-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
            <Bot className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm whitespace-pre-wrap break-words">
              {entry.content}
            </p>
          </div>
        </div>
      )

    case 'tool-use': {
      const { Icon, color } = getToolIcon(entry.toolAction)
      const label = getToolLabel(entry.toolAction, t)
      return (
        <div className="flex items-center gap-2 px-4 py-1 text-xs text-muted-foreground">
          <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
          <span className="truncate font-mono">{label || entry.content}</span>
        </div>
      )
    }

    case 'system-message':
      return (
        <div className="flex items-center gap-2 px-4 py-1 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>{entry.content}</span>
        </div>
      )

    case 'error-message':
      return (
        <div className="flex gap-2.5 mx-4 my-1 rounded-md bg-destructive/10 px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
          <p className="text-sm text-destructive break-words">
            {entry.content}
          </p>
        </div>
      )

    case 'thinking':
      return (
        <div className="flex items-center gap-2 px-4 py-1 text-xs text-muted-foreground italic">
          <Brain className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{entry.content}</span>
        </div>
      )

    case 'loading':
      return (
        <div className="flex items-center gap-2 px-4 py-1 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
          <span>{entry.content}</span>
        </div>
      )

    case 'token-usage':
      return null

    default:
      return null
  }
}
