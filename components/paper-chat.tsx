"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowUp } from "lucide-react";
import { ControlButton } from "@/components/control-button";
import { Markdown } from "@/components/markdown";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { readableAiError } from "@/lib/ai/error-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function PaperChat({
  arxivId,
  signedIn = true,
  canChat,
}: {
  arxivId: string;
  /** The chat endpoint requires auth, so signed-out readers get a prompt. */
  signedIn?: boolean;
  /** False when the reader has no OpenRouter key — the composer would only 503. */
  canChat: boolean;
}) {
  const [input, setInput] = useState("");
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/papers/chat",
        body: { arxivId },
      }),
    [arxivId],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";
  // canChat is only computed at page render, so it cannot catch a key revoked or
  // exhausted mid-conversation — that surfaces here instead.
  const errorText = readableAiError(
    error,
    "The answer could not be generated. Check your OpenRouter key.",
  );

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <p className="text-xs tracking-[0.22em] text-primary uppercase">Socratic margin</p>
        <CardTitle className="font-heading text-2xl">Ask the abstract</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-80 flex-1 flex-col gap-4">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Questions are grounded in the title and abstract. If the PDF is required, Folium will say so.
            </p>
          ) : null}
          {messages.map((message) => (
            <article
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-8 rounded-xl bg-secondary px-4 py-3 text-sm"
                  : "mr-8 rounded-xl border border-border/80 px-4 py-3 text-sm leading-relaxed"
              }
            >
              {message.parts.map((part, index) => {
                if (part.type !== "text") return null;
                const key = `${message.id}-${index}`;
                // A reader's own question is literal text — rendering it as markdown
                // would mangle a question that happens to contain * or _.
                return message.role === "user" ? (
                  <p key={key} className="whitespace-pre-wrap">
                    {part.text}
                  </p>
                ) : (
                  <Markdown key={key}>{part.text}</Markdown>
                );
              })}
            </article>
          ))}
          {errorText ? (
            <p className="mr-8 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm leading-relaxed text-destructive">
              {errorText}
            </p>
          ) : null}
        </div>
        {!signedIn ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-secondary/40 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Sign in to ask questions about this paper.
            </p>
            <SignInPrompt label="Sign in" />
          </div>
        ) : !canChat ? (
          <div className="rounded-xl border border-border/80 bg-secondary/40 px-4 py-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Connect your OpenRouter key under Integrations in your account menu to ask
              questions about this paper.
            </p>
          </div>
        ) : (
          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!input.trim() || busy) return;
              sendMessage({ text: input });
              setInput("");
            }}
          >
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="What is the actual claim, and what would falsify it?"
              className="min-h-16"
            />
            <ControlButton type="submit" size="icon" disabled={busy || !input.trim()}>
              <ArrowUp />
            </ControlButton>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
