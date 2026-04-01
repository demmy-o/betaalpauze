'use client'

import { useT } from '../../context/CopyContext'
import type { FormData } from '../../lib/types'
import { formatCurrency, formatDate } from '../../lib/validation'

type ReviewStepProps = {
  formData: FormData
  onGoToStep: (step: number) => void
}

export function ReviewStep({ formData, onGoToStep }: ReviewStepProps) {
  const t = useT()

  const formattedAmount = formatCurrency(formData.amount)
  const formattedDate = formatDate(formData.birthDate)

  return (
    <div className="flex flex-col gap-8">
      {/* Organisation */}
      <ReviewSection title={t('review.sectionOrganisation')} onEdit={() => onGoToStep(0)}>
        <ReviewRow label={t('label.company')} value={formData.company} />
      </ReviewSection>

      {/* Amount */}
      <ReviewSection title={t('review.sectionAmount')} onEdit={() => onGoToStep(1)}>
        <ReviewRow label={t('label.amount')} value={formattedAmount} />
      </ReviewSection>

      {/* Invoice or birth date */}
      <ReviewSection title={t('review.sectionInvoice')} onEdit={() => onGoToStep(2)}>
        {formData.hasNoInvoice ? (
          <ReviewRow label={t('label.birthDate')} value={formattedDate} />
        ) : (
          <ReviewRow label={t('label.invoice')} value={formData.invoiceNumber} />
        )}
      </ReviewSection>

      {/* Personal details */}
      <ReviewSection title={t('review.sectionPersonal')} onEdit={() => onGoToStep(formData.hasNoInvoice ? 4 : 3)}>
        <ReviewRow label={t('label.firstName')} value={formData.firstName} />
        <ReviewRow label={t('label.lastName')} value={formData.lastName} />
        <ReviewRow label={t('label.email')} value={formData.email} />
        {formData.phone && (
          <ReviewRow label={t('label.phone')} value={formData.phone} />
        )}
      </ReviewSection>

      {/* Email preview */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-neutral-900">{t('review.emailPreviewTitle')}</h3>
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs text-neutral-500 pb-3 border-b border-neutral-200">
            <span className="font-medium">{t('email.subject')}</span>
          </div>
          <div className="text-sm text-neutral-800 space-y-3 leading-relaxed">
            <p>{t('email.greeting')} {formData.company},</p>
            <p>{t('email.body')}</p>
            <p className="font-medium">{t('email.detailsHeader')}</p>
            <ul className="space-y-1 text-sm">
              <li>- {t('email.labelName')}: {formData.firstName} {formData.lastName}</li>
              <li>- {t('email.labelEmail')}: {formData.email}</li>
              {formData.phone && <li>- {t('email.labelPhone')}: {formData.phone}</li>}
              <li>- {t('email.labelAmount')}: {formattedAmount}</li>
              {formData.hasNoInvoice ? (
                <li>- {t('email.labelBirthDate')}: {formattedDate}</li>
              ) : (
                <li>- {t('email.labelInvoice')}: {formData.invoiceNumber}</li>
              )}
            </ul>
            <p>{t('email.closing')}</p>
            <p>{t('email.signoff')}<br />{formData.firstName} {formData.lastName}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  const t = useT()
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-medium text-primary-500 hover:text-primary-600 hover:underline transition-colors"
        >
          {t('button.edit')}
        </button>
      </div>
      <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-4 space-y-2">
        {children}
      </div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="text-sm font-medium text-neutral-900">{value}</span>
    </div>
  )
}
