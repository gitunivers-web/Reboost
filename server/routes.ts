import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage, ValidationError } from "./storage";
import { promises as dnsPromises } from "dns";
import { 
  insertLoanSchema, 
  insertTransferSchema, 
  insertUserSchema, 
  transferValidationCodes, 
  type TransferValidationCode,
  getLoanReferenceNumber,
  getOrGenerateLoanReference,
  getTransferReferenceNumber,
  messages,
  users,
  insertChatConversationSchema,
  insertChatMessageSchema,
  type ChatConversation,
  type ChatMessage,
  chatMessages,
} from "@shared/schema";
import { eq, and, sql as sqlDrizzle } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomUUID, randomBytes } from "crypto";
import { sendVerificationEmail, sendWelcomeEmail, sendResetPasswordEmail } from "./email";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileTypeFromFile } from "file-type";
import { db } from "./db";
import { generateAndSendOTP, verifyOTP } from "./services/otp";
import { generateTwoFactorSecret, generateQRCode, verifyTwoFactorToken } from "./services/twoFactor";
import { encryptSecret } from "./services/encryption";
import jwt from "jsonwebtoken";
import { 
  notifyLoanApproved, 
  notifyLoanRejected, 
  notifyLoanFundsAvailable,
  notifyLoanDisbursed, 
  notifyLoanRequest,
  notifyLoanContractGenerated,
  notifyLoanContractSigned,
  notifyTransferInitiated,
  notifyTransferCompleted, 
  notifyCodeIssued,
  notifyAdminMessage,
  notifyAdminsNewKycDocument,
  notifyAdminsNewLoanRequest,
  notifyAdminsNewTransfer,
  notifyAdminsSignedContractReceived,
  createAdminMessageLoanRequest,
  createAdminMessageLoanApproved,
  createAdminMessageLoanRejected,
  createAdminMessageLoanFundsAvailable,
  createAdminMessageLoanContractSigned,
  createAdminMessageTransferCompleted,
  createAdminMessageCodeIssued,
  createAdminMessagePauseCodeIssued
} from "./notification-helper";
import { loanRequestAdminNotification } from "./notification-service";
import cloudinary from "./config/cloudinary";
import { PassThrough } from "stream";
import { generateUploadUrl, generateDownloadUrl, uploadFile } from "./services/supabase-storage";
import DOMPurify from "isomorphic-dompurify";
import { PDFDocument, PDFPage, rgb, StandardFonts } from "pdf-lib";
import { 
  emitLoanUpdate, 
  emitTransferUpdate, 
  emitUserUpdate, 
  emitDashboardUpdate,
  emitNotificationUpdate,
  emitFeeUpdate,
  emitContractUpdate,
  emitAdminDashboardUpdate
} from "./data-socket";
import { enqueueProgressJob } from "./services/progress-worker";
import { getPdfTranslation } from "./pdf-translations";

