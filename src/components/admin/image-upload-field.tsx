'use client'
import { useRef, useState } from 'react'
import { uploadImage } from '@/lib/upload-client'
import type { UploadFolder } from '@/lib/uploads'

/**
 * Controlled image field: pick a file (uploaded immediately) or paste an https
 * URL. Renders a hidden <input name={name}> so it posts like any other field.
 */
export function ImageUploadField({
  name,
  label,
  folder,
  value,
  onChange,
  shape = 'cover',
}: {
  name: string
  label: string
  folder: UploadFolder
  value: string
  onChange: (url: string) => void
  shape?: 'cover' | 'logo'
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUrl, setShowUrl] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      onChange(await uploadImage(file, folder))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengunggah gambar.')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const previewBox = shape === 'logo' ? 'h-20 w-20 rounded-full' : 'h-24 w-40 rounded'

  return (
    <div className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-widest text-muted">{label}</span>
      <input type="hidden" name={name} value={value} />

      <div className="flex flex-wrap items-center gap-4">
        <div className={`flex shrink-0 items-center justify-center overflow-hidden border border-line bg-white ${previewBox}`}>
          {value ? (
            // Plain <img>: admin preview only, and works for any https host.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="px-2 text-center text-[0.65rem] uppercase tracking-widest text-muted">Belum ada</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            id={`${name}-file`}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <label
            htmlFor={`${name}-file`}
            className={`inline-flex h-10 cursor-pointer items-center rounded border border-navy px-4 text-xs font-bold uppercase tracking-widest text-navy transition hover:bg-navy hover:text-white ${busy ? 'pointer-events-none opacity-50' : ''}`}
          >
            {busy ? 'Mengunggah…' : value ? 'Ganti gambar' : 'Pilih gambar'}
          </label>
          {value && (
            <button type="button" onClick={() => onChange('')} className="text-xs font-bold uppercase tracking-widest text-muted hover:text-accent">
              Hapus
            </button>
          )}
          <button type="button" onClick={() => setShowUrl((s) => !s)} className="text-xs text-muted underline underline-offset-2 hover:text-navy">
            {showUrl ? 'Sembunyikan URL' : 'atau tempel URL'}
          </button>
        </div>
      </div>

      {showUrl && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          inputMode="url"
          className="inp"
          aria-label={`${label} (URL)`}
        />
      )}
      <p className="text-[0.7rem] text-muted">JPG, PNG, WebP, atau GIF · maks. 5 MB</p>
      {error && <p role="alert" className="text-xs text-accent">{error}</p>}
    </div>
  )
}
