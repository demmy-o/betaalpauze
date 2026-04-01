export type FormData = {
  company: string
  amount: string
  invoiceNumber: string
  hasNoInvoice: boolean
  birthDate: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export const initialFormData: FormData = {
  company: "",
  amount: "",
  invoiceNumber: "",
  hasNoInvoice: false,
  birthDate: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
}

export type StepId =
  | "company"
  | "amount"
  | "invoice"
  | "birthdate"
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "review"
  | "success"
