import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
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
  maxLoanAmount: decimal("max_loan_amount", { precision: 12, scale: 2 }).default("50000.00"),
  suspendedUntil: timestamp("suspended_until"),
  suspensionReason: text("suspension_reason"),
  externalTransfersBlocked: boolean("external_transfers_blocked").notNull().default(false),
  transferBlockReason: text("transfer_block_reason"),
  hasSeenWelcomeMessage: boolean("has_seen_welcome_message").notNull().default(false),
  profilePhoto: text("profile_photo"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const loans = pgTable("loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  loanType: text("loan_type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  duration: integer("duration").notNull(),
  status: text("status").notNull().default("pending"),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  nextPaymentDate: timestamp("next_payment_date"),
  totalRepaid: decimal("total_repaid", { precision: 12, scale: 2 }).notNull().default("0"),
  contractUrl: text("contract_url"),
  signedContractUrl: text("signed_contract_url"),
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by"),
  deletionReason: text("deletion_reason"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const externalAccounts = pgTable("external_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  bankName: text("bank_name").notNull(),
  iban: text("iban").notNull(),
  bic: text("bic"),
  accountLabel: text("account_label").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const transfers = pgTable("transfers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  externalAccountId: varchar("external_account_id"),
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
  transferId: varchar("transfer_id").notNull(),
  code: text("code").notNull(),
  deliveryMethod: text("delivery_method").notNull(),
  codeType: text("code_type").notNull().default("initial"),
  sequence: integer("sequence").notNull().default(1),
  pausePercent: integer("pause_percent"),
  feeId: varchar("fee_id"),
  issuedAt: timestamp("issued_at").notNull().default(sql`now()`),
  expiresAt: timestamp("expires_at").notNull(),
  consumedAt: timestamp("consumed_at"),
});

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
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  severity: text("severity").notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
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

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  password: z.string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
});
export const insertLoanSchema = createInsertSchema(loans).omit({ id: true, createdAt: true });
export const insertTransferSchema = createInsertSchema(transfers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFeeSchema = createInsertSchema(fees).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertExternalAccountSchema = createInsertSchema(externalAccounts).omit({ id: true, createdAt: true });
export const insertTransferValidationCodeSchema = createInsertSchema(transferValidationCodes).omit({ id: true, issuedAt: true });
export const insertTransferEventSchema = createInsertSchema(transferEvents).omit({ id: true, createdAt: true });
export const insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({ id: true, uploadedAt: true });
export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({ id: true, updatedAt: true });
export const insertAdminMessageSchema = createInsertSchema(adminMessages).omit({ id: true, deliveredAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });

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

export type TransferDetailsResponse = {
  transfer: Transfer;
  events: TransferEvent[];
  codes?: TransferValidationCode[];
};
