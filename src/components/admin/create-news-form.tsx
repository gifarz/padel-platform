'use client'
import { useRef, useState } from 'react'
import { createNewsAction } from '@/server/actions/news'
import { useActionForm } from './use-action-form'
import { ImageUploadField } from './image-upload-field'
import { Markdown } from '@/components/content/markdown'
import { uploadImage } from '@/lib/upload-client'

const CATEGORIES = [
  { value: 'ORGANISASI', label: 'Organisasi' },
  { value: 'TURNAMEN', label: 'Turnamen' },
  { value: 'PRESTASI', label: 'Prestasi' },
  { value: 'KOMUNITAS', label: 'Komunitas' },
  { value: 'PENGUMUMAN', label: 'Pengumuman' },
]

// [label, prefix, suffix, placeholder-if-nothing-selected]
const TOOLBAR: [string, string, string, string][] = [
  ['B', '**', '**', 'tebal'],
  ['I', '*', '*', 'miring'],
  ['H2', '## ', '', 'Judul bagian'],
  ['H3', '### ', '', 'Sub-judul'],
  ['“ ”', '> ', '', 'Kutipan'],
  ['•', '- ', '', 'Item daftar'],
  ['1.', '1. ', '', 'Item daftar'],
  ['🔗', '[', '](https://…)', 'teks tautan'],
]

export function CreateNewsForm() {
  const [coverUrl, setCoverUrl] = useState('')
  const [content, setContent] = useState('')
  const [preview, setPreview] = useState(false)
  const [inserting, setInserting] = useState(false)
  const [insertError, setInsertError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inlineFileRef = useRef<HTMLInputElement>(null)

  const { state, pending, formRef, onSubmit } = useActionForm(createNewsAction, () => {
    setCoverUrl('')
    setContent('')
    setPreview(false)
  })

  function wrapSelection(prefix: string, suffix: string, placeholder: string) {
    const el = textareaRef.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e, value } = el
    const selected = value.slice(s, e) || placeholder
    const next = value.slice(0, s) + prefix + selected + suffix + value.slice(e)
    setContent(next)
    requestAnimationFrame(() => {
      el.focus()
      const from = s + prefix.length
      el.setSelectionRange(from, from + selected.length)
    })
  }

  async function insertImage(file: File | undefined) {
    if (!file) return
    setInserting(true)
    setInsertError(null)
    try {
      const url = await uploadImage(file, 'news')
      const el = textareaRef.current
      const marker = `\n\n![](${url})\n\n`
      if (el) {
        const { selectionStart: s, selectionEnd: e, value } = el
        setContent(value.slice(0, s) + marker + value.slice(e))
      } else {
        setContent((c) => c + marker)
      }
    } catch (err) {
      setInsertError(err instanceof Error ? err.message : 'Gagal mengunggah gambar.')
    } finally {
      setInserting(false)
      if (inlineFileRef.current) inlineFileRef.current.value = ''
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-4 grid gap-3 border border-line bg-surface p-5">
      <input name="title" placeholder="Judul berita" required className="inp" />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="category" defaultValue="PENGUMUMAN" className="inp">
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <ImageUploadField name="coverUrl" label="Gambar sampul" folder="news" value={coverUrl} onChange={setCoverUrl} />

      <textarea name="excerpt" placeholder="Ringkasan singkat (opsional — diisi otomatis dari isi berita jika dikosongkan)" rows={2} className="inp" />

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 border border-b-0 border-line bg-white px-2 py-1.5">
          <div className="flex flex-wrap items-center gap-1">
            {TOOLBAR.map(([label, prefix, suffix, placeholder]) => (
              <button
                key={label}
                type="button"
                onClick={() => wrapSelection(prefix, suffix, placeholder)}
                className="min-w-[2rem] rounded px-2 py-1 text-sm font-bold text-navy hover:bg-surface"
                title={label}
              >
                {label}
              </button>
            ))}
            <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
            <input ref={inlineFileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" id="news-inline-image" onChange={(e) => insertImage(e.target.files?.[0])} />
            <label htmlFor="news-inline-image" className={`cursor-pointer rounded px-2 py-1 text-sm font-bold text-navy hover:bg-surface ${inserting ? 'pointer-events-none opacity-50' : ''}`} title="Sisipkan gambar">
              {inserting ? '…' : '🖼️'}
            </label>
          </div>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="rounded border border-navy px-3 py-1 text-xs font-bold uppercase tracking-widest text-navy hover:bg-navy hover:text-white"
          >
            {preview ? 'Edit' : 'Pratinjau'}
          </button>
        </div>

        {preview ? (
          <div className="min-h-[16rem] border border-line bg-white p-5">
            {content.trim() ? <Markdown>{content}</Markdown> : <p className="text-sm text-muted">Belum ada isi untuk ditampilkan.</p>}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Isi berita — gunakan toolbar di atas untuk format, atau tulis Markdown langsung. Sisipkan gambar dengan tombol 🖼️."
            rows={12}
            required
            className="inp rounded-t-none border-t-0 font-mono text-sm"
          />
        )}
        <p className="mt-1 text-[0.7rem] text-muted">Mendukung format teks (tebal/miring/judul/daftar/kutipan/tautan), gambar, tabel, dan tautan video YouTube (tempel URL di barisnya sendiri).</p>
        {insertError && <p role="alert" className="mt-1 text-xs text-accent">{insertError}</p>}
      </div>

      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
        <input type="checkbox" name="isPublished" className="h-4 w-4 accent-accent" /> Publikasikan sekarang
      </label>
      <button disabled={pending} className="btn-p w-fit">{pending ? 'Menyimpan…' : 'Simpan berita'}</button>
      {state?.error && <p role="alert" className="text-xs text-accent">{state.error}</p>}
      {state?.ok && <p role="status" className="text-xs text-accent">{state.ok}</p>}
    </form>
  )
}
