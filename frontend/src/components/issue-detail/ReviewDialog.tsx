import { useRef, useState, useEffect, useCallback } from 'react'
import { X, ChevronDown, Container, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const AGENTS = [
  { id: 'claude_code', label: 'CLAUDE_CODE' },
  { id: 'custom', label: 'CUSTOM_AGENT' },
] as const

const CONFIGS = [
  { id: 'default', label: 'DEFAULT' },
  { id: 'strict', label: 'STRICT' },
  { id: 'lenient', label: 'LENIENT' },
] as const

type AgentId = (typeof AGENTS)[number]['id']
type ConfigId = (typeof CONFIGS)[number]['id']

function SelectDropdown<T extends string>({
  value,
  onChange,
  items,
  icon: Icon,
}: {
  value: T
  onChange: (v: T) => void
  items: ReadonlyArray<{ id: T; label: string }>
  icon: React.ComponentType<{ className?: string }>
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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

  const current = items.find((i) => i.id === value) ?? items[0]

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent/50 transition-colors"
      >
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="font-medium">{current.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
      </button>
      {open ? (
        <div className="absolute left-0 top-full mt-1 z-50 w-full rounded-md border bg-popover py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onChange(item.id)
                setOpen(false)
              }}
              className={`flex w-full items-center px-3 py-1.5 text-sm transition-colors hover:bg-accent ${
                item.id === value ? 'bg-accent/50' : ''
              }`}
            >
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function ReviewDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const [instructions, setInstructions] = useState('')
  const [includeGit, setIncludeGit] = useState(true)
  const [newSession, setNewSession] = useState(false)
  const [agent, setAgent] = useState<AgentId>('claude_code')
  const [config, setConfig] = useState<ConfigId>('default')
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        onClose()
      }
    },
    [onClose],
  )

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="w-full max-w-[560px] rounded-xl border bg-background shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-2">
          <div>
            <h2 className="text-lg font-semibold">{t('review.startReview')}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('review.reviewDescription')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors -mt-1 -mr-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-5">
          {/* Instructions textarea */}
          <div>
            <label className="text-sm font-medium">{t('review.additionalNotes')}</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={t('review.instructionsPlaceholder')}
              rows={4}
              className="mt-2 w-full rounded-md border bg-background px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Git context checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="pt-0.5">
              <div
                className={`flex items-center justify-center h-5 w-5 rounded border-2 transition-colors ${
                  includeGit
                    ? 'bg-foreground border-foreground'
                    : 'border-muted-foreground/40'
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  setIncludeGit(!includeGit)
                }}
              >
                {includeGit ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="text-background"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium">{t('review.includeGitContext')}</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('review.includeGitDescription')}
              </p>
            </div>
          </label>

          {/* Agent & Config selectors */}
          <div className="flex gap-3">
            <SelectDropdown
              value={agent}
              onChange={setAgent}
              items={AGENTS}
              icon={Container}
            />
            <SelectDropdown
              value={config}
              onChange={setConfig}
              items={CONFIGS}
              icon={SlidersHorizontal}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-4 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            {t('common.cancel')}
          </button>

          <div className="flex items-center gap-4">
            {/* New session toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                type="button"
                onClick={() => setNewSession(!newSession)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  newSession ? 'bg-foreground' : 'bg-muted-foreground/30'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-background transition-transform ${
                    newSession ? 'translate-x-[18px]' : 'translate-x-[3px]'
                  }`}
                />
              </button>
              <span className="text-sm">{t('review.newSession')}</span>
            </label>

            <button
              type="button"
              className="rounded-md border-2 border-foreground bg-background px-4 py-1.5 text-sm font-semibold hover:bg-accent transition-colors"
            >
              {t('review.startReview')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
