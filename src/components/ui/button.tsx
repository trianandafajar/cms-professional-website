import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-4 focus-visible:ring-blue-500/20 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md",

        outline:
          "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300",

        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200",

        ghost:
          "text-gray-600 hover:bg-gray-100 hover:text-gray-900",

        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-sm",

        link:
          "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700",
      },

      size: {
        default:
          "h-10 gap-2 px-4",

        xs:
          "h-7 gap-1 rounded-lg px-2 text-xs [&_svg:not([class*='size-'])]:size-3",

        sm:
          "h-8 gap-1.5 rounded-lg px-3 text-sm [&_svg:not([class*='size-'])]:size-3.5",

        lg:
          "h-11 gap-2 px-5 text-base",

        icon:
          "size-10",

        "icon-xs":
          "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",

        "icon-sm":
          "size-8 rounded-lg",

        "icon-lg":
          "size-11 rounded-xl",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {

  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }