import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
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

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  console.error('FATAL: SESSION_SECRET environment variable must be set in production');
  process.exit(1);
}

if (!process.env.SESSION_SECRET) {
  console.warn('WARNING: Using default SESSION_SECRET. Set SESSION_SECRET environment variable for production.');
}

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
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'strict',
  },
  name: 'sessionId',
}));

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

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

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Backend API server listening on port ${port}`);
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`Database: ${process.env.DATABASE_URL ? 'Connected' : 'No DATABASE_URL set'}`);
  });
})();
