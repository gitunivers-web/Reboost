import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getApiUrl } from "./queryClient"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFileUrl(fileUrl?: string | null): string | undefined {
  if (!fileUrl) return undefined;
  
  // Already a full URL
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  
  // Extract filename from any path format
  // "/uploads/chat/UUID_filename" -> "UUID_filename"
  // "UUID_filename" -> "UUID_filename"
  const filename = fileUrl.includes('/') ? fileUrl.split('/').pop() : fileUrl;
  
  // ALWAYS use: https://api.solventisgroup.org/api/chat/file/{filename}
  return getApiUrl(`/api/chat/file/${filename}`);
}
