import * as React from 'react'
import { cn } from '~/lib/utils'

/*
 * shadcn Input mechanics, Farmish tokens. `t-body` text on paper, line
 * border, brand ring on focus (inherits the global :focus-visible ring).
 */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        't-body flex h-10 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink',
        'placeholder:text-ink-faint',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }
