import { useRef, useState, useEffect, useCallback } from 'react'
import { FileText, ImageIcon, Paperclip, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FilePreviewDialog } from '@/components/FilePreviewDialog'
import { fileContentHash } from '@/lib/file-hash'

export function ChatInput({
  diffOpen,
  onToggleDiff,
  scrollRef,
}: {
  diffOpen?: boolean
  onToggleDiff?: () => void
  scrollRef?: React.RefObject<HTMLDivElement | null>
}) {
  const { t } = useTranslation()
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
      const items = e.clipboardData.items
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
    <div className="shrink-0 w-full min-w-0 px-3 pb-3 pt-1">
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Status bar */}
        <div className="flex items-center px-3 py-1.5 border-b border-border/40">
          <button
            type="button"
            onClick={onToggleDiff}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs transition-colors ${
              diffOpen
                ? 'bg-accent ring-1 ring-border'
                : 'bg-muted/60 hover:bg-muted'
            }`}
          >
            <span>{t('chat.filesChanged', { count: 0 })}</span>
            <span className="text-emerald-500 font-medium">+0</span>
            <span className="text-red-500 font-medium">-0</span>
          </button>
        </div>

        {/* Textarea */}
        <div className="px-3 py-2.5">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onPaste={handlePaste}
            onFocus={() => {
              // Scroll chat to bottom when keyboard opens on mobile
              setTimeout(() => {
                scrollRef?.current?.scrollTo({
                  top: scrollRef.current.scrollHeight,
                  behavior: 'smooth',
                })
              }, 100)
            }}
            placeholder={t('chat.placeholder')}
            rows={1}
            className="w-full bg-transparent text-base md:text-sm resize-none outline-none placeholder:text-muted-foreground/50 min-h-[24px]"
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
            <TokenUsage />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title={t('chat.attachFile')}
            >
              <Paperclip className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            disabled={!input.trim()}
            className="rounded-lg bg-foreground px-3.5 py-1 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-30"
          >
            {t('chat.send')}
          </button>
        </div>
      </div>
    </div>
  )
}

function TokenUsage() {
  const { t } = useTranslation()
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
          {t('chat.context', { pct, used, total })}
        </div>
      ) : null}
    </div>
  )
}
