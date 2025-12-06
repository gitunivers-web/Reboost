import { 
  type User, 
  type InsertUser,
  type Loan,
  type InsertLoan,
  type Transfer,
  type InsertTransfer,
  type Fee,
  type InsertFee,
  type Transaction,
  type InsertTransaction,
  type AdminSetting,
  type InsertAdminSetting,
  type AuditLog,
  type InsertAuditLog,
  type TransferValidationCode,
  type InsertTransferValidationCode,
  type TransferEvent,
  type InsertTransferEvent,
  type AdminMessage,
  type InsertAdminMessage,
  type ExternalAccount,
  type InsertExternalAccount,
  type KycDocument,
  type InsertKycDocument,
  type Notification,
  type InsertNotification,
  type Message,
  type InsertMessage,
  type AmortizationSchedule,
  type InsertAmortizationSchedule,
  type ChatConversation,
  type InsertChatConversation,
  type ChatMessage,
  type InsertChatMessage,
  type ChatPresence,
  type InsertChatPresence,
  users,
  loans,
  transfers,
  fees,
  transactions,
  adminSettings,
  auditLogs,
  transferValidationCodes,
  transferEvents,
  adminMessages,
  externalAccounts,
  kycDocuments,
  notifications,
  messages,
  amortizationSchedule,
  chatConversations,
  chatMessages,
  chatPresence,
  getLoanReferenceNumber,
  getOrGenerateLoanReference,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db, withRetry } from "./db";
import { eq, desc, and, or, isNull, notExists, inArray, sql, sql as sqlDrizzle } from "drizzle-orm";
import path from "path";
import fs from "fs";
import { encryptSecret } from "./services/encryption";
import { pool } from "./db";

// Result type for atomic validation
export interface ValidateTransferCodeAtomicResult {
  codeId: string;
  progress: number;
  isPaused: boolean;
  pausePercent: number | null;
  nextSequence: number | null;
  codeContext: string | null;
  codesValidated: number;
  isComplete: boolean;
  transfer: Transfer;
  validatedCode: TransferValidationCode;
}

// Error types for atomic validation
export class ValidationError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'ALREADY_CONSUMED' | 'INVALID_SEQUENCE' | 'EXPIRED' | 'INVALID_CODE'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByResetPasswordToken(token: string): Promise<User | undefined>;
  verifyUserEmail(userId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateUserSessionId(userId: string, sessionId: string | null): Promise<User | undefined>;
  markWelcomeMessageAsSeen(userId: string): Promise<User | undefined>;
  setResetPasswordToken(email: string, token: string, expiry: Date): Promise<User | undefined>;
  resetPassword(userId: string, newPassword: string): Promise<User | undefined>;
  
  getUserLoans(userId: string): Promise<Loan[]>;
  getLoansAvailableForTransfer(userId: string): Promise<Loan[]>;
  getLoan(id: string): Promise<Loan | undefined>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: string, loan: Partial<Loan>): Promise<Loan | undefined>;
  
  getUserTransfers(userId: string): Promise<Transfer[]>;
  getTransfer(id: string): Promise<Transfer | undefined>;
  createTransferWithCodes(insertTransfer: InsertTransfer, codesCount?: number): Promise<{ transfer: Transfer; codes: TransferValidationCode[] }>;
  createTransfer(transfer: InsertTransfer): Promise<Transfer>;
  updateTransfer(id: string, transfer: Partial<Transfer>): Promise<Transfer | undefined>;
  getActiveTransferForUser(userId: string): Promise<Transfer | null>;
  getActiveTransferForLoan(loanId: string): Promise<Transfer | null>;
  
  getUserFees(userId: string): Promise<Fee[]>;
  createFee(fee: InsertFee): Promise<Fee>;
  
  getUserTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  getDashboardData(userId: string): Promise<{
    user: User;
    balance: number;
    loans: Loan[];
    transfers: Transfer[];
    fees: Fee[];
    transactions: Transaction[];
  }>;
  
  getAllUsers(): Promise<User[]>;
  getAllTransfers(): Promise<Transfer[]>;
  getAllLoans(): Promise<Loan[]>;
  deleteUser(id: string): Promise<boolean>;
  
  getAdminSettings(): Promise<AdminSetting[]>;
  getAdminSetting(key: string): Promise<AdminSetting | undefined>;
  updateAdminSetting(key: string, value: any, updatedBy: string): Promise<AdminSetting>;
  
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  
  getActivityStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalTransfers: number;
    pendingTransfers: number;
    totalLoans: number;
    activeLoans: number;
  }>;
  
  getUserExternalAccounts(userId: string): Promise<ExternalAccount[]>;
  getExternalAccount(id: string): Promise<ExternalAccount | undefined>;
  createExternalAccount(account: InsertExternalAccount): Promise<ExternalAccount>;
  deleteExternalAccount(id: string): Promise<boolean>;
  
  createValidationCode(code: InsertTransferValidationCode): Promise<TransferValidationCode>;
  getTransferValidationCodes(transferId: string): Promise<TransferValidationCode[]>;
  validateCode(transferId: string, code: string, sequence: number, codeType?: string): Promise<TransferValidationCode | undefined>;
  validateTransferCode(transferId: string, code: string, sequence: number): Promise<TransferValidationCode | undefined>;
  validateTransferCodeAtomic(transferId: string, codeValue: string, sequence: number): Promise<ValidateTransferCodeAtomicResult>;
  validateLoanCode(loanId: string, code: string, sequence: number): Promise<TransferValidationCode | undefined>;
  
  createTransferEvent(event: InsertTransferEvent): Promise<TransferEvent>;
  getTransferEvents(transferId: string): Promise<TransferEvent[]>;
  
  getUserMessages(userId: string): Promise<AdminMessage[]>;
  getMessage(id: string): Promise<AdminMessage | undefined>;
  createAdminMessage(message: InsertAdminMessage): Promise<AdminMessage>;
  markMessageAsRead(id: string): Promise<AdminMessage | undefined>;
  
  approveLoan(id: string, approvedBy: string): Promise<Loan | undefined>;
  rejectLoan(id: string, rejectedBy: string, reason: string): Promise<Loan | undefined>;
  deleteLoan(id: string, deletedBy: string, reason: string): Promise<boolean>;
  markLoanFundsAvailable(loanId: string, adminId: string): Promise<{ loan: Loan; codes: TransferValidationCode[] } | undefined>;
  generateTransferCodes(transferId: string, loanId: string, userId: string, count?: number): Promise<TransferValidationCode[]>;
  generateLoanTransferCodes(loanId: string, userId: string, count?: number): Promise<TransferValidationCode[]>;
  getTransferCodes(transferId: string): Promise<TransferValidationCode[]>;
  getLoanTransferCodes(loanId: string): Promise<TransferValidationCode[]>;
  getLoanTransferCodeBySequence(loanId: string, sequence: number): Promise<TransferValidationCode | undefined>;
  
  updateUserBorrowingCapacity(userId: string, maxAmount: string): Promise<User | undefined>;
  suspendUser(userId: string, until: Date, reason: string): Promise<User | undefined>;
  blockUser(userId: string, reason: string): Promise<User | undefined>;
  unblockUser(userId: string): Promise<User | undefined>;
  blockExternalTransfers(userId: string, reason: string): Promise<User | undefined>;
  unblockExternalTransfers(userId: string): Promise<User | undefined>;
  
  issueTransferValidationCode(transferId: string, sequence: number): Promise<TransferValidationCode>;
  sendNotificationWithFee(userId: string, subject: string, content: string, feeType: string, feeAmount: string, feeReason: string): Promise<{ message: AdminMessage; fee: Fee }>;
  
  issueCodeWithNotificationAndFee(params: {
    transferId: string;
    userId: string;
    sequence: number;
    expiresAt: Date;
    deliveryMethod: string;
    subject: string;
    content: string;
    feeType: string;
    feeAmount: string;
    feeReason: string;
  }): Promise<{ code: TransferValidationCode; notification: AdminMessage; fee: Fee }>;
  
  getUnpaidFees(userId: string): Promise<Fee[]>;
  markFeeAsPaid(feeId: string): Promise<Fee | undefined>;
  
  getUserKycDocuments(userId: string): Promise<KycDocument[]>;
  getKycDocument(id: string): Promise<KycDocument | undefined>;
  createKycDocument(document: InsertKycDocument): Promise<KycDocument>;
  updateKycDocumentStatus(id: string, status: string): Promise<KycDocument | undefined>;
  getAllKycDocuments(): Promise<Array<KycDocument & { user: { id: string; fullName: string; email: string } }>>;
  approveKycDocument(id: string, reviewerId: string, notes?: string): Promise<KycDocument | undefined>;
  rejectKycDocument(id: string, reviewerId: string, notes: string): Promise<KycDocument | undefined>;
  deleteKycDocument(id: string): Promise<boolean>;
  
  enable2FA(userId: string, secret: string): Promise<User | undefined>;
  disable2FA(userId: string): Promise<User | undefined>;
  
  getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
  getNotification(id: string, userId: string): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string, userId: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<boolean>;
  deleteNotification(id: string, userId: string): Promise<boolean>;
  deleteAllNotificationsByType(userId: string, type: string): Promise<boolean>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  hasUnreadNotificationByType(userId: string, type: string): Promise<boolean>;
  hasNotificationByType(userId: string, type: string): Promise<boolean>;
  
  getAmortizationSchedule(loanId: string): Promise<AmortizationSchedule[]>;
  createAmortizationSchedule(schedule: InsertAmortizationSchedule): Promise<AmortizationSchedule>;
  generateAmortizationSchedule(loanId: string): Promise<AmortizationSchedule[]>;
  getUpcomingPayments(loanId: string, limit?: number): Promise<AmortizationSchedule[]>;
  markPaymentAsPaid(paymentId: string): Promise<AmortizationSchedule | undefined>;
  
  // Tier system methods
  getMaxActiveLoans(tier: string): number;
  getMaxBorrowingCapacity(tier: string, accountType: string): number;
  getActiveLoansCount(userId: string): Promise<number>;
  getUserStats(userId: string): Promise<{ tier: string; completedLoans: number; activeLoans: number; maxActiveLoans: number; defaultedLoans: number; maxBorrowingCapacity: number }>;
  checkAndUpgradeTier(userId: string): Promise<{ upgraded: boolean; oldTier: string; newTier: string }>;
  
  // Chat System
  getUserConversations(userId: string): Promise<ChatConversation[]>;
  getAdminConversations(adminId?: string, status?: string): Promise<ChatConversation[]>;
  getAdminConversationsForUnread(adminId: string): Promise<ChatConversation[]>;
  getConversation(id: string): Promise<ChatConversation | undefined>;
  createConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  updateConversation(id: string, updates: Partial<ChatConversation>): Promise<ChatConversation | undefined>;
  assignConversationToAdmin(conversationId: string, adminId: string): Promise<ChatConversation | undefined>;
  
  getConversationMessages(conversationId: string, limit?: number): Promise<ChatMessage[]>;
  getChatMessage(messageId: string): Promise<ChatMessage | undefined>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<number>;
  getUnreadMessageCount(conversationId: string, userId: string): Promise<number>;
  
  getUserPresence(userId: string): Promise<ChatPresence | undefined>;
  updateUserPresence(userId: string, status: string): Promise<ChatPresence>;
  getOnlineUsers(): Promise<ChatPresence[]>;
  deleteConversation(conversationId: string): Promise<boolean>;
  
  resetDashboardStatistics(): Promise<{
    deletedTransfers: number;
    deletedLoans: number;
    deletedUsers: number;
  }>;
}

// export class MemStorage implements IStorage {
//   private users: Map<string, User>;
//   private loans: Map<string, Loan>;
//   private transfers: Map<string, Transfer>;
//   private fees: Map<string, Fee>;
//   private transactions: Map<string, Transaction>;
//   private adminSettings: Map<string, AdminSetting>;
//   private auditLogs: AuditLog[];
//   private externalAccounts: Map<string, ExternalAccount>;
//   private validationCodes: Map<string, TransferValidationCode>;
//   private transferEvents: Map<string, TransferEvent>;
//   private adminMessages: Map<string, AdminMessage>;

//   constructor() {
//     this.users = new Map();
//     this.loans = new Map();
//     this.transfers = new Map();
//     this.fees = new Map();
//     this.transactions = new Map();
//     this.adminSettings = new Map();
//     this.auditLogs = [];
//     this.externalAccounts = new Map();
//     this.validationCodes = new Map();
//     this.transferEvents = new Map();
//     this.adminMessages = new Map();
//     this.seedData();
//   }

