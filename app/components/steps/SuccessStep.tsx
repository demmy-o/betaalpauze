'use client'

import { useT } from '../../context/CopyContext'

type SuccessStepProps = {
  onReset: () => void
}

export function SuccessStep({ onReset }: SuccessStepProps) {
  const t = useT()

  return (
    <div className="flex flex-col items-center text-center gap-6 py-8">
      {/* Success checkmark */}
      <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success-500">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
          {t('success.title')}
        </h1>
        <p className="text-base text-neutral-500 max-w-sm leading-relaxed">
          {t('success.message')}
        </p>
      </div>

      <div className="w-full max-w-sm bg-primary-50 border border-primary-100 rounded-lg p-5 text-left space-y-2">
        <h3 className="text-sm font-semibold text-primary-900">
          {t('success.whatNext')}
        </h3>
        <p className="text-sm text-primary-700 leading-relaxed">
          {t('success.whatNextDescription')}
        </p>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="
          inline-flex items-center justify-center
          px-5 py-3
          bg-transparent text-primary-500
          text-sm font-semibold
          rounded-md
          transition-all duration-150
          hover:bg-primary-50
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2
          min-h-11
        "
      >
        {t('button.newRequest')}
      </button>
    </div>
  )
}
