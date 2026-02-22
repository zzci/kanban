import { useRef, useState, useEffect, useCallback } from 'react'
import {
  ArrowUp,
  ChevronDown,
  ChevronsRight,
  FileText,
  ImageIcon,
  ListTree,
  MousePointerClick,
  Paperclip,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { FilePreviewDialog } from '@/components/FilePreviewDialog'
import { fileContentHash } from '@/lib/file-hash'

const MODELS = [
  { id: 'opus', label: 'Opus', description: 'Most capable' },
  { id: 'sonnet', label: 'Sonnet', description: 'Best for coding' },
  { id: 'haiku', label: 'Haiku', description: 'Fastest' },
] as const

const PERMISSIONS = [
  {
    id: 'auto',
    label: '自动',
    icon: ChevronsRight,
  },
  {
    id: 'ask',
    label: '询问',
    icon: MousePointerClick,
  },
  {
    id: 'plan',
    label: '计划',
    icon: ListTree,
  },
] as const

const MODES = [
  { id: 'default', label: '默认' },
  { id: 'plan', label: '计划' },
  { id: 'auto', label: '自动' },
] as const

type ModelId = (typeof MODELS)[number]['id']
type PermissionId = (typeof PERMISSIONS)[number]['id']
type ModeId = (typeof MODES)[number]['id']

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [ref, open, onClose])
}

