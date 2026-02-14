import clsx from 'clsx'

interface DividerProps {
  className?: string
  dark?: boolean
}

export const Divider = ({ className, dark = false }: DividerProps) => (
  <div
    aria-hidden="true"
    className={clsx(dark ? 'dark-divider' : 'thin-divider', className)}
  />
)
