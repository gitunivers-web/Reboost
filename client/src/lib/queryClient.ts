import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { useLanguage } from "./i18n";

export class ApiError extends Error {
  code?: string;
  details?: Record<string, any>;
  
  constructor(message: string, code?: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

function getErrorMessage(status: number): string {
  const lang = useLanguage.getState?.().language || 'fr';
  const messages: Record<string, Record<number, string>> = {
    fr: {
      401: 'Votre session a expiré. Veuillez vous reconnecter.',
      403: 'Accès refusé.',
      404: 'Ressource non trouvée.',
      500: 'Erreur serveur. Veuillez réessayer.',
    },
    en: {
      401: 'Your session has expired. Please log in again.',
      403: 'Access denied.',
      404: 'Resource not found.',
      500: 'Server error. Please try again.',
    },
    es: {
      401: 'Su sesión ha expirado. Por favor, vuelva a iniciar sesión.',
      403: 'Acceso denegado.',
      404: 'Recurso no encontrado.',
      500: 'Error del servidor. Inténtelo de nuevo.',
    },
    pt: {
      401: 'Sua sessão expirou. Por favor, faça login novamente.',
      403: 'Acesso negado.',
      404: 'Recurso não encontrado.',
      500: 'Erro do servidor. Tente novamente.',
    },
    it: {
      401: 'La tua sessione è scaduta. Per favore, accedi di nuovo.',
      403: 'Accesso negato.',
      404: 'Risorsa non trovata.',
      500: 'Errore del server. Riprova.',
    },
    de: {
      401: 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.',
      403: 'Zugriff verweigert.',
      404: 'Ressource nicht gefunden.',
      500: 'Serverfehler. Bitte versuchen Sie es erneut.',
    },
    nl: {
      401: 'Uw sessie is verlopen. Log alstublieft opnieuw in.',
      403: 'Toegang geweigerd.',
      404: 'Bron niet gevonden.',
      500: 'Serverfout. Probeer het opnieuw.',
    },
  };
  return messages[lang]?.[status] || messages['en']?.[status] || 'An error occurred';
}

// API URL configuration
// Production: Use the dedicated API subdomain (https://api.solventisgroup.org)
// Development (Replit/localhost): Use empty string to proxy via Vite to same port
const API_BASE_URL = 
  typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('replit.dev')
  )
    ? '' 
    : 'https://api.solventisgroup.org';

export function getApiUrl(path: string): string {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return `${API_BASE_URL}${path}`;
}

let csrfToken: string | null = null;
let sessionCheckInterval: NodeJS.Timeout | null = null;

export function clearCsrfToken() {
  csrfToken = null;
}

async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  
  try {
    const res = await fetch(getApiUrl('/api/csrf-token'), {
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      csrfToken = data.csrfToken;
      return csrfToken!;
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
  return '';
}

export async function preloadCsrfToken(): Promise<void> {
  if (!csrfToken) {
    await getCsrfToken();
  }
}

function handleAuthError(res: Response, errorMessage?: string) {
  clearCsrfToken();
  
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }
  
  const currentPath = window.location.pathname;
  const isAuthPage = currentPath === '/login' || currentPath === '/signup' || currentPath === '/auth' ||
                     currentPath.startsWith('/verify') || currentPath.startsWith('/forgot-password') ||
                     currentPath.startsWith('/reset-password');
  
  const publicPages = ['/', '/about', '/how-it-works', '/products', '/contact', '/resources', '/terms', '/privacy', '/transfer-demo', '/diagnostic', '/expertise'];
  
  // Normalize pathname: remove query parameters first, then trailing slashes, default to '/' if empty
  const normalizedPath = currentPath.split('?')[0].replace(/\/+$/, '') || '/';
  
  // Allow public loan detail pages (/loans/pret-personnel, etc.) but protect dashboard routes (/loans/new)
  const isPublicLoanPage = normalizedPath.startsWith('/loans/') && normalizedPath !== '/loans/new';
  const isPublicPage = publicPages.includes(normalizedPath) || isPublicLoanPage;
  
  if (!isAuthPage && !isPublicPage) {
    const message = errorMessage || getErrorMessage(res.status);
    
    sessionStorage.setItem('auth_redirect_message', message);
    sessionStorage.setItem('auth_redirect_from', currentPath);
    
    window.location.href = '/login';
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = {};
      }
      
      const errorMessage = errorData?.error || '';
      handleAuthError(res, errorMessage);
      throw new ApiError(errorMessage || getErrorMessage(res.status), errorData?.code, errorData?.details);
    }
    
    let errorData;
    try {
      errorData = await res.json();
      if (errorData?.error) {
        throw new ApiError(errorData.error, errorData?.code, errorData?.details);
      }
    } catch (e) {
      if (e instanceof ApiError) {
        throw e;
      }
      if (e instanceof Error && e.message !== '') {
        throw e;
      }
    }
    
    throw new ApiError(getErrorMessage(res.status));
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  // Only add Content-Type for JSON data (not for FormData or other native bodies)
  const isFormData = data instanceof FormData;
  if (data && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (method !== 'GET' && method !== 'HEAD') {
    const token = await getCsrfToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
  }

  const res = await fetch(getApiUrl(url), {
    method,
    headers,
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;

    const res = await fetch(getApiUrl(url), {
      credentials: "include",
    });

    if (res.status === 401 || res.status === 403) {
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }
      
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = {};
      }
      
      const errorMessage = errorData?.error || '';
      handleAuthError(res, errorMessage);
      throw new Error(errorMessage || getErrorMessage(res.status));
    }

    await throwIfResNotOk(res);
    const json = await res.json();
    
    // Si la réponse utilise le nouveau format standardisé {success, data}, extraire data
    if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
      return json.data;
    }
    
    // Sinon, retourner la réponse complète (ancien format)
    return json;
  };

function shouldRetry(failureCount: number, error: Error): boolean {
  if (failureCount >= 3) return false;
  
  const errorMessage = error.message.toLowerCase();
  if (errorMessage.includes('401') || errorMessage.includes('403') || 
      errorMessage.includes('authentification')) {
    return false;
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || 
      errorMessage.includes('timeout') || errorMessage.includes('502') || 
      errorMessage.includes('503') || errorMessage.includes('504')) {
    return true;
  }
  
  return false;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: shouldRetry,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    },
    mutations: {
      retry: shouldRetry,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    },
  },
});
