import { motion, useReducedMotion } from 'framer-motion'
import { type ReactNode } from 'react'
import clsx from 'clsx'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  once?: boolean
  axis?: 'x' | 'y'
  distance?: number
  amount?: number
  duration?: number
  blur?: boolean
}

export const Reveal = ({
  children,
  className,
  delay = 0,
  once = true,
  axis = 'y',
  distance = 18,
  amount = 0.2,
  duration = 0.58,
  blur = true,
}: RevealProps) => {
  const reducedMotion = useReducedMotion()
  const offset = reducedMotion ? 0 : distance

  return (
    <motion.div
      className={clsx(className)}
      initial={{
        opacity: 0,
        x: axis === 'x' ? offset : 0,
        y: axis === 'y' ? offset : 0,
        scale: reducedMotion ? 1 : 0.988,
        filter: reducedMotion || !blur ? 'blur(0px)' : 'blur(6px)',
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once, amount }}
      transition={{
        duration: reducedMotion ? 0.01 : duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
