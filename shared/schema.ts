import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, json, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const LOAN_FUNDS_AVAILABILITY = {
  PENDING: 'pending',
  PENDING_DISBURSEMENT: 'pending_disbursement',
  AVAILABLE: 'available',
} as const;

export type LoanFundsAvailability = (typeof LOAN_FUNDS_AVAILABILITY)[keyof typeof LOAN_FUNDS_AVAILABILITY];

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordTokenExpiry: timestamp("reset_password_token_expiry"),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  preferredLanguage: text("preferred_language").notNull().default("fr"),
  accountType: text("account_type").notNull().default("business"),
  companyName: text("company_name"),
  siret: text("siret"),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("pending"),
  kycStatus: text("kyc_status").notNull().default("pending"),
  kycSubmittedAt: timestamp("kyc_submitted_at"),
  kycApprovedAt: timestamp("kyc_approved_at"),
  maxLoanAmount: decimal("max_loan_amount", { precision: 12, scale: 2 }).default("500000.00"),
  suspendedUntil: timestamp("suspended_until"),
  suspensionReason: text("suspension_reason"),
  externalTransfersBlocked: boolean("external_transfers_blocked").notNull().default(false),
  transferBlockReason: text("transfer_block_reason"),
  hasSeenWelcomeMessage: boolean("has_seen_welcome_message").notNull().default(false),
  profilePhoto: text("profile_photo"),
  notificationEmailAlerts: boolean("notification_email_alerts").notNull().default(true),
  notificationTransferUpdates: boolean("notification_transfer_updates").notNull().default(true),
  notificationLoanReminders: boolean("notification_loan_reminders").notNull().default(true),
  notificationMarketingEmails: boolean("notification_marketing_emails").notNull().default(false),
  activeSessionId: text("active_session_id"),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const loans = pgTable("loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  loanType: text("loan_type").notNull(),
  loanReference: text("loan_reference"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  duration: integer("duration").notNull(),
  status: text("status").notNull().default("pending_review"),
  contractStatus: text("contract_status").notNull().default("none"),
  fundsAvailabilityStatus: text("funds_availability_status").notNull().default("pending"),
  documents: json("documents"),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  nextPaymentDate: timestamp("next_payment_date"),
  totalRepaid: decimal("total_repaid", { precision: 12, scale: 2 }).notNull().default("0"),
  contractUrl: text("contract_url"),
  signedContractUrl: text("signed_contract_url"),
  signedContractCloudinaryPublicId: text("signed_contract_cloudinary_public_id"),
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by"),
  deletionReason: text("deletion_reason"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const externalAccounts = pgTable("external_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  bankName: text("bank_name").notNull(),
  bankCountry: text("bank_country"),
  iban: text("iban").notNull(),
  bic: text("bic"),
  accountLabel: text("account_label").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const transfers = pgTable("transfers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  loanId: varchar("loan_id"),
  externalAccountId: varchar("external_account_id"),
  transferReference: text("transfer_reference"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  recipient: text("recipient").notNull(),
  status: text("status").notNull().default("pending"),
  currentStep: integer("current_step").notNull().default(1),
  progressPercent: integer("progress_percent").notNull().default(0),
  feeAmount: decimal("fee_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  requiredCodes: integer("required_codes").notNull().default(1),
  codesValidated: integer("codes_validated").notNull().default(0),
  isPaused: boolean("is_paused").notNull().default(false),
  pausePercent: integer("pause_percent"),
  pauseCodesValidated: integer("pause_codes_validated").notNull().default(0),
  approvedAt: timestamp("approved_at"),
  suspendedAt: timestamp("suspended_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const transferValidationCodes = pgTable("transfer_validation_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transferId: varchar("transfer_id"), // Nullable to allow pre-generated codes linked only to loan
  loanId: varchar("loan_id"),
  code: text("code").notNull().unique(),
  deliveryMethod: text("delivery_method").notNull(),
  codeType: text("code_type").notNull().default("initial"),
  codeContext: text("code_context"),
  sequence: integer("sequence").notNull().default(1),
  pausePercent: integer("pause_percent"),
  feeId: varchar("fee_id"),
  issuedAt: timestamp("issued_at").notNull().default(sql`now()`),
  expiresAt: timestamp("expires_at").notNull(),
  consumedAt: timestamp("consumed_at"),
}, (table) => ({
  transferIdIdx: index("transfer_id_idx").on(table.transferId),
  loanIdIdx: index("loan_id_idx").on(table.loanId),
}));

export const transferEvents = pgTable("transfer_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transferId: varchar("transfer_id").notNull(),
  eventType: text("event_type").notNull(),
  message: text("message").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const fees = pgTable("fees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  feeType: text("fee_type").notNull(),
  reason: text("reason").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
  paidAt: timestamp("paid_at"),
  relatedMessageId: varchar("related_message_id"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const kycDocuments = pgTable("kyc_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  loanId: varchar("loan_id"),
  documentType: text("document_type").notNull(),
  loanType: text("loan_type").notNull(),
  status: text("status").notNull().default("pending"),
  fileUrl: text("file_url").notNull(),
  cloudinaryPublicId: text("cloudinary_public_id"),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().default(sql`now()`),
  reviewedAt: timestamp("reviewed_at"),
  reviewerId: varchar("reviewer_id"),
  reviewNotes: text("review_notes"),
});

export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: json("setting_value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
  updatedBy: varchar("updated_by").notNull(),
});

export const adminMessages = pgTable("admin_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  transferId: varchar("transfer_id"),
  type: text("type"),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  severity: text("severity").notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
  metadata: json("metadata"),
  deliveredAt: timestamp("delivered_at").notNull().default(sql`now()`),
  readAt: timestamp("read_at"),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actorId: varchar("actor_id").notNull(),
  actorRole: text("actor_role").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id"),
  metadata: json("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const userSessions = pgTable("user_sessions", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const userOtps = pgTable("user_otps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  otpCode: text("otp_code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  attempts: integer("attempts").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  readAt: timestamp("read_at"),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull(),
  receiverId: varchar("receiver_id").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => ({
  senderIdIdx: index("messages_sender_id_idx").on(table.senderId),
  receiverIdIdx: index("messages_receiver_id_idx").on(table.receiverId),
  conversationIdx: index("messages_conversation_idx").on(table.senderId, table.receiverId, table.createdAt),
}));

// Chat System Tables
export const chatConversations = pgTable("chat_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  assignedAdminId: varchar("assigned_admin_id"),
  subject: text("subject"),
  status: text("status").notNull().default("open"),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => ({
  userIdIdx: index("chat_conversations_user_id_idx").on(table.userId),
  adminIdIdx: index("chat_conversations_admin_id_idx").on(table.assignedAdminId),
  statusIdx: index("chat_conversations_status_idx").on(table.status),
}));

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  senderType: text("sender_type").notNull(),
  content: text("content").notNull(),
  messageType: text("message_type").notNull().default("text"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => ({
  conversationIdIdx: index("chat_messages_conversation_id_idx").on(table.conversationId),
  senderIdIdx: index("chat_messages_sender_id_idx").on(table.senderId),
  createdAtIdx: index("chat_messages_created_at_idx").on(table.createdAt),
}));

export const chatPresence = pgTable("chat_presence", {
  userId: varchar("user_id").primaryKey(),
  status: text("status").notNull().default("offline"),
  lastSeen: timestamp("last_seen").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const amortizationSchedule = pgTable("amortization_schedule", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanId: varchar("loan_id").notNull(),
  paymentNumber: integer("payment_number").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paymentAmount: decimal("payment_amount", { precision: 12, scale: 2 }).notNull(),
  principalAmount: decimal("principal_amount", { precision: 12, scale: 2 }).notNull(),
  interestAmount: decimal("interest_amount", { precision: 12, scale: 2 }).notNull(),
  remainingBalance: decimal("remaining_balance", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("unpaid"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => ({
  loanIdIdx: index("amortization_loan_id_idx").on(table.loanId),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  password: z.string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
});
export const insertLoanSchema = createInsertSchema(loans).omit({ id: true, createdAt: true, loanReference: true });
export const insertTransferSchema = createInsertSchema(transfers).omit({ id: true, createdAt: true, updatedAt: true, transferReference: true });
export const insertFeeSchema = createInsertSchema(fees).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertExternalAccountSchema = createInsertSchema(externalAccounts).omit({ id: true, createdAt: true });
export const insertTransferValidationCodeSchema = createInsertSchema(transferValidationCodes).omit({ id: true, issuedAt: true });
export const insertTransferEventSchema = createInsertSchema(transferEvents).omit({ id: true, createdAt: true });
export const insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({ id: true, uploadedAt: true });
export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({ id: true, updatedAt: true });
export const insertAdminMessageSchema = createInsertSchema(adminMessages).omit({ id: true, deliveredAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export const insertUserOtpSchema = createInsertSchema(userOtps).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertAmortizationScheduleSchema = createInsertSchema(amortizationSchedule).omit({ id: true, createdAt: true });

// Chat System Schemas
export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertChatPresenceSchema = createInsertSchema(chatPresence).omit({ updatedAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Loan = typeof loans.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Transfer = typeof transfers.$inferSelect;
export type InsertTransfer = z.infer<typeof insertTransferSchema>;
export type Fee = typeof fees.$inferSelect;
export type InsertFee = z.infer<typeof insertFeeSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type ExternalAccount = typeof externalAccounts.$inferSelect;
export type InsertExternalAccount = z.infer<typeof insertExternalAccountSchema>;
export type TransferValidationCode = typeof transferValidationCodes.$inferSelect;
export type InsertTransferValidationCode = z.infer<typeof insertTransferValidationCodeSchema>;
export type TransferEvent = typeof transferEvents.$inferSelect;
export type InsertTransferEvent = z.infer<typeof insertTransferEventSchema>;
export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;
export type AdminMessage = typeof adminMessages.$inferSelect;
export type InsertAdminMessage = z.infer<typeof insertAdminMessageSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type UserOtp = typeof userOtps.$inferSelect;
export type InsertUserOtp = z.infer<typeof insertUserOtpSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type AmortizationSchedule = typeof amortizationSchedule.$inferSelect;
export type InsertAmortizationSchedule = z.infer<typeof insertAmortizationScheduleSchema>;

// Chat System Types
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatPresence = typeof chatPresence.$inferSelect;
export type InsertChatPresence = z.infer<typeof insertChatPresenceSchema>;

// Type sécurisé pour les métadonnées de code sans exposer les valeurs sensibles
export type TransferCodeMetadata = {
  id: string;
  sequence: number;
  pausePercent: number | null;
  codeContext: string | null;
  expiresAt: Date;
  consumedAt: Date | null;
  deliveryMethod: string;
  isConsumed: boolean;
  isPending: boolean;
};

export type TransferDetailsResponse = {
  transfer: Transfer;
  events: TransferEvent[];
  codes: TransferCodeMetadata[];
  nextSequence: number | null;
};

/**
 * Génère un numéro de référence unique pour un transfert de manière déterministe
 * basé sur l'ID et la date de création.
 * 
 * Format: TRF-YYMMDD-XXXX
 * Ex: TRF-241120-A3F9
 * 
 * Cette fonction génère les références à la volée SANS utiliser de colonne de
 * base de données, ce qui est compatible avec toutes les bases de données de
 * production sans nécessiter de migration.
 * 
 * @param transfer - Le transfert pour lequel générer le numéro de référence
 * @returns Un numéro de référence unique au format TRF-YYMMDD-XXXX
 */
export function getTransferReferenceNumber(transfer: Transfer): string {
  const createdAt = new Date(transfer.createdAt);
  
  // Format date YYMMDD
  const year = createdAt.getFullYear().toString().slice(-2);
  const month = (createdAt.getMonth() + 1).toString().padStart(2, '0');
  const day = createdAt.getDate().toString().padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;
  
  // Extraire les 8 premiers caractères de l'UUID et les convertir en format court
  // Exemple: "a3f9b2c1-..." → "A3F9B2C1" → "A3F9"
  const idHash = transfer.id
    .replace(/-/g, '') // Retirer les tirets
    .substring(0, 8)   // Prendre les 8 premiers caractères
    .toUpperCase()     // En majuscules
    .substring(0, 4);  // Garder seulement 4 caractères
  
  // Format final: TRF-YYMMDD-XXXX
  return `TRF-${datePrefix}-${idHash}`;
}

/**
 * Génère un numéro de référence unique pour un prêt au format professionnel.
 * 
 * Format: ALT-{TYPE}-YYYY-{COUNTER}
 * Ex: ALT-P-2025-00147 (Personnel)
 *     ALT-I-2025-00893 (Immobilier)
 *     ALT-C-2025-00042 (Consommation/Business)
 * 
 * @param loan - Le prêt pour lequel générer le numéro de référence
 * @returns Un numéro de référence unique au format ALT-{TYPE}-YYYY-{COUNTER}
 */
export function getLoanReferenceNumber(loan: Loan): string {
  const createdAt = new Date(loan.createdAt);
  const year = createdAt.getFullYear();
  
  // Déterminer le préfixe de type basé sur loanType
  let typePrefix = 'C'; // Default: Consommation
  
  if (loan.loanType === 'personal') {
    typePrefix = 'P'; // Personnel
  } else if (loan.loanType === 'mortgage' || loan.loanType === 'commercialProperty') {
    typePrefix = 'I'; // Immobilier
  } else if (loan.loanType === 'business' || loan.loanType === 'cashFlow' || loan.loanType === 'lineOfCredit') {
    typePrefix = 'B'; // Business
  } else if (loan.loanType === 'auto' || loan.loanType === 'vehicleFleet') {
    typePrefix = 'A'; // Auto
  } else if (loan.loanType === 'equipment') {
    typePrefix = 'E'; // Equipement
  }
  
  // Générer un compteur à partir de l'UUID (5 chiffres)
  // Utilise les 5 premiers caractères hexadécimaux de l'UUID converti en base 10
  const uuidNum = parseInt(loan.id.replace(/-/g, '').substring(0, 8), 16);
  const counter = String(uuidNum % 100000).padStart(5, '0');
  
  // Format final: ALT-{TYPE}-YYYY-{COUNTER}
  return `ALT-${typePrefix}-${year}-${counter}`;
}

/**
 * Génère ou retourne le numéro de référence d'un prêt.
 * Si le prêt a déjà une référence, la retourne, sinon la génère.
 * 
 * @param loan - Le prêt
 * @returns Le numéro de référence du prêt
 */
export function getOrGenerateLoanReference(loan: Loan): string {
  return loan.loanReference || getLoanReferenceNumber(loan);
}
