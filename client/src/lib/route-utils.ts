export function isProtectedRoute(pathname: string): boolean {
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/auth' ||
                     pathname.startsWith('/verify') || pathname.startsWith('/forgot-password') ||
                     pathname.startsWith('/reset-password');

  const publicPages = ['/', '/about', '/how-it-works', '/products', '/contact', '/resources', '/terms', '/privacy', '/transfer-demo', '/diagnostic', '/expertise', '/progress-mock', '/banking-mock'];
  
  // Normalize pathname: remove query parameters first, then trailing slashes, default to '/' if empty
  const normalizedPath = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  
  // Allow public loan detail pages (/loans/pret-personnel, etc.) but protect dashboard routes (/loans/new)
  const isPublicLoanPage = normalizedPath.startsWith('/loans/') && normalizedPath !== '/loans/new';
  const isPublicPage = publicPages.includes(normalizedPath) || isPublicLoanPage;
  
  return !isAuthPage && !isPublicPage;
}
