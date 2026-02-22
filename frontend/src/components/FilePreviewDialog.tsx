import { useEffect, useMemo, useState } from 'react'
import { FileText, ImageIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
} from '@/components/ui/dialog'

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

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
              <InfoRow label="Name" value={file.name} />
              <InfoRow label="Size" value={formatSize(file.size)} />
              <InfoRow label="Type" value={formatType(file.type)} />
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
