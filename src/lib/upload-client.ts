import type { UploadFolder } from '@/lib/uploads'

const MAX_EDGE = 1600
const SKIP_COMPRESS_BELOW = 900 * 1024 // stay under nginx's default 1 MB client_max_body_size

/**
 * Downscale big photos in the browser before uploading: phone photos are often
 * 4–8 MB, which is slow on mobile data and can be rejected by a reverse proxy.
 * GIFs are left alone (re-encoding would drop the animation).
 */
async function shrink(file: File): Promise<File> {
  if (file.type === 'image/gif' || file.size <= SKIP_COMPRESS_BELOW) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close()
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.85))
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' })
  } catch {
    return file
  }
}

/** Uploads one image via /api/upload and returns its public URL. Throws Error(message) on failure. */
export async function uploadImage(file: File, folder: UploadFolder): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar.')
  const body = new FormData()
  body.set('file', await shrink(file))
  body.set('folder', folder)

  let res: Response
  try {
    res = await fetch('/api/upload', { method: 'POST', body })
  } catch {
    throw new Error('Gagal terhubung ke server.')
  }
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
  if (!res.ok || !data.url) {
    throw new Error(res.status === 413 ? 'Gambar terlalu besar untuk server.' : data.error || 'Gagal mengunggah gambar.')
  }
  return data.url
}
