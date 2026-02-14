import { animate, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface StatCounterProps {
  value: number
  label: string
  suffix?: string
}

export const StatCounter = ({ value, label, suffix = '' }: StatCounterProps) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!inView) {
      return
    }

    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    })

    return () => controls.stop()
  }, [inView, value])

  return (
    <div ref={ref} className="border border-white/20 p-6">
      <p className="font-heading text-4xl font-semibold text-white sm:text-5xl">
        {displayValue}
        {suffix}
      </p>
      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/65">{label}</p>
    </div>
  )
}
