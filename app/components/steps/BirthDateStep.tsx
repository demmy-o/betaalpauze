'use client'

import { useT } from '../../context/CopyContext'
import type { FormData } from '../../lib/types'

type StepProps = {
  formData: FormData
  updateField: (field: keyof FormData, value: string | boolean) => void
  error?: string
}

export function BirthDateStep({ formData, updateField, error }: StepProps) {
  const t = useT()
  const hasError = !!error

  // Max date is today (can't be born in the future)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="birthDate" className="text-sm font-medium text-neutral-900">
        {t('label.birthDate')}
      </label>
      <input
        id="birthDate"
        type="date"
        value={formData.birthDate}
        onChange={(e) => updateField('birthDate', e.target.value)}
        max={today}
        autoFocus
        autoComplete="bday"
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? 'birthdate-error' : undefined}
        className={`
          w-full px-4 py-3
          bg-white text-neutral-900
          text-base
          border rounded-md
          shadow-xs
          transition-all duration-150
          hover:border-neutral-400
          focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-300/30
          min-h-11
          ${hasError ? 'border-error-500' : 'border-neutral-200'}
        `}
      />
      {error && (
        <p className="text-xs text-error-500 flex items-center gap-1" id="birthdate-error" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          {error}
        </p>
      )}
    </div>
  )
}
