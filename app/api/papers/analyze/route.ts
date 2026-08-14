import { POST_ANALYZE } from "@/lib/ai/routes";

export const maxDuration = 60;

export async function POST(req: Request) {
  return POST_ANALYZE(req);
}
