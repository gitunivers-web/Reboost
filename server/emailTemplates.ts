function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export type Language = 'fr' | 'en' | 'es' | 'pt' | 'it' | 'de' | 'nl';
type TemplateType = 'verification' | 'welcome' | 'contract' | 'fundingRelease' | 'otp' | 'resetPassword' | 
  'loanRequestUser' | 'loanRequestAdmin' | 'kycUploadedAdmin' | 'loanApprovedUser' | 
  'transferInitiatedAdmin' | 'transferCodeUser' | 'transferCompletedUser' | 'transferCompletedAdmin' | 'transferCodesAdmin';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface VerificationVariables {
  fullName: string;
  verificationUrl: string;
  accountTypeText: string;
}

interface WelcomeVariables {
  fullName: string;
  accountTypeText: string;
  loginUrl: string;
}

interface ContractVariables {
  fullName: string;
  amount: string;
  loanId: string;
  contractUrl: string;
  fromEmail: string;
}

interface FundingReleaseVariables {
  fullName: string;
  amount: string;
  loanId: string;
}

interface OtpVariables {
  fullName: string;
  otpCode: string;
}

interface ResetPasswordVariables {
  fullName: string;
  resetUrl: string;
}

interface LoanRequestUserVariables {
  fullName: string;
  amount: string;
  loanType: string;
  reference: string;
  dashboardUrl: string;
}

interface LoanRequestAdminVariables {
  fullName: string;
  email: string;
  amount: string;
  loanType: string;
  reference: string;
  userId: string;
  reviewUrl: string;
}

interface KycUploadedAdminVariables {
  fullName: string;
  email: string;
  documentType: string;
  loanType: string;
  userId: string;
  reviewUrl: string;
}

interface LoanApprovedUserVariables {
  fullName: string;
  amount: string;
  loanType: string;
  reference: string;
  loginUrl: string;
}

interface TransferInitiatedAdminVariables {
  fullName: string;
  email: string;
  amount: string;
  recipient: string;
  transferId: string;
  userId: string;
  reviewUrl: string;
}

interface TransferCodeUserVariables {
  fullName: string;
  amount: string;
  recipient: string;
  code: string;
  codeSequence: string;
  totalCodes: string;
}

interface TransferCompletedUserVariables {
  fullName: string;
  amount: string;
  recipient: string;
  recipientIban: string;
  transferId: string;
  supportEmail: string;
}

interface TransferCompletedAdminVariables {
  fullName: string;
  email: string;
  amount: string;
  recipient: string;
  recipientIban: string;
  transferId: string;
  userId: string;
  completedAt: string;
  totalValidations: string;
  reviewUrl: string;
}

interface TransferCodesAdminVariables {
  fullName: string;
  amount: string;
  loanId: string;
  codes: Array<{ sequence: number; code: string; pausePercent: number; context: string }>;
}

type TemplateVariables = VerificationVariables | WelcomeVariables | ContractVariables | FundingReleaseVariables | OtpVariables | ResetPasswordVariables |
  LoanRequestUserVariables | LoanRequestAdminVariables | KycUploadedAdminVariables | LoanApprovedUserVariables | 
  TransferInitiatedAdminVariables | TransferCodeUserVariables | TransferCompletedUserVariables | TransferCompletedAdminVariables | TransferCodesAdminVariables;

