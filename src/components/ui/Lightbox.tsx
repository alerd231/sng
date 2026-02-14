import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Modal } from './Modal'

interface LightboxProps {
  open: boolean
  images: string[]
  startIndex: number
  onClose: () => void
  altPrefix?: string
}

export const Lightbox = ({
  open,
  images,
  startIndex,
  onClose,
  altPrefix = 'Изображение проекта',
}: LightboxProps) => {
  const [shift, setShift] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const total = images.length

  const safeIndex = useMemo(() => {
    if (!total) {
      return 0
    }

    return Math.min(Math.max(startIndex, 0), total - 1)
  }, [startIndex, total])

  const currentIndex = useMemo(() => {
    if (!total) {
      return 0
    }

    return ((safeIndex + shift) % total + total) % total
  }, [safeIndex, shift, total])

  const showPrevious = useCallback(() => {
    if (!total) {
      return
    }

    setShift((prev) => prev - 1)
  }, [total])

  const showNext = useCallback(() => {
    if (!total) {
      return
    }

    setShift((prev) => prev + 1)
  }, [total])

  const handleClose = useCallback(() => {
    setShift(0)
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        showPrevious()
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        showNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, showNext, showPrevious])

  if (!total) {
    return null
  }

  const currentImage = images[currentIndex]

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Галерея проекта"
      tone="dark"
      size="xl"
      contentClassName="overflow-hidden border-white/20 bg-black"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between text-[0.62rem] uppercase tracking-[0.2em] text-white/70">
          <span>
            {currentIndex + 1} / {total}
          </span>
          <span>Используйте стрелки на клавиатуре</span>
        </div>

        <div
          className="relative overflow-hidden border border-white/20"
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null
          }}
          onTouchEnd={(event) => {
            const start = touchStartX.current
            const end = event.changedTouches[0]?.clientX

            if (start === null || end === undefined) {
              touchStartX.current = null
              return
            }

            const delta = end - start

            if (Math.abs(delta) > 42) {
              if (delta > 0) {
                showPrevious()
              } else {
                showNext()
              }
            }

            touchStartX.current = null
          }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={`${currentImage}-${currentIndex}`}
              src={currentImage}
              alt={`${altPrefix} ${currentIndex + 1}`}
              className="h-[58vh] w-full object-cover"
              initial={{ opacity: 0.35, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.35, scale: 1.01 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            />
          </AnimatePresence>

          <button
            type="button"
            onClick={showPrevious}
            aria-label="Предыдущее изображение"
            className="absolute left-3 top-1/2 -translate-y-1/2 border border-white/30 bg-black/55 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white transition hover:border-accent"
          >
            ←
          </button>
          <button
            type="button"
            onClick={showNext}
            aria-label="Следующее изображение"
            className="absolute right-3 top-1/2 -translate-y-1/2 border border-white/30 bg-black/55 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white transition hover:border-accent"
          >
            →
          </button>
        </div>
      </div>
    </Modal>
  )
}
