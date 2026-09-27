'use client'
import { useTransition } from 'react'

export function AdminDeleteButton({
  id,
  action,
  confirmMessage,
}: {
  id: string
  action: (id: string) => Promise<void>
  confirmMessage: string
}) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return
        startTransition(() => { action(id) })
      }}
      className="text-xs font-bold uppercase tracking-widest text-muted hover:text-accent disabled:opacity-50"
    >
      {pending ? 'Menghapus…' : 'Hapus'}
    </button>
  )
}
