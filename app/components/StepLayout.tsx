'use client'

import type { ReactNode } from 'react'

type StepLayoutProps = {
  question: string
  helperText?: string
  children: ReactNode
  onNext: () => void
  onBack?: () => void
  nextLabel: string
  backLabel: string
  canProceed: boolean
  isLastStep?: boolean
}

export function StepLayout({
  question,
  helperText,
  children,
  onNext,
  onBack,
  nextLabel,
  backLabel,
  canProceed,
  isLastStep,
}: StepLayoutProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 leading-tight">
          {question}
        </h1>
        {helperText && (
          <p className="text-sm text-neutral-500 leading-relaxed">{helperText}</p>
        )}
      </div>

      <div className="min-h-[120px]">{children}</div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 mt-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="
              inline-flex items-center justify-center
              w-full sm:w-auto
              px-5 py-3
              bg-transparent text-neutral-600
              text-sm font-semibold
              rounded-md
              transition-all duration-150
              hover:bg-neutral-100
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2
              min-h-11
            "
          >
            {backLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="
            inline-flex items-center justify-center gap-2
            w-full sm:w-auto sm:ml-auto
            px-6 py-3
            bg-primary-500 text-white
            text-sm font-semibold
            rounded-md
            shadow-xs
            transition-all duration-150
            hover:bg-primary-600
            active:bg-primary-700
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2
            disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed
            min-h-11
          "
        >
          {isLastStep ? nextLabel : (
            <>
              {nextLabel}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m9 18 6-6-6-6"/></svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
