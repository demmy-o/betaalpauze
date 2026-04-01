'use client'

import { forwardRef } from 'react'

type TextInputProps = {
  id: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hasError?: boolean
  autoFocus?: boolean
  autoComplete?: string
  inputMode?: 'text' | 'numeric' | 'email' | 'tel' | 'decimal'
  prefix?: string
  onKeyDown?: (e: React.KeyboardEvent) => void
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { id, type = "text", value, onChange, placeholder, hasError, autoFocus, autoComplete, inputMode, prefix, onKeyDown },
  ref
) {
  const baseClasses = `
    w-full px-4 py-3
    bg-white text-neutral-900
    text-base
    border rounded-md
    shadow-xs
    transition-all duration-150
    placeholder:text-neutral-400
    hover:border-neutral-400
    focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-300/30
    disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
    min-h-11
  `
  const errorClasses = hasError
    ? "border-error-500 focus:border-error-500 focus:ring-error-500/30"
    : "border-neutral-200"

  if (prefix) {
    return (
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-base pointer-events-none">
          {prefix}
        </span>
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          inputMode={inputMode}
          onKeyDown={onKeyDown}
          aria-invalid={hasError || undefined}
          aria-describedby={[
            document.getElementById(`${id}-hint`) ? `${id}-hint` : null,
            hasError ? `${id}-error` : null,
          ].filter(Boolean).join(" ") || undefined}
          className={`${baseClasses} ${errorClasses} pl-8`}
        />
      </div>
    )
  }

  return (
    <input
      ref={ref}
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      autoComplete={autoComplete}
      inputMode={inputMode}
      onKeyDown={onKeyDown}
      aria-invalid={hasError || undefined}
      aria-describedby={[
        `${id}-hint`,
        hasError ? `${id}-error` : null,
      ].filter(Boolean).join(" ") || undefined}
      className={`${baseClasses} ${errorClasses}`}
    />
  )
})
