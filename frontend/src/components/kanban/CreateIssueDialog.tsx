import { useRef, useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  Bot,
  ChevronDown,
  ChevronsRight,
  FileText,
  ImageIcon,
  ListTree,
  MousePointerClick,
  Plus,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Priority, Status } from '@/types/kanban'
import { useCreateIssue, useStatuses } from '@/hooks/use-kanban'
import { usePanelStore } from '@/stores/panel-store'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { FilePreviewDialog } from '@/components/FilePreviewDialog'
import { fileContentHash } from '@/lib/file-hash'
import { PriorityIcon } from './PriorityIcon'
import { tStatus, tPriority } from '@/lib/i18n-utils'

// ── Data ──────────────────────────────────────────────

const MODELS = [
  { id: 'opus', label: 'Opus' },
  { id: 'sonnet', label: 'Sonnet' },
  { id: 'haiku', label: 'Haiku' },
] as const
type ModelId = (typeof MODELS)[number]['id']

const PERMISSIONS = [
  { id: 'auto', icon: ChevronsRight },
  { id: 'ask', icon: MousePointerClick },
  { id: 'plan', icon: ListTree },
] as const
type PermissionId = (typeof PERMISSIONS)[number]['id']

const AGENTS = [
  { id: 'default' },
  { id: 'coder' },
  { id: 'planner' },
  { id: 'reviewer' },
  { id: 'researcher' },
] as const
type AgentId = (typeof AGENTS)[number]['id']

const PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low']

// ── Shared hook ───────────────────────────────────────

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

// ── Shared primitives ─────────────────────────────────

function DropdownPanel({
  children,
  className,
  heading,
}: {
  children: React.ReactNode
  className?: string
  heading?: string
}) {
  return (
    <div
      className={`absolute left-0 top-full mt-1 z-[60] rounded-lg border bg-popover shadow-lg ${className ?? ''}`}
    >
      {heading ? (
        <div className="px-3 pt-2 pb-1">
          <span className="text-xs font-semibold text-muted-foreground">
            {heading}
          </span>
        </div>
      ) : null}
      <div className="py-1">{children}</div>
    </div>
  )
}

