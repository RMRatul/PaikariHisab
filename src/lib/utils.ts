import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const digits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBengaliNumber(num: number | string) {
  return num.toString().replace(/\d/g, (d) => digits[parseInt(d)]);
}

export function formatPriceBN(num: number) {
  const formatted = num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return toBengaliNumber(formatted);
}
