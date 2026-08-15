import { describe, expect, it } from "vitest";
import { ActionError, actionErrorMessage, asAction, isActionFailure } from "./errors";

describe("actionErrorMessage", () => {
  it("surfaces an ActionError so the reader sees the validation text", () => {
    expect(
      actionErrorMessage(new ActionError("That is not a valid arXiv id"), "Could not save"),
    ).toBe("That is not a valid arXiv id");
  });

  it("keeps the fallback for unexpected failures instead of leaking internals", () => {
    expect(actionErrorMessage(new Error("SQLITE_BUSY"), "Could not save")).toBe("Could not save");
    expect(actionErrorMessage("nope", "Could not save")).toBe("Could not save");
  });
});

describe("asAction", () => {
  it("returns the ActionError message as data so the client toast can show it", async () => {
    await expect(
      asAction(async () => {
        throw new ActionError("That is not a valid arXiv id");
      }),
    ).resolves.toEqual({ ok: false, error: "That is not a valid arXiv id" });
  });

  it("rethrows unexpected errors so Next can redact them", async () => {
    await expect(
      asAction(async () => {
        throw new Error("SQLITE_BUSY");
      }),
    ).rejects.toThrow("SQLITE_BUSY");
  });

  it("wraps a successful value", async () => {
    await expect(asAction(async () => ({ token: "abc" }))).resolves.toEqual({
      ok: true,
      data: { token: "abc" },
    });
  });
});

describe("isActionFailure", () => {
  it("detects a failed action envelope", () => {
    expect(isActionFailure({ ok: false, error: "Could not save" })).toBe(true);
    expect(isActionFailure({ ok: true, data: 1 })).toBe(false);
    expect(isActionFailure({ token: "abc" })).toBe(false);
  });
});
