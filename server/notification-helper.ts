import { storage } from './storage';
import { type InsertNotification } from '@shared/schema';

export type NotificationType =
  | 'loan_request'
  | 'loan_under_review'
  | 'loan_approved'
  | 'loan_rejected'
  | 'loan_contract_generated'
  | 'loan_contract_signed'
  | 'loan_disbursed'
  | 'transfer_initiated'
  | 'transfer_completed'
  | 'transfer_approved'
  | 'transfer_suspended'
  | 'code_issued'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'fee_added'
  | 'account_status_changed'
  | 'admin_message_sent'
  | 'general';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  severity?: 'info' | 'success' | 'warning' | 'error';
  metadata?: any;
}

export async function createUserNotification(params: CreateNotificationParams) {
  const notification: InsertNotification = {
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    severity: params.severity || 'info',
    isRead: false,
    metadata: params.metadata,
  };

  return await storage.createNotification(notification);
}

export async function notifyLoanApproved(userId: string, loanId: string, amount: string) {
  return await createUserNotification({
    userId,
    type: 'loan_approved',
    title: 'Loan Approved',
    message: `Your loan application has been approved. You can now proceed to contract signing.`,
    severity: 'success',
    metadata: { loanId, amount },
  });
}

export async function notifyLoanRejected(userId: string, loanId: string, reason: string) {
  return await createUserNotification({
    userId,
    type: 'loan_rejected',
    title: 'Loan Rejected',
    message: `Your loan application has been rejected.`,
    severity: 'error',
    metadata: { loanId, reason },
  });
}

export async function notifyLoanDisbursed(userId: string, loanId: string, amount: string) {
  return await createUserNotification({
    userId,
    type: 'loan_disbursed',
    title: 'Funds Disbursed',
    message: `Your loan funds have been successfully disbursed to your account.`,
    severity: 'success',
    metadata: { loanId, amount },
  });
}

export async function notifyTransferCompleted(userId: string, transferId: string, amount: string) {
  return await createUserNotification({
    userId,
    type: 'transfer_completed',
    title: 'Transfer Completed',
    message: `Your transfer has been completed successfully.`,
    severity: 'success',
    metadata: { transferId, amount },
  });
}

export async function notifyTransferApproved(userId: string, transferId: string) {
  return await createUserNotification({
    userId,
    type: 'transfer_approved',
    title: 'Transfer Approved',
    message: 'Your transfer request has been approved by the administration.',
    severity: 'success',
    metadata: { transferId },
  });
}

export async function notifyTransferSuspended(userId: string, transferId: string, reason: string) {
  return await createUserNotification({
    userId,
    type: 'transfer_suspended',
    title: 'Transfer Suspended',
    message: `Your transfer has been suspended.`,
    severity: 'warning',
    metadata: { transferId, reason },
  });
}

export async function notifyCodeIssued(userId: string, transferId: string, sequence: number) {
  return await createUserNotification({
    userId,
    type: 'code_issued',
    title: 'Validation Code Issued',
    message: `A new validation code has been issued for your transfer. Check your emails.`,
    severity: 'info',
    metadata: { transferId, sequence },
  });
}

export async function notifyKycApproved(userId: string) {
  return await createUserNotification({
    userId,
    type: 'kyc_approved',
    title: 'KYC Documents Approved',
    message: 'Your documents have been verified and approved. Your account is now active.',
    severity: 'success',
  });
}

export async function notifyKycRejected(userId: string, reason: string) {
  return await createUserNotification({
    userId,
    type: 'kyc_rejected',
    title: 'KYC Documents Rejected',
    message: `Your documents have been rejected. Please submit new documents.`,
    severity: 'error',
    metadata: { reason },
  });
}

export async function notifyFeeAdded(userId: string, feeId: string, amount: string, reason: string) {
  return await createUserNotification({
    userId,
    type: 'fee_added',
    title: 'New Fee',
    message: `New fees have been added to your account.`,
    severity: 'warning',
    metadata: { feeId, amount, reason },
  });
}

