import { describe, expect, it } from "vitest";
import { ActionError } from "./errors";
import {
  arxivIdSchema,
  collectionNameSchema,
  interestsSchema,
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
