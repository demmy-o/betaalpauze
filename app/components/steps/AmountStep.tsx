'use client'

import { useT } from '../../context/CopyContext'
import type { FormData } from '../../lib/types'

type StepProps = {
  formData: FormData
  updateField: (field: keyof FormData, value: string | boolean) => void
  error?: string
}

export function AmountStep({ formData, updateField, error }: StepProps) {
  const t = useT()
  const hasError = !!error

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="amount" className="text-sm font-medium text-neutral-900">
        {t('label.amount')}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-lg pointer-events-none font-medium">
          €
        </span>
        <input
          id="amount"
          type="text"
          inputMode="decimal"
          value={formData.amount}
          onChange={(e) => updateField('amount', e.target.value)}
          placeholder={t('step2.placeholder')}
          autoFocus
          autoComplete="off"
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? 'amount-error' : undefined}
          className={`
            w-full pl-10 pr-4 py-3
            bg-white text-neutral-900
            text-lg
            border rounded-md
            shadow-xs
            transition-all duration-150
            placeholder:text-neutral-400
            hover:border-neutral-400
            focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-300/30
            min-h-11
            ${hasError ? 'border-error-500' : 'border-neutral-200'}
          `}
        />
      </div>
      {error && (
        <p className="text-xs text-error-500 flex items-center gap-1" id="amount-error" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          {error}
        </p>
      )}
    </div>
  )
}
