import { storage } from './storage';
import { type InsertNotification, type InsertAdminMessage } from '@shared/schema';
import { getNotificationTranslation, type Language } from './notification-translations';

export type NotificationType =
  | 'loan_request'
  | 'loan_under_review'
  | 'loan_approved'
  | 'loan_rejected'
  | 'loan_contract_generated'
  | 'loan_contract_signed'
  | 'loan_funds_available'
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
  | '2fa_suggestion'
  | 'general';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  severity?: 'info' | 'success' | 'warning' | 'error';
  metadata?: any;
}

async function getUserLanguage(userId: string): Promise<Language> {
  try {
    const user = await storage.getUserById(userId);
    const lang = user?.language as Language;
    return lang && ['fr', 'en', 'es', 'pt', 'it', 'de', 'nl'].includes(lang) ? lang : 'fr';
  } catch (error) {
    console.error('Error getting user language:', error);
    return 'fr';
  }
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
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('loan_approved', language);
  
  return await createUserNotification({
    userId,
    type: 'loan_approved',
    title: translation.title,
    message: translation.message,
    severity: 'success',
    metadata: { loanId, amount },
  });
}

export async function notifyLoanRejected(userId: string, loanId: string, reason: string) {
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('loan_rejected', language);
  
  return await createUserNotification({
    userId,
    type: 'loan_rejected',
    title: translation.title,
    message: translation.message,
    severity: 'error',
    metadata: { loanId, reason },
  });
}

export async function notifyLoanFundsAvailable(userId: string, loanId: string, amount: string) {
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('loan_funds_available', language);
  
  return await createUserNotification({
    userId,
    type: 'loan_funds_available',
    title: translation.title,
    message: translation.message,
    severity: 'success',
    metadata: { loanId, amount },
  });
}

export async function notifyLoanDisbursed(userId: string, loanId: string, amount: string) {
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('loan_disbursed', language);
  
  return await createUserNotification({
    userId,
    type: 'loan_disbursed',
    title: translation.title,
    message: translation.message,
    severity: 'success',
    metadata: { loanId, amount },
  });
}

export async function notifyTransferCompleted(userId: string, transferId: string, amount: string) {
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('transfer_completed', language);
  
  return await createUserNotification({
    userId,
    type: 'transfer_completed',
    title: translation.title,
    message: translation.message,
    severity: 'success',
    metadata: { transferId, amount },
  });
}

export async function notifyTransferApproved(userId: string, transferId: string) {
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('transfer_approved', language);
  
  return await createUserNotification({
    userId,
    type: 'transfer_approved',
    title: translation.title,
    message: translation.message,
    severity: 'success',
    metadata: { transferId },
  });
}

export async function notifyTransferSuspended(userId: string, transferId: string, reason: string) {
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('transfer_suspended', language);
  
  return await createUserNotification({
    userId,
    type: 'transfer_suspended',
    title: translation.title,
    message: translation.message,
    severity: 'warning',
    metadata: { transferId, reason },
  });
}

export async function notifyCodeIssued(userId: string, transferId: string, sequence: number) {
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('code_issued', language);
  
  return await createUserNotification({
    userId,
    type: 'code_issued',
    title: translation.title,
    message: translation.message,
    severity: 'info',
    metadata: { transferId, sequence },
  });
}

export async function notifyKycApproved(userId: string) {
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('kyc_approved', language);
  
  return await createUserNotification({
    userId,
    type: 'kyc_approved',
    title: translation.title,
    message: translation.message,
    severity: 'success',
  });
}

export async function notifyKycRejected(userId: string, reason: string) {
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('kyc_rejected', language);
  
  return await createUserNotification({
    userId,
    type: 'kyc_rejected',
    title: translation.title,
    message: translation.message,
    severity: 'error',
    metadata: { reason },
  });
}

export async function notifyFeeAdded(userId: string, feeId: string, amount: string, reason: string) {
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('fee_added', language);
  
  return await createUserNotification({
    userId,
    type: 'fee_added',
    title: translation.title,
    message: translation.message,
    severity: 'warning',
    metadata: { feeId, amount, reason },
  });
}

export async function notifyAccountStatusChanged(userId: string, newStatus: string, reason?: string) {
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('account_status_changed', language);
  
  return await createUserNotification({
    userId,
    type: 'account_status_changed',
    title: translation.title,
    message: translation.message,
    severity: newStatus === 'active' ? 'success' : 'warning',
    metadata: { newStatus, reason },
  });
}

export async function notifyLoanRequest(userId: string, loanId: string, amount: string, loanType: string) {
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('loan_request', language);
  
  return await createUserNotification({
    userId,
    type: 'loan_request',
    title: translation.title,
    message: translation.message,
    severity: 'success',
    metadata: { loanId, loanType, amount },
  });
}

export async function notifyLoanUnderReview(userId: string, loanId: string, amount: string) {
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('loan_under_review', language);
  
  return await createUserNotification({
    userId,
    type: 'loan_under_review',
    title: translation.title,
    message: translation.message,
    severity: 'info',
    metadata: { loanId, amount },
  });
}

export async function notifyLoanContractGenerated(userId: string, loanId: string, amount: string) {
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('loan_contract_generated', language);
  
  return await createUserNotification({
    userId,
    type: 'loan_contract_generated',
    title: translation.title,
    message: translation.message,
    severity: 'success',
    metadata: { loanId, amount },
  });
}

export async function notifyLoanContractSigned(userId: string, loanId: string, amount: string) {
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('loan_contract_signed', language);
  
  return await createUserNotification({
    userId,
    type: 'loan_contract_signed',
    title: translation.title,
    message: translation.message,
    severity: 'success',
    metadata: { loanId, amount },
  });
}