//   private seedData() {
//     const demoUserId = "demo-user-001";
//     const demoUser: User = {
//       id: demoUserId,
//       username: "jean.dupont",
//       password: "hashed_password",
//       email: "jean.dupont@entreprise.fr",
//       fullName: "Jean Dupont",
//       phone: "+33612345678",
//       accountType: "business",
//       role: "user",
//       status: "active",
//       kycStatus: "approved",
//       kycSubmittedAt: new Date("2023-01-01"),
//       kycApprovedAt: new Date("2023-01-05"),
//       maxLoanAmount: "500000.00",
//       suspendedUntil: null,
//       suspensionReason: null,
//       externalTransfersBlocked: false,
//       transferBlockReason: null,
//       createdAt: new Date("2023-01-01"),
//       updatedAt: new Date("2023-01-01"),
//     };
//     this.users.set(demoUserId, demoUser);
// 
//     const loan1: Loan = {
//       id: "loan-001",
//       userId: demoUserId,
//       loanType: "business",
//       amount: "200000",
//       interestRate: "3.5",
//       duration: 60,
//       status: "active",
//       approvedAt: new Date("2023-01-10"),
//       approvedBy: "admin-001",
//       rejectedAt: null,
//       rejectionReason: null,
//       nextPaymentDate: new Date("2025-12-15"),
//       totalRepaid: "75000",
//       deletedAt: null,
//       deletedBy: null,
//       deletionReason: null,
//       createdAt: new Date("2023-01-15"),
//     };
//     this.loans.set(loan1.id, loan1);
// 
//     const loan2: Loan = {
//       id: "loan-002",
//       userId: demoUserId,
//       loanType: "personal",
//       amount: "150000",
//       interestRate: "4.2",
//       duration: 48,
//       status: "active",
//       approvedAt: new Date("2023-06-08"),
//       approvedBy: "admin-001",
//       rejectedAt: null,
//       rejectionReason: null,
//       nextPaymentDate: new Date("2025-12-20"),
//       totalRepaid: "50000",
//       deletedAt: null,
//       deletedBy: null,
//       deletionReason: null,
//       createdAt: new Date("2023-06-10"),
//     };
//     this.loans.set(loan2.id, loan2);
// 
//     const loan3: Loan = {
//       id: "loan-003",
//       userId: demoUserId,
//       loanType: "business",
//       amount: "100000",
//       interestRate: "3.8",
//       duration: 36,
//       status: "active",
//       approvedAt: new Date("2024-02-18"),
//       approvedBy: "admin-001",
//       rejectedAt: null,
//       rejectionReason: null,
//       nextPaymentDate: new Date("2025-12-28"),
//       totalRepaid: "30000",
//       deletedAt: null,
//       deletedBy: null,
//       deletionReason: null,
//       createdAt: new Date("2024-02-20"),
//     };
//     this.loans.set(loan3.id, loan3);
// 
//     const transfer1: Transfer = {
//       id: "transfer-001",
//       userId: demoUserId,
//       externalAccountId: null,
//       amount: "50000",
//       recipient: "Fournisseur ABC SARL",
//       status: "in-progress",
//       currentStep: 3,
//       progressPercent: 60,
//       feeAmount: "25.00",
//       requiredCodes: 2,
//       codesValidated: 1,
//       approvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
//       suspendedAt: null,
//       completedAt: null,
//       createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
//       updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
//     };
//     this.transfers.set(transfer1.id, transfer1);
// 
//     const transfer2: Transfer = {
//       id: "transfer-002",
//       userId: demoUserId,
//       externalAccountId: null,
//       amount: "25000",
//       recipient: "Partenaire XYZ Inc.",
//       status: "pending",
//       currentStep: 1,
//       progressPercent: 20,
//       feeAmount: "15.00",
//       requiredCodes: 1,
//       codesValidated: 0,
//       approvedAt: null,
//       suspendedAt: null,
//       completedAt: null,
//       createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
//       updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
//     };
//     this.transfers.set(transfer2.id, transfer2);
// 
//     const fees = [
//       {
//         id: "fee-001",
//         userId: demoUserId,
//         feeType: "Frais de dossier",
//         reason: "Traitement de la demande de prêt #12345",
//         amount: "150",
//         isPaid: true,
//         paidAt: new Date("2025-11-02"),
//         relatedMessageId: null,
//         createdAt: new Date("2025-11-01"),
//       },
//       {
//         id: "fee-002",
//         userId: demoUserId,
//         feeType: "Frais de transfert international",
//         reason: "Transfert vers compte étranger",
//         amount: "25",
//         isPaid: false,
//         paidAt: null,
//         relatedMessageId: null,
//         createdAt: new Date("2025-11-05"),
//       },
//       {
//         id: "fee-003",
//         userId: demoUserId,
//         feeType: "Frais de gestion mensuel",
//         reason: "Gestion de compte professionnel",
//         amount: "15",
//         isPaid: false,
//         paidAt: null,
//         relatedMessageId: null,
//         createdAt: new Date("2025-11-01"),
//       },
//       {
//         id: "fee-004",
//         userId: demoUserId,
//         feeType: "Frais de garantie",
//         reason: "Assurance sur prêt #12346",
//         amount: "200",
//         isPaid: false,
//         paidAt: null,
//         relatedMessageId: null,
//         createdAt: new Date("2025-11-10"),
//       },
//     ];
//     fees.forEach((fee) => this.fees.set(fee.id, fee));
// 
//     const transactions = [
//       {
//         id: "tx-001",
//         userId: demoUserId,
//         type: "credit",
//         amount: "200000",
//         description: "Décaissement prêt #12345",
//         createdAt: new Date("2023-01-15"),
//       },
//       {
//         id: "tx-002",
//         userId: demoUserId,
//         type: "debit",
//         amount: "8000",
//         description: "Remboursement mensuel prêt #12345",
//         createdAt: new Date("2025-11-15"),
//       },
//       {
//         id: "tx-003",
//         userId: demoUserId,
//         type: "credit",
//         amount: "150000",
//         description: "Décaissement prêt #12346",
//         createdAt: new Date("2023-06-10"),
//       },
//       {
//         id: "tx-004",
//         userId: demoUserId,
//         type: "debit",
//         amount: "50000",
//         description: "Transfert vers Fournisseur ABC SARL",
//         createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
//       },
//       {
//         id: "tx-005",
//         userId: demoUserId,
//         type: "fee",
//         amount: "150",
//         description: "Frais de dossier - Traitement de la demande de prêt",
//         createdAt: new Date("2025-11-01"),
//       },
//       {
//         id: "tx-006",
//         userId: demoUserId,
//         type: "fee",
//         amount: "25",
//         description: "Frais de transfert international",
//         createdAt: new Date("2025-11-05"),
//       },
//       {
//         id: "tx-007",
//         userId: demoUserId,
//         type: "debit",
//         amount: "5500",
//         description: "Remboursement mensuel prêt #12346",
//         createdAt: new Date("2025-10-20"),
//       },
//       {
//         id: "tx-008",
//         userId: demoUserId,
//         type: "credit",
//         amount: "100000",
//         description: "Décaissement prêt #12347",
//         createdAt: new Date("2024-02-20"),
//       },
//     ];
//     transactions.forEach((tx) => this.transactions.set(tx.id, tx));
// 
//     const adminSettingsData: AdminSetting[] = [
//       {
//         id: randomUUID(),
//         settingKey: "default_transfer_fee",
//         settingValue: { amount: 25, currency: "EUR" },
//         description: "Montant des frais de transfert par défaut",
//         updatedAt: new Date(),
//         updatedBy: "admin-001",
//       },
//       {
//         id: randomUUID(),
//         settingKey: "validation_codes_count",
//         settingValue: { min: 5, max: 10, default: 5 },
//         description: "Nombre de codes de validation requis (minimum 5)",
//         updatedAt: new Date(),
//         updatedBy: "admin-001",
//       },
//       {
//         id: randomUUID(),
//         settingKey: "validation_code_amount_threshold",
//         settingValue: { amount: 50000, currency: "EUR" },
//         description: "Montant déclenchant plusieurs codes de validation",
//         updatedAt: new Date(),
//         updatedBy: "admin-001",
//       },
//       {
//         id: randomUUID(),
//         settingKey: "interest_rate_tiers",
//         settingValue: {
//           business: [
//             { min: 0, max: 50000, rate: 4.5 },
//             { min: 50000, max: 100000, rate: 3.8 },
//             { min: 100000, max: 200000, rate: 3.5 },
//             { min: 200000, max: Infinity, rate: 3.2 }
//           ],
//           personal: [
//             { min: 0, max: 25000, rate: 5.5 },
//             { min: 25000, max: 50000, rate: 4.8 },
//             { min: 50000, max: 100000, rate: 4.2 },
//             { min: 100000, max: Infinity, rate: 3.9 }
//           ],
//           real_estate: [
//             { min: 0, max: 100000, rate: 3.2 },
//             { min: 100000, max: 300000, rate: 2.9 },
//             { min: 300000, max: Infinity, rate: 2.5 }
//           ]
//         },
//         description: "Barèmes de taux d'intérêt par type de prêt et montant",
//         updatedAt: new Date(),
//         updatedBy: "admin-001",
//       },
//     ];
//     adminSettingsData.forEach((setting) => this.adminSettings.set(setting.settingKey, setting));
// 
//     const user2: User = {
//       id: "user-002",
//       username: "marie.martin",
//       password: "hashed_password_2",
//       email: "marie.martin@societe.fr",
//       fullName: "Marie Martin",
//       phone: "+33698765432",
//       accountType: "business",
//       role: "user",
//       status: "active",
//       kycStatus: "approved",
//       kycSubmittedAt: new Date("2024-03-01"),
//       kycApprovedAt: new Date("2024-03-05"),
//       maxLoanAmount: "300000.00",
//       suspendedUntil: null,
//       suspensionReason: null,
//       externalTransfersBlocked: false,
//       transferBlockReason: null,
//       createdAt: new Date("2024-03-01"),
//       updatedAt: new Date("2024-03-01"),
//     };
//     this.users.set(user2.id, user2);
// 
//     const user3: User = {
//       id: "user-003",
//       username: "pierre.bernard",
//       password: "hashed_password_3",
//       email: "pierre.bernard@company.fr",
//       fullName: "Pierre Bernard",
//       phone: "+33687654321",
//       accountType: "business",
//       role: "user",
//       status: "pending",
//       kycStatus: "pending",
//       kycSubmittedAt: new Date("2025-11-01"),
//       kycApprovedAt: null,
//       maxLoanAmount: "100000.00",
//       suspendedUntil: null,
//       suspensionReason: null,
//       externalTransfersBlocked: false,
//       transferBlockReason: null,
//       createdAt: new Date("2025-11-01"),
//       updatedAt: new Date("2025-11-01"),
//     };
//     this.users.set(user3.id, user3);
// 
//     const transfer3: Transfer = {
//       id: "transfer-003",
//       userId: "user-002",
//       externalAccountId: null,
//       amount: "75000",
//       recipient: "Client ABC Ltd",
//       status: "completed",
//       currentStep: 5,
//       progressPercent: 100,
//       feeAmount: "50.00",
//       requiredCodes: 3,
//       codesValidated: 3,
//       approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
//       suspendedAt: null,
//       completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
//       createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
//       updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
//     };
//     this.transfers.set(transfer3.id, transfer3);
// 
//     this.auditLogs = [
//       {
//         id: randomUUID(),
//         actorId: "admin-001",
//         actorRole: "admin",
//         action: "approve_transfer",
//         entityType: "transfer",
//         entityId: "transfer-003",
//         metadata: { amount: "75000", recipient: "Client ABC Ltd" },
//         ipAddress: "192.168.1.1",
//         userAgent: "Mozilla/5.0",
//         createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
//       },
//       {
//         id: randomUUID(),
//         actorId: "admin-001",
//         actorRole: "admin",
//         action: "update_settings",
//         entityType: "admin_setting",
//         entityId: null,
//         metadata: { settingKey: "default_transfer_fee", oldValue: 20, newValue: 25 },
//         ipAddress: "192.168.1.1",
//         userAgent: "Mozilla/5.0",
//         createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
//       },
//     ];
//   }
// 
//   async getUser(id: string): Promise<User | undefined> {
//     return this.users.get(id);
//   }
// 
//   async getUserByUsername(username: string): Promise<User | undefined> {
//     return Array.from(this.users.values()).find(
//       (user) => user.username === username,
//     );
//   }
// 
//   async createUser(insertUser: InsertUser): Promise<User> {
//     const id = randomUUID();
//     const now = new Date();
//     const user: User = { 
//       ...insertUser,
//       id,
//       phone: insertUser.phone || null,
//       accountType: insertUser.accountType || 'business',
//       role: insertUser.role || 'user',
//       status: insertUser.status || 'pending',
//       kycStatus: insertUser.kycStatus || 'pending',
//       kycSubmittedAt: insertUser.kycSubmittedAt || null,
//       kycApprovedAt: insertUser.kycApprovedAt || null,
//       maxLoanAmount: insertUser.maxLoanAmount || "50000.00",
//       suspendedUntil: insertUser.suspendedUntil || null,
//       suspensionReason: insertUser.suspensionReason || null,
//       externalTransfersBlocked: insertUser.externalTransfersBlocked || false,
//       transferBlockReason: insertUser.transferBlockReason || null,
//       createdAt: now,
//       updatedAt: now,
//     };
//     this.users.set(id, user);
//     return user;
//   }
// 
//   async getUserLoans(userId: string): Promise<Loan[]> {
//     return Array.from(this.loans.values()).filter(
//       (loan) => loan.userId === userId
//     );
//   }
// 
//   async getLoan(id: string): Promise<Loan | undefined> {
//     return this.loans.get(id);
//   }
// 
//   async createLoan(insertLoan: InsertLoan): Promise<Loan> {
//     const id = randomUUID();
//     const loan: Loan = {
//       ...insertLoan,
//       id,
//       status: insertLoan.status || 'pending',
//       approvedAt: insertLoan.approvedAt || null,
//       approvedBy: insertLoan.approvedBy || null,
//       rejectedAt: insertLoan.rejectedAt || null,
//       rejectionReason: insertLoan.rejectionReason || null,
//       totalRepaid: insertLoan.totalRepaid || '0',
//       nextPaymentDate: insertLoan.nextPaymentDate || null,
//       deletedAt: insertLoan.deletedAt || null,
//       deletedBy: insertLoan.deletedBy || null,
//       deletionReason: insertLoan.deletionReason || null,
//       createdAt: new Date(),
//     };
//     this.loans.set(id, loan);
//     return loan;
//   }
// 
//   async updateLoan(id: string, updates: Partial<Loan>): Promise<Loan | undefined> {
//     const loan = this.loans.get(id);
//     if (!loan) return undefined;
//     const updated = { ...loan, ...updates };
//     this.loans.set(id, updated);
//     return updated;
//   }
// 
//   async getUserTransfers(userId: string): Promise<Transfer[]> {
//     return Array.from(this.transfers.values()).filter(
//       (transfer) => transfer.userId === userId
//     );
//   }
// 
//   async getTransfer(id: string): Promise<Transfer | undefined> {
//     return this.transfers.get(id);
//   }
// 
//   async createTransfer(insertTransfer: InsertTransfer): Promise<Transfer> {
//     const id = randomUUID();
//     const now = new Date();
//     const transfer: Transfer = {
//       ...insertTransfer,
//       id,
//       externalAccountId: insertTransfer.externalAccountId || null,
//       status: insertTransfer.status || 'pending',
//       currentStep: insertTransfer.currentStep || 1,
//       progressPercent: insertTransfer.progressPercent || 0,
//       feeAmount: insertTransfer.feeAmount || "0",
//       requiredCodes: insertTransfer.requiredCodes || 1,
//       codesValidated: insertTransfer.codesValidated || 0,
//       approvedAt: insertTransfer.approvedAt || null,
//       suspendedAt: insertTransfer.suspendedAt || null,
//       completedAt: insertTransfer.completedAt || null,
//       createdAt: now,
//       updatedAt: now,
//     };
//     this.transfers.set(id, transfer);
//     return transfer;
//   }
// 
//   async updateTransfer(id: string, updates: Partial<Transfer>): Promise<Transfer | undefined> {
//     const transfer = this.transfers.get(id);
//     if (!transfer) return undefined;
//     const updated = { ...transfer, ...updates, updatedAt: new Date() };
//     this.transfers.set(id, updated);
//     return updated;
//   }
// 
//   async getUserFees(userId: string): Promise<Fee[]> {
//     return Array.from(this.fees.values()).filter(
//       (fee) => fee.userId === userId
//     );
//   }
// 
//   async createFee(insertFee: InsertFee): Promise<Fee> {
//     const id = randomUUID();
//     const fee: Fee = {
//       ...insertFee,
//       id,
//       isPaid: insertFee.isPaid || false,
//       paidAt: insertFee.paidAt || null,
//       relatedMessageId: insertFee.relatedMessageId || null,
//       createdAt: new Date(),
//     };
//     this.fees.set(id, fee);
//     return fee;
//   }
// 
//   async getUserTransactions(userId: string): Promise<Transaction[]> {
//     return Array.from(this.transactions.values())
//       .filter((tx) => tx.userId === userId)
//       .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
//   }
// 
//   async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
//     const id = randomUUID();
//     const transaction: Transaction = {
//       ...insertTransaction,
//       id,
//       createdAt: new Date(),
//     };
//     this.transactions.set(id, transaction);
//     return transaction;
//   }
// 
//   async getDashboardData(userId: string) {
//     const user = await this.getUser(userId);
//     if (!user) {
//       throw new Error("User not found");
//     }
// 
//     const loans = await this.getUserLoans(userId);
//     const transfers = await this.getUserTransfers(userId);
//     const fees = await this.getUserFees(userId);
//     const transactions = await this.getUserTransactions(userId);
// 
//     const totalBorrowed = loans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0);
//     const totalRepaid = loans.reduce((sum, loan) => sum + parseFloat(loan.totalRepaid), 0);
//     const balance = totalBorrowed - totalRepaid;
// 
//     return {
//       user,
//       balance,
//       loans,
//       transfers,
//       fees,
//       transactions,
//     };
//   }
// 
//   async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
//     const user = this.users.get(id);
//     if (!user) return undefined;
//     const updated = { ...user, ...updates, updatedAt: new Date() };
//     this.users.set(id, updated);
//     return updated;
//   }
// 
//   async getAllUsers(): Promise<User[]> {
//     return Array.from(this.users.values());
//   }
// 
//   async getAllTransfers(): Promise<Transfer[]> {
//     return Array.from(this.transfers.values())
//       .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
//   }
// 
//   async getAllLoans(): Promise<Loan[]> {
//     return Array.from(this.loans.values());
//   }
// 
//   async deleteUser(id: string): Promise<boolean> {
//     return this.users.delete(id);
//   }
// 
//   async getAdminSettings(): Promise<AdminSetting[]> {
//     return Array.from(this.adminSettings.values());
//   }
// 
//   async getAdminSetting(key: string): Promise<AdminSetting | undefined> {
//     return this.adminSettings.get(key);
//   }
// 
//   async updateAdminSetting(key: string, value: any, updatedBy: string): Promise<AdminSetting> {
//     const existing = this.adminSettings.get(key);
//     const setting: AdminSetting = {
//       id: existing?.id || randomUUID(),
//       settingKey: key,
//       settingValue: value,
//       description: existing?.description || "",
//       updatedAt: new Date(),
//       updatedBy,
//     };
//     this.adminSettings.set(key, setting);
//     return setting;
//   }
// 
//   async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
//     return this.auditLogs
//       .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
//       .slice(0, limit);
//   }
// 
//   async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
//     const log: AuditLog = {
//       ...insertLog,
//       id: randomUUID(),
//       entityId: insertLog.entityId || null,
//       metadata: insertLog.metadata || null,
//       ipAddress: insertLog.ipAddress || null,
//       userAgent: insertLog.userAgent || null,
//       createdAt: new Date(),
//     };
//     this.auditLogs.push(log);
//     return log;
//   }
// 
//   async getActivityStats() {
//     const users = Array.from(this.users.values());
//     const transfers = Array.from(this.transfers.values());
//     const loans = Array.from(this.loans.values());
// 
//     return {
//       totalUsers: users.length,
//       activeUsers: users.filter(u => u.status === 'active').length,
//       totalTransfers: transfers.length,
//       pendingTransfers: transfers.filter(t => t.status === 'pending' || t.status === 'in-progress').length,
//       totalLoans: loans.length,
//       activeLoans: loans.filter(l => l.status === 'active').length,
//     };
//   }
// 
//   async getUserExternalAccounts(userId: string): Promise<ExternalAccount[]> {
//     return Array.from(this.externalAccounts.values()).filter(
//       (account) => account.userId === userId
//     );
//   }
// 
//   async getExternalAccount(id: string): Promise<ExternalAccount | undefined> {
//     return this.externalAccounts.get(id);
//   }
// 
//   async createExternalAccount(insertAccount: InsertExternalAccount): Promise<ExternalAccount> {
//     const id = randomUUID();
//     const account: ExternalAccount = {
//       ...insertAccount,
//       id,
//       bic: insertAccount.bic || null,
//       isDefault: insertAccount.isDefault || false,
//       createdAt: new Date(),
//     };
//     this.externalAccounts.set(id, account);
//     return account;
//   }
// 
//   async deleteExternalAccount(id: string): Promise<boolean> {
//     return this.externalAccounts.delete(id);
//   }
// 
//   async createValidationCode(insertCode: InsertTransferValidationCode): Promise<TransferValidationCode> {
//     const id = randomUUID();
//     const code: TransferValidationCode = {
//       ...insertCode,
//       id,
//       sequence: insertCode.sequence || 1,
//       issuedAt: new Date(),
//       consumedAt: insertCode.consumedAt || null,
//     };
//     this.validationCodes.set(id, code);
//     return code;
//   }
// 
//   async getTransferValidationCodes(transferId: string): Promise<TransferValidationCode[]> {
//     return Array.from(this.validationCodes.values())
//       .filter((code) => code.transferId === transferId)
//       .sort((a, b) => a.sequence - b.sequence);
//   }
// 
//   async validateCode(transferId: string, code: string, sequence: number): Promise<TransferValidationCode | undefined> {
//     const validationCode = Array.from(this.validationCodes.values()).find(
//       (vc) => vc.transferId === transferId && vc.code === code && vc.sequence === sequence && !vc.consumedAt
//     );
//     
//     if (validationCode && new Date() <= validationCode.expiresAt) {
//       const updated = { ...validationCode, consumedAt: new Date() };
//       this.validationCodes.set(validationCode.id, updated);
//       return updated;
//     }
//     
//     return undefined;
//   }
// 
//   async createTransferEvent(insertEvent: InsertTransferEvent): Promise<TransferEvent> {
//     const id = randomUUID();
//     const event: TransferEvent = {
//       ...insertEvent,
//       id,
//       metadata: insertEvent.metadata || null,
//       createdAt: new Date(),
//     };
//     this.transferEvents.set(id, event);
//     return event;
//   }
// 
//   async getTransferEvents(transferId: string): Promise<TransferEvent[]> {
//     return Array.from(this.transferEvents.values())
//       .filter((event) => event.transferId === transferId)
//       .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
//   }
// 
//   async getUserMessages(userId: string): Promise<AdminMessage[]> {
//     return Array.from(this.adminMessages.values())
//       .filter((msg) => msg.userId === userId)
//       .sort((a, b) => b.deliveredAt.getTime() - a.deliveredAt.getTime());
//   }
// 
//   async createAdminMessage(insertMessage: InsertAdminMessage): Promise<AdminMessage> {
//     const id = randomUUID();
//     const message: AdminMessage = {
//       ...insertMessage,
//       id,
//       transferId: insertMessage.transferId || null,
//       severity: insertMessage.severity || 'info',
//       isRead: insertMessage.isRead || false,
//       deliveredAt: new Date(),
//       readAt: insertMessage.readAt || null,
//     };
//     this.adminMessages.set(id, message);
//     return message;
//   }
// 
//   async markMessageAsRead(id: string): Promise<AdminMessage | undefined> {
//     const message = this.adminMessages.get(id);
//     if (!message) return undefined;
//     const updated = { ...message, isRead: true, readAt: new Date() };
//     this.adminMessages.set(id, updated);
//     return updated;
//   }
// 
//   async approveLoan(id: string, approvedBy: string): Promise<Loan | undefined> {
//     const loan = this.loans.get(id);
//     if (!loan) return undefined;
//     const updated = { 
//       ...loan, 
//       status: "approved", 
//       approvedAt: new Date(), 
//       approvedBy 
//     };
//     this.loans.set(id, updated);
//     return updated;
//   }
// 
//   async rejectLoan(id: string, rejectedBy: string, reason: string): Promise<Loan | undefined> {
//     const loan = this.loans.get(id);
//     if (!loan) return undefined;
//     const updated = { 
//       ...loan, 
//       status: "rejected", 
//       rejectedAt: new Date(), 
//       approvedBy: rejectedBy,
//       rejectionReason: reason 
//     };
//     this.loans.set(id, updated);
//     return updated;
//   }
// 
//   async deleteLoan(id: string, deletedBy: string, reason: string): Promise<boolean> {
//     const loan = this.loans.get(id);
//     if (!loan) return false;
//     const updated = { 
//       ...loan, 
//       deletedAt: new Date(), 
//       deletedBy,
//       deletionReason: reason 
//     };
//     this.loans.set(id, updated);
//     return true;
//   }
// 
//   async updateUserBorrowingCapacity(userId: string, maxAmount: string): Promise<User | undefined> {
//     const user = this.users.get(userId);
//     if (!user) return undefined;
//     const updated = { ...user, maxLoanAmount: maxAmount, updatedAt: new Date() };
//     this.users.set(userId, updated);
//     return updated;
//   }
// 
//   async suspendUser(userId: string, until: Date, reason: string): Promise<User | undefined> {
//     const user = this.users.get(userId);
//     if (!user) return undefined;
//     const updated = { 
//       ...user, 
//       status: "suspended", 
//       suspendedUntil: until, 
//       suspensionReason: reason,
//       updatedAt: new Date() 
//     };
//     this.users.set(userId, updated);
//     return updated;
//   }
// 
//   async blockUser(userId: string, reason: string): Promise<User | undefined> {
//     const user = this.users.get(userId);
//     if (!user) return undefined;
//     const updated = { 
//       ...user, 
//       status: "blocked", 
//       suspendedUntil: null,
//       suspensionReason: reason,
//       updatedAt: new Date() 
//     };
//     this.users.set(userId, updated);
//     return updated;
//   }
// 
//   async unblockUser(userId: string): Promise<User | undefined> {
//     const user = this.users.get(userId);
//     if (!user) return undefined;
//     const updated = { 
//       ...user, 
//       status: "active", 
//       suspendedUntil: null,
//       suspensionReason: null,
//       updatedAt: new Date() 
//     };
//     this.users.set(userId, updated);
//     return updated;
//   }
// 
//   async blockExternalTransfers(userId: string, reason: string): Promise<User | undefined> {
//     const user = this.users.get(userId);
//     if (!user) return undefined;
//     const updated = { 
//       ...user, 
//       externalTransfersBlocked: true,
//       transferBlockReason: reason,
//       updatedAt: new Date() 
//     };
//     this.users.set(userId, updated);
//     return updated;
//   }
// 
//   async unblockExternalTransfers(userId: string): Promise<User | undefined> {
//     const user = this.users.get(userId);
//     if (!user) return undefined;
//     const updated = { 
//       ...user, 
//       externalTransfersBlocked: false,
//       transferBlockReason: null,
//       updatedAt: new Date() 
//     };
//     this.users.set(userId, updated);
//     return updated;
//   }
// 
//   async issueTransferValidationCode(transferId: string, sequence: number): Promise<TransferValidationCode> {
//     const code = Math.floor(100000 + Math.random() * 900000).toString();
//     const id = randomUUID();
//     const now = new Date();
//     const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
//     
//     const validationCode: TransferValidationCode = {
//       id,
//       transferId,
//       code,
//       deliveryMethod: "email",
//       sequence,
//       issuedAt: now,
//       expiresAt,
//       consumedAt: null,
//     };
//     this.validationCodes.set(id, validationCode);
//     return validationCode;
//   }
// 
//   async sendNotificationWithFee(
//     userId: string, 
//     subject: string, 
//     content: string, 
//     feeType: string, 
//     feeAmount: string, 
//     feeReason: string
//   ): Promise<{ message: AdminMessage; fee: Fee }> {
//     const messageId = randomUUID();
//     const feeId = randomUUID();
//     const now = new Date();
//     
//     const fee: Fee = {
//       id: feeId,
//       userId,
//       feeType,
//       reason: feeReason,
//       amount: feeAmount,
//       isPaid: false,
//       paidAt: null,
//       relatedMessageId: messageId,
//       createdAt: now,
//     };
//     this.fees.set(feeId, fee);
//     
//     const message: AdminMessage = {
//       id: messageId,
//       userId,
//       transferId: null,
//       subject,
//       content,
//       severity: "warning",
//       isRead: false,
//       deliveredAt: now,
//       readAt: null,
//     };
//     this.adminMessages.set(messageId, message);
//     
//     return { message, fee };
//   }
// 
//   async getUnpaidFees(userId: string): Promise<Fee[]> {
//     return Array.from(this.fees.values()).filter(
//       (fee) => fee.userId === userId && !fee.isPaid
//     );
//   }
// 
//   async markFeeAsPaid(feeId: string): Promise<Fee | undefined> {
//     const fee = this.fees.get(feeId);
//     if (!fee) return undefined;
//     const updated = { ...fee, isPaid: true, paidAt: new Date() };
//     this.fees.set(feeId, updated);
//     return updated;
//   }
// }

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedData();
    this.initializeAdmin();
  }

  private async initializeAdmin() {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      const resetPassword = process.env.RESET_ADMIN_PASSWORD === 'true';
      
      if (!adminEmail || !adminPassword) {
        console.log('⚠️ ADMIN_EMAIL ou ADMIN_PASSWORD non défini - compte admin non créé');
        return;
      }
      
      const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
      
      if (existingAdmin.length === 0) {
        // Créer le compte admin
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        
        await db.insert(users).values({
          username: 'admin',
          email: adminEmail,
          password: hashedPassword,
          fullName: 'Administrateur',
          role: 'admin',
          status: 'active',
          emailVerified: true,
          accountType: 'business',
          kycStatus: 'approved',
          kycApprovedAt: new Date(),
        });
        
        console.log('✅ Compte administrateur créé avec succès:', adminEmail);
      } else if (resetPassword) {
        // Mettre à jour le mot de passe uniquement si RESET_ADMIN_PASSWORD=true
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        
        await db.update(users)
          .set({ 
            password: hashedPassword,
            updatedAt: new Date()
          })
          .where(eq(users.email, adminEmail));
        
        console.log('✅ Mot de passe administrateur réinitialisé:', adminEmail);
        console.log('⚠️ N\'oubliez pas de supprimer RESET_ADMIN_PASSWORD des variables d\'environnement');
      } else {
        console.log('ℹ️ Compte administrateur existant:', adminEmail);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de l\'administrateur:', error);
    }
  }

  private async seedData() {
    try {
      const existingUsers = await withRetry(() => db.select().from(users).limit(1));
      if (existingUsers.length > 0) {
        console.log('[Seed] Database already seeded, skipping...');
        return;
      }

      const existingSettings = await withRetry(() => db.select().from(adminSettings).limit(1));
      const needsSettings = existingSettings.length === 0;
      
      console.log('[Seed] Seeding database with demo data...');

    const demoUserId = "demo-user-001";
    
    await db.insert(users).values({
      id: demoUserId,
      username: "jean.dupont",
      password: "hashed_password",
      email: "jean.dupont@entreprise.fr",
      fullName: "Jean Dupont",
      phone: "+33612345678",
      accountType: "business",
      role: "user",
      status: "active",
      kycStatus: "approved",
      kycSubmittedAt: new Date("2023-01-01"),
      kycApprovedAt: new Date("2023-01-05"),
      maxLoanAmount: "500000.00",
    });

    await db.insert(loans).values([
      {
        id: "loan-001",
        userId: demoUserId,
        loanType: "business",
        amount: "200000",
        interestRate: "3.5",
        duration: 60,
        status: "active",
        approvedAt: new Date("2023-01-10"),
        approvedBy: "admin-001",
        nextPaymentDate: new Date("2025-12-15"),
        totalRepaid: "75000",
        createdAt: new Date("2023-01-15"),
      },
      {
        id: "loan-002",
        userId: demoUserId,
        loanType: "personal",
        amount: "150000",
        interestRate: "4.2",
        duration: 48,
        status: "active",
        approvedAt: new Date("2023-06-08"),
        approvedBy: "admin-001",
        nextPaymentDate: new Date("2025-12-20"),
        totalRepaid: "50000",
        createdAt: new Date("2023-06-10"),
      },
      {
        id: "loan-003",
        userId: demoUserId,
        loanType: "business",
        amount: "100000",
        interestRate: "3.8",
        duration: 36,
        status: "active",
        approvedAt: new Date("2024-02-18"),
        approvedBy: "admin-001",
        nextPaymentDate: new Date("2025-12-28"),
        totalRepaid: "30000",
        createdAt: new Date("2024-02-20"),
      },
    ]);

    await db.insert(transfers).values([
      {
        id: "transfer-001",
        userId: demoUserId,
        amount: "50000",
        recipient: "Fournisseur ABC SARL",
        status: "in-progress",
        currentStep: 3,
        progressPercent: 60,
        feeAmount: "25.00",
        requiredCodes: 2,
        codesValidated: 1,
        approvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "transfer-002",
        userId: demoUserId,
        amount: "25000",
        recipient: "Partenaire XYZ Inc.",
        status: "pending",
        currentStep: 1,
        progressPercent: 20,
        feeAmount: "15.00",
        requiredCodes: 1,
        codesValidated: 0,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ]);

    await db.insert(fees).values([
      {
        id: "fee-001",
        userId: demoUserId,
        feeType: "Frais de dossier",
        reason: "Traitement de la demande de prêt #12345",
        amount: "150",
        isPaid: true,
        paidAt: new Date("2025-11-02"),
        createdAt: new Date("2025-11-01"),
      },
      {
        id: "fee-002",
        userId: demoUserId,
        feeType: "Frais de transfert international",
        reason: "Transfert vers compte étranger",
        amount: "25",
        isPaid: false,
        createdAt: new Date("2025-11-05"),
      },
      {
        id: "fee-003",
        userId: demoUserId,
        feeType: "Frais de gestion mensuel",
        reason: "Gestion de compte professionnel",
        amount: "15",
        isPaid: false,
        createdAt: new Date("2025-11-01"),
      },
      {
        id: "fee-004",
        userId: demoUserId,
        feeType: "Frais de garantie",
        reason: "Assurance sur prêt #12346",
        amount: "200",
        isPaid: false,
        createdAt: new Date("2025-11-10"),
      },
    ]);

    await db.insert(transactions).values([
      {
        id: "tx-001",
        userId: demoUserId,
        type: "credit",
        amount: "200000",
        description: "Décaissement prêt #12345",
        createdAt: new Date("2023-01-15"),
      },
      {
        id: "tx-002",
        userId: demoUserId,
        type: "debit",
        amount: "8000",
        description: "Remboursement mensuel prêt #12345",
        createdAt: new Date("2025-11-15"),
      },
      {
        id: "tx-003",
        userId: demoUserId,
        type: "credit",
        amount: "150000",
        description: "Décaissement prêt #12346",
        createdAt: new Date("2023-06-10"),
      },
      {
        id: "tx-004",
        userId: demoUserId,
        type: "debit",
        amount: "50000",
        description: "Transfert vers Fournisseur ABC SARL",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "tx-005",
        userId: demoUserId,
        type: "fee",
        amount: "150",
        description: "Frais de dossier - Traitement de la demande de prêt",
        createdAt: new Date("2025-11-01"),
      },
      {
        id: "tx-006",
        userId: demoUserId,
        type: "fee",
        amount: "25",
        description: "Frais de transfert international",
        createdAt: new Date("2025-11-05"),
      },
      {
        id: "tx-007",
        userId: demoUserId,
        type: "debit",
        amount: "5500",
        description: "Remboursement mensuel prêt #12346",
        createdAt: new Date("2025-10-20"),
      },
      {
        id: "tx-008",
        userId: demoUserId,
        type: "credit",
        amount: "100000",
        description: "Décaissement prêt #12347",
        createdAt: new Date("2024-02-20"),
      },
    ]);

    if (needsSettings) {
      await db.insert(adminSettings).values([
        {
          settingKey: "default_transfer_fee",
          settingValue: { amount: 25, currency: "EUR" },
          description: "Montant des frais de transfert par défaut",
          updatedBy: "admin-001",
        },
        {
          settingKey: "validation_codes_count",
          settingValue: { min: 5, max: 10, default: 5 },
          description: "Nombre de codes de validation requis (minimum 5)",
          updatedBy: "admin-001",
        },
        {
          settingKey: "validation_code_amount_threshold",
          settingValue: { amount: 50000, currency: "EUR" },
          description: "Montant déclenchant plusieurs codes de validation",
          updatedBy: "admin-001",
        },
        {
          settingKey: "interest_rate_tiers",
          settingValue: {
            business: [
              { min: 0, max: 50000, rate: 4.5 },
              { min: 50000, max: 100000, rate: 3.8 },
              { min: 100000, max: 200000, rate: 3.5 },
              { min: 200000, max: Infinity, rate: 3.2 }
            ],
            personal: [
              { min: 0, max: 25000, rate: 5.5 },
              { min: 25000, max: 50000, rate: 4.8 },
              { min: 50000, max: 100000, rate: 4.2 },
              { min: 100000, max: Infinity, rate: 3.9 }
            ],
            real_estate: [
              { min: 0, max: 100000, rate: 3.2 },
              { min: 100000, max: 300000, rate: 2.9 },
              { min: 300000, max: Infinity, rate: 2.5 }
            ]
          },
          description: "Barèmes de taux d'intérêt par type de prêt et montant",
          updatedBy: "admin-001",
        },
      ]);
    }

    await db.insert(users).values([
      {
        id: "user-002",
        username: "marie.martin",
        password: "hashed_password_2",
        email: "marie.martin@societe.fr",
        fullName: "Marie Martin",
        phone: "+33698765432",
        accountType: "business",
        role: "user",
        status: "active",
        kycStatus: "approved",
        kycSubmittedAt: new Date("2024-03-01"),
        kycApprovedAt: new Date("2024-03-05"),
        maxLoanAmount: "300000.00",
      },
      {
        id: "user-003",
        username: "pierre.bernard",
        password: "hashed_password_3",
        email: "pierre.bernard@company.fr",
        fullName: "Pierre Bernard",
        phone: "+33687654321",
        accountType: "business",
        role: "user",
        status: "pending",
        kycStatus: "pending",
        kycSubmittedAt: new Date("2025-11-01"),
        maxLoanAmount: "100000.00",
      },
    ]);

    await db.insert(transfers).values({
      id: "transfer-003",
      userId: "user-002",
      amount: "75000",
      recipient: "Client ABC Ltd",
      status: "completed",
      currentStep: 5,
      progressPercent: 100,
      feeAmount: "50.00",
      requiredCodes: 3,
      codesValidated: 3,
      approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    await db.insert(auditLogs).values([
      {
        actorId: "admin-001",
        actorRole: "admin",
        action: "approve_transfer",
        entityType: "transfer",
        entityId: "transfer-003",
        metadata: { amount: "75000", recipient: "Client ABC Ltd" },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        actorId: "admin-001",
        actorRole: "admin",
        action: "update_settings",
        entityType: "admin_setting",
        metadata: { settingKey: "default_transfer_fee", oldValue: 20, newValue: 25 },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ]);
      
      console.log('[Seed] Database seeded successfully');
    } catch (error) {
      console.error('[Seed] Error seeding database:', error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.verificationToken, token));
    return result[0];
  }

  async verifyUserEmail(userId: string): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ 
        emailVerified: true, 
        verificationToken: null, 
        verificationTokenExpiry: null,
        status: 'active'
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return result[0];
  }

  async updateUserSessionId(userId: string, sessionId: string | null): Promise<User | undefined> {
    const result = await db.update(users).set({ activeSessionId: sessionId, updatedAt: new Date() }).where(eq(users.id, userId)).returning();
    return result[0];
  }

  async markWelcomeMessageAsSeen(userId: string): Promise<User | undefined> {
    const result = await db.update(users).set({ hasSeenWelcomeMessage: true, updatedAt: new Date() }).where(eq(users.id, userId)).returning();
    return result[0];
  }

  async getUserByResetPasswordToken(token: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.resetPasswordToken, token));
    return result[0];
  }

  async setResetPasswordToken(email: string, token: string, expiry: Date): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ 
        resetPasswordToken: token,
        resetPasswordTokenExpiry: expiry,
        updatedAt: new Date()
      })
      .where(eq(users.email, email))
      .returning();
    return result[0];
  }

  async resetPassword(userId: string, newPassword: string): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ 
        password: newPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async getUserLoans(userId: string): Promise<Loan[]> {
    // CORRECTION: Exclure les prêts supprimés (soft delete) pour que le solde
    // disparaisse du compte utilisateur quand un admin supprime une demande
    return await db.select().from(loans).where(
      and(
        eq(loans.userId, userId),
        isNull(loans.deletedAt)
      )
    );
  }

  async getLoansAvailableForTransfer(userId: string): Promise<Loan[]> {
    // Récupérer les prêts actifs avec fonds disponibles
    const activeLoans = await db
      .select()
      .from(loans)
      .where(
        and(
          eq(loans.userId, userId),
          eq(loans.status, 'active'),
          eq(loans.fundsAvailabilityStatus, 'available'),
          isNull(loans.deletedAt)
        )
      );
    
    // Pour chaque prêt, vérifier s'il a un transfert complété
    const availableLoans: Loan[] = [];
    for (const loan of activeLoans) {
      const loanTransfers = await db
        .select()
        .from(transfers)
        .where(eq(transfers.loanId, loan.id));
      
      // Un prêt est disponible si:
      // - Il n'a aucun transfert
      // - OU il a un transfert en cours (pas complété) - pour permettre la reprise
      const hasCompletedTransfer = loanTransfers.some(t => t.status === 'completed');
      
      if (!hasCompletedTransfer) {
        availableLoans.push(loan);
      }
    }
    
    return availableLoans;
  }

  async getActiveTransferForUser(userId: string): Promise<Transfer | null> {
    // Chercher un transfert en cours (pending ou in-progress) pour cet utilisateur
    const result = await db
      .select()
      .from(transfers)
      .where(
        and(
          eq(transfers.userId, userId),
          or(
            eq(transfers.status, 'pending'),
            eq(transfers.status, 'in-progress')
          )
        )
      )
      .limit(1);
    
    return result[0] || null;
  }

  async getActiveTransferForLoan(loanId: string): Promise<Transfer | null> {
    // Chercher un transfert en cours pour ce prêt spécifique
    const result = await db
      .select()
      .from(transfers)
      .where(
        and(
          eq(transfers.loanId, loanId),
          or(
            eq(transfers.status, 'pending'),
            eq(transfers.status, 'in-progress')
          )
        )
      )
      .limit(1);
    
    return result[0] || null;
  }

  async getLoan(id: string): Promise<Loan | undefined> {
    const result = await db.select().from(loans).where(eq(loans.id, id));
    return result[0];
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    // Insérer le prêt d'abord pour obtenir l'ID et createdAt
    const result = await db.insert(loans).values(insertLoan).returning();
    const loan = result[0];
    
    // Générer et persister la référence professionnelle
    const { getLoanReferenceNumber } = await import('@shared/schema');
    const loanReference = getLoanReferenceNumber(loan);
    
    // Mettre à jour le prêt avec la référence
    const updated = await db
      .update(loans)
      .set({ loanReference })
      .where(eq(loans.id, loan.id))
      .returning();
    
    return updated[0];
  }

  async updateLoan(id: string, updates: Partial<Loan>): Promise<Loan | undefined> {
    const result = await db.update(loans).set(updates).where(eq(loans.id, id)).returning();
    return result[0];
  }

  async getUserTransfers(userId: string): Promise<Transfer[]> {
    return await db.select().from(transfers).where(eq(transfers.userId, userId));
  }

  async getTransfer(id: string): Promise<Transfer | undefined> {
    const result = await db.select().from(transfers).where(eq(transfers.id, id));
    return result[0];
  }

  async createTransfer(insertTransfer: InsertTransfer): Promise<Transfer> {
    // Insérer le transfert d'abord pour obtenir l'ID et createdAt
    const result = await db.insert(transfers).values(insertTransfer).returning();
    const transfer = result[0];
    
    // Générer et persister la référence professionnelle
    const { getTransferReferenceNumber } = await import('@shared/schema');
    const transferReference = getTransferReferenceNumber(transfer);
    
    // Mettre à jour le transfert avec la référence
    const updated = await db
      .update(transfers)
      .set({ transferReference })
      .where(eq(transfers.id, transfer.id))
      .returning();
    
    return updated[0];
  }

  async updateTransfer(id: string, updates: Partial<Transfer>): Promise<Transfer | undefined> {
    const result = await db.update(transfers).set({ ...updates, updatedAt: new Date() }).where(eq(transfers.id, id)).returning();
    return result[0];
  }

  async getUserFees(userId: string): Promise<Fee[]> {
    return await db.select().from(fees).where(eq(fees.userId, userId));
  }

  async createFee(insertFee: InsertFee): Promise<Fee> {
    const result = await db.insert(fees).values(insertFee).returning();
    return result[0];
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(insertTransaction).returning();
    return result[0];
  }

  async getDashboardData(userId: string) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const userLoans = await this.getUserLoans(userId);
    const userTransfers = await this.getUserTransfers(userId);
    const userFees = await this.getUserFees(userId);
    const userTransactions = await this.getUserTransactions(userId);

    // Terminal statuses: rejected, cancelled, completed, closed, repaid, defaulted, written_off
    const terminalStatuses = ['rejected', 'cancelled', 'completed', 'closed', 'repaid', 'defaulted', 'written_off'];
    const nonTerminalLoans = userLoans.filter(loan => !terminalStatuses.includes(loan.status));
    
    // Total emprunté: sum of ALL non-terminal loans (pending_review, approved, signed, active, etc.)
    const totalBorrowed = nonTerminalLoans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0);
    
    // SOLDE TOTAL (Balance): ONLY include loans where funds have been released by admin
    // Funds are released when status is 'active' OR fundsAvailabilityStatus is 'available'
    const activeLoans = nonTerminalLoans.filter(loan => 
      loan.status === 'active' || loan.fundsAvailabilityStatus === 'available'
    );
    const activeLoanAmount = activeLoans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0);
    const totalRepaid = activeLoans.reduce((sum, loan) => sum + parseFloat(loan.totalRepaid), 0);
    
    const completedTransfers = userTransfers
      .filter(transfer => transfer.status === 'completed')
      .reduce((sum, transfer) => sum + parseFloat(transfer.amount), 0);
    
    // Balance is only from ACTIVE loans (funds released) minus repayments and transfers
    const balance = activeLoanAmount - totalRepaid - completedTransfers;

    return {
      user,
      balance,
      loans: userLoans,
      transfers: userTransfers,
      fees: userFees,
      transactions: userTransactions,
    };
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllTransfers(): Promise<Transfer[]> {
    return await db.select().from(transfers).orderBy(desc(transfers.createdAt));
  }

  async getAllLoans(): Promise<Loan[]> {
    return await db.select().from(loans).where(isNull(loans.deletedAt));
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getAdminSettings(): Promise<AdminSetting[]> {
    return await db.select().from(adminSettings);
  }

  async getAdminSetting(key: string): Promise<AdminSetting | undefined> {
    const result = await db.select().from(adminSettings).where(eq(adminSettings.settingKey, key));
    return result[0];
  }

  async updateAdminSetting(key: string, value: any, updatedBy: string): Promise<AdminSetting> {
    const existing = await this.getAdminSetting(key);
    
    if (existing) {
      const result = await db.update(adminSettings)
        .set({ settingValue: value, updatedAt: new Date(), updatedBy })
        .where(eq(adminSettings.settingKey, key))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(adminSettings)
        .values({ settingKey: key, settingValue: value, updatedBy })
        .returning();
      return result[0];
    }
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const result = await db.insert(auditLogs).values(insertLog).returning();
    return result[0];
  }

  async getActivityStats() {
    const allUsers = await db.select().from(users);
    const allTransfers = await db.select().from(transfers);
    const allLoans = await db.select().from(loans);

    return {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => u.status === 'active').length,
      totalTransfers: allTransfers.length,
      pendingTransfers: allTransfers.filter(t => t.status === 'pending' || t.status === 'in-progress').length,
      totalLoans: allLoans.length,
      activeLoans: allLoans.filter(l => l.status === 'active').length,
    };
  }

  async getUserExternalAccounts(userId: string): Promise<ExternalAccount[]> {
    return await db.select().from(externalAccounts).where(eq(externalAccounts.userId, userId));
  }

  async getExternalAccount(id: string): Promise<ExternalAccount | undefined> {
    const result = await db.select().from(externalAccounts).where(eq(externalAccounts.id, id));
    return result[0];
  }

  async createExternalAccount(insertAccount: InsertExternalAccount): Promise<ExternalAccount> {
    const result = await db.insert(externalAccounts).values(insertAccount).returning();
    return result[0];
  }

  async deleteExternalAccount(id: string): Promise<boolean> {
    const result = await db.delete(externalAccounts).where(eq(externalAccounts.id, id)).returning();
    return result.length > 0;
  }

  async createValidationCode(insertCode: InsertTransferValidationCode): Promise<TransferValidationCode> {
    const result = await db.insert(transferValidationCodes).values(insertCode).returning();
    return result[0];
  }

  async getTransferValidationCodes(transferId: string): Promise<TransferValidationCode[]> {
    return await db.select().from(transferValidationCodes).where(eq(transferValidationCodes.transferId, transferId));
  }

  async validateCode(transferId: string, code: string, sequence: number, codeType: string = 'initial'): Promise<TransferValidationCode | undefined> {
    return await db.transaction(async (tx) => {
      const result = await tx.select()
        .from(transferValidationCodes)
        .where(
          eq(transferValidationCodes.transferId, transferId)
        );
      
      const validationCode = result.find(
        (vc) => vc.code === code && vc.sequence === sequence && vc.codeType === codeType && !vc.consumedAt
      );
      
      if (!validationCode) {
        return undefined;
      }
      
      const updated = await tx.update(transferValidationCodes)
        .set({ consumedAt: new Date() })
        .where(
          and(
            eq(transferValidationCodes.id, validationCode.id),
            isNull(transferValidationCodes.consumedAt)
          )
        )
        .returning();
      
      if (updated.length === 0) {
        return undefined;
      }
      
      if (validationCode.feeId) {
        await tx.update(fees)
          .set({ isPaid: true, paidAt: new Date() })
          .where(eq(fees.id, validationCode.feeId));
      }
      
      return updated[0];
    });
  }

  async validateTransferCode(transferId: string, code: string, sequence: number): Promise<TransferValidationCode | undefined> {
    return await db.transaction(async (tx) => {
      const result = await tx.select()
        .from(transferValidationCodes)
        .where(eq(transferValidationCodes.transferId, transferId));
      
      const validationCode = result.find(
        (vc) => vc.code === code && vc.sequence === sequence && !vc.consumedAt
      );
      
      if (!validationCode) {
        return undefined;
      }
      
      const updated = await tx.update(transferValidationCodes)
        .set({ consumedAt: new Date() })
        .where(
          and(
            eq(transferValidationCodes.id, validationCode.id),
            isNull(transferValidationCodes.consumedAt)
          )
        )
        .returning();
      
      if (updated.length === 0) {
        return undefined;
      }
      
      return updated[0];
    });
  }

  async validateTransferCodeAtomic(transferId: string, codeValue: string, sequence: number): Promise<ValidateTransferCodeAtomicResult> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Lock the transfer row with FOR UPDATE to prevent race conditions
      const transferResult = await client.query(
        `SELECT * FROM transfers WHERE id = $1 FOR UPDATE`,
        [transferId]
      );
      
      if (transferResult.rows.length === 0) {
        await client.query('ROLLBACK');
        throw new ValidationError('Transfer not found', 'NOT_FOUND');
      }
      
      const transfer = transferResult.rows[0];
      
      // Check expected sequence
      const expectedSequence = (transfer.codes_validated || 0) + 1;
      if (sequence !== expectedSequence) {
        await client.query('ROLLBACK');
        throw new ValidationError(
          `Vous devez valider le code #${expectedSequence} avant de valider le code #${sequence}.`,
          'INVALID_SEQUENCE'
        );
      }
      
      // Lock and find the validation code with FOR UPDATE
      const codeResult = await client.query(
        `SELECT * FROM transfer_validation_codes 
         WHERE transfer_id = $1 AND code = $2 AND sequence = $3 
         FOR UPDATE`,
        [transferId, codeValue, sequence]
      );
      
      if (codeResult.rows.length === 0) {
        await client.query('ROLLBACK');
        throw new ValidationError('Code de sécurité incorrect', 'INVALID_CODE');
      }
      
      const validationCode = codeResult.rows[0];
      
      // Check if already consumed
      if (validationCode.consumed_at) {
        await client.query('ROLLBACK');
        throw new ValidationError('Ce code a déjà été utilisé', 'ALREADY_CONSUMED');
      }
      
      // Check expiration
      if (new Date(validationCode.expires_at) < new Date()) {
        await client.query('ROLLBACK');
        throw new ValidationError('Ce code a expiré', 'EXPIRED');
      }
      
      // Mark code as consumed
      const consumedCodeResult = await client.query(
        `UPDATE transfer_validation_codes 
         SET consumed_at = now() 
         WHERE id = $1 AND consumed_at IS NULL 
         RETURNING *`,
        [validationCode.id]
      );
      
      if (consumedCodeResult.rows.length === 0) {
        // Race condition: another request consumed the code
        await client.query('ROLLBACK');
        throw new ValidationError('Ce code a déjà été utilisé', 'ALREADY_CONSUMED');
      }
      
      const consumedCode = consumedCodeResult.rows[0];
      
      // Pay associated fee if any
      if (validationCode.fee_id) {
        await client.query(
          `UPDATE fees SET is_paid = true, paid_at = now() WHERE id = $1`,
          [validationCode.fee_id]
        );
      }
      
      // Calculate new state
      const newCodesValidated = (transfer.codes_validated || 0) + 1;
      const requiredCodes = transfer.required_codes || 1;
      const isComplete = newCodesValidated >= requiredCodes;
      
      let newProgress: number;
      let newStatus: string;
      let newIsPaused: boolean;
      let newPausePercent: number | null = null;
      let nextSequence: number | null = null;
      let codeContext: string | null = consumedCode.code_context || null;
      
      if (isComplete) {
        newProgress = 100;
        newStatus = 'completed';
        newIsPaused = false;
        newPausePercent = null;
        nextSequence = null;
      } else {
        // Get next code info
        const nextCodeResult = await client.query(
          `SELECT * FROM transfer_validation_codes 
           WHERE transfer_id = $1 AND sequence = $2 AND consumed_at IS NULL`,
          [transferId, newCodesValidated + 1]
        );
        
        nextSequence = newCodesValidated + 1;
        
        if (nextCodeResult.rows.length > 0 && nextCodeResult.rows[0].pause_percent) {
          const nextCode = nextCodeResult.rows[0];
          newProgress = nextCode.pause_percent;
          newPausePercent = nextCode.pause_percent;
          newIsPaused = true;
          newStatus = 'in_progress';
          codeContext = nextCode.code_context || codeContext;
        } else {
          // Calculate progress based on current validation
          const currentCodePercent = consumedCode.pause_percent || 
            Math.min(10 + (newCodesValidated * Math.floor(80 / requiredCodes)), 90);
          newProgress = currentCodePercent;
          newIsPaused = false;
          newStatus = 'pending';
        }
      }
      
      // Update the transfer atomically
      const updatedTransferResult = await client.query(
        `UPDATE transfers SET 
          codes_validated = $2,
          progress_percent = $3,
          status = $4,
          current_step = $5,
          is_paused = $6,
          pause_percent = $7,
          approved_at = CASE WHEN $8 THEN now() ELSE approved_at END,
          completed_at = CASE WHEN $8 THEN now() ELSE completed_at END,
          updated_at = now()
        WHERE id = $1
        RETURNING *`,
        [
          transferId,
          newCodesValidated,
          newProgress,
          newStatus,
          Math.min(newCodesValidated, requiredCodes),
          newIsPaused,
          newPausePercent,
          isComplete
        ]
      );
      
      const updatedTransfer = updatedTransferResult.rows[0];
      
      await client.query('COMMIT');
      
      // Map snake_case to camelCase for the result
      const mappedTransfer: Transfer = {
        id: updatedTransfer.id,
        userId: updatedTransfer.user_id,
        loanId: updatedTransfer.loan_id,
        externalAccountId: updatedTransfer.external_account_id,
        transferReference: updatedTransfer.transfer_reference,
        amount: updatedTransfer.amount,
        recipient: updatedTransfer.recipient,
        status: updatedTransfer.status,
        currentStep: updatedTransfer.current_step,
        progressPercent: updatedTransfer.progress_percent,
        feeAmount: updatedTransfer.fee_amount,
        requiredCodes: updatedTransfer.required_codes,
        codesValidated: updatedTransfer.codes_validated,
        isPaused: updatedTransfer.is_paused,
        pausePercent: updatedTransfer.pause_percent,
        pauseCodesValidated: updatedTransfer.pause_codes_validated,
        approvedAt: updatedTransfer.approved_at,
        suspendedAt: updatedTransfer.suspended_at,
        completedAt: updatedTransfer.completed_at,
        createdAt: updatedTransfer.created_at,
        updatedAt: updatedTransfer.updated_at,
      };
      
      const mappedCode: TransferValidationCode = {
        id: consumedCode.id,
        transferId: consumedCode.transfer_id,
        loanId: consumedCode.loan_id,
        code: consumedCode.code,
        deliveryMethod: consumedCode.delivery_method,
        codeType: consumedCode.code_type,
        codeContext: consumedCode.code_context,
        sequence: consumedCode.sequence,
        pausePercent: consumedCode.pause_percent,
        feeId: consumedCode.fee_id,
        issuedAt: consumedCode.issued_at,
        expiresAt: consumedCode.expires_at,
        consumedAt: consumedCode.consumed_at,
      };
      
      return {
        codeId: consumedCode.id,
        progress: newProgress,
        isPaused: newIsPaused,
        pausePercent: newPausePercent,
        nextSequence,
        codeContext,
        codesValidated: newCodesValidated,
        isComplete,
        transfer: mappedTransfer,
        validatedCode: mappedCode,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async validateLoanCode(loanId: string, code: string, sequence: number): Promise<TransferValidationCode | undefined> {
    console.warn('[DEPRECATED] validateLoanCode is deprecated. Use validateTransferCode instead.');
    return undefined;
  }

  async createTransferEvent(insertEvent: InsertTransferEvent): Promise<TransferEvent> {
    const result = await db.insert(transferEvents).values(insertEvent).returning();
    return result[0];
  }

  async getTransferEvents(transferId: string): Promise<TransferEvent[]> {
    return await db.select().from(transferEvents).where(eq(transferEvents.transferId, transferId));
  }

  async getUserMessages(userId: string): Promise<AdminMessage[]> {
    return await db.select().from(adminMessages).where(eq(adminMessages.userId, userId)).orderBy(desc(adminMessages.deliveredAt));
  }

  async getMessage(id: string): Promise<AdminMessage | undefined> {
    const result = await db.select().from(adminMessages).where(eq(adminMessages.id, id)).limit(1);
    return result[0];
  }

  async createAdminMessage(insertMessage: InsertAdminMessage): Promise<AdminMessage> {
    const result = await db.insert(adminMessages).values(insertMessage).returning();
    return result[0];
  }

  async markMessageAsRead(id: string): Promise<AdminMessage | undefined> {
    const result = await db.update(adminMessages)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(adminMessages.id, id))
      .returning();
    return result[0];
  }

  async approveLoan(id: string, approvedBy: string): Promise<Loan | undefined> {
    const result = await db.update(loans)
      .set({ 
        status: "approved", 
        approvedAt: new Date(), 
        approvedBy 
      })
      .where(eq(loans.id, id))
      .returning();
    return result[0];
  }

  async rejectLoan(id: string, rejectedBy: string, reason: string): Promise<Loan | undefined> {
    const result = await db.update(loans)
      .set({ 
        status: "rejected", 
        rejectedAt: new Date(), 
        approvedBy: rejectedBy,
        rejectionReason: reason 
      })
      .where(eq(loans.id, id))
      .returning();
    return result[0];
  }

  async deleteLoan(id: string, deletedBy: string, reason: string): Promise<boolean> {
    const result = await db.update(loans)
      .set({ 
        deletedAt: new Date(), 
        deletedBy,
        deletionReason: reason 
      })
      .where(eq(loans.id, id))
      .returning();
    return result.length > 0;
  }

  async markLoanFundsAvailable(loanId: string, adminId: string): Promise<{ loan: Loan; codes: TransferValidationCode[] } | undefined> {
    return await db.transaction(async (tx) => {
      const existingLoans = await tx
        .select()
        .from(loans)
        .where(eq(loans.id, loanId))
        .for('update');
      
      const existingLoan = existingLoans[0];
      if (!existingLoan) {
        throw new Error('Prêt non trouvé');
      }
      
      if (existingLoan.fundsAvailabilityStatus === 'available') {
        throw new Error('Les fonds sont déjà marqués comme disponibles pour ce prêt');
      }
      
      const loanResult = await tx.update(loans)
        .set({ 
          contractStatus: "signed",
          fundsAvailabilityStatus: "available",
          status: "active"
        })
        .where(eq(loans.id, loanId))
        .returning();
      
      const loan = loanResult[0];
      if (!loan) {
        return undefined;
      }
      
      await tx.insert(transactions).values({
        userId: loan.userId,
        type: 'credit',
        amount: loan.amount,
        description: `Décaissement du prêt #${loan.id.slice(0, 8)}`,
      });
      
      await tx.insert(notifications).values({
        userId: loan.userId,
        type: 'loan_funds_available',
        title: 'Fonds disponibles',
        message: `Vos fonds de ${parseFloat(loan.amount).toFixed(2)} EUR sont désormais disponibles. Vous pouvez initier votre transfert.`,
        severity: 'success',
        metadata: { loanId: loan.id, amount: loan.amount },
      });
      
      await tx.insert(auditLogs).values({
        actorId: adminId,
        actorRole: 'admin',
        action: 'mark_loan_funds_available',
        entityType: 'loan',
        entityId: loan.id,
        metadata: { 
          loanAmount: loan.amount, 
          userId: loan.userId,
          loanId: loan.id 
        },
      });
      
      // Check if pre-generated codes already exist for this loan
      const existingCodes = await tx
        .select()
        .from(transferValidationCodes)
        .where(
          and(
            eq(transferValidationCodes.loanId, loan.id),
            isNull(transferValidationCodes.transferId)
          )
        )
        .orderBy(transferValidationCodes.sequence);

      let codes: TransferValidationCode[] = [];
      const now = new Date();
      const requiredCount = 6;

      // Validate existing batch: must be complete (count = 6) and all non-expired
      const isValidBatch = existingCodes.length === requiredCount && 
                          existingCodes.every(c => new Date(c.expiresAt) > now);

      if (existingCodes.length > 0 && isValidBatch) {
        // Codes already generated and valid - return existing ones (idempotent)
        console.log(`Reusing ${existingCodes.length} valid existing pre-generated codes for loan ${loan.id}`);
        codes = existingCodes;
      } else {
        // Clean up invalid/incomplete/expired batch if exists
        if (existingCodes.length > 0) {
          console.warn(`Found ${existingCodes.length} pre-generated codes but batch is invalid (expected ${requiredCount}, has expired: ${existingCodes.some(c => new Date(c.expiresAt) <= now)}). Regenerating...`);
          
          await tx
            .delete(transferValidationCodes)
            .where(
              and(
                eq(transferValidationCodes.loanId, loan.id),
                isNull(transferValidationCodes.transferId)
              )
            );
        }
        // Generate transfer validation codes for admin (pre-generated, not yet linked to a transfer)
        const codesCount = 6;
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 100); // No practical expiration (100 years)
        
        const randomPercentages = this.generateRandomPausePercentages(codesCount);
        
        const codeContexts = [
          'regulatory_compliance',
          'transfer_authorization',
          'security_verification',
          'funds_release',
          'final_validation',
          'insurance_fee'
        ];
        
        console.log(`Generating ${codesCount} new validation codes for loan ${loan.id}`);
        
        for (let i = 1; i <= codesCount; i++) {
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          
          const result = await tx.insert(transferValidationCodes)
            .values({
              transferId: null, // Pre-generated, not yet linked to a transfer
              loanId: loan.id,
              code,
              deliveryMethod: 'admin_only',
              codeType: 'initial',
              codeContext: codeContexts[i - 1] || `Code de validation ${i}`,
              sequence: i,
              pausePercent: randomPercentages[i - 1],
              expiresAt,
            })
            .returning();
          
          if (result[0]) {
            codes.push(result[0]);
          }
        }
      }
      
      return { loan, codes };
    });
  }

  async createTransferWithCodes(
    insertTransfer: InsertTransfer,
    codesCount: number = 6
  ): Promise<{ transfer: Transfer; codes: TransferValidationCode[] }> {
    // Retry logic en cas de conflit de référence unique
    const maxRetries = 5;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await db.transaction(async (tx) => {
          if (!insertTransfer.loanId) {
            throw new Error('loanId is required for transfer creation');
          }

          const existingActiveTransfers = await tx
            .select()
            .from(transfers)
            .where(
              and(
                eq(transfers.loanId, insertTransfer.loanId),
                or(
                  eq(transfers.status, 'pending'),
                  eq(transfers.status, 'in_progress')
                )
              )
            )
            .for('update');

          if (existingActiveTransfers.length > 0) {
            const existingTransfer = existingActiveTransfers[0];
            const error = new Error('Un transfert est déjà en cours pour ce prêt') as any;
            error.existingTransferId = existingTransfer.id;
            throw error;
          }

          const transferResult = await tx.insert(transfers).values(insertTransfer).returning();
          let transfer = transferResult[0];

          // Générer et persister la référence professionnelle
          const { getTransferReferenceNumber } = await import('@shared/schema');
          const transferReference = getTransferReferenceNumber(transfer);
          
          // Mettre à jour le transfert avec la référence
          const updatedTransfer = await tx
            .update(transfers)
            .set({ transferReference })
            .where(eq(transfers.id, transfer.id))
            .returning();
          
          transfer = updatedTransfer[0];

      // Check if pre-generated codes exist for this loan (from markLoanFundsAvailable)
      const preGeneratedCodes = await tx
        .select()
        .from(transferValidationCodes)
        .where(
          and(
            eq(transferValidationCodes.loanId, insertTransfer.loanId),
            isNull(transferValidationCodes.transferId)
          )
        )
        .orderBy(transferValidationCodes.sequence);

      let codes: TransferValidationCode[] = [];
      const requiredCodesCount = codesCount;
      const now = new Date();

      // Validate pre-generated batch: must be complete and non-expired
      const isValidBatch = preGeneratedCodes.length === requiredCodesCount && 
                          preGeneratedCodes.every(c => new Date(c.expiresAt) > now);

      if (preGeneratedCodes.length > 0 && isValidBatch) {
        // Reuse pre-generated codes by linking them to this transfer
        console.log(`Reusing ${preGeneratedCodes.length} valid pre-generated codes for loan ${insertTransfer.loanId}`);
        
        for (const preCode of preGeneratedCodes) {
          const updated = await tx
            .update(transferValidationCodes)
            .set({ transferId: transfer.id })
            .where(eq(transferValidationCodes.id, preCode.id))
            .returning();
          
          if (updated[0]) {
            codes.push(updated[0]);
          }
        }
      } else {
        if (preGeneratedCodes.length > 0 && !isValidBatch) {
          console.warn(`Found ${preGeneratedCodes.length} pre-generated codes but batch is invalid (expected ${requiredCodesCount}, expired: ${preGeneratedCodes.some(c => new Date(c.expiresAt) <= now)}). Regenerating...`);
          
          // Clean up invalid batch
          await tx
            .delete(transferValidationCodes)
            .where(
              and(
                eq(transferValidationCodes.loanId, insertTransfer.loanId),
                isNull(transferValidationCodes.transferId)
              )
            );
        }
        // Generate new codes (fallback for older loans or edge cases)
        console.log(`Generating ${codesCount} new codes for transfer ${transfer.id}`);
        
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 100); // No practical expiration (100 years)
        
        const randomPercentages = this.generateRandomPausePercentages(codesCount);
        
        const codeContexts = [
          'regulatory_compliance',
          'transfer_authorization',
          'security_verification',
          'funds_release',
          'final_validation',
          'insurance_fee'
        ];
        
        for (let i = 1; i <= codesCount; i++) {
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          
          const result = await tx.insert(transferValidationCodes)
            .values({
              transferId: transfer.id,
              loanId: insertTransfer.loanId,
              code,
              deliveryMethod: 'admin_only',
              codeType: 'initial',
              codeContext: codeContexts[i - 1] || `Code de validation ${i}`,
              sequence: i,
              pausePercent: randomPercentages[i - 1],
              expiresAt,
            })
            .returning();
          
          if (result[0]) {
            codes.push(result[0]);
          }
        }
      }
      
          return { transfer, codes };
        });
      } catch (error: any) {
        // Si c'est une erreur de contrainte UNIQUE (23505) et qu'il reste des tentatives
        if (error?.code === '23505' && attempt < maxRetries - 1) {
          // Attendre un court délai aléatoire avant de réessayer (5-25ms)
          await new Promise(resolve => setTimeout(resolve, 5 + Math.random() * 20));
          continue;
        }
        // Sinon, relancer l'erreur
        throw error;
      }
    }
    throw new Error('Impossible de créer le transfert avec codes après plusieurs tentatives');
  }

  async generateTransferCodes(transferId: string, loanId: string, userId: string, count: number = 5): Promise<TransferValidationCode[]> {
    throw new Error('[DEPRECATED] generateTransferCodes is deprecated and disabled. Use createTransferWithCodes for atomic transfer creation with codes.');
  }

  async generateLoanTransferCodes(loanId: string, userId: string, count: number = 5): Promise<TransferValidationCode[]> {
    throw new Error('[DEPRECATED] generateLoanTransferCodes is deprecated and disabled. Validation codes must be generated per-transfer using createTransferWithCodes.');
  }

  private generateRandomPausePercentages(count: number): number[] {
    const percentages: number[] = [];
    const minGap = 10;
    const maxGap = 25;
    
    let currentPercent = Math.floor(Math.random() * 15) + 8;
    
    for (let i = 0; i < count; i++) {
      percentages.push(currentPercent);
      
      if (i < count - 1) {
        const remainingSpace = 100 - currentPercent;
        const remainingCodes = count - i - 1;
        const maxPossibleGap = Math.min(maxGap, remainingSpace - (remainingCodes * minGap));
        const gap = Math.floor(Math.random() * (maxPossibleGap - minGap + 1)) + minGap;
        currentPercent = Math.min(currentPercent + gap, 100);
      }
    }
    
    percentages[count - 1] = Math.min(percentages[count - 1], 95);
    
    return percentages;
  }

  async getTransferCodes(transferId: string): Promise<TransferValidationCode[]> {
    return await db.select()
      .from(transferValidationCodes)
      .where(eq(transferValidationCodes.transferId, transferId))
      .orderBy(transferValidationCodes.sequence);
  }

  async getLoanTransferCodes(loanId: string): Promise<TransferValidationCode[]> {
    // First, try to find the active transfer for this loan
    const activeTransfer = await db.select()
      .from(transfers)
      .where(
        and(
          eq(transfers.loanId, loanId),
          or(
            eq(transfers.status, 'pending'),
            eq(transfers.status, 'in_progress')
          )
        )
      )
      .limit(1);
    
    if (activeTransfer.length > 0) {
      // Return codes for the active transfer
      return await db.select()
        .from(transferValidationCodes)
        .where(eq(transferValidationCodes.transferId, activeTransfer[0].id))
        .orderBy(transferValidationCodes.sequence);
    }
    
    // Fallback: return pre-generated codes (not yet linked to a transfer)
    return await db.select()
      .from(transferValidationCodes)
      .where(
        and(
          eq(transferValidationCodes.loanId, loanId),
          isNull(transferValidationCodes.transferId),
          isNull(transferValidationCodes.consumedAt)
        )
      )
      .orderBy(transferValidationCodes.sequence);
  }

  async getLoanTransferCodeBySequence(loanId: string, sequence: number): Promise<TransferValidationCode | undefined> {
    throw new Error('[DEPRECATED] getLoanTransferCodeBySequence is deprecated and disabled. Validation codes are per-transfer and must be accessed via transferId, not loanId.');
  }

  async updateUserBorrowingCapacity(userId: string, maxAmount: string): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ maxLoanAmount: maxAmount, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async suspendUser(userId: string, until: Date, reason: string): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ 
        status: "suspended", 
        suspendedUntil: until, 
        suspensionReason: reason,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async blockUser(userId: string, reason: string): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ 
        status: "blocked", 
        suspendedUntil: null,
        suspensionReason: reason,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async unblockUser(userId: string): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ 
        status: "active", 
        suspendedUntil: null,
        suspensionReason: null,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async blockExternalTransfers(userId: string, reason: string): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ 
        externalTransfersBlocked: true,
        transferBlockReason: reason,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async unblockExternalTransfers(userId: string): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ 
        externalTransfersBlocked: false,
        transferBlockReason: null,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async issueTransferValidationCode(transferId: string, sequence: number): Promise<TransferValidationCode> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
    
    const result = await db.insert(transferValidationCodes)
      .values({
        transferId,
        code,
        deliveryMethod: "email",
        sequence,
        expiresAt,
      })
      .returning();
    return result[0];
  }

  async issueCodeWithNotificationAndFee(params: {
    transferId: string;
    userId: string;
    sequence: number;
    expiresAt: Date;
    deliveryMethod: string;
    subject: string;
    content: string;
    feeType: string;
    feeAmount: string;
    feeReason: string;
  }): Promise<{ code: TransferValidationCode; notification: AdminMessage; fee: Fee }> {
    return await db.transaction(async (tx) => {
      const codeValue = Math.floor(100000 + Math.random() * 900000).toString();
      const messageId = randomUUID();
      
      const feeResult = await tx.insert(fees)
        .values({
          userId: params.userId,
          feeType: params.feeType,
          reason: params.feeReason,
          amount: params.feeAmount,
          isPaid: false,
          relatedMessageId: messageId,
        })
        .returning();
      const fee = feeResult[0];
      
      const codeResult = await tx.insert(transferValidationCodes)
        .values({
          transferId: params.transferId,
          code: codeValue,
          deliveryMethod: params.deliveryMethod,
          sequence: params.sequence,
          expiresAt: params.expiresAt,
          feeId: fee.id,
        })
        .returning();
      const code = codeResult[0];
      
      const notificationContent = params.content.replace('{CODE}', codeValue);
      
      const messageResult = await tx.insert(adminMessages)
        .values({
          id: messageId,
          userId: params.userId,
          transferId: params.transferId,
          subject: params.subject,
          content: notificationContent,
          severity: "info",
          isRead: false,
        })
        .returning();
      const notification = messageResult[0];
      
      return { code, notification, fee };
    });
  }

  async sendNotificationWithFee(
    userId: string, 
    subject: string, 
    content: string, 
    feeType: string, 
    feeAmount: string, 
    feeReason: string
  ): Promise<{ message: AdminMessage; fee: Fee }> {
    const messageId = randomUUID();
    
    const feeResult = await db.insert(fees)
      .values({
        userId,
        feeType,
        reason: feeReason,
        amount: feeAmount,
        isPaid: false,
        relatedMessageId: messageId,
      })
      .returning();
    const fee = feeResult[0];
    
    const messageResult = await db.insert(adminMessages)
      .values({
        id: messageId,
        userId,
        subject,
        content,
        severity: "warning",
        isRead: false,
      })
      .returning();
    const message = messageResult[0];
    
    return { message, fee };
  }

  async getUnpaidFees(userId: string): Promise<Fee[]> {
    return await db.select()
      .from(fees)
      .where(and(eq(fees.userId, userId), eq(fees.isPaid, false)));
  }

  async markFeeAsPaid(feeId: string): Promise<Fee | undefined> {
    const result = await db.update(fees)
      .set({ isPaid: true, paidAt: new Date() })
      .where(eq(fees.id, feeId))
      .returning();
    return result[0];
  }

  async getUserKycDocuments(userId: string): Promise<KycDocument[]> {
    return await db.select()
      .from(kycDocuments)
      .where(eq(kycDocuments.userId, userId))
      .orderBy(desc(kycDocuments.uploadedAt));
  }

  async getKycDocument(id: string): Promise<KycDocument | undefined> {
    const result = await db.select()
      .from(kycDocuments)
      .where(eq(kycDocuments.id, id));
    return result[0];
  }

  async createKycDocument(document: InsertKycDocument): Promise<KycDocument> {
    const result = await db.insert(kycDocuments)
      .values(document)
      .returning();
    return result[0];
  }

  async updateKycDocumentStatus(id: string, status: string): Promise<KycDocument | undefined> {
    const result = await db.update(kycDocuments)
      .set({ status })
      .where(eq(kycDocuments.id, id))
      .returning();
    return result[0];
  }

  async getAllKycDocuments(): Promise<Array<KycDocument & { user: { id: string; fullName: string; email: string } }>> {
    const result = await db.select({
      id: kycDocuments.id,
      userId: kycDocuments.userId,
      loanId: kycDocuments.loanId,
      documentType: kycDocuments.documentType,
      loanType: kycDocuments.loanType,
      status: kycDocuments.status,
      fileUrl: kycDocuments.fileUrl,
      fileName: kycDocuments.fileName,
      fileSize: kycDocuments.fileSize,
      uploadedAt: kycDocuments.uploadedAt,
      reviewedAt: kycDocuments.reviewedAt,
      reviewerId: kycDocuments.reviewerId,
      reviewNotes: kycDocuments.reviewNotes,
      user: {
        id: users.id,
        fullName: users.fullName,
        email: users.email,
      }
    })
    .from(kycDocuments)
    .leftJoin(users, eq(kycDocuments.userId, users.id))
    .orderBy(desc(kycDocuments.uploadedAt));
    
    return result as Array<KycDocument & { user: { id: string; fullName: string; email: string } }>;
  }

  async approveKycDocument(id: string, reviewerId: string, notes?: string): Promise<KycDocument | undefined> {
    const result = await db.update(kycDocuments)
      .set({ 
        status: 'approved',
        reviewedAt: new Date(),
        reviewerId,
        reviewNotes: notes || null
      })
      .where(eq(kycDocuments.id, id))
      .returning();
    
    if (result[0]) {
      await db.update(users)
        .set({ 
          kycStatus: 'verified',
          updatedAt: new Date()
        })
        .where(eq(users.id, result[0].userId));
    }
    
    return result[0];
  }

  async rejectKycDocument(id: string, reviewerId: string, notes: string): Promise<KycDocument | undefined> {
    const result = await db.update(kycDocuments)
      .set({ 
        status: 'rejected',
        reviewedAt: new Date(),
        reviewerId,
        reviewNotes: notes
      })
      .where(eq(kycDocuments.id, id))
      .returning();
    return result[0];
  }

  async deleteKycDocument(id: string): Promise<boolean> {
    const doc = await this.getKycDocument(id);
    if (!doc) return false;
    
    const filePath = path.join(process.cwd(), 'uploads', 'kyc', path.basename(doc.fileUrl));
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
    
    const result = await db.delete(kycDocuments)
      .where(eq(kycDocuments.id, id))
      .returning();
    return result.length > 0;
  }

  async enable2FA(userId: string, secret: string): Promise<User | undefined> {
    // 🔐 Chiffrer le secret avant stockage
    const encryptedSecret = encryptSecret(secret);
    const result = await db.update(users)
      .set({ 
        twoFactorSecret: encryptedSecret,
        twoFactorEnabled: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async disable2FA(userId: string): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ 
        twoFactorSecret: null,
        twoFactorEnabled: false,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async getNotification(id: string, userId: string): Promise<Notification | undefined> {
    const result = await db.select()
      .from(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
    return result[0];
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications)
      .values(notification)
      .returning();
    return result[0];
  }

  async markNotificationAsRead(id: string, userId: string): Promise<Notification | undefined> {
    const result = await db.update(notifications)
      .set({ 
        isRead: true,
        readAt: new Date()
      })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return result[0];
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    const result = await db.update(notifications)
      .set({ 
        isRead: true,
        readAt: new Date()
      })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .returning();
    return result.length > 0;
  }

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db.select({ count: sqlDrizzle<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result[0]?.count || 0;
  }

  async hasUnreadNotificationByType(userId: string, type: string): Promise<boolean> {
    const result = await db.select({ count: sqlDrizzle<number>`count(*)::int` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.type, type),
        eq(notifications.isRead, false)
      ));
    return (result[0]?.count || 0) > 0;
  }

  async hasNotificationByType(userId: string, type: string): Promise<boolean> {
    const result = await db.select({ count: sqlDrizzle<number>`count(*)::int` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.type, type)
      ));
    return (result[0]?.count || 0) > 0;
  }

  async deleteAllNotificationsByType(userId: string, type: string): Promise<boolean> {
    const result = await db.delete(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.type, type)
      ));
    return true;
  }

  async getAmortizationSchedule(loanId: string): Promise<AmortizationSchedule[]> {
    return await db.select()
      .from(amortizationSchedule)
      .where(eq(amortizationSchedule.loanId, loanId))
      .orderBy(amortizationSchedule.paymentNumber);
  }

  async createAmortizationSchedule(schedule: InsertAmortizationSchedule): Promise<AmortizationSchedule> {
    const result = await db.insert(amortizationSchedule)
      .values(schedule)
      .returning();
    return result[0];
  }

  async generateAmortizationSchedule(loanId: string): Promise<AmortizationSchedule[]> {
    const loan = await this.getLoan(loanId);
    if (!loan) {
      throw new Error('Prêt non trouvé');
    }

    // Vérifier si un calendrier existe déjà
    const existing = await this.getAmortizationSchedule(loanId);
    if (existing.length > 0) {
      return existing;
    }

    const amount = parseFloat(loan.amount);
    const annualRate = parseFloat(loan.interestRate);
    const rate = annualRate / 100 / 12; // Taux mensuel
    const duration = loan.duration; // en mois

    let monthlyPayment: number;
    
    // Gérer le cas des prêts à 0% d'intérêt (promotionnels)
    if (annualRate === 0 || rate === 0) {
      // Prêt sans intérêt: remboursement linéaire
      monthlyPayment = amount / duration;
    } else {
      // Calcul de la mensualité avec intérêt (formule standard d'amortissement)
      monthlyPayment = amount * (rate * Math.pow(1 + rate, duration)) / (Math.pow(1 + rate, duration) - 1);
    }

    let remainingBalance = amount;
    const schedules: AmortizationSchedule[] = [];
    const startDate = new Date();

    for (let i = 1; i <= duration; i++) {
      const interestAmount = annualRate === 0 ? 0 : remainingBalance * rate;
      const principalAmount = monthlyPayment - interestAmount;
      remainingBalance -= principalAmount;

      // Date d'échéance
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      const scheduleEntry = await this.createAmortizationSchedule({
        loanId,
        paymentNumber: i,
        dueDate,
        paymentAmount: monthlyPayment.toFixed(2),
        principalAmount: principalAmount.toFixed(2),
        interestAmount: interestAmount.toFixed(2),
        remainingBalance: Math.max(0, remainingBalance).toFixed(2),
        status: 'unpaid',
        paidAt: null,
      });

      schedules.push(scheduleEntry);
    }

    return schedules;
  }

  async getUpcomingPayments(loanId: string, limit: number = 6): Promise<AmortizationSchedule[]> {
    // Vérifier si le calendrier existe, sinon le générer
    let schedule = await this.getAmortizationSchedule(loanId);
    if (schedule.length === 0) {
      schedule = await this.generateAmortizationSchedule(loanId);
    }
    
    // Retourner uniquement les paiements impayés, triés par date d'échéance
    return await db.select()
      .from(amortizationSchedule)
      .where(and(
        eq(amortizationSchedule.loanId, loanId),
        eq(amortizationSchedule.status, 'unpaid')
      ))
      .orderBy(amortizationSchedule.dueDate)
      .limit(limit);
  }

  async markPaymentAsPaid(paymentId: string): Promise<AmortizationSchedule | undefined> {
    const result = await db.update(amortizationSchedule)
      .set({
        status: 'paid',
        paidAt: new Date()
      })
      .where(eq(amortizationSchedule.id, paymentId))
      .returning();
    return result[0];
  }

  // Chat System Implementation
  async getUserConversations(userId: string): Promise<ChatConversation[]> {
    return await db.select()
      .from(chatConversations)
      .where(eq(chatConversations.userId, userId))
      .orderBy(desc(chatConversations.lastMessageAt));
  }

  async getAdminConversations(adminId?: string, status?: string): Promise<ChatConversation[]> {
    const conditions = [];
    
    if (adminId) {
      conditions.push(eq(chatConversations.assignedAdminId, adminId));
    }
    if (status) {
      conditions.push(eq(chatConversations.status, status));
    }
    
    if (conditions.length === 0) {
      return await db.select()
        .from(chatConversations)
        .orderBy(desc(chatConversations.lastMessageAt));
    }
    
    return await db.select()
      .from(chatConversations)
      .where(and(...conditions))
      .orderBy(desc(chatConversations.lastMessageAt));
  }

  async getAdminConversationsForUnread(adminId: string): Promise<ChatConversation[]> {
    // Get all conversations where admin is currently assigned 
    // OR has unread messages (unread ownership persists across reassignments)
    // This prevents loss of unread visibility when conversations are reassigned
    const assignedConversations = await db.select()
      .from(chatConversations)
      .where(eq(chatConversations.assignedAdminId, adminId))
      .orderBy(desc(chatConversations.lastMessageAt));
    
    // Get conversation IDs where admin has unread messages
    const conversationsWithUnreads = await db.selectDistinct({
      id: chatConversations.id
    })
      .from(chatConversations)
      .innerJoin(
        chatMessages,
        eq(chatMessages.conversationId, chatConversations.id)
      )
      .where(
        and(
          eq(chatMessages.isRead, false),
          // Messages not sent by this admin (they are unread FOR the admin)
          sql`${chatMessages.senderId} != ${adminId}`
        )
      );
    
    // Union: assigned conversations + conversations with unreads for this admin
    const unreadConvIds = conversationsWithUnreads.map(c => c.id);
    
    if (unreadConvIds.length === 0) {
      return assignedConversations;
    }
    
    // Get all conversations that are either assigned OR have unreads
    return await db.select()
      .from(chatConversations)
      .where(
        or(
          eq(chatConversations.assignedAdminId, adminId),
          inArray(chatConversations.id, unreadConvIds)
        )
      )
      .orderBy(desc(chatConversations.lastMessageAt));
  }

  async getConversation(id: string): Promise<ChatConversation | undefined> {
    const result = await db.select()
      .from(chatConversations)
      .where(eq(chatConversations.id, id));
    return result[0];
  }

  async createConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const result = await db.insert(chatConversations)
      .values(conversation)
      .returning();
    return result[0];
  }

  async updateConversation(id: string, updates: Partial<ChatConversation>): Promise<ChatConversation | undefined> {
    const result = await db.update(chatConversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatConversations.id, id))
      .returning();
    return result[0];
  }

  async assignConversationToAdmin(conversationId: string, adminId: string): Promise<ChatConversation | undefined> {
    return await this.updateConversation(conversationId, { assignedAdminId: adminId });
  }

  async getConversationMessages(conversationId: string, limit: number = 100): Promise<ChatMessage[]> {
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(chatMessages.createdAt)
      .limit(limit);
  }

  async getChatMessage(messageId: string): Promise<ChatMessage | undefined> {
    const result = await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.id, messageId));
    return result[0];
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const result = await db.insert(chatMessages)
      .values(message)
      .returning();
    
    const createdMessage = result[0];
    
    await this.updateConversation(message.conversationId, {
      lastMessageAt: createdMessage.createdAt
    });
    
    return createdMessage;
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<number> {
    const result = await db.update(chatMessages)
      .set({ isRead: true, readAt: new Date() })
      .where(and(
        eq(chatMessages.conversationId, conversationId),
        eq(chatMessages.isRead, false),
        sqlDrizzle`${chatMessages.senderId} != ${userId}`
      ))
      .returning();
    return result.length;
  }

  async getUnreadMessageCount(conversationId: string, userId: string): Promise<number> {
    const result = await db.select()
      .from(chatMessages)
      .where(and(
        eq(chatMessages.conversationId, conversationId),
        eq(chatMessages.isRead, false),
        sqlDrizzle`${chatMessages.senderId} != ${userId}`
      ));
    return result.length;
  }

  async getUserPresence(userId: string): Promise<ChatPresence | undefined> {
    const result = await db.select()
      .from(chatPresence)
      .where(eq(chatPresence.userId, userId));
    return result[0];
  }

  async updateUserPresence(userId: string, status: string): Promise<ChatPresence> {
    const existingPresence = await this.getUserPresence(userId);
    
    if (existingPresence) {
      const result = await db.update(chatPresence)
        .set({ status, lastSeen: new Date(), updatedAt: new Date() })
        .where(eq(chatPresence.userId, userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(chatPresence)
        .values({ userId, status, lastSeen: new Date() })
        .returning();
      return result[0];
    }
  }

  async getOnlineUsers(): Promise<ChatPresence[]> {
    return await db.select()
      .from(chatPresence)
      .where(eq(chatPresence.status, 'online'));
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      // Delete all messages in the conversation first
      await db.delete(chatMessages)
        .where(eq(chatMessages.conversationId, conversationId));
      
      // Delete the conversation
      const result = await db.delete(chatConversations)
        .where(eq(chatConversations.id, conversationId))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('[STORAGE] Error deleting conversation:', error);
      throw error;
    }
  }

  async resetDashboardStatistics(): Promise<{
    deletedTransfers: number;
    deletedLoans: number;
    deletedUsers: number;
  }> {
    try {
      // Delete all transfer-related data first (due to foreign key constraints)
      await db.delete(transferEvents);
      await db.delete(transferValidationCodes);
      const deletedTransfersResult = await db.delete(transfers).returning();
      
      // Delete all loan-related data
      await db.delete(amortizationSchedule);
      const deletedLoansResult = await db.delete(loans).returning();
      
      // Delete all fees
      await db.delete(fees);
      
      // Delete all admin messages and notifications
      await db.delete(adminMessages);
      await db.delete(notifications);
      
      // Delete all chat data
      await db.delete(chatMessages);
      await db.delete(chatConversations);
      await db.delete(chatPresence);
      
      // Delete all external accounts
      await db.delete(externalAccounts);
      
      // Delete all KYC documents
      await db.delete(kycDocuments);
      
      // Delete all transactions
      await db.delete(transactions);
      
      // Delete all non-admin users
      const deletedUsersResult = await db.delete(users)
        .where(sqlDrizzle`${users.role} != 'admin'`)
        .returning();
      
      console.log('[STORAGE] Dashboard statistics reset completed:', {
        deletedTransfers: deletedTransfersResult.length,
        deletedLoans: deletedLoansResult.length,
        deletedUsers: deletedUsersResult.length
      });
      
      return {
        deletedTransfers: deletedTransfersResult.length,
        deletedLoans: deletedLoansResult.length,
        deletedUsers: deletedUsersResult.length
      };
    } catch (error) {
      console.error('[STORAGE] Error resetting dashboard statistics:', error);
      throw error;
    }
  }

  // Tier system: determine max active loans based on tier
  getMaxActiveLoans(tier: string): number {
    switch (tier) {
      case 'silver': return 2;
      case 'gold': return 3;
      case 'bronze':
      default:
        return 1;
    }
  }

  // Tier system: determine max borrowing capacity based on tier and account type
  // Business/Professional accounts always have 2,000,000€ regardless of tier
  // Individual accounts have tier-based limits: Bronze=500K, Silver=750K, Gold=1M
  getMaxBorrowingCapacity(tier: string, accountType: string): number {
    const DEFAULT_MAX_BUSINESS = 2000000; // 2,000,000€ for business/professional
    
    // Business and professional accounts always get the higher limit
    if (accountType === 'business' || accountType === 'professional') {
      return DEFAULT_MAX_BUSINESS;
    }
    
    // Individual accounts have tier-based limits
    switch (tier) {
      case 'gold': return 1000000;   // 1,000,000€
      case 'silver': return 750000;  // 750,000€
      case 'bronze':
      default:
        return 500000;               // 500,000€
    }
  }

  // Count active loans for a user
  async getActiveLoansCount(userId: string): Promise<number> {
    const activeLoans = await db
      .select()
      .from(loans)
      .where(
        and(
          eq(loans.userId, userId),
          eq(loans.status, 'active'),
          isNull(loans.deletedAt)
        )
      );
    return activeLoans.length;
  }

  // Get user tier stats
  async getUserStats(userId: string): Promise<{ tier: string; completedLoans: number; activeLoans: number; maxActiveLoans: number; defaultedLoans: number; maxBorrowingCapacity: number }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const activeCount = await this.getActiveLoansCount(userId);
    const maxActive = this.getMaxActiveLoans(user.verificationTier);
    const maxCapacity = this.getMaxBorrowingCapacity(user.verificationTier, user.accountType);

    return {
      tier: user.verificationTier,
      completedLoans: user.completedLoansCount,
      activeLoans: activeCount,
      maxActiveLoans: maxActive,
      defaultedLoans: user.defaultedLoansCount,
      maxBorrowingCapacity: maxCapacity,
    };
  }

  // Auto-upgrade tier based on completed loans
  async checkAndUpgradeTier(userId: string): Promise<{ upgraded: boolean; oldTier: string; newTier: string }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const oldTier = user.verificationTier;
    let newTier = oldTier;

    // Gold: 5+ completed loans + 0 defaults
    if (user.completedLoansCount >= 5 && user.defaultedLoansCount === 0 && oldTier !== 'gold') {
      newTier = 'gold';
    }
    // Silver: 2-3 completed loans + 0 defaults (but not gold)
    else if (user.completedLoansCount >= 2 && user.completedLoansCount < 5 && user.defaultedLoansCount === 0 && oldTier === 'bronze') {
      newTier = 'silver';
    }

    if (newTier !== oldTier) {
      await this.updateUser(userId, { verificationTier: newTier });
      return { upgraded: true, oldTier, newTier };
    }

    return { upgraded: false, oldTier, newTier };
  }
}

export const storage = new DatabaseStorage();
