// Normalize image URLs for all backend APIs
export function normalizeImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  } else if (imageUrl.startsWith('/uploads/')) {
    return `/api/uploads/${imageUrl.replace(/^\/uploads\//, '')}`;
  } else {
    return `https://huggingface.co/datasets/NickMuhigi/livestock-disease-detector/resolve/main/images/${imageUrl.replace(/^\/+/,'')}`;
  }
}
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
