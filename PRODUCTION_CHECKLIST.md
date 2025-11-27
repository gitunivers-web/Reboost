# Production Deployment Checklist

## Frontend (Vercel - altusfinancesgroup.com)

### Environment Variables
Ensure these environment variables are set in Vercel:

```
VITE_API_URL=https://api.altusfinancesgroup.com
VITE_SITE_URL=https://altusfinancesgroup.com
NODE_ENV=production
```

### Build Settings
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist/public`
- Root directory: `.`

### Deployment
- Frontend serves from `altusfinancesgroup.com`
- All API calls automatically route to `https://api.altusfinancesgroup.com/api/...`
- Cookies shared across domains via `.altusfinancesgroup.com` cookie domain

---

## Backend (Render - api.altusfinancesgroup.com)

### Environment Variables (REQUIRED)
Set these secrets in Render environment:

```
NODE_ENV=production
DATABASE_URL=<PostgreSQL connection string>
SESSION_SECRET=<strong random secret>
FRONTEND_URL=https://altusfinancesgroup.com
ADMIN_EMAIL=admin@altusfinancesgroup.com
ADMIN_PASSWORD=<strong password>
BREVO_API_KEY=<from Brevo account>
BREVO_FROM_EMAIL=<verified sender email>
SENTRY_DSN=<optional, for error tracking>
```

### Critical Settings
- Port: 3000 or 5000 (configure in Render)
- Bind address: `0.0.0.0` (already configured)
- CORS Origins: 
  - `https://altusfinancesgroup.com`
  - `https://www.altusfinancesgroup.com`
- Cookie Domain: `.altusfinancesgroup.com` (production)
- Cookie SameSite: `none` (production)
- Cookie Secure: `true` (HTTPS only)

---

## DNS Configuration

### Domain: altusfinancesgroup.com
- Vercel deployment (frontend)
- Set A record and CNAME to Vercel

### Subdomain: api.altusfinancesgroup.com
- Render deployment (backend)
- Set CNAME to Render API endpoint

---

## API URL Routing

### Frontend to Backend Requests:
```
https://altusfinancesgroup.com (user accesses)
↓
Frontend needs to call: https://api.altusfinancesgroup.com/api/...
```

**NOT**: `https://altusfinancesgroup.com/api/...` ❌

### Implementation
- `queryClient.ts` detects production hostname and uses `https://api.altusfinancesgroup.com`
- Socket connections use same URL with fallback
- SEO config respects subdomain structure

---

## Testing Checklist

After deployment:

1. ✅ Login works (test@altus.com / TestPass123!@#)
2. ✅ Dashboard loads with real data
3. ✅ Mobile menu auto-closes after navigation
4. ✅ Notifications poll correctly (2s interval)
5. ✅ Transfers work with currency formatting (2 decimals)
6. ✅ KYC status in English
7. ✅ Dates in French (fr-FR)
8. ✅ All API calls to correct domain
9. ✅ Cookies shared between frontend/api subdomains
10. ✅ Admin panel accessible

---

## Verification Commands

### Check API URL in Frontend:
Visit: `https://altusfinancesgroup.com/diagnostic`

Should show:
- VITE_API_URL: https://api.altusfinancesgroup.com ✅

### Check Backend Configuration:
Backend logs should show:
```
[CONFIG] Cookie Domain: .altusfinancesgroup.com
[CONFIG] Cookie SameSite: none
[CONFIG] Cookie Secure: true
[CONFIG] CORS Allowed Origins: https://altusfinancesgroup.com, https://www.altusfinancesgroup.com
```

---

## Deployment Order

1. ✅ Set environment variables in Render (backend)
2. ✅ Deploy backend on Render (api.altusfinancesgroup.com)
3. ✅ Test backend is accessible
4. ✅ Set environment variables in Vercel (frontend)
5. ✅ Deploy frontend on Vercel (altusfinancesgroup.com)
6. ✅ Run smoke tests

---

## Rollback Plan

If issues occur:
1. Check backend logs on Render
2. Verify DNS resolves correctly
3. Check browser console for API errors
4. Verify all environment variables are set
5. Check firewall/CORS configuration
6. Review cookie configuration
