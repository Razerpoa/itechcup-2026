import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-[#964825]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-4 text-gray-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-[#F5F5F5] rounded-2xl border-0 focus:ring-2 focus:ring-[#FF9B71] px-4 py-3 outline-none text-gray-900 placeholder:text-gray-400 transition-shadow',
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              error && 'focus:ring-red-500 ring-2 ring-red-500',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-[#964825]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-[#F5F5F5] rounded-2xl border-0 focus:ring-2 focus:ring-[#FF9B71] px-4 py-3 outline-none text-gray-900 placeholder:text-gray-400 transition-shadow min-h-[100px] resize-y',
            error && 'focus:ring-red-500 ring-2 ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