function DropdownItem({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors hover:bg-accent ${
        active ? 'bg-accent/50' : ''
      }`}
    >
      {children}
    </button>
  )
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
    return <ImageIcon className="h-3.5 w-3.5 text-blue-400 shrink-0" />
  }
  return <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Shared form body ─────────────────────────────────

export function CreateIssueForm({
  projectId,
  initialStatusId,
  autoFocus,
  onCreated,
  onCancel,
}: {
  projectId: string
  initialStatusId?: string
  autoFocus?: boolean
  onCreated?: () => void
  onCancel?: () => void
}) {
  const { t } = useTranslation()
  const { data: statuses } = useStatuses(projectId)
  const createIssue = useCreateIssue(projectId)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const firstStatusId = statuses?.[0]?.id ?? ''
  const [input, setInput] = useState('')
  const [statusId, setStatusId] = useState(initialStatusId ?? firstStatusId)
  const [priority, setPriority] = useState<Priority>('medium')
  const [model, setModel] = useState<ModelId>('sonnet')
  const [permission, setPermission] = useState<PermissionId>('auto')
  const [agent, setAgent] = useState<AgentId>('default')
  const [files, setFiles] = useState<File[]>([])
  const [previewFile, setPreviewFile] = useState<File | null>(null)

  useEffect(() => {
    setStatusId(initialStatusId ?? firstStatusId)
  }, [initialStatusId, firstStatusId])

  useEffect(() => {
    if (autoFocus) {
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  }, [autoFocus])

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || !statusId) return
    createIssue.mutate(
      { title: trimmed, statusId, priority },
      {
        onSuccess: () => {
          setInput('')
          setPriority('medium')
          setModel('sonnet')
          setPermission('auto')
          setAgent('default')
          setFiles([])
          onCreated?.()
        },
      },
    )
  }, [input, statusId, priority, createIssue, onCreated])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleTextarea = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value)
      const el = e.target
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`
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

  return (
    <div onKeyDown={handleKeyDown}>
      {/* ─── Input area ─────────────────────────── */}
      <div className="px-5">
        <div className="rounded-lg border bg-muted/30 focus-within:ring-1 focus-within:ring-ring transition-shadow">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextarea}
            onPaste={handlePaste}
            placeholder={t('issue.describeWork')}
            rows={4}
            className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground/50 px-3 pt-3 pb-2 min-h-[100px]"
            disabled={createIssue.isPending}
          />
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-[11px] text-muted-foreground/50">
              {t('issue.cmdEnterSubmit')}
            </span>
            <span className="text-[11px] text-muted-foreground/50 tabular-nums">
              {input.length} / 2000
            </span>
          </div>
        </div>
      </div>

      {/* ─── Properties (selectors) ─────────────── */}
      <div className="px-5 pt-3.5">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          {t('issue.properties')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <PropertyRow label={t('issue.status')}>
            <StatusSelect
              statuses={statuses ?? []}
              value={statusId}
              onChange={setStatusId}
            />
          </PropertyRow>
          <PropertyRow label={t('issue.priority')}>
            <PrioritySelect value={priority} onChange={setPriority} />
          </PropertyRow>
          <PropertyRow label={t('createIssue.model')}>
            <ModelSelect value={model} onChange={setModel} />
          </PropertyRow>
          <PropertyRow label={t('createIssue.agent')}>
            <AgentSelect value={agent} onChange={setAgent} />
          </PropertyRow>
        </div>
      </div>

      {/* ─── File upload area ───────────────────── */}
      <div className="px-5 pt-3.5">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          {t('createIssue.attachments')}
        </p>
        <div
          className="rounded-lg border border-dashed bg-muted/20 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {files.length === 0 ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground/60">
              <Plus className="h-4 w-4" />
              <span className="text-xs">{t('createIssue.uploadFiles')}</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {files.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-2 rounded-md bg-background border px-2.5 py-1.5 cursor-pointer hover:bg-accent/40 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreviewFile(file)
                  }}
                >
                  {fileIcon(file.name)}
                  <span className="text-xs truncate flex-1">{file.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatSize(file.size)}
                  </span>
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
              <div className="flex items-center justify-center gap-1.5 pt-1 text-muted-foreground/50">
                <Plus className="h-3 w-3" />
                <span className="text-[11px]">{t('createIssue.addMore')}</span>
              </div>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* ─── Footer ─────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-4">
        <div className="flex items-center gap-1.5">
          <PermissionButton value={permission} onChange={setPermission} />
        </div>
        <div className="flex items-center gap-2">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
            >
              {t('common.cancel')}
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createIssue.isPending || !input.trim()}
            className="rounded-lg bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-30"
          >
            {createIssue.isPending
              ? t('createIssue.creating')
              : t('createIssue.create')}
          </button>
        </div>
      </div>

      <FilePreviewDialog
        file={previewFile}
        open={previewFile !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null)
        }}
      />
    </div>
  )
}

// ── Dialog wrapper ───────────────────────────────────

