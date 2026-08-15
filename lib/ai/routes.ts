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
import { CONNECT_KEY_MESSAGE } from "@/lib/ai/messages";
import { resolveModel } from "@/lib/ai/models";
import { briefingSchema } from "@/lib/ai/schema";
import { requireUserId } from "@/lib/auth";
import { loadPaper, saveBriefing } from "@/lib/data/papers";
import { analyzeBodySchema, chatBodySchema, parseJsonBody } from "@/lib/validations";

export async function POST_ANALYZE(req: Request) {
  const userId = await requireUserId();

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const body = parseJsonBody(analyzeBodySchema, raw);
  if (!body.ok) {
    return Response.json({ error: body.error }, { status: 400 });
  }

  const paper = await loadPaper(body.data.arxivId);
  if (!paper) {
    return Response.json({ error: "Paper not found" }, { status: 404 });
  }

  const briefingModel = await resolveModel(userId, "briefing");
  if (!briefingModel) {
    return Response.json({ error: CONNECT_KEY_MESSAGE }, { status: 503 });
  }

  const result = streamText({
    model: briefingModel.model,
    output: Output.object({ schema: briefingSchema }),
    system:
      "You are arXivDesk, a severe but generous research editor. Ground every claim in the abstract. Never invent citations, results, or datasets. Prefer concrete verbs over hype.",
    prompt: `Write a briefing for this arXiv paper.\n\n${paperContext(paper)}`,
  });

  void Promise.resolve(result.output)
    .then(async (output) => {
      if (output) await saveBriefing(userId, paper.id, output, briefingModel.id);
    })
    .catch(() => {
      // Stream already left the process; a persist failure must not become an unhandled rejection.
    });

  return createTextStreamResponse({
    stream: toTextStream({ stream: result.stream }),
  });
}

export async function POST_CHAT(req: Request) {
  const userId = await requireUserId();

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const body = parseJsonBody(chatBodySchema, raw);
  if (!body.ok) {
    return Response.json({ error: body.error }, { status: 400 });
  }

  const paper = await loadPaper(body.data.arxivId);
  if (!paper) {
    return Response.json({ error: "Paper not found" }, { status: 404 });
  }

  const chatModel = await resolveModel(userId, "chat");
  if (!chatModel) {
    return Response.json({ error: CONNECT_KEY_MESSAGE }, { status: 503 });
  }

  const result = streamText({
    model: chatModel.model,
    system: `You are arXivDesk, an evidence-bound reading partner. Answer only from this paper's title, authors, categories, and abstract. If the abstract does not contain the answer, say so and suggest what the PDF would need to show. Quote short phrases when helpful.

${paperContext(paper)}`,
    // Zod already required id, role, and typed parts; the SDK's part union is wider than we persist.
    messages: await convertToModelMessages(body.data.messages as UIMessage[]),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
