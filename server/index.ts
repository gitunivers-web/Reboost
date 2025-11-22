import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import cors from "cors";
import { registerRoutes } from "./routes";
import ConnectPgSimple from "connect-pg-simple";
import pkg from "pg";
const { Pool } = pkg;

function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();

app.set("trust proxy", 1);

declare module 'express-session' {
  interface SessionData {
    userId: string;
    userRole?: string;
    csrfToken?: string;
  }
}

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

if (process.env.NODE_ENV === 'production' && (!process.env.SESSION_SECRET || !process.env.DATABASE_URL)) {
  console.error('FATAL: Missing required environment variables (SESSION_SECRET or DATABASE_URL)');
  process.exit(1);
}

if (!process.env.SESSION_SECRET) {
  console.warn('WARNING: Using default SESSION_SECRET. Set SESSION_SECRET environment variable for production.');
}

// Cookie domain configuration
// IMPORTANT: Set COOKIE_DOMAIN in production to match your domain
// Examples:
//   - '.altusfinancesgroup.com' (shares cookies between www and api subdomains)
//   - '.altusfinancesgroup.com' (with 's')
//   - undefined (same domain only - safest option)
// 
// If you use multiple domains (with/without 's'), leave COOKIE_DOMAIN undefined
// and ensure frontend + API are on the exact same domain
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// For cross-domain cookies (frontend and API on different subdomains)
// we MUST use sameSite: 'none' in production
const SAME_SITE_POLICY = IS_PRODUCTION ? 'none' : 'lax';

