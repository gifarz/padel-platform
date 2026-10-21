import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { saveImage, UploadError } from '@/server/uploads'
import { UPLOAD_FOLDERS, MAX_UPLOAD_BYTES, type UploadFolder } from '@/lib/uploads'

export const runtime = 'nodejs'

/** Admin-only image upload. multipart/form-data: `file` (image) + `folder` (news | clubs | organization). */
export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Hanya admin yang boleh mengunggah.' }, { status: 401 })
  }

  // Refuse oversized bodies up front instead of buffering them into memory first.
  const declared = Number(req.headers.get('content-length') ?? 0)
  if (declared > MAX_UPLOAD_BYTES + 512 * 1024) {
    return NextResponse.json({ error: 'Ukuran gambar maksimal 5 MB.' }, { status: 413 })
  }

  try {
    const form = await req.formData()
    const file = form.get('file')
    const folder = String(form.get('folder') ?? '')
    if (!(file instanceof File)) return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 400 })
    if (!(UPLOAD_FOLDERS as readonly string[]).includes(folder)) return NextResponse.json({ error: 'Folder tidak valid.' }, { status: 400 })

    const url = await saveImage(file, folder as UploadFolder)
    return NextResponse.json({ url })
  } catch (err) {
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 })
    console.error('[upload]', err)
    return NextResponse.json({ error: 'Gagal mengunggah gambar.' }, { status: 500 })
  }
}
