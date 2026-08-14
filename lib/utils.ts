import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Pick a random element. Impure by design, so call it only from request-scoped
 * server code that has already awaited `connection()` — never during a render
 * that React may repeat.
 */
export function sample<T>(items: readonly T[]): T | undefined {
  if (!items.length) return undefined
  return items[Math.floor(Math.random() * items.length)]
}
