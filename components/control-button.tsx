import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** The subset of Button sizes arXivDesk uses, each with its own height override below. */
type ControlSize = "default" | "lg" | "icon" | "icon-lg";

function sizeClass(size: ControlSize) {
  switch (size) {
    case "default":
      return "h-8 rounded-lg px-2.5";
    case "lg":
      return "h-11 rounded-lg px-5 text-sm";
    case "icon":
      return "size-8 rounded-lg px-0";
    case "icon-lg":
      return "size-11 rounded-lg px-0";
    default: {
      const _exhaustive: never = size;
      return _exhaustive;
    }
  }
}

export function ControlButton({
  className,
  size = "default",
  ...props
}: Omit<ComponentProps<typeof Button>, "size"> & { size?: ControlSize }) {
  return (
    <Button size={size} className={cn("cursor-pointer", sizeClass(size), className)} {...props} />
  );
}
