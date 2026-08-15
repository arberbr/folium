import { describe, expect, it } from "vitest";
import { ActionError } from "./errors";
import {
  analyzeBodySchema,
  arxivIdSchema,
  CHAT_MAX_MESSAGES,
  chatBodySchema,
  collectionNameSchema,
  interestsSchema,
  parseJsonBody,
  parseWith,
  readingStatusSchema,
} from "./validations";

describe("arxivIdSchema", () => {
  it("normalizes a versioned id", () => {
    expect(parseWith(arxivIdSchema, "1706.03762v5")).toBe("1706.03762");
  });

  it("rejects a title", () => {
    expect(() => parseWith(arxivIdSchema, "not an id")).toThrow(ActionError);
    expect(() => parseWith(arxivIdSchema, "not an id")).toThrow(/valid arXiv id/);
  });
});

describe("collectionNameSchema", () => {
  it("trims names", () => {
    expect(parseWith(collectionNameSchema, "  Transformers  ")).toBe("Transformers");
  });

  it("rejects an empty name", () => {
    expect(() => parseWith(collectionNameSchema, "   ")).toThrow();
  });
});

describe("readingStatusSchema", () => {
  it("accepts known statuses", () => {
    expect(parseWith(readingStatusSchema, "queued")).toBe("queued");
  });

  it("rejects an unknown status", () => {
    expect(() => parseWith(readingStatusSchema, "maybe")).toThrow();
  });
});

describe("interestsSchema", () => {
  it("accepts known categories", () => {
    expect(parseWith(interestsSchema, ["cs.AI", "cs.LG"])).toEqual(["cs.AI", "cs.LG"]);
  });

  it("rejects an unknown category", () => {
    expect(() => parseWith(interestsSchema, ["not.a.cat"])).toThrow(/Unknown/);
  });
});

describe("analyzeBodySchema", () => {
  it("returns a structured error for a missing id", () => {
    const result = parseJsonBody(analyzeBodySchema, {});
    expect(result.ok).toBe(false);
  });
});

describe("chatBodySchema", () => {
  const message = {
    id: "msg_1",
    role: "user" as const,
    parts: [{ type: "text", text: "hi" }],
  };

  it("caps the message list", () => {
    const messages = Array.from({ length: CHAT_MAX_MESSAGES + 1 }, (_, index) => ({
      ...message,
      id: `msg_${index}`,
    }));
    const result = parseJsonBody(chatBodySchema, { arxivId: "1706.03762", messages });
    expect(result).toEqual({ ok: false, error: "Too many chat messages" });
  });

  it("accepts a small payload", () => {
    const result = parseJsonBody(chatBodySchema, {
      arxivId: "1706.03762",
      messages: [message],
    });
    expect(result.ok).toBe(true);
  });

  it("rejects a message with no parts", () => {
    const result = parseJsonBody(chatBodySchema, {
      arxivId: "1706.03762",
      messages: [{ id: "msg_1", role: "user" }],
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a message with an unknown role", () => {
    const result = parseJsonBody(chatBodySchema, {
      arxivId: "1706.03762",
      messages: [{ id: "msg_1", role: "moderator", parts: [{ type: "text", text: "hi" }] }],
    });
    expect(result.ok).toBe(false);
  });
});
