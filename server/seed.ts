import { db } from "./db";
import { users, loans, transfers, fees, transactions, adminSettings } from "@shared/schema";
import { eq } from "drizzle-orm";

// Test credentials for demo users:
// Email: jean.dupont@entreprise.fr, marie.martin@societe.fr, pierre.bernard@company.fr
// Password: Password123! (same for all test users)

async function seed() {
  console.log("🌱 Seeding database...");

  const demoUserId = "demo-user-001";
  
  const existingUser = await db.select().from(users).where(eq(users.id, demoUserId));
  
  if (existingUser.length > 0) {
    console.log("✅ Database already seeded");
    return;
  }

  // bcrypt hash for "Password123!" (bcrypt rounds=10)
  const testPasswordHash = "$2b$10$fpS/SSaQILwimXFx4DVUberqRiusOyvBPJ2XBbSV6YPDAzByp0I6K";

  await db.insert(users).values({
    id: demoUserId,
    username: "jean.dupont",
    password: testPasswordHash,
    email: "jean.dupont@entreprise.fr",
    fullName: "Jean Dupont",
    phone: "+33612345678",
    accountType: "business",
    role: "user",
    status: "active",
    kycStatus: "approved",
    kycSubmittedAt: new Date("2023-01-01"),
    kycApprovedAt: new Date("2023-01-05"),
  });

  await db.insert(loans).values([
    {
      id: "loan-001",
      userId: demoUserId,
      loanType: "Prêt Professionnel",
      amount: "200000",
      interestRate: "3.5",
      duration: 60,
      status: "active",
      nextPaymentDate: new Date("2025-12-15"),
      totalRepaid: "75000",
    },
    {
      id: "loan-002",
      userId: demoUserId,
      loanType: "Crédit de Trésorerie",
      amount: "150000",
      interestRate: "4.2",
      duration: 48,
      status: "active",
      nextPaymentDate: new Date("2025-12-20"),
      totalRepaid: "50000",
    },
    {
      id: "loan-003",
      userId: demoUserId,
      loanType: "Financement Équipement",
      amount: "100000",
      interestRate: "3.8",
      duration: 36,
      status: "active",
      nextPaymentDate: new Date("2025-12-28"),
      totalRepaid: "30000",
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
    },
  ]);

  await db.insert(fees).values([
    {
      id: "fee-001",
      userId: demoUserId,
      feeType: "Frais de dossier",
      reason: "Traitement de la demande de prêt #12345",
      amount: "150",
    },
    {
      id: "fee-002",
      userId: demoUserId,
      feeType: "Frais de transfert international",
      reason: "Transfert vers compte étranger",
      amount: "25",
    },
    {
      id: "fee-003",
      userId: demoUserId,
      feeType: "Frais de gestion mensuel",
      reason: "Gestion de compte professionnel",
      amount: "15",
    },
    {
      id: "fee-004",
      userId: demoUserId,
      feeType: "Frais de garantie",
      reason: "Assurance sur prêt #12346",
      amount: "200",
    },
  ]);

  await db.insert(transactions).values([
    {
      id: "tx-001",
      userId: demoUserId,
      type: "loan_disbursement",
      amount: "200000",
      description: "Décaissement prêt #12345",
    },
    {
      id: "tx-002",
      userId: demoUserId,
      type: "loan_payment",
      amount: "-8000",
      description: "Remboursement mensuel prêt #12345",
    },
    {
      id: "tx-003",
      userId: demoUserId,
      type: "loan_disbursement",
      amount: "150000",
      description: "Décaissement prêt #12346",
    },
    {
      id: "tx-004",
      userId: demoUserId,
      type: "transfer_out",
      amount: "-50000",
      description: "Transfert vers Fournisseur ABC SARL",
    },
  ]);

  await db.insert(adminSettings).values([
    {
      settingKey: "default_transfer_fee",
      settingValue: { amount: 25, currency: "EUR" },
      description: "Montant des frais de transfert par défaut",
      updatedBy: "admin-001",
    },
    {
      settingKey: "validation_codes_count",
      settingValue: { min: 1, max: 3, default: 2 },
      description: "Nombre de codes de validation requis",
      updatedBy: "admin-001",
    },
    {
      settingKey: "validation_code_amount_threshold",
      settingValue: { amount: 50000, currency: "EUR" },
      description: "Montant déclenchant plusieurs codes de validation",
      updatedBy: "admin-001",
    },
    {
      settingKey: "validation_pause_percentages",
      settingValue: [93, 96, 99],
      description: "Pourcentages de progression où le transfert se met en pause et requiert un code de déblocage",
      updatedBy: "admin-001",
    },
  ]);

  await db.insert(users).values([
    {
      id: "user-002",
      username: "marie.martin",
      password: testPasswordHash,
      email: "marie.martin@societe.fr",
      fullName: "Marie Martin",
      phone: "+33698765432",
      accountType: "business",
      role: "user",
      status: "active",
      kycStatus: "approved",
      kycSubmittedAt: new Date("2024-03-01"),
      kycApprovedAt: new Date("2024-03-05"),
    },
    {
      id: "user-003",
      username: "pierre.bernard",
      password: testPasswordHash,
      email: "pierre.bernard@company.fr",
      fullName: "Pierre Bernard",
      phone: "+33687654321",
      accountType: "business",
      role: "user",
      status: "pending",
      kycStatus: "pending",
      kycSubmittedAt: new Date("2025-11-01"),
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
  });

  console.log("✅ Database seeded successfully");
}

seed()
  .then(() => {
    console.log("✅ Seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });
