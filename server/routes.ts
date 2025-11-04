import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLoanSchema, insertTransferSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEMO_USER_ID = "demo-user-001";
  const ADMIN_ID = "admin-001";

  const calculateInterestRate = async (loanType: string, amount: number): Promise<number> => {
    const rateTiersSetting = await storage.getAdminSetting('interest_rate_tiers');
    if (!rateTiersSetting) {
      return loanType === 'business' ? 3.5 : loanType === 'personal' ? 4.5 : 3.0;
    }

    const tiers = (rateTiersSetting.settingValue as any)[loanType] || [];
    const tier = tiers.find((t: any) => amount >= t.min && amount < t.max);
    return tier ? tier.rate : 4.0;
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    const adminToken = req.headers['x-admin-token'];
    if (adminToken !== ADMIN_ID) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  };

  app.get("/api/dashboard", async (req, res) => {
    try {
      const data = await storage.getDashboardData(DEMO_USER_ID);
      
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
          category: fee.feeType.toLowerCase().includes('prêt') || fee.feeType.toLowerCase().includes('loan') || fee.feeType.toLowerCase().includes('dossier') || fee.feeType.toLowerCase().includes('garantie')
            ? 'loan'
            : fee.feeType.toLowerCase().includes('transfer')
            ? 'transfer'
            : 'account',
        })),
        borrowingCapacity: {
          maxCapacity: 500000,
          currentCapacity: 500000 - data.balance,
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
      const user = await storage.getUser(DEMO_USER_ID);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  app.get("/api/loans", async (req, res) => {
    try {
      const loans = await storage.getUserLoans(DEMO_USER_ID);
      res.json(loans);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch loans' });
    }
  });

  app.post("/api/loans", async (req, res) => {
    try {
      const { loanType, amount, duration } = req.body;
      
      const interestRate = await calculateInterestRate(loanType, parseFloat(amount));
      
      const validated = insertLoanSchema.parse({
        userId: DEMO_USER_ID,
        loanType,
        amount,
        duration,
        interestRate: interestRate.toString(),
        status: 'pending',
      });
      
      const loan = await storage.createLoan(validated);
      
      await storage.createAdminMessage({
        userId: DEMO_USER_ID,
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

  app.get("/api/transfers", async (req, res) => {
    try {
      const transfers = await storage.getUserTransfers(DEMO_USER_ID);
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transfers' });
    }
  });

  app.post("/api/transfers", async (req, res) => {
    try {
      const validated = insertTransferSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
      });
      const transfer = await storage.createTransfer(validated);
      
      await storage.createFee({
        userId: DEMO_USER_ID,
        feeType: 'Frais de transfert',
        reason: `Transfert vers ${validated.recipient}`,
        amount: '25',
      });

      res.status(201).json(transfer);
    } catch (error) {
      res.status(400).json({ error: 'Invalid transfer data' });
    }
  });

  app.post("/api/transfers/initiate", async (req, res) => {
    try {
      const { amount, externalAccountId, recipient } = req.body;
      
      const settingCodesCount = await storage.getAdminSetting('validation_codes_count');
      const settingFee = await storage.getAdminSetting('default_transfer_fee');
      
      const codesRequired = (settingCodesCount?.settingValue as any)?.default || 1;
      const feeAmount = (settingFee?.settingValue as any)?.amount || 25;
      
      const transfer = await storage.createTransfer({
        userId: DEMO_USER_ID,
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

      const validationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      await storage.createValidationCode({
        transferId: transfer.id,
        code: validationCode,
        deliveryMethod: 'email',
        sequence: 1,
        expiresAt,
      });

      await storage.createTransferEvent({
        transferId: transfer.id,
        eventType: 'initiated',
        message: 'Transfert initié - Code de validation envoyé',
        metadata: { method: 'email', sequence: 1 },
      });

      res.status(201).json({ 
        transfer,
        message: 'Code de validation envoyé à votre email',
        codeForDemo: validationCode,
      });
    } catch (error) {
      console.error('Transfer initiation error:', error);
      res.status(400).json({ error: 'Failed to initiate transfer' });
    }
  });

  app.get("/api/transfers/:id", async (req, res) => {
    try {
      const transfer = await storage.getTransfer(req.params.id);
      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      const events = await storage.getTransferEvents(req.params.id);
      const codes = await storage.getTransferValidationCodes(req.params.id);

      res.json({ transfer, events, codes });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transfer' });
    }
  });

  app.post("/api/transfers/:id/send-code", async (req, res) => {
    try {
      const transfer = await storage.getTransfer(req.params.id);
      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      const nextSequence = transfer.codesValidated + 1;
      if (nextSequence > transfer.requiredCodes) {
        return res.status(400).json({ error: 'All codes already validated' });
      }

      const validationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      await storage.createValidationCode({
        transferId: transfer.id,
        code: validationCode,
        deliveryMethod: req.body.method || 'email',
        sequence: nextSequence,
        expiresAt,
      });

      await storage.createTransferEvent({
        transferId: transfer.id,
        eventType: 'code_sent',
        message: `Code de validation ${nextSequence}/${transfer.requiredCodes} envoyé`,
        metadata: { method: req.body.method || 'email', sequence: nextSequence },
      });

      res.json({ 
        message: 'Code envoyé',
        codeForDemo: validationCode,
        sequence: nextSequence,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send code' });
    }
  });

  app.post("/api/transfers/:id/validate-code", async (req, res) => {
    try {
      const { code, sequence } = req.body;
      const transfer = await storage.getTransfer(req.params.id);
      
      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found' });
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

  app.get("/api/external-accounts", async (req, res) => {
    try {
      const accounts = await storage.getUserExternalAccounts(DEMO_USER_ID);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch external accounts' });
    }
  });

  app.post("/api/external-accounts", async (req, res) => {
    try {
      const account = await storage.createExternalAccount({
        userId: DEMO_USER_ID,
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

  app.delete("/api/external-accounts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteExternalAccount(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'External account not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete external account' });
    }
  });

  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getUserMessages(DEMO_USER_ID);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post("/api/messages/:id/read", async (req, res) => {
    try {
      const message = await storage.markMessageAsRead(req.params.id);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  });

  app.get("/api/fees", async (req, res) => {
    try {
      const fees = await storage.getUserFees(DEMO_USER_ID);
      res.json(fees);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch fees' });
    }
  });

  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getUserTransactions(DEMO_USER_ID);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  app.get("/api/charts/available-funds", async (req, res) => {
    try {
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const dashboardData = await storage.getDashboardData(DEMO_USER_ID);
      
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

  app.get("/api/charts/upcoming-repayments", async (req, res) => {
    try {
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const userLoans = await storage.getUserLoans(DEMO_USER_ID);
      
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
      const updated = await storage.updateUser(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      await storage.createAuditLog({
        actorId: 'admin-001',
        actorRole: 'admin',
        action: 'update_user',
        entityType: 'user',
        entityId: req.params.id,
        metadata: req.body,
      });
      
      res.json(updated);
    } catch (error) {
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
        actorId: 'admin-001',
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
      const updated = await storage.updateTransfer(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Transfer not found' });
      }
      
      const action = req.body.status === 'suspended' ? 'suspend_transfer' : 
                     req.body.approvedAt ? 'approve_transfer' : 'update_transfer';
      
      await storage.createAuditLog({
        actorId: 'admin-001',
        actorRole: 'admin',
        action,
        entityType: 'transfer',
        entityId: req.params.id,
        metadata: req.body,
      });
      
      res.json(updated);
    } catch (error) {
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
      const { value } = req.body;
      const updated = await storage.updateAdminSetting(req.params.key, value, 'admin-001');
      
      await storage.createAuditLog({
        actorId: 'admin-001',
        actorRole: 'admin',
        action: 'update_settings',
        entityType: 'admin_setting',
        entityId: updated.id,
        metadata: { settingKey: req.params.key, value },
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update setting' });
    }
  });

  app.post("/api/admin/messages", requireAdmin, async (req, res) => {
    try {
      const { userId, transferId, subject, content, severity } = req.body;
      
      const message = await storage.createAdminMessage({
        userId,
        transferId: transferId || null,
        subject,
        content,
        severity: severity || 'info',
      });

      await storage.createAuditLog({
        actorId: 'admin-001',
        actorRole: 'admin',
        action: 'send_message',
        entityType: 'admin_message',
        entityId: message.id,
        metadata: { userId, subject },
      });

      res.status(201).json(message);
    } catch (error) {
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

  app.post("/api/admin/loans/:id/approve", requireAdmin, async (req, res) => {
    try {
      const loan = await storage.getLoan(req.params.id);
      if (!loan) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      const updated = await storage.updateLoan(req.params.id, {
        status: 'active',
        approvedAt: new Date(),
        approvedBy: ADMIN_ID,
      });

      await storage.createAdminMessage({
        userId: loan.userId,
        transferId: null,
        subject: 'Demande de prêt approuvée',
        content: `Félicitations! Votre demande de prêt de ${loan.amount} EUR a été approuvée. Les fonds seront disponibles sous peu.`,
        severity: 'success',
      });

      await storage.createAuditLog({
        actorId: ADMIN_ID,
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

  app.post("/api/admin/loans/:id/reject", requireAdmin, async (req, res) => {
    try {
      const { reason } = req.body;
      const loan = await storage.getLoan(req.params.id);
      if (!loan) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      const updated = await storage.updateLoan(req.params.id, {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason: reason,
      });

      await storage.createAdminMessage({
        userId: loan.userId,
        transferId: null,
        subject: 'Demande de prêt refusée',
        content: `Nous sommes désolés de vous informer que votre demande de prêt de ${loan.amount} EUR a été refusée. Raison: ${reason}`,
        severity: 'warning',
      });

      await storage.createAuditLog({
        actorId: ADMIN_ID,
        actorRole: 'admin',
        action: 'reject_loan',
        entityType: 'loan',
        entityId: req.params.id,
        metadata: { amount: loan.amount, loanType: loan.loanType, reason },
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to reject loan' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
