import { type ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  dark?: boolean
}

export const Card = ({ children, className, dark = false }: CardProps) => (
  <article
    className={clsx(
      'group relative overflow-hidden border p-6 transition-all duration-300 ease-smooth',
      dark
        ? 'border-white/20 bg-white/5 text-white hover:-translate-y-1 hover:border-white/35'
        : 'border-ink/15 bg-white text-ink hover:-translate-y-1 hover:border-ink/35 hover:shadow-panel',
      className,
    )}
  >
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    {children}
  </article>
)
