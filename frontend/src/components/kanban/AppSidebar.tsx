import { useRef, useState, useCallback, useEffect } from 'react'
import { Globe, LayoutGrid, Moon, Plus, Settings, Sun } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Project } from '@/types/kanban'
import { useProjects } from '@/hooks/use-kanban'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CreateProjectDialog } from '@/components/CreateProjectDialog'
import { useTheme } from '@/hooks/use-theme'

function getProjectInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '??'
  const words = trimmed.split(/\s+/)
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  }
  return trimmed.slice(0, 2).toUpperCase()
}

function ProjectButton({
  project,
  isActive,
  onClick,
}: {
  project: Project
  isActive: boolean
  onClick: () => void
}) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null)

  const showTooltip = () => {
    const rect = btnRef.current?.getBoundingClientRect()
    if (rect) {
      setTooltip({ x: rect.right + 10, y: rect.top + rect.height / 2 })
    }
  }

  return (
    <>
      <div className="relative flex items-center justify-center">
        {isActive ? (
          <span className="absolute left-[-9px] h-5 w-[3px] rounded-r-full bg-primary" />
        ) : null}
        <button
          ref={btnRef}
          type="button"
          onClick={onClick}
          onMouseEnter={showTooltip}
          onMouseLeave={() => setTooltip(null)}
          className={`flex items-center justify-center w-9 h-9 rounded-lg text-[11px] font-bold transition-all cursor-pointer focus:outline-none ${
            isActive
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-foreground/[0.07] text-foreground/60 hover:bg-foreground/[0.13] hover:text-foreground/80'
          }`}
          aria-label={project.name}
        >
          {getProjectInitials(project.name)}
        </button>
      </div>
      {tooltip ? (
        <div
          className="fixed z-[100] whitespace-nowrap rounded-md bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-md border border-border pointer-events-none animate-in fade-in-0 zoom-in-95 duration-100"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateY(-50%)',
          }}
        >
          {project.name}
        </div>
      ) : null}
    </>
  )
}

export function AppSidebar({ activeProjectId }: { activeProjectId: string }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: projects } = useProjects()
  const [showCreate, setShowCreate] = useState(false)

  const isIssuesRoute = location.pathname.includes('/issues')

  const projectPath = useCallback(
    (projectId: string) =>
      isIssuesRoute
        ? `/projects/${projectId}/issues`
        : `/projects/${projectId}`,
    [isIssuesRoute],
  )

  const handleProjectCreated = useCallback(
    (project: Project) => {
      setShowCreate(false)
      navigate(projectPath(project.id))
    },
    [navigate, projectPath],
  )

  return (
    <div className="flex flex-col items-center h-full w-14 py-3 gap-1 bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Home */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground"
        aria-label={t('sidebar.home')}
        title={t('sidebar.home')}
        onClick={() => navigate('/')}
      >
        <LayoutGrid className="h-4.5 w-4.5" />
      </Button>

      <Separator className="mx-2 my-1 w-8" />

      {/* Project list */}
      <div
        className="flex flex-col items-center gap-2 overflow-y-auto flex-1 py-1 px-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {projects?.map((project) => (
          <ProjectButton
            key={project.id}
            project={project}
            isActive={activeProjectId === project.id}
            onClick={() => navigate(projectPath(project.id))}
          />
        ))}
      </div>

      {/* Create project */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowCreate(true)}
        className="h-9 w-9 text-muted-foreground"
        aria-label={t('sidebar.createProject')}
        title={t('sidebar.createProject')}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <CreateProjectDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={handleProjectCreated}
      />

      {/* Bottom section */}
      <div className="mt-auto flex flex-col items-center gap-1">
        <LanguageSelector />
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground"
          aria-label={t('sidebar.settings')}
          title={t('sidebar.settings')}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

const LANGUAGES = [
  { id: 'zh', label: '中文' },
  { id: 'en', label: 'English' },
] as const

function LanguageSelector() {
  const { t, i18n } = useTranslation()
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

  const current = LANGUAGES.find((l) => l.id === i18n.language) ?? LANGUAGES[0]

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground"
        aria-label={t('language.switchLanguage')}
        title={current.label}
        onClick={() => setOpen((v) => !v)}
      >
        <Globe className="h-4 w-4" />
      </Button>
      {open ? (
        <div className="absolute left-full bottom-0 ml-2 z-[100] min-w-[120px] rounded-md border bg-popover py-1 shadow-lg">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => {
                i18n.changeLanguage(lang.id)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors hover:bg-accent ${
                lang.id === i18n.language ? 'bg-accent/50 font-medium' : ''
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ThemeToggle() {
  const { t } = useTranslation()
  const { resolved, toggle } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-muted-foreground"
      aria-label={
        resolved === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')
      }
      title={
        resolved === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')
      }
      onClick={toggle}
    >
      {resolved === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}
