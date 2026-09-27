'use client'
import { useTransition } from 'react'

/**
 * A checkbox-styled toggle that calls a server action immediately on change.
 * Used for isVerified/isPublished/isActive flags across the admin CRUD pages.
 */
export function AdminToggle({
  id,
  checked,
  action,
  label,
}: {
  id: string
  checked: boolean
  action: (id: string, next: boolean) => Promise<void>
  label: string
}) {
  const [pending, startTransition] = useTransition()
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-widest ${pending ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={(e) => {
          const next = e.currentTarget.checked
          startTransition(() => { action(id, next) })
        }}
        className="h-4 w-4 accent-accent"
      />
      {label}
    </label>
  )
}