console.log('='.repeat(60));
console.log(`[CONFIG] Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`[CONFIG] Cookie Domain: ${COOKIE_DOMAIN || 'undefined (same domain only)'}`);
console.log(`[CONFIG] Cookie SameSite: ${SAME_SITE_POLICY}`);
console.log(`[CONFIG] Cookie Secure: ${IS_PRODUCTION}`);
console.log(`[CONFIG] CORS Allowed Origins: ${IS_PRODUCTION ? 'production domains' : 'localhost'}`);
console.log(`[CONFIG] Frontend URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
console.log(`[CONFIG] Trust Proxy: enabled`);
console.log('='.repeat(60));

// Parse allowed Vercel domains from environment variable (comma-separated)
const vercelDomains = process.env.VERCEL_DOMAINS 
  ? process.env.VERCEL_DOMAINS.split(',').map(d => d.trim())
  : [];

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://altusfinancesgroup.com',
      'https://www.altusfinancesgroup.com',
      process.env.FRONTEND_URL,
      ...vercelDomains
    ].filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else if (!origin) {
      callback(null, true);
    } else if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`[CORS ERROR] ❌ Origin rejected: ${origin}`);
      console.error(`[CORS ERROR] Allowed origins: ${JSON.stringify(allowedOrigins)}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: process.env.NODE_ENV === 'production' 
        ? ["'self'"]
        : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: process.env.NODE_ENV === 'production'
        ? ["'self'", "https://fonts.googleapis.com"]
        : ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: process.env.NODE_ENV === 'production'
        ? ["'self'", ...allowedOrigins.filter((origin): origin is string => origin !== undefined)]
        : ["'self'"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },
  noSniff: true,
  xssFilter: true,
}));

const PgSession = ConnectPgSimple(session);
const sessionStore = process.env.DATABASE_URL 
  ? new PgSession({
      pool: new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? true : false,
      }),
      tableName: 'user_sessions',
      createTableIfMissing: true,
    })
  : undefined;

if (!sessionStore && process.env.NODE_ENV === 'production') {
  console.error('FATAL: DATABASE_URL must be set for session storage in production');
  process.exit(1);
}

const sessionMiddleware = session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'altus-group-secret-key-dev-only',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: IS_PRODUCTION,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    // CRITICAL: Use 'none' in production for cross-domain cookies
    // Frontend (altusfinancesgroup.com) and API (api.altusfinancesgroup.com) are different origins
    // 'none' requires secure: true (HTTPS only)
    sameSite: SAME_SITE_POLICY,
    domain: COOKIE_DOMAIN,
    signed: true,
  },
  name: 'sessionId',
});

app.use(sessionMiddleware);

app.use((req, res, next) => {
  // Enhanced debug logs for cross-domain session issues
  if (process.env.NODE_ENV === 'production' || process.env.DEBUG_SESSIONS === 'true') {
    const isApiRequest = req.path.startsWith('/api');
    const hasSession = !!req.session?.id;
    const isAuthenticated = !!req.session?.userId;
    
    if (isApiRequest && (!hasSession || !isAuthenticated)) {
      console.log('=== [SESSION DEBUG] ===');
      console.log(`[SESSION] ${req.method} ${req.path}`);
      console.log(`[SESSION] Origin: ${req.headers.origin || 'NO ORIGIN'}`);
      console.log(`[SESSION] Referer: ${req.headers.referer || 'NO REFERER'}`);
      console.log(`[SESSION] Cookie Header: ${req.headers.cookie ? 'PRESENT' : 'MISSING'}`);
      if (req.headers.cookie) {
        const hasSessionCookie = req.headers.cookie.includes('sessionId');
        console.log(`[SESSION] sessionId Cookie: ${hasSessionCookie ? 'PRESENT' : 'MISSING'}`);
      }
      console.log(`[SESSION] Session Exists: ${hasSession ? 'YES' : 'NO'}`);
      console.log(`[SESSION] Authenticated: ${isAuthenticated ? 'YES' : 'NO'}`);
      console.log(`[SESSION] CSRF Token Header: ${req.headers['x-csrf-token'] ? 'PRESENT' : 'MISSING'}`);
      console.log('======================');
    }
  }
  next();
});

app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse && process.env.NODE_ENV !== 'production') {
        const safeResponse = { ...capturedJsonResponse };
        delete safeResponse.password;
        delete safeResponse.verificationToken;
        delete safeResponse.sessionId;
        logLine += ` :: ${JSON.stringify(safeResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Health check endpoint for Render (placed BEFORE all routes)
app.get('/healthz', (req, res) => {
  res.status(200).send("OK");
});

(async () => {
  const server = await registerRoutes(app, sessionMiddleware);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(`[ERROR] ${req.method} ${req.path} - Status: ${status}`);
    console.error(`[ERROR] Message: ${message}`);
    console.error(`[ERROR] Origin: ${req.headers.origin || 'NO ORIGIN'}`);
    if (err.stack && process.env.NODE_ENV === 'production') {
      console.error(`[ERROR] Stack: ${err.stack.split('\n').slice(0, 3).join('\n')}`);
    }

    res.status(status).json({ message });
    throw err;
  });

  app.get("/health", (req, res) => {
    const checks = {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: sessionStore ? 'connected' : 'not_configured',
      session: {
        configured: !!sessionStore,
        cookieDomain: COOKIE_DOMAIN || 'none',
        secure: IS_PRODUCTION,
        sameSite: IS_PRODUCTION ? 'none' : 'lax',
      },
      cors: {
        allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : ['development-mode'],
        frontendUrl: process.env.FRONTEND_URL || 'not_set',
      }
    };

    res.status(200).json(checks);
  });

  app.get("/api/session-check", (req, res) => {
    const hasSession = !!req.session?.id;
    const isAuthenticated = !!req.session?.userId;
    
    res.json({
      hasSession,
      isAuthenticated,
      sessionId: hasSession ? req.session!.id.substring(0, 8) + '...' : null,
      cookiesPresent: !!req.headers.cookie,
      origin: req.headers.origin || 'no-origin',
      timestamp: new Date().toISOString(),
    });
  });

  // Comprehensive diagnostic endpoint for cross-domain session debugging
  app.get("/api/debug/session-diagnostic", (req, res) => {
    const diagnostic = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      
      // Request information
      request: {
        method: req.method,
        path: req.path,
        origin: req.headers.origin || 'NO ORIGIN',
        referer: req.headers.referer || 'NO REFERER',
        host: req.headers.host || 'NO HOST',
        'user-agent': req.headers['user-agent']?.substring(0, 50) + '...' || 'NO USER AGENT',
      },
      
      // Cookie information
      cookies: {
        headerPresent: !!req.headers.cookie,
        cookieCount: req.headers.cookie ? req.headers.cookie.split(';').length : 0,
        hasSessionIdCookie: req.headers.cookie?.includes('sessionId') || false,
        rawCookieHeader: process.env.NODE_ENV === 'production' ? 'HIDDEN' : req.headers.cookie || 'NO COOKIES',
      },
      
      // Session information
      session: {
        exists: !!req.session,
        hasId: !!req.session?.id,
        sessionIdPreview: req.session?.id ? req.session.id.substring(0, 8) + '...' : null,
        isAuthenticated: !!req.session?.userId,
        userId: req.session?.userId || null,
        userRole: req.session?.userRole || null,
        hasCsrfToken: !!req.session?.csrfToken,
      },
      
      // Server configuration
      serverConfig: {
        cookieDomain: COOKIE_DOMAIN || 'NOT SET (same-domain only)',
        cookieSecure: IS_PRODUCTION,
        cookieSameSite: SAME_SITE_POLICY,
        sessionStore: sessionStore ? 'PostgreSQL' : 'Memory (development only)',
        trustProxy: app.get('trust proxy') || false,
      },
      
      // CORS configuration
      cors: {
        allowedOrigins: allowedOrigins,
        currentOriginAllowed: !req.headers.origin || allowedOrigins.includes(req.headers.origin),
        frontendUrl: process.env.FRONTEND_URL || 'NOT SET',
      },
      
      // Headers sent by client
      relevantHeaders: {
        'x-csrf-token': req.headers['x-csrf-token'] ? 'PRESENT' : 'MISSING',
        'content-type': req.headers['content-type'] || 'NOT SET',
        'accept': req.headers['accept']?.substring(0, 50) || 'NOT SET',
      },
      
      // Diagnostic recommendations
      recommendations: [] as string[],
    };
    
    // Generate recommendations
    if (!diagnostic.cookies.hasSessionIdCookie) {
      diagnostic.recommendations.push('Cookie "sessionId" not found. Browser may be blocking cross-domain cookies.');
    }
    if (!diagnostic.session.exists || !diagnostic.session.hasId) {
      diagnostic.recommendations.push('Session not established. Check if cookies are being sent from frontend.');
    }
    if (diagnostic.request.origin && !diagnostic.cors.currentOriginAllowed) {
      diagnostic.recommendations.push(`Origin "${diagnostic.request.origin}" is not in allowed origins list.`);
    }
    if (IS_PRODUCTION && !COOKIE_DOMAIN) {
      diagnostic.recommendations.push('COOKIE_DOMAIN not set in production. Cross-domain cookies will not work.');
    }
    if (IS_PRODUCTION && SAME_SITE_POLICY !== 'none') {
      diagnostic.recommendations.push('SameSite should be "none" in production for cross-domain cookies.');
    }
    if (!diagnostic.cookies.headerPresent) {
      diagnostic.recommendations.push('No cookies sent with request. Check if frontend is using credentials: "include".');
    }
    
    res.json(diagnostic);
  });

  // Only setup Vite in development (local dev server)
  // In production, backend serves API only. Frontend is deployed separately on Vercel.
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  }

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  server.listen(port, "0.0.0.0", () => {
    log(`✅ Backend API server listening on port ${port}`);
    log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`🗄️ Database: ${process.env.DATABASE_URL ? 'Connected' : 'No DATABASE_URL set'}`);
    
    if (process.env.NODE_ENV === 'production') {
      console.log(`[CONFIG] FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
      console.log(`[CONFIG] Allowed Origins: ${JSON.stringify(allowedOrigins)}`);
      console.log(`[CONFIG] Session Cookie Domain: ${COOKIE_DOMAIN}`);
      console.log(`[CONFIG] Session Cookie Secure: ${IS_PRODUCTION}`);
      console.log(`[CONFIG] Session Cookie SameSite: ${IS_PRODUCTION ? 'none' : 'lax'}`);
    }
    
    const startOTPCleanup = async () => {
      const { cleanupExpiredOTPs } = await import("./services/otp");
      setInterval(async () => {
        try {
          await cleanupExpiredOTPs();
        } catch (error) {
          console.error('[OTP CLEANUP] Error:', error);
        }
      }, 60 * 60 * 1000);
      
      setTimeout(() => cleanupExpiredOTPs().catch(console.error), 5000);
    };
    
    startOTPCleanup();
  });
})();
