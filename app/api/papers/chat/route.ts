import { POST_CHAT } from "@/lib/ai/routes";

export const maxDuration = 60;

export async function POST(req: Request) {
  return POST_CHAT(req);
}
