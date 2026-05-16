'use client'

import { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode, useState } from 'react'
import { motion } from 'framer-motion'

interface FormFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  icon?: ReactNode
}

interface InputFieldProps extends FormFieldProps, InputHTMLAttributes<HTMLInputElement> {}
interface TextAreaProps extends FormFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function InputField({ label, error, hint, required = false, icon, className = '', ...props }: InputFieldProps) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="space-y-2 w-full">
      <label className="block text-sm font-semibold text-slate-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full px-4 py-2.5 border rounded-lg text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none ${icon ? 'pl-10' : ''} ${error ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500/30 focus:border-red-500' : 'border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400'} ${className}`}
          style={{ borderColor: focused ? (error ? '#fca5a5' : '#a5b4fc') : error ? '#fecaca' : '#e2e8f0' }}
          {...props}
        />
      </div>
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600 font-medium">
          {error}
        </motion.p>
      )}
      {hint && !error && <p className="text-sm text-slate-500">{hint}</p>}
    </div>
  )
}

export function TextArea({ label, error, hint, required = false, icon: _icon, className = '', ...props }: TextAreaProps) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="space-y-2 w-full">
      <label className="block text-sm font-semibold text-slate-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full px-4 py-2.5 border rounded-lg text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none resize-vertical ${error ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500/30 focus:border-red-500' : 'border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400'} ${className}`}
        style={{ borderColor: focused ? (error ? '#fca5a5' : '#a5b4fc') : error ? '#fecaca' : '#e2e8f0' }}
        {...props}
      />
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600 font-medium">
          {error}
        </motion.p>
      )}
      {hint && !error && <p className="text-sm text-slate-500">{hint}</p>}
    </div>
  )
}
