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
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  getUserLoans(userId: string): Promise<Loan[]>;
  getLoan(id: string): Promise<Loan | undefined>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: string, loan: Partial<Loan>): Promise<Loan | undefined>;
  
  getUserTransfers(userId: string): Promise<Transfer[]>;
  getTransfer(id: string): Promise<Transfer | undefined>;
  createTransfer(transfer: InsertTransfer): Promise<Transfer>;
  updateTransfer(id: string, transfer: Partial<Transfer>): Promise<Transfer | undefined>;
  
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
  validateCode(transferId: string, code: string, sequence: number): Promise<TransferValidationCode | undefined>;
  
  createTransferEvent(event: InsertTransferEvent): Promise<TransferEvent>;
  getTransferEvents(transferId: string): Promise<TransferEvent[]>;
  
  getUserMessages(userId: string): Promise<AdminMessage[]>;
  createAdminMessage(message: InsertAdminMessage): Promise<AdminMessage>;
  markMessageAsRead(id: string): Promise<AdminMessage | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private loans: Map<string, Loan>;
  private transfers: Map<string, Transfer>;
  private fees: Map<string, Fee>;
  private transactions: Map<string, Transaction>;
  private adminSettings: Map<string, AdminSetting>;
  private auditLogs: AuditLog[];
  private externalAccounts: Map<string, ExternalAccount>;
  private validationCodes: Map<string, TransferValidationCode>;
  private transferEvents: Map<string, TransferEvent>;
  private adminMessages: Map<string, AdminMessage>;

  constructor() {
    this.users = new Map();
    this.loans = new Map();
    this.transfers = new Map();
    this.fees = new Map();
    this.transactions = new Map();
    this.adminSettings = new Map();
    this.auditLogs = [];
    this.externalAccounts = new Map();
    this.validationCodes = new Map();
    this.transferEvents = new Map();
    this.adminMessages = new Map();
    this.seedData();
  }

  private seedData() {
    const demoUserId = "demo-user-001";
    const demoUser: User = {
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
      createdAt: new Date("2023-01-01"),
      updatedAt: new Date("2023-01-01"),
    };
    this.users.set(demoUserId, demoUser);

    const loan1: Loan = {
      id: "loan-001",
      userId: demoUserId,
      loanType: "business",
      amount: "200000",
      interestRate: "3.5",
      duration: 60,
      status: "active",
      approvedAt: new Date("2023-01-10"),
      approvedBy: "admin-001",
      rejectedAt: null,
      rejectionReason: null,
      nextPaymentDate: new Date("2025-12-15"),
      totalRepaid: "75000",
      createdAt: new Date("2023-01-15"),
    };
    this.loans.set(loan1.id, loan1);

    const loan2: Loan = {
      id: "loan-002",
      userId: demoUserId,
      loanType: "personal",
      amount: "150000",
      interestRate: "4.2",
      duration: 48,
      status: "active",
      approvedAt: new Date("2023-06-08"),
      approvedBy: "admin-001",
      rejectedAt: null,
      rejectionReason: null,
      nextPaymentDate: new Date("2025-12-20"),
      totalRepaid: "50000",
      createdAt: new Date("2023-06-10"),
    };
    this.loans.set(loan2.id, loan2);

    const loan3: Loan = {
      id: "loan-003",
      userId: demoUserId,
      loanType: "business",
      amount: "100000",
      interestRate: "3.8",
      duration: 36,
      status: "active",
      approvedAt: new Date("2024-02-18"),
      approvedBy: "admin-001",
      rejectedAt: null,
      rejectionReason: null,
      nextPaymentDate: new Date("2025-12-28"),
      totalRepaid: "30000",
      createdAt: new Date("2024-02-20"),
    };
    this.loans.set(loan3.id, loan3);

    const transfer1: Transfer = {
      id: "transfer-001",
      userId: demoUserId,
      externalAccountId: null,
      amount: "50000",
      recipient: "Fournisseur ABC SARL",
      status: "in-progress",
      currentStep: 3,
      progressPercent: 60,
      feeAmount: "25.00",
      requiredCodes: 2,
      codesValidated: 1,
      approvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      suspendedAt: null,
      completedAt: null,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    };
    this.transfers.set(transfer1.id, transfer1);

    const transfer2: Transfer = {
      id: "transfer-002",
      userId: demoUserId,
      externalAccountId: null,
      amount: "25000",
      recipient: "Partenaire XYZ Inc.",
      status: "pending",
      currentStep: 1,
      progressPercent: 20,
      feeAmount: "15.00",
      requiredCodes: 1,
      codesValidated: 0,
      approvedAt: null,
      suspendedAt: null,
      completedAt: null,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    };
    this.transfers.set(transfer2.id, transfer2);

    const fees = [
      {
        id: "fee-001",
        userId: demoUserId,
        feeType: "Frais de dossier",
        reason: "Traitement de la demande de prêt #12345",
        amount: "150",
        createdAt: new Date("2025-11-01"),
      },
      {
        id: "fee-002",
        userId: demoUserId,
        feeType: "Frais de transfert international",
        reason: "Transfert vers compte étranger",
        amount: "25",
        createdAt: new Date("2025-11-05"),
      },
      {
        id: "fee-003",
        userId: demoUserId,
        feeType: "Frais de gestion mensuel",
        reason: "Gestion de compte professionnel",
        amount: "15",
        createdAt: new Date("2025-11-01"),
      },
      {
        id: "fee-004",
        userId: demoUserId,
        feeType: "Frais de garantie",
        reason: "Assurance sur prêt #12346",
        amount: "200",
        createdAt: new Date("2025-11-10"),
      },
    ];
    fees.forEach((fee) => this.fees.set(fee.id, fee));

    const transactions = [
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
    ];
    transactions.forEach((tx) => this.transactions.set(tx.id, tx));

    const adminSettingsData: AdminSetting[] = [
      {
        id: randomUUID(),
        settingKey: "default_transfer_fee",
        settingValue: { amount: 25, currency: "EUR" },
        description: "Montant des frais de transfert par défaut",
        updatedAt: new Date(),
        updatedBy: "admin-001",
      },
      {
        id: randomUUID(),
        settingKey: "validation_codes_count",
        settingValue: { min: 5, max: 10, default: 5 },
        description: "Nombre de codes de validation requis (minimum 5)",
        updatedAt: new Date(),
        updatedBy: "admin-001",
      },
      {
        id: randomUUID(),
        settingKey: "validation_code_amount_threshold",
        settingValue: { amount: 50000, currency: "EUR" },
        description: "Montant déclenchant plusieurs codes de validation",
        updatedAt: new Date(),
        updatedBy: "admin-001",
      },
      {
        id: randomUUID(),
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
        updatedAt: new Date(),
        updatedBy: "admin-001",
      },
    ];
    adminSettingsData.forEach((setting) => this.adminSettings.set(setting.settingKey, setting));

    const user2: User = {
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
      createdAt: new Date("2024-03-01"),
      updatedAt: new Date("2024-03-01"),
    };
    this.users.set(user2.id, user2);

    const user3: User = {
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
      kycApprovedAt: null,
      createdAt: new Date("2025-11-01"),
      updatedAt: new Date("2025-11-01"),
    };
    this.users.set(user3.id, user3);

    const transfer3: Transfer = {
      id: "transfer-003",
      userId: "user-002",
      externalAccountId: null,
      amount: "75000",
      recipient: "Client ABC Ltd",
      status: "completed",
      currentStep: 5,
      progressPercent: 100,
      feeAmount: "50.00",
      requiredCodes: 3,
      codesValidated: 3,
      approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      suspendedAt: null,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    };
    this.transfers.set(transfer3.id, transfer3);

    this.auditLogs = [
      {
        id: randomUUID(),
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
        id: randomUUID(),
        actorId: "admin-001",
        actorRole: "admin",
        action: "update_settings",
        entityType: "admin_setting",
        entityId: null,
        metadata: { settingKey: "default_transfer_fee", oldValue: 20, newValue: 25 },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = { 
      ...insertUser,
      id,
      phone: insertUser.phone || null,
      accountType: insertUser.accountType || 'business',
      role: insertUser.role || 'user',
      status: insertUser.status || 'pending',
      kycStatus: insertUser.kycStatus || 'pending',
      kycSubmittedAt: insertUser.kycSubmittedAt || null,
      kycApprovedAt: insertUser.kycApprovedAt || null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async getUserLoans(userId: string): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(
      (loan) => loan.userId === userId
    );
  }

  async getLoan(id: string): Promise<Loan | undefined> {
    return this.loans.get(id);
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const id = randomUUID();
    const loan: Loan = {
      ...insertLoan,
      id,
      status: insertLoan.status || 'pending',
      approvedAt: insertLoan.approvedAt || null,
      approvedBy: insertLoan.approvedBy || null,
      rejectedAt: insertLoan.rejectedAt || null,
      rejectionReason: insertLoan.rejectionReason || null,
      totalRepaid: insertLoan.totalRepaid || '0',
      nextPaymentDate: insertLoan.nextPaymentDate || null,
      createdAt: new Date(),
    };
    this.loans.set(id, loan);
    return loan;
  }

  async updateLoan(id: string, updates: Partial<Loan>): Promise<Loan | undefined> {
    const loan = this.loans.get(id);
    if (!loan) return undefined;
    const updated = { ...loan, ...updates };
    this.loans.set(id, updated);
    return updated;
  }

  async getUserTransfers(userId: string): Promise<Transfer[]> {
    return Array.from(this.transfers.values()).filter(
      (transfer) => transfer.userId === userId
    );
  }

  async getTransfer(id: string): Promise<Transfer | undefined> {
    return this.transfers.get(id);
  }

  async createTransfer(insertTransfer: InsertTransfer): Promise<Transfer> {
    const id = randomUUID();
    const now = new Date();
    const transfer: Transfer = {
      ...insertTransfer,
      id,
      externalAccountId: insertTransfer.externalAccountId || null,
      status: insertTransfer.status || 'pending',
      currentStep: insertTransfer.currentStep || 1,
      progressPercent: insertTransfer.progressPercent || 0,
      feeAmount: insertTransfer.feeAmount || "0",
      requiredCodes: insertTransfer.requiredCodes || 1,
      codesValidated: insertTransfer.codesValidated || 0,
      approvedAt: insertTransfer.approvedAt || null,
      suspendedAt: insertTransfer.suspendedAt || null,
      completedAt: insertTransfer.completedAt || null,
      createdAt: now,
      updatedAt: now,
    };
    this.transfers.set(id, transfer);
    return transfer;
  }

  async updateTransfer(id: string, updates: Partial<Transfer>): Promise<Transfer | undefined> {
    const transfer = this.transfers.get(id);
    if (!transfer) return undefined;
    const updated = { ...transfer, ...updates, updatedAt: new Date() };
    this.transfers.set(id, updated);
    return updated;
  }

  async getUserFees(userId: string): Promise<Fee[]> {
    return Array.from(this.fees.values()).filter(
      (fee) => fee.userId === userId
    );
  }

  async createFee(insertFee: InsertFee): Promise<Fee> {
    const id = randomUUID();
    const fee: Fee = {
      ...insertFee,
      id,
      createdAt: new Date(),
    };
    this.fees.set(id, fee);
    return fee;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getDashboardData(userId: string) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const loans = await this.getUserLoans(userId);
    const transfers = await this.getUserTransfers(userId);
    const fees = await this.getUserFees(userId);
    const transactions = await this.getUserTransactions(userId);

    const totalBorrowed = loans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0);
    const totalRepaid = loans.reduce((sum, loan) => sum + parseFloat(loan.totalRepaid), 0);
    const balance = totalBorrowed - totalRepaid;

    return {
      user,
      balance,
      loans,
      transfers,
      fees,
      transactions,
    };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllTransfers(): Promise<Transfer[]> {
    return Array.from(this.transfers.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllLoans(): Promise<Loan[]> {
    return Array.from(this.loans.values());
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAdminSettings(): Promise<AdminSetting[]> {
    return Array.from(this.adminSettings.values());
  }

  async getAdminSetting(key: string): Promise<AdminSetting | undefined> {
    return this.adminSettings.get(key);
  }

  async updateAdminSetting(key: string, value: any, updatedBy: string): Promise<AdminSetting> {
    const existing = this.adminSettings.get(key);
    const setting: AdminSetting = {
      id: existing?.id || randomUUID(),
      settingKey: key,
      settingValue: value,
      description: existing?.description || "",
      updatedAt: new Date(),
      updatedBy,
    };
    this.adminSettings.set(key, setting);
    return setting;
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogs
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const log: AuditLog = {
      ...insertLog,
      id: randomUUID(),
      entityId: insertLog.entityId || null,
      metadata: insertLog.metadata || null,
      ipAddress: insertLog.ipAddress || null,
      userAgent: insertLog.userAgent || null,
      createdAt: new Date(),
    };
    this.auditLogs.push(log);
    return log;
  }

  async getActivityStats() {
    const users = Array.from(this.users.values());
    const transfers = Array.from(this.transfers.values());
    const loans = Array.from(this.loans.values());

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      totalTransfers: transfers.length,
      pendingTransfers: transfers.filter(t => t.status === 'pending' || t.status === 'in-progress').length,
      totalLoans: loans.length,
      activeLoans: loans.filter(l => l.status === 'active').length,
    };
  }

  async getUserExternalAccounts(userId: string): Promise<ExternalAccount[]> {
    return Array.from(this.externalAccounts.values()).filter(
      (account) => account.userId === userId
    );
  }

  async getExternalAccount(id: string): Promise<ExternalAccount | undefined> {
    return this.externalAccounts.get(id);
  }

  async createExternalAccount(insertAccount: InsertExternalAccount): Promise<ExternalAccount> {
    const id = randomUUID();
    const account: ExternalAccount = {
      ...insertAccount,
      id,
      bic: insertAccount.bic || null,
      isDefault: insertAccount.isDefault || false,
      createdAt: new Date(),
    };
    this.externalAccounts.set(id, account);
    return account;
  }

  async deleteExternalAccount(id: string): Promise<boolean> {
    return this.externalAccounts.delete(id);
  }

  async createValidationCode(insertCode: InsertTransferValidationCode): Promise<TransferValidationCode> {
    const id = randomUUID();
    const code: TransferValidationCode = {
      ...insertCode,
      id,
      sequence: insertCode.sequence || 1,
      issuedAt: new Date(),
      consumedAt: insertCode.consumedAt || null,
    };
    this.validationCodes.set(id, code);
    return code;
  }

  async getTransferValidationCodes(transferId: string): Promise<TransferValidationCode[]> {
    return Array.from(this.validationCodes.values())
      .filter((code) => code.transferId === transferId)
      .sort((a, b) => a.sequence - b.sequence);
  }

  async validateCode(transferId: string, code: string, sequence: number): Promise<TransferValidationCode | undefined> {
    const validationCode = Array.from(this.validationCodes.values()).find(
      (vc) => vc.transferId === transferId && vc.code === code && vc.sequence === sequence && !vc.consumedAt
    );
    
    if (validationCode && new Date() <= validationCode.expiresAt) {
      const updated = { ...validationCode, consumedAt: new Date() };
      this.validationCodes.set(validationCode.id, updated);
      return updated;
    }
    
    return undefined;
  }

  async createTransferEvent(insertEvent: InsertTransferEvent): Promise<TransferEvent> {
    const id = randomUUID();
    const event: TransferEvent = {
      ...insertEvent,
      id,
      metadata: insertEvent.metadata || null,
      createdAt: new Date(),
    };
    this.transferEvents.set(id, event);
    return event;
  }

  async getTransferEvents(transferId: string): Promise<TransferEvent[]> {
    return Array.from(this.transferEvents.values())
      .filter((event) => event.transferId === transferId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getUserMessages(userId: string): Promise<AdminMessage[]> {
    return Array.from(this.adminMessages.values())
      .filter((msg) => msg.userId === userId)
      .sort((a, b) => b.deliveredAt.getTime() - a.deliveredAt.getTime());
  }

  async createAdminMessage(insertMessage: InsertAdminMessage): Promise<AdminMessage> {
    const id = randomUUID();
    const message: AdminMessage = {
      ...insertMessage,
      id,
      transferId: insertMessage.transferId || null,
      severity: insertMessage.severity || 'info',
      isRead: insertMessage.isRead || false,
      deliveredAt: new Date(),
      readAt: insertMessage.readAt || null,
    };
    this.adminMessages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: string): Promise<AdminMessage | undefined> {
    const message = this.adminMessages.get(id);
    if (!message) return undefined;
    const updated = { ...message, isRead: true, readAt: new Date() };
    this.adminMessages.set(id, updated);
    return updated;
  }
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
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

  async getUserLoans(userId: string): Promise<Loan[]> {
    return await db.select().from(loans).where(eq(loans.userId, userId));
  }

  async getLoan(id: string): Promise<Loan | undefined> {
    const result = await db.select().from(loans).where(eq(loans.id, id));
    return result[0];
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const result = await db.insert(loans).values(insertLoan).returning();
    return result[0];
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
    const result = await db.insert(transfers).values(insertTransfer).returning();
    return result[0];
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

    const totalBorrowed = userLoans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0);
    const totalRepaid = userLoans.reduce((sum, loan) => sum + parseFloat(loan.totalRepaid), 0);
    const balance = totalBorrowed - totalRepaid;

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
    return await db.select().from(loans);
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

  async validateCode(transferId: string, code: string, sequence: number): Promise<TransferValidationCode | undefined> {
    const result = await db.select()
      .from(transferValidationCodes)
      .where(
        eq(transferValidationCodes.transferId, transferId)
      );
    
    const validationCode = result.find(
      (vc) => vc.code === code && vc.sequence === sequence && !vc.consumedAt
    );
    
    if (validationCode && new Date() <= validationCode.expiresAt) {
      const updated = await db.update(transferValidationCodes)
        .set({ consumedAt: new Date() })
        .where(eq(transferValidationCodes.id, validationCode.id))
        .returning();
      return updated[0];
    }
    
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
}

export const storage = new MemStorage();
