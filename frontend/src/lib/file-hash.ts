export async function fileContentHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hash = await crypto.subtle.digest('SHA-256', buffer)
  const bytes = new Uint8Array(hash)
  return Array.from(bytes.slice(0, 8))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
