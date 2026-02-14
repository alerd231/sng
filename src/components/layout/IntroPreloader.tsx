import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface IntroPreloaderProps {
  open: boolean
}

const BRAND_TEXT = 'СТРОЙНЕФТЕГАЗ'

export const IntroPreloader = ({ open }: IntroPreloaderProps) => {
  const reduceMotion = useReducedMotion()
  const letters = BRAND_TEXT.split('')

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[220] flex items-center justify-center overflow-hidden bg-[#0c0f14]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -28 }}
          transition={{ duration: reduceMotion ? 0.22 : 0.64, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(184,29,39,0.28),transparent_36%),radial-gradient(circle_at_84%_14%,rgba(255,255,255,0.09),transparent_34%)]" />
          <div className="pointer-events-none absolute inset-[14px] border border-white/10 sm:inset-[20px]" />

          <div className="relative z-10 w-full max-w-[min(980px,92vw)] px-4 text-center">
            <motion.p
              className="caption text-white/50"
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              ИНЖЕНЕРНЫЙ КОНТУР
            </motion.p>

            <div className="relative mt-4 overflow-hidden border border-white/20 bg-white/[0.02] px-3 py-5 sm:px-8 sm:py-8">
              <motion.div
                className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-accent/75 to-transparent"
                initial={reduceMotion ? false : { x: '-140%' }}
                animate={
                  reduceMotion
                    ? { opacity: 0 }
                    : { x: ['-140%', '190%'], opacity: [0, 0.5, 0.22, 0] }
                }
                transition={{
                  duration: 1.9,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatDelay: 0.2,
                }}
              />

              <h1 className="flex flex-wrap items-center justify-center gap-x-[0.12em] gap-y-2 text-2xl font-semibold uppercase tracking-[0.08em] text-white sm:text-5xl lg:text-6xl">
                {letters.map((letter, index) => (
                  <motion.span
                    key={`${letter}-${index}`}
                    initial={reduceMotion ? false : { opacity: 0, y: 14, filter: 'blur(4px)' }}
                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      duration: 0.42,
                      delay: reduceMotion ? 0 : 0.22 + index * 0.04,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                  </motion.span>
                ))}
              </h1>

              <motion.div
                className="mx-auto mt-4 h-px bg-white/35"
                initial={reduceMotion ? false : { width: 0 }}
                animate={reduceMotion ? { width: '100%' } : { width: ['0%', '100%'] }}
                transition={{ duration: reduceMotion ? 0.15 : 1.1, ease: 'easeOut' }}
              />
            </div>

            <div className="mx-auto mt-6 h-[2px] w-52 overflow-hidden bg-white/20 sm:w-72">
              <motion.div
                className="h-full bg-accent"
                initial={{ x: '-100%' }}
                animate={reduceMotion ? { x: '0%' } : { x: ['-100%', '0%'] }}
                transition={{ duration: reduceMotion ? 0.2 : 1.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