function Dropdown<T extends string>({
  value,
  onChange,
  items,
  renderLabel,
}: {
  value: T
  onChange: (v: T) => void
  items: ReadonlyArray<{ id: T; label: string; description?: string }>
  renderLabel: (v: T) => string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, open, () => setOpen(false))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-sm font-medium hover:bg-accent transition-colors"
      >
        <span>{renderLabel(value)}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open ? (
        <div className="absolute left-0 bottom-full mb-1 z-50 min-w-[140px] rounded-md border bg-popover py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onChange(item.id)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors hover:bg-accent ${
                item.id === value ? 'bg-accent/50' : ''
              }`}
            >
              <div>
                <span className="font-medium">{item.label}</span>
                {item.description ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {item.description}
                  </span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function PermissionDropdown({
  value,
  onChange,
}: {
  value: PermissionId
  onChange: (v: PermissionId) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, open, () => setOpen(false))

  const current = PERMISSIONS.find((p) => p.id === value) ?? PERMISSIONS[0]
  const Icon = current.icon

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center h-7 w-7 rounded-md border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        title="权限"
      >
        <Icon className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute left-0 bottom-full mb-1 z-50 min-w-[140px] rounded-lg border bg-popover shadow-lg">
          <div className="px-3 pt-2 pb-1">
            <span className="text-xs font-semibold text-muted-foreground">
              权限
            </span>
          </div>
          <div className="py-1">
            {PERMISSIONS.map((perm) => {
              const PermIcon = perm.icon
              return (
                <button
                  key={perm.id}
                  type="button"
                  onClick={() => {
                    onChange(perm.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-sm transition-colors hover:bg-accent ${
                    perm.id === value ? 'bg-accent/50' : ''
                  }`}
                >
                  <PermIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium">{perm.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function ChatInput({
  diffOpen,
  onToggleDiff,
}: {
  diffOpen?: boolean
  onToggleDiff?: () => void
}) {
  const [model, setModel] = useState<ModelId>('opus')
  const [permission, setPermission] = useState<PermissionId>('auto')
  const [mode, setMode] = useState<ModeId>('default')
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value)
      const el = e.target
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    },
    [],
  )

  const addFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}|${f.size}`))
      const unique: File[] = []
      for (const f of incoming) {
        const key = `${f.name}|${f.size}`
        if (!seen.has(key)) {
          seen.add(key)
          unique.push(f)
        }
      }
      return unique.length > 0 ? [...prev, ...unique] : prev
    })
  }, [])

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items
      if (!items) return
      const rawFiles: File[] = []
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (file) rawFiles.push(file)
        }
      }
      if (rawFiles.length === 0) return
      e.preventDefault()
      void Promise.all(
        rawFiles.map(async (file) => {
          const hasName = file.name && !file.name.startsWith('image')
          if (hasName) return file
          const hash = await fileContentHash(file)
          const ext = (file.type.split('/')[1] ?? 'bin').replace('+xml', '')
          return new File([file], `paste-${hash}.${ext}`, { type: file.type })
        }),
      ).then(addFiles)
    },
    [addFiles],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newFiles = e.target.files ? Array.from(e.target.files) : []
      if (newFiles.length > 0) {
        addFiles(newFiles)
      }
      e.target.value = ''
    },
    [addFiles],
  )

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  return (
    <div className="shrink-0 px-3 pb-3 pt-1">
      <div className="rounded-xl border bg-card shadow-sm">
        {/* Status bar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40">
          <div className="flex items-center">
            <button
              type="button"
              onClick={onToggleDiff}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs transition-colors ${
                diffOpen
                  ? 'bg-accent ring-1 ring-border'
                  : 'bg-muted/60 hover:bg-muted'
              }`}
            >
              <span>0 个文件已更改</span>
              <span className="text-emerald-500 font-medium">+0</span>
              <span className="text-red-500 font-medium">-0</span>
            </button>
          </div>
          <div className="flex items-center gap-0.5">
            <ToolbarIcon title="Scroll up">
              <ArrowUp className="h-3.5 w-3.5" />
            </ToolbarIcon>
            <ToolbarIcon title="Thinking">
              <Sparkles className="h-3.5 w-3.5" />
            </ToolbarIcon>
            <ToolbarIcon title="Tree view">
              <ListTree className="h-3.5 w-3.5" />
            </ToolbarIcon>
            <TokenUsage />
          </div>
        </div>

        {/* Textarea */}
        <div className="px-3 py-2.5">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onPaste={handlePaste}
            placeholder="Continue working on this task..."
            rows={1}
            className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground/50 min-h-[24px]"
          />
        </div>

        {/* File list */}
        {files.length > 0 ? (
          <div className="px-3 pb-2 flex flex-wrap gap-1.5">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-1.5 rounded-md bg-muted/50 border border-border/40 px-2 py-1 text-xs max-w-[200px] cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setPreviewFile(file)}
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="h-3 w-3 text-blue-400 shrink-0" />
                ) : (
                  <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                )}
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(i)
                  }}
                  className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <FilePreviewDialog
          file={previewFile}
          open={previewFile !== null}
          onOpenChange={(open) => {
            if (!open) setPreviewFile(null)
          }}
        />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-2.5 pb-2 pt-0.5">
          <div className="flex items-center gap-1">
            <ToolbarIcon title="Settings">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </ToolbarIcon>

            <Dropdown
              value={model}
              onChange={setModel}
              items={MODELS}
              renderLabel={(v) => MODELS.find((m) => m.id === v)?.label ?? v}
            />

            <PermissionDropdown value={permission} onChange={setPermission} />

            <Dropdown
              value={mode}
              onChange={setMode}
              items={MODES}
              renderLabel={(v) => MODES.find((m) => m.id === v)?.label ?? v}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="Attach file"
            >
              <Paperclip className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            disabled={!input.trim()}
            className="rounded-lg bg-foreground px-3.5 py-1 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-30"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}

function ToolbarIcon({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      title={title}
    >
      {children}
    </button>
  )
}

function TokenUsage() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const used = 37
  const total = 200
  const pct = Math.round((used / total) * 100)
  const r = 7
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct / 100)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <circle
            cx="9"
            cy="9"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="2.5"
          />
          <circle
            cx="9"
            cy="9"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 9 9)"
          />
        </svg>
      </button>
      {open ? (
        <div className="absolute right-0 bottom-full mb-1.5 z-50 whitespace-nowrap rounded-lg border bg-popover px-3 py-2 shadow-lg text-xs text-popover-foreground">
          上下文: {pct}% · {used}K / {total}K tokens
        </div>
      ) : null}
    </div>
  )
}
