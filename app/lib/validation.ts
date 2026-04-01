import type { FormData } from "./types"

export type ValidationResult = {
  valid: boolean
  error?: string
}

export function validateCompany(value: string): ValidationResult {
  if (!value.trim()) return { valid: false, error: "error.required" }
  return { valid: true }
}

export function validateAmount(value: string): ValidationResult {
  if (!value.trim()) return { valid: false, error: "error.required" }
  // Parse Dutch number format (comma as decimal separator)
  const normalized = value.replace(/\./g, "").replace(",", ".")
  const num = parseFloat(normalized)
  if (isNaN(num) || num <= 0) return { valid: false, error: "error.invalidAmount" }
  return { valid: true }
}

export function validateInvoice(value: string, hasNoInvoice: boolean): ValidationResult {
  if (hasNoInvoice) return { valid: true }
  if (!value.trim()) return { valid: false, error: "error.required" }
  return { valid: true }
}

export function validateBirthDate(value: string, hasNoInvoice: boolean): ValidationResult {
  if (!hasNoInvoice) return { valid: true } // Not required if invoice was provided
  if (!value.trim()) return { valid: false, error: "error.invoiceOrBirthdate" }
  const date = new Date(value)
  if (isNaN(date.getTime())) return { valid: false, error: "error.invalidDate" }
  if (date > new Date()) return { valid: false, error: "error.invalidDate" }
  return { valid: true }
}

export function validateRequired(value: string): ValidationResult {
  if (!value.trim()) return { valid: false, error: "error.required" }
  return { valid: true }
}

export function validateEmail(value: string): ValidationResult {
  if (!value.trim()) return { valid: false, error: "error.required" }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) return { valid: false, error: "error.invalidEmail" }
  return { valid: true }
}

export function validatePhone(_value: string): ValidationResult {
  // Phone is optional
  return { valid: true }
}

export function validateStep(stepId: string, formData: FormData): ValidationResult {
  switch (stepId) {
    case "company": return validateCompany(formData.company)
    case "amount": return validateAmount(formData.amount)
    case "invoice": return validateInvoice(formData.invoiceNumber, formData.hasNoInvoice)
    case "birthdate": return validateBirthDate(formData.birthDate, formData.hasNoInvoice)
    case "firstName": return validateRequired(formData.firstName)
    case "lastName": return validateRequired(formData.lastName)
    case "email": return validateEmail(formData.email)
    case "phone": return validatePhone(formData.phone)
    default: return { valid: true }
  }
}

export function formatCurrency(value: string): string {
  const normalized = value.replace(/\./g, "").replace(",", ".")
  const num = parseFloat(normalized)
  if (isNaN(num)) return value
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(num)
}

export function formatDate(value: string): string {
  if (!value) return ""
  const date = new Date(value)
  if (isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}
