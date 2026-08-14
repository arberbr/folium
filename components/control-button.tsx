import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ControlSize = "default" | "lg" | "icon" | "icon-lg";

function nativeSize(size: ControlSize): NonNullable<ComponentProps<typeof Button>["size"]> {
  switch (size) {
    case "default":
      return "default";
    case "lg":
      return "lg";
    case "icon":
      return "icon";
    case "icon-lg":
      return "icon-lg";
    default: {
      const _exhaustive: never = size;
      return _exhaustive;
    }
  }
}

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
    <Button
      size={nativeSize(size)}
      className={cn("cursor-pointer", sizeClass(size), className)}
      {...props}
    />
  );
}
