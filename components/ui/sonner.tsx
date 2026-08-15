"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--success-bg": "color-mix(in oklch, var(--chart-3) 18%, var(--popover))",
          "--success-text": "var(--chart-3)",
          "--success-border": "color-mix(in oklch, var(--chart-3) 40%, var(--border))",
          "--error-bg": "color-mix(in oklch, var(--destructive) 16%, var(--popover))",
          "--error-text": "var(--destructive)",
          "--error-border": "color-mix(in oklch, var(--destructive) 40%, var(--border))",
          "--warning-bg": "color-mix(in oklch, var(--chart-4) 18%, var(--popover))",
          "--warning-text": "var(--chart-4)",
          "--warning-border": "color-mix(in oklch, var(--chart-4) 40%, var(--border))",
          "--info-bg": "color-mix(in oklch, var(--primary) 16%, var(--popover))",
          "--info-text": "var(--primary)",
          "--info-border": "color-mix(in oklch, var(--primary) 40%, var(--border))",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
