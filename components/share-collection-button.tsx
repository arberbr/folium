"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { publishCollectionAction, unpublishCollectionAction } from "@/lib/actions";
import { shareHref } from "@/lib/format";

type ShareStep = "explain" | "link" | "unpublish";

function shareUrl(origin: string, token: string) {
  const path = shareHref(token);
  return origin ? `${origin}${path}` : path;
}

export function ShareCollectionButton({
  collectionId,
  name,
  shareToken,
  origin,
}: {
  collectionId: string;
  name: string;
  shareToken: string | null;
  origin: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [token, setToken] = useState(shareToken);
  const [step, setStep] = useState<ShareStep>(shareToken ? "link" : "explain");
  const [copied, setCopied] = useState(false);

  function resetForOpen() {
    setToken(shareToken);
    setStep(shareToken ? "unpublish" : "explain");
    setCopied(false);
  }

  async function copyLink(nextToken: string) {
    try {
      await navigator.clipboard.writeText(shareUrl(origin, nextToken));
      setCopied(true);
      toast.success("Share link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link");
    }
  }

  let body: ReactNode;
  switch (step) {
    case "explain":
      body = (
        <>
          <DialogHeader className="flex-row items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              <Globe className="size-4" />
            </span>
            <DialogTitle>Make this collection public?</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Anyone with the link can view “{name}”, even if they are not signed in. You’ll get
            a short share URL. Renaming the collection later will not break it.
          </DialogDescription>
          <DialogFooter>
            <ControlButton type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </ControlButton>
            <ControlButton
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  try {
                    const result = await publishCollectionAction(collectionId);
                    setToken(result.token);
                    setStep("link");
                    toast.success("Collection is public");
                    router.refresh();
                  } catch {
                    toast.error("Could not make this collection public");
                  }
                });
              }}
            >
              Make public
            </ControlButton>
          </DialogFooter>
        </>
      );
      break;
    case "link":
      body = token ? (
        <>
          <DialogHeader className="flex-row items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              <Globe className="size-4" />
            </span>
            <DialogTitle>Share this collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <DialogDescription>
              Anyone with this link can view “{name}”, even without an account.
            </DialogDescription>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={shareUrl(origin, token)}
                aria-label="Share link"
                className="font-mono text-xs"
                onFocus={(event) => event.currentTarget.select()}
              />
              <ControlButton
                type="button"
                variant="outline"
                size="icon"
                aria-label="Copy share link"
                onClick={() => {
                  void copyLink(token);
                }}
              >
                {copied ? <Check /> : <Copy />}
              </ControlButton>
            </div>
          </div>
          <DialogFooter>
            <ControlButton type="button" variant="outline" onClick={() => setStep("unpublish")}>
              Make private
            </ControlButton>
            <ControlButton type="button" onClick={() => setOpen(false)}>
              Done
            </ControlButton>
          </DialogFooter>
        </>
      ) : null;
      break;
    case "unpublish":
      body = (
        <>
          <DialogHeader className="flex-row items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Lock className="size-4" />
            </span>
            <DialogTitle>Make this collection private?</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            The share link will stop working. Anyone who has it will lose access.
          </DialogDescription>
          {token ? (
            <Input
              readOnly
              value={shareUrl(origin, token)}
              aria-label="Share link"
              className="font-mono text-xs"
              onFocus={(event) => event.currentTarget.select()}
            />
          ) : null}
          <DialogFooter>
            <ControlButton
              type="button"
              variant="outline"
              onClick={() => setStep(token ? "link" : "explain")}
            >
              Cancel
            </ControlButton>
            <ControlButton
              variant="destructive"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  try {
                    await unpublishCollectionAction(collectionId);
                    setToken(null);
                    setOpen(false);
                    toast.success("Collection is private again");
                    router.refresh();
                  } catch {
                    toast.error("Could not make this collection private");
                  }
                });
              }}
            >
              Make private
            </ControlButton>
          </DialogFooter>
        </>
      );
      break;
    default: {
      const _exhaustive: never = step;
      body = _exhaustive;
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) resetForOpen();
      }}
    >
      <DialogTrigger asChild>
        <ControlButton variant="outline">{shareToken ? "Make Private" : "Make Public"}</ControlButton>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        {body}
      </DialogContent>
    </Dialog>
  );
}
