import { type ReactNode } from 'react'
import clsx from 'clsx'
import { Container } from '../layout/Container'

interface SectionProps {
  index?: string
  title: string
  description?: string
  children: ReactNode
  className?: string
  tone?: 'light' | 'dark'
  id?: string
  desktopSplit?: boolean
}

export const Section = ({
  index,
  title,
  description,
  children,
  className,
  tone = 'light',
  id,
  desktopSplit = true,
}: SectionProps) => (
  <section
    id={id}
    className={clsx(
      'py-10 sm:py-16 lg:py-24',
      tone === 'light'
        ? 'bg-canvas text-ink'
        : 'bg-frame text-slate-100',
      className,
    )}
  >
    <Container>
      <div
        className={clsx(
          'grid gap-8 sm:gap-10',
          desktopSplit ? 'lg:grid-cols-12 lg:gap-12' : 'lg:gap-10',
        )}
      >
        <div className="space-y-4 sm:space-y-5 lg:col-span-4">
          {index ? (
            <p className="caption text-muted">
              <span className="text-accent">{index}</span>
            </p>
          ) : null}
          <h2 className="font-heading text-2xl font-semibold leading-tight sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="max-w-md text-sm leading-relaxed text-muted sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        <div className="lg:col-span-8">{children}</div>
      </div>
    </Container>
  </section>
)
