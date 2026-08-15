"use client";

import { useObject } from "@ai-sdk/react";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import { Chip, ChipGroup } from "@/components/chip";
import { ControlButton } from "@/components/control-button";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { readableAiError } from "@/lib/ai/error-message";
import { briefingSchema, type PaperBriefing } from "@/lib/ai/schema";

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

export function PaperBriefingPanel({
  arxivId,
  initial,
  canStream,
  cached = false,
  signedIn = true,
}: {
  arxivId: string;
  initial: PaperBriefing | null;
  canStream: boolean;
  cached?: boolean;
  /** Signed-out readers still see the sketch, but nothing may call the API. */
  signedIn?: boolean;
}) {
  const { object, submit, isLoading, error } = useObject({
    api: "/api/papers/analyze",
    schema: briefingSchema,
  });

  useEffect(() => {
    if (!initial && canStream) {
      submit({ arxivId });
    }
  }, [arxivId, canStream, initial, submit]);

  const briefing = (object as PaperBriefing | undefined) ?? initial;
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
            {cached ? "Regenerate" : "Analyze"}
          </ControlButton>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {!briefing && isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : null}

        {errorText ? <p className="text-sm text-destructive">{errorText}</p> : null}

        {!signedIn ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/80 bg-secondary/40 px-4 py-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              This is a heuristic sketch from the abstract. Sign in for a live briefing.
            </p>
            <SignInPrompt label="Sign in" />
          </div>
        ) : !canStream && !briefing ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Connect your OpenRouter key under Integrations in your account menu to stream a live
            briefing. Until then, arXivDesk keeps a heuristic sketch from the abstract.
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
        ) : null}
      </CardContent>
    </Card>
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
