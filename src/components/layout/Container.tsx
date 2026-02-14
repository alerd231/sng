import { type ElementType, type ReactNode } from 'react'
import clsx from 'clsx'

interface ContainerProps {
  as?: ElementType
  className?: string
  children: ReactNode
}

export const Container = ({ as: Component = 'div', className, children }: ContainerProps) => (
  <Component className={clsx('container', className)}>{children}</Component>
)
