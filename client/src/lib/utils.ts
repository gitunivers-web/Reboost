import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFileUrl(fileUrl?: string | null): string | undefined {
  if (!fileUrl) return undefined;
  
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  
  // Backend returns full path: "/uploads/chat/[UUID]_[filename]"
  // Serve directly - no need to route through /api/chat/file
  if (fileUrl.startsWith('/uploads/chat/')) {
    return fileUrl;
  }
  
  // Fallback for legacy messages with just filename
  return `/api/chat/file/${fileUrl}`;
}
