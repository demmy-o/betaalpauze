'use client'

import { useT } from '../../context/CopyContext'
import type { FormData } from '../../lib/types'

type StepProps = {
  formData: FormData
  updateField: (field: keyof FormData, value: string | boolean) => void
  error?: string
}

export function InvoiceNumberStep({ formData, updateField, error }: StepProps) {
  const t = useT()
  const hasError = !!error && !formData.hasNoInvoice

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="invoiceNumber" className="text-sm font-medium text-neutral-900">
          {t('label.invoice')}
        </label>
        <input
          id="invoiceNumber"
          type="text"
          value={formData.invoiceNumber}
          onChange={(e) => updateField('invoiceNumber', e.target.value)}
          placeholder={t('step3.placeholder')}
          disabled={formData.hasNoInvoice}
          autoFocus
          autoComplete="off"
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? 'invoice-error' : 'invoice-hint'}
          className={`
            w-full px-4 py-3
            bg-white text-neutral-900
            text-base
            border rounded-md
            shadow-xs
            transition-all duration-150
            placeholder:text-neutral-400
            hover:border-neutral-400
            focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-300/30
            disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed disabled:hover:border-neutral-200
            min-h-11
            ${hasError ? 'border-error-500' : 'border-neutral-200'}
          `}
        />
        {hasError && (
          <p className="text-xs text-error-500 flex items-center gap-1" id="invoice-error" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            {error}
          </p>
        )}
      </div>

      <label className="flex items-center gap-3 cursor-pointer py-2">
        <input
          type="checkbox"
          checked={formData.hasNoInvoice}
          onChange={(e) => {
            updateField('hasNoInvoice', e.target.checked)
            if (e.target.checked) {
              updateField('invoiceNumber', '')
            }
          }}
          className="
            w-5 h-5
            border-2 border-neutral-300 rounded
            text-primary-500
            focus:ring-2 focus:ring-primary-300/30
            transition-all duration-150
            cursor-pointer
            accent-primary-500
          "
        />
        <span className="text-sm text-neutral-700">{t('step3.noInvoice')}</span>
      </label>
    </div>
  )
}
