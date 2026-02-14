import { motion, useReducedMotion } from 'framer-motion'
import { type ReactNode } from 'react'
import clsx from 'clsx'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  once?: boolean
}

export const Reveal = ({
  children,
  className,
  delay = 0,
  once = true,
}: RevealProps) => {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      className={clsx(className)}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{
        duration: reducedMotion ? 0.01 : 0.58,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
