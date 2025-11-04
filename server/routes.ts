import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLoanSchema, insertTransferSchema, insertUserSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { sendVerificationEmail, sendWelcomeEmail } from "./email";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileTypeFromFile } from "file-type";

export async function registerRoutes(app: Express): Promise<Server> {
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
      if (loanType === 'business') {
        if (amount < 10000) return 4.5;
        if (amount < 50000) return 3.5;
        return 2.5;
      } else if (loanType === 'personal') {
        if (amount < 10000) return 6.5;
        if (amount < 30000) return 5.0;
        return 3.5;
      } else if (loanType === 'real_estate') {
        if (amount < 50000) return 3.5;
        if (amount < 200000) return 2.5;
        return 2.0;
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


  app.post("/api/auth/signup", authLimiter, async (req, res) => {
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
        accountType: z.enum(['personal', 'business', 'professional']).optional(),
        companyName: z.string().optional(),
        siret: z.string().optional(),
      });

      const validatedInput = signupSchema.parse(req.body);
      const { email, password, fullName, phone, accountType, companyName, siret } = validatedInput;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Impossible de créer le compte. Veuillez vérifier vos informations.' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = randomUUID();
      const verificationTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
      
      const username = email.split('@')[0] + '_' + randomUUID().substring(0, 8);
      
      const userData: any = {
        username,
        password: hashedPassword,
        email,
        fullName,
        phone: phone || null,
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
      
      await sendVerificationEmail(email, fullName, verificationToken, accountType || 'personal');
      
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

  app.post("/api/auth/login", authLimiter, async (req, res) => {
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

      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      req.session.userId = user.id;
      req.session.userRole = user.role;

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      const { password: _, verificationToken: __, ...userWithoutSensitive } = user;
      
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

  app.post("/api/auth/logout", async (req, res) => {
    try {
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
      
      await sendWelcomeEmail(user.email, user.fullName, user.accountType);
      
      res.json({
        message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.',
        success: true
      });
    } catch (error: any) {
      console.error('Verification error:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification' });
    }
  });

  app.post("/api/auth/resend-verification", async (req, res) => {
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
      
      await sendVerificationEmail(user.email, user.fullName, newToken, user.accountType);
      
      res.json({ message: 'Email de vérification renvoyé avec succès' });
    } catch (error: any) {
      console.error('Resend verification error:', error);
      res.status(500).json({ error: 'Erreur lors du renvoi de l\'email' });
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
      const { password: _, verificationToken: __, ...userWithoutSensitive } = user;
      res.json(userWithoutSensitive);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
    }
  });

  app.post("/api/user/mark-welcome-seen", requireAuth, async (req, res) => {
    try {
      await storage.markWelcomeMessageAsSeen(req.session.userId!);
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking welcome message as seen:', error);
      res.status(500).json({ error: 'Failed to mark welcome message as seen' });
    }
  });

  app.post("/api/kyc/upload", requireAuth, uploadLimiter, upload.single('document'), async (req, res) => {
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

      const document = await storage.createKycDocument({
        userId: req.session.userId!,
        loanId: validatedData.loanId || null,
        documentType: validatedData.documentType,
        loanType: validatedData.loanType,
        status: 'pending',
        fileUrl: req.file.filename,
        fileName: req.file.originalname,
        fileSize: req.file.size,
      });

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

      const filePath = path.join(uploadsDir, document.fileUrl);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Fichier non trouvé sur le serveur' });
      }

      res.download(filePath, document.fileName, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Erreur lors du téléchargement du fichier' });
          }
        }
      });
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

  app.post("/api/loans", requireAuth, async (req, res) => {
    try {
      const { loanType, amount, duration } = req.body;
      
      const interestRate = await calculateInterestRate(loanType, parseFloat(amount));
      
      const validated = insertLoanSchema.parse({
        userId: req.session.userId!,
        loanType,
        amount,
        duration,
        interestRate: interestRate.toString(),
        status: 'pending',
      });
      
      const loan = await storage.createLoan(validated);
      
      await storage.createAdminMessage({
        userId: req.session.userId!,
        transferId: null,
        subject: 'Demande de prêt en attente de validation',
        content: `Votre demande de prêt ${loanType} de ${amount} EUR a été soumise et est en attente de validation par notre service. Nous vous contacterons dès que possible.`,
        severity: 'info',
      });
      
      res.status(201).json({ 
        loan,
        message: 'Votre demande de prêt a été soumise avec succès et est en attente de validation par notre service.'
      });
    } catch (error) {
      console.error('Loan creation error:', error);
      res.status(400).json({ error: 'Invalid loan data' });
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

  app.post("/api/transfers", requireAuth, transferLimiter, async (req, res) => {
    try {
      const validated = insertTransferSchema.parse({
        ...req.body,
        userId: req.session.userId!,
      });
      const transfer = await storage.createTransfer(validated);
      
      await storage.createFee({
        userId: req.session.userId!,
        feeType: 'Frais de transfert',
        reason: `Transfert vers ${validated.recipient}`,
        amount: '25',
      });

      res.status(201).json(transfer);
    } catch (error) {
      res.status(400).json({ error: 'Invalid transfer data' });
    }
  });

  app.post("/api/transfers/initiate", requireAuth, transferLimiter, async (req, res) => {
    try {
      const { amount, externalAccountId, recipient } = req.body;
      
      const settingCodesCount = await storage.getAdminSetting('validation_codes_count');
      const settingFee = await storage.getAdminSetting('default_transfer_fee');
      
      const codesRequired = (settingCodesCount?.settingValue as any)?.default || 1;
      const feeAmount = (settingFee?.settingValue as any)?.amount || 25;
      
      const transfer = await storage.createTransfer({
        userId: req.session.userId!,
        externalAccountId: externalAccountId || null,
        amount: amount.toString(),
        recipient,
        status: 'pending',
        currentStep: 1,
        progressPercent: 10,
        feeAmount: feeAmount.toString(),
        requiredCodes: codesRequired,
        codesValidated: 0,
      });

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      const { code, notification, fee } = await storage.issueCodeWithNotificationAndFee({
        transferId: transfer.id,
        userId: req.session.userId!,
        sequence: 1,
        expiresAt,
        deliveryMethod: 'email',
        subject: `Code de validation pour votre transfert`,
        content: `Votre code de validation pour le transfert de ${amount}€ vers ${recipient} est: {CODE}. Ce code expire dans 15 minutes. Un frais de ${feeAmount}€ sera automatiquement validé lors de l'utilisation de ce code.`,
        feeType: 'Frais de validation',
        feeAmount: feeAmount.toString(),
        feeReason: `Frais de validation pour transfert vers ${recipient}`,
      });

      await storage.createTransferEvent({
        transferId: transfer.id,
        eventType: 'initiated',
        message: 'Transfert initié - Code de validation et frais créés',
        metadata: { method: 'email', sequence: 1, feeId: fee.id },
      });

      res.status(201).json({ 
        transfer,
        message: 'Code de validation envoyé à votre email',
      });
    } catch (error) {
      console.error('Transfer initiation error:', error);
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
      const codes = await storage.getTransferValidationCodes(req.params.id);

      res.json({ transfer, events, codes });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transfer' });
    }
  });

  app.post("/api/transfers/:id/send-code", requireAuth, validationLimiter, async (req, res) => {
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
        message: `Code de validation ${nextSequence}/${transfer.requiredCodes} envoyé avec frais associé`,
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

  app.post("/api/transfers/:id/validate-code", requireAuth, validationLimiter, async (req, res) => {
    try {
      const { code, sequence } = req.body;
      const transfer = await storage.getTransfer(req.params.id);
      
      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      if (transfer.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      const validatedCode = await storage.validateCode(transfer.id, code, sequence);
      if (!validatedCode) {
        await storage.createTransferEvent({
          transferId: transfer.id,
          eventType: 'validation_failed',
          message: 'Code de validation incorrect ou expiré',
          metadata: { sequence },
        });
        return res.status(400).json({ error: 'Invalid or expired code' });
      }

      const newCodesValidated = transfer.codesValidated + 1;
      const progressIncrement = Math.floor(80 / transfer.requiredCodes);
      const newProgress = Math.min(10 + (newCodesValidated * progressIncrement), 90);
      
      const isComplete = newCodesValidated >= transfer.requiredCodes;
      const newStatus = isComplete ? 'in-progress' : 'pending';

      await storage.updateTransfer(transfer.id, {
        codesValidated: newCodesValidated,
        progressPercent: newProgress,
        status: newStatus,
        currentStep: newCodesValidated + 1,
        approvedAt: isComplete ? new Date() : transfer.approvedAt,
      });

      await storage.createTransferEvent({
        transferId: transfer.id,
        eventType: 'code_validated',
        message: `Code ${newCodesValidated}/${transfer.requiredCodes} validé avec succès`,
        metadata: { sequence, codesValidated: newCodesValidated },
      });

      if (isComplete) {
        await storage.createTransferEvent({
          transferId: transfer.id,
          eventType: 'processing',
          message: 'Transfert en cours de traitement',
          metadata: null,
        });

        setTimeout(async () => {
          await storage.updateTransfer(transfer.id, {
            status: 'completed',
            progressPercent: 100,
            completedAt: new Date(),
          });

          await storage.createTransferEvent({
            transferId: transfer.id,
            eventType: 'completed',
            message: 'Transfert complété avec succès',
            metadata: null,
          });
        }, 5000);
      }

      res.json({ 
        success: true,
        message: `Code validé (${newCodesValidated}/${transfer.requiredCodes})`,
        isComplete,
        progress: newProgress,
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

  app.post("/api/external-accounts", requireAuth, async (req, res) => {
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

  app.delete("/api/external-accounts/:id", requireAuth, async (req, res) => {
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

  app.post("/api/messages/:id/read", requireAuth, async (req, res) => {
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

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
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

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
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

  app.patch("/api/admin/transfers/:id", requireAdmin, async (req, res) => {
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

  app.put("/api/admin/settings/:key", requireAdmin, async (req, res) => {
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

  app.post("/api/admin/messages", requireAdmin, adminLimiter, async (req, res) => {
    try {
      const validatedData = adminSendMessageSchema.parse(req.body);
      
      const message = await storage.createAdminMessage({
        userId: validatedData.userId,
        transferId: validatedData.transferId || null,
        subject: validatedData.subject,
        content: validatedData.content,
        severity: validatedData.severity || 'info',
      });

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

  app.post("/api/admin/loans/:id/approve", requireAdmin, adminLimiter, async (req, res) => {
    try {
      const loan = await storage.getLoan(req.params.id);
      if (!loan) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      const updated = await storage.updateLoan(req.params.id, {
        status: 'active',
        approvedAt: new Date(),
        approvedBy: req.session.userId!,
      });

      await storage.createAdminMessage({
        userId: loan.userId,
        transferId: null,
        subject: 'Demande de prêt approuvée',
        content: `Félicitations! Votre demande de prêt de ${loan.amount} EUR a été approuvée. Les fonds seront disponibles sous peu.`,
        severity: 'success',
      });

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'approve_loan',
        entityType: 'loan',
        entityId: req.params.id,
        metadata: { amount: loan.amount, loanType: loan.loanType },
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to approve loan' });
    }
  });

  app.post("/api/admin/loans/:id/reject", requireAdmin, adminLimiter, async (req, res) => {
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

  app.delete("/api/admin/loans/:id", requireAdmin, async (req, res) => {
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

  app.patch("/api/admin/users/:id/borrowing-capacity", requireAdmin, async (req, res) => {
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

  app.post("/api/admin/users/:id/suspend", requireAdmin, adminLimiter, async (req, res) => {
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

  app.post("/api/admin/users/:id/block", requireAdmin, adminLimiter, async (req, res) => {
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

  app.post("/api/admin/users/:id/unblock", requireAdmin, async (req, res) => {
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

  app.post("/api/admin/users/:id/block-transfers", requireAdmin, adminLimiter, async (req, res) => {
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

  app.post("/api/admin/users/:id/unblock-transfers", requireAdmin, async (req, res) => {
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

  app.post("/api/admin/transfers/:id/issue-code", requireAdmin, adminLimiter, async (req, res) => {
    try {
      const validatedData = adminIssueCodeSchema.parse(req.body);
      const transfer = await storage.getTransfer(req.params.id);
      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      const code = await storage.issueTransferValidationCode(req.params.id, validatedData.sequence);

      await storage.createAdminMessage({
        userId: transfer.userId,
        transferId: req.params.id,
        subject: `Code de validation pour transfert #${validatedData.sequence}`,
        content: `Votre code de validation pour l'étape ${validatedData.sequence} est: ${code.code}. Ce code expire dans 30 minutes.`,
        severity: 'info',
      });

      await storage.createAuditLog({
        actorId: req.session.userId!,
        actorRole: 'admin',
        action: 'issue_validation_code',
        entityType: 'transfer',
        entityId: req.params.id,
        metadata: { sequence: validatedData.sequence },
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

  app.post("/api/admin/notifications/send-with-fee", requireAdmin, adminLimiter, async (req, res) => {
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

  app.get("/api/fees/unpaid", requireAuth, async (req, res) => {
    try {
      const fees = await storage.getUnpaidFees(req.session.userId!);
      res.json(fees);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch unpaid fees' });
    }
  });


  const httpServer = createServer(app);

  return httpServer;
}
