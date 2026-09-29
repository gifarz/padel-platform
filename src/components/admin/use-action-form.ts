'use client'
import { useActionState, useEffect, useRef, useTransition, type FormEvent } from 'react'
import type { FormState } from '@/server/form-state'

/**
 * Wrapper around useActionState for admin forms.
 *
 * Passing a server action straight to <form action> makes React 19 reset every
 * uncontrolled field after each submit — including when the action returned an
 * error, so a typo threw away everything the admin had typed. Here we submit
 * through onSubmit instead and only reset the form (and call onSuccess) when
 * the action actually reports success.
 */
export function useActionForm(
  action: (prev: FormState, formData: FormData) => Promise<FormState>,
  onSuccess?: (state: NonNullable<FormState>) => void,
) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined)
  const [, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset()
      onSuccessRef.current?.(state)
    }
  }, [state])

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(() => formAction(fd))
  }

  return { state, pending, formRef, onSubmit }
}
