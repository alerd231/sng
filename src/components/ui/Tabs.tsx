import { useMemo, useState, type ReactNode } from 'react'
import clsx from 'clsx'

export interface TabItem {
  id: string
  label: string
  content: ReactNode
}

interface TabsProps {
  items: TabItem[]
  initialId?: string
  className?: string
}

export const Tabs = ({ items, initialId, className }: TabsProps) => {
  const firstId = items[0]?.id
  const initialTabId = useMemo(() => initialId ?? firstId ?? '', [initialId, firstId])
  const [activeId, setActiveId] = useState(initialTabId)

  const activeItem = items.find((item) => item.id === activeId) ?? items[0]

  if (!activeItem) {
    return null
  }

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Разделы компетенций"
        className="flex flex-wrap gap-2 border-b border-ink/15 pb-4"
      >
        {items.map((item) => {
          const selected = item.id === activeItem.id

          return (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              type="button"
              onClick={() => setActiveId(item.id)}
              className={clsx(
                'min-h-[2.5rem] border px-3 py-2 text-[0.56rem] uppercase tracking-[0.14em] sm:px-4 sm:text-[0.62rem] sm:tracking-[0.2em] transition duration-300 ease-smooth',
                selected
                  ? 'border-accent bg-accent text-white'
                  : 'border-ink/20 text-ink hover:border-ink/50',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <div
        id={`panel-${activeItem.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeItem.id}`}
        className="pt-6"
      >
        {activeItem.content}
      </div>
    </div>
  )
}
