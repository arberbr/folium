import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "group/chip inline-flex w-fit shrink-0 items-center gap-1.5 border font-medium tracking-[0.04em] whitespace-nowrap transition-[color,background-color,border-color,box-shadow] duration-150 before:block before:size-1.5 before:shrink-0 before:rounded-[2px] before:content-[''] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary/8 text-foreground before:bg-primary hover:border-primary/40 hover:bg-primary/14",
        selected:
          "border-primary bg-primary text-primary-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)] before:bg-primary-foreground/85 hover:bg-primary/90",
        muted:
          "border-border/80 bg-muted/70 text-muted-foreground before:bg-muted-foreground/70 hover:border-border hover:bg-muted hover:text-foreground",
        shelf:
          "cursor-pointer border-border/50 bg-secondary text-secondary-foreground before:hidden hover:border-border hover:bg-muted hover:text-foreground",
      },
      size: {
        sm: "rounded-md px-2 py-0.5 text-[11px] leading-4",
        md: "rounded-md px-2.5 py-1 text-xs leading-4",
        lg: "rounded-full px-3.5 py-1.5 text-sm leading-5",
      },
      accent: {
        true: "border-primary/45 bg-primary/14",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "selected",
        accent: true,
        class: "border-primary bg-primary",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "sm",
      accent: false,
    },
  },
);

function Chip({
  className,
  variant = "default",
  size = "sm",
  accent = false,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof chipVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="chip"
      data-variant={variant}
      className={cn(chipVariants({ variant, size, accent }), className)}
      {...props}
    />
  );
}

function ChipGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chip-group"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

export { Chip, ChipGroup, chipVariants };