const translations = {
  fr: {
    accountTypes: {
      personal: "particulier",
      business: "professionnel/entreprise"
    },
    verification: {
      subject: "Vérifiez votre adresse email - ALTUS FINANCE GROUP",
      tagline: "Solutions de financement",
      greeting: "Bonjour",
      thankYou: "Merci de vous être inscrit sur ALTUS FINANCE GROUP en tant que",
      instruction: "Pour activer votre compte et accéder à nos services de financement, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :",
      buttonText: "Vérifier mon email",
      alternativeText: "Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :",
      disclaimerText: "Si vous n'avez pas créé de compte sur ALTUS FINANCE GROUP, vous pouvez ignorer cet email.",
      footer: "Tous droits réservés.",
      textVersion: {
        thankYou: "Merci de vous être inscrit sur ALTUS FINANCE GROUP en tant que",
        instruction: "Pour activer votre compte, veuillez vérifier votre adresse email en visitant ce lien :",
        disclaimer: "Si vous n'avez pas créé de compte sur ALTUS FINANCE GROUP, vous pouvez ignorer cet email.",
        signature: "ALTUS FINANCE GROUP - Solutions de financement"
      }
    },
    welcome: {
      subject: "Bienvenue sur ALTUS FINANCE GROUP !",
      headerTitle: "🎉 Bienvenue sur ALTUS FINANCE GROUP !",
      greeting: "Bonjour",
      verifiedMessage: "Votre email a été vérifié avec succès ! Votre compte",
      activeMessage: "est maintenant actif.",
      featuresIntro: "Vous pouvez dès à présent accéder à toutes nos fonctionnalités :",
      features: [
        "Demander un prêt personnel ou professionnel",
        "Gérer vos remboursements",
        "Effectuer des transferts",
        "Consulter votre tableau de bord"
      ],
      buttonText: "Se connecter",
      supportText: "Notre équipe est à votre disposition pour toute question.",
      footer: "Tous droits réservés."
    },
    contract: {
      subject: "Votre contrat de prêt est disponible - ALTUS FINANCE GROUP",
      headerTitle: "🎉 Félicitations !",
      headerSubtitle: "Votre prêt est approuvé",
      greeting: "Bonjour",
      approvedMessage: "Excellente nouvelle ! Votre demande de prêt de",
      approvedMessage2: "a été approuvée.",
      contractReadyTitle: "📄 Votre contrat de prêt est prêt",
      referenceLabel: "Référence:",
      nextStepsTitle: "Prochaines étapes :",
      step1Title: "Télécharger le contrat",
      step1Text: "Téléchargez et lisez attentivement votre contrat de prêt",
      step2Title: "Signer le document",
      step2Text: "Imprimez, signez avec la mention \"Lu et approuvé\" suivie de votre signature",
      step3Title: "Retourner le contrat signé",
      step3Text: "Téléchargez le document signé depuis votre espace client ou envoyez-le par email à",
      downloadButton: "📥 Télécharger le contrat",
      importantTitle: "⚠️ Important :",
      importantMessage: "Les fonds seront débloqués dans un délai allant de quelques minutes à 24 heures maximum.",
      accessNote: "Vous pouvez également accéder à votre contrat depuis votre espace client à tout moment.",
      contactText: "Des questions ? Contactez-nous à",
      footer: "Tous droits réservés."
    },
    fundingRelease: {
      subject: "Vos fonds ont été débloqués - ALTUS FINANCE GROUP",
      headerTitle: "✅ Fonds débloqués",
      headerSubtitle: "Votre argent est disponible",
      greeting: "Bonjour",
      releaseMessage: "Excellente nouvelle ! Les fonds de votre prêt de",
      releaseMessage2: "ont été débloqués avec succès.",
      referenceLabel: "Référence du prêt:",
      availabilityTitle: "💳 Disponibilité des fonds",
      availabilityText: "Les fonds sont maintenant disponibles sur votre compte et peuvent être utilisés immédiatement.",
      nextStepsTitle: "Que faire maintenant :",
      step1: "Consultez votre solde dans votre tableau de bord",
      step2: "Effectuez un transfert vers votre compte bancaire",
      step3: "Gérez vos échéances de remboursement",
      dashboardButton: "Accéder au tableau de bord",
      reminderTitle: "📅 Rappel important",
      reminderText: "N'oubliez pas vos échéances de remboursement. Vous pouvez consulter le calendrier complet dans votre espace client.",
      supportText: "Notre équipe reste à votre disposition pour toute question.",
      contactText: "Des questions ? Contactez-nous à",
      footer: "Tous droits réservés."
    },
    otp: {
      subject: "Code de vérification - ALTUS FINANCE GROUP",
      headerTitle: "🔐 Authentification à deux facteurs",
      greeting: "Bonjour",
      codeTitle: "Votre code de vérification",
      instruction: "Utilisez le code ci-dessous pour vous connecter à votre compte ALTUS FINANCE GROUP :",
      expirationText: "Ce code expirera dans 5 minutes.",
      securityWarning: "⚠️ Pour votre sécurité, ne partagez jamais ce code avec quiconque. Notre équipe ne vous demandera jamais ce code.",
      notYouText: "Si vous n'avez pas demandé ce code, ignorez cet email et votre compte restera sécurisé.",
      footer: "Tous droits réservés."
    },
    loanRequestUser: {
      subject: "Votre demande de prêt a été reçue - ALTUS FINANCE GROUP",
      headerTitle: "✅ Demande de prêt reçue",
      greeting: "Bonjour",
      confirmationMessage: "Nous avons bien reçu votre demande de prêt",
      confirmationMessage2: "pour un montant de",
      referenceLabel: "Référence de la demande:",
      nextStepsTitle: "Prochaines étapes :",
      step1: "Notre équipe examine votre dossier",
      step2: "Vous recevrez une réponse dans les 24-48 heures",
      step3: "Si des documents supplémentaires sont nécessaires, nous vous contacterons",
      dashboardText: "Vous pouvez suivre l'état de votre demande depuis votre tableau de bord.",
      dashboardButton: "Accéder à mon tableau de bord",
      supportText: "Notre équipe reste à votre disposition pour toute question.",
      footer: "Tous droits réservés."
    },
    loanRequestAdmin: {
      subject: "Nouvelle demande de prêt - ALTUS FINANCE GROUP",
      headerTitle: "📋 Nouvelle demande de prêt",
      message: "Une nouvelle demande de prêt a été soumise et nécessite votre attention.",
      applicantLabel: "Demandeur:",
      emailLabel: "Email:",
      amountLabel: "Montant demandé:",
      loanTypeLabel: "Type de prêt:",
      referenceLabel: "Référence:",
      userIdLabel: "ID utilisateur:",
      actionButton: "Examiner la demande",
      footer: "Tous droits réservés."
    },
    kycUploadedAdmin: {
      subject: "Nouveau document KYC uploadé - ALTUS FINANCE GROUP",
      headerTitle: "📄 Nouveau document KYC",
      message: "Un nouveau document KYC a été uploadé et nécessite votre vérification.",
      userLabel: "Utilisateur:",
      emailLabel: "Email:",
      documentTypeLabel: "Type de document:",
      loanTypeLabel: "Type de prêt:",
      userIdLabel: "ID utilisateur:",
      actionButton: "Vérifier le document",
      footer: "Tous droits réservés."
    },
    loanApprovedUser: {
      subject: "Félicitations ! Votre prêt est approuvé - ALTUS FINANCE GROUP",
      headerTitle: "🎉 Félicitations !",
      headerSubtitle: "Votre prêt est approuvé",
      greeting: "Bonjour",
      approvalMessage: "Excellente nouvelle ! Votre demande de prêt de",
      approvalMessage2: "a été approuvée.",
      referenceLabel: "Référence:",
      nextStepsTitle: "Prochaines étapes :",
      step1: "Téléchargez votre contrat de prêt depuis votre espace client",
      step2: "Signez le contrat et retournez-le nous",
      step3: "Les fonds seront débloqués sous 24 heures après réception du contrat signé",
      loginButton: "Accéder à mon espace client",
      importantTitle: "⚠️ Important :",
      importantMessage: "Vous devez signer et retourner le contrat pour que les fonds soient débloqués.",
      supportText: "Notre équipe reste à votre disposition pour toute question.",
      footer: "Tous droits réservés."
    },
    transferInitiatedAdmin: {
      subject: "Nouveau transfert initié - ALTUS FINANCE GROUP",
      headerTitle: "💸 Nouveau transfert initié",
      message: "Un nouveau transfert a été initié et nécessite votre attention.",
      userLabel: "Utilisateur:",
      emailLabel: "Email:",
      amountLabel: "Montant:",
      recipientLabel: "Bénéficiaire:",
      transferIdLabel: "ID transfert:",
      userIdLabel: "ID utilisateur:",
      actionButton: "Voir le transfert",
      footer: "Tous droits réservés."
    },
    transferCodeUser: {
      subject: "Code de validation pour votre transfert - ALTUS FINANCE GROUP",
      headerTitle: "🔐 Code de validation",
      greeting: "Bonjour",
      transferInfoTitle: "Détails du transfert",
      amountLabel: "Montant:",
      recipientLabel: "Bénéficiaire:",
      codeTitle: "Votre code de validation",
      codeSequence: "Code",
      codeOf: "sur",
      instruction: "Utilisez le code ci-dessous pour valider votre transfert :",
      expirationText: "Ce code expirera dans 15 minutes.",
      securityWarning: "⚠️ Pour votre sécurité, ne partagez jamais ce code avec quiconque. Notre équipe ne vous demandera jamais ce code.",
      notYouText: "Si vous n'avez pas initié ce transfert, contactez-nous immédiatement.",
      footer: "Tous droits réservés."
    },
    transferCompletedUser: {
      subject: "Votre transfert est terminé - ALTUS FINANCE GROUP",
      headerTitle: "✅ Transfert terminé avec succès",
      greeting: "Bonjour",
      congratulationsMessage: "Votre transfert a été complété avec succès après validation de tous les codes de sécurité.",
      summaryTitle: "📋 Récapitulatif du transfert",
      amountLabel: "Montant transféré:",
      recipientLabel: "Bénéficiaire:",
      ibanLabel: "IBAN du bénéficiaire:",
      referenceLabel: "Référence du transfert:",
      availabilityTitle: "⏱️ Disponibilité des fonds",
      availabilityMessage: "Les fonds seront disponibles sur le compte du bénéficiaire dans un délai de 24 à 72 heures ouvrées, selon les délais bancaires.",
      supportTitle: "💬 Besoin d'aide ?",
      supportMessage: "Si vous rencontrez le moindre problème ou avez des questions concernant ce transfert, notre équipe est à votre disposition:",
      supportEmail: "Contactez-nous à:",
      thanksMessage: "Merci de votre confiance.",
      footer: "Tous droits réservés."
    },
    transferCodesAdmin: {
      subject: "Codes de transfert générés - ALTUS FINANCE GROUP",
      headerTitle: "🔐 Codes de validation de transfert générés",
      message: "Les codes de transfert ont été générés automatiquement pour le prêt suivant:",
      userLabel: "Utilisateur:",
      amountLabel: "Montant du prêt:",
      loanIdLabel: "Référence du prêt:",
      codesTitle: "📋 Liste des codes de validation",
      codeInstruction: "Transmettez ces codes manuellement à l'utilisateur au moment approprié. Le transfert se mettra automatiquement en pause aux pourcentages indiqués.",
      sequenceLabel: "Code",
      pauseLabel: "Pause à",
      contextLabel: "Type",
      importantTitle: "⚠️ Important:",
      importantMessage: "Ces codes sont confidentiels et ne doivent JAMAIS être envoyés automatiquement. Vous devez les transmettre manuellement à l'utilisateur un par un, au fur et à mesure de la progression du transfert.",
      footer: "Tous droits réservés."
    },
    transferCompletedAdmin: {
      subject: "Rapport de transfert complété - ALTUS FINANCE GROUP",
      headerTitle: "📊 Transfert complété - Rapport administrateur",
      message: "Un transfert a été complété avec succès. Voici le rapport détaillé:",
      userInfoTitle: "👤 Informations utilisateur",
      userLabel: "Utilisateur:",
      emailLabel: "Email:",
      userIdLabel: "ID utilisateur:",
      transferInfoTitle: "💸 Détails du transfert",
      amountLabel: "Montant:",
      recipientLabel: "Bénéficiaire:",
      ibanLabel: "IBAN:",
      transferIdLabel: "ID transfert:",
      progressTitle: "✅ Progression et validation",
      validationsLabel: "Codes validés:",
      completedAtLabel: "Complété le:",
      actionButton: "Voir les détails complets",
      footer: "Tous droits réservés."
    }
  },
  en: {
    accountTypes: {
      personal: "individual/personal",
      business: "business/professional"
    },
    verification: {
      subject: "Verify your email address - ALTUS FINANCE GROUP",
      tagline: "Financing Solutions",
      greeting: "Hello",
      thankYou: "Thank you for signing up on ALTUS FINANCE GROUP as a",
      instruction: "To activate your account and access our financing services, please verify your email address by clicking the button below:",
      buttonText: "Verify my email",
      alternativeText: "If the button doesn't work, copy and paste this link into your browser:",
      disclaimerText: "If you didn't create an account on ALTUS FINANCE GROUP, you can ignore this email.",
      footer: "All rights reserved.",
      textVersion: {
        thankYou: "Thank you for signing up on ALTUS FINANCE GROUP as a",
        instruction: "To activate your account, please verify your email address by visiting this link:",
        disclaimer: "If you didn't create an account on ALTUS FINANCE GROUP, you can ignore this email.",
        signature: "ALTUS FINANCE GROUP - Financing Solutions"
      }
    },
    welcome: {
      subject: "Welcome to ALTUS FINANCE GROUP!",
      headerTitle: "🎉 Welcome to ALTUS FINANCE GROUP!",
      greeting: "Hello",
      verifiedMessage: "Your email has been successfully verified! Your",
      activeMessage: "account is now active.",
      featuresIntro: "You can now access all our features:",
      features: [
        "Request a personal or business loan",
        "Manage your repayments",
        "Make transfers",
        "Access your dashboard"
      ],
      buttonText: "Log in",
      supportText: "Our team is available for any questions.",
      footer: "All rights reserved."
    },
    contract: {
      subject: "Your loan contract is available - ALTUS FINANCE GROUP",
      headerTitle: "🎉 Congratulations!",
      headerSubtitle: "Your loan is approved",
      greeting: "Hello",
      approvedMessage: "Great news! Your loan request for",
      approvedMessage2: "has been approved.",
      contractReadyTitle: "📄 Your loan contract is ready",
      referenceLabel: "Reference:",
      nextStepsTitle: "Next steps:",
      step1Title: "Download the contract",
      step1Text: "Download and carefully read your loan contract",
      step2Title: "Sign the document",
      step2Text: "Print, sign with the mention \"Read and approved\" followed by your signature",
      step3Title: "Return the signed contract",
      step3Text: "Upload the signed document from your client area or send it by email to",
      downloadButton: "📥 Download contract",
      importantTitle: "⚠️ Important:",
      importantMessage: "Funds will be released within a few minutes to a maximum of 24 hours.",
      accessNote: "You can also access your contract from your client area at any time.",
      contactText: "Questions? Contact us at",
      footer: "All rights reserved."
    },
    fundingRelease: {
      subject: "Your funds have been released - ALTUS FINANCE GROUP",
      headerTitle: "✅ Funds Released",
      headerSubtitle: "Your money is available",
      greeting: "Hello",
      releaseMessage: "Great news! The funds from your loan of",
      releaseMessage2: "have been successfully released.",
      referenceLabel: "Loan reference:",
      availabilityTitle: "💳 Fund availability",
      availabilityText: "The funds are now available in your account and can be used immediately.",
      nextStepsTitle: "What to do now:",
      step1: "Check your balance in your dashboard",
      step2: "Make a transfer to your bank account",
      step3: "Manage your repayment schedule",
      dashboardButton: "Access dashboard",
      reminderTitle: "📅 Important reminder",
      reminderText: "Don't forget your repayment dates. You can view the complete schedule in your client area.",
      supportText: "Our team remains at your disposal for any questions.",
      contactText: "Questions? Contact us at",
      footer: "All rights reserved."
    },
    otp: {
      subject: "Verification Code - ALTUS FINANCE GROUP",
      headerTitle: "🔐 Two-Factor Authentication",
      greeting: "Hello",
      codeTitle: "Your verification code",
      instruction: "Use the code below to log in to your ALTUS FINANCE GROUP account:",
      expirationText: "This code will expire in 5 minutes.",
      securityWarning: "⚠️ For your security, never share this code with anyone. Our team will never ask you for this code.",
      notYouText: "If you didn't request this code, ignore this email and your account will remain secure.",
      footer: "All rights reserved."
    },
    loanRequestUser: {
      subject: "Your loan request has been received - ALTUS FINANCE GROUP",
      headerTitle: "✅ Loan request received",
      greeting: "Hello",
      confirmationMessage: "We have successfully received your loan request for",
      confirmationMessage2: "for an amount of",
      referenceLabel: "Request reference:",
      nextStepsTitle: "Next steps:",
      step1: "Our team is reviewing your application",
      step2: "You will receive a response within 24-48 hours",
      step3: "If additional documents are needed, we will contact you",
      dashboardText: "You can track the status of your request from your dashboard.",
      dashboardButton: "Access my dashboard",
      supportText: "Our team remains at your disposal for any questions.",
      footer: "All rights reserved."
    },
    loanRequestAdmin: {
      subject: "New loan request - ALTUS FINANCE GROUP",
      headerTitle: "📋 New loan request",
      message: "A new loan request has been submitted and requires your attention.",
      applicantLabel: "Applicant:",
      emailLabel: "Email:",
      amountLabel: "Amount requested:",
      loanTypeLabel: "Loan type:",
      referenceLabel: "Reference:",
      userIdLabel: "User ID:",
      actionButton: "Review request",
      footer: "All rights reserved."
    },
    kycUploadedAdmin: {
      subject: "New KYC document uploaded - ALTUS FINANCE GROUP",
      headerTitle: "📄 New KYC document",
      message: "A new KYC document has been uploaded and requires your verification.",
      userLabel: "User:",
      emailLabel: "Email:",
      documentTypeLabel: "Document type:",
      loanTypeLabel: "Loan type:",
      userIdLabel: "User ID:",
      actionButton: "Verify document",
      footer: "All rights reserved."
    },
    loanApprovedUser: {
      subject: "Congratulations! Your loan is approved - ALTUS FINANCE GROUP",
      headerTitle: "🎉 Congratulations!",
      headerSubtitle: "Your loan is approved",
      greeting: "Hello",
      approvalMessage: "Great news! Your loan request for",
      approvalMessage2: "has been approved.",
      referenceLabel: "Reference:",
      nextStepsTitle: "Next steps:",
      step1: "Download your loan contract from your client area",
      step2: "Sign the contract and return it to us",
      step3: "Funds will be released within 24 hours after receiving the signed contract",
      loginButton: "Access my client area",
      importantTitle: "⚠️ Important:",
      importantMessage: "You must sign and return the contract for the funds to be released.",
      supportText: "Our team remains at your disposal for any questions.",
      footer: "All rights reserved."
    },
    transferInitiatedAdmin: {
      subject: "New transfer initiated - ALTUS FINANCE GROUP",
      headerTitle: "💸 New transfer initiated",
      message: "A new transfer has been initiated and requires your attention.",
      userLabel: "User:",
      emailLabel: "Email:",
      amountLabel: "Amount:",
      recipientLabel: "Recipient:",
      transferIdLabel: "Transfer ID:",
      userIdLabel: "User ID:",
      actionButton: "View transfer",
      footer: "All rights reserved."
    },
    transferCodeUser: {
      subject: "Validation code for your transfer - ALTUS FINANCE GROUP",
      headerTitle: "🔐 Validation code",
      greeting: "Hello",
      transferInfoTitle: "Transfer details",
      amountLabel: "Amount:",
      recipientLabel: "Recipient:",
      codeTitle: "Your validation code",
      codeSequence: "Code",
      codeOf: "of",
      instruction: "Use the code below to validate your transfer:",
      expirationText: "This code will expire in 15 minutes.",
      securityWarning: "⚠️ For your security, never share this code with anyone. Our team will never ask you for this code.",
      notYouText: "If you didn't initiate this transfer, contact us immediately.",
      footer: "All rights reserved."
    },
    transferCompletedUser: {
      subject: "Your transfer is complete - ALTUS FINANCE GROUP",
      headerTitle: "✅ Transfer completed successfully",
      greeting: "Hello",
      congratulationsMessage: "Your transfer has been completed successfully after validation of all security codes.",
      summaryTitle: "📋 Transfer summary",
      amountLabel: "Amount transferred:",
      recipientLabel: "Recipient:",
      ibanLabel: "Recipient IBAN:",
      referenceLabel: "Transfer reference:",
      availabilityTitle: "⏱️ Funds availability",
      availabilityMessage: "The funds will be available in the recipient's account within 24 to 72 business hours, depending on banking delays.",
      supportTitle: "💬 Need help?",
      supportMessage: "If you encounter any issues or have questions about this transfer, our team is at your disposal:",
      supportEmail: "Contact us at:",
      thanksMessage: "Thank you for your trust.",
      footer: "All rights reserved."
    },
    transferCompletedAdmin: {
      subject: "Transfer completion report - ALTUS FINANCE GROUP",
      headerTitle: "📊 Transfer completed - Admin report",
      message: "A transfer has been completed successfully. Here is the detailed report:",
      userInfoTitle: "👤 User information",
      userLabel: "User:",
      emailLabel: "Email:",
      userIdLabel: "User ID:",
      transferInfoTitle: "💸 Transfer details",
      amountLabel: "Amount:",
      recipientLabel: "Recipient:",
      ibanLabel: "IBAN:",
      transferIdLabel: "Transfer ID:",
      progressTitle: "✅ Progress and validation",
      validationsLabel: "Codes validated:",
      completedAtLabel: "Completed on:",
      actionButton: "View full details",
      footer: "All rights reserved."
    }
  },
  es: {
    accountTypes: {
      personal: "particular",
      business: "profesional/empresa"
    },
    verification: {
      subject: "Verifica tu dirección de correo electrónico - ALTUS FINANCE GROUP",
      tagline: "Soluciones de financiación",
      greeting: "Hola",
      thankYou: "Gracias por registrarte en ALTUS FINANCE GROUP como",
      instruction: "Para activar tu cuenta y acceder a nuestros servicios de financiación, verifica tu dirección de correo electrónico haciendo clic en el botón a continuación:",
      buttonText: "Verificar mi correo",
      alternativeText: "Si el botón no funciona, copia y pega este enlace en tu navegador:",
      disclaimerText: "Si no creaste una cuenta en ALTUS FINANCE GROUP, puedes ignorar este correo.",
      footer: "Todos los derechos reservados.",
      textVersion: {
        thankYou: "Gracias por registrarte en ALTUS FINANCE GROUP como",
        instruction: "Para activar tu cuenta, verifica tu dirección de correo electrónico visitando este enlace:",
        disclaimer: "Si no creaste una cuenta en ALTUS FINANCE GROUP, puedes ignorar este correo.",
        signature: "ALTUS FINANCE GROUP - Soluciones de financiación"
      }
    },
    welcome: {
      subject: "¡Bienvenido a ALTUS FINANCE GROUP!",
      headerTitle: "🎉 ¡Bienvenido a ALTUS FINANCE GROUP!",
      greeting: "Hola",
      verifiedMessage: "¡Tu correo ha sido verificado con éxito! Tu cuenta",
      activeMessage: "está ahora activa.",
      featuresIntro: "Ya puedes acceder a todas nuestras funcionalidades:",
      features: [
        "Solicitar un préstamo personal o empresarial",
        "Gestionar tus reembolsos",
        "Realizar transferencias",
        "Consultar tu panel de control"
      ],
      buttonText: "Iniciar sesión",
      supportText: "Nuestro equipo está a tu disposición para cualquier pregunta.",
      footer: "Todos los derechos reservados."
    },
    contract: {
      subject: "Tu contrato de préstamo está disponible - ALTUS FINANCE GROUP",
      headerTitle: "🎉 ¡Felicitaciones!",
      headerSubtitle: "Tu préstamo está aprobado",
      greeting: "Hola",
      approvedMessage: "¡Excelente noticia! Tu solicitud de préstamo de",
      approvedMessage2: "ha sido aprobada.",
      contractReadyTitle: "📄 Tu contrato de préstamo está listo",
      referenceLabel: "Referencia:",
      nextStepsTitle: "Próximos pasos:",
      step1Title: "Descargar el contrato",
      step1Text: "Descarga y lee atentamente tu contrato de préstamo",
      step2Title: "Firmar el documento",
      step2Text: "Imprime, firma con la mención \"Leído y aprobado\" seguida de tu firma",
      step3Title: "Devolver el contrato firmado",
      step3Text: "Sube el documento firmado desde tu área de cliente o envíalo por correo a",
      downloadButton: "📥 Descargar contrato",
      importantTitle: "⚠️ Importante:",
      importantMessage: "Los fondos se liberarán en un plazo de unos minutos a un máximo de 24 horas.",
      accessNote: "También puedes acceder a tu contrato desde tu área de cliente en cualquier momento.",
      contactText: "¿Preguntas? Contáctanos en",
      footer: "Todos los derechos reservados."
    },
    fundingRelease: {
      subject: "Tus fondos han sido liberados - ALTUS FINANCE GROUP",
      headerTitle: "✅ Fondos Liberados",
      headerSubtitle: "Tu dinero está disponible",
      greeting: "Hola",
      releaseMessage: "¡Excelente noticia! Los fondos de tu préstamo de",
      releaseMessage2: "han sido liberados con éxito.",
      referenceLabel: "Referencia del préstamo:",
      availabilityTitle: "💳 Disponibilidad de fondos",
      availabilityText: "Los fondos están ahora disponibles en tu cuenta y pueden ser utilizados inmediatamente.",
      nextStepsTitle: "Qué hacer ahora:",
      step1: "Consulta tu saldo en tu panel de control",
      step2: "Realiza una transferencia a tu cuenta bancaria",
      step3: "Gestiona tu calendario de reembolsos",
      dashboardButton: "Acceder al panel",
      reminderTitle: "📅 Recordatorio importante",
      reminderText: "No olvides tus fechas de reembolso. Puedes ver el calendario completo en tu área de cliente.",
      supportText: "Nuestro equipo sigue a tu disposición para cualquier pregunta.",
      contactText: "¿Preguntas? Contáctanos en",
      footer: "Todos los derechos reservados."
    },
    otp: {
      subject: "Código de verificación - ALTUS FINANCE GROUP",
      headerTitle: "🔐 Autenticación de dos factores",
      greeting: "Hola",
      codeTitle: "Tu código de verificación",
      instruction: "Usa el código a continuación para iniciar sesión en tu cuenta de ALTUS FINANCE GROUP:",
      expirationText: "Este código expirará en 5 minutos.",
      securityWarning: "⚠️ Para tu seguridad, nunca compartas este código con nadie. Nuestro equipo nunca te pedirá este código.",
      notYouText: "Si no solicitaste este código, ignora este correo y tu cuenta permanecerá segura.",
      footer: "Todos los derechos reservados."
    },
    loanRequestUser: {
      subject: "Tu solicitud de préstamo ha sido recibida - ALTUS FINANCE GROUP",
      headerTitle: "✅ Solicitud de préstamo recibida",
      greeting: "Hola",
      confirmationMessage: "Hemos recibido correctamente tu solicitud de préstamo de",
      confirmationMessage2: "por un monto de",
      referenceLabel: "Referencia de la solicitud:",
      nextStepsTitle: "Próximos pasos:",
      step1: "Nuestro equipo está examinando tu solicitud",
      step2: "Recibirás una respuesta en 24-48 horas",
      step3: "Si se necesitan documentos adicionales, te contactaremos",
      dashboardText: "Puedes seguir el estado de tu solicitud desde tu panel de control.",
      dashboardButton: "Acceder a mi panel",
      supportText: "Nuestro equipo sigue a tu disposición para cualquier pregunta.",
      footer: "Todos los derechos reservados."
    },
    loanRequestAdmin: {
      subject: "Nueva solicitud de préstamo - ALTUS FINANCE GROUP",
      headerTitle: "📋 Nueva solicitud de préstamo",
      message: "Se ha enviado una nueva solicitud de préstamo que requiere tu atención.",
      applicantLabel: "Solicitante:",
      emailLabel: "Email:",
      amountLabel: "Monto solicitado:",
      loanTypeLabel: "Tipo de préstamo:",
      referenceLabel: "Referencia:",
      userIdLabel: "ID de usuario:",
      actionButton: "Examinar solicitud",
      footer: "Todos los derechos reservados."
    },
    kycUploadedAdmin: {
      subject: "Nuevo documento KYC cargado - ALTUS FINANCE GROUP",
      headerTitle: "📄 Nuevo documento KYC",
      message: "Se ha cargado un nuevo documento KYC que requiere tu verificación.",
      userLabel: "Usuario:",
      emailLabel: "Email:",
      documentTypeLabel: "Tipo de documento:",
      loanTypeLabel: "Tipo de préstamo:",
      userIdLabel: "ID de usuario:",
      actionButton: "Verificar documento",
      footer: "Todos los derechos reservados."
    },
    loanApprovedUser: {
      subject: "¡Felicitaciones! Tu préstamo está aprobado - ALTUS FINANCE GROUP",
      headerTitle: "🎉 ¡Felicitaciones!",
      headerSubtitle: "Tu préstamo está aprobado",
      greeting: "Hola",
      approvalMessage: "¡Excelente noticia! Tu solicitud de préstamo de",
      approvalMessage2: "ha sido aprobada.",
      referenceLabel: "Referencia:",
      nextStepsTitle: "Próximos pasos:",
      step1: "Descarga tu contrato de préstamo desde tu área de cliente",
      step2: "Firma el contrato y devuélvenoslo",
      step3: "Los fondos se liberarán en 24 horas después de recibir el contrato firmado",
      loginButton: "Acceder a mi área de cliente",
      importantTitle: "⚠️ Importante:",
      importantMessage: "Debes firmar y devolver el contrato para que se liberen los fondos.",
      supportText: "Nuestro equipo sigue a tu disposición para cualquier pregunta.",
      footer: "Todos los derechos reservados."
    },
    transferInitiatedAdmin: {
      subject: "Nueva transferencia iniciada - ALTUS FINANCE GROUP",
      headerTitle: "💸 Nueva transferencia iniciada",
      message: "Se ha iniciado una nueva transferencia que requiere tu atención.",
      userLabel: "Usuario:",
      emailLabel: "Email:",
      amountLabel: "Monto:",
      recipientLabel: "Destinatario:",
      transferIdLabel: "ID de transferencia:",
      userIdLabel: "ID de usuario:",
      actionButton: "Ver transferencia",
      footer: "Todos los derechos reservados."
    },
    transferCodeUser: {
      subject: "Código de validación para tu transferencia - ALTUS FINANCE GROUP",
      headerTitle: "🔐 Código de validación",
      greeting: "Hola",
      transferInfoTitle: "Detalles de la transferencia",
      amountLabel: "Monto:",
      recipientLabel: "Destinatario:",
      codeTitle: "Tu código de validación",
      codeSequence: "Código",
      codeOf: "de",
      instruction: "Usa el código a continuación para validar tu transferencia:",
      expirationText: "Este código expirará en 15 minutos.",
      securityWarning: "⚠️ Para tu seguridad, nunca compartas este código con nadie. Nuestro equipo nunca te pedirá este código.",
      notYouText: "Si no iniciaste esta transferencia, contáctanos inmediatamente.",
      footer: "Todos los derechos reservados."
    }
  },
  pt: {
    accountTypes: {
      personal: "particular",
      business: "profissional/empresa"
    },
    verification: {
      subject: "Verifique seu endereço de email - ALTUS FINANCE GROUP",
      tagline: "Soluções de financiamento",
      greeting: "Olá",
      thankYou: "Obrigado por se inscrever no ALTUS FINANCE GROUP como",
      instruction: "Para ativar sua conta e acessar nossos serviços de financiamento, verifique seu endereço de email clicando no botão abaixo:",
      buttonText: "Verificar meu email",
      alternativeText: "Se o botão não funcionar, copie e cole este link no seu navegador:",
      disclaimerText: "Se você não criou uma conta no ALTUS FINANCE GROUP, pode ignorar este email.",
      footer: "Todos os direitos reservados.",
      textVersion: {
        thankYou: "Obrigado por se inscrever no ALTUS FINANCE GROUP como",
        instruction: "Para ativar sua conta, verifique seu endereço de email visitando este link:",
        disclaimer: "Se você não criou uma conta no ALTUS FINANCE GROUP, pode ignorar este email.",
        signature: "ALTUS FINANCE GROUP - Soluções de financiamento"
      }
    },
    welcome: {
      subject: "Bem-vindo ao ALTUS FINANCE GROUP!",
      headerTitle: "🎉 Bem-vindo ao ALTUS FINANCE GROUP!",
      greeting: "Olá",
      verifiedMessage: "Seu email foi verificado com sucesso! Sua conta",
      activeMessage: "está agora ativa.",
      featuresIntro: "Você já pode acessar todas as nossas funcionalidades:",
      features: [
        "Solicitar um empréstimo pessoal ou empresarial",
        "Gerenciar seus reembolsos",
        "Realizar transferências",
        "Consultar seu painel de controle"
      ],
      buttonText: "Entrar",
      supportText: "Nossa equipe está à sua disposição para qualquer dúvida.",
      footer: "Todos os direitos reservados."
    },
    contract: {
      subject: "Seu contrato de empréstimo está disponível - ALTUS FINANCE GROUP",
      headerTitle: "🎉 Parabéns!",
      headerSubtitle: "Seu empréstimo foi aprovado",
      greeting: "Olá",
      approvedMessage: "Excelente notícia! Sua solicitação de empréstimo de",
      approvedMessage2: "foi aprovada.",
      contractReadyTitle: "📄 Seu contrato de empréstimo está pronto",
      referenceLabel: "Referência:",
      nextStepsTitle: "Próximos passos:",
      step1Title: "Baixar o contrato",
      step1Text: "Baixe e leia atentamente seu contrato de empréstimo",
      step2Title: "Assinar o documento",
      step2Text: "Imprima, assine com a menção \"Lido e aprovado\" seguida de sua assinatura",
      step3Title: "Devolver o contrato assinado",
      step3Text: "Carregue o documento assinado da sua área de cliente ou envie por email para",
      downloadButton: "📥 Baixar contrato",
      importantTitle: "⚠️ Importante:",
      importantMessage: "Os fundos serão liberados dentro de alguns minutos a um máximo de 24 horas.",
      accessNote: "Você também pode acessar seu contrato da sua área de cliente a qualquer momento.",
      contactText: "Dúvidas? Entre em contato conosco em",
      footer: "Todos os direitos reservados."
    },
    fundingRelease: {
      subject: "Seus fundos foram liberados - ALTUS FINANCE GROUP",
      headerTitle: "✅ Fundos Liberados",
      headerSubtitle: "Seu dinheiro está disponível",
      greeting: "Olá",
      releaseMessage: "Excelente notícia! Os fundos do seu empréstimo de",
      releaseMessage2: "foram liberados com sucesso.",
      referenceLabel: "Referência do empréstimo:",
      availabilityTitle: "💳 Disponibilidade de fundos",
      availabilityText: "Os fundos estão agora disponíveis na sua conta e podem ser usados imediatamente.",
      nextStepsTitle: "O que fazer agora:",
      step1: "Consulte seu saldo no seu painel de controle",
      step2: "Realize uma transferência para sua conta bancária",
      step3: "Gerencie seu cronograma de reembolso",
      dashboardButton: "Acessar painel",
      reminderTitle: "📅 Lembrete importante",
      reminderText: "Não esqueça suas datas de reembolso. Você pode ver o cronograma completo na sua área de cliente.",
      supportText: "Nossa equipe continua à sua disposição para qualquer dúvida.",
      contactText: "Dúvidas? Entre em contato conosco em",
      footer: "Todos os direitos reservados."
    },
    otp: {
      subject: "Código de verificação - ALTUS FINANCE GROUP",
      headerTitle: "🔐 Autenticação de dois fatores",
      greeting: "Olá",
      codeTitle: "Seu código de verificação",
      instruction: "Use o código abaixo para fazer login na sua conta ALTUS FINANCE GROUP:",
      expirationText: "Este código expirará em 5 minutos.",
      securityWarning: "⚠️ Para sua segurança, nunca compartilhe este código com ninguém. Nossa equipe nunca pedirá este código.",
      notYouText: "Se você não solicitou este código, ignore este email e sua conta permanecerá segura.",
      footer: "Todos os direitos reservados."
    },
    loanRequestUser: {
      subject: "Sua solicitação de empréstimo foi recebida - ALTUS FINANCE GROUP",
      headerTitle: "✅ Solicitação de empréstimo recebida",
      greeting: "Olá",
      confirmationMessage: "Recebemos com sucesso sua solicitação de empréstimo de",
      confirmationMessage2: "no valor de",
      referenceLabel: "Referência da solicitação:",
      nextStepsTitle: "Próximos passos:",
      step1: "Nossa equipe está analisando sua solicitação",
      step2: "Você receberá uma resposta em 24-48 horas",
      step3: "Se documentos adicionais forem necessários, entraremos em contato",
      dashboardText: "Você pode acompanhar o status da sua solicitação no seu painel de controle.",
      dashboardButton: "Acessar meu painel",
      supportText: "Nossa equipe continua à sua disposição para qualquer dúvida.",
      footer: "Todos os direitos reservados."
    },
    loanRequestAdmin: {
      subject: "Nova solicitação de empréstimo - ALTUS FINANCE GROUP",
      headerTitle: "📋 Nova solicitação de empréstimo",
      message: "Uma nova solicitação de empréstimo foi enviada e requer sua atenção.",
      applicantLabel: "Solicitante:",
      emailLabel: "Email:",
      amountLabel: "Valor solicitado:",
      loanTypeLabel: "Tipo de empréstimo:",
      referenceLabel: "Referência:",
      userIdLabel: "ID do usuário:",
      actionButton: "Analisar solicitação",
      footer: "Todos os direitos reservados."
    },
    kycUploadedAdmin: {
      subject: "Novo documento KYC enviado - ALTUS FINANCE GROUP",
      headerTitle: "📄 Novo documento KYC",
      message: "Um novo documento KYC foi enviado e requer sua verificação.",
      userLabel: "Usuário:",
      emailLabel: "Email:",
      documentTypeLabel: "Tipo de documento:",
      loanTypeLabel: "Tipo de empréstimo:",
      userIdLabel: "ID do usuário:",
      actionButton: "Verificar documento",
      footer: "Todos os direitos reservados."
    },
    loanApprovedUser: {
      subject: "Parabéns! Seu empréstimo foi aprovado - ALTUS FINANCE GROUP",
      headerTitle: "🎉 Parabéns!",
      headerSubtitle: "Seu empréstimo foi aprovado",
      greeting: "Olá",
      approvalMessage: "Excelente notícia! Sua solicitação de empréstimo de",
      approvalMessage2: "foi aprovada.",
      referenceLabel: "Referência:",
      nextStepsTitle: "Próximos passos:",
      step1: "Baixe seu contrato de empréstimo da sua área de cliente",
      step2: "Assine o contrato e devolva-o para nós",
      step3: "Os fundos serão liberados em 24 horas após o recebimento do contrato assinado",
      loginButton: "Acessar minha área de cliente",
      importantTitle: "⚠️ Importante:",
      importantMessage: "Você deve assinar e devolver o contrato para que os fundos sejam liberados.",
      supportText: "Nossa equipe continua à sua disposição para qualquer dúvida.",
      footer: "Todos os direitos reservados."
    },
    transferInitiatedAdmin: {
      subject: "Nova transferência iniciada - ALTUS FINANCE GROUP",
      headerTitle: "💸 Nova transferência iniciada",
      message: "Uma nova transferência foi iniciada e requer sua atenção.",
      userLabel: "Usuário:",
      emailLabel: "Email:",
      amountLabel: "Valor:",
      recipientLabel: "Destinatário:",
      transferIdLabel: "ID da transferência:",
      userIdLabel: "ID do usuário:",
      actionButton: "Ver transferência",
      footer: "Todos os direitos reservados."
    },
    transferCodeUser: {
      subject: "Código de validação para sua transferência - ALTUS FINANCE GROUP",
      headerTitle: "🔐 Código de validação",
      greeting: "Olá",
      transferInfoTitle: "Detalhes da transferência",
      amountLabel: "Valor:",
      recipientLabel: "Destinatário:",
      codeTitle: "Seu código de validação",
      codeSequence: "Código",
      codeOf: "de",
      instruction: "Use o código abaixo para validar sua transferência:",
      expirationText: "Este código expirará em 15 minutos.",
      securityWarning: "⚠️ Para sua segurança, nunca compartilhe este código com ninguém. Nossa equipe nunca pedirá este código.",
      notYouText: "Se você não iniciou esta transferência, entre em contato conosco imediatamente.",
      footer: "Todos os direitos reservados."
    }
  },
  it: {
    accountTypes: {
      personal: "particolare",
      business: "professionale/aziendale"
    },
    verification: {
      subject: "Verifica il tuo indirizzo email - ALTUS FINANCE GROUP",
      tagline: "Soluzioni di finanziamento",
      greeting: "Ciao",
      thankYou: "Grazie per esserti iscritto su ALTUS FINANCE GROUP come",
      instruction: "Per attivare il tuo account e accedere ai nostri servizi di finanziamento, verifica il tuo indirizzo email cliccando sul pulsante qui sotto:",
      buttonText: "Verifica la mia email",
      alternativeText: "Se il pulsante non funziona, copia e incolla questo link nel tuo browser:",
      disclaimerText: "Se non hai creato un account su ALTUS FINANCE GROUP, puoi ignorare questa email.",
      footer: "Tutti i diritti riservati.",
      textVersion: {
        thankYou: "Grazie per esserti iscritto su ALTUS FINANCE GROUP come",
        instruction: "Per attivare il tuo account, verifica il tuo indirizzo email visitando questo link:",
        disclaimer: "Se non hai creato un account su ALTUS FINANCE GROUP, puoi ignorare questa email.",
        signature: "ALTUS FINANCE GROUP - Soluzioni di finanziamento"
      }
    },
    welcome: {
      subject: "Benvenuto su ALTUS FINANCE GROUP!",
      headerTitle: "🎉 Benvenuto su ALTUS FINANCE GROUP!",
      greeting: "Ciao",
      verifiedMessage: "La tua email è stata verificata con successo! Il tuo account",
      activeMessage: "è ora attivo.",
      featuresIntro: "Puoi ora accedere a tutte le nostre funzionalità:",
      features: [
        "Richiedere un prestito personale o aziendale",
        "Gestire i tuoi rimborsi",
        "Effettuare trasferimenti",
        "Consultare la tua dashboard"
      ],
      buttonText: "Accedi",
      supportText: "Il nostro team è a tua disposizione per qualsiasi domanda.",
      footer: "Tutti i diritti riservati."
    },
    contract: {
      subject: "Il tuo contratto di prestito è disponibile - ALTUS FINANCE GROUP",
      headerTitle: "🎉 Congratulazioni!",
      headerSubtitle: "Il tuo prestito è approvato",
      greeting: "Ciao",
      approvedMessage: "Ottima notizia! La tua richiesta di prestito di",
      approvedMessage2: "è stata approvata.",
      contractReadyTitle: "📄 Il tuo contratto di prestito è pronto",
      referenceLabel: "Riferimento:",
      nextStepsTitle: "Prossimi passi:",
      step1Title: "Scaricare il contratto",
      step1Text: "Scarica e leggi attentamente il tuo contratto di prestito",
      step2Title: "Firmare il documento",
      step2Text: "Stampa, firma con la dicitura \"Letto e approvato\" seguita dalla tua firma",
      step3Title: "Restituire il contratto firmato",
      step3Text: "Carica il documento firmato dalla tua area cliente o invialo per email a",
      downloadButton: "📥 Scarica contratto",
      importantTitle: "⚠️ Importante:",
      importantMessage: "I fondi saranno rilasciati entro pochi minuti fino a un massimo di 24 ore.",
      accessNote: "Puoi anche accedere al tuo contratto dalla tua area cliente in qualsiasi momento.",
      contactText: "Domande? Contattaci a",
      footer: "Tutti i diritti riservati."
    },
    fundingRelease: {
      subject: "I tuoi fondi sono stati rilasciati - ALTUS FINANCE GROUP",
      headerTitle: "✅ Fondi Rilasciati",
      headerSubtitle: "Il tuo denaro è disponibile",
      greeting: "Ciao",
      releaseMessage: "Ottima notizia! I fondi del tuo prestito di",
      releaseMessage2: "sono stati rilasciati con successo.",
      referenceLabel: "Riferimento prestito:",
      availabilityTitle: "💳 Disponibilità fondi",
      availabilityText: "I fondi sono ora disponibili sul tuo account e possono essere utilizzati immediatamente.",
      nextStepsTitle: "Cosa fare ora:",
      step1: "Consulta il tuo saldo nella tua dashboard",
      step2: "Effettua un trasferimento sul tuo conto bancario",
      step3: "Gestisci il tuo piano di rimborso",
      dashboardButton: "Accedi alla dashboard",
      reminderTitle: "📅 Promemoria importante",
      reminderText: "Non dimenticare le tue scadenze di rimborso. Puoi visualizzare il calendario completo nella tua area cliente.",
      supportText: "Il nostro team rimane a tua disposizione per qualsiasi domanda.",
      contactText: "Domande? Contattaci a",
      footer: "Tutti i diritti riservati."
    },
    otp: {
      subject: "Codice di verifica - ALTUS FINANCE GROUP",
      headerTitle: "🔐 Autenticazione a due fattori",
      greeting: "Ciao",
      codeTitle: "Il tuo codice di verifica",
      instruction: "Usa il codice qui sotto per accedere al tuo account ALTUS FINANCE GROUP:",
      expirationText: "Questo codice scadrà tra 5 minuti.",
      securityWarning: "⚠️ Per la tua sicurezza, non condividere mai questo codice con nessuno. Il nostro team non ti chiederà mai questo codice.",
      notYouText: "Se non hai richiesto questo codice, ignora questa email e il tuo account rimarrà sicuro.",
      footer: "Tutti i diritti riservati."
    },
    loanRequestUser: {
      subject: "La tua richiesta di prestito è stata ricevuta - ALTUS FINANCE GROUP",
      headerTitle: "✅ Richiesta di prestito ricevuta",
      greeting: "Ciao",
      confirmationMessage: "Abbiamo ricevuto con successo la tua richiesta di prestito di",
      confirmationMessage2: "per un importo di",
      referenceLabel: "Riferimento richiesta:",
      nextStepsTitle: "Prossimi passi:",
      step1: "Il nostro team sta esaminando la tua richiesta",
      step2: "Riceverai una risposta entro 24-48 ore",
      step3: "Se saranno necessari documenti aggiuntivi, ti contatteremo",
      dashboardText: "Puoi monitorare lo stato della tua richiesta dalla tua dashboard.",
      dashboardButton: "Accedi alla mia dashboard",
      supportText: "Il nostro team rimane a tua disposizione per qualsiasi domanda.",
      footer: "Tutti i diritti riservati."
    },
    loanRequestAdmin: {
      subject: "Nuova richiesta di prestito - ALTUS FINANCE GROUP",
      headerTitle: "📋 Nuova richiesta di prestito",
      message: "È stata inviata una nuova richiesta di prestito che richiede la tua attenzione.",
      applicantLabel: "Richiedente:",
      emailLabel: "Email:",
      amountLabel: "Importo richiesto:",
      loanTypeLabel: "Tipo di prestito:",
      referenceLabel: "Riferimento:",
      userIdLabel: "ID utente:",
      actionButton: "Esamina richiesta",
      footer: "Tutti i diritti riservati."
    },
    kycUploadedAdmin: {
      subject: "Nuovo documento KYC caricato - ALTUS FINANCE GROUP",
      headerTitle: "📄 Nuovo documento KYC",
      message: "È stato caricato un nuovo documento KYC che richiede la tua verifica.",
      userLabel: "Utente:",
      emailLabel: "Email:",
      documentTypeLabel: "Tipo di documento:",
      loanTypeLabel: "Tipo di prestito:",
      userIdLabel: "ID utente:",
      actionButton: "Verifica documento",
      footer: "Tutti i diritti riservati."
    },
    loanApprovedUser: {
      subject: "Congratulazioni! Il tuo prestito è approvato - ALTUS FINANCE GROUP",
      headerTitle: "🎉 Congratulazioni!",
      headerSubtitle: "Il tuo prestito è approvato",
      greeting: "Ciao",
      approvalMessage: "Ottima notizia! La tua richiesta di prestito di",
      approvalMessage2: "è stata approvata.",
      referenceLabel: "Riferimento:",
      nextStepsTitle: "Prossimi passi:",
      step1: "Scarica il tuo contratto di prestito dalla tua area cliente",
      step2: "Firma il contratto e restituiscilo",
      step3: "I fondi saranno rilasciati entro 24 ore dalla ricezione del contratto firmato",
      loginButton: "Accedi alla mia area cliente",
      importantTitle: "⚠️ Importante:",
      importantMessage: "Devi firmare e restituire il contratto affinché i fondi vengano rilasciati.",
      supportText: "Il nostro team rimane a tua disposizione per qualsiasi domanda.",
      footer: "Tutti i diritti riservati."
    },
    transferInitiatedAdmin: {
      subject: "Nuovo trasferimento avviato - ALTUS FINANCE GROUP",
      headerTitle: "💸 Nuovo trasferimento avviato",
      message: "È stato avviato un nuovo trasferimento che richiede la tua attenzione.",
      userLabel: "Utente:",
      emailLabel: "Email:",
      amountLabel: "Importo:",
      recipientLabel: "Destinatario:",
      transferIdLabel: "ID trasferimento:",
      userIdLabel: "ID utente:",
      actionButton: "Visualizza trasferimento",
      footer: "Tutti i diritti riservati."
    },
    transferCodeUser: {
      subject: "Codice di convalida per il tuo trasferimento - ALTUS FINANCE GROUP",
      headerTitle: "🔐 Codice di convalida",
      greeting: "Ciao",
      transferInfoTitle: "Dettagli trasferimento",
      amountLabel: "Importo:",
      recipientLabel: "Destinatario:",
      codeTitle: "Il tuo codice di convalida",
      codeSequence: "Codice",
      codeOf: "di",
      instruction: "Usa il codice qui sotto per convalidare il tuo trasferimento:",
      expirationText: "Questo codice scadrà tra 15 minuti.",
      securityWarning: "⚠️ Per la tua sicurezza, non condividere mai questo codice con nessuno. Il nostro team non ti chiederà mai questo codice.",
      notYouText: "Se non hai avviato questo trasferimento, contattaci immediatamente.",
      footer: "Tutti i diritti riservati."
    }
  },
  de: {
    accountTypes: {
      personal: "privat",
      business: "geschäftlich/unternehmen"
    },
    verification: {
      subject: "Bestätigen Sie Ihre E-Mail-Adresse - ALTUS FINANCE GROUP",
      tagline: "Finanzierungslösungen",
      greeting: "Hallo",
      thankYou: "Vielen Dank für Ihre Anmeldung bei ALTUS FINANCE GROUP als",
      instruction: "Um Ihr Konto zu aktivieren und auf unsere Finanzierungsdienstleistungen zuzugreifen, bestätigen Sie bitte Ihre E-Mail-Adresse, indem Sie auf die Schaltfläche unten klicken:",
      buttonText: "Meine E-Mail bestätigen",
      alternativeText: "Wenn die Schaltfläche nicht funktioniert, kopieren Sie diesen Link und fügen Sie ihn in Ihren Browser ein:",
      disclaimerText: "Wenn Sie kein Konto bei ALTUS FINANCE GROUP erstellt haben, können Sie diese E-Mail ignorieren.",
      footer: "Alle Rechte vorbehalten.",
      textVersion: {
        thankYou: "Vielen Dank für Ihre Anmeldung bei ALTUS FINANCE GROUP als",
        instruction: "Um Ihr Konto zu aktivieren, bestätigen Sie bitte Ihre E-Mail-Adresse, indem Sie diesen Link besuchen:",
        disclaimer: "Wenn Sie kein Konto bei ALTUS FINANCE GROUP erstellt haben, können Sie diese E-Mail ignorieren.",
        signature: "ALTUS FINANCE GROUP - Finanzierungslösungen"
      }
    },
    welcome: {
      subject: "Willkommen bei ALTUS FINANCE GROUP!",
      headerTitle: "🎉 Willkommen bei ALTUS FINANCE GROUP!",
      greeting: "Hallo",
      verifiedMessage: "Ihre E-Mail wurde erfolgreich bestätigt! Ihr Konto",
      activeMessage: "ist jetzt aktiv.",
      featuresIntro: "Sie können jetzt auf alle unsere Funktionen zugreifen:",
      features: [
        "Einen persönlichen oder geschäftlichen Kredit beantragen",
        "Ihre Rückzahlungen verwalten",
        "Überweisungen tätigen",
        "Ihr Dashboard einsehen"
      ],
      buttonText: "Anmelden",
      supportText: "Unser Team steht Ihnen für alle Fragen zur Verfügung.",
      footer: "Alle Rechte vorbehalten."
    },
    contract: {
      subject: "Ihr Kreditvertrag ist verfügbar - ALTUS FINANCE GROUP",
      headerTitle: "🎉 Herzlichen Glückwunsch!",
      headerSubtitle: "Ihr Kredit wurde genehmigt",
      greeting: "Hallo",
      approvedMessage: "Tolle Neuigkeiten! Ihr Kreditantrag über",
      approvedMessage2: "wurde genehmigt.",
      contractReadyTitle: "📄 Ihr Kreditvertrag ist bereit",
      referenceLabel: "Referenz:",
      nextStepsTitle: "Nächste Schritte:",
      step1Title: "Vertrag herunterladen",
      step1Text: "Laden Sie Ihren Kreditvertrag herunter und lesen Sie ihn sorgfältig",
      step2Title: "Dokument unterschreiben",
      step2Text: "Drucken Sie es aus, unterschreiben Sie es mit dem Vermerk \"Gelesen und genehmigt\", gefolgt von Ihrer Unterschrift",
      step3Title: "Unterschriebenen Vertrag zurückgeben",
      step3Text: "Laden Sie das unterschriebene Dokument aus Ihrem Kundenbereich hoch oder senden Sie es per E-Mail an",
      downloadButton: "📥 Vertrag herunterladen",
      importantTitle: "⚠️ Wichtig:",
      importantMessage: "Die Mittel werden innerhalb von wenigen Minuten bis maximal 24 Stunden freigegeben.",
      accessNote: "Sie können jederzeit über Ihren Kundenbereich auf Ihren Vertrag zugreifen.",
      contactText: "Fragen? Kontaktieren Sie uns unter",
      footer: "Alle Rechte vorbehalten."
    },
    fundingRelease: {
      subject: "Ihre Mittel wurden freigegeben - ALTUS FINANCE GROUP",
      headerTitle: "✅ Mittel Freigegeben",
      headerSubtitle: "Ihr Geld ist verfügbar",
      greeting: "Hallo",
      releaseMessage: "Tolle Neuigkeiten! Die Mittel Ihres Kredits über",
      releaseMessage2: "wurden erfolgreich freigegeben.",
      referenceLabel: "Kreditreferenz:",
      availabilityTitle: "💳 Verfügbarkeit der Mittel",
      availabilityText: "Die Mittel sind jetzt auf Ihrem Konto verfügbar und können sofort verwendet werden.",
      nextStepsTitle: "Was jetzt zu tun ist:",
      step1: "Überprüfen Sie Ihren Kontostand in Ihrem Dashboard",
      step2: "Tätigen Sie eine Überweisung auf Ihr Bankkonto",
      step3: "Verwalten Sie Ihren Rückzahlungsplan",
      dashboardButton: "Zum Dashboard",
      reminderTitle: "📅 Wichtige Erinnerung",
      reminderText: "Vergessen Sie nicht Ihre Rückzahlungstermine. Sie können den vollständigen Zeitplan in Ihrem Kundenbereich einsehen.",
      supportText: "Unser Team steht Ihnen weiterhin für alle Fragen zur Verfügung.",
      contactText: "Fragen? Kontaktieren Sie uns unter",
      footer: "Alle Rechte vorbehalten."
    },
    otp: {
      subject: "Bestätigungscode - ALTUS FINANCE GROUP",
      headerTitle: "🔐 Zwei-Faktor-Authentifizierung",
      greeting: "Hallo",
      codeTitle: "Ihr Bestätigungscode",
      instruction: "Verwenden Sie den unten stehenden Code, um sich bei Ihrem ALTUS FINANCE GROUP-Konto anzumelden:",
      expirationText: "Dieser Code läuft in 5 Minuten ab.",
      securityWarning: "⚠️ Zu Ihrer Sicherheit teilen Sie diesen Code niemals mit jemandem. Unser Team wird Sie niemals nach diesem Code fragen.",
      notYouText: "Wenn Sie diesen Code nicht angefordert haben, ignorieren Sie diese E-Mail und Ihr Konto bleibt sicher.",
      footer: "Alle Rechte vorbehalten."
    },
    loanRequestUser: {
      subject: "Ihr Kreditantrag wurde erhalten - ALTUS FINANCE GROUP",
      headerTitle: "✅ Kreditantrag erhalten",
      greeting: "Hallo",
      confirmationMessage: "Wir haben Ihren Kreditantrag erfolgreich erhalten für",
      confirmationMessage2: "über einen Betrag von",
      referenceLabel: "Antragsreferenz:",
      nextStepsTitle: "Nächste Schritte:",
      step1: "Unser Team prüft Ihren Antrag",
      step2: "Sie erhalten innerhalb von 24-48 Stunden eine Antwort",
      step3: "Falls zusätzliche Dokumente benötigt werden, werden wir Sie kontaktieren",
      dashboardText: "Sie können den Status Ihres Antrags über Ihr Dashboard verfolgen.",
      dashboardButton: "Zu meinem Dashboard",
      supportText: "Unser Team steht Ihnen weiterhin für alle Fragen zur Verfügung.",
      footer: "Alle Rechte vorbehalten."
    },
    loanRequestAdmin: {
      subject: "Neuer Kreditantrag - ALTUS FINANCE GROUP",
      headerTitle: "📋 Neuer Kreditantrag",
      message: "Ein neuer Kreditantrag wurde eingereicht und benötigt Ihre Aufmerksamkeit.",
      applicantLabel: "Antragsteller:",
      emailLabel: "E-Mail:",
      amountLabel: "Beantragter Betrag:",
      loanTypeLabel: "Kreditart:",
      referenceLabel: "Referenz:",
      userIdLabel: "Benutzer-ID:",
      actionButton: "Antrag prüfen",
      footer: "Alle Rechte vorbehalten."
    },
    kycUploadedAdmin: {
      subject: "Neues KYC-Dokument hochgeladen - ALTUS FINANCE GROUP",
      headerTitle: "📄 Neues KYC-Dokument",
      message: "Ein neues KYC-Dokument wurde hochgeladen und benötigt Ihre Überprüfung.",
      userLabel: "Benutzer:",
      emailLabel: "E-Mail:",
      documentTypeLabel: "Dokumenttyp:",
      loanTypeLabel: "Kreditart:",
      userIdLabel: "Benutzer-ID:",
      actionButton: "Dokument überprüfen",
      footer: "Alle Rechte vorbehalten."
    },
    loanApprovedUser: {
      subject: "Glückwunsch! Ihr Kredit wurde genehmigt - ALTUS FINANCE GROUP",
      headerTitle: "🎉 Glückwunsch!",
      headerSubtitle: "Ihr Kredit wurde genehmigt",
      greeting: "Hallo",
      approvalMessage: "Tolle Neuigkeiten! Ihr Kreditantrag über",
      approvalMessage2: "wurde genehmigt.",
      referenceLabel: "Referenz:",
      nextStepsTitle: "Nächste Schritte:",
      step1: "Laden Sie Ihren Kreditvertrag aus Ihrem Kundenbereich herunter",
      step2: "Unterschreiben Sie den Vertrag und senden Sie ihn an uns zurück",
      step3: "Die Mittel werden innerhalb von 24 Stunden nach Erhalt des unterschriebenen Vertrags freigegeben",
      loginButton: "Zu meinem Kundenbereich",
      importantTitle: "⚠️ Wichtig:",
      importantMessage: "Sie müssen den Vertrag unterschreiben und zurücksenden, damit die Mittel freigegeben werden.",
      supportText: "Unser Team steht Ihnen weiterhin für alle Fragen zur Verfügung.",
      footer: "Alle Rechte vorbehalten."
    },
    transferInitiatedAdmin: {
      subject: "Neue Überweisung initiiert - ALTUS FINANCE GROUP",
      headerTitle: "💸 Neue Überweisung initiiert",
      message: "Eine neue Überweisung wurde initiiert und benötigt Ihre Aufmerksamkeit.",
      userLabel: "Benutzer:",
      emailLabel: "E-Mail:",
      amountLabel: "Betrag:",
      recipientLabel: "Empfänger:",
      transferIdLabel: "Überweisungs-ID:",
      userIdLabel: "Benutzer-ID:",
      actionButton: "Überweisung anzeigen",
      footer: "Alle Rechte vorbehalten."
    },
    transferCodeUser: {
      subject: "Bestätigungscode für Ihre Überweisung - ALTUS FINANCE GROUP",
      headerTitle: "🔐 Bestätigungscode",
      greeting: "Hallo",
      transferInfoTitle: "Überweisungsdetails",
      amountLabel: "Betrag:",
      recipientLabel: "Empfänger:",
      codeTitle: "Ihr Bestätigungscode",
      codeSequence: "Code",
      codeOf: "von",
      instruction: "Verwenden Sie den unten stehenden Code, um Ihre Überweisung zu bestätigen:",
      expirationText: "Dieser Code läuft in 15 Minuten ab.",
      securityWarning: "⚠️ Zu Ihrer Sicherheit teilen Sie diesen Code niemals mit jemandem. Unser Team wird Sie niemals nach diesem Code fragen.",
      notYouText: "Wenn Sie diese Überweisung nicht initiiert haben, kontaktieren Sie uns sofort.",
      footer: "Alle Rechte vorbehalten."
    }
  },
  nl: {
    accountTypes: {
      personal: "particulier",
      business: "professioneel/zakelijk"
    },
    verification: {
      subject: "Verifieer uw e-mailadres - ALTUS FINANCE GROUP",
      tagline: "Financieringsoplossingen",
      greeting: "Hallo",
      thankYou: "Bedankt voor uw aanmelding bij ALTUS FINANCE GROUP als",
      instruction: "Om uw account te activeren en toegang te krijgen tot onze financieringsdiensten, verifieert u uw e-mailadres door op de onderstaande knop te klikken:",
      buttonText: "Verifieer mijn e-mail",
      alternativeText: "Als de knop niet werkt, kopieer en plak deze link in uw browser:",
      disclaimerText: "Als u geen account heeft aangemaakt bij ALTUS FINANCE GROUP, kunt u deze e-mail negeren.",
      footer: "Alle rechten voorbehouden.",
      textVersion: {
        thankYou: "Bedankt voor uw aanmelding bij ALTUS FINANCE GROUP als",
        instruction: "Om uw account te activeren, verifieert u uw e-mailadres door deze link te bezoeken:",
        disclaimer: "Als u geen account heeft aangemaakt bij ALTUS FINANCE GROUP, kunt u deze e-mail negeren.",
        signature: "ALTUS FINANCE GROUP - Financieringsoplossingen"
      }
    },
    welcome: {
      subject: "Welkom bij ALTUS FINANCE GROUP!",
      headerTitle: "🎉 Welkom bij ALTUS FINANCE GROUP!",
      greeting: "Hallo",
      verifiedMessage: "Uw e-mail is succesvol geverifieerd! Uw account",
      activeMessage: "is nu actief.",
      featuresIntro: "U heeft nu toegang tot al onze functies:",
      features: [
        "Een persoonlijke of zakelijke lening aanvragen",
        "Uw terugbetalingen beheren",
        "Overboekingen uitvoeren",
        "Uw dashboard raadplegen"
      ],
      buttonText: "Inloggen",
      supportText: "Ons team staat tot uw beschikking voor al uw vragen.",
      footer: "Alle rechten voorbehouden."
    },
    contract: {
      subject: "Uw leningscontract is beschikbaar - ALTUS FINANCE GROUP",
      headerTitle: "🎉 Gefeliciteerd!",
      headerSubtitle: "Uw lening is goedgekeurd",
      greeting: "Hallo",
      approvedMessage: "Geweldig nieuws! Uw leningaanvraag voor",
      approvedMessage2: "is goedgekeurd.",
      contractReadyTitle: "📄 Uw leningscontract is klaar",
      referenceLabel: "Referentie:",
      nextStepsTitle: "Volgende stappen:",
      step1Title: "Contract downloaden",
      step1Text: "Download en lees uw leningscontract zorgvuldig",
      step2Title: "Document ondertekenen",
      step2Text: "Afdrukken, ondertekenen met de vermelding \"Gelezen en goedgekeurd\" gevolgd door uw handtekening",
      step3Title: "Ondertekend contract retourneren",
      step3Text: "Upload het ondertekende document vanuit uw klantengebied of stuur het per e-mail naar",
      downloadButton: "📥 Contract downloaden",
      importantTitle: "⚠️ Belangrijk:",
      importantMessage: "De middelen worden vrijgegeven binnen enkele minuten tot maximaal 24 uur.",
      accessNote: "U kunt ook op elk moment toegang krijgen tot uw contract vanuit uw klantengebied.",
      contactText: "Vragen? Neem contact met ons op via",
      footer: "Alle rechten voorbehouden."
    },
    fundingRelease: {
      subject: "Uw middelen zijn vrijgegeven - ALTUS FINANCE GROUP",
      headerTitle: "✅ Middelen Vrijgegeven",
      headerSubtitle: "Uw geld is beschikbaar",
      greeting: "Hallo",
      releaseMessage: "Geweldig nieuws! De middelen van uw lening van",
      releaseMessage2: "zijn succesvol vrijgegeven.",
      referenceLabel: "Lening referentie:",
      availabilityTitle: "💳 Beschikbaarheid van middelen",
      availabilityText: "De middelen zijn nu beschikbaar op uw account en kunnen onmiddellijk worden gebruikt.",
      nextStepsTitle: "Wat nu te doen:",
      step1: "Controleer uw saldo in uw dashboard",
      step2: "Voer een overboeking uit naar uw bankrekening",
      step3: "Beheer uw terugbetalingsschema",
      dashboardButton: "Ga naar dashboard",
      reminderTitle: "📅 Belangrijke herinnering",
      reminderText: "Vergeet uw terugbetalingsdata niet. U kunt het volledige schema bekijken in uw klantengebied.",
      supportText: "Ons team blijft tot uw beschikking voor al uw vragen.",
      contactText: "Vragen? Neem contact met ons op via",
      footer: "Alle rechten voorbehouden."
    },
    otp: {
      subject: "Verificatiecode - ALTUS FINANCE GROUP",
      headerTitle: "🔐 Twee-factor-authenticatie",
      greeting: "Hallo",
      codeTitle: "Uw verificatiecode",
      instruction: "Gebruik de onderstaande code om in te loggen op uw ALTUS FINANCE GROUP-account:",
      expirationText: "Deze code verloopt over 5 minuten.",
      securityWarning: "⚠️ Voor uw veiligheid, deel deze code nooit met iemand. Ons team zal u nooit om deze code vragen.",
      notYouText: "Als u deze code niet heeft aangevraagd, negeer deze e-mail en uw account blijft veilig.",
      footer: "Alle rechten voorbehouden."
    },
    loanRequestUser: {
      subject: "Uw leningaanvraag is ontvangen - ALTUS FINANCE GROUP",
      headerTitle: "✅ Leningaanvraag ontvangen",
      greeting: "Hallo",
      confirmationMessage: "We hebben uw leningaanvraag succesvol ontvangen voor",
      confirmationMessage2: "voor een bedrag van",
      referenceLabel: "Aanvraag referentie:",
      nextStepsTitle: "Volgende stappen:",
      step1: "Ons team onderzoekt uw aanvraag",
      step2: "U ontvangt binnen 24-48 uur een antwoord",
      step3: "Als er extra documenten nodig zijn, nemen we contact met u op",
      dashboardText: "U kunt de status van uw aanvraag volgen via uw dashboard.",
      dashboardButton: "Ga naar mijn dashboard",
      supportText: "Ons team blijft tot uw beschikking voor al uw vragen.",
      footer: "Alle rechten voorbehouden."
    },
    loanRequestAdmin: {
      subject: "Nieuwe leningaanvraag - ALTUS FINANCE GROUP",
      headerTitle: "📋 Nieuwe leningaanvraag",
      message: "Er is een nieuwe leningaanvraag ingediend die uw aandacht vereist.",
      applicantLabel: "Aanvrager:",
      emailLabel: "E-mail:",
      amountLabel: "Aangevraagd bedrag:",
      loanTypeLabel: "Type lening:",
      referenceLabel: "Referentie:",
      userIdLabel: "Gebruikers-ID:",
      actionButton: "Aanvraag beoordelen",
      footer: "Alle rechten voorbehouden."
    },
    kycUploadedAdmin: {
      subject: "Nieuw KYC-document geüpload - ALTUS FINANCE GROUP",
      headerTitle: "📄 Nieuw KYC-document",
      message: "Er is een nieuw KYC-document geüpload dat uw verificatie vereist.",
      userLabel: "Gebruiker:",
      emailLabel: "E-mail:",
      documentTypeLabel: "Type document:",
      loanTypeLabel: "Type lening:",
      userIdLabel: "Gebruikers-ID:",
      actionButton: "Document verifiëren",
      footer: "Alle rechten voorbehouden."
    },
    loanApprovedUser: {
      subject: "Gefeliciteerd! Uw lening is goedgekeurd - ALTUS FINANCE GROUP",
      headerTitle: "🎉 Gefeliciteerd!",
      headerSubtitle: "Uw lening is goedgekeurd",
      greeting: "Hallo",
      approvalMessage: "Geweldig nieuws! Uw leningaanvraag van",
      approvalMessage2: "is goedgekeurd.",
      referenceLabel: "Referentie:",
      nextStepsTitle: "Volgende stappen:",
      step1: "Download uw leningscontract vanuit uw klantengebied",
      step2: "Onderteken het contract en stuur het naar ons terug",
      step3: "De middelen worden binnen 24 uur na ontvangst van het ondertekende contract vrijgegeven",
      loginButton: "Ga naar mijn klantengebied",
      importantTitle: "⚠️ Belangrijk:",
      importantMessage: "U moet het contract ondertekenen en terugsturen opdat de middelen kunnen worden vrijgegeven.",
      supportText: "Ons team blijft tot uw beschikking voor al uw vragen.",
      footer: "Alle rechten voorbehouden."
    },
    transferInitiatedAdmin: {
      subject: "Nieuwe overboeking geïnitieerd - ALTUS FINANCE GROUP",
      headerTitle: "💸 Nieuwe overboeking geïnitieerd",
      message: "Er is een nieuwe overboeking geïnitieerd die uw aandacht vereist.",
      userLabel: "Gebruiker:",
      emailLabel: "E-mail:",
      amountLabel: "Bedrag:",
      recipientLabel: "Ontvanger:",
      transferIdLabel: "Overboekings-ID:",
      userIdLabel: "Gebruikers-ID:",
      actionButton: "Overboeking bekijken",
      footer: "Alle rechten voorbehouden."
    },
    transferCodeUser: {
      subject: "Validatiecode voor uw overboeking - ALTUS FINANCE GROUP",
      headerTitle: "🔐 Validatiecode",
      greeting: "Hallo",
      transferInfoTitle: "Overboekingsdetails",
      amountLabel: "Bedrag:",
      recipientLabel: "Ontvanger:",
      codeTitle: "Uw validatiecode",
      codeSequence: "Code",
      codeOf: "van",
      instruction: "Gebruik de onderstaande code om uw overboeking te valideren:",
      expirationText: "Deze code verloopt over 15 minuten.",
      securityWarning: "⚠️ Voor uw veiligheid, deel deze code nooit met iemand. Ons team zal u nooit om deze code vragen.",
      notYouText: "Als u deze overboeking niet heeft geïnitieerd, neem dan onmiddellijk contact met ons op.",
      footer: "Alle rechten voorbehouden."
    }
  }
};

