'use client'

import { useState, useCallback } from 'react'
import { useT } from '../context/CopyContext'
import { type FormData, initialFormData, type StepId } from '../lib/types'
import { validateStep } from '../lib/validation'
import { ProgressBar } from './ProgressBar'
import { StepLayout } from './StepLayout'
import { CompanyAutocompleteStep } from './steps/CompanyAutocompleteStep'
import { AmountStep } from './steps/AmountStep'
import { InvoiceNumberStep } from './steps/InvoiceNumberStep'
import { BirthDateStep } from './steps/BirthDateStep'
import { SimpleTextStep } from './steps/SimpleTextStep'
import { ReviewStep } from './steps/ReviewStep'
import { SuccessStep } from './steps/SuccessStep'

type StepConfig = {
  id: StepId
  questionKey: string
  helperTextKey?: string
}

function getSteps(hasNoInvoice: boolean): StepConfig[] {
  const steps: StepConfig[] = [
    { id: 'company', questionKey: 'step1.question', helperTextKey: 'step1.helperText' },
    { id: 'amount', questionKey: 'step2.question', helperTextKey: 'step2.helperText' },
    { id: 'invoice', questionKey: 'step3.question', helperTextKey: 'step3.helperText' },
  ]

  // Only show birthdate step if user has no invoice
  if (hasNoInvoice) {
    steps.push({ id: 'birthdate', questionKey: 'step4.question', helperTextKey: 'step4.helperText' })
  }

  steps.push(
    { id: 'firstName', questionKey: 'step5.question' },
    { id: 'lastName', questionKey: 'step6.question' },
    { id: 'email', questionKey: 'step7.question', helperTextKey: 'step7.helperText' },
    { id: 'phone', questionKey: 'step8.question', helperTextKey: 'step8.helperText' },
    { id: 'review', questionKey: 'review.title' },
  )

  return steps
}

export function PaymentPauseForm() {
  const t = useT()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | undefined>()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const steps = getSteps(formData.hasNoInvoice)
  const step = steps[currentStep]
  const isReviewStep = step?.id === 'review'
  const totalFormSteps = steps.length // includes review

  const updateField = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(undefined) // Clear error when user types
  }, [])

  function handleNext() {
    if (isReviewStep) {
      // Submit
      setIsSubmitted(true)
      return
    }

    const result = validateStep(step.id, formData)
    if (!result.valid) {
      setError(result.error ? t(result.error) : undefined)
      return
    }

    setError(undefined)
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1))
  }

  function handleBack() {
    setError(undefined)
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  function handleGoToStep(stepIndex: number) {
    setError(undefined)
    setCurrentStep(stepIndex)
  }

  function handleReset() {
    setFormData(initialFormData)
    setCurrentStep(0)
    setError(undefined)
    setIsSubmitted(false)
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <SuccessStep onReset={handleReset} />
      </div>
    )
  }

  // Render current step content
  function renderStep() {
    if (!step) return null

    const props = { formData, updateField, error }

    switch (step.id) {
      case 'company':
        return <CompanyAutocompleteStep {...props} />
      case 'amount':
        return <AmountStep {...props} />
      case 'invoice':
        return <InvoiceNumberStep {...props} />
      case 'birthdate':
        return <BirthDateStep {...props} />
      case 'firstName':
        return (
          <SimpleTextStep
            {...props}
            fieldKey="firstName"
            label={t('label.firstName')}
            placeholder={t('step5.placeholder')}
            autoComplete="given-name"
          />
        )
      case 'lastName':
        return (
          <SimpleTextStep
            {...props}
            fieldKey="lastName"
            label={t('label.lastName')}
            placeholder={t('step6.placeholder')}
            autoComplete="family-name"
          />
        )
      case 'email':
        return (
          <SimpleTextStep
            {...props}
            fieldKey="email"
            label={t('label.email')}
            placeholder={t('step7.placeholder')}
            inputType="email"
            autoComplete="email"
            inputMode="email"
          />
        )
      case 'phone':
        return (
          <SimpleTextStep
            {...props}
            fieldKey="phone"
            label={t('label.phone')}
            placeholder={t('step8.placeholder')}
            inputType="tel"
            autoComplete="tel"
            inputMode="tel"
          />
        )
      case 'review':
        return <ReviewStep formData={formData} onGoToStep={handleGoToStep} />
      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-8">
      {/* Progress bar - not shown on review */}
      <ProgressBar
        currentStep={currentStep + 1}
        totalSteps={totalFormSteps}
      />

      {/* Step content */}
      {isReviewStep ? (
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 leading-tight">
              {t('review.title')}
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed">
              {t('review.subtitle')}
            </p>
          </div>

          {renderStep()}

          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-4">
            <button
              type="button"
              onClick={handleBack}
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
              {t('button.back')}
            </button>
            <button
              type="button"
              onClick={handleNext}
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
                min-h-11
              "
            >
              {t('button.submit')}
            </button>
          </div>
        </div>
      ) : (
        <StepLayout
          question={t(step.questionKey)}
          helperText={step.helperTextKey ? t(step.helperTextKey) : undefined}
          onNext={handleNext}
          onBack={currentStep > 0 ? handleBack : undefined}
          nextLabel={t('button.next')}
          backLabel={t('button.back')}
          canProceed={true}
          isLastStep={false}
        >
          {renderStep()}
        </StepLayout>
      )}
    </div>
  )
}
