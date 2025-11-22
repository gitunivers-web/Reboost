export type Language = 'fr' | 'en' | 'es' | 'pt' | 'it' | 'de' | 'nl';

interface NotificationContent {
  title: string;
  message: string;
}

type NotificationTranslations = {
  loan_approved: NotificationContent;
  loan_rejected: NotificationContent;
  loan_funds_available: NotificationContent;
  loan_disbursed: NotificationContent;
  transfer_completed: NotificationContent;
  transfer_approved: NotificationContent;
  transfer_suspended: NotificationContent;
  transfer_initiated: NotificationContent;
  code_issued: NotificationContent;
  kyc_approved: NotificationContent;
  kyc_rejected: NotificationContent;
  fee_added: NotificationContent;
  account_status_changed: NotificationContent;
  loan_request: NotificationContent;
  loan_under_review: NotificationContent;
  loan_contract_generated: NotificationContent;
  loan_contract_signed: NotificationContent;
  admin_message: NotificationContent;
};

function interpolate(template: string, params: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

export const notificationTranslations: Record<Language, NotificationTranslations> = {
  fr: {
    loan_approved: {
      title: 'Demande de prêt approuvée',
      message: 'Votre demande de prêt a été approuvée. Vous pouvez maintenant procéder à la signature du contrat.',
    },
    loan_rejected: {
      title: 'Demande de prêt rejetée',
      message: 'Votre demande de prêt a été rejetée.',
    },
    loan_funds_available: {
      title: 'Fonds disponibles',
      message: 'Vos fonds sont désormais disponibles. Vous pouvez initier votre transfert.',
    },
    loan_disbursed: {
      title: 'Fonds débloqués',
      message: 'Les fonds de votre prêt ont été débloqués avec succès sur votre compte.',
    },
    transfer_completed: {
      title: 'Transfert terminé',
      message: 'Votre transfert a été effectué avec succès.',
    },
    transfer_approved: {
      title: 'Transfert approuvé',
      message: 'Votre demande de transfert a été approuvée par l\'administration.',
    },
    transfer_suspended: {
      title: 'Transfert suspendu',
      message: 'Votre transfert a été suspendu.',
    },
    transfer_initiated: {
      title: 'Transfert initié',
      message: 'Votre demande de transfert a été initiée et est en cours de traitement.',
    },
    code_issued: {
      title: 'Code de validation émis',
      message: 'Un nouveau code de validation a été émis pour votre transfert. Vérifiez vos e-mails.',
    },
    kyc_approved: {
      title: 'Documents KYC approuvés',
      message: 'Vos documents ont été vérifiés et approuvés. Votre compte est maintenant actif.',
    },
    kyc_rejected: {
      title: 'Documents KYC rejetés',
      message: 'Vos documents ont été rejetés. Veuillez soumettre de nouveaux documents.',
    },
    fee_added: {
      title: 'Nouveaux frais',
      message: 'De nouveaux frais ont été ajoutés à votre compte.',
    },
    account_status_changed: {
      title: 'Statut du compte modifié',
      message: 'Le statut de votre compte a été mis à jour.',
    },
    loan_request: {
      title: 'Demande de prêt soumise',
      message: 'Votre demande de prêt a été soumise avec succès. Nous examinerons votre demande sous peu.',
    },
    loan_under_review: {
      title: 'Demande en cours d\'examen',
      message: 'Votre demande de prêt est actuellement examinée par notre équipe.',
    },
    loan_contract_generated: {
      title: 'Contrat de prêt disponible',
      message: 'Votre contrat de prêt est maintenant disponible. Veuillez le télécharger, le signer et le retourner.',
    },
    loan_contract_signed: {
      title: 'Contrat signé reçu',
      message: 'Nous avons reçu votre contrat signé. Votre prêt sera traité sous peu.',
    },
    admin_message: {
      title: 'Nouveau message administrateur',
      message: '{subject}',
    },
  },
  en: {
    loan_approved: {
      title: 'Loan Approved',
      message: 'Your loan application has been approved. You can now proceed to contract signing.',
    },
    loan_rejected: {
      title: 'Loan Rejected',
      message: 'Your loan application has been rejected.',
    },
    loan_funds_available: {
      title: 'Funds Available',
      message: 'Your funds are now available. You can initiate your transfer.',
    },
    loan_disbursed: {
      title: 'Funds Disbursed',
      message: 'Your loan funds have been successfully disbursed to your account.',
    },
    transfer_completed: {
      title: 'Transfer Completed',
      message: 'Your transfer has been completed successfully.',
    },
    transfer_approved: {
      title: 'Transfer Approved',
      message: 'Your transfer request has been approved by the administration.',
    },
    transfer_suspended: {
      title: 'Transfer Suspended',
      message: 'Your transfer has been suspended.',
    },
    transfer_initiated: {
      title: 'Transfer Initiated',
      message: 'Your transfer request has been initiated and is being processed.',
    },
    code_issued: {
      title: 'Validation Code Issued',
      message: 'A new validation code has been issued for your transfer. Check your emails.',
    },
    kyc_approved: {
      title: 'KYC Documents Approved',
      message: 'Your documents have been verified and approved. Your account is now active.',
    },
    kyc_rejected: {
      title: 'KYC Documents Rejected',
      message: 'Your documents have been rejected. Please submit new documents.',
    },
    fee_added: {
      title: 'New Fee',
      message: 'New fees have been added to your account.',
    },
    account_status_changed: {
      title: 'Account Status Changed',
      message: 'Your account status has been updated.',
    },
    loan_request: {
      title: 'Loan Request Submitted',
      message: 'Your loan request has been successfully submitted. We will review your application shortly.',
    },
    loan_under_review: {
      title: 'Application Under Review',
      message: 'Your loan application is currently being reviewed by our team.',
    },
    loan_contract_generated: {
      title: 'Loan Contract Available',
      message: 'Your loan contract is now available. Please download it, sign it, and return it.',
    },
    loan_contract_signed: {
      title: 'Signed Contract Received',
      message: 'We have received your signed contract. Your loan will be processed shortly.',
    },
    admin_message: {
      title: 'New Admin Message',
      message: '{subject}',
    },
  },
  es: {
    loan_approved: {
      title: 'Préstamo Aprobado',
      message: 'Su solicitud de préstamo ha sido aprobada. Ahora puede proceder a firmar el contrato.',
    },
    loan_rejected: {
      title: 'Préstamo Rechazado',
      message: 'Su solicitud de préstamo ha sido rechazada.',
    },
    loan_funds_available: {
      title: 'Fondos Disponibles',
      message: 'Sus fondos ya están disponibles. Puede iniciar su transferencia.',
    },
    loan_disbursed: {
      title: 'Fondos Desembolsados',
      message: 'Los fondos de su préstamo han sido desembolsados exitosamente en su cuenta.',
    },
    transfer_completed: {
      title: 'Transferencia Completada',
      message: 'Su transferencia se ha completado con éxito.',
    },
    transfer_approved: {
      title: 'Transferencia Aprobada',
      message: 'Su solicitud de transferencia ha sido aprobada por la administración.',
    },
    transfer_suspended: {
      title: 'Transferencia Suspendida',
      message: 'Su transferencia ha sido suspendida.',
    },
    code_issued: {
      title: 'Código de Validación Emitido',
      message: 'Se ha emitido un nuevo código de validación para su transferencia. Revise sus correos electrónicos.',
    },
    kyc_approved: {
      title: 'Documentos KYC Aprobados',
      message: 'Sus documentos han sido verificados y aprobados. Su cuenta ahora está activa.',
    },
    kyc_rejected: {
      title: 'Documentos KYC Rechazados',
      message: 'Sus documentos han sido rechazados. Por favor, envíe nuevos documentos.',
    },
    fee_added: {
      title: 'Nuevo Cargo',
      message: 'Se han agregado nuevos cargos a su cuenta.',
    },
    account_status_changed: {
      title: 'Estado de Cuenta Modificado',
      message: 'El estado de su cuenta ha sido actualizado.',
    },
    loan_request: {
      title: 'Solicitud de Préstamo Enviada',
      message: 'Su solicitud de préstamo ha sido enviada con éxito. Revisaremos su solicitud en breve.',
    },
    loan_under_review: {
      title: 'Solicitud en Revisión',
      message: 'Su solicitud de préstamo está siendo revisada por nuestro equipo.',
    },
    loan_contract_generated: {
      title: 'Contrato de Préstamo Disponible',
      message: 'Su contrato de préstamo ya está disponible. Por favor, descárguelo, fírmelo y devuélvalo.',
    },
    loan_contract_signed: {
      title: 'Contrato Firmado Recibido',
      message: 'Hemos recibido su contrato firmado. Su préstamo será procesado en breve.',
    },
    transfer_initiated: {
      title: 'Transferencia Iniciada',
      message: 'Su solicitud de transferencia ha sido iniciada y está siendo procesada.',
    },
    admin_message: {
      title: 'Nuevo Mensaje del Administrador',
      message: '{subject}',
    },
  },
  pt: {
    loan_approved: {
      title: 'Empréstimo Aprovado',
      message: 'Sua solicitação de empréstimo foi aprovada. Agora você pode proceder à assinatura do contrato.',
    },
    loan_rejected: {
      title: 'Empréstimo Rejeitado',
      message: 'Sua solicitação de empréstimo foi rejeitada.',
    },
    loan_funds_available: {
      title: 'Fundos Disponíveis',
      message: 'Seus fundos já estão disponíveis. Você pode iniciar sua transferência.',
    },
    loan_disbursed: {
      title: 'Fundos Desembolsados',
      message: 'Os fundos do seu empréstimo foram desembolsados com sucesso em sua conta.',
    },
    transfer_completed: {
      title: 'Transferência Concluída',
      message: 'Sua transferência foi concluída com sucesso.',
    },
    transfer_approved: {
      title: 'Transferência Aprovada',
      message: 'Sua solicitação de transferência foi aprovada pela administração.',
    },
    transfer_suspended: {
      title: 'Transferência Suspensa',
      message: 'Sua transferência foi suspensa.',
    },
    code_issued: {
      title: 'Código de Validação Emitido',
      message: 'Um novo código de validação foi emitido para sua transferência. Verifique seus e-mails.',
    },
    kyc_approved: {
      title: 'Documentos KYC Aprovados',
      message: 'Seus documentos foram verificados e aprovados. Sua conta agora está ativa.',
    },
    kyc_rejected: {
      title: 'Documentos KYC Rejeitados',
      message: 'Seus documentos foram rejeitados. Por favor, envie novos documentos.',
    },
    fee_added: {
      title: 'Nova Taxa',
      message: 'Novas taxas foram adicionadas à sua conta.',
    },
    account_status_changed: {
      title: 'Status da Conta Alterado',
      message: 'O status da sua conta foi atualizado.',
    },
    loan_request: {
      title: 'Solicitação de Empréstimo Enviada',
      message: 'Sua solicitação de empréstimo foi enviada com sucesso. Revisaremos sua solicitação em breve.',
    },
    loan_under_review: {
      title: 'Solicitação em Revisão',
      message: 'Sua solicitação de empréstimo está sendo revisada por nossa equipe.',
    },
    loan_contract_generated: {
      title: 'Contrato de Empréstimo Disponível',
      message: 'Seu contrato de empréstimo já está disponível. Por favor, baixe, assine e devolva.',
    },
    loan_contract_signed: {
      title: 'Contrato Assinado Recebido',
      message: 'Recebemos seu contrato assinado. Seu empréstimo será processado em breve.',
    },
    transfer_initiated: {
      title: 'Transferência Iniciada',
      message: 'Sua solicitação de transferência foi iniciada e está sendo processada.',
    },
    admin_message: {
      title: 'Nova Mensagem do Administrador',
      message: '{subject}',
    },
  },
  it: {
    loan_approved: {
      title: 'Prestito Approvato',
      message: 'La tua richiesta di prestito è stata approvata. Ora puoi procedere alla firma del contratto.',
    },
    loan_rejected: {
      title: 'Prestito Rifiutato',
      message: 'La tua richiesta di prestito è stata rifiutata.',
    },
    loan_funds_available: {
      title: 'Fondi Disponibili',
      message: 'I tuoi fondi sono ora disponibili. Puoi avviare il tuo trasferimento.',
    },
    loan_disbursed: {
      title: 'Fondi Erogati',
      message: 'I fondi del tuo prestito sono stati erogati con successo sul tuo conto.',
    },
    transfer_completed: {
      title: 'Trasferimento Completato',
      message: 'Il tuo trasferimento è stato completato con successo.',
    },
    transfer_approved: {
      title: 'Trasferimento Approvato',
      message: 'La tua richiesta di trasferimento è stata approvata dall\'amministrazione.',
    },
    transfer_suspended: {
      title: 'Trasferimento Sospeso',
      message: 'Il tuo trasferimento è stato sospeso.',
    },
    code_issued: {
      title: 'Codice di Convalida Emesso',
      message: 'È stato emesso un nuovo codice di convalida per il tuo trasferimento. Controlla le tue email.',
    },
    kyc_approved: {
      title: 'Documenti KYC Approvati',
      message: 'I tuoi documenti sono stati verificati e approvati. Il tuo account è ora attivo.',
    },
    kyc_rejected: {
      title: 'Documenti KYC Rifiutati',
      message: 'I tuoi documenti sono stati rifiutati. Si prega di inviare nuovi documenti.',
    },
    fee_added: {
      title: 'Nuova Commissione',
      message: 'Nuove commissioni sono state aggiunte al tuo account.',
    },
    account_status_changed: {
      title: 'Stato Account Modificato',
      message: 'Lo stato del tuo account è stato aggiornato.',
    },
    loan_request: {
      title: 'Richiesta di Prestito Inviata',
      message: 'La tua richiesta di prestito è stata inviata con successo. Esamineremo la tua richiesta a breve.',
    },
    loan_under_review: {
      title: 'Richiesta in Revisione',
      message: 'La tua richiesta di prestito è attualmente in fase di revisione dal nostro team.',
    },
    loan_contract_generated: {
      title: 'Contratto di Prestito Disponibile',
      message: 'Il tuo contratto di prestito è ora disponibile. Si prega di scaricarlo, firmarlo e restituirlo.',
    },
    loan_contract_signed: {
      title: 'Contratto Firmato Ricevuto',
      message: 'Abbiamo ricevuto il tuo contratto firmato. Il tuo prestito sarà elaborato a breve.',
    },
    transfer_initiated: {
      title: 'Trasferimento Iniziato',
      message: 'La tua richiesta di trasferimento è stata avviata ed è in corso di elaborazione.',
    },
    admin_message: {
      title: 'Nuovo Messaggio Amministratore',
      message: '{subject}',
    },
  },
  de: {
    loan_approved: {
      title: 'Kredit Genehmigt',
      message: 'Ihr Kreditantrag wurde genehmigt. Sie können nun mit der Vertragsunterzeichnung fortfahren.',
    },
    loan_rejected: {
      title: 'Kredit Abgelehnt',
      message: 'Ihr Kreditantrag wurde abgelehnt.',
    },
    loan_funds_available: {
      title: 'Mittel Verfügbar',
      message: 'Ihre Mittel sind jetzt verfügbar. Sie können Ihre Überweisung initiieren.',
    },
    loan_disbursed: {
      title: 'Mittel Ausgezahlt',
      message: 'Ihre Kreditmittel wurden erfolgreich auf Ihr Konto ausgezahlt.',
    },
    transfer_completed: {
      title: 'Überweisung Abgeschlossen',
      message: 'Ihre Überweisung wurde erfolgreich abgeschlossen.',
    },
    transfer_approved: {
      title: 'Überweisung Genehmigt',
      message: 'Ihr Überweisungsantrag wurde von der Verwaltung genehmigt.',
    },
    transfer_suspended: {
      title: 'Überweisung Ausgesetzt',
      message: 'Ihre Überweisung wurde ausgesetzt.',
    },
    code_issued: {
      title: 'Bestätigungscode Ausgestellt',
      message: 'Ein neuer Bestätigungscode wurde für Ihre Überweisung ausgestellt. Überprüfen Sie Ihre E-Mails.',
    },
    kyc_approved: {
      title: 'KYC-Dokumente Genehmigt',
      message: 'Ihre Dokumente wurden überprüft und genehmigt. Ihr Konto ist jetzt aktiv.',
    },
    kyc_rejected: {
      title: 'KYC-Dokumente Abgelehnt',
      message: 'Ihre Dokumente wurden abgelehnt. Bitte reichen Sie neue Dokumente ein.',
    },
    fee_added: {
      title: 'Neue Gebühr',
      message: 'Neue Gebühren wurden Ihrem Konto hinzugefügt.',
    },
    account_status_changed: {
      title: 'Kontostatus Geändert',
      message: 'Ihr Kontostatus wurde aktualisiert.',
    },
    loan_request: {
      title: 'Kreditantrag Eingereicht',
      message: 'Ihr Kreditantrag wurde erfolgreich eingereicht. Wir werden Ihren Antrag in Kürze prüfen.',
    },
    loan_under_review: {
      title: 'Antrag in Prüfung',
      message: 'Ihr Kreditantrag wird derzeit von unserem Team geprüft.',
    },
    loan_contract_generated: {
      title: 'Kreditvertrag Verfügbar',
      message: 'Ihr Kreditvertrag ist jetzt verfügbar. Bitte laden Sie ihn herunter, unterschreiben und senden Sie ihn zurück.',
    },
    loan_contract_signed: {
      title: 'Unterschriebener Vertrag Erhalten',
      message: 'Wir haben Ihren unterschriebenen Vertrag erhalten. Ihr Kredit wird in Kürze bearbeitet.',
    },
    transfer_initiated: {
      title: 'Überweisung Eingeleitet',
      message: 'Ihr Überweisungsantrag wurde eingeleitet und wird bearbeitet.',
    },
    admin_message: {
      title: 'Neue Admin-Nachricht',
      message: '{subject}',
    },
  },
  nl: {
    loan_approved: {
      title: 'Lening Goedgekeurd',
      message: 'Uw leningaanvraag is goedgekeurd. U kunt nu overgaan tot contractondertekening.',
    },
    loan_rejected: {
      title: 'Lening Afgewezen',
      message: 'Uw leningaanvraag is afgewezen.',
    },
    loan_funds_available: {
      title: 'Fondsen Beschikbaar',
      message: 'Uw fondsen zijn nu beschikbaar. U kunt uw overboeking starten.',
    },
    loan_disbursed: {
      title: 'Fondsen Uitbetaald',
      message: 'Uw leningsfondsen zijn succesvol uitbetaald op uw rekening.',
    },
    transfer_completed: {
      title: 'Overboeking Voltooid',
      message: 'Uw overboeking is succesvol voltooid.',
    },
    transfer_approved: {
      title: 'Overboeking Goedgekeurd',
      message: 'Uw overboekingsverzoek is goedgekeurd door de administratie.',
    },
    transfer_suspended: {
      title: 'Overboeking Opgeschort',
      message: 'Uw overboeking is opgeschort.',
    },
    code_issued: {
      title: 'Validatiecode Uitgegeven',
      message: 'Een nieuwe validatiecode is uitgegeven voor uw overboeking. Controleer uw e-mails.',
    },
    kyc_approved: {
      title: 'KYC-Documenten Goedgekeurd',
      message: 'Uw documenten zijn geverifieerd en goedgekeurd. Uw account is nu actief.',
    },
    kyc_rejected: {
      title: 'KYC-Documenten Afgewezen',
      message: 'Uw documenten zijn afgewezen. Dien alstublieft nieuwe documenten in.',
    },
    fee_added: {
      title: 'Nieuwe Kosten',
      message: 'Nieuwe kosten zijn toegevoegd aan uw account.',
    },
    account_status_changed: {
      title: 'Accountstatus Gewijzigd',
      message: 'Uw accountstatus is bijgewerkt.',
    },
    loan_request: {
      title: 'Leningaanvraag Ingediend',
      message: 'Uw leningaanvraag is succesvol ingediend. We zullen uw aanvraag binnenkort beoordelen.',
    },
    loan_under_review: {
      title: 'Aanvraag in Beoordeling',
      message: 'Uw leningaanvraag wordt momenteel beoordeeld door ons team.',
    },
    loan_contract_generated: {
      title: 'Leningcontract Beschikbaar',
      message: 'Uw leningcontract is nu beschikbaar. Download, onderteken en retourneer het alstublieft.',
    },
    loan_contract_signed: {
      title: 'Ondertekend Contract Ontvangen',
      message: 'We hebben uw ondertekende contract ontvangen. Uw lening wordt binnenkort verwerkt.',
    },
    transfer_initiated: {
      title: 'Overboeking Geïnitieerd',
      message: 'Uw overboekingsverzoek is geïnitieerd en wordt verwerkt.',
    },
    admin_message: {
      title: 'Nieuw Beheerdersbericht',
      message: '{subject}',
    },
  },
};

export function getNotificationTranslation(
  type: keyof NotificationTranslations,
  language: Language = 'fr',
  params?: Record<string, any>
): NotificationContent {
  const translation = notificationTranslations[language][type] || notificationTranslations['fr'][type];
  
  if (!params) {
    return translation;
  }
  
  return {
    title: interpolate(translation.title, params),
    message: interpolate(translation.message, params),
  };
}
