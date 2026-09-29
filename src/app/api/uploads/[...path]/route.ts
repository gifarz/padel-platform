import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { UPLOAD_ROOT, MIME_BY_EXT } from '@/server/uploads'

export const runtime = 'nodejs'

/** Public read-only file server for admin uploads (see src/server/uploads.ts for why not /public). */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params
  const ext = path.extname(segments[segments.length - 1] ?? '').slice(1).toLowerCase()
  const mime = MIME_BY_EXT[ext]
  if (!mime) return new Response('Not found', { status: 404 })

  // Resolve and confirm the result is still inside UPLOAD_ROOT (blocks ../ traversal).
  const file = path.resolve(UPLOAD_ROOT, ...segments)
  if (!file.startsWith(UPLOAD_ROOT + path.sep)) return new Response('Not found', { status: 404 })

  try {
    const data = await readFile(file)
    return new Response(new Uint8Array(data), {
      headers: {
        'Content-Type': mime,
        'X-Content-Type-Options': 'nosniff',
        // Filenames are random and never overwritten, so they're safe to cache forever.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
