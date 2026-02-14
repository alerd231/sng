import { Link } from 'react-router-dom'
import type { BreadcrumbItem } from '../../types/models'

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  dark?: boolean
}

export const Breadcrumbs = ({ items, dark = false }: BreadcrumbsProps) => (
  <nav aria-label="Хлебные крошки">
    <ol
      className={`flex flex-wrap items-center gap-2 text-[0.56rem] uppercase tracking-[0.14em] sm:text-[0.62rem] sm:tracking-[0.2em] ${
        dark ? 'text-white/65' : 'text-muted'
      }`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="transition-colors duration-300 hover:text-accent"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
            )}
            {!isLast ? <span aria-hidden="true">/</span> : null}
          </li>
        )
      })}
    </ol>
  </nav>
)