export async function notifyAdminMessage(userId: string, subject: string, severity: 'info' | 'success' | 'warning' | 'error' = 'info') {
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('admin_message', language, { subject });
  
  return await createUserNotification({
    userId,
    type: 'admin_message_sent',
    title: translation.title,
    message: translation.message,
    severity,
    metadata: { subject },
  });
}

export async function notifyTransferInitiated(userId: string, transferId: string, amount: string, recipientName: string) {
  const language = await getUserLanguage(userId);
  const translation = getNotificationTranslation('transfer_initiated', language);
  
  return await createUserNotification({
    userId,
    type: 'transfer_initiated',
    title: translation.title,
    message: translation.message,
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

export async function notifyAdminsSignedContractReceived(userId: string, userName: string, loanId: string, amount: string) {
  return await notifyAllAdmins({
    type: 'general',
    title: 'Contrat signé reçu',
    message: `${userName} a uploadé un contrat signé pour le prêt de ${amount}€. En attente de vérification.`,
    severity: 'info',
    metadata: { userId, userName, loanId, amount },
  });
}

export async function createAdminMessageLoanRequest(userId: string, loanType: string, amount: string) {
  return await storage.createAdminMessage({
    userId,
    transferId: null,
    type: 'loan_request',
    subject: 'Demande de prêt en attente de validation',
    content: `Votre demande de prêt ${loanType} de ${amount} EUR a été soumise et est en attente de validation par notre service. Nous vous contacterons dès que possible.`,
    severity: 'info',
    metadata: { loanType, amount },
  });
}

export async function createAdminMessageLoanApproved(userId: string, amount: string, contractGenerated: boolean) {
  const messageContent = contractGenerated
    ? `Félicitations! Votre demande de prêt de ${amount} EUR a été approuvée. Votre contrat est maintenant disponible. Veuillez le télécharger, le signer et le retourner pour débloquer les fonds.`
    : `Félicitations! Votre demande de prêt de ${amount} EUR a été approuvée. Votre contrat sera disponible sous peu. Vous recevrez une notification dès qu'il sera prêt.`;

  return await storage.createAdminMessage({
    userId,
    transferId: null,
    type: contractGenerated ? 'loan_contract_generated' : 'loan_approved',
    subject: 'Demande de prêt approuvée' + (contractGenerated ? ' - Contrat disponible' : ''),
    content: messageContent,
    severity: 'success',
    metadata: { amount, contractGenerated },
  });
}

export async function createAdminMessageLoanRejected(userId: string, amount: string, reason: string) {
  return await storage.createAdminMessage({
    userId,
    transferId: null,
    type: 'loan_rejected',
    subject: 'Demande de prêt refusée',
    content: `Nous sommes désolés de vous informer que votre demande de prêt de ${amount} EUR a été refusée. Raison: ${reason}`,
    severity: 'warning',
    metadata: { amount, reason },
  });
}

export async function createAdminMessageLoanFundsAvailable(userId: string, amount: string) {
  return await storage.createAdminMessage({
    userId,
    transferId: null,
    type: 'loan_funds_available',
    subject: 'Fonds disponibles - Contrat validé',
    content: `Vos fonds sont désormais disponibles. Vous pouvez initier votre transfert.`,
    severity: 'success',
    metadata: { amount },
  });
}

export async function createAdminMessageLoanContractSigned(userId: string, amount: string) {
  return await storage.createAdminMessage({
    userId,
    transferId: null,
    type: 'loan_contract_signed',
    subject: 'Contrat signé reçu - En attente de validation',
    content: `Votre contrat signé pour le prêt de ${amount} EUR a été reçu avec succès. Il est maintenant en cours de vérification par notre service. Vous serez notifié dès que les fonds seront débloqués.`,
    severity: 'info',
    metadata: { amount },
  });
}

export async function createAdminMessageTransferCompleted(userId: string, transferId: string, amount: string, recipient: string, recipientIban: string) {
  return await storage.createAdminMessage({
    userId,
    transferId,
    type: 'transfer_completed',
    subject: 'Transfert terminé avec succès',
    content: `
**Récapitulatif du transfert**

- Montant transféré: ${amount} €
- Bénéficiaire: ${recipient}
- IBAN: ${recipientIban}
- Référence: ${transferId}

**Disponibilité des fonds**
Les fonds seront disponibles sur le compte du bénéficiaire dans un délai de 24 à 72 heures ouvrées, selon les délais bancaires.

**Besoin d'aide ?**
En cas de problème ou de question concernant ce transfert, notre équipe est à votre disposition. Contactez-nous à tout moment.

Merci de votre confiance.`,
    severity: 'success',
    metadata: { transferId, amount, recipient, recipientIban },
  });
}

export async function createAdminMessageCodeIssued(userId: string, transferId: string, sequence: number, code: string) {
  return await storage.createAdminMessage({
    userId,
    transferId,
    type: 'code_issued',
    subject: `Code de validation pour transfert #${sequence}`,
    content: `Votre code de validation pour l'étape ${sequence} est: ${code}. Ce code a été pré-généré lors de la confirmation de votre contrat.`,
    severity: 'info',
    metadata: { transferId, sequence, code },
  });
}

export async function createAdminMessagePauseCodeIssued(userId: string, transferId: string, code: string, expiresInMinutes: number = 30) {
  return await storage.createAdminMessage({
    userId,
    transferId,
    type: 'pause_code_issued',
    subject: `Code de déblocage`,
    content: `Votre code de déblocage est: ${code}. Ce code expire dans ${expiresInMinutes} minutes.`,
    severity: 'info',
    metadata: { transferId, code, expiresInMinutes },
  });
}
