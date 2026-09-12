import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const VARIANT_CLASSES: Record<Variant, string> = {
  // Oro + texto oscuro: el mismo par de la marca (botón "GIRAR" de la ruleta).
  primary:
    'font-label bg-gold-500 text-navy-900 hover:bg-gold-400 focus-visible:outline-gold-600',
  secondary:
    'bg-navy-100 text-navy-800 hover:bg-navy-200 focus-visible:outline-navy-400 dark:bg-white/10 dark:text-navy-100 dark:hover:bg-white/15',
  danger: 'bg-crimson-600 text-white hover:bg-crimson-700 focus-visible:outline-crimson-600',
  ghost: 'bg-transparent text-navy-600 hover:bg-navy-100 focus-visible:outline-navy-300 dark:text-navy-300 dark:hover:bg-white/10',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 ${VARIANT_CLASSES[variant]} ${className}`}
    />
  )
}