export async function notifyAccountStatusChanged(userId: string, newStatus: string, reason?: string) {
  return await createUserNotification({
    userId,
    type: 'account_status_changed',
    title: 'Account Status Changed',
    message: `Your account status has been updated.`,
    severity: newStatus === 'active' ? 'success' : 'warning',
    metadata: { newStatus, reason },
  });
}

export async function notifyLoanRequest(userId: string, loanId: string, amount: string, loanType: string) {
  return await createUserNotification({
    userId,
    type: 'loan_request',
    title: 'Loan Request Submitted',
    message: `Your loan request has been successfully submitted. We will review your application shortly.`,
    severity: 'success',
    metadata: { loanId, loanType, amount },
  });
}

export async function notifyLoanUnderReview(userId: string, loanId: string, amount: string) {
  return await createUserNotification({
    userId,
    type: 'loan_under_review',
    title: 'Application Under Review',
    message: `Your loan application is currently being reviewed by our team.`,
    severity: 'info',
    metadata: { loanId, amount },
  });
}

export async function notifyLoanContractGenerated(userId: string, loanId: string, amount: string) {
  return await createUserNotification({
    userId,
    type: 'loan_contract_generated',
    title: 'Loan Contract Available',
    message: `Your loan contract is now available. Please download it, sign it, and return it.`,
    severity: 'success',
    metadata: { loanId, amount },
  });
}

export async function notifyLoanContractSigned(userId: string, loanId: string, amount: string) {
  return await createUserNotification({
    userId,
    type: 'loan_contract_signed',
    title: 'Signed Contract Received',
    message: `We have received your signed contract. Your loan will be processed shortly.`,
    severity: 'success',
    metadata: { loanId, amount },
  });
}

export async function notifyAdminMessage(userId: string, subject: string, severity: 'info' | 'success' | 'warning' | 'error' = 'info') {
  return await createUserNotification({
    userId,
    type: 'admin_message_sent',
    title: 'New Admin Message',
    message: subject,
    severity,
    metadata: { subject },
  });
}

export async function notifyTransferInitiated(userId: string, transferId: string, amount: string, recipientName: string) {
  return await createUserNotification({
    userId,
    type: 'transfer_initiated',
    title: 'Transfer Initiated',
    message: `Your transfer request has been initiated and is being processed.`,
    severity: 'success',
    metadata: { transferId, amount, recipientName },
  });
}

export async function notifyAllAdmins(params: Omit<CreateNotificationParams, 'userId'>) {
  const allUsers = await storage.getAllUsers();
  const adminUsers = allUsers.filter(user => user.role === 'admin');
  
  const notifications = await Promise.all(
    adminUsers.map(admin =>
      createUserNotification({
        ...params,
        userId: admin.id,
      })
    )
  );
  
  return notifications;
}

export async function notifyAdminsNewKycDocument(userId: string, userName: string, documentType: string, loanType: string) {
  return await notifyAllAdmins({
    type: 'general',
    title: 'Nouveau document KYC',
    message: `${userName} a uploadé un nouveau document KYC (${documentType} - ${loanType})`,
    severity: 'info',
    metadata: { userId, userName, documentType, loanType },
  });
}

export async function notifyAdminsNewLoanRequest(userId: string, userName: string, loanId: string, amount: string, loanType: string) {
  return await notifyAllAdmins({
    type: 'general',
    title: 'Nouvelle demande de prêt',
    message: `${userName} a soumis une demande de prêt de ${amount}€ (${loanType})`,
    severity: 'info',
    metadata: { userId, userName, loanId, amount, loanType },
  });
}

export async function notifyAdminsNewTransfer(userId: string, userName: string, transferId: string, amount: string, recipient: string) {
  return await notifyAllAdmins({
    type: 'general',
    title: 'Nouveau transfert',
    message: `${userName} a initié un transfert de ${amount}€ vers ${recipient}`,
    severity: 'info',
    metadata: { userId, userName, transferId, amount, recipient },
  });
}
