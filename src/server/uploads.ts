import 'server-only'
import { randomBytes } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { MAX_UPLOAD_BYTES, UPLOAD_URL_PREFIX, type UploadFolder } from '@/lib/uploads'

/**
 * Uploads are kept OUTSIDE /public on purpose: `next start` only serves the
 * files that existed in /public at boot, so anything written there at runtime
 * would 404. Point UPLOAD_DIR at a persistent directory on the VPS (it must
 * survive redeploys) — defaults to ./uploads next to the app.
 */
export const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'))

const EXT_BY_MIME = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' } as const
export const MIME_BY_EXT: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' }

/** Trust the bytes, not the client-supplied MIME type / filename. */
function sniffImage(buf: Buffer): keyof typeof EXT_BY_MIME | null {
  if (buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buf.subarray(0, 4).toString('ascii') === 'GIF8') return 'image/gif'
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp'
  return null
}

export class UploadError extends Error {}

export async function saveImage(file: File, folder: UploadFolder): Promise<string> {
  if (file.size === 0) throw new UploadError('File kosong.')
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError('Ukuran gambar maksimal 5 MB.')

  const buf = Buffer.from(await file.arrayBuffer())
  const mime = sniffImage(buf)
  if (!mime) throw new UploadError('Format tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.')

  const name = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.${EXT_BY_MIME[mime]}`
  const dir = path.join(UPLOAD_ROOT, folder)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, name), buf)
  return `${UPLOAD_URL_PREFIX}${folder}/${name}`
}
