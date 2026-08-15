export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function actionErrorMessage(error: unknown, fallback: string) {
  return error instanceof ActionError ? error.message : fallback;
}

/** Catch ActionError inside a Server Action and return it as data — thrown Errors are redacted on the client. */
export async function asAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    if (error instanceof ActionError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}

export function isActionFailure(result: unknown): result is { ok: false; error: string } {
  return (
    typeof result === "object" &&
    result !== null &&
    "ok" in result &&
    result.ok === false &&
    "error" in result &&
    typeof result.error === "string"
  );
}

export function isActionSuccess<T>(result: unknown): result is { ok: true; data: T } {
  return (
    typeof result === "object" &&
    result !== null &&
    "ok" in result &&
    result.ok === true &&
    "data" in result
  );
}
