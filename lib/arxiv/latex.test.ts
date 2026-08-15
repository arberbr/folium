import { describe, expect, it } from "vitest";
import { hasLatex, splitMath, toPlainText } from "./latex";

describe("toPlainText", () => {
  it("maps symbols and strips math delimiters", () => {
    expect(toPlainText(String.raw`Lyman-$\alpha$ forest`)).toBe("Lyman-α forest");
  });

  it("turns frac into a readable ratio", () => {
    expect(toPlainText(String.raw`$\frac{1}{2}$`)).toBe("(1/2)");
  });
});

describe("splitMath", () => {
  it("splits inline math from surrounding text", () => {
    const segments = splitMath(String.raw`Hello $\alpha$ world`);
    expect(segments).toEqual([
      { type: "text", value: "Hello " },
      { type: "math", value: String.raw`\alpha`, display: false },
      { type: "text", value: " world" },
    ]);
  });

  it("treats an unmatched dollar as literal", () => {
    expect(splitMath("costs $5")).toEqual([{ type: "text", value: "costs $5" }]);
  });
});

describe("hasLatex", () => {
  it("detects dollars and backslashes", () => {
    expect(hasLatex("plain")).toBe(false);
    expect(hasLatex(String.raw`$\alpha$`)).toBe(true);
  });
});
