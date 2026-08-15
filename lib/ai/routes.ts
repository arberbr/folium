import { auth } from "@clerk/nextjs/server";
import {
  convertToModelMessages,
  createTextStreamResponse,
  createUIMessageStreamResponse,
  Output,
  streamText,
  toTextStream,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { paperContext } from "@/lib/ai/briefing";
import { NO_MODEL_MESSAGE, resolveModel } from "@/lib/ai/models";
import { briefingSchema } from "@/lib/ai/schema";
import { getCachedPaper, saveBriefing } from "@/lib/data/papers";

async function requireUser() {
  const { userId } = await auth.protect();
  return userId;
}

export async function POST_ANALYZE(req: Request) {
  const userId = await requireUser();

  const body = (await req.json()) as { arxivId?: string };
  if (!body.arxivId) {
    return Response.json({ error: "Missing arxivId" }, { status: 400 });
  }

  const paper = await getCachedPaper(body.arxivId);
  if (!paper) {
    return Response.json({ error: "Paper not found" }, { status: 404 });
  }

  const briefingModel = await resolveModel(userId, "briefing");
  if (!briefingModel) {
    return Response.json({ error: NO_MODEL_MESSAGE }, { status: 503 });
  }

  const result = streamText({
    model: briefingModel.model,
    output: Output.object({ schema: briefingSchema }),
    system:
      "You are arXivDesk, a severe but generous research editor. Ground every claim in the abstract. Never invent citations, results, or datasets. Prefer concrete verbs over hype.",
    prompt: `Write a briefing for this arXiv paper.\n\n${paperContext(paper)}`,
  });

  void result.output.then(async (output) => {
    if (output) {
      await saveBriefing(paper.id, output, briefingModel.id);
    }
  });

  return createTextStreamResponse({
    stream: toTextStream({ stream: result.stream }),
  });
}

export async function POST_CHAT(req: Request) {
  const userId = await requireUser();

  const { messages, arxivId }: { messages: UIMessage[]; arxivId?: string } = await req.json();

  if (!arxivId) {
    return Response.json({ error: "Missing arxivId" }, { status: 400 });
  }

  const paper = await getCachedPaper(arxivId);
  if (!paper) {
    return Response.json({ error: "Paper not found" }, { status: 404 });
  }

  const chatModel = await resolveModel(userId, "chat");
  if (!chatModel) {
    return Response.json({ error: NO_MODEL_MESSAGE }, { status: 503 });
  }

  const result = streamText({
    model: chatModel.model,
    system: `You are arXivDesk, an evidence-bound reading partner. Answer only from this paper's title, authors, categories, and abstract. If the abstract does not contain the answer, say so and suggest what the PDF would need to show. Quote short phrases when helpful.

${paperContext(paper)}`,
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
