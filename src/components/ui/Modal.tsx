import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  describedBy?: string
  size?: 'md' | 'lg' | 'xl'
  tone?: 'light' | 'dark'
  contentClassName?: string
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const sizeClassName: Record<NonNullable<ModalProps['size']>, string> = {
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
}

export const Modal = ({
  open,
  onClose,
  title,
  children,
  describedBy,
  size = 'lg',
  tone = 'light',
  contentClassName,
}: ModalProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const onCloseRef = useRef(onClose)
  const titleId = useMemo(
    () => `modal-title-${title.toLowerCase().replace(/\s+/g, '-')}`,
    [title],
  )

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) {
      return
    }

    const previousFocused = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    if (panel) {
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      const fallbackElement = panel
      const firstFocusable = focusable[0] ?? fallbackElement
      firstFocusable.focus()

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          onCloseRef.current()
          return
        }

        if (event.key !== 'Tab') {
          return
        }

        const freshFocusable = Array.from(
          panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        )

        if (!freshFocusable.length) {
          event.preventDefault()
          panel.focus()
          return
        }

        const first = freshFocusable[0]
        const last = freshFocusable[freshFocusable.length - 1]

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }

      document.addEventListener('keydown', handleKeyDown)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = previousOverflow
        previousFocused?.focus()
      }
    }

    return () => {
      document.body.style.overflow = previousOverflow
      previousFocused?.focus()
    }
  }, [open])

  const handleOverlayMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onCloseRef.current()
    }
  }

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/82 px-2 py-2 backdrop-blur-md sm:items-center sm:px-6 sm:py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
          onMouseDown={handleOverlayMouseDown}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(184,29,39,0.22),transparent_45%)]"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={describedBy}
            tabIndex={-1}
            className={clsx(
              'relative my-auto grid w-full max-h-[calc(100dvh-1rem)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden border shadow-panel sm:max-h-[calc(100dvh-3rem)]',
              sizeClassName[size],
              tone === 'dark'
                ? 'border-white/25 bg-graphite text-white'
                : 'border-ink/15 bg-canvas text-ink',
              contentClassName,
            )}
            initial={{ opacity: 0, y: 16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-current/15 bg-inherit px-4 py-3 sm:px-6 sm:py-4">
              <h2
                id={titleId}
                className="text-sm font-medium uppercase tracking-[0.2em]"
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть модальное окно"
                className="h-9 w-9 border border-current/20 text-sm transition hover:border-accent hover:text-accent"
              >
                ×
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto p-4 sm:p-6">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
