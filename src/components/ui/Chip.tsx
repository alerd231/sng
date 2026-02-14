import { type ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export const Chip = ({ active = false, className, children, ...props }: ChipProps) => (
  <button
    type="button"
    className={clsx(
      'inline-flex h-10 items-center border px-4 text-[0.64rem] uppercase tracking-[0.2em] transition duration-300 ease-smooth',
      active
        ? 'border-accent bg-accent text-white'
        : 'border-ink/20 bg-white text-ink hover:border-ink/50',
      className,
    )}
    {...props}
  >
    {children}
  </button>
)
