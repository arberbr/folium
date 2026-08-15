"use client";

import { useObject } from "@ai-sdk/react";
import { Sparkles } from "lucide-react";
import { Chip, ChipGroup } from "@/components/chip";
import { ControlButton } from "@/components/control-button";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { readableAiError } from "@/lib/ai/error-message";
import { CONNECT_KEY_MESSAGE } from "@/lib/ai/messages";
import { briefingSchema, type PaperBriefing } from "@/lib/ai/schema";

/**
 * What the panel renders. Every field is optional because `useObject` streams
 * the briefing in pieces.
 */
type BriefingView = {
  tldr?: string;
  audience?: string;
  claims?: (string | undefined)[];
  methods?: (string | undefined)[];
  limitations?: (string | undefined)[];
  whyItMatters?: string;
  relatedQuestions?: (string | undefined)[];
  difficulty?: PaperBriefing["difficulty"];
  novelty?: number;
};

function difficultyCopy(value: PaperBriefing["difficulty"] | undefined) {
  switch (value) {
    case "accessible":
      return "Accessible";
    case "graduate":
      return "Graduate";
    case "specialist":
      return "Specialist";
    case undefined:
      return "—";
    default: {
      const _exhaustive: never = value;
      return _exhaustive;
    }
  }
}

/**
 * Analysis spends the reader's own OpenRouter credits, so it only ever runs from
 * an explicit click. There is deliberately no effect that submits on mount:
 * `submit` is a new function on every render, so an effect depending on it
 * re-fires itself in a loop, and every iteration costs money.
 */
export function PaperBriefingPanel({
  arxivId,
  initial,
  canStream,
  signedIn,
}: {
  arxivId: string;
  /** A briefing this reader has already generated, or null if none is stored. */
  initial: PaperBriefing | null;
  canStream: boolean;
  /** Signed-out readers see the empty state, and nothing may call the API. */
  signedIn: boolean;
}) {
  const { object, submit, isLoading, error } = useObject({
    api: "/api/papers/analyze",
    schema: briefingSchema,
  });

  const streamed: BriefingView | undefined = object;
  const briefing: BriefingView | null = streamed ?? initial;
  const errorText = readableAiError(
    error,
    "The briefing could not be generated. Check your OpenRouter key.",
  );

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b">
        <div>
          <p className="text-xs tracking-[0.22em] text-primary uppercase">Briefing</p>
          <CardTitle className="font-heading mt-1 text-2xl">
            What this paper is actually doing
          </CardTitle>
        </div>
        {canStream ? (
          <ControlButton variant="outline" disabled={isLoading} onClick={() => submit({ arxivId })}>
            <Sparkles />
            {initial ? "Regenerate" : "Analyze"}
          </ControlButton>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {errorText ? <p className="text-sm text-destructive">{errorText}</p> : null}

        {!signedIn ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/80 bg-secondary/40 px-4 py-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sign in and connect a model key to generate a briefing for this paper.
            </p>
            <SignInPrompt label="Sign in" />
          </div>
        ) : !canStream ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{CONNECT_KEY_MESSAGE}</p>
        ) : !briefing && !isLoading ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            No briefing yet. Analyze reads the abstract and runs on your OpenRouter key.
          </p>
        ) : null}

        {briefing ? (
          <>
            <p className="font-heading text-2xl leading-snug text-pretty">{briefing.tldr}</p>
            <ChipGroup>
              <Chip variant="selected">{difficultyCopy(briefing.difficulty)}</Chip>
              {typeof briefing.novelty === "number" ? (
                <Chip variant="muted">Novelty {briefing.novelty}/5</Chip>
              ) : null}
            </ChipGroup>
            {briefing.audience ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{briefing.audience}</p>
            ) : null}
            <BriefingList title="Claims" items={briefing.claims} />
            <BriefingList title="Methods" items={briefing.methods} />
            <BriefingList title="Limitations" items={briefing.limitations} />
            {briefing.whyItMatters ? (
              <section>
                <h4 className="mb-2 text-xs tracking-[0.2em] text-primary uppercase">
                  Why it matters
                </h4>
                <p className="text-sm leading-relaxed">{briefing.whyItMatters}</p>
              </section>
            ) : null}
            <BriefingList title="Open questions" items={briefing.relatedQuestions} />
          </>
        ) : (
          <BriefingPlaceholder />
        )}
      </CardContent>
    </Card>
  );
}

/**
 * The empty state. Deliberately inert bars rather than text derived from the
 * abstract: anything sentence-shaped here reads as analysis the model never did.
 */
function BriefingPlaceholder() {
  return (
    <div aria-hidden className="space-y-6 opacity-40">
      <div className="space-y-2">
        <Skeleton className="h-6 w-11/12" />
        <Skeleton className="h-6 w-2/3" />
      </div>
      {["Claims", "Methods", "Limitations"].map((title) => (
        <section key={title}>
          <h4 className="mb-2 text-xs tracking-[0.2em] text-primary uppercase">{title}</h4>
          <div className="space-y-2 border-l-2 border-primary/30 pl-3">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>
        </section>
      ))}
    </div>
  );
}

function BriefingList({ title, items }: { title: string; items?: (string | undefined)[] | null }) {
  const visible = items?.filter(Boolean) ?? [];
  if (!visible.length) return null;
  return (
    <section>
      <h4 className="mb-2 text-xs tracking-[0.2em] text-primary uppercase">{title}</h4>
      <ul className="space-y-2">
        {visible.map((item) => (
          <li key={item} className="border-l-2 border-primary/50 pl-3 text-sm leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
