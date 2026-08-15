"use client";

import { CheckCircle2, ExternalLink } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { ControlButton } from "@/components/control-button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  disconnectOpenRouterAction,
  getOpenRouterConnectionAction,
  saveOpenRouterKeyAction,
} from "@/lib/actions";

const KEYS_URL = "https://openrouter.ai/keys";

// Inferred from the action rather than imported from lib/ai/openrouter, so nothing in
// this client module has even a type-level edge to the Clerk backend SDK.
type OpenRouterConnection = Awaited<ReturnType<typeof getOpenRouterConnectionAction>>;

export function OpenRouterPanel() {
  const [connection, setConnection] = useState<OpenRouterConnection | null>(null);
  const [key, setKey] = useState("");
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  // Clerk mounts custom pages inside its own portal, so there is no server render to
  // seed from — read the connection once the panel is on screen.
  useEffect(() => {
    let active = true;
    getOpenRouterConnectionAction()
      .then((result) => {
        if (active) setConnection(result);
      })
      .catch(() => {
        if (active) toast.error("Could not load your integrations");
      });
    return () => {
      active = false;
    };
  }, []);

  function connect() {
    startTransition(async () => {
      const result = await saveOpenRouterKeyAction(key);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setConnection(result.connection);
      setKey("");
      setEditing(false);
      toast.success("OpenRouter connected — analyses now run on your key.");
    });
  }

  function disconnect() {
    startTransition(async () => {
      try {
        setConnection(await disconnectOpenRouterAction());
        toast.success("OpenRouter disconnected.");
      } catch {
        toast.error("Could not remove that key");
      }
    });
  }

  const showForm = editing || (connection !== null && !connection.connected);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-heading text-xl">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          arXivDesk runs every briefing and paper chat on your own model provider. Without a key
          connected, papers still open — you just get a heuristic sketch of the abstract instead of
          a live briefing.
        </p>
      </header>

      <hr className="border-border/70" />

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium">OpenRouter</h2>
          <a
            href={KEYS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Create a key <ExternalLink className="size-3" />
          </a>
        </div>

        {connection === null ? (
          <Skeleton className="h-11 w-full rounded-lg" />
        ) : showForm ? (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              connect();
            }}
          >
            <Input
              size="lg"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={key}
              onChange={(event) => setKey(event.target.value)}
              placeholder="sk-or-v1-…"
              aria-label="OpenRouter API key"
            />
            <div className="flex flex-wrap gap-2">
              <ControlButton type="submit" disabled={pending || !key.trim()}>
                {pending ? "Verifying…" : "Connect"}
              </ControlButton>
              {connection.connected ? (
                <ControlButton
                  type="button"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => {
                    setEditing(false);
                    setKey("");
                  }}
                >
                  Cancel
                </ControlButton>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              Your key is stored privately against your account and is only ever read on the server
              to call OpenRouter. It is never sent back to the browser.
            </p>
          </form>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/40 px-4 py-3">
            <span className="flex items-center gap-2.5">
              <CheckCircle2 className="size-4 text-primary" />
              <span>
                <span className="block font-mono text-sm">••••{connection.hint}</span>
                {connection.label ? (
                  <span className="block text-xs text-muted-foreground">{connection.label}</span>
                ) : null}
              </span>
            </span>
            <span className="flex gap-2">
              <ControlButton
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setEditing(true)}
              >
                Replace
              </ControlButton>
              <ControlButton type="button" variant="ghost" disabled={pending} onClick={disconnect}>
                Disconnect
              </ControlButton>
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