function getVerificationTemplate(lang: Language, vars: VerificationVariables): EmailTemplate {
  const t = translations[lang].verification;
  const accountTypes = translations[lang].accountTypes;
  const currentYear = new Date().getFullYear();
  
  const translatedAccountType = (accountTypes as any)[vars.accountTypeText] || vars.accountTypeText;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        .link { color: #2563eb; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">ALTUS FINANCE GROUP</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${t.tagline}</p>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">${t.greeting} ${escapeHtml(vars.fullName)},</h2>
          <p>${t.thankYou} <strong>${escapeHtml(translatedAccountType)}</strong>.</p>
          <p>${t.instruction}</p>
          <div style="text-align: center;">
            <a href="${vars.verificationUrl}" class="button">${t.buttonText}</a>
          </div>
          <p style="margin-top: 20px;">${t.alternativeText}</p>
          <p class="link">${vars.verificationUrl}</p>
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            ${t.disclaimerText}
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} ALTUS FINANCE GROUP. ${t.footer}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    ${t.greeting} ${vars.fullName},
    
    ${t.textVersion.thankYou} ${translatedAccountType}.
    
    ${t.textVersion.instruction}
    ${vars.verificationUrl}
    
    ${t.textVersion.disclaimer}
    
    ${t.textVersion.signature}
  `;

  return {
    subject: t.subject,
    html,
    text
  };
}

function getWelcomeTemplate(lang: Language, vars: WelcomeVariables): EmailTemplate {
  const t = translations[lang].welcome;
  const accountTypes = translations[lang].accountTypes;
  const currentYear = new Date().getFullYear();
  
  const translatedAccountType = (accountTypes as any)[vars.accountTypeText] || vars.accountTypeText;
  const featuresHtml = t.features.map(feature => `<li>${feature}</li>`).join('');
  const featuresText = t.features.map((feature, index) => `${index + 1}. ${feature}`).join('\n');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">${t.headerTitle}</h1>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">${t.greeting} ${escapeHtml(vars.fullName)},</h2>
          <p>${t.verifiedMessage} <strong>${escapeHtml(translatedAccountType)}</strong> ${t.activeMessage}</p>
          <p>${t.featuresIntro}</p>
          <ul>
            ${featuresHtml}
          </ul>
          <div style="text-align: center;">
            <a href="${vars.loginUrl}" class="button">${t.buttonText}</a>
          </div>
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            ${t.supportText}
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} ALTUS FINANCE GROUP. ${t.footer}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    ${t.greeting} ${vars.fullName},
    
    ${t.verifiedMessage} ${translatedAccountType} ${t.activeMessage}
    
    ${t.featuresIntro}
    ${featuresText}
    
    ${t.buttonText}: ${vars.loginUrl}
    
    ${t.supportText}
    
    ALTUS FINANCE GROUP
  `;

  return {
    subject: t.subject,
    html,
    text
  };
}

