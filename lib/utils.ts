import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Optimizes a Cloudinary URL by adding automatic format and quality parameters
 * @param url - The original Cloudinary URL
 * @returns The optimized URL with f_auto,q_auto parameters
 */
export function optimizeCloudinaryUrl(url: string): string {
  return url.replace('/upload/v', '/upload/f_auto,q_auto/v')
}