export async function registerRoutes(app: Express, sessionMiddleware: any): Promise<Server> {
  // SÉCURITÉ: Accès aux fichiers via endpoints protégés uniquement
  // app.use('/uploads', express.static(...)); // ❌ SUPPRIMÉ - Exposition publique dangereuse

  // Socket.IO instance (will be initialized after httpServer is created)
  let io: any;

  // Génère un secret fort pour signer les liens de téléchargement temporaires
  // Régénéré à chaque démarrage du serveur (acceptable car les tokens n'ont qu'une durée de vie de 5 min)
  const DOWNLOAD_SECRET = randomBytes(64).toString('hex');
  const CONTRACTS_DIR = path.join(process.cwd(), 'uploads', 'contracts');

  const generateCSRFToken = (): string => {
    return randomBytes(32).toString('hex');
  };

  const requireCSRF = (req: any, res: any, next: any) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return next();
    }

    // Enhanced session validation with detailed debugging for cross-domain issues
    let debugInfo: any = {};
    if (!req.session || !req.session.csrfToken) {
      // 🔒 Log sensitive data only in development
      debugInfo = {
        hasSession: !!req.session,
        sessionId: req.session?.id,
        path: req.path,
        method: req.method,
        userId: req.session?.userId,
        cookieHeader: req.headers.cookie ? 'PRESENT' : 'MISSING',
        hasSessionIdCookie: req.headers.cookie?.includes('sessionId') || false,
        origin: req.headers.origin,
        host: req.headers.host,
        referer: req.headers.referer,
      };
      if (process.env.NODE_ENV !== 'production') {
        console.error('[CSRF-ERROR] Session invalide ou token CSRF manquant', debugInfo);
      } else {
        console.error('[CSRF-ERROR] Session validation failed');
      }
      
      // More detailed error message for production debugging
      let errorMessage = 'Session invalide. Veuillez vous reconnecter.';
      let diagnosticHint = '';
      
      if (!req.headers.cookie || !req.headers.cookie.includes('sessionId')) {
        diagnosticHint = 'Cookies non reçus par le serveur. Vérifiez la configuration CORS et les cookies cross-domain.';
      } else if (!req.session) {
        diagnosticHint = 'Session non trouvée dans le store. Vérifiez la base de données de sessions.';
      } else if (!req.session.csrfToken) {
        diagnosticHint = 'Token CSRF manquant dans la session. La session pourrait avoir expiré.';
      }
      
      if (diagnosticHint) {
        console.error(`[CSRF-ERROR] Diagnostic: ${diagnosticHint}`);
      }
      
      return res.status(403).json({ 
        error: errorMessage,
        code: 'SESSION_INVALID',
        diagnosticHint: process.env.NODE_ENV === 'production' ? diagnosticHint : undefined,
        details: process.env.NODE_ENV === 'production' ? undefined : debugInfo
      });
    }

    const token = req.headers['x-csrf-token'] || req.body._csrf;
    if (!token || token !== req.session.csrfToken) {
      // 🔒 Log sensitive data only in development
      debugInfo = {
        tokenProvided: !!token,
        tokenMatch: token === req.session.csrfToken,
        path: req.path,
        method: req.method,
        userId: req.session?.userId,
        sessionId: req.session?.id,
        origin: req.headers.origin,
        host: req.headers.host,
        referer: req.headers.referer,
      };
      if (process.env.NODE_ENV !== 'production') {
        console.error('[CSRF-ERROR] Token CSRF invalide', debugInfo);
      } else {
        console.error('[CSRF-ERROR] CSRF token validation failed');
      }
      
      return res.status(403).json({ 
        error: 'Session expirée. Veuillez recharger la page et réessayer.',
        code: 'CSRF_INVALID',
        diagnosticHint: process.env.NODE_ENV === 'production' ? 
          'Token CSRF invalide ou expiré. Veuillez rafraîchir la page.' : undefined,
        details: process.env.NODE_ENV === 'production' ? undefined : debugInfo
      });
    }

    next();
  };

  // CSRF middleware for public routes (login, signup, etc.) - doesn't require existing session
  const requireCSRFPublic = (req: any, res: any, next: any) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return next();
    }

    // For public auth routes, just verify CSRF token was provided
    // We don't require a pre-existing session since these routes CREATE sessions
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    if (!token) {
      return res.status(403).json({ 
        error: 'Token CSRF requis',
        code: 'CSRF_MISSING',
      });
    }

    next();
  };

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Trop de tentatives. Veuillez réessayer dans 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const adminLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 20,
    message: { error: 'Trop de requêtes administratives. Veuillez ralentir.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const transferLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { error: 'Trop de transferts initiés. Veuillez réessayer dans 1 heure.' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.error('[RATE-LIMIT] Limite de transferts dépassée', {
        ip: req.ip,
        userId: req.session?.userId,
        path: req.path,
        timestamp: new Date().toISOString()
      });
      res.status(429).json({ 
        error: 'Trop de transferts initiés. Veuillez réessayer dans 1 heure.' 
      });
    },
  });

  const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: { error: 'Trop d\'uploads. Veuillez réessayer dans 1 heure.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const validationLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: { error: 'Trop de tentatives de validation. Veuillez réessayer dans 5 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const loanLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: 'Trop de demandes de prêt. Veuillez réessayer dans 1 heure.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const generalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: 'Trop de requêtes. Veuillez ralentir.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Language detection endpoint
  app.get("/api/detect-language", generalApiLimiter, async (req, res) => {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                       req.socket.remoteAddress || 
                       '';

      // Country code to language mapping
      const countryToLanguage: Record<string, string> = {
        'PT': 'pt', // Portugal
        'BR': 'pt', // Brazil
        'ES': 'es', // Spain
        'MX': 'es', // Mexico
        'AR': 'es', // Argentina
        'CO': 'es', // Colombia
        'CL': 'es', // Chile
        'PE': 'es', // Peru
        'VE': 'es', // Venezuela
        'EC': 'es', // Ecuador
        'GT': 'es', // Guatemala
        'CU': 'es', // Cuba
        'BO': 'es', // Bolivia
        'DO': 'es', // Dominican Republic
        'HN': 'es', // Honduras
        'PY': 'es', // Paraguay
        'SV': 'es', // El Salvador
        'NI': 'es', // Nicaragua
        'CR': 'es', // Costa Rica
        'PA': 'es', // Panama
        'UY': 'es', // Uruguay
        'FR': 'fr', // France
        'BE': 'fr', // Belgium (partial)
        'CH': 'fr', // Switzerland (partial)
        'CA': 'fr', // Canada (partial)
        'IT': 'it', // Italy
        'DE': 'de', // Germany
        'AT': 'de', // Austria
        'NL': 'nl', // Netherlands
        'GB': 'en', // United Kingdom
        'US': 'en', // United States
        'AU': 'en', // Australia
        'IE': 'en', // Ireland
        'NZ': 'en', // New Zealand
        'ZA': 'en', // South Africa
      };

      // For development/localhost, use a default
      if (!clientIp || clientIp === '::1' || clientIp.startsWith('127.') || clientIp.startsWith('192.168.')) {
        return res.json({ language: 'fr', country: null, source: 'default' });
      }

      // Call FreeIPAPI for geolocation (HTTPS supported, no API key required)
      const response = await fetch(`https://freeipapi.com/api/json/${clientIp}`);
      const data = await response.json();

      if (data.countryCode) {
        const language = countryToLanguage[data.countryCode] || 'en';
        return res.json({ 
          language, 
          country: data.countryName,
          countryCode: data.countryCode,
          source: 'ip-detection' 
        });
      }

      // Fallback to browser language detection
      res.json({ language: 'fr', country: null, source: 'fallback' });
    } catch (error) {
      console.error('Language detection error:', error);
      res.json({ language: 'fr', country: null, source: 'error' });
    }
  });

  const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
  });

  const adminUpdateUserSchema = z.object({
    fullName: z.string().optional(),
    email: z.string().email().optional(),
    status: z.enum(['pending', 'active', 'suspended', 'blocked']).optional(),
    kycStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
    maxLoanAmount: z.string().optional(),
    verificationTier: z.enum(['bronze', 'silver', 'gold']).optional(),
    completedLoansCount: z.coerce.number().int().min(0).optional(),
    defaultedLoansCount: z.coerce.number().int().min(0).optional(),
  }).strict();

  const adminUpdateTransferSchema = z.object({
    status: z.enum(['pending', 'in-progress', 'completed', 'failed', 'suspended']).optional(),
    approvedAt: z.coerce.date().optional(),
  }).strict();

  const adminUpdateSettingSchema = z.object({
    value: z.any(),
  }).strict();

  const adminSendMessageSchema = z.object({
    userId: z.string().min(1),
    transferId: z.string().optional().nullable(),
    subject: z.string().min(1, 'Sujet requis'),
    content: z.string().min(1, 'Contenu requis'),
    severity: z.enum(['info', 'success', 'warning', 'error']).optional(),
  }).strict();

  const adminRejectLoanSchema = z.object({
    reason: z.string().min(1, 'Raison requise'),
  }).strict();

  const adminBorrowingCapacitySchema = z.object({
    maxLoanAmount: z.string().min(1, 'Montant requis'),
  }).strict();

  const adminSuspendUserSchema = z.object({
    until: z.string().datetime('Date invalide'),
    reason: z.string().min(1, 'Raison requise'),
  }).strict();

  const adminBlockUserSchema = z.object({
    reason: z.string().min(1, 'Raison requise'),
  }).strict();

  const adminBlockTransfersSchema = z.object({
    reason: z.string().min(1, 'Raison requise'),
  }).strict();

  const adminIssueCodeSchema = z.object({
    sequence: z.number().int().positive().optional().default(1),
    method: z.enum(['email', 'sms']).optional(),
  }).strict();

  const adminSendNotificationWithFeeSchema = z.object({
    userId: z.string().min(1),
    subject: z.string().min(1, 'Sujet requis'),
    content: z.string().min(1, 'Contenu requis'),
    feeType: z.string().min(1, 'Type de frais requis'),
    feeAmount: z.string().min(1, 'Montant requis'),
    feeReason: z.string().min(1, 'Raison requise'),
  }).strict();

  app.get("/api/csrf-token", (req, res) => {
    if (!req.session.csrfToken) {
      req.session.csrfToken = generateCSRFToken();
    }
    res.json({ csrfToken: req.session.csrfToken });
  });

  const requireAuth = async (req: any, res: any, next: any) => {
    if (!req.session || !req.session.userId) {
      console.error('[AUTH-ERROR] Session ou userId manquant', {
        hasSession: !!req.session,
        hasUserId: !!req.session?.userId,
        path: req.path,
        method: req.method,
        sessionId: req.session?.id
      });
      return res.status(401).json({ error: 'Authentification requise' });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        console.error('[AUTH-ERROR] Utilisateur non trouvé dans la BD', {
          userId: req.session.userId,
          path: req.path,
          sessionId: req.session.id
        });
        req.session.destroy(() => {});
        return res.status(401).json({ error: 'Session invalide' });
      }

      if (user.activeSessionId && user.activeSessionId !== req.session.id) {
        console.warn('[AUTH-ERROR] Session dupliquée détectée', {
          userId: user.id,
          currentSessionId: req.session.id,
          activeSessionId: user.activeSessionId,
          path: req.path
        });
        req.session.destroy(() => {});
        return res.status(401).json({ 
          error: 'Votre compte est connecté sur un autre appareil. Veuillez vous reconnecter.',
          sessionExpired: true
        });
      }

      if (user.status === 'blocked') {
        console.warn('[AUTH-ERROR] Compte bloqué', {
          userId: user.id,
          email: user.email,
          path: req.path
        });
        return res.status(403).json({ 
          error: 'Compte bloqué. Veuillez contacter le support.'
        });
      }

      if (user.status === 'suspended') {
        if (!user.suspendedUntil || new Date() < user.suspendedUntil) {
          console.warn('[AUTH-ERROR] Compte suspendu', {
            userId: user.id,
            email: user.email,
            suspendedUntil: user.suspendedUntil,
            path: req.path
          });
          return res.status(403).json({ 
            error: 'Compte suspendu',
            suspendedUntil: user.suspendedUntil,
            reason: user.suspensionReason
          });
        }
      }

      if (user.status === 'inactive') {
        console.warn('[AUTH-ERROR] Compte inactif', {
          userId: user.id,
          email: user.email,
          path: req.path
        });
        return res.status(403).json({ error: 'Compte inactif' });
      }

      if (!user.emailVerified) {
        console.warn('[AUTH-ERROR] Email non vérifié', {
          userId: user.id,
          email: user.email,
          path: req.path
        });
        return res.status(403).json({ 
          error: 'Email non vérifié. Veuillez vérifier votre email avant de continuer.' 
        });
      }

      next();
    } catch (error) {
      console.error('[AUTH-ERROR] Exception dans requireAuth:', {
        error,
        userId: req.session?.userId,
        path: req.path,
        stack: (error as Error).stack
      });
      res.status(500).json({ error: 'Erreur serveur' });
    }
  };

  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé. Privilèges administrateur requis.' });
    }

    next();
  };

  const calculateInterestRate = async (loanType: string, amount: number): Promise<number> => {
    const rateTiersSetting = await storage.getAdminSetting('interest_rate_tiers');
    if (!rateTiersSetting) {
      if (loanType === 'auto') {
        if (amount < 10000) return 3.9;
        if (amount < 30000) return 2.9;
        return 1.9;
      } else if (loanType === 'mortgage' || loanType === 'commercialProperty') {
        if (amount < 50000) return 4.5;
        if (amount < 200000) return 3.5;
        return 2.5;
      } else if (loanType === 'green') {
        if (amount < 20000) return 2.5;
        if (amount < 50000) return 1.5;
        return 0.5;
      } else if (loanType === 'renovation') {
        if (amount < 20000) return 5.9;
        if (amount < 50000) return 3.9;
        return 2.5;
      } else if (loanType === 'student') {
        if (amount < 10000) return 2.5;
        if (amount < 30000) return 2.0;
        return 1.5;
      } else if (loanType === 'business' || loanType === 'cashFlow' || loanType === 'lineOfCredit') {
        if (amount < 10000) return 7.5;
        if (amount < 50000) return 5.5;
        return 3.5;
      } else if (loanType === 'equipment' || loanType === 'vehicleFleet') {
        if (amount < 20000) return 6.5;
        if (amount < 100000) return 4.9;
        return 3.9;
      } else if (loanType === 'personal') {
        if (amount < 10000) return 6.5;
        if (amount < 30000) return 5.0;
        return 3.5;
      }
      return 4.0;
    }

    const tiers = (rateTiersSetting.settingValue as any)[loanType] || [];
    const tier = tiers.find((t: any) => amount >= t.min && amount < t.max);
    return tier ? tier.rate : 4.0;
  };

  const uploadsDir = path.join(process.cwd(), 'uploads', 'kyc');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const kycStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueName = `${randomUUID()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });

  const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

  const fileFilter = (req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error('Type de fichier non autorisé. Seuls les formats JPEG, PNG, WebP et PDF sont acceptés.'), false);
    }
    
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Type MIME non autorisé.'), false);
    }
    
    cb(null, true);
  };

  const upload = multer({
    storage: kycStorage,
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 1,
    },
    fileFilter: fileFilter,
  });

  const profilePhotoUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 1,
    },
    fileFilter: (req: any, file: any, cb: any) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
      const allowedImageMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      
      if (!allowedImageExtensions.includes(ext)) {
        return cb(new Error('Type de fichier non autorisé. Seules les images JPEG, PNG et WebP sont acceptées.'), false);
      }
      
      if (!allowedImageMimes.includes(file.mimetype)) {
        return cb(new Error('Type MIME non autorisé.'), false);
      }
      
      cb(null, true);
    },
  });

  // Fonction de validation DNS pour les emails
  const validateEmailDomainDNS = async (email: string): Promise<boolean> => {
    try {
      const domain = email.split('@')[1];
      if (!domain) return false;
      
      const mxRecords = await dnsPromises.resolveMx(domain);
      return mxRecords && mxRecords.length > 0;
    } catch (error) {
      // Si la vérification DNS échoue, retourner false
      return false;
    }
  };

  app.post("/api/auth/signup", authLimiter, requireCSRFPublic, async (req, res) => {
    try {
      const signupSchema = z.object({
        email: z.string().email('Email invalide'),
        password: z.string()
          .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
          .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
          .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
          .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
          .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
        fullName: z.string().min(1, 'Nom complet requis'),
        phone: z.string().optional(),
        preferredLanguage: z.enum(['fr', 'en', 'es', 'pt', 'it', 'de', 'nl']).optional(),
        accountType: z.enum(['personal', 'business', 'professional']).optional(),
        companyName: z.string().optional(),
        siret: z.string().optional(),
      });

      const validatedInput = signupSchema.parse(req.body);
      const { email, password, fullName, phone, preferredLanguage, accountType, companyName, siret } = validatedInput;
      
      // VALIDATION DNS: Vérifier que le domaine de l'email existe
      const isValidDomain = await validateEmailDomainDNS(email);
      if (!isValidDomain) {
        return res.status(400).json({ error: 'Le domaine de l\'adresse email n\'existe pas. Veuillez vérifier votre email.' });
      }
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Un compte avec cet email existe déjà. Veuillez vous connecter ou utiliser une autre adresse email.' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 12);
      const verificationToken = randomUUID();
      const verificationTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
      
      const username = email.split('@')[0] + '_' + randomUUID().substring(0, 8);
      
      const userData: any = {
        username,
        password: hashedPassword,
        email,
        fullName,
        phone: phone || null,
        preferredLanguage: preferredLanguage || 'fr',
        accountType: accountType || 'personal',
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry,
        role: 'user',
        status: 'pending',
        kycStatus: 'pending',
      };

      if (accountType === 'business' || accountType === 'professional') {
        userData.companyName = companyName || null;
        userData.siret = siret || null;
      }
      
      const validatedUser = insertUserSchema.parse(userData);
      const user = await storage.createUser(validatedUser);
      
      await sendVerificationEmail(email, fullName, verificationToken, accountType || 'personal', preferredLanguage || 'fr');
      
      res.status(201).json({
        message: 'Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.',
        userId: user.id
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      console.error('Signup error:', error);
      res.status(400).json({ error: error.message || 'Erreur lors de l\'inscription' });
    }
  });

  app.post("/api/auth/login", authLimiter, requireCSRFPublic, async (req, res) => {
    try {
      const validatedInput = loginSchema.parse(req.body);
      const { email, password } = validatedInput;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }
      
      if (!user.emailVerified) {
        return res.status(403).json({ 
          error: 'Veuillez vérifier votre email avant de vous connecter',
          needsVerification: true
        });
      }

      // Vérifier si le compte est bloqué
      if (user.status === 'blocked') {
        console.warn('[LOGIN-ERROR] Compte bloqué', {
          userId: user.id,
          email: user.email,
        });
        return res.status(403).json({ 
          error: 'Votre compte a été bloqué. Veuillez contacter le support.',
          errorCode: 'ACCOUNT_BLOCKED'
        });
      }

      // Vérifier si le compte est suspendu
      if (user.status === 'suspended') {
        if (!user.suspendedUntil || new Date() < user.suspendedUntil) {
          console.warn('[LOGIN-ERROR] Compte suspendu', {
            userId: user.id,
            email: user.email,
            suspendedUntil: user.suspendedUntil,
          });
          return res.status(403).json({ 
            error: 'Votre compte a été suspendu. Veuillez contacter le support.',
            errorCode: 'ACCOUNT_SUSPENDED',
            suspendedUntil: user.suspendedUntil,
            reason: user.suspensionReason
          });
        }
      }

      // Vérifier si le compte est inactif
      if (user.status === 'inactive') {
        console.warn('[LOGIN-ERROR] Compte inactif', {
          userId: user.id,
          email: user.email,
        });
        return res.status(403).json({ 
          error: 'Votre compte est inactif. Veuillez contacter le support.',
          errorCode: 'ACCOUNT_INACTIVE'
        });
      }

      // 2FA optionnel pour tous les utilisateurs (admins et utilisateurs normaux)
      if (user.twoFactorEnabled) {
        return res.json({
          requires2FA: true,
          userId: user.id
        });
      }

      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.csrfToken = generateCSRFToken();

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      await storage.updateUserSessionId(user.id, req.session.id);
      
      const { password: _, verificationToken: __, twoFactorSecret: ___, ...userWithoutSensitive } = user;
      
      await storage.createAuditLog({
        actorId: user.id,
        actorRole: user.role,
        action: 'user_login',
        entityType: 'user',
        entityId: user.id,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });
      
      if (process.env.NODE_ENV === 'production') {
        const cookieDomain = process.env.COOKIE_DOMAIN || '.altusfinancesgroup.com';
        console.log(`[AUTH SUCCESS] User authenticated successfully`);
        console.log(`[AUTH SUCCESS] Session created and will be sent as cookie`);
        console.log(`[AUTH SUCCESS] Cookie domain: ${cookieDomain}`);
      }
      
      res.json({
        message: 'Connexion réussie',
        user: userWithoutSensitive
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      console.error('Login error:', error);
      res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
  });

  const verifyOtpSchema = z.object({
    userId: z.string(),
    code: z.string().length(6, 'Le code doit contenir 6 chiffres')
  });

  app.post("/api/auth/verify-otp", authLimiter, requireCSRFPublic, async (req, res) => {
    try {
      const validatedInput = verifyOtpSchema.parse(req.body);
      const { userId, code } = validatedInput;
      
      const isValid = await verifyOTP(userId, code);
      
      if (!isValid) {
        return res.status(401).json({ error: 'Code invalide ou expiré' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.csrfToken = generateCSRFToken();

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      await storage.updateUserSessionId(user.id, req.session.id);
      
      const { password: _, verificationToken: __, ...userWithoutSensitive } = user;
      
      await storage.createAuditLog({
        actorId: user.id,
        actorRole: user.role,
        action: 'user_login',
        entityType: 'user',
        entityId: user.id,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });
      
      if (process.env.NODE_ENV === 'production') {
        const cookieDomain = process.env.COOKIE_DOMAIN || '.altusfinancesgroup.com';
        console.log(`[AUTH SUCCESS] User authenticated successfully`);
        console.log(`[AUTH SUCCESS] Session created and will be sent as cookie`);
        console.log(`[AUTH SUCCESS] Cookie domain: ${cookieDomain}`);
      }
      
      res.json({
        message: 'Connexion réussie',
        user: userWithoutSensitive
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      console.error('OTP verification error:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification du code' });
    }
  });

  app.post("/api/2fa/setup", requireAuth, requireCSRF, async (req, res) => {
    try {
      const userId = req.session.userId!;
      if (!userId) {
        return res.status(401).json({ error: 'Authentification requise' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      const { secret, otpauthUrl } = generateTwoFactorSecret(user.email);
      const qrCodeDataUrl = await generateQRCode(otpauthUrl);

      res.json({
        secret,
        qrCode: qrCodeDataUrl,
        otpauthUrl,
      });
    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({ error: 'Erreur lors de la configuration 2FA' });
    }
  });

  // Route spéciale pour la configuration initiale du 2FA admin (sans session complète)
  const adminInitial2FASetupSchema = z.object({
    userId: z.string().min(1, 'User ID requis'),
  });

  app.post("/api/admin/2fa/setup-initial", authLimiter, async (req, res) => {
    try {
      const validatedInput = adminInitial2FASetupSchema.parse(req.body);
      const { userId } = validatedInput;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Vérifier que c'est bien un admin
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès refusé - Administrateurs uniquement' });
      }

      // Si le 2FA est déjà activé, retourner une erreur avec un code spécifique
      if (user.twoFactorEnabled) {
        return res.status(409).json({ 
          error: '2FA déjà configuré pour cet administrateur',
          code: 'ALREADY_CONFIGURED',
          message: 'L\'authentification à deux facteurs est déjà configurée pour ce compte. Si vous avez perdu l\'accès à votre application d\'authentification, veuillez contacter un super-administrateur.'
        });
      }

      const { secret, otpauthUrl } = generateTwoFactorSecret(user.email);
      const qrCodeDataUrl = await generateQRCode(otpauthUrl);

      // Persister le secret temporairement (sans activer le 2FA encore)
      // Cela permet de vérifier le code lors de l'étape suivante
      // 🔐 Le secret est chiffré avant stockage
      const encryptedSecret = encryptSecret(secret);
      await db.update(users)
        .set({ twoFactorSecret: encryptedSecret, updatedAt: new Date() })
        .where(eq(users.id, userId));

      res.json({
        secret,
        qrCode: qrCodeDataUrl,
        otpauthUrl,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      console.error('Admin initial 2FA setup error:', error);
      res.status(500).json({ error: 'Erreur lors de la configuration 2FA administrateur' });
    }
  });

  // Route spéciale pour valider et activer le 2FA admin lors de la configuration initiale
  const adminInitial2FAVerifySchema = z.object({
    userId: z.string().min(1, 'User ID requis'),
    token: z.string().length(6, 'Le code doit contenir 6 chiffres'),
    secret: z.string().min(1, 'Secret requis'),
  });

  app.post("/api/admin/2fa/verify-initial", authLimiter, async (req, res) => {
    try {
      const validatedInput = adminInitial2FAVerifySchema.parse(req.body);
      const { userId, token, secret } = validatedInput;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Vérifier que c'est bien un admin
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès refusé - Administrateurs uniquement' });
      }

      // Vérifier le token contre le secret persisté (qui est chiffré en BD)
      // verifyTwoFactorToken déchiffre automatiquement
      if (!user.twoFactorSecret) {
        return res.status(401).json({ error: 'Secret invalide ou expiré. Veuillez recommencer la configuration.' });
      }

      // Vérifier le token contre le secret persisté (déchiffrement auto)
      const isValid = verifyTwoFactorToken(user.twoFactorSecret, token);
      if (!isValid) {
        return res.status(401).json({ error: 'Code invalide' });
      }

      // Activer le 2FA pour l'admin (le secret est déjà dans la BD)
      await db.update(users)
        .set({ twoFactorEnabled: true, updatedAt: new Date() })
        .where(eq(users.id, userId));

      await storage.createAuditLog({
        actorId: userId,
        actorRole: 'admin',
        action: 'admin_2fa_enabled',
        entityType: 'user',
        entityId: userId,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });

      // Maintenant connecter l'admin automatiquement
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.csrfToken = generateCSRFToken();

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      await storage.updateUserSessionId(user.id, req.session.id);

      const { password: _, verificationToken: __, twoFactorSecret: ___, ...userWithoutSensitive } = user;

      await storage.createAuditLog({
        actorId: user.id,
        actorRole: user.role,
        action: 'admin_login_after_2fa_setup',
        entityType: 'user',
        entityId: user.id,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });

      res.json({
        message: '2FA configuré avec succès. Connexion automatique en cours...',
        user: userWithoutSensitive
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      console.error('Admin initial 2FA verification error:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification du code 2FA' });
    }
  });

  const verify2FASchema = z.object({
    token: z.string().length(6, 'Le code doit contenir 6 chiffres'),
    secret: z.string().min(1, 'Secret requis'),
  });

  app.post("/api/2fa/verify", requireAuth, requireCSRF, async (req, res) => {
    try {
      const userId = req.session.userId!;
      if (!userId) {
        return res.status(401).json({ error: 'Authentification requise' });
      }

      const validatedInput = verify2FASchema.parse(req.body);
      const { token, secret } = validatedInput;

      const isValid = verifyTwoFactorToken(secret, token);
      if (!isValid) {
        return res.status(401).json({ error: 'Code invalide' });
      }

      await storage.enable2FA(userId, secret);

      await storage.deleteAllNotificationsByType(userId, '2fa_suggestion');

      await storage.createAuditLog({
        actorId: userId,
        actorRole: req.session.userRole || 'user',
        action: '2fa_enabled',
        entityType: 'user',
        entityId: userId,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });

      res.json({ message: 'Authentification à deux facteurs activée avec succès' });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      console.error('2FA verification error:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification du code 2FA' });
    }
  });

  const validate2FASchema = z.object({
    userId: z.string(),
    token: z.string().length(6, 'Le code doit contenir 6 chiffres'),
  });

  app.post("/api/2fa/validate", authLimiter, requireCSRFPublic, async (req, res) => {
    try {
      const validatedInput = validate2FASchema.parse(req.body);
      const { userId, token } = validatedInput;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        return res.status(400).json({ error: '2FA non activé pour cet utilisateur' });
      }

      const isValid = verifyTwoFactorToken(user.twoFactorSecret, token);
      if (!isValid) {
        return res.status(401).json({ error: 'Code invalide' });
      }

      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.csrfToken = generateCSRFToken();

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      await storage.updateUserSessionId(user.id, req.session.id);

      const { password: _, verificationToken: __, twoFactorSecret: ___, ...userWithoutSensitive } = user;

      await storage.createAuditLog({
        actorId: user.id,
        actorRole: user.role,
        action: 'user_login_2fa',
        entityType: 'user',
        entityId: user.id,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });

      res.json({
        message: 'Connexion réussie',
        user: userWithoutSensitive
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      console.error('2FA validation error:', error);
      res.status(500).json({ error: 'Erreur lors de la validation du code 2FA' });
    }
  });

  app.post("/api/2fa/disable", requireAuth, requireCSRF, async (req, res) => {
    try {
      const userId = req.session.userId!;
      if (!userId) {
        return res.status(401).json({ error: 'Authentification requise' });
      }

      await storage.disable2FA(userId);

      await storage.createAuditLog({
        actorId: userId,
        actorRole: req.session.userRole || 'user',
        action: '2fa_disabled',
        entityType: 'user',
        entityId: userId,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });

      res.json({ message: 'Authentification à deux facteurs désactivée' });
    } catch (error) {
      console.error('2FA disable error:', error);
      res.status(500).json({ error: 'Erreur lors de la désactivation 2FA' });
    }
  });

  app.post("/api/auth/logout", requireCSRF, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const userRole = req.session.userRole || 'user';
      
      if (userId) {
        await storage.updateUserSessionId(userId, null);
        
        await storage.createAuditLog({
          actorId: userId,
          actorRole: userRole,
          action: 'user_logout',
          entityType: 'user',
          entityId: userId,
        });
      }
      
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
        }
        res.clearCookie('sessionId');
        res.json({ message: 'Déconnexion réussie' });
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Erreur lors de la déconnexion' });
    }
  });

  app.get("/api/auth/verify/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.status(400).json({ error: 'Token de vérification invalide ou expiré' });
      }
      
      if (user.emailVerified) {
        return res.status(400).json({ error: 'Cet email a déjà été vérifié' });
      }

      if (user.verificationTokenExpiry && new Date() > user.verificationTokenExpiry) {
        return res.status(400).json({ 
          error: 'Le token de vérification a expiré. Veuillez demander un nouveau lien de vérification.' 
        });
      }
      
      const verifiedUser = await storage.verifyUserEmail(user.id);
      
      await sendWelcomeEmail(user.email, user.fullName, user.accountType, user.preferredLanguage || 'fr');
      
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.csrfToken = generateCSRFToken();

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      await storage.updateUserSessionId(user.id, req.session.id);
      
      const { password: _, verificationToken: __, ...userWithoutSensitive } = user;
      
      await storage.createAuditLog({
        actorId: user.id,
        actorRole: user.role,
        action: 'email_verified_auto_login',
        entityType: 'user',
        entityId: user.id,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });
      
      if (process.env.NODE_ENV === 'production') {
        const cookieDomain = process.env.COOKIE_DOMAIN || '.altusfinancesgroup.com';
        console.log(`[EMAIL VERIFY SUCCESS] Email verified and user auto-logged in`);
        console.log(`[EMAIL VERIFY SUCCESS] Session created and will be sent as cookie`);
        console.log(`[EMAIL VERIFY SUCCESS] Cookie domain: ${cookieDomain}`);
      }
      
      res.json({
        success: true,
        redirect: '/dashboard',
        user: userWithoutSensitive
      });
    } catch (error: any) {
      console.error('Verification error:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification' });
    }
  });

  app.post("/api/auth/resend-verification", requireCSRFPublic, async (req, res) => {
    try {
      const { email } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'Aucun compte trouvé avec cet email' });
      }
      
      if (user.emailVerified) {
        return res.status(400).json({ error: 'Cet email a déjà été vérifié' });
      }
      
      const newToken = randomUUID();
      const newExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await storage.updateUser(user.id, { 
        verificationToken: newToken,
        verificationTokenExpiry: newExpiry
      });
      
      await sendVerificationEmail(user.email, user.fullName, newToken, user.accountType, user.preferredLanguage || 'fr');
      
      res.json({ message: 'Email de vérification renvoyé avec succès' });
    } catch (error: any) {
      console.error('Resend verification error:', error);
      res.status(500).json({ error: 'Erreur lors du renvoi de l\'email' });
    }
  });

  app.post("/api/auth/forgot-password", authLimiter, requireCSRFPublic, async (req, res) => {
    try {
      const forgotPasswordSchema = z.object({
        email: z.string().email('Email invalide'),
      });
      
      const validatedInput = forgotPasswordSchema.parse(req.body);
      const { email } = validatedInput;
      
      const user = await storage.getUserByEmail(email);
      
      // CRITICAL SECURITY FIX: ONLY send reset email if user exists
      // Do NOT send email for non-registered accounts
      if (!user) {
        // Return generic message to avoid user enumeration
        // But DO NOT send any email
        return res.json({ 
          message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.' 
        });
      }
      
      const resetToken = randomUUID();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
      
      // CRITICAL: Verify user exists AGAIN before sending email (defense in depth)
      if (!user.id || !user.email) {
        console.error('[SECURITY] Invalid user object before sending reset email');
        return res.json({ 
          message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.' 
        });
      }
      
      await storage.setResetPasswordToken(email, resetToken, resetTokenExpiry);
      
      // CRITICAL: Only send email if user truly exists in DB
      console.log(`[SECURITY] Sending reset password email to verified user: ${user.email}`);
      await sendResetPasswordEmail(user.email, user.fullName, resetToken, user.preferredLanguage || 'fr');
      
      await storage.createAuditLog({
        actorId: user.id,
        actorRole: user.role,
        action: 'password_reset_requested',
        entityType: 'user',
        entityId: user.id,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });
      
      // Return the same message regardless (security best practice)
      res.json({ 
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.' 
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Erreur lors de la demande de réinitialisation' });
    }
  });

  app.post("/api/auth/reset-password", authLimiter, requireCSRFPublic, async (req, res) => {
    try {
      const resetPasswordSchema = z.object({
        token: z.string().min(1, 'Token requis'),
        password: z.string()
          .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
          .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
          .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
          .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
          .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
      });
      
      const validatedInput = resetPasswordSchema.parse(req.body);
      const { token, password } = validatedInput;
      
      const user = await storage.getUserByResetPasswordToken(token);
      if (!user) {
        return res.status(400).json({ error: 'Lien de réinitialisation invalide ou expiré' });
      }
      
      if (!user.resetPasswordTokenExpiry || new Date() > user.resetPasswordTokenExpiry) {
        return res.status(400).json({ error: 'Lien de réinitialisation expiré. Veuillez en demander un nouveau.' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 12);
      await storage.resetPassword(user.id, hashedPassword);
      
      await storage.createAuditLog({
        actorId: user.id,
        actorRole: user.role,
        action: 'password_reset_completed',
        entityType: 'user',
        entityId: user.id,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });
      
      res.json({ message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.' });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Erreur lors de la réinitialisation du mot de passe' });
    }
  });

  app.get("/api/dashboard", requireAuth, async (req, res) => {
    try {
      const data = await storage.getDashboardData(req.session.userId!);
      
      const formatDate = (date: Date | null) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        });
      };

      const getTimeAgo = (date: Date) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'Il y a quelques secondes';
        if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} minutes`;
        if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} heures`;
        return `Il y a ${Math.floor(seconds / 86400)} jours`;
      };

      // Calculate lastUpdated based on most recent transaction or user update
      let lastUpdated = 'Il y a quelques secondes';
      if (data.transactions && data.transactions.length > 0) {
        const mostRecentTransaction = data.transactions[0];
        lastUpdated = getTimeAgo(mostRecentTransaction.createdAt);
      } else if (data.user.updatedAt) {
        lastUpdated = getTimeAgo(data.user.updatedAt);
      }

      // Calculate the total amount from all non-terminal loans (including pending requests)
      // This shows borrowed amount immediately when a loan request is made
      // Terminal statuses are excluded: rejected, cancelled, completed, closed, repaid, defaulted, written_off
      const terminalStatuses = ['rejected', 'cancelled', 'completed', 'closed', 'repaid', 'defaulted', 'written_off'];
      const allNonTerminalLoans = data.loans.filter(l => !terminalStatuses.includes(l.status));
      const totalBorrowedAmount = allNonTerminalLoans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0);
      
      // Active loans count only shows loans with funds released (status = 'active')
      const activeLoansOnly = data.loans.filter(l => l.status === 'active');
      const activeLoansCount = activeLoansOnly.length;
      
      // Get tier-based max capacity using the storage method
      // Business/Professional: always 2,000,000€
      // Individual: Bronze=500K, Silver=750K, Gold=1M
      const maxCapacity = storage.getMaxBorrowingCapacity(data.user.verificationTier, data.user.accountType);

      const response = {
        balance: {
          currentBalance: data.balance,
          activeLoansCount: activeLoansCount,
          totalBorrowed: totalBorrowedAmount,
          availableCredit: maxCapacity - totalBorrowedAmount,
          lastUpdated: lastUpdated,
        },
        loans: data.loans.map(loan => ({
          id: loan.id,
          amount: parseFloat(loan.amount),
          duration: loan.duration,
          interestRate: parseFloat(loan.interestRate),
          nextPaymentDate: formatDate(loan.nextPaymentDate),
          totalRepaid: parseFloat(loan.totalRepaid),
          status: loan.status,
          contractStatus: loan.contractStatus,
          contractUrl: loan.contractUrl,
          signedContractUrl: loan.signedContractUrl,
          loanReference: getOrGenerateLoanReference(loan),
        })),
        transfers: data.transfers.map(transfer => ({
          id: transfer.id,
          amount: parseFloat(transfer.amount),
          recipient: transfer.recipient,
          status: transfer.status,
          currentStep: transfer.currentStep,
          updatedAt: getTimeAgo(transfer.updatedAt),
          transferReference: getTransferReferenceNumber(transfer),
        })),
        fees: data.fees.map(fee => ({
          id: fee.id,
          feeType: fee.feeType,
          reason: fee.reason,
          amount: parseFloat(fee.amount),
          createdAt: formatDate(fee.createdAt),
          isPaid: fee.isPaid || false,
          paidAt: formatDate(fee.paidAt),
          category: fee.feeType.toLowerCase().includes('prêt') || fee.feeType.toLowerCase().includes('loan') || fee.feeType.toLowerCase().includes('dossier') || fee.feeType.toLowerCase().includes('garantie')
            ? 'loan'
            : fee.feeType.toLowerCase().includes('transfer')
            ? 'transfer'
            : 'account',
        })),
        borrowingCapacity: {
          maxCapacity: maxCapacity,
          currentCapacity: maxCapacity - totalBorrowedAmount,
        },
      };

      res.json(response);
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  });

  app.get("/api/user", async (req, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      if (!user.twoFactorEnabled) {
        const has2FANotification = await storage.hasNotificationByType(user.id, '2fa_suggestion');
        
        if (!has2FANotification) {
          await storage.createNotification({
            userId: user.id,
            type: '2fa_suggestion',
            title: '',
            message: '',
            severity: 'warning',
            metadata: { action: 'enable_2fa' },
          });
        }
      }
      
      const { password: _, verificationToken: __, ...userWithoutSensitive } = user;
      res.json(userWithoutSensitive);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
    }
  });

  app.post("/api/user/mark-welcome-seen", requireAuth, requireCSRF, async (req, res) => {
    try {
      await storage.markWelcomeMessageAsSeen(req.session.userId!);
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking welcome message as seen:', error);
      res.status(500).json({ error: 'Failed to mark welcome message as seen' });
    }
  });

  app.post("/api/user/profile-photo", requireAuth, requireCSRF, uploadLimiter, profilePhotoUpload.single('profilePhoto'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucune image fournie' });
      }

      const user = await storage.getUser(req.session.userId!);
      
      if (user?.profilePhoto && user.profilePhoto.includes('cloudinary.com')) {
        try {
          const urlParts = user.profilePhoto.split('/');
          const publicIdWithExt = urlParts.slice(urlParts.indexOf('user_profiles')).join('/');
          const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
          await cloudinary.uploader.destroy(publicId);
        } catch (cleanupError) {
          console.error('Error deleting old Cloudinary photo:', cleanupError);
        }
      }

      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'user_profiles',
            resource_type: 'image',
            transformation: [
              { width: 500, height: 500, crop: 'fill', gravity: 'face' },
              { quality: 'auto', fetch_format: 'auto' }
            ],
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            public_id: `user_${req.session.userId}_${Date.now()}`,
          },
          (error: any, result: any) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file!.buffer);
      });

      const photoUrl = result.secure_url;
      
      await storage.updateUser(req.session.userId!, {
        profilePhoto: photoUrl,
        updatedAt: new Date(),
      });

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: req.session.userRole || 'user',
        action: 'profile_photo_update',
        entityType: 'user',
        entityId: req.session.userId!,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });

      res.json({ 
        success: true, 
        profilePhoto: photoUrl,
        message: 'Photo de profil mise à jour avec succès'
      });
    } catch (error: any) {
      console.error('Profile photo upload error:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de la photo de profil' });
    }
  });

  app.patch("/api/user/profile", requireAuth, requireCSRF, async (req, res) => {
    try {
      const updateProfileSchema = z.object({
        fullName: z.string().min(1, 'Le nom complet est requis').optional(),
        email: z.string().email('Email invalide').optional(),
        phone: z.string().optional(),
        companyName: z.string().optional(),
      });

      const validatedData = updateProfileSchema.parse(req.body);

      if (validatedData.email) {
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser && existingUser.id !== req.session.userId) {
          return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }
      }

      const updatedUser = await storage.updateUser(req.session.userId!, validatedData);

      if (!updatedUser) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: req.session.userRole || 'user',
        action: 'profile_update',
        entityType: 'user',
        entityId: req.session.userId!,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });

      const { password: _, verificationToken: __, ...userWithoutSensitive } = updatedUser;
      res.json({ 
        success: true, 
        user: userWithoutSensitive,
        message: 'Profil mis à jour avec succès'
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
    }
  });

  app.patch("/api/user/notifications", requireAuth, requireCSRF, async (req, res) => {
    try {
      const updateNotificationsSchema = z.object({
        notificationEmailAlerts: z.boolean().optional(),
        notificationTransferUpdates: z.boolean().optional(),
        notificationLoanReminders: z.boolean().optional(),
        notificationMarketingEmails: z.boolean().optional(),
      });

      const validatedData = updateNotificationsSchema.parse(req.body);

      const updatedUser = await storage.updateUser(req.session.userId!, validatedData);

      if (!updatedUser) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      const { password: _, verificationToken: __, ...userWithoutSensitive } = updatedUser;
      res.json({ 
        success: true, 
        user: userWithoutSensitive,
        message: 'Préférences de notification mises à jour avec succès'
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      console.error('Notifications update error:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour des préférences' });
    }
  });

  app.post("/api/user/change-password", requireAuth, requireCSRF, async (req, res) => {
    try {
      const changePasswordSchema = z.object({
        currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
        newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
        confirmPassword: z.string().min(1, 'Veuillez confirmer le nouveau mot de passe'),
      }).refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Les mots de passe ne correspondent pas',
        path: ['confirmPassword'],
      });

      const validatedData = changePasswordSchema.parse(req.body);

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      const bcrypt = await import('bcrypt');
      const isPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
      }

      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);
      await storage.updateUser(req.session.userId!, {
        password: hashedPassword,
      });

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: req.session.userRole || 'user',
        action: 'password_change',
        entityType: 'user',
        entityId: req.session.userId!,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });

      res.json({ 
        success: true,
        message: 'Mot de passe modifié avec succès'
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      console.error('Password change error:', error);
      res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
    }
  });

  app.post("/api/kyc/upload", requireAuth, requireCSRF, uploadLimiter, upload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      const fileType = await fileTypeFromFile(req.file.path);
      
      const allowedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png']);
      const allowedExtensions = new Set(['pdf', 'jpg', 'jpeg', 'png']);
      
      if (!fileType || !allowedTypes.has(fileType.mime) || !allowedExtensions.has(fileType.ext)) {
        try {
          await fs.promises.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up invalid file:', cleanupError);
        }
        return res.status(400).json({ 
          error: 'Type de fichier non autorisé. Seuls les fichiers PDF, JPEG et PNG sont acceptés.' 
        });
      }

      const kycUploadSchema = z.object({
        documentType: z.string().min(1, 'Type de document requis'),
        loanType: z.string().min(1, 'Type de prêt requis'),
        loanId: z.string().optional(),
      });

      const validatedData = kycUploadSchema.parse(req.body);

      // Sauvegarder le fichier dans le système de fichiers local
      const kycDocumentsDir = path.join(process.cwd(), 'uploads', 'kyc_documents');
      await fs.promises.mkdir(kycDocumentsDir, { recursive: true });
      
      const uniqueFileName = `${randomUUID()}_${req.file.originalname}`;
      const finalFilePath = path.join(kycDocumentsDir, uniqueFileName);
      await fs.promises.copyFile(req.file.path, finalFilePath);
      
      const fileUrl = `/uploads/kyc_documents/${uniqueFileName}`;

      try {
        await fs.promises.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error deleting temp KYC file:', cleanupError);
      }

      const document = await storage.createKycDocument({
        userId: req.session.userId!,
        loanId: validatedData.loanId || null,
        documentType: validatedData.documentType,
        loanType: validatedData.loanType,
        status: 'pending',
        fileUrl: fileUrl,
        cloudinaryPublicId: null,
        fileName: req.file.originalname,
        fileSize: req.file.size,
      });

      const user = await storage.getUser(req.session.userId!);
      if (user) {
        await notifyAdminsNewKycDocument(
          user.id,
          user.fullName,
          validatedData.documentType,
          validatedData.loanType
        );

        try {
          const { sendKYCUploadedAdminEmail } = await import('./email');
          await sendKYCUploadedAdminEmail(
            user.fullName,
            user.email,
            validatedData.documentType,
            validatedData.loanType,
            user.id,
            'fr'
          );
          console.log(`KYC upload admin email sent for user ${user.id}`);
        } catch (emailError) {
          console.error('Error sending KYC upload admin email:', emailError);
        }
      }

      res.status(201).json({ 
        success: true, 
        document,
        message: 'Document téléchargé avec succès'
      });
    } catch (error: any) {
      if (req.file) {
        try {
          await fs.promises.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file after error:', cleanupError);
        }
      }

      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }

      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Fichier trop volumineux. La taille maximale est de 5MB.' });
      }

      console.error('KYC upload error:', error);
      res.status(500).json({ error: 'Erreur lors du téléchargement du document' });
    }
  });

  app.get("/api/kyc/documents", requireAuth, async (req, res) => {
    try {
      const documents = await storage.getUserKycDocuments(req.session.userId!);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
    }
  });

  app.get("/api/kyc/download/:id", requireAuth, async (req, res) => {
    try {
      const document = await storage.getKycDocument(req.params.id);
      
      if (!document) {
        return res.status(404).json({ error: 'Document non trouvé' });
      }

      if (document.userId !== req.session.userId) {
        const user = await storage.getUser(req.session.userId!);
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ error: 'Accès refusé' });
        }
      }

      if (!document.cloudinaryPublicId) {
        if (document.fileUrl.startsWith('http://') || document.fileUrl.startsWith('https://')) {
          return res.redirect(document.fileUrl);
        }

        const filePath = path.join(uploadsDir, document.fileUrl);
        
        if (!fs.existsSync(filePath)) {
          console.error(`[KYC DOWNLOAD ERROR] File not found: ${filePath}`);
          console.error(`[KYC DOWNLOAD ERROR] Document ID: ${document.id}, FileUrl: ${document.fileUrl}`);
          return res.status(404).json({ 
            error: 'Le fichier n\'est pas disponible sur le serveur. Il a peut-être été supprimé ou n\'a jamais été stocké correctement. Veuillez contacter le support ou re-télécharger le document.' 
          });
        }

        return res.download(filePath, document.fileName, (err) => {
          if (err) {
            console.error('Error downloading file:', err);
            if (!res.headersSent) {
              res.status(500).json({ error: 'Erreur lors du téléchargement du fichier' });
            }
          }
        });
      }

      const signedUrl = cloudinary.utils.private_download_url(
        document.cloudinaryPublicId,
        'raw',
        {
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          attachment: false,
          resource_type: 'raw',
        }
      );

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: req.session.userRole || 'user',
        action: 'download_kyc_document',
        entityType: 'kyc_document',
        entityId: document.id,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        metadata: { 
          documentType: document.documentType,
          fileName: document.fileName,
          ownerId: document.userId
        },
      });

      res.redirect(signedUrl);
    } catch (error) {
      console.error('KYC download error:', error);
      res.status(500).json({ error: 'Erreur lors du téléchargement du document' });
    }
  });


  app.get("/api/loans", requireAuth, async (req, res) => {
    try {
      const loans = await storage.getUserLoans(req.session.userId!);
      // Ajouter les références de prêt à chaque prêt
      const loansWithReferences = loans.map(loan => ({
        ...loan,
        loanReference: getOrGenerateLoanReference(loan)
      }));
      res.json({ success: true, data: loansWithReferences });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch loans' });
    }
  });

  app.get("/api/loans/available-for-transfer", requireAuth, async (req, res) => {
    try {
      const loansAvailable = await storage.getLoansAvailableForTransfer(req.session.userId!);
      const loansWithReferences = loansAvailable.map(loan => ({
        ...loan,
        loanReference: getOrGenerateLoanReference(loan)
      }));
      res.json({ success: true, data: loansWithReferences });
    } catch (error) {
      console.error('Error fetching loans available for transfer:', error);
      res.status(500).json({ success: false, error: 'Erreur lors de la récupération des prêts disponibles' });
    }
  });

  app.get("/api/user/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.session.userId!);
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ success: false, error: 'Erreur lors de la récupération des statistiques' });
    }
  });

  // Endpoint pour récupérer le calendrier d'amortissement d'un prêt
  app.get("/api/loans/:id/amortization", requireAuth, async (req, res) => {
    try {
      const loan = await storage.getLoan(req.params.id);
      
      if (!loan) {
        return res.status(404).json({ success: false, error: 'Prêt non trouvé' });
      }

      if (loan.userId !== req.session.userId) {
        const user = await storage.getUser(req.session.userId!);
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ success: false, error: 'Accès refusé' });
        }
      }

      // Vérifier que le prêt est approuvé et que les fonds sont disponibles
      if (loan.status !== 'approved' && loan.status !== 'active') {
        return res.status(400).json({ 
          success: false, 
          error: 'Le calendrier d\'amortissement n\'est disponible que pour les prêts approuvés' 
        });
      }

      const schedule = await storage.getAmortizationSchedule(req.params.id);
      
      // Si le calendrier n'existe pas, le générer
      if (schedule.length === 0) {
        const generated = await storage.generateAmortizationSchedule(req.params.id);
        return res.json({ 
          success: true, 
          data: {
            loan: {
              ...loan,
              loanReference: getOrGenerateLoanReference(loan)
            },
            schedule: generated
          }
        });
      }

      res.json({ 
        success: true, 
        data: {
          loan: {
            ...loan,
            loanReference: getOrGenerateLoanReference(loan)
          },
          schedule
        }
      });
    } catch (error) {
      console.error('Error fetching amortization schedule:', error);
      res.status(500).json({ success: false, error: 'Erreur lors de la récupération du calendrier d\'amortissement' });
    }
  });

  // Endpoint pour récupérer les prochains paiements d'un prêt
  app.get("/api/loans/:id/upcoming-payments", requireAuth, async (req, res) => {
    try {
      const loan = await storage.getLoan(req.params.id);
      
      if (!loan) {
        return res.status(404).json({ success: false, error: 'Prêt non trouvé' });
      }

      if (loan.userId !== req.session.userId) {
        const user = await storage.getUser(req.session.userId!);
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ success: false, error: 'Accès refusé' });
        }
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const upcomingPayments = await storage.getUpcomingPayments(req.params.id, limit);

      res.json({ success: true, data: upcomingPayments });
    } catch (error) {
      console.error('Error fetching upcoming payments:', error);
      res.status(500).json({ success: false, error: 'Erreur lors de la récupération des paiements à venir' });
    }
  });

  app.post("/api/loans", requireAuth, requireCSRF, loanLimiter, async (req, res) => {
    try {
      const loanRequestSchema = z.object({
        loanType: z.string(),
        amount: z.number().min(1000).max(2000000),
        duration: z.number().int().min(6).max(360),
        documents: z.record(z.string()).optional(),
      });

      const { loanType, amount, duration, documents } = loanRequestSchema.parse(req.body);
      
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé', code: 'USER_NOT_FOUND' });
      }

      // Tier-based validation: check max active loans
      const stats = await storage.getUserStats(req.session.userId!);
      if (stats.activeLoans >= stats.maxActiveLoans) {
        return res.status(400).json({ 
          messageKey: 'loan.tierMaxLoansReached',
          code: 'MAX_ACTIVE_LOANS_REACHED',
          data: {
            currentActive: stats.activeLoans,
            maxAllowed: stats.maxActiveLoans,
            tier: stats.tier
          }
        });
      }
      
      const userLoans = await storage.getUserLoans(req.session.userId!);
      const userTransfers = await storage.getUserTransfers(req.session.userId!);
      
      // Utiliser le plafond basé sur le tier ET le type de compte
      // Business/Professional: toujours 2,000,000€ peu importe le tier
      // Particuliers: Bronze=500K, Silver=750K, Gold=1M
      const maxLoanAmount = storage.getMaxBorrowingCapacity(stats.tier, user.accountType);
      
      // Calculer le cumul des demandes existantes (tous les statuts non-terminaux)
      // Les statuts terminaux sont : rejected, cancelled, completed, closed, repaid, defaulted, written_off
      // Tous les autres statuts comptent dans le cumul (y compris 'active')
      const terminalStatuses = ['rejected', 'cancelled', 'completed', 'closed', 'repaid', 'defaulted', 'written_off'];
      const cumulativeLoanAmount = userLoans
        .filter(loan => 
          loan.deletedAt === null && 
          !terminalStatuses.includes(loan.status)
        )
        .reduce((total, loan) => total + parseFloat(loan.amount), 0);
      
      // Vérifier si le cumul + nouveau montant dépasse le plafond
      const projectedTotal = cumulativeLoanAmount + amount;
      if (projectedTotal > maxLoanAmount) {
        const remainingCapacity = Math.max(0, maxLoanAmount - cumulativeLoanAmount);
        return res.status(400).json({ 
          messageKey: 'loan.limitExceeded',
          code: 'CUMULATIVE_LIMIT_EXCEEDED',
          data: {
            currentCumulative: cumulativeLoanAmount,
            requestedAmount: amount,
            projectedTotal: projectedTotal,
            maxAllowed: maxLoanAmount,
            remainingCapacity: remainingCapacity,
            accountType: user.accountType
          }
        });
      }
      
      const interestRate = await calculateInterestRate(loanType, amount);
      
      const validated = insertLoanSchema.parse({
        userId: req.session.userId!,
        loanType,
        amount: amount.toString(),
        duration,
        interestRate: interestRate.toString(),
        status: 'pending_review',
        documents: null,
      });
      
      const loan = await storage.createLoan(validated);
      
      // user is already fetched above for cumulative validation
      
      const uploadedDocuments: any[] = [];
      
      try {
        if (documents && Object.keys(documents).length > 0) {
          const { validateAndCleanFile, deleteTemporaryFile } = await import('./fileValidator');
          const tempDir = path.join(process.cwd(), 'uploads');
          await fs.promises.mkdir(tempDir, { recursive: true });

          for (const [documentType, dataUrl] of Object.entries(documents)) {
            let tempFilePath: string | null = null;
            try {
              if (!dataUrl || !dataUrl.startsWith('data:')) {
                throw new Error(`Invalid document format for ${documentType}`);
              }

              const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
              if (!matches) {
                throw new Error(`Invalid base64 format for ${documentType}`);
              }

              const mimeType = matches[1];
              const base64Data = matches[2];
              const buffer = Buffer.from(base64Data, 'base64');

              const maxSize = 10 * 1024 * 1024;
              if (buffer.length > maxSize) {
                throw new Error(`Document ${documentType} exceeds maximum size of 10MB`);
              }

              const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
              if (!allowedMimes.includes(mimeType)) {
                throw new Error(`Invalid file type for ${documentType}. Allowed: PDF, JPEG, PNG, WEBP`);
              }

              const extension = mimeType.split('/')[1].replace('jpeg', 'jpg');
              const fileName = `${documentType}.${extension}`;

              // Sauvegarder temporairement pour validation
              tempFilePath = path.join(tempDir, `${randomUUID()}_${fileName}`);
              await fs.promises.writeFile(tempFilePath, buffer);

              // Valider et nettoyer le fichier
              const cleanedFile = await validateAndCleanFile(tempFilePath, fileName);
              console.log(`✓ Document cleaned and validated: ${cleanedFile.filename}`);

              // Sauvegarder le fichier nettoyé dans le système de fichiers local
              const kycDocumentsDir = path.join(process.cwd(), 'uploads', 'kyc_documents');
              await fs.promises.mkdir(kycDocumentsDir, { recursive: true });
              
              const uniqueFileName = `${randomUUID()}_${cleanedFile.filename}`;
              const finalFilePath = path.join(kycDocumentsDir, uniqueFileName);
              await fs.promises.writeFile(finalFilePath, cleanedFile.buffer);
              
              const fileUrl = `/uploads/kyc_documents/${uniqueFileName}`;

              const kycDocument = await storage.createKycDocument({
                userId: req.session.userId!,
                loanId: loan.id,
                documentType,
                loanType,
                status: 'pending',
                fileUrl: fileUrl,
                fileName: cleanedFile.filename,
                fileSize: cleanedFile.buffer.length,
                cloudinaryPublicId: null,
              });

              uploadedDocuments.push({
                documentType,
                fileUrl: fileUrl,
                fileName: cleanedFile.filename,
              });

              await notifyAdminsNewKycDocument(
                req.session.userId!,
                user?.fullName || 'Utilisateur',
                documentType,
                loanType
              );
            } finally {
              // Supprimer le fichier temporaire
              if (tempFilePath) {
                await deleteTemporaryFile(tempFilePath);
              }
            }
          }

          await storage.updateLoan(loan.id, {
            documents: uploadedDocuments.length > 0 ? uploadedDocuments : null,
          });
        }
      } catch (uploadError: any) {
        console.error('Document upload error:', uploadError);
        
        // Nettoyer les fichiers locaux en cas d'erreur
        for (const doc of uploadedDocuments) {
          try {
            const filePath = path.join(process.cwd(), doc.fileUrl);
            if (fs.existsSync(filePath)) {
              await fs.promises.unlink(filePath);
            }
          } catch (cleanupError) {
            console.error('Failed to cleanup local document:', cleanupError);
          }
        }

        await storage.deleteLoan(loan.id, req.session.userId!, 'Document upload failed');

        return res.status(500).json({ 
          error: uploadError.message || 'Erreur lors de l\'upload des documents. Veuillez réessayer.' 
        });
      }
      
      await notifyLoanRequest(req.session.userId!, loan.id, amount.toString(), loanType);

      if (user) {
        const kycDocuments = await storage.getUserKycDocuments(user.id);
        const loanDocuments = kycDocuments
          .filter(doc => doc.loanId === loan.id)
          .map(doc => ({
            documentType: doc.documentType,
            fileUrl: doc.fileUrl,
            fileName: doc.fileName
          }));

        const supportedLanguages = ['fr', 'en', 'es', 'pt', 'it', 'de', 'nl'] as const;
        const userLanguage = (user.preferredLanguage && supportedLanguages.includes(user.preferredLanguage as any)) 
          ? user.preferredLanguage 
          : 'fr';
        
        await loanRequestAdminNotification({
          userId: user.id,
          loanId: loan.id,
          amount: amount.toString(),
          loanType,
          userFullName: user.fullName,
          userEmail: user.email,
          userPhone: user.phone,
          accountType: user.accountType,
          duration,
          reference: loan.id,
          documents: loanDocuments,
          language: userLanguage as any,
        });
      }

      await createAdminMessageLoanRequest(req.session.userId!, loanType, amount.toString());
      
      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'user',
        action: 'loan_request_submitted',
        entityType: 'loan',
        entityId: loan.id,
        metadata: { amount, loanType, duration, documentsCount: uploadedDocuments.length },
      });
      
      res.status(201).json({ 
        loan,
        message: 'Votre demande de prêt a été soumise avec succès et est en attente de validation par notre service.'
      });
    } catch (error: any) {
      console.error('Loan creation error:', error);
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      res.status(400).json({ error: 'Données de prêt invalides' });
    }
  });

  // ✅ NOUVEAU : Génère un lien temporaire signé pour télécharger le contrat (valide 5 min)
  app.get("/api/contracts/:loanId/link", requireAuth, async (req, res) => {
    try {
      const { loanId } = req.params;
      
      const loan = await storage.getLoan(loanId);
      if (!loan) {
        return res.status(404).json({ error: 'Prêt non trouvé' });
      }

      // Vérifie que le contrat appartient bien à l'utilisateur connecté
      if (loan.userId !== req.session.userId) {
        const user = await storage.getUser(req.session.userId!);
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ error: 'Accès non autorisé' });
        }
      }

      if (!loan.contractUrl) {
        return res.status(404).json({ error: 'Aucun contrat disponible pour ce prêt' });
      }

      // Génère un token JWT temporaire (valide 5 minutes)
      const token = jwt.sign(
        { 
          filePath: loan.contractUrl, 
          userId: req.session.userId,
          loanId: loan.id 
        },
        DOWNLOAD_SECRET,
        { expiresIn: '5m' }
      );

      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
        : '';
      
      const signedUrl = `${baseUrl}/api/contracts/signed/${token}`;
      
      res.json({ signedUrl });
    } catch (error) {
      console.error('Erreur génération lien de téléchargement:', error);
      res.status(500).json({ error: 'Erreur lors de la génération du lien de téléchargement' });
    }
  });

  // ✅ NOUVEAU : Télécharge le contrat via un lien signé temporaire
  app.get("/api/contracts/signed/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      // Vérifie et décode le token JWT
      const decoded = jwt.verify(token, DOWNLOAD_SECRET) as { 
        filePath: string; 
        userId: string; 
        loanId: string;
      };

      // Sécurité: Vérifie que le fichier existe et est dans le bon répertoire
      const filePath = path.resolve(CONTRACTS_DIR, path.basename(decoded.filePath));
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Fichier de contrat introuvable' });
      }

      // Télécharge le contrat avec un nom personnalisé
      const filename = `contrat_pret_${decoded.loanId}.pdf`;
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error('Erreur téléchargement contrat:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Erreur lors du téléchargement' });
          }
        }
      });
    } catch (error: any) {
      console.error('Erreur lien signé:', error);
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Lien invalide ou expiré. Veuillez générer un nouveau lien.' });
      }
      return res.status(500).json({ error: 'Erreur lors du téléchargement du contrat' });
    }
  });

  // ⚠️ ANCIEN ENDPOINT (gardé pour compatibilité mais devrait utiliser les nouveaux endpoints)
  app.get("/api/loans/:id/contract", requireAuth, async (req, res) => {
    try {
      const loan = await storage.getLoan(req.params.id);
      
      if (!loan) {
        return res.status(404).json({ error: 'Prêt non trouvé' });
      }

      if (loan.userId !== req.session.userId) {
        const user = await storage.getUser(req.session.userId!);
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ error: 'Accès refusé' });
        }
      }

      if (!loan.contractUrl) {
        return res.status(404).json({ error: 'Aucun contrat disponible pour ce prêt' });
      }

      const filePath = path.join(process.cwd(), loan.contractUrl);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Fichier de contrat non trouvé sur le serveur' });
      }

      const filename = `contrat_pret_${loan.id}.pdf`;
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error('Error downloading contract:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Erreur lors du téléchargement du contrat' });
          }
        }
      });
    } catch (error) {
      console.error('Contract download error:', error);
      res.status(500).json({ error: 'Erreur lors du téléchargement du contrat' });
    }
  });

  const signedContractsDir = path.join(process.cwd(), 'uploads', 'signed-contracts');
  if (!fs.existsSync(signedContractsDir)) {
    fs.mkdirSync(signedContractsDir, { recursive: true });
  }

  const signedContractStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, signedContractsDir);
    },
    filename: function (req, file, cb) {
      const uniqueName = `signed_${req.params.id}_${Date.now()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });

  const uploadSignedContract = multer({
    storage: signedContractStorage,
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1,
    },
    fileFilter: (req: any, file: any, cb: any) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (ext !== '.pdf') {
        return cb(new Error('Seuls les fichiers PDF sont acceptés pour les contrats signés.'), false);
      }
      cb(null, true);
    },
  });

  app.post("/api/loans/:id/upload-signed-contract", requireAuth, requireCSRF, uploadLimiter, uploadSignedContract.single('signedContract'), async (req, res) => {
    let tempFilePath: string | null = null;
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      tempFilePath = req.file.path;

      const loan = await storage.getLoan(req.params.id);
      if (!loan) {
        return res.status(404).json({ error: 'Prêt non trouvé' });
      }

      if (loan.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      if (loan.status !== 'approved') {
        return res.status(400).json({ error: 'Ce prêt n\'est pas en statut approuvé' });
      }

      // Vérification du type de fichier
      const fileType = await fileTypeFromFile(req.file.path);
      console.log('File type detection:', fileType);
      
      // Vérifier l'extension du fichier uploadé
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      console.log('File extension:', fileExtension);
      
      // Accepter si file-type détecte un PDF OU si l'extension est .pdf
      // (car file-type peut échouer sur certains PDFs valides)
      const isPdf = (fileType && fileType.ext === 'pdf') || fileExtension === '.pdf';
      
      if (!isPdf) {
        console.error('File rejected - not a PDF:', { fileType, fileExtension });
        return res.status(400).json({ error: 'Type de fichier invalide. Seuls les PDF sont acceptés.' });
      }

      // Vérification supplémentaire : essayer de lire le fichier comme un PDF
      try {
        const fileBuffer = await fs.promises.readFile(req.file.path);
        const pdfContent = fileBuffer.toString('latin1');
        if (!pdfContent.startsWith('%PDF')) {
          console.error('File rejected - not a valid PDF (missing PDF header)');
          return res.status(400).json({ error: 'Le fichier ne semble pas être un PDF valide.' });
        }
      } catch (error) {
        console.error('Error validating PDF content:', error);
        return res.status(400).json({ error: 'Erreur lors de la validation du fichier PDF.' });
      }

      const user = await storage.getUser(loan.userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      const fileBuffer = await fs.promises.readFile(req.file.path);
      
      const { sendSignedContractToAdmins } = await import('./email');
      await sendSignedContractToAdmins(
        user.fullName,
        user.email,
        loan.id,
        loan.amount,
        fileBuffer,
        req.file.originalname,
        'application/pdf',
        'fr'
      );

      // Sauvegarder le nom du fichier pour téléchargement ultérieur
      // Le fichier est déjà sauvegardé par multer dans signedContractsDir
      const signedContractFileName = path.basename(req.file.path);

      const updated = await storage.updateLoan(req.params.id, {
        contractStatus: 'awaiting_admin_review',
        signedContractUrl: signedContractFileName,
        signedContractCloudinaryPublicId: null,
      });

      // Ne pas supprimer le fichier - on le garde pour téléchargement
      tempFilePath = null;

      await notifyLoanContractSigned(loan.userId, loan.id, loan.amount);

      await createAdminMessageLoanContractSigned(loan.userId, loan.amount);

      await notifyAdminsSignedContractReceived(
        user.id,
        user.fullName,
        loan.id,
        loan.amount
      );

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'user',
        action: 'upload_signed_contract',
        entityType: 'loan',
        entityId: req.params.id,
        metadata: { filename: req.file.originalname, signedContractUrl: signedContractFileName },
      });

      // Emit real-time update to refresh admin dashboard immediately
      // This ensures the CONFIRM button appears without needing to refresh the page
      emitAdminDashboardUpdate('updated', {
        type: 'contract_signed',
        loanId: loan.id,
        userId: user.id,
        userName: user.fullName,
      });

      res.json({ 
        success: true, 
        loan: updated,
        message: 'Contrat signé envoyé avec succès'
      });
    } catch (error: any) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Fichier trop volumineux. La taille maximale est de 10MB.' });
      }

      console.error('Signed contract upload error:', error);
      res.status(500).json({ error: 'Erreur lors de l\'envoi du contrat signé' });
    } finally {
      // Ne supprimer le fichier qu'en cas d'erreur
      if (tempFilePath) {
        try {
          await fs.promises.unlink(tempFilePath);
          console.log(`✓ Temporary file deleted after error: ${tempFilePath}`);
        } catch (cleanupError) {
          console.error('Error cleaning up temp file:', cleanupError);
        }
      }
    }
  });

  app.get("/api/loans/:id/signed-contract/download", requireAuth, async (req, res) => {
    try {
      const loan = await storage.getLoan(req.params.id);
      
      if (!loan) {
        return res.status(404).json({ error: 'Prêt non trouvé' });
      }

      if (loan.userId !== req.session.userId) {
        const user = await storage.getUser(req.session.userId!);
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ error: 'Accès refusé' });
        }
      }

      if (!loan.signedContractUrl) {
        return res.status(404).json({ error: 'Aucun contrat signé trouvé pour ce prêt' });
      }

      if (!loan.signedContractCloudinaryPublicId) {
        if (loan.signedContractUrl.startsWith('http://') || loan.signedContractUrl.startsWith('https://')) {
          return res.redirect(loan.signedContractUrl);
        }

        const filePath = path.join(signedContractsDir, loan.signedContractUrl);
        
        if (!fs.existsSync(filePath)) {
          console.error(`[CONTRACT DOWNLOAD ERROR] File not found: ${filePath}`);
          return res.status(404).json({ 
            error: 'Le contrat signé n\'est pas disponible. Veuillez contacter le support.' 
          });
        }

        return res.download(filePath, `contrat_signe_${loan.id}.pdf`, (err) => {
          if (err) {
            console.error('Error downloading contract:', err);
            if (!res.headersSent) {
              res.status(500).json({ error: 'Erreur lors du téléchargement du contrat' });
            }
          }
        });
      }

      const signedUrl = cloudinary.utils.private_download_url(
        loan.signedContractCloudinaryPublicId,
        'raw',
        {
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          attachment: true,
          resource_type: 'raw',
        }
      );

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: req.session.userRole || 'user',
        action: 'download_signed_contract',
        entityType: 'loan',
        entityId: loan.id,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        metadata: { 
          loanAmount: loan.amount,
          loanStatus: loan.status,
          ownerId: loan.userId
        },
      });

      res.json({ 
        downloadUrl: signedUrl,
        expiresIn: 3600,
        fileName: `contrat_signe_${loan.id}.pdf`
      });
    } catch (error) {
      console.error('Contract download error:', error);
      res.status(500).json({ error: 'Erreur lors du téléchargement du contrat signé' });
    }
  });

  app.get("/api/transfers", requireAuth, async (req, res) => {
    try {
      const transfers = await storage.getUserTransfers(req.session.userId!);
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transfers' });
    }
  });

  // Vérifier si l'utilisateur a un transfert en cours (pour redirection automatique)
  app.get("/api/transfers/active", requireAuth, async (req, res) => {
    try {
      const activeTransfer = await storage.getActiveTransferForUser(req.session.userId!);
      
      if (activeTransfer) {
        // Récupérer les infos du prêt associé pour le contexte
        const loan = activeTransfer.loanId ? await storage.getLoan(activeTransfer.loanId) : null;
        
        res.json({
          hasActiveTransfer: true,
          transfer: {
            id: activeTransfer.id,
            status: activeTransfer.status,
            progressPercent: activeTransfer.progressPercent,
            codesValidated: activeTransfer.codesValidated,
            requiredCodes: activeTransfer.requiredCodes,
            amount: activeTransfer.amount,
            recipient: activeTransfer.recipient,
            createdAt: activeTransfer.createdAt,
            loanId: activeTransfer.loanId,
          },
          loan: loan ? {
            id: loan.id,
            amount: loan.amount,
            loanType: loan.loanType,
          } : null,
        });
      } else {
        res.json({ hasActiveTransfer: false });
      }
    } catch (error) {
      console.error('Error checking active transfer:', error);
      res.status(500).json({ error: 'Failed to check active transfer' });
    }
  });

  app.post("/api/transfers", requireAuth, requireCSRF, transferLimiter, async (req, res) => {
    try {
      const validated = insertTransferSchema.parse({
        ...req.body,
        userId: req.session.userId!,
      });

      const transactions = await storage.getUserTransactions(req.session.userId!);
      const balance = transactions.reduce((sum, tx) => {
        if (tx.type === 'credit') {
          return sum + parseFloat(tx.amount);
        } else if (tx.type === 'debit') {
          return sum - parseFloat(tx.amount);
        }
        return sum;
      }, 0);

      const transferAmount = parseFloat(validated.amount);
      const feeAmount = 25;
      const totalRequired = transferAmount + feeAmount;

      if (balance < totalRequired) {
        return res.status(400).json({ 
          error: `Solde insuffisant. Disponible: ${balance.toFixed(2)} EUR, Requis: ${totalRequired.toFixed(2)} EUR (montant ${transferAmount} EUR + frais ${feeAmount} EUR)` 
        });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      const activeLoans = await storage.getUserLoans(req.session.userId!);
      const hasActiveLoan = activeLoans.some(loan => loan.status === 'active');
      if (!hasActiveLoan) {
        return res.status(400).json({ 
          error: 'Aucun prêt actif trouvé. Vous devez avoir un prêt actif avec des fonds débloqués pour effectuer un transfert.' 
        });
      }

      if (user.externalTransfersBlocked) {
        const sanitizedReason = user.transferBlockReason 
          ? DOMPurify.sanitize(user.transferBlockReason, { ALLOWED_TAGS: [] })
          : 'Non spécifiée';
        return res.status(403).json({ 
          error: `Les transferts externes sont bloqués pour votre compte. Raison: ${sanitizedReason}` 
        });
      }

      const transfer = await storage.createTransfer(validated);
      
      await notifyAdminsNewTransfer(
        user.id,
        user.fullName,
        transfer.id,
        validated.amount,
        validated.recipient
      );
      
      await storage.createFee({
        userId: req.session.userId!,
        feeType: 'Frais de transfert',
        reason: `Transfert vers ${validated.recipient}`,
        amount: '25',
      });

      res.status(201).json(transfer);
    } catch (error) {
      console.error('Transfer creation error:', error);
      res.status(400).json({ error: 'Invalid transfer data' });
    }
  });

  app.post("/api/transfers/initiate", requireAuth, requireCSRF, transferLimiter, async (req, res) => {
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const startTime = Date.now();
    
    console.log('========================================');
    console.log(`[TRANSFER-INITIATE] ${requestId} - DÉBUT`);
    console.log(`[TRANSFER-INITIATE] ${requestId} - Timestamp: ${new Date().toISOString()}`);
    // 🔒 Log userId only in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[TRANSFER-INITIATE] ${requestId} - UserId: ${req.session.userId}`);
      console.log(`[TRANSFER-INITIATE] ${requestId} - Request body:`, JSON.stringify(req.body, null, 2));
    } else {
      console.log(`[TRANSFER-INITIATE] ${requestId} - Transfer initiated by authenticated user`);
    }
    
    try {
      const { amount, externalAccountId, recipient, loanId, transferNetwork, networkFees, processingTime } = req.body;
      
      console.log(`[TRANSFER-INITIATE] ${requestId} - Étape 1: Validation loanId`);
      if (!loanId) {
        console.error(`[TRANSFER-INITIATE] ${requestId} - ERREUR: loanId manquant`);
        return res.status(400).json({ error: 'Le prêt (loanId) est requis pour initier un transfert' });
      }

      console.log(`[TRANSFER-INITIATE] ${requestId} - Étape 2: Récupération du prêt (loanId: ${loanId})`);
      const loan = await storage.getLoan(loanId);
      if (!loan) {
        console.error(`[TRANSFER-INITIATE] ${requestId} - ERREUR: Prêt non trouvé (loanId: ${loanId})`);
        return res.status(404).json({ error: 'Prêt non trouvé' });
      }
      console.log(`[TRANSFER-INITIATE] ${requestId} - Prêt trouvé:`, JSON.stringify({ 
        loanId: loan.id, 
        userId: loan.userId, 
        status: loan.status,
        fundsAvailabilityStatus: loan.fundsAvailabilityStatus 
      }));

      console.log(`[TRANSFER-INITIATE] ${requestId} - Étape 3: Vérification propriétaire du prêt`);
      if (loan.userId !== req.session.userId) {
        // 🔒 Log sensitive data only in development
        if (process.env.NODE_ENV !== 'production') {
          console.error(`[TRANSFER-INITIATE] ${requestId} - ERREUR: Accès refusé - loan.userId: ${loan.userId} vs session.userId: ${req.session.userId}`);
        } else {
          console.error(`[TRANSFER-INITIATE] ${requestId} - ERREUR: Access denied - unauthorized loan access`);
        }
        return res.status(403).json({ error: 'Accès refusé - ce prêt ne vous appartient pas' });
      }

      console.log(`[TRANSFER-INITIATE] ${requestId} - Étape 4: Vérification disponibilité des fonds`);
      if (loan.fundsAvailabilityStatus !== 'available') {
        console.error(`[TRANSFER-INITIATE] ${requestId} - ERREUR: Fonds non disponibles - status: ${loan.fundsAvailabilityStatus}`);
        return res.status(400).json({ 
          error: 'Les fonds ne sont pas encore disponibles pour ce prêt. Veuillez attendre la confirmation du contrat par l\'administrateur.' 
        });
      }

      console.log(`[TRANSFER-INITIATE] ${requestId} - Étape 5: Vérification des transferts existants pour ce prêt`);
      const existingTransfers = await storage.getUserTransfers(req.session.userId!);
      const loanTransfers = existingTransfers.filter(t => t.loanId === loanId);
      console.log(`[TRANSFER-INITIATE] ${requestId} - ${loanTransfers.length} transfert(s) trouvé(s) pour ce prêt`);

      // Bloquer si un transfert est déjà complété
      const completedTransfer = loanTransfers.find(t => t.status === 'completed');
      if (completedTransfer) {
        console.error(`[TRANSFER-INITIATE] ${requestId} - ERREUR: Transfert déjà complété - ID: ${completedTransfer.id}`);
        return res.status(400).json({ 
          error: 'Un transfert a déjà été finalisé pour ce prêt. Impossible d\'initier un nouveau transfert.',
          existingTransferId: completedTransfer.id 
        });
      }

      // Bloquer si un transfert est en cours
      const activeTransfer = loanTransfers.find(t => 
        t.status === 'pending' || t.status === 'in-progress'
      );
      if (activeTransfer) {
        console.error(`[TRANSFER-INITIATE] ${requestId} - ERREUR: Transfert déjà actif - ID: ${activeTransfer.id}, status: ${activeTransfer.status}`);
        return res.status(409).json({ 
          error: 'Un transfert est déjà en cours pour ce prêt.',
          existingTransferId: activeTransfer.id,
          redirect: true
        });
      }

      console.log(`[TRANSFER-INITIATE] ${requestId} - ✓ Aucun transfert actif ou complété trouvé - Création autorisée`);
      
      console.log(`[TRANSFER-INITIATE] ${requestId} - Étape 6: Récupération des frais de transfert`);
      const settingFee = await storage.getAdminSetting('default_transfer_fee');
      const feeAmount = (settingFee?.settingValue as any)?.amount || 25;
      console.log(`[TRANSFER-INITIATE] ${requestId} - Frais de transfert: ${feeAmount}€`);
      
      const codesCount = 6;
      
      console.log(`[TRANSFER-INITIATE] ${requestId} - Étape 7: Création du transfert et des codes`);
      console.log(`[TRANSFER-INITIATE] ${requestId} - Paramètres transfert:`, JSON.stringify({
        userId: req.session.userId,
        loanId,
        externalAccountId: externalAccountId || null,
        amount: amount.toString(),
        recipient,
        feeAmount: feeAmount.toString(),
        codesCount
      }));
      
      const { transfer, codes: generatedCodes } = await storage.createTransferWithCodes({
        userId: req.session.userId!,
        loanId: loanId,
        externalAccountId: externalAccountId || null,
        amount: amount.toString(),
        recipient,
        transferNetwork: transferNetwork || 'SEPA',
        networkFees: networkFees?.toString() || '0',
        processingTime: processingTime || '1-2 jours ouvrables',
        status: 'pending',
        currentStep: 1,
        progressPercent: 0,
        feeAmount: feeAmount.toString(),
        requiredCodes: codesCount,
        codesValidated: 0,
      }, codesCount);
      
      console.log(`[TRANSFER-INITIATE] ${requestId} - Transfert créé avec succès - ID: ${transfer.id}`);
      console.log(`[TRANSFER-INITIATE] ${requestId} - ${generatedCodes.length} codes générés`);
      
      // CORRECTION CRITIQUE: Le transfert commence à 0% SANS pause
      // Il progressera automatiquement jusqu'au pausePercent du premier code
      // Une fois à ce pourcentage, le frontend demandera le code
      const firstCode = generatedCodes.find(c => c.sequence === 1);
      const firstCodePausePercent = firstCode?.pausePercent || 20;
      await storage.updateTransfer(transfer.id, {
        isPaused: false,
        pausePercent: firstCodePausePercent,
        status: 'in-progress',
      });
      console.log(`[TRANSFER-INITIATE] ${requestId} - État initial: transfert démarré à 0%, progressera jusqu'à ${firstCodePausePercent}% (premier code)`);
      
      // Enqueuer le progress job pour animer la progression du transfert
      console.log(`[TRANSFER-INITIATE] ${requestId} - Enqueueing progress job: 0% -> ${firstCodePausePercent}%`);
      enqueueProgressJob({
        transferId: transfer.id,
        userId: req.session.userId!,
        startPercent: 0,
        targetPercent: firstCodePausePercent,
      });
      console.log(`[TRANSFER-INITIATE] ${requestId} - Progress job enqueued successfully`);

      console.log(`[TRANSFER-INITIATE] ${requestId} - Étape 8: Notification utilisateur`);
      await notifyTransferInitiated(req.session.userId!, transfer.id, amount.toString(), recipient);
      console.log(`[TRANSFER-INITIATE] ${requestId} - Notification utilisateur envoyée`);

      console.log(`[TRANSFER-INITIATE] ${requestId} - Étape 9: Récupération des infos utilisateur`);
      const user = await storage.getUser(req.session.userId!);
      if (user) {
        console.log(`[TRANSFER-INITIATE] ${requestId} - Utilisateur: ${user.fullName} (${user.email})`);
        
        console.log(`[TRANSFER-INITIATE] ${requestId} - Étape 10: Notification administrateurs`);
        await notifyAdminsNewTransfer(
          user.id,
          user.fullName,
          transfer.id,
          amount.toString(),
          recipient
        );
        console.log(`[TRANSFER-INITIATE] ${requestId} - Notification admins envoyée`);

        // NOTE: Les codes ont déjà été envoyés à l'admin lors de la confirmation du contrat.
        // Pas besoin de les renvoyer lors de l'initiation du transfert.
        console.log(`[TRANSFER-INITIATE] ${requestId} - Étape 11: Codes déjà envoyés lors de la confirmation du contrat - pas de renvoi`);
      } else {
        console.warn(`[TRANSFER-INITIATE] ${requestId} - AVERTISSEMENT: Utilisateur non trouvé pour userId: ${req.session.userId}`);
      }

      console.log(`[TRANSFER-INITIATE] ${requestId} - Étape 12: Création événement transfert`);
      await storage.createTransferEvent({
        transferId: transfer.id,
        eventType: 'initiated',
        message: 'Virement initié - Traitement sécurisé en cours',
        metadata: { loanId, codesCount, transferId: transfer.id },
      });
      console.log(`[TRANSFER-INITIATE] ${requestId} - Événement créé`);

      const duration = Date.now() - startTime;
      console.log(`[TRANSFER-INITIATE] ${requestId} - SUCCÈS - Durée totale: ${duration}ms`);
      console.log('========================================');

      res.status(201).json({ 
        transfer,
        message: `Transfert initié avec succès.`,
        codesRequired: codesCount,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error('========================================');
      console.error(`[TRANSFER-INITIATE] ${requestId} - ÉCHEC - Durée: ${duration}ms`);
      console.error(`[TRANSFER-INITIATE] ${requestId} - Type d'erreur:`, error?.constructor?.name || 'Unknown');
      console.error(`[TRANSFER-INITIATE] ${requestId} - Message d'erreur:`, error?.message || 'No message');
      console.error(`[TRANSFER-INITIATE] ${requestId} - Erreur complète:`, JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error(`[TRANSFER-INITIATE] ${requestId} - Stack trace:`, error?.stack);
      
      if (error.code) {
        console.error(`[TRANSFER-INITIATE] ${requestId} - Code erreur:`, error.code);
      }
      if (error.detail) {
        console.error(`[TRANSFER-INITIATE] ${requestId} - Détail erreur:`, error.detail);
      }
      if (error.constraint) {
        console.error(`[TRANSFER-INITIATE] ${requestId} - Contrainte violée:`, error.constraint);
      }
      
      console.error('========================================');
      
      if (error.existingTransferId) {
        console.log(`[TRANSFER-INITIATE] ${requestId} - Transfert existant détecté: ${error.existingTransferId}`);
        return res.status(409).json({ 
          error: 'Un transfert est déjà en cours pour ce prêt',
          existingTransferId: error.existingTransferId,
          redirect: true
        });
      }
      
      const errorMessage = error?.message || 'Échec de l\'initiation du transfert. Veuillez réessayer ou contacter le support.';
      res.status(400).json({ error: errorMessage });
    }
  });

  app.get("/api/transfers/:id", requireAuth, async (req, res) => {
    try {
      const transfer = await storage.getTransfer(req.params.id);
      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      if (transfer.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      const events = await storage.getTransferEvents(req.params.id);
      const allCodes = await storage.getTransferCodes(transfer.id);
      
      // SÉCURITÉ CRITIQUE: Renvoyer les métadonnées des codes SANS exposer les valeurs
      // Les utilisateurs ont besoin de savoir quels codes existent pour afficher la progression
      // mais ne doivent JAMAIS voir les valeurs des codes non-consommés
      const codesMetadata = allCodes.map(code => ({
        id: code.id,
        sequence: code.sequence,
        pausePercent: code.pausePercent,
        codeContext: code.codeContext,
        expiresAt: code.expiresAt,
        consumedAt: code.consumedAt,
        deliveryMethod: code.deliveryMethod,
        isConsumed: code.consumedAt !== null,
        isPending: code.consumedAt === null,
      }));

      // Calculer le prochain code attendu
      const nextSequence = transfer.codesValidated < transfer.requiredCodes 
        ? transfer.codesValidated + 1 
        : null;

      res.json({ 
        transfer, 
        events, 
        codes: codesMetadata,
        nextSequence,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transfer' });
    }
  });

  app.post("/api/transfers/:id/send-code", requireAuth, requireCSRF, validationLimiter, async (req, res) => {
    try {
      const transfer = await storage.getTransfer(req.params.id);
      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      if (transfer.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      const nextSequence = transfer.codesValidated + 1;
      if (nextSequence > transfer.requiredCodes) {
        return res.status(400).json({ error: 'All codes already validated' });
      }

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      const settingFee = await storage.getAdminSetting('default_transfer_fee');
      const feeAmount = (settingFee?.settingValue as any)?.amount || 25;

      const { code, notification, fee } = await storage.issueCodeWithNotificationAndFee({
        transferId: transfer.id,
        userId: req.session.userId!,
        sequence: nextSequence,
        expiresAt,
        deliveryMethod: req.body.method || 'email',
        subject: `Code de validation ${nextSequence}/${transfer.requiredCodes}`,
        content: `Votre code de validation ${nextSequence} sur ${transfer.requiredCodes} est: {CODE}. Ce code expire dans 15 minutes. Un frais de ${feeAmount}€ sera automatiquement validé lors de l'utilisation de ce code.`,
        feeType: 'Frais de validation',
        feeAmount: feeAmount.toString(),
        feeReason: `Frais de validation ${nextSequence}/${transfer.requiredCodes} pour transfert vers ${transfer.recipient}`,
      });

      await storage.createTransferEvent({
        transferId: transfer.id,
        eventType: 'code_sent',
        message: 'Code de sécurité généré',
        metadata: { method: req.body.method || 'email', sequence: nextSequence, feeId: fee.id },
      });

      res.json({ 
        message: 'Code envoyé',
        sequence: nextSequence,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send code' });
    }
  });

  app.post("/api/transfers/:id/validate-code", requireAuth, requireCSRF, validationLimiter, async (req, res) => {
    try {
      const { code, sequence } = req.body;
      const transferId = req.params.id;
      
      // Pre-validation: Check ownership before attempting atomic validation
      const preCheckTransfer = await storage.getTransfer(transferId);
      
      if (!preCheckTransfer) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      if (preCheckTransfer.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      if (!preCheckTransfer.loanId) {
        return res.status(400).json({ 
          error: 'Ce transfert n\'est pas associé à un prêt. Impossible de valider les codes.' 
        });
      }

      // Use the atomic validation method with SELECT FOR UPDATE
      const result = await storage.validateTransferCodeAtomic(transferId, code, sequence);
      
      const { 
        transfer, 
        isComplete, 
        isPaused, 
        progress, 
        pausePercent, 
        nextSequence, 
        codeContext,
        codesValidated: newCodesValidated
      } = result;

      // Create validation success event
      await storage.createTransferEvent({
        transferId: transfer.id,
        eventType: 'code_validated',
        message: 'Autorisation de sécurité validée',
        metadata: { sequence, codesValidated: newCodesValidated },
      });

      // Emit real-time update with the fresh transfer data from the atomic transaction
      emitTransferUpdate(transfer.userId, 'updated', transfer.id, {
        id: transfer.id,
        progressPercent: transfer.progressPercent,
        codesValidated: transfer.codesValidated,
        status: transfer.status,
        isPaused: transfer.isPaused,
        pausePercent: transfer.pausePercent,
        currentStep: transfer.currentStep,
        updatedAt: transfer.updatedAt,
      });

      // Enqueue progress job for smooth visual progression if not yet at target
      // Use the previous progress (before this validation) as the starting point
      const previousProgressValue = preCheckTransfer.progressPercent || 0;
      const targetProgressValue = transfer.progressPercent || progress;
      if (!isComplete && targetProgressValue > previousProgressValue) {
        enqueueProgressJob({
          transferId: transfer.id,
          userId: transfer.userId,
          startPercent: previousProgressValue,
          targetPercent: targetProgressValue,
        });
      }

      // Handle pause state
      if (!isComplete && isPaused && pausePercent) {
        await storage.createTransferEvent({
          transferId: transfer.id,
          eventType: 'paused_automatically',
          message: `Transfert en pause - En attente de validation`,
          metadata: { pausePercent, nextSequence },
        });

        await storage.createAdminMessage({
          userId: transfer.userId,
          transferId: transfer.id,
          subject: `Transfert en pause`,
          content: `Votre transfert est temporairement en pause. Contactez votre conseiller pour obtenir le code de validation nécessaire.`,
          severity: 'info',
        });
      }

      // Handle transfer completion
      if (isComplete) {
        await storage.createTransferEvent({
          transferId: transfer.id,
          eventType: 'completed',
          message: 'Virement exécuté avec succès',
          metadata: { totalValidations: newCodesValidated, completedAt: transfer.completedAt },
        });

        const user = await storage.getUser(transfer.userId);
        const externalAccount = transfer.externalAccountId 
          ? await storage.getExternalAccount(transfer.externalAccountId)
          : null;

        if (user) {
          const recipientIban = externalAccount?.iban || 'Non spécifié';
          
          await createAdminMessageTransferCompleted(
            transfer.userId,
            transfer.id,
            transfer.amount.toString(),
            transfer.recipient,
            recipientIban
          );

          await notifyTransferCompleted(transfer.userId, transfer.id, transfer.amount.toString());

          try {
            const { sendTransferCompletedEmail, sendAdminTransferCompletionReport } = await import('./email');
            await sendTransferCompletedEmail(
              user.email,
              user.fullName,
              transfer.amount.toString(),
              transfer.recipient,
              recipientIban,
              transfer.id,
              user.preferredLanguage || 'fr'
            );
            console.log(`Transfer completion email sent to ${user.email}`);
          } catch (error) {
            console.error('Error sending transfer completion email to user:', error);
          }

          const allEvents = await storage.getTransferEvents(transfer.id);
          const adminUsers = await storage.getAllUsers();
          const admins = adminUsers.filter(u => u.role === 'admin');
          
          for (const admin of admins) {
            await storage.createAdminMessage({
              userId: admin.id,
              transferId: transfer.id,
              subject: `Rapport de transfert complété - ${transfer.id}`,
              content: `
**Rapport de transfert complété**

**Informations utilisateur**
- Utilisateur: ${user.fullName}
- Email: ${user.email}
- ID: ${user.id}

**Détails du transfert**
- Montant: ${transfer.amount} €
- Bénéficiaire: ${transfer.recipient}
- IBAN: ${recipientIban}
- ID transfert: ${transfer.id}

**Progression et validation**
- Codes validés: ${newCodesValidated}/${transfer.requiredCodes}
- Complété le: ${transfer.completedAt?.toLocaleString('fr-FR')}
- Nombre d'événements: ${allEvents.length}

Tous les codes de validation ont été vérifiés avec succès.`,
              severity: 'info',
            });

            try {
              const { sendAdminTransferCompletionReport } = await import('./email');
              await sendAdminTransferCompletionReport(
                user.fullName,
                user.email,
                transfer.id,
                transfer.amount.toString(),
                transfer.recipient,
                recipientIban,
                transfer.loanId || '',
                'fr'
              );
              console.log(`Transfer completion report sent to admin ${admin.email}`);
            } catch (error) {
              console.error(`Error sending transfer completion report to admin ${admin.email}:`, error);
            }
          }
        }
      }

      res.json({ 
        success: true,
        isComplete,
        isPaused,
        progress,
        pausePercent: isPaused ? pausePercent : null,
        nextSequence,
        codeContext,
        codesValidated: newCodesValidated,
        transfer: {
          id: transfer.id,
          progressPercent: transfer.progressPercent,
          codesValidated: transfer.codesValidated,
          status: transfer.status,
          isPaused: transfer.isPaused,
          pausePercent: transfer.pausePercent,
        },
      });
    } catch (error) {
      // Handle ValidationError with specific error codes
      if (error instanceof ValidationError) {
        const statusCode = error.code === 'NOT_FOUND' ? 404 :
                          error.code === 'ALREADY_CONSUMED' ? 409 :
                          error.code === 'INVALID_SEQUENCE' ? 400 :
                          error.code === 'EXPIRED' ? 400 :
                          error.code === 'INVALID_CODE' ? 400 : 500;
        
        // Log validation failure event
        try {
          await storage.createTransferEvent({
            transferId: req.params.id,
            eventType: 'validation_failed',
            message: error.message,
            metadata: { errorCode: error.code, sequence: req.body.sequence },
          });
        } catch (logError) {
          console.error('Failed to log validation error event:', logError);
        }
        
        return res.status(statusCode).json({ 
          error: error.message,
          code: error.code,
        });
      }
      
      console.error('Code validation error:', error);
      res.status(500).json({ error: 'Failed to validate code' });
    }
  });

  app.get("/api/external-accounts", requireAuth, async (req, res) => {
    try {
      const accounts = await storage.getUserExternalAccounts(req.session.userId!);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch external accounts' });
    }
  });

  app.post("/api/external-accounts", requireAuth, requireCSRF, async (req, res) => {
    try {
      const account = await storage.createExternalAccount({
        userId: req.session.userId!,
        bankName: req.body.bankName,
        bankCountry: req.body.bankCountry || null,
        iban: req.body.iban,
        bic: req.body.bic,
        accountLabel: req.body.accountLabel,
        isDefault: req.body.isDefault || false,
      });
      res.status(201).json(account);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create external account' });
    }
  });

  app.delete("/api/external-accounts/:id", requireAuth, requireCSRF, async (req, res) => {
    try {
      const account = await storage.getExternalAccount(req.params.id);
      if (!account) {
        return res.status(404).json({ error: 'External account not found' });
      }

      if (account.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      const deleted = await storage.deleteExternalAccount(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'External account not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete external account' });
    }
  });

  app.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getUserMessages(req.session.userId!);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post("/api/messages/:id/read", requireAuth, requireCSRF, async (req, res) => {
    try {
      const message = await storage.getMessage(req.params.id);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      if (message.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      const updatedMessage = await storage.markMessageAsRead(req.params.id);
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  });

  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const notifs = await storage.getUserNotifications(req.session.userId!, limit);
      res.json(notifs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  app.get("/api/notifications/unread-count", requireAuth, async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.session.userId!);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  });

  app.post("/api/notifications/:id/read", requireAuth, requireCSRF, async (req, res) => {
    try {
      const updatedNotif = await storage.markNotificationAsRead(req.params.id, req.session.userId!);
      if (!updatedNotif) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      res.json(updatedNotif);
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });

  app.post("/api/notifications/read-all", requireAuth, requireCSRF, async (req, res) => {
    try {
      const success = await storage.markAllNotificationsAsRead(req.session.userId!);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark all as read' });
    }
  });

  app.delete("/api/notifications/:id", requireAuth, requireCSRF, async (req, res) => {
    try {
      const deleted = await storage.deleteNotification(req.params.id, req.session.userId!);
      if (!deleted) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  });

  app.get("/api/fees", requireAuth, async (req, res) => {
    try {
      const fees = await storage.getUserFees(req.session.userId!);
      res.json(fees);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch fees' });
    }
  });

  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const transactions = await storage.getUserTransactions(req.session.userId!);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  app.get("/api/charts/available-funds", requireAuth, async (req, res) => {
    try {
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const dashboardData = await storage.getDashboardData(req.session.userId!);
      
      const totalBorrowed = dashboardData.loans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0);
      const totalRepaid = dashboardData.loans.reduce((sum, loan) => sum + parseFloat(loan.totalRepaid), 0);
      const currentBalance = totalBorrowed - totalRepaid;
      const maxCapacity = dashboardData.user.accountType === 'business' || dashboardData.user.accountType === 'professional' ? 2000000 : 500000;
      const availableCredit = maxCapacity - currentBalance;
      
      const data = months.map((month, index) => {
        const monthlyVariation = Math.sin(index * 0.5) * 20000;
        const transfersCommitted = dashboardData.transfers
          .filter(t => t.status === 'in-progress' || t.status === 'pending')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        return {
          month,
          available: Math.max(0, availableCredit + monthlyVariation),
          committed: transfersCommitted + (index * 2000),
          reserved: Math.max(0, 50000 - (index * 1000)),
        };
      });
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch chart data' });
    }
  });

  app.get("/api/charts/upcoming-repayments", requireAuth, async (req, res) => {
    try {
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const userLoans = await storage.getUserLoans(req.session.userId!);
      
      const activeLoans = userLoans.filter(loan => loan.status === 'active');
      
      if (activeLoans.length === 0) {
        return res.json([]);
      }
      
      const data = months.map((month, index) => {
        let totalAmount = 0;
        
        activeLoans.forEach((loan, loanIndex) => {
          const loanAmount = parseFloat(loan.amount);
          const monthlyPayment = loanAmount / loan.duration;
          const basePayment = monthlyPayment + (monthlyPayment * parseFloat(loan.interestRate) / 100 / 12);
          
          const monthlyVariation = Math.sin((index + loanIndex) * 0.7) * (basePayment * 0.1);
          totalAmount += Math.round(basePayment + monthlyVariation);
        });
        
        return {
          month,
          amount: totalAmount
        };
      });
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch chart data' });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithLoans = await Promise.all(
        users.map(async (user) => {
          const loans = await storage.getUserLoans(user.id);
          const transfers = await storage.getUserTransfers(user.id);
          const totalBorrowed = loans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0);
          const totalRepaid = loans.reduce((sum, loan) => sum + parseFloat(loan.totalRepaid), 0);
          return {
            ...user,
            balance: totalBorrowed - totalRepaid,
            loansCount: loans.length,
            transfersCount: transfers.length,
            verificationTier: user.verificationTier || 'bronze',
            completedLoansCount: user.completedLoansCount || 0,
            defaultedLoansCount: user.defaultedLoansCount || 0,
          };
        })
      );
      res.json(usersWithLoans);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.get("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const loans = await storage.getUserLoans(req.params.id);
      const transfers = await storage.getUserTransfers(req.params.id);
      const fees = await storage.getUserFees(req.params.id);
      res.json({ user, loans, transfers, fees });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user details' });
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, requireCSRF, async (req, res) => {
    try {
      const validatedData = adminUpdateUserSchema.parse(req.body);
      
      const updated = await storage.updateUser(req.params.id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'update_user',
        entityType: 'user',
        entityId: req.params.id,
        metadata: validatedData,
      });
      
      res.json(updated);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, requireCSRF, async (req, res) => {
    try {
      const userToDelete = await storage.getUser(req.params.id);
      
      // Prevent deletion of admin accounts - this is a critical security measure
      if (userToDelete?.role === 'admin') {
        return res.status(403).json({ error: 'Les comptes administrateur ne peuvent pas être supprimés' });
      }
      
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'delete_user',
        entityType: 'user',
        entityId: req.params.id,
        metadata: null,
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  app.post("/api/admin/users/bulk-delete", requireAuth, requireAdmin, requireCSRF, adminLimiter, async (req, res) => {
    try {
      const bulkDeleteSchema = z.object({
        userIds: z.array(z.string()).min(1, 'Au moins un utilisateur doit être sélectionné'),
        reason: z.string().min(5, 'Une justification de suppression est requise (minimum 5 caractères)'),
      });
      
      const { userIds, reason } = bulkDeleteSchema.parse(req.body);
      
      // Check if any of the users to delete are admins - prevent deletion of admin accounts
      const adminUsersInSelection = [];
      for (const id of userIds) {
        const user = await storage.getUser(id);
        if (user?.role === 'admin') {
          adminUsersInSelection.push(user.email || id);
        }
      }
      
      if (adminUsersInSelection.length > 0) {
        return res.status(403).json({ 
          error: `Les comptes administrateur ne peuvent pas être supprimés: ${adminUsersInSelection.join(', ')}` 
        });
      }
      
      const results = {
        success: [] as string[],
        failed: [] as string[],
      };

      for (const id of userIds) {
        try {
          const deleted = await storage.deleteUser(id);
          
          if (deleted) {
            results.success.push(id);
            
            await storage.createAuditLog({
              actorId: req.session.userId!,
              actorRole: 'admin',
              action: 'user_bulk_deleted',
              entityType: 'user',
              entityId: id,
              metadata: { reason, totalDeleted: userIds.length }
            });
          } else {
            results.failed.push(id);
          }
        } catch (error) {
          console.error(`Error deleting user ${id}:`, error);
          results.failed.push(id);
        }
      }

      res.json({ 
        message: `${results.success.length} utilisateur(s) supprimé(s) avec succès`,
        results 
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      console.error('Bulk delete users error:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression des utilisateurs' });
    }
  });

  app.get("/api/admin/transfers", requireAdmin, async (req, res) => {
    try {
      const transfers = await storage.getAllTransfers();
      const transfersWithUser = await Promise.all(
        transfers.map(async (transfer) => {
          const user = await storage.getUser(transfer.userId);
          return {
            ...transfer,
            userName: user?.fullName || 'Unknown',
            userEmail: user?.email || '',
          };
        })
      );
      res.json(transfersWithUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transfers' });
    }
  });

  app.patch("/api/admin/transfers/:id", requireAdmin, requireCSRF, async (req, res) => {
    try {
      const validatedData = adminUpdateTransferSchema.parse(req.body);
      
      const transfer = await storage.getTransfer(req.params.id);
      const updated = await storage.updateTransfer(req.params.id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: 'Transfer not found' });
      }
      
      const action = validatedData.status === 'suspended' ? 'suspend_transfer' : 
                     validatedData.approvedAt ? 'approve_transfer' : 'update_transfer';
      
      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action,
        entityType: 'transfer',
        entityId: req.params.id,
        metadata: validatedData,
      });
      
      if (transfer) {
        emitTransferUpdate(transfer.userId, 'updated', req.params.id, updated);
        emitDashboardUpdate(transfer.userId);
      }
      
      res.json(updated);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      res.status(500).json({ error: 'Failed to update transfer' });
    }
  });

  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getAdminSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.put("/api/admin/settings/:key", requireAdmin, requireCSRF, async (req, res) => {
    try {
      const validatedData = adminUpdateSettingSchema.parse(req.body);
      const updated = await storage.updateAdminSetting(req.params.key, validatedData.value, req.session.userId!);
      
      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'update_settings',
        entityType: 'admin_setting',
        entityId: updated.id,
        metadata: { settingKey: req.params.key, value: validatedData.value },
      });
      
      res.json(updated);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      res.status(500).json({ error: 'Failed to update setting' });
    }
  });

  app.post("/api/admin/messages", requireAdmin, requireCSRF, adminLimiter, async (req, res) => {
    try {
      const validatedData = adminSendMessageSchema.parse(req.body);
      
      const message = await storage.createAdminMessage({
        userId: validatedData.userId,
        transferId: validatedData.transferId || null,
        subject: validatedData.subject,
        content: validatedData.content,
        severity: validatedData.severity || 'info',
      });

      await notifyAdminMessage(
        validatedData.userId, 
        validatedData.subject, 
        (validatedData.severity as 'info' | 'success' | 'warning' | 'error') || 'info'
      );

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'send_message',
        entityType: 'admin_message',
        entityId: message.id,
        metadata: { userId: validatedData.userId, subject: validatedData.subject },
      });

      res.status(201).json(message);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getActivityStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  app.get("/api/admin/notifications", requireAdmin, async (req, res) => {
    try {
      const notifications = [];
      
      const allLoans = await storage.getAllLoans();
      const pendingLoans = allLoans.filter(loan => 
        loan.status === 'pending_review' && !loan.deletedAt
      );
      if (pendingLoans.length > 0) {
        notifications.push({
          id: 'loan_pending',
          type: 'loan_pending',
          title: 'Demandes de prêts en attente',
          description: `${pendingLoans.length} demande(s) de prêt nécessitent votre attention`,
          count: pendingLoans.length,
          href: '/admin/loans',
          createdAt: pendingLoans[0].createdAt,
        });
      }

      const signedContracts = allLoans.filter(loan => 
        loan.contractStatus === 'signed_pending_processing' && !loan.deletedAt
      );
      if (signedContracts.length > 0) {
        notifications.push({
          id: 'contract_signed',
          type: 'contract_signed',
          title: 'Contrats signés à traiter',
          description: `${signedContracts.length} contrat(s) signé(s) en attente de traitement`,
          count: signedContracts.length,
          href: '/admin/loans',
          createdAt: signedContracts[0].createdAt,
        });
      }

      const allUsers = await storage.getAllUsers();
      const pendingUsers = allUsers.filter(user => 
        user.status === 'pending' || user.kycStatus === 'pending'
      );
      if (pendingUsers.length > 0) {
        notifications.push({
          id: 'user_pending',
          type: 'user_pending',
          title: 'Utilisateurs en attente',
          description: `${pendingUsers.length} utilisateur(s) en attente de validation`,
          count: pendingUsers.length,
          href: '/admin/users',
          createdAt: pendingUsers[0].createdAt,
        });
      }

      const allKycDocs = await storage.getAllKycDocuments();
      const pendingKycDocs = allKycDocs.filter(doc => doc.status === 'pending');
      if (pendingKycDocs.length > 0) {
        notifications.push({
          id: 'kyc_pending',
          type: 'kyc_pending',
          title: 'Documents KYC à vérifier',
          description: `${pendingKycDocs.length} document(s) KYC en attente de vérification`,
          count: pendingKycDocs.length,
          href: '/admin/users',
          createdAt: pendingKycDocs[0].uploadedAt,
        });
      }

      notifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      res.json(notifications);
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // Endpoint optimisé pour récupérer uniquement les compteurs de notifications admin
  app.get("/api/admin/notifications-count", requireAdmin, async (req, res) => {
    try {
      const allLoans = await storage.getAllLoans();
      const allTransfers = await storage.getAllTransfers();
      
      // Demandes de prêts en attente
      const pendingLoans = allLoans.filter(loan => 
        loan.status === 'pending_review' && !loan.deletedAt
      ).length;

      // Contrats signés en attente de validation admin (fonds NON encore débloqués)
      // La notification apparaît quand le contrat est signé mais les fonds ne sont pas encore disponibles
      // Elle disparaît une fois que l'admin clique sur CONFIRME (fundsAvailabilityStatus devient 'available')
      const pendingSignedStatuses = [
        'awaiting_admin_review',
        'signed_pending_processing',
        'signed_pending_admin',
        'signed_pending_validation',
        'signed'
      ];
      const signedContracts = allLoans.filter(loan => 
        pendingSignedStatuses.includes(loan.contractStatus || '') && 
        loan.fundsAvailabilityStatus !== 'available' &&
        !loan.deletedAt
      ).length;

      // Transferts nécessitant un code de validation (en pause)
      const transfersRequiringCode = allTransfers.filter(transfer => 
        transfer.isPaused === true &&
        transfer.status === 'in-progress' &&
        !transfer.completedAt
      ).length;

      // Messages non lus dans le chat support (messages envoyés par utilisateurs à l'admin)
      const unreadMessagesResult = await db
        .select({ count: sqlDrizzle<number>`count(*)` })
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.senderType, 'user'),
            eq(chatMessages.isRead, false)
          )
        );
      const unreadMessages = Number(unreadMessagesResult[0]?.count || 0);

      res.json({
        pendingLoans,
        signedContracts,
        transfersRequiringCode,
        unreadMessages,
        total: pendingLoans + signedContracts + transfersRequiringCode + unreadMessages
      });
    } catch (error) {
      console.error('Error fetching admin notifications count:', error);
      res.status(500).json({ error: 'Failed to fetch notifications count' });
    }
  });

  app.post("/api/admin/clear-notifications-dashboard", requireAdmin, requireCSRF, adminLimiter, async (req, res) => {
    try {
      const allLoans = await storage.getAllLoans();
      let cleared = 0;
      
      for (const loan of allLoans) {
        const user = await storage.getUser(loan.userId);
        if (user) {
          const deletedPending = await storage.deleteAllNotificationsByType(user.id, 'loan_pending_admin');
          const deletedSigned = await storage.deleteAllNotificationsByType(user.id, 'contract_signed_admin');
          if (deletedPending || deletedSigned) cleared++;
        }
      }
      
      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'clear_notifications',
        entityType: 'admin_dashboard',
        entityId: 'dashboard',
        metadata: { clearedCount: cleared }
      });
      
      res.json({ success: true, message: 'Toutes les notifications ont été supprimées' });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression des notifications' });
    }
  });

  app.post("/api/admin/reset-statistics-dashboard", requireAdmin, requireCSRF, adminLimiter, async (req, res) => {
    try {
      // Actually reset all statistics by deleting data
      const result = await storage.resetDashboardStatistics();
      
      // Create audit log after successful reset
      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'reset_statistics',
        entityType: 'admin_dashboard',
        entityId: 'dashboard',
        metadata: { 
          timestamp: new Date(),
          deletedTransfers: result.deletedTransfers,
          deletedLoans: result.deletedLoans,
          deletedUsers: result.deletedUsers
        }
      });
      
      res.json({ 
        success: true, 
        message: 'Les statistiques ont été réinitialisées',
        deleted: result
      });
    } catch (error) {
      console.error('Error resetting statistics:', error);
      res.status(500).json({ error: 'Erreur lors de la réinitialisation des statistiques' });
    }
  });

  app.get("/api/admin/audit-logs", requireAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  app.get("/api/admin/loans", requireAdmin, async (req, res) => {
    try {
      const loans = await storage.getAllLoans();
      const loansWithUsers = await Promise.all(
        loans.map(async (loan) => {
          const user = await storage.getUser(loan.userId);
          return {
            ...loan,
            userName: user?.fullName || 'Unknown',
            userEmail: user?.email || '',
          };
        })
      );
      res.json(loansWithUsers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch loans' });
    }
  });

  app.post("/api/admin/loans/:id/approve", requireAdmin, requireCSRF, adminLimiter, async (req, res) => {
    try {
      console.log(`\n========================================`);
      console.log(`APPROBATION DE PRÊT - ID: ${req.params.id}`);
      console.log(`========================================`);
      
      const loan = await storage.getLoan(req.params.id);
      if (!loan) {
        console.error(`✗ Prêt non trouvé: ${req.params.id}`);
        return res.status(404).json({ error: 'Loan not found' });
      }
      console.log(`✓ Prêt trouvé: ${loan.id}, Montant: ${loan.amount}`);

      const user = await storage.getUser(loan.userId);
      if (!user) {
        console.error(`✗ Utilisateur non trouvé: ${loan.userId}`);
        return res.status(404).json({ error: 'User not found' });
      }
      console.log(`✓ Utilisateur trouvé: ${user.fullName} (${user.email})`);

      let contractUrl: string | null = null;
      let contractGenerated = false;

      console.log('\n--- Début génération de contrat PDF ---');
      try {
        const { generateContractPDF } = await import('./services/contractGenerator');
        contractUrl = await generateContractPDF(user, loan, user.preferredLanguage || 'fr');
        contractGenerated = true;
        console.log(`✓ SUCCÈS: Contrat généré à ${contractUrl}`);
      } catch (contractError: any) {
        console.error('\n✗✗✗ ERREUR LORS DE LA GÉNÉRATION DU CONTRAT PDF ✗✗✗');
        console.error('Type d\'erreur:', contractError?.name);
        console.error('Message d\'erreur:', contractError?.message);
        console.error('Stack trace:', contractError?.stack);
        console.error('Erreur complète:', JSON.stringify(contractError, Object.getOwnPropertyNames(contractError), 2));
        console.error('✗✗✗ FIN DE L\'ERREUR ✗✗✗\n');
        contractGenerated = false;
      }

      const updated = await storage.updateLoan(req.params.id, {
        status: 'approved',
        contractStatus: contractGenerated ? 'awaiting_user_signature' : 'none',
        approvedAt: new Date(),
        approvedBy: req.session.userId!,
        contractUrl,
      });

      await createAdminMessageLoanApproved(loan.userId, loan.amount, contractGenerated);

      await notifyLoanApproved(loan.userId, loan.id, loan.amount);

      if (contractGenerated && contractUrl) {
        await notifyLoanContractGenerated(loan.userId, loan.id, loan.amount);
        
        // Auto-update KYC status to verified when loan is approved AND contract is generated
        if (user.kycStatus !== 'verified') {
          await storage.updateUser(user.id, { kycStatus: 'verified' });
          console.log(`KYC status automatically set to verified for user ${user.id} (loan approved with contract)`);
        }
        
        try {
          const { sendContractEmail } = await import('./email');
          await sendContractEmail(
            user.email,
            user.fullName,
            loan.id,
            loan.amount,
            contractUrl,
            user.preferredLanguage || 'fr'
          );
        } catch (emailError) {
          console.error('Failed to send contract email, loan still approved:', emailError);
        }
      }

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'approve_loan',
        entityType: 'loan',
        entityId: req.params.id,
        metadata: { amount: loan.amount, loanType: loan.loanType, contractGenerated },
      });

      emitLoanUpdate(loan.userId, 'approved', req.params.id, updated);
      emitDashboardUpdate(loan.userId);
      if (contractGenerated) {
        emitContractUpdate(loan.userId, 'created', req.params.id);
      }

      res.json(updated);
    } catch (error) {
      console.error('Failed to approve loan:', error);
      res.status(500).json({ error: 'Failed to approve loan' });
    }
  });

  app.post("/api/admin/loans/:id/reject", requireAdmin, requireCSRF, adminLimiter, async (req, res) => {
    try {
      const validatedData = adminRejectLoanSchema.parse(req.body);
      const loan = await storage.getLoan(req.params.id);
      if (!loan) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      const updated = await storage.updateLoan(req.params.id, {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason: validatedData.reason,
      });

      await createAdminMessageLoanRejected(loan.userId, loan.amount, validatedData.reason);

      await notifyLoanRejected(loan.userId, loan.id, validatedData.reason);

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'reject_loan',
        entityType: 'loan',
        entityId: req.params.id,
        metadata: { amount: loan.amount, loanType: loan.loanType, reason: validatedData.reason },
      });

      emitLoanUpdate(loan.userId, 'rejected', req.params.id, updated);
      emitDashboardUpdate(loan.userId);

      res.json(updated);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      res.status(500).json({ error: 'Failed to reject loan' });
    }
  });

  app.post("/api/admin/loans/:id/confirm-contract", requireAdmin, requireCSRF, adminLimiter, async (req, res) => {
    try {
      const loan = await storage.getLoan(req.params.id);
      if (!loan) {
        return res.status(404).json({ error: 'Prêt non trouvé' });
      }

      if (!loan.contractUrl) {
        return res.status(400).json({ 
          error: 'Le contrat n\'a pas encore été généré. Veuillez d\'abord approuver la demande de prêt pour générer le contrat.' 
        });
      }

      const result = await storage.markLoanFundsAvailable(req.params.id, req.session.userId!);
      
      if (!result) {
        return res.status(500).json({ error: 'Erreur lors de la mise à jour du prêt' });
      }

      const { loan: updatedLoan, codes: generatedCodes } = result;
      const user = await storage.getUser(loan.userId);
      const userName = user?.fullName || 'Utilisateur';

      await createAdminMessageLoanFundsAvailable(loan.userId, loan.amount);

      await notifyLoanFundsAvailable(loan.userId, loan.id, loan.amount);

      const codesListFormatted = generatedCodes
        .map((c, idx) => `\n${idx + 1}. **${c.codeContext}** - Code: ${c.code} - Pause à ${c.pausePercent}%`)
        .join('');

      await storage.createNotification({
        userId: req.session.userId!,
        type: 'admin_message_sent',
        title: 'Codes de transfert générés automatiquement',
        message: `Les codes de transfert pour ${userName} (Prêt ${loan.amount} EUR) ont été générés avec des pourcentages de pause aléatoires. Transmettez-les manuellement au moment approprié.

**Liste des codes de validation:**${codesListFormatted}

**Note:** Le transfert se mettra automatiquement en pause à chaque pourcentage indiqué.`,
        severity: 'success',
        metadata: { 
          loanId: loan.id, 
          userName, 
          codesCount: generatedCodes.length, 
          amount: loan.amount,
          codes: generatedCodes.map(c => ({ 
            sequence: c.sequence, 
            code: c.code, 
            pausePercent: c.pausePercent,
            context: c.codeContext 
          }))
        },
      });

      try {
        const { sendTransferCodesAdminEmail } = await import('./email');
        const userForEmail = await storage.getUser(loan.userId);
        await sendTransferCodesAdminEmail(
          userName,
          userForEmail?.email || '',
          loan.id,
          loan.amount,
          generatedCodes.map(c => ({
            sequence: c.sequence,
            code: c.code,
            pausePercent: c.pausePercent!,
            codeContext: c.codeContext || `Code ${c.sequence}`
          })),
          'fr'
        );
      } catch (emailError) {
        console.error('Failed to send transfer codes admin email:', emailError);
      }

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'confirm_loan_contract',
        entityType: 'loan',
        entityId: req.params.id,
        metadata: { amount: loan.amount, loanType: loan.loanType, codesGenerated: generatedCodes.length },
      });

      emitLoanUpdate(loan.userId, 'confirmed', req.params.id, updatedLoan);
      emitContractUpdate(loan.userId, 'confirmed', req.params.id);
      emitDashboardUpdate(loan.userId);

      res.json({ 
        loan: updatedLoan,
        codes: generatedCodes,
        message: 'Contrat confirmé avec succès. Les fonds sont maintenant disponibles pour l\'utilisateur.'
      });
    } catch (error) {
      console.error('Failed to confirm loan contract:', error);
      res.status(500).json({ error: 'Erreur lors de la confirmation du contrat' });
    }
  });


  app.delete("/api/admin/loans/:id", requireAdmin, requireCSRF, async (req, res) => {
    try {
      const { reason } = req.body;
      const loan = await storage.getLoan(req.params.id);
      if (!loan) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      const deleted = await storage.deleteLoan(req.params.id, req.session.userId!, reason || 'Deleted by admin');

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'delete_loan',
        entityType: 'loan',
        entityId: req.params.id,
        metadata: { amount: loan.amount, loanType: loan.loanType, reason },
      });

      emitLoanUpdate(loan.userId, 'deleted', req.params.id);
      emitDashboardUpdate(loan.userId);

      res.json({ success: deleted });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete loan' });
    }
  });

  app.post("/api/admin/loans/bulk-delete", requireAuth, requireAdmin, requireCSRF, adminLimiter, async (req, res) => {
    try {
      const bulkDeleteSchema = z.object({
        loanIds: z.array(z.string()).min(1, 'Au moins un prêt doit être sélectionné'),
        reason: z.string().min(5, 'Une justification de suppression est requise (minimum 5 caractères)'),
      });
      
      const { loanIds, reason } = bulkDeleteSchema.parse(req.body);
      
      const results = {
        success: [] as string[],
        failed: [] as string[],
      };

      for (const id of loanIds) {
        try {
          const loan = await storage.getLoan(id);
          if (!loan) {
            results.failed.push(id);
            continue;
          }

          const deleted = await storage.deleteLoan(id, req.session.userId!, reason || 'Suppression en masse par admin');
          
          if (deleted) {
            results.success.push(id);
            
            await storage.createAuditLog({
              actorId: req.session.userId!,
              actorRole: 'admin',
              action: 'loan_bulk_deleted',
              entityType: 'loan',
              entityId: id,
              metadata: { amount: loan.amount, loanType: loan.loanType, reason, totalDeleted: loanIds.length }
            });

            emitLoanUpdate(loan.userId, 'deleted', id);
            emitDashboardUpdate(loan.userId);
          } else {
            results.failed.push(id);
          }
        } catch (error) {
          console.error(`Error deleting loan ${id}:`, error);
          results.failed.push(id);
        }
      }

      res.json({ 
        message: `${results.success.length} prêt(s) supprimé(s) avec succès`,
        results 
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      console.error('Bulk delete loans error:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression des prêts' });
    }
  });

  app.patch("/api/admin/users/:id/borrowing-capacity", requireAdmin, requireCSRF, async (req, res) => {
    try {
      const validatedData = adminBorrowingCapacitySchema.parse(req.body);
      const updated = await storage.updateUserBorrowingCapacity(req.params.id, validatedData.maxLoanAmount);
      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'update_borrowing_capacity',
        entityType: 'user',
        entityId: req.params.id,
        metadata: { maxAmount: validatedData.maxLoanAmount },
      });

      res.json(updated);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      res.status(500).json({ error: 'Failed to update borrowing capacity' });
    }
  });

  app.post("/api/admin/users/:id/suspend", requireAdmin, requireCSRF, adminLimiter, async (req, res) => {
    try {
      const validatedData = adminSuspendUserSchema.parse(req.body);
      const updated = await storage.suspendUser(req.params.id, new Date(validatedData.until), validatedData.reason);
      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }

      await storage.createAdminMessage({
        userId: req.params.id,
        transferId: null,
        subject: 'Compte suspendu temporairement',
        content: `Votre compte a été suspendu jusqu'au ${new Date(validatedData.until).toLocaleDateString('fr-FR')}. Raison: ${validatedData.reason}`,
        severity: 'error',
      });

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'suspend_user',
        entityType: 'user',
        entityId: req.params.id,
        metadata: { until: validatedData.until, reason: validatedData.reason },
      });

      res.json(updated);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      res.status(500).json({ error: 'Failed to suspend user' });
    }
  });

  app.post("/api/admin/users/:id/approve-kyc", requireAdmin, requireCSRF, adminLimiter, async (req, res) => {
    try {
      const updated = await db.update(users)
        .set({
          kycStatus: 'verified',
          kycApprovedAt: new Date(),
        })
        .where(eq(users.id, req.params.id))
        .returning();

      if (updated.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      await storage.createAdminMessage({
        userId: req.params.id,
        transferId: null,
        subject: 'KYC validé avec succès',
        content: `Votre vérification KYC a été validée avec succès par un administrateur. Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme.`,
        severity: 'success',
      });

      emitUserUpdate(req.params.id, 'updated', { kycStatus: 'verified' });
      res.json(updated[0]);
    } catch (error: any) {
      console.error('KYC approval error:', error);
      res.status(500).json({ error: 'Failed to approve KYC' });
    }
  });

  app.post("/api/admin/users/:id/block", requireAdmin, requireCSRF, adminLimiter, async (req, res) => {
    try {
      const validatedData = adminBlockUserSchema.parse(req.body);
      const updated = await storage.blockUser(req.params.id, validatedData.reason);
      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }

      await storage.createAdminMessage({
        userId: req.params.id,
        transferId: null,
        subject: 'Compte bloqué définitivement',
        content: `Votre compte a été bloqué définitivement. Raison: ${validatedData.reason}`,
        severity: 'error',
      });

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'block_user',
        entityType: 'user',
        entityId: req.params.id,
        metadata: { reason: validatedData.reason },
      });

      res.json(updated);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      res.status(500).json({ error: 'Failed to block user' });
    }
  });

  app.post("/api/admin/users/:id/unblock", requireAdmin, requireCSRF, async (req, res) => {
    try {
      const updated = await storage.unblockUser(req.params.id);
      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }

      await storage.createAdminMessage({
        userId: req.params.id,
        transferId: null,
        subject: 'Compte débloqué',
        content: `Votre compte a été débloqué et est maintenant actif.`,
        severity: 'success',
      });

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'unblock_user',
        entityType: 'user',
        entityId: req.params.id,
        metadata: null,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to unblock user' });
    }
  });

  app.post("/api/admin/users/:id/block-transfers", requireAdmin, requireCSRF, adminLimiter, async (req, res) => {
    try {
      const validatedData = adminBlockTransfersSchema.parse(req.body);
      const updated = await storage.blockExternalTransfers(req.params.id, validatedData.reason);
      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }

      await storage.createAdminMessage({
        userId: req.params.id,
        transferId: null,
        subject: 'Transferts externes bloqués',
        content: `Vos transferts vers des comptes externes ont été bloqués. Raison: ${validatedData.reason}`,
        severity: 'warning',
      });

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'block_transfers',
        entityType: 'user',
        entityId: req.params.id,
        metadata: { reason: validatedData.reason },
      });

      res.json(updated);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      res.status(500).json({ error: 'Failed to block transfers' });
    }
  });

  app.post("/api/admin/users/:id/unblock-transfers", requireAdmin, requireCSRF, async (req, res) => {
    try {
      const updated = await storage.unblockExternalTransfers(req.params.id);
      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }

      await storage.createAdminMessage({
        userId: req.params.id,
        transferId: null,
        subject: 'Transferts externes débloqués',
        content: `Vos transferts vers des comptes externes ont été débloqués.`,
        severity: 'success',
      });

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'unblock_transfers',
        entityType: 'user',
        entityId: req.params.id,
        metadata: null,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to unblock transfers' });
    }
  });

  app.post("/api/admin/transfers/:id/issue-code", requireAdmin, requireCSRF, adminLimiter, async (req, res) => {
    try {
      const validatedData = adminIssueCodeSchema.parse(req.body);
      const transfer = await storage.getTransfer(req.params.id);
      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      if (!transfer.loanId) {
        return res.status(400).json({ 
          error: 'Ce transfert n\'est pas associé à un prêt. Impossible de transmettre les codes de validation.' 
        });
      }

      const loan = await storage.getLoan(transfer.loanId);
      if (!loan) {
        return res.status(404).json({ error: 'Prêt associé non trouvé' });
      }

      const allLoanCodes = await storage.getLoanTransferCodes(transfer.loanId);
      if (allLoanCodes.length === 0) {
        return res.status(400).json({ 
          error: 'Aucun code de validation n\'a été généré pour ce prêt. Le contrat n\'a peut-être pas encore été confirmé.' 
        });
      }

      const unconsumedCodes = allLoanCodes.filter(c => !c.consumedAt);
      if (unconsumedCodes.length === 0) {
        return res.status(400).json({ 
          error: 'Tous les codes de validation ont déjà été utilisés pour ce prêt.' 
        });
      }

      const code = await storage.getLoanTransferCodeBySequence(transfer.loanId, validatedData.sequence);
      if (!code) {
        return res.status(404).json({ 
          error: `Code de validation #${validatedData.sequence} non trouvé pour ce prêt. Les codes disponibles sont de 1 à ${allLoanCodes.length}.` 
        });
      }

      if (code.consumedAt) {
        return res.status(409).json({ 
          error: `Le code de validation #${validatedData.sequence} a déjà été utilisé le ${code.consumedAt.toLocaleString('fr-FR')}. Veuillez transmettre le prochain code.` 
        });
      }

      await createAdminMessageCodeIssued(transfer.userId, req.params.id, validatedData.sequence, code.code);

      await notifyCodeIssued(transfer.userId, req.params.id, validatedData.sequence);

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'issue_validation_code',
        entityType: 'transfer',
        entityId: req.params.id,
        metadata: { sequence: validatedData.sequence, loanId: transfer.loanId, codeId: code.id, reusedExisting: true },
      });

      emitTransferUpdate(transfer.userId, 'updated', req.params.id);
      emitNotificationUpdate(transfer.userId, 'created');
      emitDashboardUpdate(transfer.userId);

      res.json(code);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      res.status(500).json({ error: 'Failed to issue validation code' });
    }
  });

  app.post("/api/admin/notifications/send-with-fee", requireAdmin, requireCSRF, adminLimiter, async (req, res) => {
    try {
      const validatedData = adminSendNotificationWithFeeSchema.parse(req.body);
      
      const result = await storage.sendNotificationWithFee(
        validatedData.userId,
        validatedData.subject,
        validatedData.content,
        validatedData.feeType,
        validatedData.feeAmount,
        validatedData.feeReason
      );

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'send_notification_with_fee',
        entityType: 'user',
        entityId: validatedData.userId,
        metadata: { subject: validatedData.subject, feeType: validatedData.feeType, feeAmount: validatedData.feeAmount },
      });

      emitNotificationUpdate(validatedData.userId, 'created');
      emitFeeUpdate(validatedData.userId, 'created');
      emitDashboardUpdate(validatedData.userId);

      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      res.status(500).json({ error: 'Failed to send notification with fee' });
    }
  });

  app.post("/api/admin/transfers/:id/issue-pause-code", requireAdmin, requireCSRF, adminLimiter, async (req, res) => {
    try {
      const transfer = await storage.getTransfer(req.params.id);
      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      if (!transfer.isPaused) {
        return res.status(400).json({ error: 'Transfer is not paused' });
      }

      const nanoid = (await import('nanoid')).nanoid;
      const code = nanoid(8).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      await db.insert(transferValidationCodes).values({
        transferId: transfer.id,
        code,
        deliveryMethod: 'admin',
        codeType: 'pause',
        sequence: transfer.pauseCodesValidated + 1,
        pausePercent: transfer.pausePercent!,
        expiresAt,
      });

      await createAdminMessagePauseCodeIssued(transfer.userId, transfer.id, code, 30);

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'issue_pause_code',
        entityType: 'transfer',
        entityId: req.params.id,
        metadata: { pausePercent: transfer.pausePercent },
      });

      emitTransferUpdate(transfer.userId, 'updated', req.params.id);
      emitNotificationUpdate(transfer.userId, 'created');
      emitDashboardUpdate(transfer.userId);

      res.json({ code, expiresAt });
    } catch (error) {
      console.error('Issue pause code error:', error);
      res.status(500).json({ error: 'Failed to issue pause code' });
    }
  });

  app.post("/api/transfers/:id/validate-pause-code", requireAuth, requireCSRF, validationLimiter, async (req, res) => {
    try {
      const { code } = req.body;
      const transfer = await storage.getTransfer(req.params.id);
      
      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      if (transfer.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      if (!transfer.isPaused) {
        return res.status(400).json({ error: 'Transfer is not paused' });
      }

      const validatedCode = await storage.validateCode(transfer.id, code, transfer.pauseCodesValidated + 1, 'pause');
      if (!validatedCode) {
        await storage.createTransferEvent({
          transferId: transfer.id,
          eventType: 'pause_validation_failed',
          message: 'Code de sécurité incorrect',
          metadata: { pausePercent: transfer.pausePercent },
        });
        return res.status(400).json({ error: 'Invalid or expired code' });
      }

      const newPauseCodesValidated = transfer.pauseCodesValidated + 1;
      
      await storage.updateTransfer(transfer.id, {
        pauseCodesValidated: newPauseCodesValidated,
        isPaused: false,
        pausePercent: null,
      });

      await storage.createTransferEvent({
        transferId: transfer.id,
        eventType: 'pause_unlocked',
        message: 'Virement débloqué - Traitement en cours',
        metadata: { previousPausePercent: transfer.pausePercent },
      });

      const settingPausePercentages = await storage.getAdminSetting('validation_pause_percentages');
      const pausePercentages = (settingPausePercentages?.settingValue as number[]) || [];
      const remainingPauses = pausePercentages.filter(p => p > (transfer.pausePercent || 0));

      if (remainingPauses.length > 0) {
        const nextPausePercent = remainingPauses[0];
        setTimeout(async () => {
          const currentTransfer = await storage.getTransfer(transfer.id);
          if (!currentTransfer || currentTransfer.status === 'completed') return;

          await storage.updateTransfer(transfer.id, {
            progressPercent: nextPausePercent,
            isPaused: true,
            pausePercent: nextPausePercent,
          });

          await storage.createTransferEvent({
            transferId: transfer.id,
            eventType: 'paused',
            message: 'Virement en attente de validation',
            metadata: { pausePercent: nextPausePercent },
          });

          await storage.createAdminMessage({
            userId: transfer.userId,
            transferId: transfer.id,
            subject: 'Code de déblocage requis',
            content: `Votre transfert vers ${transfer.recipient} est temporairement en pause. Veuillez contacter votre conseiller pour obtenir le code de déblocage.`,
            severity: 'warning',
          });
        }, 3000);
      } else {
        setTimeout(async () => {
          const currentTransfer = await storage.getTransfer(transfer.id);
          if (!currentTransfer || currentTransfer.status === 'completed') return;

          await storage.updateTransfer(transfer.id, {
            status: 'completed',
            progressPercent: 100,
            completedAt: new Date(),
          });

          // Tier system: increment completed loans count and check for upgrade
          if (currentTransfer.loanId) {
            const loan = await storage.getLoan(currentTransfer.loanId);
            if (loan) {
              const user = await storage.getUser(loan.userId);
              if (user) {
                // Increment completed loans count
                await storage.updateUser(loan.userId, {
                  completedLoansCount: user.completedLoansCount + 1,
                });
                
                // Check and auto-upgrade tier
                const tierUpgrade = await storage.checkAndUpgradeTier(loan.userId);
                if (tierUpgrade.upgraded) {
                  console.log(`[TIER SYSTEM] User ${loan.userId} upgraded from ${tierUpgrade.oldTier} to ${tierUpgrade.newTier}`);
                }
              }
            }
          }

          await storage.createTransferEvent({
            transferId: transfer.id,
            eventType: 'completed',
            message: 'Virement exécuté avec succès',
            metadata: null,
          });
        }, 3000);
      }

      res.json({ 
        success: true,
        message: 'Code validé - transfert débloqué',
      });
    } catch (error) {
      console.error('Validate pause code error:', error);
      res.status(500).json({ error: 'Failed to validate pause code' });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const contactSchema = z.object({
        name: z.string().min(1, 'Le nom est requis'),
        email: z.string().email('Email invalide'),
        phone: z.string().optional(),
        message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
      });

      const validatedData = contactSchema.parse(req.body);
      const { sendContactFormEmail } = await import('./email');
      
      await sendContactFormEmail(
        validatedData.name,
        validatedData.email,
        validatedData.phone || '',
        validatedData.message
      );

      res.json({ 
        success: true,
        message: 'Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Contact form error:', error);
      res.status(500).json({ error: 'Erreur lors de l\'envoi du message. Veuillez réessayer plus tard.' });
    }
  });

  app.get("/api/fees/unpaid", requireAuth, async (req, res) => {
    try {
      const fees = await storage.getUnpaidFees(req.session.userId!);
      res.json(fees);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch unpaid fees' });
    }
  });

  app.get("/robots.txt", (req, res) => {
    const robots = `User-agent: *
Allow: /
Allow: /about
Allow: /how-it-works
Allow: /contact
Allow: /products
Allow: /resources
Allow: /terms
Allow: /privacy

Disallow: /dashboard
Disallow: /admin
Disallow: /api/
Disallow: /auth
Disallow: /verify
Disallow: /settings
Disallow: /transfers
Disallow: /loans/request

Sitemap: ${process.env.VITE_SITE_URL || 'https://www.altusfinancesgroup.com'}/sitemap.xml`;
    
    res.type('text/plain');
    res.send(robots);
  });

  app.get("/sitemap.xml", (req, res) => {
    const baseUrl = process.env.VITE_SITE_URL || 'https://www.altusfinancesgroup.com';
    const currentDate = new Date().toISOString().split('T')[0];
    
    const urls = [
      { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: currentDate },
      { loc: '/about', priority: '0.8', changefreq: 'monthly', lastmod: currentDate },
      { loc: '/how-it-works', priority: '0.8', changefreq: 'monthly', lastmod: currentDate },
      { loc: '/contact', priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
      { loc: '/products', priority: '0.9', changefreq: 'weekly', lastmod: currentDate },
      { loc: '/resources', priority: '0.6', changefreq: 'monthly', lastmod: currentDate },
      { loc: '/terms', priority: '0.3', changefreq: 'yearly', lastmod: currentDate },
      { loc: '/privacy', priority: '0.3', changefreq: 'yearly', lastmod: currentDate },
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(url => `  <url>
    <loc>${baseUrl}${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${baseUrl}/fr${url.loc}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en${url.loc}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${baseUrl}/es${url.loc}"/>
    <xhtml:link rel="alternate" hreflang="pt" href="${baseUrl}/pt${url.loc}"/>
    <xhtml:link rel="alternate" hreflang="it" href="${baseUrl}/it${url.loc}"/>
    <xhtml:link rel="alternate" hreflang="de" href="${baseUrl}/de${url.loc}"/>
  </url>`).join('\n')}
</urlset>`;

    res.type('application/xml');
    res.send(sitemap);
  });


  // ============================================================
  // CHAT SYSTEM ROUTES
  // ============================================================

  // Schéma de validation pour créer une conversation
  const createConversationSchema = insertChatConversationSchema.extend({
    subject: z.string().optional(),
  });

  // Schéma de validation pour envoyer un message
  const sendMessageSchema = insertChatMessageSchema.extend({
    content: z.string().min(1, 'Le message ne peut pas être vide').max(500, 'Le message dépasse la limite de 500 caractères'),
  });

  // Configure multer for chat file uploads with strict validation
  const chatUploadDir = path.join(process.cwd(), 'uploads', 'chat');
  if (!fs.existsSync(chatUploadDir)) {
    fs.mkdirSync(chatUploadDir, { recursive: true });
  }

  // Temporary directory for multer uploads before validation
  const chatTempDir = path.join(process.cwd(), 'uploads', 'chat_temp');
  if (!fs.existsSync(chatTempDir)) {
    fs.mkdirSync(chatTempDir, { recursive: true });
  }

  const chatUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, chatTempDir);
      },
      filename: (req, file, cb) => {
        // Use UUID for temporary file
        const tempName = `${randomUUID()}_${Date.now()}`;
        cb(null, tempName);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (matches KYC documents)
    fileFilter: (req, file, cb) => {
      // Initial quick validation - will do strict validation in endpoint
      const allowedTypes = /jpeg|jpg|pdf/i;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      if (extname) {
        return cb(null, true);
      } else {
        cb(new Error('Type de fichier non autorisé. Formats acceptés: JPEG, JPG, PDF'));
      }
    },
  });

  // Direct local upload endpoint with security validation
  app.post("/api/chat/upload", requireAuth, requireCSRF, chatUpload.single('file'), async (req, res) => {
    let tempFilePath: string | null = null;
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }
      
      tempFilePath = req.file.path;
      const { validateAndCleanFile, deleteTemporaryFile } = await import('./fileValidator');
      
      // Validate and clean file with magic byte verification
      const cleanedFile = await validateAndCleanFile(tempFilePath, req.file.originalname);
      console.log(`✓ Chat file cleaned and validated: ${cleanedFile.filename}`);
      
      // Save cleaned file with UUID name
      const uniqueFileName = `${randomUUID()}_${cleanedFile.filename}`;
      const finalFilePath = path.join(chatUploadDir, uniqueFileName);
      await fs.promises.writeFile(finalFilePath, cleanedFile.buffer);
      
      const fileUrl = `/uploads/chat/${uniqueFileName}`;
      
      // Delete temporary file
      await deleteTemporaryFile(tempFilePath);
      
      // Create audit log for file upload
      try {
        await storage.createAuditLog({
          actorId: req.session.userId!,
          actorRole: req.session.userRole || 'user',
          action: 'upload_chat_file',
          entityType: 'chat_message',
          entityId: 'pending',
          metadata: { 
            fileName: cleanedFile.filename,
            mimeType: cleanedFile.mimeType,
            originalName: req.file.originalname
          }
        });
      } catch (auditError) {
        console.error('Failed to create audit log for chat file upload:', auditError);
      }
      
      res.json({ 
        fileUrl, 
        fileName: cleanedFile.filename,
        mimeType: cleanedFile.mimeType
      });
    } catch (error: any) {
      console.error('[CHAT] Upload error:', error);
      
      // Clean up temp file on error
      if (tempFilePath) {
        try {
          const { deleteTemporaryFile } = await import('./fileValidator');
          await deleteTemporaryFile(tempFilePath);
        } catch (cleanupError) {
          console.error('Failed to cleanup temp file:', cleanupError);
        }
      }
      
      if (error.message?.includes('Type de fichier')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message?.includes('dépasse la taille')) {
        return res.status(413).json({ error: 'Le fichier dépasse la taille maximale autorisée (10MB)' });
      }
      if (error.message?.includes('non autorisé')) {
        return res.status(400).json({ error: 'Type de fichier non autorisé. Formats acceptés: PDF, JPEG, PNG, WEBP' });
      }
      
      res.status(500).json({ error: 'Erreur lors de l\'envoi du fichier' });
    }
  });

  // Request presigned upload URL for Supabase Storage
  app.post("/api/chat/upload/request", requireAuth, requireCSRF, async (req, res) => {
    try {
      const { fileName, fileType } = req.body;
      
      if (!fileName || !fileType) {
        return res.status(400).json({ error: 'fileName and fileType required' });
      }

      const result = await generateUploadUrl(fileName, fileType);
      
      res.json({
        uploadUrl: result.uploadUrl,
        storagePath: result.storagePath,
      });
    } catch (error: any) {
      console.error('[CHAT] Upload URL request error:', error);
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  });

  // Get presigned download URL for viewing/previewing
  app.post("/api/chat/file/presign", requireAuth, async (req, res) => {
    try {
      const { storagePath } = req.body;
      
      if (!storagePath) {
        return res.status(400).json({ error: 'storagePath required' });
      }

      const downloadUrl = await generateDownloadUrl(storagePath);
      
      res.json({ url: downloadUrl });
    } catch (error: any) {
      console.error('[CHAT] Download URL request error:', error);
      res.status(500).json({ error: 'Failed to generate download URL' });
    }
  });

  // Serve chat files - PUBLIC endpoint (no auth required)
  // Files are already validated on upload (magic bytes, size limit, sanitized)
  app.get("/api/chat/file/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const filepath = path.join(chatUploadDir, filename);
      
      // Remove CSP header that blocks iframe embedding
      res.removeHeader("Content-Security-Policy");
      
      // Allow embedding in iframe from frontend domains
      res.setHeader(
        "Content-Security-Policy",
        "frame-ancestors https://altusfinancesgroup.com https://www.altusfinancesgroup.com https://dashboard.altusfinancesgroup.com"
      );
      
      // CORS headers for cross-origin requests
      res.setHeader("Access-Control-Allow-Origin", "https://altusfinancesgroup.com");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      
      // Security: ensure the file is within the chat upload directory (prevent path traversal)
      if (!filepath.startsWith(chatUploadDir)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Check if file exists
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // For PDFs, serve inline so embed can display them
      if (filename.toLowerCase().endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
        res.sendFile(filepath);
      } else {
        // For images, serve inline
        res.sendFile(filepath);
      }
    } catch (error: any) {
      console.error('[CHAT] File download error:', error);
      res.status(500).json({ error: 'File download failed' });
    }
  });

  // CONVERSATIONS - User routes
  app.get("/api/chat/conversations", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error: any) {
      console.error('[CHAT] Erreur récupération conversations:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
    }
  });

  // CONVERSATIONS - Admin routes
  app.get("/api/chat/conversations/admin", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
      }

      const { adminId, status } = req.query;
      const conversations = await storage.getAdminConversations(
        adminId as string | undefined,
        status as string | undefined
      );

      // Enrichir les conversations avec les infos utilisateur et unread count
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const userData = await storage.getUser(conv.userId);
          const unreadCount = await storage.getUnreadMessageCount(conv.id, conv.assignedAdminId || '');
          return {
            ...conv,
            userName: userData?.fullName || conv.userId,
            userEmail: userData?.email || '',
            userPhone: userData?.phone || '',
            unreadCount: unreadCount,
            hasConversation: true,
          };
        })
      );

      // Récupérer tous les utilisateurs non-admin qui n'ont pas encore de conversation
      const allUsers = await storage.getAllUsers();
      const usersWithConversations = new Set(conversations.map(c => c.userId));
      
      const usersWithoutConversations = allUsers
        .filter(u => u.role !== 'admin' && !usersWithConversations.has(u.id))
        .map(u => ({
          id: `virtual-${u.id}`,
          userId: u.id,
          subject: 'Nouvelle conversation',
          status: 'open',
          assignedAdminId: null,
          lastMessageAt: u.createdAt,
          createdAt: u.createdAt,
          updatedAt: u.createdAt,
          userName: u.fullName || u.email,
          userEmail: u.email || '',
          userPhone: u.phone || '',
          unreadCount: 0,
          hasConversation: false,
        }));

      // Combiner et trier : conversations avec messages d'abord, puis utilisateurs sans conversation
      const allConversations = [...enrichedConversations, ...usersWithoutConversations];
      
      // Trier par date du dernier message (conversations actives en premier)
      allConversations.sort((a, b) => {
        // Les conversations avec messages non lus en premier
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
        if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
        // Puis par hasConversation (vraies conversations d'abord)
        if (a.hasConversation && !b.hasConversation) return -1;
        if (!a.hasConversation && b.hasConversation) return 1;
        // Puis par date
        const dateA = new Date(a.lastMessageAt || a.createdAt).getTime();
        const dateB = new Date(b.lastMessageAt || b.createdAt).getTime();
        return dateB - dateA;
      });

      res.json(allConversations);
    } catch (error: any) {
      console.error('[CHAT] Erreur récupération conversations admin:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
    }
  });

  // Get single conversation
  app.get("/api/chat/conversations/:id", requireAuth, async (req, res) => {
    try {
      const conversationId = req.params.id;
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation non trouvée' });
      }

      // Vérifier l'autorisation
      if (user?.role !== 'admin' && conversation.userId !== userId) {
        return res.status(403).json({ error: 'Accès non autorisé à cette conversation' });
      }

      res.json(conversation);
    } catch (error: any) {
      console.error('[CHAT] Erreur récupération conversation:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de la conversation' });
    }
  });

  // Create new conversation
  app.post("/api/chat/conversations", requireAuth, requireCSRF, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const validation = createConversationSchema.safeParse({
        ...req.body,
        userId,
      });

      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Données invalides', 
          details: validation.error.issues 
        });
      }

      const conversation = await storage.createConversation(validation.data);
      res.status(201).json(conversation);
    } catch (error: any) {
      console.error('[CHAT] Erreur création conversation:', error);
      res.status(500).json({ error: 'Erreur lors de la création de la conversation' });
    }
  });

  // Update conversation (status, subject)
  app.patch("/api/chat/conversations/:id", requireAuth, requireCSRF, async (req, res) => {
    try {
      const conversationId = req.params.id;
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation non trouvée' });
      }

      // Vérifier l'autorisation
      if (user?.role !== 'admin' && conversation.userId !== userId) {
        return res.status(403).json({ error: 'Accès non autorisé à cette conversation' });
      }

      const { status, subject } = req.body;
      const updates: Partial<ChatConversation> = {};
      
      if (status) updates.status = status;
      if (subject) updates.subject = subject;

      const updated = await storage.updateConversation(conversationId, updates);
      res.json(updated);
    } catch (error: any) {
      console.error('[CHAT] Erreur mise à jour conversation:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de la conversation' });
    }
  });

  // Assign conversation to admin
  app.post("/api/chat/conversations/:id/assign", requireAuth, requireCSRF, async (req, res) => {
    try {
      const conversationId = req.params.id;
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
      }

      const { adminId } = req.body;
      if (!adminId) {
        return res.status(400).json({ error: 'ID admin requis' });
      }

      // Get previous assignment for socket notifications
      const conversation = await storage.getConversation(conversationId);
      const previousAdminId = conversation?.assignedAdminId;

      const updated = await storage.assignConversationToAdmin(conversationId, adminId);
      
      // Emit socket events to both previous and new admin for immediate unread sync
      if (io) {
        // Notify new admin
        io.emit("conversation_assigned", {
          conversationId,
          newAdminId: adminId,
          previousAdminId
        });
        
        // Trigger unread revalidation for both admins
        if (previousAdminId) {
          io.emit("unread_sync_required", { userId: previousAdminId });
        }
        io.emit("unread_sync_required", { userId: adminId });
      }
      
      res.json(updated);
    } catch (error: any) {
      console.error('[CHAT] Erreur assignation conversation:', error);
      res.status(500).json({ error: 'Erreur lors de l\'assignation de la conversation' });
    }
  });

  // Delete conversation (admin only)
  app.delete("/api/chat/conversations/:id", requireAuth, requireCSRF, async (req, res) => {
    try {
      const conversationId = req.params.id;
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
      }

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation non trouvée' });
      }

      const deleted = await storage.deleteConversation(conversationId);
      
      if (!deleted) {
        return res.status(500).json({ error: 'Impossible de supprimer la conversation' });
      }

      // Emit socket event to notify all admins
      if (io) {
        io.emit('conversation_deleted', { conversationId });
      }

      res.json({ success: true, message: 'Conversation supprimée définitivement' });
    } catch (error: any) {
      console.error('[CHAT] Erreur suppression conversation:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression de la conversation' });
    }
  });

  // MESSAGES - Get messages for a conversation
  app.get("/api/chat/conversations/:id/messages", requireAuth, async (req, res) => {
    try {
      const conversationId = req.params.id;
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation non trouvée' });
      }

      // Vérifier l'autorisation
      if (user?.role !== 'admin' && conversation.userId !== userId) {
        return res.status(403).json({ error: 'Accès non autorisé à cette conversation' });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const messages = await storage.getConversationMessages(conversationId, limit);
      
      res.json(messages);
    } catch (error: any) {
      console.error('[CHAT] Erreur récupération messages:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
    }
  });

  // Send a message
  app.post("/api/chat/messages", requireAuth, requireCSRF, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);

      const validation = sendMessageSchema.safeParse({
        ...req.body,
        senderId: userId,
        senderType: user?.role === 'admin' ? 'admin' : 'user',
      });

      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Données invalides', 
          details: validation.error.issues 
        });
      }

      // Vérifier que la conversation existe et que l'utilisateur y a accès
      let conversation = await storage.getConversation(validation.data.conversationId);
      
      // Si la conversation n'existe pas et que l'utilisateur n'est pas admin, créer une nouvelle conversation
      if (!conversation && user?.role !== 'admin') {
        conversation = await storage.createConversation({
          userId,
          subject: 'Support Chat',
        });
        
        // Mettre à jour validation.data avec le nouvel ID de conversation
        validation.data.conversationId = conversation.id;
        
        console.log(`[CHAT] Nouvelle conversation créée automatiquement: ${conversation.id} pour l'utilisateur ${userId}`);
      }

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation non trouvée' });
      }

      if (user?.role !== 'admin' && conversation.userId !== userId) {
        return res.status(403).json({ error: 'Accès non autorisé à cette conversation' });
      }

      const message = await storage.createChatMessage(validation.data);
      
      // Émettre l'événement socket pour notifier les autres utilisateurs
      // Le message est non lu pour le destinataire (celui qui reçoit)
      io.emit('chat:new-message', {
        ...message,
        isRead: false, // Nouveau message = non lu par défaut
      });
      
      // Émettre un événement d'invalidation des comptes non lus pour le destinataire
      const recipientId = user?.role === 'admin' ? conversation.userId : (conversation.assignedAdminId || 'admin');
      io.emit('unread_sync_required', { userId: recipientId });
      
      res.status(201).json(message);
    } catch (error: any) {
      console.error('[CHAT] Erreur envoi message:', error);
      res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
    }
  });

  // Mark messages as read
  app.patch("/api/chat/messages/read", requireAuth, requireCSRF, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { conversationId } = req.body;

      if (!conversationId) {
        return res.status(400).json({ error: 'ID de conversation requis' });
      }

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation non trouvée' });
      }

      const user = await storage.getUser(userId);
      if (user?.role !== 'admin' && conversation.userId !== userId) {
        return res.status(403).json({ error: 'Accès non autorisé à cette conversation' });
      }

      const count = await storage.markMessagesAsRead(conversationId, userId);
      
      // CRITICAL: Emit socket event to update badge in real-time
      // This is essential for the badge to disappear immediately when messages are marked as read
      const unreadCount = await storage.getUnreadMessageCount(conversationId, userId);
      io.to(`user:${userId}`).emit('chat:unread-count', {
        conversationId: conversationId,
        count: unreadCount,
      });
      
      // Also notify the other party that their message was read
      const otherUserId = user?.role === 'admin' ? conversation.userId : (conversation.assignedAdminId || 'admin');
      if (otherUserId) {
        io.to(`user:${otherUserId}`).emit('chat:read-receipt', {
          conversationId: conversationId,
          readBy: userId,
        });
      }
      
      res.json({ markedAsRead: count });
    } catch (error: any) {
      console.error('[CHAT] Erreur marquage messages lus:', error);
      res.status(500).json({ error: 'Erreur lors du marquage des messages comme lus' });
    }
  });

  // Get all unread message counts for user
  app.get("/api/chat/unread/:userId", requireAuth, async (req, res) => {
    try {
      const targetUserId = req.params.userId;
      const currentUserId = req.session.userId!;
      const user = await storage.getUser(currentUserId);

      // Only allow users to see their own unread counts, or admins to see any
      if (user?.role !== 'admin' && targetUserId !== currentUserId) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      // If admin is querying their own unread counts, use dedicated unread method
      // that includes all assigned conversations regardless of status
      let conversations;
      if (user?.role === 'admin' && targetUserId === currentUserId) {
        // Admin viewing their own unread: all assigned conversations (open+closed+resolved)
        conversations = await storage.getAdminConversationsForUnread(targetUserId);
      } else {
        // User viewing their own conversations OR admin viewing user's conversations
        conversations = await storage.getUserConversations(targetUserId);
      }
      
      const unreadCounts = await Promise.all(
        conversations.map(async (conv) => ({
          conversationId: conv.id,
          count: await storage.getUnreadMessageCount(conv.id, targetUserId)
        }))
      );

      // Return all counts including zeros for stable badge state
      res.json(unreadCounts);
    } catch (error: any) {
      console.error('[CHAT] Erreur comptage messages non lus utilisateur:', error);
      res.status(500).json({ error: 'Erreur lors du comptage des messages non lus' });
    }
  });

  // Get unread message count
  app.get("/api/chat/conversations/:id/unread", requireAuth, async (req, res) => {
    try {
      const conversationId = req.params.id;
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation non trouvée' });
      }

      if (user?.role !== 'admin' && conversation.userId !== userId) {
        return res.status(403).json({ error: 'Accès non autorisé à cette conversation' });
      }

      const count = await storage.getUnreadMessageCount(conversationId, userId);
      res.json({ unreadCount: count });
    } catch (error: any) {
      console.error('[CHAT] Erreur comptage messages non lus:', error);
      res.status(500).json({ error: 'Erreur lors du comptage des messages non lus' });
    }
  });

  // PRESENCE - Get user presence
  app.get("/api/chat/presence/:userId", requireAuth, async (req, res) => {
    try {
      const targetUserId = req.params.userId;
      const presence = await storage.getUserPresence(targetUserId);
      
      if (!presence) {
        return res.json({ userId: targetUserId, status: 'offline', lastSeen: null });
      }
      
      res.json(presence);
    } catch (error: any) {
      console.error('[CHAT] Erreur récupération présence:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de la présence' });
    }
  });

  // Update user presence
  app.patch("/api/chat/presence", requireAuth, requireCSRF, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { status } = req.body;

      if (!status || !['online', 'away', 'offline'].includes(status)) {
        return res.status(400).json({ error: 'Statut invalide' });
      }

      const presence = await storage.updateUserPresence(userId, status);
      res.json(presence);
    } catch (error: any) {
      console.error('[CHAT] Erreur mise à jour présence:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de la présence' });
    }
  });

  // Get online users
  app.get("/api/chat/presence/online", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
      }

      const onlineUsers = await storage.getOnlineUsers();
      res.json(onlineUsers);
    } catch (error: any) {
      console.error('[CHAT] Erreur récupération utilisateurs en ligne:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs en ligne' });
    }
  });

  // Download Amortization Table PDF
  app.get("/api/loans/:id/download-amortization", requireAuth, async (req, res) => {
    try {
      const loan = await storage.getLoan(req.params.id);
      
      if (!loan) {
        return res.status(404).json({ error: 'Prêt non trouvé' });
      }

      if (loan.userId !== req.session.userId) {
        const user = await storage.getUser(req.session.userId!);
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ error: 'Accès refusé' });
        }
      }

      if (loan.status !== 'active') {
        return res.status(400).json({ error: 'Le tableau d\'amortissement n\'est disponible que pour les prêts actifs' });
      }

      // Get or generate loan reference
      const loanReference = getOrGenerateLoanReference(loan);
      
      // Validate loan data
      const duration = loan.duration || 12;
      const interestRate = Number(loan.interestRate) || 0;
      const amount = Number(loan.amount) || 0;

      if (amount <= 0) {
        return res.status(400).json({ error: 'Montant du prêt invalide' });
      }

      // Get language from query parameter, default to 'fr'
      const lang = (req.query.lang as string) || 'fr';
      const t = getPdfTranslation(lang);

      const pdfDoc = await PDFDocument.create();
      
      // Embed fonts for reliable rendering across all PDF viewers
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // Helper function to clean text for PDF (remove Unicode characters Helvetica can't encode)
      const sanitizePdfText = (text: string): string => {
        return text
          .replace(/\u202f/g, ' ')    // narrow no-break space → space
          .replace(/\u00a0/g, ' ')    // non-breaking space → space
          .replace(/[\u2010-\u2015]/g, '-')  // various dashes → hyphen
          .replace(/[\u2018\u2019]/g, "'")   // curly quotes → straight quote
          .replace(/[\u201c\u201d]/g, '"');  // curly double quotes → straight quote
      };
      
      const page = pdfDoc.addPage([595, 842]);
      const { height } = page.getSize();
      
      let yPosition = height - 50;
      
      // Header
      page.drawText(sanitizePdfText(t.title), {
        x: 50,
        y: yPosition,
        size: 24,
        font: helveticaBold,
        color: rgb(0.2, 0.3, 0.6),
      });
      
      yPosition -= 30;
      page.drawText(sanitizePdfText(`${t.loanLabel} ${loanReference}`), {
        x: 50,
        y: yPosition,
        size: 12,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      yPosition -= 18;
      page.drawText(sanitizePdfText(`${t.amountLabel} ${new Intl.NumberFormat(t.localeCode, { style: 'currency', currency: 'EUR' }).format(amount)}`), {
        x: 50,
        y: yPosition,
        size: 11,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      yPosition -= 18;
      page.drawText(sanitizePdfText(`${t.rateLabel} ${interestRate}% | ${t.durationLabel} ${duration} ${t.months}`), {
        x: 50,
        y: yPosition,
        size: 11,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      yPosition -= 35;
      
      // Calculate amortization schedule
      const monthlyRate = interestRate / 100 / 12;
      const numberOfPayments = duration;
      const principal = amount;
      
      // Handle case where interest rate is 0
      let monthlyPayment: number;
      if (monthlyRate === 0) {
        monthlyPayment = principal / numberOfPayments;
      } else {
        monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      }
      
      let remainingBalance = principal;
      
      // Draw header background FIRST (before the text)
      page.drawRectangle({
        x: 40,
        y: yPosition - 5,
        width: 515,
        height: 22,
        color: rgb(0.2, 0.3, 0.6),
      });
      
      // Table headers (drawn AFTER the background so they appear on top)
      page.drawText(sanitizePdfText(t.month), { x: 55, y: yPosition, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
      page.drawText(sanitizePdfText(t.payment), { x: 140, y: yPosition, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
      page.drawText(sanitizePdfText(t.interest), { x: 240, y: yPosition, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
      page.drawText(sanitizePdfText(t.principal), { x: 340, y: yPosition, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
      page.drawText(sanitizePdfText(t.balance), { x: 450, y: yPosition, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
      
      yPosition -= 30;
      
      // Calculate how many rows fit on a page
      const rowHeight = 18;
      const bottomMargin = 50;
      let currentPage = page;
      
      // Draw all months
      for (let i = 1; i <= numberOfPayments; i++) {
        // Check if we need a new page
        if (yPosition < bottomMargin) {
          currentPage = pdfDoc.addPage([595, 842]);
          yPosition = 842 - 50;
          
          // Redraw header on new page
          currentPage.drawRectangle({
            x: 40,
            y: yPosition - 5,
            width: 515,
            height: 22,
            color: rgb(0.2, 0.3, 0.6),
          });
          
          currentPage.drawText(sanitizePdfText(t.month), { x: 55, y: yPosition, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
          currentPage.drawText(sanitizePdfText(t.payment), { x: 140, y: yPosition, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
          currentPage.drawText(sanitizePdfText(t.interest), { x: 240, y: yPosition, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
          currentPage.drawText(sanitizePdfText(t.principal), { x: 340, y: yPosition, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
          currentPage.drawText(sanitizePdfText(t.balance), { x: 450, y: yPosition, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
          
          yPosition -= 30;
        }
        
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        remainingBalance = Math.max(0, remainingBalance - principalPayment);
        
        // Alternate row background
        if (i % 2 === 0) {
          currentPage.drawRectangle({
            x: 40,
            y: yPosition - 5,
            width: 515,
            height: rowHeight,
            color: rgb(0.95, 0.95, 0.97),
          });
        }
        
        const rowText = `${i}`;
        const paymentText = sanitizePdfText(new Intl.NumberFormat(t.localeCode, { style: 'currency', currency: 'EUR' }).format(monthlyPayment));
        const interestText = sanitizePdfText(new Intl.NumberFormat(t.localeCode, { style: 'currency', currency: 'EUR' }).format(interestPayment));
        const principalText = sanitizePdfText(new Intl.NumberFormat(t.localeCode, { style: 'currency', currency: 'EUR' }).format(principalPayment));
        const balanceText = sanitizePdfText(new Intl.NumberFormat(t.localeCode, { style: 'currency', currency: 'EUR' }).format(remainingBalance));
        
        currentPage.drawText(rowText, { x: 55, y: yPosition, size: 9, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
        currentPage.drawText(paymentText, { x: 130, y: yPosition, size: 9, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
        currentPage.drawText(interestText, { x: 230, y: yPosition, size: 9, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
        currentPage.drawText(principalText, { x: 330, y: yPosition, size: 9, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
        currentPage.drawText(balanceText, { x: 440, y: yPosition, size: 9, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
        
        yPosition -= rowHeight;
      }
      
      // Add summary at the bottom
      yPosition -= 20;
      if (yPosition < bottomMargin + 60) {
        currentPage = pdfDoc.addPage([595, 842]);
        yPosition = 842 - 50;
      }
      
      const totalInterest = (monthlyPayment * numberOfPayments) - principal;
      const totalPayment = monthlyPayment * numberOfPayments;
      
      currentPage.drawRectangle({
        x: 40,
        y: yPosition - 45,
        width: 515,
        height: 60,
        color: rgb(0.95, 0.97, 1),
        borderColor: rgb(0.2, 0.3, 0.6),
        borderWidth: 1,
      });
      
      currentPage.drawText(sanitizePdfText(t.summary), { x: 55, y: yPosition - 5, size: 12, font: helveticaBold, color: rgb(0.2, 0.3, 0.6) });
      currentPage.drawText(sanitizePdfText(`${t.totalInterest} ${new Intl.NumberFormat(t.localeCode, { style: 'currency', currency: 'EUR' }).format(totalInterest)}`), { x: 55, y: yPosition - 22, size: 10, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
      currentPage.drawText(sanitizePdfText(`${t.totalCost} ${new Intl.NumberFormat(t.localeCode, { style: 'currency', currency: 'EUR' }).format(totalPayment)}`), { x: 55, y: yPosition - 38, size: 10, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
      currentPage.drawText(sanitizePdfText(`${t.monthlyPayment} ${new Intl.NumberFormat(t.localeCode, { style: 'currency', currency: 'EUR' }).format(monthlyPayment)}`), { x: 300, y: yPosition - 22, size: 10, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
      
      const pdfBytes = await pdfDoc.save();
      res.contentType('application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${t.filename}-${loanReference}.pdf"`);
      res.end(Buffer.from(pdfBytes), 'binary');
    } catch (error: any) {
      console.error('Amortization PDF generation error:', error);
      res.status(500).json({ error: 'Erreur lors de la génération du tableau d\'amortissement' });
    }
  });

  // Download Monthly Statement PDF
  app.get("/api/statement/download", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      const transactions = await storage.getUserTransactions(userId);
      const loans = await storage.getUserLoans(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const monthTransactions = transactions?.filter(t => {
        const transDate = new Date(t.createdAt);
        return transDate >= monthStart && transDate <= monthEnd;
      }) || [];

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const { height } = page.getSize();
      
      let yPosition = height - 50;
      
      // Header
      page.drawText('RELEVÉ DE COMPTE MENSUEL', {
        x: 50,
        y: yPosition,
        size: 24,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 30;
      page.drawText(`Client: ${user.fullName}`, {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      yPosition -= 15;
      page.drawText(`Période: ${monthStart.toLocaleDateString('fr-FR')} - ${monthEnd.toLocaleDateString('fr-FR')}`, {
        x: 50,
        y: yPosition,
        size: 11,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      yPosition -= 30;
      
      // Calculate summary
      const totalCredits = monthTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalDebits = monthTransactions.filter(t => t.type === 'debit' || t.type === 'fee').reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const monthlyFees = monthTransactions.filter(t => t.type === 'fee').reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      // Summary section
      page.drawText('RÉSUMÉ DU MOIS', { x: 50, y: yPosition, size: 12, color: rgb(0.2, 0.2, 0.2) });
      yPosition -= 20;
      
      page.drawText(`Crédits reçus: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalCredits)}`, {
        x: 50,
        y: yPosition,
        size: 10,
      });
      yPosition -= 15;
      
      page.drawText(`Débits et frais: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalDebits)}`, {
        x: 50,
        y: yPosition,
        size: 10,
      });
      yPosition -= 15;
      
      page.drawText(`Frais appliqués: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(monthlyFees)}`, {
        x: 50,
        y: yPosition,
        size: 10,
      });
      yPosition -= 25;
      
      // Transactions section
      page.drawText('TRANSACTIONS', { x: 50, y: yPosition, size: 12, color: rgb(0.2, 0.2, 0.2) });
      yPosition -= 20;
      
      // Table header
      page.drawText('Date', { x: 50, y: yPosition, size: 9 });
      page.drawText('Description', { x: 120, y: yPosition, size: 9 });
      page.drawText('Type', { x: 350, y: yPosition, size: 9 });
      page.drawText('Montant', { x: 450, y: yPosition, size: 9 });
      
      yPosition -= 15;
      
      // Draw transactions (max 20 per page)
      const displayTransactions = monthTransactions.slice(0, 20);
      for (const transaction of displayTransactions) {
        const dateStr = new Date(transaction.createdAt).toLocaleDateString('fr-FR');
        page.drawText(dateStr, { x: 50, y: yPosition, size: 8 });
        page.drawText(transaction.description.substring(0, 25), { x: 120, y: yPosition, size: 8 });
        page.drawText(transaction.type, { x: 350, y: yPosition, size: 8 });
        page.drawText(new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(parseFloat(transaction.amount)), {
          x: 450,
          y: yPosition,
          size: 8,
        });
        yPosition -= 12;
      }
      
      const pdfBytes = await pdfDoc.save();
      res.contentType('application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="statement_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}.pdf"`);
      res.end(Buffer.from(pdfBytes), 'binary');
    } catch (error: any) {
      console.error('Statement PDF generation error:', error);
      res.status(500).json({ error: 'Erreur lors de la génération du relevé de compte' });
    }
  });

  const httpServer = createServer(app);

  // Initialize WebSocket for real-time chat
  const { initializeChatSocket } = await import('./chat-socket');
  io = initializeChatSocket(httpServer, storage, sessionMiddleware);

  return httpServer;
}
