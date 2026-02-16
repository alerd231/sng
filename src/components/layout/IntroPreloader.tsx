import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface IntroPreloaderProps {
  open: boolean
}

const DRAW_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const lineTransition = (delay: number) => ({
  duration: 0.8,
  delay,
  ease: DRAW_EASE,
})

export const IntroPreloader = ({ open }: IntroPreloaderProps) => {
  const reduceMotion = useReducedMotion()
  const draw = reduceMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 1, opacity: 1 }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[500] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#06090E' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.015 }}
          transition={{ duration: reduceMotion ? 0.2 : 0.45, ease: DRAW_EASE }}
          aria-hidden="true"
        >
          <div className="pointer-events-none absolute inset-0 bg-black/70" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_22%,rgba(255,255,255,0.08),transparent_42%),radial-gradient(circle_at_80%_72%,rgba(255,255,255,0.04),transparent_38%)]" />

          <motion.div
            className="relative w-[min(82vw,520px)]"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0.78, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: DRAW_EASE }}
          >
            <motion.svg
              viewBox="0 0 768 871"
              className="h-auto w-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              initial={false}
            >
              <g stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                  d="M540 244 A294 294 0 1 0 540 622"
                  initial={{ pathLength: 0, opacity: 0.8 }}
                  animate={draw}
                  transition={lineTransition(0.05)}
                />
                <motion.path
                  d="M464 308 A194 194 0 1 0 464 558"
                  initial={{ pathLength: 0, opacity: 0.8 }}
                  animate={draw}
                  transition={lineTransition(0.2)}
                />

                <motion.rect
                  x="266"
                  y="4"
                  width="103"
                  height="863"
                  initial={{ pathLength: 0, opacity: 0.8 }}
                  animate={draw}
                  transition={lineTransition(0.35)}
                />

                <motion.path
                  d="M266 95 L582 102 L680 209 L742 209 L742 4 L266 4"
                  initial={{ pathLength: 0, opacity: 0.8 }}
                  animate={draw}
                  transition={lineTransition(0.5)}
                />

                <motion.rect
                  x="637"
                  y="317"
                  width="105"
                  height="406"
                  initial={{ pathLength: 0, opacity: 0.8 }}
                  animate={draw}
                  transition={lineTransition(0.66)}
                />

                <motion.line
                  x1="369"
                  y1="428"
                  x2="637"
                  y2="428"
                  initial={{ pathLength: 0, opacity: 0.8 }}
                  animate={draw}
                  transition={lineTransition(0.82)}
                />

                <motion.line
                  x1="369"
                  y1="528"
                  x2="637"
                  y2="528"
                  initial={{ pathLength: 0, opacity: 0.8 }}
                  animate={draw}
                  transition={lineTransition(0.94)}
                />
              </g>
            </motion.svg>

            <motion.div
              className="pointer-events-none absolute inset-0"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
              animate={reduceMotion ? { opacity: 0 } : { opacity: [0, 0.35, 0.12, 0] }}
              transition={{ duration: 1.8, delay: 0.9, ease: 'easeInOut' }}
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 62%)',
              }}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