export function CreateIssueDialog() {
  const { t } = useTranslation()
  const { projectId = 'default' } = useParams<{ projectId: string }>()
  const { createDialogOpen, createDialogStatusId, closeCreateDialog } =
    usePanelStore()

  return (
    <Dialog
      open={createDialogOpen}
      onOpenChange={(open) => {
        if (!open) closeCreateDialog()
      }}
    >
      <DialogContent
        className="flex flex-col gap-0 p-0 max-w-[580px] rounded-xl overflow-visible top-[36%]"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">{t('issue.createTask')}</DialogTitle>

        {/* ─── Header ─────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h2 className="text-sm font-semibold text-foreground">
            {t('issue.createTask')}
          </h2>
          <button
            type="button"
            onClick={closeCreateDialog}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <CreateIssueForm
          projectId={projectId}
          initialStatusId={createDialogStatusId}
          autoFocus={createDialogOpen}
          onCreated={closeCreateDialog}
          onCancel={closeCreateDialog}
        />
      </DialogContent>
    </Dialog>
  )
}

// ── Property row ──────────────────────────────────────

function PropertyRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
      <span className="text-xs text-muted-foreground w-10 shrink-0">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

// ── Select components (inline in property rows) ──────

function StatusSelect({
  statuses,
  value,
  onChange,
}: {
  statuses: Status[]
  value: string
  onChange: (id: string) => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, open, () => setOpen(false))
  const current = statuses.find((s) => s.id === value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm hover:text-foreground transition-colors w-full"
      >
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: current?.color }}
        />
        <span className="truncate">
          {current ? tStatus(t, current.name) : t('issue.selectStatus')}
        </span>
        <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
      </button>
      {open ? (
        <DropdownPanel className="min-w-[160px]">
          {statuses.map((s) => (
            <DropdownItem
              key={s.id}
              active={s.id === value}
              onClick={() => {
                onChange(s.id)
                setOpen(false)
              }}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span>{tStatus(t, s.name)}</span>
            </DropdownItem>
          ))}
        </DropdownPanel>
      ) : null}
    </div>
  )
}

function PrioritySelect({
  value,
  onChange,
}: {
  value: Priority
  onChange: (p: Priority) => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, open, () => setOpen(false))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm hover:text-foreground transition-colors w-full"
      >
        <PriorityIcon priority={value} />
        <span className="capitalize truncate">{tPriority(t, value)}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
      </button>
      {open ? (
        <DropdownPanel className="w-36">
          {PRIORITIES.map((p) => (
            <DropdownItem
              key={p}
              active={p === value}
              onClick={() => {
                onChange(p)
                setOpen(false)
              }}
            >
              <PriorityIcon priority={p} />
              <span className="capitalize">{tPriority(t, p)}</span>
            </DropdownItem>
          ))}
        </DropdownPanel>
      ) : null}
    </div>
  )
}

function AgentSelect({
  value,
  onChange,
}: {
  value: AgentId
  onChange: (v: AgentId) => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, open, () => setOpen(false))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm hover:text-foreground transition-colors w-full"
      >
        <Bot className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="truncate">{t(`createIssue.agentLabel.${value}`)}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
      </button>
      {open ? (
        <DropdownPanel
          className="min-w-[180px]"
          heading={t('createIssue.agent')}
        >
          {AGENTS.map((a) => (
            <DropdownItem
              key={a.id}
              active={a.id === value}
              onClick={() => {
                onChange(a.id)
                setOpen(false)
              }}
            >
              <span className="font-medium">
                {t(`createIssue.agentLabel.${a.id}`)}
              </span>
              <span className="text-xs text-muted-foreground">
                {t(`createIssue.agentDesc.${a.id}`)}
              </span>
            </DropdownItem>
          ))}
        </DropdownPanel>
      ) : null}
    </div>
  )
}

function ModelSelect({
  value,
  onChange,
}: {
  value: ModelId
  onChange: (v: ModelId) => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, open, () => setOpen(false))
  const current = MODELS.find((m) => m.id === value) ?? MODELS[0]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm hover:text-foreground transition-colors w-full"
      >
        <span className="truncate">{current.label}</span>
        <span className="text-[10px] text-muted-foreground truncate">
          {t(`createIssue.modelDesc.${current.id}`)}
        </span>
        <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
      </button>
      {open ? (
        <DropdownPanel className="min-w-[180px]">
          {MODELS.map((m) => (
            <DropdownItem
              key={m.id}
              active={m.id === value}
              onClick={() => {
                onChange(m.id)
                setOpen(false)
              }}
            >
              <span className="font-medium">{m.label}</span>
              <span className="text-xs text-muted-foreground">
                {t(`createIssue.modelDesc.${m.id}`)}
              </span>
            </DropdownItem>
          ))}
        </DropdownPanel>
      ) : null}
    </div>
  )
}

// ── Permission button (footer) ────────────────────────

function PermissionButton({
  value,
  onChange,
}: {
  value: PermissionId
  onChange: (v: PermissionId) => void
}) {
  const { t } = useTranslation()
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
        className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        title={t('createIssue.permissionMode')}
      >
        <Icon className="h-3.5 w-3.5" />
        <span>{t(`createIssue.perm.${current.id}`)}</span>
      </button>
      {open ? (
        <DropdownPanel
          className="min-w-[140px]"
          heading={t('createIssue.permission')}
        >
          {PERMISSIONS.map((perm) => {
            const PermIcon = perm.icon
            return (
              <DropdownItem
                key={perm.id}
                active={perm.id === value}
                onClick={() => {
                  onChange(perm.id)
                  setOpen(false)
                }}
              >
                <PermIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium">
                  {t(`createIssue.perm.${perm.id}`)}
                </span>
              </DropdownItem>
            )
          })}
        </DropdownPanel>
      ) : null}
    </div>
  )
}
