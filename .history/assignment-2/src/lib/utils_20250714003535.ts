import { clsx, type ClassValue } from "clsx"
// src/lib/utils.ts
export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');

}
