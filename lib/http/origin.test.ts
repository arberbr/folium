import { describe, expect, it } from "vitest";
import { originFromForwarded } from "./origin";

describe("originFromForwarded", () => {
  it("builds a host + protocol origin", () => {
    expect(originFromForwarded({ host: "arxivdesk.example", protocol: "https" })).toBe(
      "https://arxivdesk.example",
    );
  });

  it("rejects a host with a path or whitespace", () => {
    expect(originFromForwarded({ host: "evil.test/phish", protocol: "https" })).toBe("");
    expect(originFromForwarded({ host: "evil test", protocol: "https" })).toBe("");
  });
});
