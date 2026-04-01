'use client'

import type { ReactNode } from 'react'

type FormFieldProps = {
  id: string
  label: string
  helperText?: string
  error?: string
  children: ReactNode
}

export function FormField({ id, label, helperText, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-900">
        {label}
      </label>
      {helperText && (
        <p className="text-xs text-neutral-500" id={`${id}-hint`}>
          {helperText}
        </p>
      )}
      {children}
      {error && (
        <p className="text-xs text-error-500 flex items-center gap-1" id={`${id}-error`} role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          {error}
        </p>
      )}
    </div>
  )
}
