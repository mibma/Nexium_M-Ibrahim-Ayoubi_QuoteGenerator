import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
// src/lib/utils.ts
export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');

}
