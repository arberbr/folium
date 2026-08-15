import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "./format";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Attention Is All You Need")).toBe("attention-is-all-you-need");
  });

  it("falls back when nothing remains", () => {
    expect(slugify("!!!")).toBe("collection");
  });
});

describe("uniqueSlug", () => {
  it("returns the base slug when it is free", () => {
    expect(uniqueSlug("Transformers", new Set())).toBe("transformers");
  });

  it("appends -2, -3 against taken names", () => {
    const taken = new Set(["transformers", "transformers-2"]);
    expect(uniqueSlug("Transformers", taken)).toBe("transformers-3");
  });
});
