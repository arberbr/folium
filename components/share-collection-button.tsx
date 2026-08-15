"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Globe } from "lucide-react";
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
  const [copied, setCopied] = useState(false);

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
  if (token) {
    body = (
      <>
        <DialogHeader className="flex-row items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            <Globe className="size-4" />
          </span>
          <DialogTitle>“{name}” is public</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <DialogDescription>
            Anyone with this link can view it, even without an account.
          </DialogDescription>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={shareUrl(origin, token)}
              aria-label="Share link — click to copy"
              title="Click to copy"
              className="cursor-pointer font-mono text-xs"
              onFocus={(event) => event.currentTarget.select()}
              onClick={(event) => {
                event.currentTarget.select();
                void copyLink(token);
              }}
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
          <p className="text-xs text-muted-foreground">
            Making it private stops this link from working. Sharing again later creates a new link.
          </p>
        </div>
        <DialogFooter>
          <ControlButton type="button" variant="outline" onClick={() => setOpen(false)}>
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
  } else {
    body = (
      <>
        <DialogHeader className="flex-row items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            <Globe className="size-4" />
          </span>
          <DialogTitle>Make this collection public?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Anyone with the link can view “{name}”, even if they are not signed in. You’ll get a short
          share URL. Renaming the collection later will not break it.
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
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setToken(shareToken);
          setCopied(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <ControlButton variant="outline">
          {shareToken ? "Make Private" : "Make Public"}
        </ControlButton>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        {body}
      </DialogContent>
    </Dialog>
  );
}
