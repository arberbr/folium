"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export function useServerAction() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run<T>(options: {
    action: () => Promise<T>;
    success?: string | ((result: T) => string);
    error: string;
    refresh?: boolean;
    onSuccess?: (result: T) => void;
    onError?: () => void;
  }) {
    startTransition(async () => {
      try {
        const result = await options.action();
        const message =
          typeof options.success === "function" ? options.success(result) : options.success;
        if (message) toast.success(message);
        options.onSuccess?.(result);
        if (options.refresh !== false) router.refresh();
      } catch {
        options.onError?.();
        toast.error(options.error);
      }
    });
  }

  return { pending, run };
}
