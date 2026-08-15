import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full min-w-0 rounded-lg border bg-transparent text-base transition-colors outline-none file:inline-flex file:border-0 file:bg-transparent file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: "border-input disabled:bg-input/50 dark:bg-input/30",
        muted: "border-border/80 bg-muted/70 disabled:bg-muted dark:bg-muted/50",
        ghost:
          "border-transparent bg-transparent shadow-none focus-visible:border-ring dark:bg-transparent",
      },
      size: {
        sm: "h-7 px-2 py-0.5 text-sm file:h-5 file:text-xs",
        default: "h-8 px-2.5 py-1 file:h-6 file:text-sm",
        lg: "h-11 px-3.5 py-2 text-sm file:h-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Input({
  className,
  type,
  variant = "default",
  size = "default",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      data-variant={variant}
      data-size={size}
      className={cn(inputVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Input, inputVariants };
