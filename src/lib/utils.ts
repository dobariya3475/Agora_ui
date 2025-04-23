import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const getUserInitials = (userName: string) => {
  const words = userName.split(' ');
  return words.slice(0, 2).map(word => word[0].toUpperCase()).join('');
};