function getContractTemplate(lang: Language, vars: ContractVariables): EmailTemplate {
  const t = translations[lang].contract;
  const currentYear = new Date().getFullYear();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .info-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .step { margin: 15px 0; padding-left: 30px; position: relative; }
        .step::before { content: "✓"; position: absolute; left: 0; background: #10b981; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">${t.headerTitle}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${t.headerSubtitle}</p>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">${t.greeting} ${escapeHtml(vars.fullName)},</h2>
          <p>${t.approvedMessage} <strong>${escapeHtml(vars.amount)} €</strong> ${t.approvedMessage2}</p>
          
          <div class="info-box">
            <p style="margin: 0;"><strong>${t.contractReadyTitle}</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">${t.referenceLabel} ${escapeHtml(vars.loanId)}</p>
          </div>

          <div class="steps">
            <h3 style="margin-top: 0; color: #1f2937;">${t.nextStepsTitle}</h3>
            <div class="step">
              <strong>${t.step1Title}</strong><br>
              <span style="color: #6b7280; font-size: 14px;">${t.step1Text}</span>
            </div>
            <div class="step">
              <strong>${t.step2Title}</strong><br>
              <span style="color: #6b7280; font-size: 14px;">${t.step2Text}</span>
            </div>
            <div class="step">
              <strong>${t.step3Title}</strong><br>
              <span style="color: #6b7280; font-size: 14px;">${t.step3Text} ${escapeHtml(vars.fromEmail)}</span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${vars.contractUrl}" class="button">${t.downloadButton}</a>
          </div>

          <p style="margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <strong>${t.importantTitle}</strong> ${t.importantMessage}
          </p>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            ${t.accessNote}
          </p>
        </div>
        <div class="footer">
          <p>${t.contactText} ${escapeHtml(vars.fromEmail)}</p>
          <p>&copy; ${currentYear} ALTUS FINANCE GROUP. ${t.footer}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    ${t.greeting} ${vars.fullName},
    
    ${t.headerTitle}
    
    ${t.approvedMessage} ${vars.amount} € ${t.approvedMessage2}
    
    ${t.contractReadyTitle}
    ${t.referenceLabel} ${vars.loanId}
    
    ${t.nextStepsTitle}
    1. ${t.step1Title}: ${t.step1Text}
    2. ${t.step2Title}: ${t.step2Text}
    3. ${t.step3Title}: ${t.step3Text} ${vars.fromEmail}
    
    ${t.downloadButton}: ${vars.contractUrl}
    
    ${t.importantTitle} ${t.importantMessage}
    
    ${t.accessNote}
    
    ${t.contactText} ${vars.fromEmail}
    
    ALTUS FINANCE GROUP
  `;

  return {
    subject: t.subject,
    html,
    text
  };
}

function getFundingReleaseTemplate(lang: Language, vars: FundingReleaseVariables): EmailTemplate {
  const t = translations[lang].fundingRelease;
  const currentYear = new Date().getFullYear();
  const dashboardUrl = `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/dashboard`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .info-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        .reminder-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">${t.headerTitle}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${t.headerSubtitle}</p>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">${t.greeting} ${escapeHtml(vars.fullName)},</h2>
          <p>${t.releaseMessage} <strong>${escapeHtml(vars.amount)} €</strong> ${t.releaseMessage2}</p>
          
          <div class="info-box">
            <p style="margin: 0;"><strong>${t.availabilityTitle}</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">${t.referenceLabel} ${escapeHtml(vars.loanId)}</p>
            <p style="margin: 10px 0 0 0;">${t.availabilityText}</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">${t.nextStepsTitle}</h3>
            <ul>
              <li>${t.step1}</li>
              <li>${t.step2}</li>
              <li>${t.step3}</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="button">${t.dashboardButton}</a>
          </div>

          <div class="reminder-box">
            <p style="margin: 0;"><strong>${t.reminderTitle}</strong></p>
            <p style="margin: 10px 0 0 0;">${t.reminderText}</p>
          </div>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            ${t.supportText}
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} ALTUS FINANCE GROUP. ${t.footer}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    ${t.greeting} ${vars.fullName},
    
    ${t.headerTitle}
    
    ${t.releaseMessage} ${vars.amount} € ${t.releaseMessage2}
    
    ${t.referenceLabel} ${vars.loanId}
    ${t.availabilityText}
    
    ${t.nextStepsTitle}
    - ${t.step1}
    - ${t.step2}
    - ${t.step3}
    
    ${t.dashboardButton}: ${dashboardUrl}
    
    ${t.reminderTitle}
    ${t.reminderText}
    
    ${t.supportText}
    
    ALTUS FINANCE GROUP
  `;

  return {
    subject: t.subject,
    html,
    text
  };
}

function getLoanRequestUserTemplate(lang: Language, vars: LoanRequestUserVariables): EmailTemplate {
  const t = translations[lang].loanRequestUser;
  const currentYear = new Date().getFullYear();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .info-box { background: white; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">${t.headerTitle}</h1>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">${t.greeting} ${escapeHtml(vars.fullName)},</h2>
          <p>${t.confirmationMessage} <strong>${escapeHtml(vars.loanType)}</strong> ${t.confirmationMessage2} <strong>${escapeHtml(vars.amount)} €</strong>.</p>
          
          <div class="info-box">
            <p style="margin: 0;"><strong>${t.referenceLabel}</strong> ${escapeHtml(vars.reference)}</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">${t.nextStepsTitle}</h3>
            <ul>
              <li>${t.step1}</li>
              <li>${t.step2}</li>
              <li>${t.step3}</li>
            </ul>
          </div>

          <p>${t.dashboardText}</p>
          
          <div style="text-align: center;">
            <a href="${vars.dashboardUrl}" class="button">${t.dashboardButton}</a>
          </div>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            ${t.supportText}
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} ALTUS FINANCE GROUP. ${t.footer}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    ${t.greeting} ${vars.fullName},
    
    ${t.confirmationMessage} ${vars.loanType} ${t.confirmationMessage2} ${vars.amount} €.
    
    ${t.referenceLabel} ${vars.reference}
    
    ${t.nextStepsTitle}
    - ${t.step1}
    - ${t.step2}
    - ${t.step3}
    
    ${t.dashboardText}
    
    ${t.dashboardButton}: ${vars.dashboardUrl}
    
    ${t.supportText}
    
    ALTUS FINANCE GROUP
  `;

  return {
    subject: t.subject,
    html,
    text
  };
}

function getLoanRequestAdminTemplate(lang: Language, vars: LoanRequestAdminVariables): EmailTemplate {
  const t = translations[lang].loanRequestAdmin;
  const currentYear = new Date().getFullYear();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .info-table { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: bold; width: 150px; color: #6b7280; }
        .info-value { color: #1f2937; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">${t.headerTitle}</h1>
        </div>
        <div class="content">
          <p>${t.message}</p>
          
          <div class="info-table">
            <div class="info-row">
              <div class="info-label">${t.applicantLabel}</div>
              <div class="info-value">${escapeHtml(vars.fullName)}</div>
            </div>
            <div class="info-row">
              <div class="info-label">${t.emailLabel}</div>
              <div class="info-value">${escapeHtml(vars.email)}</div>
            </div>
            <div class="info-row">
              <div class="info-label">${t.amountLabel}</div>
              <div class="info-value">${escapeHtml(vars.amount)} €</div>
            </div>
            <div class="info-row">
              <div class="info-label">${t.loanTypeLabel}</div>
              <div class="info-value">${escapeHtml(vars.loanType)}</div>
            </div>
            <div class="info-row">
              <div class="info-label">${t.referenceLabel}</div>
              <div class="info-value">${escapeHtml(vars.reference)}</div>
            </div>
            <div class="info-row">
              <div class="info-label">${t.userIdLabel}</div>
              <div class="info-value">${escapeHtml(vars.userId)}</div>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${vars.reviewUrl}" class="button">${t.actionButton}</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} ALTUS FINANCE GROUP. ${t.footer}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    ${t.headerTitle}
    
    ${t.message}
    
    ${t.applicantLabel} ${vars.fullName}
    ${t.emailLabel} ${vars.email}
    ${t.amountLabel} ${vars.amount} €
    ${t.loanTypeLabel} ${vars.loanType}
    ${t.referenceLabel} ${vars.reference}
    ${t.userIdLabel} ${vars.userId}
    
    ${t.actionButton}: ${vars.reviewUrl}
    
    ALTUS FINANCE GROUP
  `;

  return {
    subject: t.subject,
    html,
    text
  };
}

function getKYCUploadedAdminTemplate(lang: Language, vars: KycUploadedAdminVariables): EmailTemplate {
  const t = translations[lang].kycUploadedAdmin;
  const currentYear = new Date().getFullYear();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #8b5cf6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .info-table { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: bold; width: 150px; color: #6b7280; }
        .info-value { color: #1f2937; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">${t.headerTitle}</h1>
        </div>
        <div class="content">
          <p>${t.message}</p>
          
          <div class="info-table">
            <div class="info-row">
              <div class="info-label">${t.userLabel}</div>
              <div class="info-value">${escapeHtml(vars.fullName)}</div>
            </div>
            <div class="info-row">
              <div class="info-label">${t.emailLabel}</div>
              <div class="info-value">${escapeHtml(vars.email)}</div>
            </div>
            <div class="info-row">
              <div class="info-label">${t.documentTypeLabel}</div>
              <div class="info-value">${escapeHtml(vars.documentType)}</div>
            </div>
            <div class="info-row">
              <div class="info-label">${t.loanTypeLabel}</div>
              <div class="info-value">${escapeHtml(vars.loanType)}</div>
            </div>
            <div class="info-row">
              <div class="info-label">${t.userIdLabel}</div>
              <div class="info-value">${escapeHtml(vars.userId)}</div>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${vars.reviewUrl}" class="button">${t.actionButton}</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} ALTUS FINANCE GROUP. ${t.footer}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    ${t.headerTitle}
    
    ${t.message}
    
    ${t.userLabel} ${vars.fullName}
    ${t.emailLabel} ${vars.email}
    ${t.documentTypeLabel} ${vars.documentType}
    ${t.loanTypeLabel} ${vars.loanType}
    ${t.userIdLabel} ${vars.userId}
    
    ${t.actionButton}: ${vars.reviewUrl}
    
    ALTUS FINANCE GROUP
  `;

  return {
    subject: t.subject,
    html,
    text
  };
}

function getLoanApprovedUserTemplate(lang: Language, vars: LoanApprovedUserVariables): EmailTemplate {
  const t = translations[lang].loanApprovedUser;
  const currentYear = new Date().getFullYear();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .info-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">${t.headerTitle}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${t.headerSubtitle}</p>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">${t.greeting} ${escapeHtml(vars.fullName)},</h2>
          <p>${t.approvalMessage} <strong>${escapeHtml(vars.loanType)}</strong> <strong>${escapeHtml(vars.amount)} €</strong> ${t.approvalMessage2}</p>
          
          <div class="info-box">
            <p style="margin: 0;"><strong>${t.referenceLabel}</strong> ${escapeHtml(vars.reference)}</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">${t.nextStepsTitle}</h3>
            <ul>
              <li>${t.step1}</li>
              <li>${t.step2}</li>
              <li>${t.step3}</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="${vars.loginUrl}" class="button">${t.loginButton}</a>
          </div>

          <div class="warning-box">
            <p style="margin: 0; color: #92400e;"><strong>${t.importantTitle}</strong> ${t.importantMessage}</p>
          </div>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            ${t.supportText}
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} ALTUS FINANCE GROUP. ${t.footer}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    ${t.greeting} ${vars.fullName},
    
    ${t.headerTitle}
    ${t.headerSubtitle}
    
    ${t.approvalMessage} ${vars.loanType} ${vars.amount} € ${t.approvalMessage2}
    
    ${t.referenceLabel} ${vars.reference}
    
    ${t.nextStepsTitle}
    - ${t.step1}
    - ${t.step2}
    - ${t.step3}
    
    ${t.loginButton}: ${vars.loginUrl}
    
    ${t.importantTitle} ${t.importantMessage}
    
    ${t.supportText}
    
    ALTUS FINANCE GROUP
  `;

  return {
    subject: t.subject,
    html,
    text
  };
}

function getTransferInitiatedAdminTemplate(lang: Language, vars: TransferInitiatedAdminVariables): EmailTemplate {
  const t = translations[lang].transferInitiatedAdmin;
  const currentYear = new Date().getFullYear();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #ec4899; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .info-table { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: bold; width: 150px; color: #6b7280; }
        .info-value { color: #1f2937; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">${t.headerTitle}</h1>
        </div>
        <div class="content">
          <p>${t.message}</p>
          
          <div class="info-table">
            <div class="info-row">
              <div class="info-label">${t.userLabel}</div>
              <div class="info-value">${escapeHtml(vars.fullName)}</div>
            </div>
            <div class="info-row">
              <div class="info-label">${t.emailLabel}</div>
              <div class="info-value">${escapeHtml(vars.email)}</div>
            </div>
            <div class="info-row">
              <div class="info-label">${t.amountLabel}</div>
              <div class="info-value">${escapeHtml(vars.amount)} €</div>
            </div>
            <div class="info-row">
              <div class="info-label">${t.recipientLabel}</div>
              <div class="info-value">${escapeHtml(vars.recipient)}</div>
            </div>
            <div class="info-row">
              <div class="info-label">${t.transferIdLabel}</div>
              <div class="info-value">${escapeHtml(vars.transferId)}</div>
            </div>
            <div class="info-row">
              <div class="info-label">${t.userIdLabel}</div>
              <div class="info-value">${escapeHtml(vars.userId)}</div>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${vars.reviewUrl}" class="button">${t.actionButton}</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} ALTUS FINANCE GROUP. ${t.footer}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    ${t.headerTitle}
    
    ${t.message}
    
    ${t.userLabel} ${vars.fullName}
    ${t.emailLabel} ${vars.email}
    ${t.amountLabel} ${vars.amount} €
    ${t.recipientLabel} ${vars.recipient}
    ${t.transferIdLabel} ${vars.transferId}
    ${t.userIdLabel} ${vars.userId}
    
    ${t.actionButton}: ${vars.reviewUrl}
    
    ALTUS FINANCE GROUP
  `;

  return {
    subject: t.subject,
    html,
    text
  };
}

function getTransferCodeUserTemplate(lang: Language, vars: TransferCodeUserVariables): EmailTemplate {
  const t = translations[lang].transferCodeUser;
  const currentYear = new Date().getFullYear();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .code-section { background: #f8f9fa; border: 2px solid #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
        .code-title { color: #667eea; font-size: 14px; font-weight: 600; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
        .code { font-size: 42px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
        .code-sequence { color: #666666; font-size: 14px; margin-top: 10px; }
        .expiration { color: #666666; font-size: 14px; margin-top: 15px; }
        .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .info-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">${t.headerTitle}</h1>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">${t.greeting} ${escapeHtml(vars.fullName)},</h2>
          
          <div class="info-box">
            <p style="margin: 0;"><strong>${t.transferInfoTitle}</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">${t.amountLabel} ${escapeHtml(vars.amount)} €</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">${t.recipientLabel} ${escapeHtml(vars.recipient)}</p>
          </div>

          <p>${t.instruction}</p>

          <div class="code-section">
            <div class="code-title">${t.codeTitle}</div>
            <div class="code">${escapeHtml(vars.code)}</div>
            <div class="code-sequence">${t.codeSequence} ${vars.codeSequence} ${t.codeOf} ${vars.totalCodes}</div>
            <div class="expiration">${t.expirationText}</div>
          </div>

          <div class="warning-box">
            <p style="margin: 0; color: #856404;">${t.securityWarning}</p>
          </div>

          <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            ${t.notYouText}
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} ALTUS FINANCE GROUP. ${t.footer}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    ${t.greeting} ${vars.fullName},
    
    ${t.headerTitle}
    
    ${t.transferInfoTitle}
    ${t.amountLabel} ${vars.amount} €
    ${t.recipientLabel} ${vars.recipient}
    
    ${t.instruction}
    
    ${t.codeTitle}
    ${vars.code}
    ${t.codeSequence} ${vars.codeSequence} ${t.codeOf} ${vars.totalCodes}
    
    ${t.expirationText}
    
    ${t.securityWarning}
    
    ${t.notYouText}
    
    ALTUS FINANCE GROUP
  `;

  return {
    subject: t.subject,
    html,
    text
  };
}

function getTransferCompletedUserTemplate(lang: Language, vars: TransferCompletedUserVariables): EmailTemplate {
  const t = (translations as any)[lang]?.transferCompletedUser || translations.fr.transferCompletedUser;
  const currentYear = new Date().getFullYear();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .info-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">${t.headerTitle}</h1>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">${t.greeting} ${escapeHtml(vars.fullName)},</h2>
          <div class="success-box">
            <p style="margin: 0; color: #065f46;">${t.congratulationsMessage}</p>
          </div>
          <h3>${t.summaryTitle}</h3>
          <div class="info-box">
            <p style="margin: 5px 0;"><strong>${t.amountLabel}</strong> ${escapeHtml(vars.amount)} €</p>
            <p style="margin: 5px 0;"><strong>${t.recipientLabel}</strong> ${escapeHtml(vars.recipient)}</p>
            <p style="margin: 5px 0;"><strong>${t.ibanLabel}</strong> ${escapeHtml(vars.recipientIban)}</p>
            <p style="margin: 5px 0;"><strong>${t.referenceLabel}</strong> ${escapeHtml(vars.transferId)}</p>
          </div>
          <h3>${t.availabilityTitle}</h3>
          <p>${t.availabilityMessage}</p>
          <h3>${t.supportTitle}</h3>
          <p>${t.supportMessage}</p>
          <p><strong>${t.supportEmail}</strong> ${escapeHtml(vars.supportEmail)}</p>
          <p style="margin-top: 30px;">${t.thanksMessage}</p>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} ALTUS FINANCE GROUP. ${t.footer}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `${t.greeting} ${vars.fullName},\n\n${t.congratulationsMessage}\n\n${t.summaryTitle}\n${t.amountLabel} ${vars.amount} €\n${t.recipientLabel} ${vars.recipient}\n${t.ibanLabel} ${vars.recipientIban}\n${t.referenceLabel} ${vars.transferId}\n\n${t.availabilityTitle}\n${t.availabilityMessage}\n\n${t.supportTitle}\n${t.supportMessage}\n${t.supportEmail} ${vars.supportEmail}\n\n${t.thanksMessage}\n\nALTUS FINANCE GROUP`;

  return { subject: t.subject, html, text };
}

function getTransferCompletedAdminTemplate(lang: Language, vars: TransferCompletedAdminVariables): EmailTemplate {
  const t = (translations as any)[lang]?.transferCompletedAdmin || translations.fr.transferCompletedAdmin;
  const currentYear = new Date().getFullYear();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-section { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">${t.headerTitle}</h1>
        </div>
        <div class="content">
          <p>${t.message}</p>
          <h3>${t.userInfoTitle}</h3>
          <div class="info-section">
            <p style="margin: 5px 0;"><strong>${t.userLabel}</strong> ${escapeHtml(vars.fullName)}</p>
            <p style="margin: 5px 0;"><strong>${t.emailLabel}</strong> ${escapeHtml(vars.email)}</p>
            <p style="margin: 5px 0;"><strong>${t.userIdLabel}</strong> ${escapeHtml(vars.userId)}</p>
          </div>
          <h3>${t.transferInfoTitle}</h3>
          <div class="info-section">
            <p style="margin: 5px 0;"><strong>${t.amountLabel}</strong> ${escapeHtml(vars.amount)} €</p>
            <p style="margin: 5px 0;"><strong>${t.recipientLabel}</strong> ${escapeHtml(vars.recipient)}</p>
            <p style="margin: 5px 0;"><strong>${t.ibanLabel}</strong> ${escapeHtml(vars.recipientIban)}</p>
            <p style="margin: 5px 0;"><strong>${t.transferIdLabel}</strong> ${escapeHtml(vars.transferId)}</p>
          </div>
          <h3>${t.progressTitle}</h3>
          <div class="info-section">
            <p style="margin: 5px 0;"><strong>${t.validationsLabel}</strong> ${vars.totalValidations}</p>
            <p style="margin: 5px 0;"><strong>${t.completedAtLabel}</strong> ${escapeHtml(vars.completedAt)}</p>
          </div>
          <a href="${vars.reviewUrl}" class="button">${t.actionButton}</a>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} ALTUS FINANCE GROUP. ${t.footer}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `${t.headerTitle}\n\n${t.message}\n\n${t.userInfoTitle}\n${t.userLabel} ${vars.fullName}\n${t.emailLabel} ${vars.email}\n${t.userIdLabel} ${vars.userId}\n\n${t.transferInfoTitle}\n${t.amountLabel} ${vars.amount} €\n${t.recipientLabel} ${vars.recipient}\n${t.ibanLabel} ${vars.recipientIban}\n${t.transferIdLabel} ${vars.transferId}\n\n${t.progressTitle}\n${t.validationsLabel} ${vars.totalValidations}\n${t.completedAtLabel} ${vars.completedAt}\n\n${t.actionButton}: ${vars.reviewUrl}\n\nALTUS FINANCE GROUP`;

  return { subject: t.subject, html, text };
}

export function getEmailTemplate(
  templateType: TemplateType,
  language: Language,
  variables: TemplateVariables
): EmailTemplate {
  switch (templateType) {
    case 'verification':
      return getVerificationTemplate(language, variables as VerificationVariables);
    case 'welcome':
      return getWelcomeTemplate(language, variables as WelcomeVariables);
    case 'contract':
      return getContractTemplate(language, variables as ContractVariables);
    case 'fundingRelease':
      return getFundingReleaseTemplate(language, variables as FundingReleaseVariables);
    case 'otp':
      return getOtpEmailTemplate(language, variables as OtpVariables);
    case 'loanRequestUser':
      return getLoanRequestUserTemplate(language, variables as LoanRequestUserVariables);
    case 'loanRequestAdmin':
      return getLoanRequestAdminTemplate(language, variables as LoanRequestAdminVariables);
    case 'kycUploadedAdmin':
      return getKYCUploadedAdminTemplate(language, variables as KycUploadedAdminVariables);
    case 'loanApprovedUser':
      return getLoanApprovedUserTemplate(language, variables as LoanApprovedUserVariables);
    case 'transferInitiatedAdmin':
      return getTransferInitiatedAdminTemplate(language, variables as TransferInitiatedAdminVariables);
    case 'transferCodeUser':
      return getTransferCodeUserTemplate(language, variables as TransferCodeUserVariables);
    case 'transferCompletedUser':
      return getTransferCompletedUserTemplate(language, variables as TransferCompletedUserVariables);
    case 'transferCompletedAdmin':
      return getTransferCompletedAdminTemplate(language, variables as TransferCompletedAdminVariables);
    case 'transferCodesAdmin':
      return getTransferCodesAdminTemplate(language, variables as TransferCodesAdminVariables);
    default:
      throw new Error(`Unknown template type: ${templateType}`);
  }
}

export function getOtpEmailTemplate(
  language: Language,
  vars: OtpVariables
): EmailTemplate {
  const t = (translations as any)[language]?.otp || translations.fr.otp;

  const html = `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 40px 20px; text-align: center; }
        .header-title { margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #333333; margin-bottom: 20px; }
        .code-section { background: #f8f9fa; border: 2px solid #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
        .code-title { color: #667eea; font-size: 14px; font-weight: 600; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
        .code { font-size: 42px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
        .expiration { color: #666666; font-size: 14px; margin-top: 15px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .warning-text { color: #856404; font-size: 14px; margin: 0; }
        .not-you { color: #666666; font-size: 14px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="header-title">${escapeHtml(t.headerTitle)}</h1>
        </div>
        <div class="content">
          <p class="greeting">${escapeHtml(t.greeting)} ${escapeHtml(vars.fullName)},</p>
          <p>${escapeHtml(t.instruction)}</p>
          
          <div class="code-section">
            <div class="code-title">${escapeHtml(t.codeTitle)}</div>
            <div class="code">${escapeHtml(vars.otpCode)}</div>
            <div class="expiration">${escapeHtml(t.expirationText)}</div>
          </div>
          
          <div class="warning">
            <p class="warning-text">${escapeHtml(t.securityWarning)}</p>
          </div>
          
          <p class="not-you">${escapeHtml(t.notYouText)}</p>
        </div>
        <div class="footer">
          <p>ALTUS FINANCE GROUP</p>
          <p>${escapeHtml(t.footer)}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
${t.greeting} ${vars.fullName},

${t.headerTitle}

${t.instruction}

${t.codeTitle}: ${vars.otpCode}

${t.expirationText}

${t.securityWarning}

${t.notYouText}

ALTUS FINANCE GROUP
${t.footer}
  `;

  return {
    subject: t.subject,
    html,
    text
  };
}

export function getTransferCodesAdminTemplate(
  language: Language,
  vars: TransferCodesAdminVariables
): EmailTemplate {
  const t = (translations as any)[language]?.transferCodesAdmin || translations.fr.transferCodesAdmin;

  const codesTableRows = vars.codes
    .map(code => `
      <tr>
        <td style="padding: 12px; border: 1px solid #d1d5db;">${code.sequence}/5</td>
        <td style="padding: 12px; border: 1px solid #d1d5db;"><strong>${escapeHtml(code.code)}</strong></td>
        <td style="padding: 12px; border: 1px solid #d1d5db;">${code.pausePercent}%</td>
        <td style="padding: 12px; border: 1px solid #d1d5db;">${escapeHtml(code.context)}</td>
      </tr>
    `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 650px; margin: 30px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: #ffffff; padding: 30px; text-align: center; }
        .header-title { font-size: 24px; font-weight: bold; margin: 0; }
        .content { padding: 30px; }
        .info-section { background: #f8f9fa; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
        .info-row { margin: 8px 0; }
        .label { font-weight: bold; color: #1f2937; }
        .value { color: #374151; }
        .codes-title { font-size: 18px; font-weight: bold; color: #1e40af; margin: 25px 0 15px; }
        .instruction { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 12px; margin: 15px 0; color: #1e40af; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #2563eb; color: white; padding: 12px; text-align: left; font-weight: bold; }
        td { padding: 12px; border: 1px solid #d1d5db; }
        tr:nth-child(even) { background-color: #f9fafb; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .warning-title { color: #856404; font-weight: bold; margin-bottom: 8px; }
        .warning-text { color: #856404; font-size: 14px; margin: 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="header-title">${escapeHtml(t.headerTitle)}</h1>
        </div>
        <div class="content">
          <p>${escapeHtml(t.message)}</p>
          
          <div class="info-section">
            <div class="info-row">
              <span class="label">${escapeHtml(t.userLabel)}</span>
              <span class="value">${escapeHtml(vars.fullName)}</span>
            </div>
            <div class="info-row">
              <span class="label">${escapeHtml(t.amountLabel)}</span>
              <span class="value">${escapeHtml(vars.amount)} EUR</span>
            </div>
            <div class="info-row">
              <span class="label">${escapeHtml(t.loanIdLabel)}</span>
              <span class="value">${escapeHtml(vars.loanId)}</span>
            </div>
          </div>

          <h2 class="codes-title">${escapeHtml(t.codesTitle)}</h2>
          <div class="instruction">${escapeHtml(t.codeInstruction)}</div>
          
          <table>
            <thead>
              <tr>
                <th>${escapeHtml(t.sequenceLabel)}</th>
                <th>Code</th>
                <th>${escapeHtml(t.pauseLabel)}</th>
                <th>${escapeHtml(t.contextLabel)}</th>
              </tr>
            </thead>
            <tbody>
              ${codesTableRows}
            </tbody>
          </table>

          <div class="warning">
            <div class="warning-title">${escapeHtml(t.importantTitle)}</div>
            <p class="warning-text">${escapeHtml(t.importantMessage)}</p>
          </div>
        </div>
        <div class="footer">
          <p>ALTUS FINANCE GROUP</p>
          <p>${escapeHtml(t.footer)}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const codesTextList = vars.codes
    .map(code => `  ${code.sequence}/5. Code: ${code.code} - ${t.pauseLabel} ${code.pausePercent}% - ${code.context}`)
    .join('\n');

  const text = `
${t.headerTitle}

${t.message}

${t.userLabel} ${vars.fullName}
${t.amountLabel} ${vars.amount} EUR
${t.loanIdLabel} ${vars.loanId}

${t.codesTitle}

${t.codeInstruction}

${codesTextList}

${t.importantTitle}
${t.importantMessage}

ALTUS FINANCE GROUP
${t.footer}
  `;

  return {
    subject: t.subject,
    html,
    text
  };
}
