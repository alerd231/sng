import { type ReactNode } from 'react'
import clsx from 'clsx'

interface FiltersBarProps {
  children: ReactNode
  onReset?: () => void
  className?: string
  dark?: boolean
}

export const FiltersBar = ({
  children,
  onReset,
  className,
  dark = false,
}: FiltersBarProps) => (
  <div
    className={clsx(
      'border p-6',
      dark
        ? 'border-white/20 bg-white/5 text-white'
        : 'border-ink/15 bg-white text-ink',
      className,
    )}
  >
    <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-end">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{children}</div>
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className={clsx(
            'h-11 w-full border px-4 text-[0.62rem] uppercase tracking-[0.2em] transition duration-300 xl:w-auto',
            dark
              ? 'border-white/25 text-white hover:border-accent'
              : 'border-ink/20 text-ink hover:border-accent',
          )}
        >
          Сбросить
        </button>
      ) : null}
    </div>
  </div>
)
