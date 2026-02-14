import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'

export interface AccordionItem {
  id: string
  title: string
  content: string
}

interface AccordionProps {
  items: AccordionItem[]
  className?: string
  dark?: boolean
}

export const Accordion = ({ items, className, dark = false }: AccordionProps) => {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)

  return (
    <div className={clsx('space-y-3', className)}>
      {items.map((item) => {
        const open = openId === item.id

        return (
          <div
            key={item.id}
            className={clsx(
              'border',
              dark ? 'border-white/20 bg-white/5' : 'border-ink/15 bg-white',
            )}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={open}
              aria-controls={`accordion-${item.id}`}
              onClick={() => setOpenId(open ? null : item.id)}
            >
              <span
                className={clsx(
                  'text-sm font-medium uppercase tracking-[0.16em]',
                  dark ? 'text-white' : 'text-ink',
                )}
              >
                {item.title}
              </span>
              <span
                className={clsx(
                  'text-xs transition-transform duration-300',
                  open ? 'rotate-45' : 'rotate-0',
                  dark ? 'text-white/70' : 'text-muted',
                )}
                aria-hidden="true"
              >
                +
              </span>
            </button>

            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  id={`accordion-${item.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p
                    className={clsx(
                      'px-5 pb-5 text-sm leading-relaxed',
                      dark ? 'text-white/80' : 'text-muted',
                    )}
                  >
                    {item.content}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
