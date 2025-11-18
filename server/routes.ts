import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLoanSchema, insertTransferSchema, insertUserSchema, transferValidationCodes, type TransferValidationCode } from "@shared/schema";
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
  notifyAdminsSignedContractReceived
} from "./notification-helper";
import { loanRequestAdminNotification } from "./notification-service";
import cloudinary from "./config/cloudinary";
import { PassThrough } from "stream";

export async function registerRoutes(app: Express): Promise<Server> {
  // SÉCURITÉ: Accès aux fichiers via endpoints protégés uniquement
  // app.use('/uploads', express.static(...)); // ❌ SUPPRIMÉ - Exposition publique dangereuse

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

    if (!req.session || !req.session.csrfToken) {
      return res.status(403).json({ error: 'Session invalide - token CSRF manquant' });
    }

    const token = req.headers['x-csrf-token'] || req.body._csrf;
    if (!token || token !== req.session.csrfToken) {
      return res.status(403).json({ error: 'Token CSRF invalide ou manquant' });
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
    max: 100,
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
      return res.status(401).json({ error: 'Authentification requise' });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ error: 'Session invalide' });
      }

      if (user.activeSessionId && user.activeSessionId !== req.session.id) {
        req.session.destroy(() => {});
        return res.status(401).json({ 
          error: 'Votre compte est connecté sur un autre appareil. Veuillez vous reconnecter.',
          sessionExpired: true
        });
      }

      if (user.status === 'blocked') {
        return res.status(403).json({ 
          error: 'Compte bloqué. Veuillez contacter le support.'
        });
      }

      if (user.status === 'suspended') {
        if (!user.suspendedUntil || new Date() < user.suspendedUntil) {
          return res.status(403).json({ 
            error: 'Compte suspendu',
            suspendedUntil: user.suspendedUntil,
            reason: user.suspensionReason
          });
        }
      }

      if (user.status === 'inactive') {
        return res.status(403).json({ error: 'Compte inactif' });
      }

      if (!user.emailVerified) {
        return res.status(403).json({ 
          error: 'Email non vérifié. Veuillez vérifier votre email avant de continuer.' 
        });
      }

      next();
    } catch (error) {
      console.error('Error in requireAuth:', error);
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


  app.post("/api/auth/signup", authLimiter, requireCSRF, async (req, res) => {
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
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Impossible de créer le compte. Veuillez vérifier vos informations.' });
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

  app.post("/api/auth/login", authLimiter, requireCSRF, async (req, res) => {
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

      if (user.twoFactorEnabled) {
        return res.json({
          message: 'Veuillez entrer votre code d\'authentification à deux facteurs',
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

  app.post("/api/auth/verify-otp", authLimiter, requireCSRF, async (req, res) => {
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
      const userId = req.session.userId;
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

  const verify2FASchema = z.object({
    token: z.string().length(6, 'Le code doit contenir 6 chiffres'),
    secret: z.string().min(1, 'Secret requis'),
  });

  app.post("/api/2fa/verify", requireAuth, requireCSRF, async (req, res) => {
    try {
      const userId = req.session.userId;
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

  app.post("/api/2fa/validate", authLimiter, requireCSRF, async (req, res) => {
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
      const userId = req.session.userId;
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
      const userId = req.session.userId;
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
        message: 'Email vérifié avec succès ! Vous êtes maintenant connecté.',
        success: true,
        redirect: '/dashboard',
        user: userWithoutSensitive
      });
    } catch (error: any) {
      console.error('Verification error:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification' });
    }
  });

  app.post("/api/auth/resend-verification", requireCSRF, async (req, res) => {
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

  app.post("/api/auth/forgot-password", authLimiter, async (req, res) => {
    try {
      const forgotPasswordSchema = z.object({
        email: z.string().email('Email invalide'),
      });
      
      const validatedInput = forgotPasswordSchema.parse(req.body);
      const { email } = validatedInput;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ 
          message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.' 
        });
      }
      
      const resetToken = randomUUID();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
      
      await storage.setResetPasswordToken(email, resetToken, resetTokenExpiry);
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

  app.post("/api/auth/reset-password", authLimiter, async (req, res) => {
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

      const response = {
        balance: {
          currentBalance: data.balance,
          activeLoansCount: data.loans.filter(l => l.status === 'active').length,
          totalBorrowed: data.loans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0),
          availableCredit: 500000 - data.balance,
          lastUpdated: 'Il y a 5 minutes',
        },
        loans: data.loans.map(loan => ({
          id: loan.id,
          amount: parseFloat(loan.amount),
          interestRate: parseFloat(loan.interestRate),
          nextPaymentDate: formatDate(loan.nextPaymentDate),
          totalRepaid: parseFloat(loan.totalRepaid),
          status: loan.status,
          contractUrl: loan.contractUrl,
          signedContractUrl: loan.signedContractUrl,
        })),
        transfers: data.transfers.map(transfer => ({
          id: transfer.id,
          amount: parseFloat(transfer.amount),
          recipient: transfer.recipient,
          status: transfer.status,
          currentStep: transfer.currentStep,
          updatedAt: getTimeAgo(transfer.updatedAt),
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
          maxCapacity: parseFloat(data.user.maxLoanAmount || "500000"),
          currentCapacity: parseFloat(data.user.maxLoanAmount || "500000") - data.balance,
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
            title: 'Sécurisez votre compte',
            message: 'Activez l\'authentification à deux facteurs pour renforcer la sécurité de votre compte. Rendez-vous dans les paramètres pour l\'activer.',
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
            user.preferredLanguage || 'fr'
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
      res.json(loans);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch loans' });
    }
  });

  app.get("/api/loans/available-for-transfer", requireAuth, async (req, res) => {
    try {
      const loansAvailable = await storage.getLoansAvailableForTransfer(req.session.userId!);
      res.json(loansAvailable);
    } catch (error) {
      console.error('Error fetching loans available for transfer:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des prêts disponibles' });
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
      
      const userLoans = await storage.getUserLoans(req.session.userId!);
      const userTransfers = await storage.getUserTransfers(req.session.userId!);
      
      const hasActiveLoan = userLoans.some(loan => {
        if (loan.deletedAt !== null) return false;
        if (loan.status === 'rejected') return false;
        
        const loanTransfers = userTransfers.filter(t => t.loanId === loan.id);
        
        if (loanTransfers.length === 0) {
          return true;
        }
        
        const hasCompletedTransfer = loanTransfers.some(t => t.status === 'completed');
        return !hasCompletedTransfer;
      });
      
      if (hasActiveLoan) {
        return res.status(400).json({ 
          error: 'Vous avez déjà une demande de prêt active. Vous ne pouvez soumettre une nouvelle demande qu\'une fois votre prêt actuel entièrement finalisé (transfert effectué et terminé).',
          code: 'ACTIVE_LOAN_EXISTS'
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
      
      // Get user data for notifications
      const user = await storage.getUser(req.session.userId!);
      
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

      await storage.createAdminMessage({
        userId: req.session.userId!,
        transferId: null,
        subject: 'Demande de prêt en attente de validation',
        content: `Votre demande de prêt ${loanType} de ${amount} EUR a été soumise et est en attente de validation par notre service. Nous vous contacterons dès que possible.`,
        severity: 'info',
      });
      
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
        user.preferredLanguage || 'fr'
      );

      const updated = await storage.updateLoan(req.params.id, {
        contractStatus: 'awaiting_admin_review',
        signedContractUrl: null,
        signedContractCloudinaryPublicId: null,
      });

      await notifyLoanContractSigned(loan.userId, loan.id, loan.amount);

      await storage.createAdminMessage({
        userId: loan.userId,
        transferId: null,
        subject: 'Contrat signé reçu - En attente de validation',
        content: `Votre contrat signé pour le prêt de ${loan.amount} EUR a été reçu avec succès. Il est maintenant en cours de vérification par notre service. Vous serez notifié dès que les fonds seront débloqués.`,
        severity: 'info',
      });

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
        metadata: { filename: req.file.originalname, deliveredViaEmail: true },
      });

      res.json({ 
        success: true, 
        loan: updated,
        message: 'Contrat signé envoyé avec succès par email aux administrateurs'
      });
    } catch (error: any) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Fichier trop volumineux. La taille maximale est de 10MB.' });
      }

      console.error('Signed contract upload error:', error);
      res.status(500).json({ error: 'Erreur lors de l\'envoi du contrat signé' });
    } finally {
      if (tempFilePath) {
        try {
          await fs.promises.unlink(tempFilePath);
          console.log(`✓ Temporary file deleted: ${tempFilePath}`);
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
        return res.status(403).json({ 
          error: `Les transferts externes sont bloqués pour votre compte. Raison: ${user.transferBlockReason || 'Non spécifiée'}` 
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
    try {
      const { amount, externalAccountId, recipient, loanId } = req.body;
      
      console.log('🔵 [TRANSFER INITIATE] Request received', {
        userId: req.session.userId,
        loanId,
        amount,
        recipient,
        hasExternalAccount: !!externalAccountId
      });
      
      if (!loanId) {
        console.log('❌ [TRANSFER INITIATE] REJECTED: Missing loanId');
        return res.status(400).json({ error: 'Le prêt (loanId) est requis pour initier un transfert' });
      }

      const loan = await storage.getLoan(loanId);
      if (!loan) {
        console.log('❌ [TRANSFER INITIATE] REJECTED: Loan not found', { loanId });
        return res.status(404).json({ error: 'Prêt non trouvé' });
      }
      
      console.log('🔵 [TRANSFER INITIATE] Loan found', {
        loanId: loan.id,
        loanAmount: loan.amount,
        loanStatus: loan.status,
        fundsAvailabilityStatus: loan.fundsAvailabilityStatus,
        userId: loan.userId,
        requestingUserId: req.session.userId
      });

      if (loan.userId !== req.session.userId) {
        console.log('❌ [TRANSFER INITIATE] REJECTED: Loan ownership mismatch', {
          loanUserId: loan.userId,
          sessionUserId: req.session.userId
        });
        return res.status(403).json({ error: 'Accès refusé - ce prêt ne vous appartient pas' });
      }

      if (loan.fundsAvailabilityStatus !== 'available') {
        console.log('❌ [TRANSFER INITIATE] REJECTED: Funds not available', {
          loanId: loan.id,
          currentStatus: loan.fundsAvailabilityStatus,
          requiredStatus: 'available',
          loanStatus: loan.status
        });
        return res.status(400).json({ 
          error: 'Les fonds ne sont pas encore disponibles pour ce prêt. Veuillez attendre la confirmation du contrat par l\'administrateur.' 
        });
      }
      
      console.log('✅ [TRANSFER INITIATE] All validations passed, creating transfer...');
      
      const settingFee = await storage.getAdminSetting('default_transfer_fee');
      const feeAmount = (settingFee?.settingValue as any)?.amount || 25;
      
      const codesCount = 6;
      
      const { transfer, codes: generatedCodes } = await storage.createTransferWithCodes({
        userId: req.session.userId!,
        loanId: loanId,
        externalAccountId: externalAccountId || null,
        amount: amount.toString(),
        recipient,
        status: 'pending',
        currentStep: 1,
        progressPercent: 10,
        feeAmount: feeAmount.toString(),
        requiredCodes: codesCount,
        codesValidated: 0,
      }, codesCount);

      await notifyTransferInitiated(req.session.userId!, transfer.id, amount.toString(), recipient);

      const user = await storage.getUser(req.session.userId!);
      if (user) {
        await notifyAdminsNewTransfer(
          user.id,
          user.fullName,
          transfer.id,
          amount.toString(),
          recipient
        );

        try {
          const { sendTransferCodesAdminEmail } = await import('./email');
          await sendTransferCodesAdminEmail(
            user.fullName,
            amount.toString(),
            transfer.id,
            generatedCodes.map(c => ({
              sequence: c.sequence,
              code: c.code,
              pausePercent: c.pausePercent!,
              context: c.codeContext || `Code ${c.sequence}`
            })),
            user.preferredLanguage || 'fr'
          );
        } catch (emailError) {
          console.error('Failed to send transfer codes admin email:', emailError);
        }
      }

      await storage.createTransferEvent({
        transferId: transfer.id,
        eventType: 'initiated',
        message: 'Virement initié - Traitement sécurisé en cours',
        metadata: { loanId, codesCount, transferId: transfer.id },
      });

      console.log('✅ [TRANSFER INITIATE] SUCCESS - Transfer created', {
        transferId: transfer.id,
        userId: req.session.userId,
        loanId,
        amount: amount.toString()
      });

      res.status(201).json({ 
        transfer,
        message: `Transfert initié avec succès. L'administrateur vous transmettra les codes de validation un par un. Ces codes sont uniques et ne peuvent être utilisés que pour ce transfert.`,
        codesRequired: codesCount,
      });
    } catch (error: any) {
      console.error('❌ [TRANSFER INITIATE] ERROR:', {
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
        existingTransferId: error.existingTransferId,
        userId: req.session.userId,
        requestBody: req.body
      });
      
      if (error.existingTransferId) {
        console.log('⚠️ [TRANSFER INITIATE] REJECTED: Transfer already in progress', {
          existingTransferId: error.existingTransferId,
          loanId: req.body.loanId
        });
        return res.status(409).json({ 
          error: 'Un transfert est déjà en cours pour ce prêt',
          existingTransferId: error.existingTransferId,
          redirect: true
        });
      }
      
      console.error('❌ [TRANSFER INITIATE] FAILED - Returning generic error to client');
      res.status(400).json({ error: 'Failed to initiate transfer' });
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
      
      // SÉCURITÉ CRITIQUE: Ne JAMAIS exposer les codes admin aux utilisateurs
      // Filtrer pour ne garder que les codes déjà consommés (historique)
      // Les codes admin (deliveryMethod='admin') ne doivent JAMAIS être visibles
      const userVisibleCodes = allCodes.filter(code => 
        code.consumedAt !== null // Seulement les codes déjà utilisés (historique)
      ).map(code => ({
        ...code,
        // Ne jamais exposer le code lui-même, même s'il est consommé
        code: '***' 
      }));

      res.json({ transfer, events, codes: userVisibleCodes });
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
      const transfer = await storage.getTransfer(req.params.id);
      
      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      if (transfer.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      if (!transfer.loanId) {
        return res.status(400).json({ 
          error: 'Ce transfert n\'est pas associé à un prêt. Impossible de valider les codes.' 
        });
      }

      const expectedSequence = transfer.codesValidated + 1;
      if (sequence !== expectedSequence) {
        await storage.createTransferEvent({
          transferId: transfer.id,
          eventType: 'validation_failed',
          message: 'Erreur de séquence de validation',
          metadata: { sequence, expectedSequence, loanId: transfer.loanId },
        });
        return res.status(400).json({ 
          error: `Vous devez valider le code #${expectedSequence} avant de valider le code #${sequence}.` 
        });
      }

      const validatedCode = await storage.validateTransferCode(transfer.id, code, sequence);
      if (!validatedCode) {
        await storage.createTransferEvent({
          transferId: transfer.id,
          eventType: 'validation_failed',
          message: 'Autorisation de sécurité refusée',
          metadata: { sequence, loanId: transfer.loanId },
        });
        return res.status(400).json({ error: 'Code de sécurité incorrect ou déjà utilisé' });
      }

      const newCodesValidated = transfer.codesValidated + 1;
      const isComplete = newCodesValidated >= transfer.requiredCodes;
      
      let newProgress: number;
      let newStatus: string;
      let isPaused: boolean;
      let pausePercent: number | null = null;
      const completedAt = isComplete ? new Date() : undefined;

      if (isComplete) {
        newProgress = 100;
        newStatus = 'completed';
        isPaused = false;
        pausePercent = null;
      } else {
        const allCodes = await storage.getLoanTransferCodes(transfer.loanId);
        const sortedCodes = allCodes.filter(c => c.transferId === transfer.id).sort((a, b) => a.sequence - b.sequence);
        const nextCode = sortedCodes.find(c => c.sequence === newCodesValidated + 1);
        
        if (nextCode && nextCode.pausePercent) {
          newProgress = nextCode.pausePercent;
          pausePercent = nextCode.pausePercent;
          isPaused = true;
          newStatus = 'in_progress';
        } else {
          const currentCodePercent = validatedCode.pausePercent || Math.min(10 + (newCodesValidated * Math.floor(80 / transfer.requiredCodes)), 90);
          newProgress = currentCodePercent;
          isPaused = false;
          newStatus = 'pending';
        }
      }

      await storage.updateTransfer(transfer.id, {
        codesValidated: newCodesValidated,
        progressPercent: newProgress,
        status: newStatus,
        currentStep: Math.min(newCodesValidated, transfer.requiredCodes),
        approvedAt: isComplete ? new Date() : transfer.approvedAt,
        completedAt,
        isPaused,
        pausePercent,
      });

      await storage.createTransferEvent({
        transferId: transfer.id,
        eventType: 'code_validated',
        message: 'Autorisation de sécurité validée',
        metadata: { sequence, codesValidated: newCodesValidated },
      });

      if (!isComplete && isPaused && pausePercent) {
        await storage.createTransferEvent({
          transferId: transfer.id,
          eventType: 'paused_automatically',
          message: `Transfert mis en pause automatiquement à ${pausePercent}%`,
          metadata: { pausePercent, nextSequence: newCodesValidated + 1 },
        });

        await storage.createAdminMessage({
          userId: transfer.userId,
          transferId: transfer.id,
          subject: `Transfert en pause à ${pausePercent}%`,
          content: `Votre transfert est en pause à ${pausePercent}%. Vous devez fournir le code de validation #${newCodesValidated + 1} pour continuer. Contactez le service client pour obtenir ce code.`,
          severity: 'info',
        });
      }

      if (isComplete) {
        await storage.createTransferEvent({
          transferId: transfer.id,
          eventType: 'completed',
          message: 'Virement exécuté avec succès',
          metadata: { totalValidations: newCodesValidated, completedAt },
        });

        const user = await storage.getUser(transfer.userId);
        const externalAccount = transfer.externalAccountId 
          ? await storage.getExternalAccount(transfer.externalAccountId)
          : null;

        if (user) {
          const recipientIban = externalAccount?.iban || 'Non spécifié';
          
          await storage.createAdminMessage({
            userId: transfer.userId,
            transferId: transfer.id,
            subject: 'Transfert terminé avec succès',
            content: `
**Récapitulatif du transfert**

- Montant transféré: ${transfer.amount} €
- Bénéficiaire: ${transfer.recipient}
- IBAN: ${recipientIban}
- Référence: ${transfer.id}

**Disponibilité des fonds**
Les fonds seront disponibles sur le compte du bénéficiaire dans un délai de 24 à 72 heures ouvrées, selon les délais bancaires.

**Besoin d'aide ?**
En cas de problème ou de question concernant ce transfert, notre équipe est à votre disposition. Contactez-nous à tout moment.

Merci de votre confiance.`,
            severity: 'success',
          });

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
- Complété le: ${completedAt?.toLocaleString('fr-FR')}
- Nombre d'événements: ${allEvents.length}

Tous les codes de validation ont été vérifiés avec succès.`,
              severity: 'info',
            });

            try {
              const { sendAdminTransferCompletionReport } = await import('./email');
              await sendAdminTransferCompletionReport(
                transfer.id,
                user.id,
                user.fullName,
                user.email,
                transfer.amount.toString(),
                transfer.recipient,
                recipientIban,
                completedAt!,
                newCodesValidated,
                admin.preferredLanguage || 'fr'
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
        message: isComplete 
          ? 'Transfert complété avec succès' 
          : isPaused 
            ? `Code validé - Transfert en pause à ${pausePercent}%` 
            : `Code validé (${newCodesValidated}/${transfer.requiredCodes})`,
        isComplete,
        isPaused,
        progress: newProgress,
        pausePercent: isPaused ? pausePercent : null,
        nextSequence: isComplete ? null : newCodesValidated + 1,
        codeContext: validatedCode.codeContext || `Code de validation ${newCodesValidated}`,
      });
    } catch (error) {
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
      const maxCapacity = 500000;
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
      
      const data = months.map((month, index) => {
        const result: any = { month };
        
        activeLoans.forEach((loan, loanIndex) => {
          const loanAmount = parseFloat(loan.amount);
          const monthlyPayment = loanAmount / loan.duration;
          const basePayment = monthlyPayment + (monthlyPayment * parseFloat(loan.interestRate) / 100 / 12);
          
          const monthlyVariation = Math.sin((index + loanIndex) * 0.7) * (basePayment * 0.1);
          result[`loan${loanIndex + 1}`] = Math.round(basePayment + monthlyVariation);
        });
        
        for (let i = activeLoans.length; i < 3; i++) {
          result[`loan${i + 1}`] = 0;
        }
        
        return result;
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
        contractUrl = await generateContractPDF(user, loan);
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

      const messageContent = contractGenerated
        ? `Félicitations! Votre demande de prêt de ${loan.amount} EUR a été approuvée. Votre contrat est maintenant disponible. Veuillez le télécharger, le signer et le retourner pour débloquer les fonds.`
        : `Félicitations! Votre demande de prêt de ${loan.amount} EUR a été approuvée. Votre contrat sera disponible sous peu. Vous recevrez une notification dès qu'il sera prêt.`;

      await storage.createAdminMessage({
        userId: loan.userId,
        transferId: null,
        subject: 'Demande de prêt approuvée' + (contractGenerated ? ' - Contrat disponible' : ''),
        content: messageContent,
        severity: 'success',
      });

      await notifyLoanApproved(loan.userId, loan.id, loan.amount);

      if (contractGenerated && contractUrl) {
        await notifyLoanContractGenerated(loan.userId, loan.id, loan.amount);
        
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

      await storage.createAdminMessage({
        userId: loan.userId,
        transferId: null,
        subject: 'Demande de prêt refusée',
        content: `Nous sommes désolés de vous informer que votre demande de prêt de ${loan.amount} EUR a été refusée. Raison: ${validatedData.reason}`,
        severity: 'warning',
      });

      await notifyLoanRejected(loan.userId, loan.id, validatedData.reason);

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'reject_loan',
        entityType: 'loan',
        entityId: req.params.id,
        metadata: { amount: loan.amount, loanType: loan.loanType, reason: validatedData.reason },
      });

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

      const result = await storage.markLoanFundsAvailable(req.params.id, req.session.userId!);
      
      if (!result) {
        return res.status(500).json({ error: 'Erreur lors de la mise à jour du prêt' });
      }

      const { loan: updatedLoan, codes: generatedCodes } = result;
      const user = await storage.getUser(loan.userId);
      const userName = user?.fullName || 'Utilisateur';

      await storage.createAdminMessage({
        userId: loan.userId,
        transferId: null,
        subject: 'Fonds disponibles - Contrat validé',
        content: `Vos fonds sont désormais disponibles. Vous pouvez initier votre transfert.`,
        severity: 'success',
      });

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
        await sendTransferCodesAdminEmail(
          userName,
          loan.amount,
          loan.id,
          generatedCodes.map(c => ({
            sequence: c.sequence,
            code: c.code,
            pausePercent: c.pausePercent!,
            context: c.codeContext || `Code ${c.sequence}`
          })),
          user?.preferredLanguage || 'fr'
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

      await storage.createAdminMessage({
        userId: transfer.userId,
        transferId: req.params.id,
        subject: `Code de validation pour transfert #${validatedData.sequence}`,
        content: `Votre code de validation pour l'étape ${validatedData.sequence} est: ${code.code}. Ce code a été pré-généré lors de la confirmation de votre contrat.`,
        severity: 'info',
      });

      await notifyCodeIssued(transfer.userId, req.params.id, validatedData.sequence);

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'issue_validation_code',
        entityType: 'transfer',
        entityId: req.params.id,
        metadata: { sequence: validatedData.sequence, loanId: transfer.loanId, codeId: code.id, reusedExisting: true },
      });

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

      await storage.createAdminMessage({
        userId: transfer.userId,
        transferId: transfer.id,
        subject: `Code de déblocage pour transfert en pause à ${transfer.pausePercent}%`,
        content: `Votre code de déblocage est: ${code}. Ce code expire dans 30 minutes.`,
        severity: 'info',
      });

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'issue_pause_code',
        entityType: 'transfer',
        entityId: req.params.id,
        metadata: { pausePercent: transfer.pausePercent },
      });

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
            content: `Votre transfert vers ${transfer.recipient} est en pause à ${nextPausePercent}%. Veuillez contacter le service client pour obtenir le code de déblocage.`,
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

  const httpServer = createServer(app);

  return httpServer;
}
