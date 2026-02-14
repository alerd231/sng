import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import clsx from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface BaseButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  dark?: boolean
  children: ReactNode
}

type NativeButtonProps = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: never
    href?: never
  }

type LinkButtonProps = BaseButtonProps &
  Omit<LinkProps, 'className'> & {
    to: string
    href?: never
  }

type AnchorButtonProps = BaseButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
    to?: never
  }

type ButtonProps = NativeButtonProps | LinkButtonProps | AnchorButtonProps

const baseClassName =
  'inline-flex items-center justify-center gap-2 rounded-none border text-[0.62rem] uppercase tracking-[0.16em] sm:text-xs sm:tracking-[0.22em] transition duration-300 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'

const variantClassName: Record<ButtonVariant, string> = {
  primary:
    'border-accent bg-accent px-6 text-white hover:border-accentDark hover:bg-accentDark',
  secondary:
    'border-ink/20 bg-transparent px-6 text-ink hover:border-ink hover:bg-ink hover:text-white',
  ghost:
    'border-white/25 bg-transparent px-6 text-white hover:border-accent hover:text-white',
}

const darkVariantClassName: Record<ButtonVariant, string> = {
  primary:
    'border-accent bg-accent px-6 text-white hover:border-accentDark hover:bg-accentDark',
  secondary:
    'border-white/30 bg-transparent px-6 text-white hover:border-white hover:bg-white hover:text-ink',
  ghost:
    'border-white/20 bg-transparent px-6 text-white/90 hover:border-accent hover:text-white',
}

const sizeClassName: Record<ButtonSize, string> = {
  sm: 'h-10 text-[0.62rem]',
  md: 'h-12 text-[0.68rem]',
  lg: 'h-14 text-[0.72rem]',
}

const getClassName = (
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
  dark = false,
) =>
  clsx(
    baseClassName,
    sizeClassName[size],
    dark ? darkVariantClassName[variant] : variantClassName[variant],
    className,
  )

export const Button = (props: ButtonProps) => {
  const {
    variant = 'primary',
    size = 'md',
    className,
    dark = false,
    children,
    ...rest
  } = props

  const classNames = getClassName(variant, size, className, dark)

  if ('to' in props && props.to) {
    const linkProps = rest as Omit<LinkButtonProps, keyof BaseButtonProps>
    return (
      <Link {...linkProps} className={classNames}>
        {children}
      </Link>
    )
  }

  if ('href' in props && props.href) {
    const anchorProps = rest as Omit<AnchorButtonProps, keyof BaseButtonProps>
    return (
      <a {...anchorProps} className={classNames}>
        {children}
      </a>
    )
  }

  const buttonProps = rest as Omit<NativeButtonProps, keyof BaseButtonProps>

  return (
    <button {...buttonProps} className={classNames}>
      {children}
    </button>
  )
}
