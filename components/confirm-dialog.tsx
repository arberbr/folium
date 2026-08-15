"use client";

import type { ReactNode } from "react";
import { ControlButton } from "@/components/control-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  icon,
  title,
  description,
  confirmLabel,
  confirmVariant = "destructive",
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  icon: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  confirmVariant?: "destructive" | "default";
  pending?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader className="flex-row items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            {icon}
          </span>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{description}</DialogDescription>
        <DialogFooter>
          <ControlButton
            type="button"
            variant="outline"
            onClick={() => {
              onCancel?.();
              onOpenChange(false);
            }}
          >
            Cancel
          </ControlButton>
          <ControlButton variant={confirmVariant} disabled={pending} onClick={onConfirm}>
            {confirmLabel}
          </ControlButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
