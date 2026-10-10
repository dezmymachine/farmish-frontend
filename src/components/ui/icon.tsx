import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'
import { cn } from '~/lib/utils'

/*
 * Project-wide Hugeicons wrapper. Hugeicons is the only icon pack:
 * import the icon object from `@hugeicons/core-free-icons` and render
 * through here so size, stroke and color stay consistent. Decorative
 * icons are `aria-hidden` by default; pass an `aria-label` for a
 * meaningful icon (cart count, profile) to expose it.
 */
interface IconProps {
  icon: IconSvgElement
  size?: number
  strokeWidth?: number
  className?: string
  ariaLabel?: string
}

export function Icon({ icon, size = 20, strokeWidth = 1.8, className, ariaLabel }: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      color="currentColor"
      className={cn('shrink-0', className)}
      aria-hidden={ariaLabel === undefined ? true : undefined}
      aria-label={ariaLabel}
      role={ariaLabel === undefined ? undefined : 'img'}
    />
  )
}
