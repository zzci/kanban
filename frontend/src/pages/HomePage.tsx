import { useNavigate } from 'react-router-dom'
import {
  Globe,
  Plus,
  Hash,
  Layers,
  Menu,
  Moon,
  Sun,
  MoreVertical,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useProjects } from '@/hooks/use-kanban'
import { useProjectStats } from '@/hooks/use-project-stats'
import type { Project } from '@/types/kanban'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CreateProjectDialog } from '@/components/CreateProjectDialog'
import { ProjectSettingsDialog } from '@/components/ProjectSettingsDialog'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useTheme } from '@/hooks/use-theme'
import { useIsMobile } from '@/hooks/use-mobile'

const LANGUAGES = [
  { id: 'zh', label: '中文' },
  { id: 'en', label: 'English' },
] as const

function getProjectInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '??'
  const words = trimmed.split(/\s+/)
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  }
  return trimmed.slice(0, 2).toUpperCase()
}

function ProjectCard({
  project,
  onClick,
}: {
  project: Project
  onClick: () => void
}) {
  const { t } = useTranslation()
  const stats = useProjectStats(project.id)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <Card
        className="bg-card/70 hover:bg-card cursor-pointer transition-all hover:shadow-md hover:border-primary/20 group"
        onClick={onClick}
      >
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold bg-muted text-muted-foreground">
              {getProjectInitials(project.name)}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base group-hover:text-primary transition-colors truncate">
                {project.name}
              </CardTitle>
              {project.description && (
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowSettings(true)
              }}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.07] transition-colors"
              aria-label={t('project.settings')}
              title={t('project.settings')}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {t('project.issueCount', { count: stats.issueCount })}
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {t('project.statusCount', { count: stats.statusCount })}
            </span>
          </div>
        </CardContent>
      </Card>
      <ProjectSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        project={project}
      />
    </>
  )
}

/* ── Mobile menu sheet (right-side) ─────────────────── */

function MobileHomeMenu({ onCreateProject }: { onCreateProject: () => void }) {
  const { t, i18n } = useTranslation()
  const { resolved, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const [langExpanded, setLangExpanded] = useState(false)
  const currentLang =
    LANGUAGES.find((l) => l.id === i18n.language) ?? LANGUAGES[0]

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground md:hidden"
        aria-label={t('sidebar.menu')}
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-72 p-0"
          aria-describedby={undefined}
        >
          <SheetTitle className="sr-only">{t('sidebar.menu')}</SheetTitle>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <img src="/favicon.svg" alt="Kanban" className="h-8 w-8" />
              <span className="text-sm font-semibold">{t('sidebar.menu')}</span>
            </div>

            {/* Actions */}
            <div className="flex-1">
              {/* New project */}
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onCreateProject()
                }}
                className="flex items-center gap-3 w-full px-4 min-h-[48px] text-sm text-foreground/80 hover:bg-accent/50 active:bg-accent transition-colors"
              >
                <Plus className="h-4.5 w-4.5 text-muted-foreground" />
                {t('project.newProject')}
              </button>

              <Separator />

              {/* Language */}
              <button
                type="button"
                onClick={() => setLangExpanded((v) => !v)}
                className="flex items-center gap-3 w-full px-4 min-h-[48px] text-sm text-foreground/80 hover:bg-accent/50 active:bg-accent transition-colors"
              >
                <Globe className="h-4.5 w-4.5 text-muted-foreground" />
                <span>{t('language.switchLanguage')}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {currentLang.label}
                </span>
              </button>
              {langExpanded ? (
                <div className="bg-accent/20 px-4">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => {
                        i18n.changeLanguage(lang.id)
                        setLangExpanded(false)
                      }}
                      className={`flex items-center gap-3 w-full pl-8 min-h-[44px] text-sm transition-colors hover:bg-accent/50 active:bg-accent ${
                        lang.id === i18n.language
                          ? 'text-primary font-medium'
                          : 'text-foreground/70'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {/* Theme */}
              <button
                type="button"
                onClick={toggle}
                className="flex items-center gap-3 w-full px-4 min-h-[48px] text-sm text-foreground/80 hover:bg-accent/50 active:bg-accent transition-colors"
              >
                {resolved === 'dark' ? (
                  <Sun className="h-4.5 w-4.5 text-muted-foreground" />
                ) : (
                  <Moon className="h-4.5 w-4.5 text-muted-foreground" />
                )}
                {resolved === 'dark'
                  ? t('theme.switchToLight')
                  : t('theme.switchToDark')}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

/* ── Desktop header controls (inline) ───────────────── */

function DesktopHeaderControls({
  onCreateProject,
}: {
  onCreateProject: () => void
}) {
  const { t, i18n } = useTranslation()
  const { resolved, toggle } = useTheme()
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!langOpen) return
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [langOpen])

  const currentLang =
    LANGUAGES.find((l) => l.id === i18n.language) ?? LANGUAGES[0]

  return (
    <div className="ml-auto flex items-center gap-2">
      <div ref={langRef} className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-muted-foreground"
          onClick={() => setLangOpen((v) => !v)}
          aria-label={t('language.switchLanguage')}
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs">{currentLang.label}</span>
        </Button>
        {langOpen ? (
          <div className="absolute right-0 top-full mt-1 z-[100] min-w-[120px] rounded-md border bg-popover py-1 shadow-lg">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => {
                  i18n.changeLanguage(lang.id)
                  setLangOpen(false)
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
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        onClick={toggle}
        aria-label={
          resolved === 'dark'
            ? t('theme.switchToLight')
            : t('theme.switchToDark')
        }
      >
        {resolved === 'dark' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
      <Button variant="outline" size="sm" onClick={onCreateProject}>
        <Plus className="h-4 w-4" />
        {t('project.newProject')}
      </Button>
    </div>
  )
}

/* ── Main page ──────────────────────────────────────── */

export default function HomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: projects, isLoading } = useProjects()
  const [showCreate, setShowCreate] = useState(false)
  const isMobile = useIsMobile()

  const handleProjectCreated = useCallback(
    (project: Project) => {
      navigate(`/projects/${project.id}`)
    },
    [navigate],
  )

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-12">
        {/* Header row — always horizontal */}
        <div className="mb-6 flex items-center gap-3 md:mb-8">
          <img src="/favicon.svg" alt="Kanban" className="h-9 w-9" />
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            {t('project.projects')}
          </h1>
          {projects ? (
            <Badge variant="secondary" className="ml-1">
              {projects.length}
            </Badge>
          ) : null}

          {/* Mobile: right-side menu sheet */}
          {isMobile ? (
            <div className="ml-auto">
              <MobileHomeMenu onCreateProject={() => setShowCreate(true)} />
            </div>
          ) : (
            <DesktopHeaderControls
              onCreateProject={() => setShowCreate(true)}
            />
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-card/30 animate-pulse min-h-[140px]">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 rounded bg-muted" />
                      <div className="h-4 w-12 rounded bg-muted" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 w-32 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => navigate(`/projects/${project.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      <CreateProjectDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={handleProjectCreated}
      />
    </main>
  )
}
