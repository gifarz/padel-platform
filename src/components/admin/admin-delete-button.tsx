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
        startTransition(async () => {
          try {
            await action(id)
          } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Gagal menghapus.')
          }
        })
      }}
      className="text-xs font-bold uppercase tracking-widest text-muted hover:text-accent disabled:opacity-50"
    >
      {pending ? 'Menghapus…' : 'Hapus'}
    </button>
  )
}
