"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { actionErrorMessage, isActionFailure, isActionSuccess } from "@/lib/errors";

type ActionData<T> = T extends { ok: true; data: infer D }
  ? D
  : T extends { ok: false; error: string }
    ? never
    : T;

export function useServerAction() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run<T>(options: {
    action: () => Promise<T>;
    success?: string | ((result: ActionData<T>) => string);
    error: string;
    refresh?: boolean;
    onSuccess?: (result: ActionData<T>) => void;
    onError?: () => void;
  }) {
    startTransition(async () => {
      try {
        const result = await options.action();
        if (isActionFailure(result)) {
          options.onError?.();
          toast.error(result.error);
          return;
        }
        const data = (
          isActionSuccess<ActionData<T>>(result) ? result.data : result
        ) as ActionData<T>;
        const message =
          typeof options.success === "function" ? options.success(data) : options.success;
        if (message) toast.success(message);
        options.onSuccess?.(data);
        if (options.refresh !== false) router.refresh();
      } catch (error) {
        options.onError?.();
        toast.error(actionErrorMessage(error, options.error));
      }
    });
  }

  return { pending, run };
}
