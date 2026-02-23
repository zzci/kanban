export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getProjectInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '??'
  const words = trimmed.split(/\s+/)
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  }
  return trimmed.slice(0, 2).toUpperCase()
}
