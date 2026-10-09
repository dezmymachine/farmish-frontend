import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/lib/utils'

/*
 * Farmish Button: shadcn mechanics (cva + Radix Slot), Spectrum character.
 * Sizes speak Spectrum (S/M/L/XL), shapes default to pill for the primary
 * attention action, every variant carries a press scale and inherits the
 * global 2px focus ring. Variant names are semantic, never hue names.
 */
const buttonVariants = cva(
  't-ui inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap transition-all duration-150 select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        accent: 'bg-accent text-on-accent shadow-elevated hover:bg-accent-strong',
        secondary: 'border border-line bg-paper text-ink hover:bg-wash',
        quiet: 'text-ink-soft hover:bg-wash hover:text-ink',
        negative: 'bg-negative text-white hover:brightness-95',
      },
      size: {
        S: 'h-8 rounded-pill px-3',
        M: 'h-10 rounded-pill px-5',
        L: 'h-12 rounded-pill px-7',
        XL: 'h-14 rounded-pill px-8',
      },
      shape: {
        pill: 'rounded-pill',
        rounded: 'rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'accent',
      size: 'M',
      shape: 'pill',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, shape }), className)} ref={ref} {...props} />
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
