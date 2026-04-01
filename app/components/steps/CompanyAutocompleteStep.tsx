'use client'

import { useState, useRef, useEffect } from 'react'
import { useT } from '../../context/CopyContext'
import { searchCompanies, type Company } from '../../lib/mockCompanies'
import type { FormData } from '../../lib/types'

type StepProps = {
  formData: FormData
  updateField: (field: keyof FormData, value: string | boolean) => void
  error?: string
}

export function CompanyAutocompleteStep({ formData, updateField, error }: StepProps) {
  const t = useT()
  const [suggestions, setSuggestions] = useState<Company[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  function handleChange(value: string) {
    updateField('company', value)
    const results = searchCompanies(value)
    setSuggestions(results)
    setIsOpen(results.length > 0)
    setActiveIndex(-1)
  }

  function selectCompany(company: Company) {
    updateField('company', company.name)
    setIsOpen(false)
    setSuggestions([])
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          selectCompany(suggestions[activeIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!listRef.current?.contains(e.target as Node) && !inputRef.current?.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const hasError = !!error

  return (
    <div className="relative">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="company" className="text-sm font-medium text-neutral-900">
          {t('label.company')}
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            id="company"
            type="text"
            value={formData.company}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (formData.company && suggestions.length === 0) {
                const results = searchCompanies(formData.company)
                if (results.length > 0) {
                  setSuggestions(results)
                  setIsOpen(true)
                }
              }
            }}
            placeholder={t('step1.placeholder')}
            autoComplete="off"
            autoFocus
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="company-listbox"
            aria-activedescendant={activeIndex >= 0 ? `company-option-${activeIndex}` : undefined}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? 'company-error' : undefined}
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
              min-h-11
              ${hasError ? 'border-error-500' : 'border-neutral-200'}
            `}
          />
          {/* Search icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
        </div>

        {isOpen && suggestions.length > 0 && (
          <ul
            ref={listRef}
            id="company-listbox"
            role="listbox"
            className="
              absolute top-full left-0 right-0 z-20
              mt-1
              bg-white border border-neutral-200 rounded-md shadow-md
              max-h-64 overflow-y-auto
              py-1
            "
          >
            {suggestions.map((company, index) => (
              <li
                key={company.name}
                id={`company-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => selectCompany(company)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`
                  px-4 py-3 cursor-pointer transition-colors duration-100
                  ${index === activeIndex ? 'bg-primary-50 text-primary-700' : 'text-neutral-900 hover:bg-neutral-50'}
                `}
              >
                <div className="text-sm font-medium">{company.name}</div>
                {company.city && (
                  <div className="text-xs text-neutral-500">{company.city}</div>
                )}
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p className="text-xs text-error-500 flex items-center gap-1" id="company-error" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
