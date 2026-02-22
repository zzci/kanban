import { Circle, Pencil } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/lib/mock-chat'

function renderMarkdown(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      elements.push(
        <div key={`code-${i}`} className="my-2">
          {lang ? (
            <div className="text-[10px] text-muted-foreground/60 px-3 pt-1.5 bg-zinc-900/80 rounded-t-md border border-b-0 border-border/50">
              {lang}
            </div>
          ) : null}
          <pre
            className={`text-xs bg-zinc-900/80 text-zinc-300 px-3 py-2 overflow-x-auto border border-border/50 ${
              lang ? 'rounded-b-md' : 'rounded-md'
            }`}
          >
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>,
      )
      continue
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={`br-${i}`} className="h-2" />)
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <div
          key={`bq-${i}`}
          className="border-l-2 border-muted-foreground/30 pl-3 text-sm text-muted-foreground italic my-1"
        >
          {line.slice(2)}
        </div>,
      )
      i++
      continue
    }

    // Unordered list
    if (line.match(/^[-*] /)) {
      elements.push(
        <div key={`li-${i}`} className="flex gap-2 text-sm my-0.5 ml-1">
          <span className="text-muted-foreground shrink-0 mt-1.5 h-1 w-1 rounded-full bg-muted-foreground inline-block" />
          <span>{renderInline(line.slice(2))}</span>
        </div>,
      )
      i++
      continue
    }

    // Ordered list
    const olMatch = line.match(/^(\d+)\.\s+/)
    if (olMatch) {
      elements.push(
        <div key={`ol-${i}`} className="flex gap-2 text-sm my-0.5 ml-1">
          <span className="text-muted-foreground shrink-0 w-4 text-right">
            {olMatch[1]}.
          </span>
          <span>{renderInline(line.slice(olMatch[0].length))}</span>
        </div>,
      )
      i++
      continue
    }

    // Regular text
    elements.push(
      <p key={`p-${i}`} className="text-sm my-0.5">
        {renderInline(line)}
      </p>,
    )
    i++
  }

  return elements
}

function renderInline(text: string): React.ReactNode {
  // Bold + inline code
  const parts: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*)|(`(.+?)`)/g
  let lastIdx = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index))
    }
    if (match[2]) {
      parts.push(
        <strong key={match.index} className="font-semibold">
          {match[2]}
        </strong>,
      )
    } else if (match[4]) {
      parts.push(
        <code
          key={match.index}
          className="text-xs bg-muted px-1 py-0.5 rounded"
        >
          {match[4]}
        </code>,
      )
    }
    lastIdx = match.index + match[0].length
  }
  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx))
  }
  return parts.length === 1 ? parts[0] : parts
}

function SystemMessage({ message }: { message: ChatMessageType }) {
  return (
    <div className="flex items-center gap-2 px-4 py-0.5">
      <Circle className="h-1.5 w-1.5 fill-muted-foreground/50 text-muted-foreground/50 shrink-0" />
      <span className="text-xs text-muted-foreground/70 font-mono">
        {message.content}
      </span>
    </div>
  )
}

function UserMessage({ message }: { message: ChatMessageType }) {
  return (
    <div className="px-4 py-3">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">You</span>
          <button
            type="button"
            className="p-0.5 rounded text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            aria-label="Edit message"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </div>
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  )
}

function AssistantMessage({ message }: { message: ChatMessageType }) {
  return (
    <div className="px-4 py-3">
      <div className="space-y-0.5">{renderMarkdown(message.content)}</div>
    </div>
  )
}

export function ChatMessageItem({ message }: { message: ChatMessageType }) {
  switch (message.role) {
    case 'system':
      return <SystemMessage message={message} />
    case 'user':
      return <UserMessage message={message} />
    case 'assistant':
      return <AssistantMessage message={message} />
  }
}
