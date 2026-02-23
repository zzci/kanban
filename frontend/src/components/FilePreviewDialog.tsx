import { useEffect, useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
} from '@/components/ui/dialog'
import { formatSize } from '@/lib/format'

function formatType(type: string) {
  if (!type) return 'Unknown'
  return type
}

export function FilePreviewDialog({
  file,
  open,
  onOpenChange,
}: {
  file: File | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const isImage = file?.type.startsWith('image/') ?? false

  useEffect(() => {
    if (!file || !isImage) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file, isImage])

  const ext = useMemo(() => {
    if (!file) return ''
    const parts = file.name.split('.')
    return parts.length > 1 ? parts.pop()!.toUpperCase() : ''
  }, [file])

  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={isImage ? 'max-w-2xl' : 'max-w-sm'}
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{file.name}</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>

        {isImage && previewUrl ? (
          <div className="px-5 pb-5">
            <div className="rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
              <img
                src={previewUrl}
                alt={file.name}
                className="max-h-[60vh] max-w-full object-contain"
              />
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span>{formatSize(file.size)}</span>
              <span>{formatType(file.type)}</span>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-5">
            <div className="flex flex-col items-center gap-3 rounded-lg bg-muted/30 py-8">
              {ext ? (
                <div className="relative">
                  <FileText className="h-12 w-12 text-muted-foreground/40" />
                  <span className="absolute bottom-0 right-0 rounded bg-primary px-1 py-0.5 text-[9px] font-bold text-primary-foreground leading-none">
                    {ext}
                  </span>
                </div>
              ) : (
                <FileText className="h-12 w-12 text-muted-foreground/40" />
              )}
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <InfoRow label={t('file.name')} value={file.name} />
              <InfoRow label={t('file.size')} value={formatSize(file.size)} />
              <InfoRow label={t('file.type')} value={formatType(file.type)} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-muted-foreground w-12 shrink-0">{label}</span>
      <span className="text-foreground truncate">{value}</span>
    </div>
  )
}
