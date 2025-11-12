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

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || (process.env.NODE_ENV === 'production' ? '.altusfinancegroup.com' : undefined);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

if (!IS_PRODUCTION) {
  console.log('='.repeat(60));
  console.log(`[CONFIG] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[CONFIG] Cookie Domain: ${COOKIE_DOMAIN || 'none (localhost)'}`);
  console.log(`[CONFIG] Cookie SameSite: ${IS_PRODUCTION ? 'none' : 'lax'}`);
  console.log(`[CONFIG] Cookie Secure: ${IS_PRODUCTION}`);
  console.log(`[CONFIG] CORS Allowed Origins: ${IS_PRODUCTION ? 'production domains' : 'localhost'}`);
  console.log(`[CONFIG] Frontend URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
  console.log(`[CONFIG] Trust Proxy: enabled`);
  console.log('='.repeat(60));
}

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://altusfinancegroup.com',
      'https://www.altusfinancegroup.com',
      process.env.FRONTEND_URL
    ].filter(Boolean)
  : ['http://localhost:5000', 'http://localhost:5173', 'http://127.0.0.1:5000'];

app.use(cors({
  origin: (origin, callback) => {
    if (process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[CORS ERROR] ❌ Origin rejected: ${origin}`);
        console.error(`[CORS ERROR] Allowed origins: ${JSON.stringify(allowedOrigins)}`);
      }
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
      connectSrc: ["'self'"],
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

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'altus-group-secret-key-dev-only',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: IS_PRODUCTION,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: IS_PRODUCTION ? 'none' : 'lax',
    domain: COOKIE_DOMAIN,
    signed: true,
  },
  name: 'sessionId',
}));

app.use((req, res, next) => {
  // Debug logs disabled to reduce console noise
  // if (process.env.NODE_ENV === 'development') {
  //   console.log(`[REQUEST DEBUG] ${req.method} ${req.path}`);
  //   console.log(`[REQUEST DEBUG] Origin: ${req.headers.origin || 'NO ORIGIN'}`);
  //   console.log(`[REQUEST DEBUG] Cookie Header: ${req.headers.cookie ? 'PRESENT' : 'MISSING'}`);
  //   console.log(`[REQUEST DEBUG] Session Exists: ${req.session?.id ? 'YES' : 'NO'}`);
  //   console.log(`[REQUEST DEBUG] Authenticated: ${req.session?.userId ? 'YES' : 'NO'}`);
  //   console.log(`[REQUEST DEBUG] CSRF Token: ${req.headers['x-csrf-token'] ? 'present' : 'missing'}`);
  // }
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

(async () => {
  const server = await registerRoutes(app);

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

  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    const { serveStatic } = await import("./vite");
    serveStatic(app);
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
