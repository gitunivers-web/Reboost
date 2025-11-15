import * as fs from 'fs';
import * as path from 'path';

const translationsToAdd = {
  toast: {
    transferInProgress: {
      fr: "Transfert en cours",
      en: "Transfer in progress",
      es: "Transferencia en curso",
      pt: "Transferência em andamento",
      it: "Trasferimento in corso",
      de: "Überweisung läuft",
      nl: "Overdracht bezig"
    },
    transferAlreadyInProgress: {
      fr: "Un transfert est déjà en cours pour ce prêt. Redirection...",
      en: "A transfer is already in progress for this loan. Redirecting...",
      es: "Ya hay una transferencia en curso para este préstamo. Redirigiendo...",
      pt: "Já existe uma transferência em andamento para este empréstimo. Redirecionando...",
      it: "Un trasferimento è già in corso per questo prestito. Reindirizzamento...",
      de: "Für dieses Darlehen läuft bereits eine Überweisung. Weiterleitung...",
      nl: "Er is al een overdracht bezig voor deze lening. Omleiden..."
    },
    transferInitiated: {
      fr: "Transfert initié avec succès. Vérification en cours...",
      en: "Transfer initiated successfully. Verification in progress...",
      es: "Transferencia iniciada con éxito. Verificación en curso...",
      pt: "Transferência iniciada com sucesso. Verificação em andamento...",
      it: "Trasferimento avviato con successo. Verifica in corso...",
      de: "Überweisung erfolgreich eingeleitet. Verifizierung läuft...",
      nl: "Overdracht succesvol geïnitieerd. Verificatie bezig..."
    },
    selectExternalAccount: {
      fr: "Veuillez sélectionner un compte externe.",
      en: "Please select an external account.",
      es: "Por favor, seleccione una cuenta externa.",
      pt: "Por favor, selecione uma conta externa.",
      it: "Si prega di selezionare un conto esterno.",
      de: "Bitte wählen Sie ein externes Konto.",
      nl: "Selecteer een extern account."
    },
    noActiveLoan: {
      fr: "Aucun prêt actif disponible.",
      en: "No active loan available.",
      es: "No hay préstamo activo disponible.",
      pt: "Nenhum empréstimo ativo disponível.",
      it: "Nessun prestito attivo disponibile.",
      de: "Kein aktives Darlehen verfügbar.",
      nl: "Geen actieve lening beschikbaar."
    }
  },
  form: {
    amountHelper: {
      fr: "Montant fixe basé sur votre prêt actif (non modifiable)",
      en: "Fixed amount based on your active loan (not editable)",
      es: "Monto fijo basado en su préstamo activo (no modificable)",
      pt: "Valor fixo baseado no seu empréstimo ativo (não editável)",
      it: "Importo fisso basato sul prestito attivo (non modificabile)",
      de: "Fester Betrag basierend auf Ihrem aktiven Darlehen (nicht änderbar)",
      nl: "Vast bedrag gebaseerd op uw actieve lening (niet bewerkbaar)"
    },
    externalAccountLabel: {
      fr: "Compte externe *",
      en: "External account *",
      es: "Cuenta externa *",
      pt: "Conta externa *",
      it: "Conto esterno *",
      de: "Externes Konto *",
      nl: "Extern account *"
    },
    selectAccountPlaceholder: {
      fr: "Sélectionner un compte",
      en: "Select an account",
      es: "Seleccionar una cuenta",
      pt: "Selecionar uma conta",
      it: "Seleziona un conto",
      de: "Konto auswählen",
      nl: "Selecteer een account"
    }
  },
  progress: {
    securityVerificationTitle: {
      fr: "Vérification de sécurité",
      en: "Security verification",
      es: "Verificación de seguridad",
      pt: "Verificação de segurança",
      it: "Verifica di sicurezza",
      de: "Sicherheitsüberprüfung",
      nl: "Beveiligingsverificatie"
    },
    transferProcessingTitle: {
      fr: "Virement en cours de traitement",
      en: "Transfer being processed",
      es: "Transferencia en proceso",
      pt: "Transferência em processamento",
      it: "Trasferimento in elaborazione",
      de: "Überweisung wird verarbeitet",
      nl: "Overdracht wordt verwerkt"
    },
    toPrefix: {
      fr: "Vers:",
      en: "To:",
      es: "Para:",
      pt: "Para:",
      it: "A:",
      de: "An:",
      nl: "Naar:"
    },
    securityVerificationRequired: {
      fr: "Vérification de sécurité requise",
      en: "Security verification required",
      es: "Verificación de seguridad requerida",
      pt: "Verificação de segurança necessária",
      it: "Verifica di sicurezza richiesta",
      de: "Sicherheitsüberprüfung erforderlich",
      nl: "Beveiligingsverificatie vereist"
    },
    enterVerificationCode: {
      fr: "Pour des raisons de sécurité, veuillez saisir le code de vérification qui vous a été transmis",
      en: "For security reasons, please enter the verification code that was sent to you",
      es: "Por razones de seguridad, ingrese el código de verificación que se le envió",
      pt: "Por razões de segurança, insira o código de verificação que lhe foi enviado",
      it: "Per motivi di sicurezza, inserisci il codice di verifica che ti è stato inviato",
      de: "Aus Sicherheitsgründen geben Sie bitte den Ihnen zugesandten Verifizierungscode ein",
      nl: "Om veiligheidsredenen voert u de verificatiecode in die naar u is verzonden"
    },
    codeFromAdvisor: {
      fr: "Le code de sécurité vous sera communiqué par votre conseiller",
      en: "The security code will be provided by your advisor",
      es: "Su asesor le proporcionará el código de seguridad",
      pt: "O código de segurança será fornecido pelo seu consultor",
      it: "Il codice di sicurezza sarà fornito dal tuo consulente",
      de: "Der Sicherheitscode wird Ihnen von Ihrem Berater mitgeteilt",
      nl: "De beveiligingscode wordt verstrekt door uw adviseur"
    },
    validationCodeLabel: {
      fr: "Code de validation (6 chiffres)",
      en: "Validation code (6 digits)",
      es: "Código de validación (6 dígitos)",
      pt: "Código de validação (6 dígitos)",
      it: "Codice di validazione (6 cifre)",
      de: "Validierungscode (6 Ziffern)",
      nl: "Validatiecode (6 cijfers)"
    },
    enterCodePlaceholder: {
      fr: "Entrez le code à 6 chiffres",
      en: "Enter the 6-digit code",
      es: "Ingrese el código de 6 dígitos",
      pt: "Insira o código de 6 dígitos",
      it: "Inserisci il codice a 6 cifre",
      de: "Geben Sie den 6-stelligen Code ein",
      nl: "Voer de 6-cijferige code in"
    },
    validating: {
      fr: "Validation...",
      en: "Validating...",
      es: "Validando...",
      pt: "Validando...",
      it: "Validazione...",
      de: "Validierung...",
      nl: "Valideren..."
    },
    validateAndContinue: {
      fr: "Valider et continuer",
      en: "Validate and continue",
      es: "Validar y continuar",
      pt: "Validar e continuar",
      it: "Convalida e continua",
      de: "Validieren und fortfahren",
      nl: "Valideren en doorgaan"
    },
    processingTransfer: {
      fr: "Traitement de votre virement...",
      en: "Processing your transfer...",
      es: "Procesando su transferencia...",
      pt: "Processando sua transferência...",
      it: "Elaborazione del trasferimento...",
      de: "Ihre Überweisung wird verarbeitet...",
      nl: "Uw overdracht wordt verwerkt..."
    },
    doNotCloseProcessing: {
      fr: "Votre opération est en cours de traitement sécurisé. Ne fermez pas cette page.",
      en: "Your transaction is being securely processed. Do not close this page.",
      es: "Su operación se está procesando de forma segura. No cierre esta página.",
      pt: "Sua operação está sendo processada com segurança. Não feche esta página.",
      it: "La tua operazione è in fase di elaborazione sicura. Non chiudere questa pagina.",
      de: "Ihre Transaktion wird sicher verarbeitet. Schließen Sie diese Seite nicht.",
      nl: "Uw transactie wordt veilig verwerkt. Sluit deze pagina niet."
    }
  },
  complete: {
    successMessage: {
      fr: "Votre transfert a été effectué avec succès. Les fonds seront disponibles sous 24 à 72 heures.",
      en: "Your transfer has been completed successfully. The funds will be available within 24 to 72 hours.",
      es: "Su transferencia se ha completado con éxito. Los fondos estarán disponibles en 24 a 72 horas.",
      pt: "Sua transferência foi concluída com sucesso. Os fundos estarão disponíveis em 24 a 72 horas.",
      it: "Il tuo trasferimento è stato completato con successo. I fondi saranno disponibili entro 24-72 ore.",
      de: "Ihre Überweisung wurde erfolgreich abgeschlossen. Die Mittel sind innerhalb von 24 bis 72 Stunden verfügbar.",
      nl: "Uw overdracht is succesvol voltooid. De fondsen zijn binnen 24 tot 72 uur beschikbaar."
    },
    referenceLabel: {
      fr: "Référence",
      en: "Reference",
      es: "Referencia",
      pt: "Referência",
      it: "Riferimento",
      de: "Referenz",
      nl: "Referentie"
    },
    returnToDashboard: {
      fr: "Retour au tableau de bord",
      en: "Return to dashboard",
      es: "Volver al panel",
      pt: "Voltar ao painel",
      it: "Torna al pannello",
      de: "Zurück zum Dashboard",
      nl: "Terug naar dashboard"
    }
  }
};

const i18nFilePath = path.resolve(__dirname, '../client/src/lib/i18n.ts');

// Read the current file
let content = fs.readFileSync(i18nFilePath, 'utf-8');

// Function to add translations to a specific language section
function addTranslationsToLanguage(lang: string) {
  const langRegex = new RegExp(`(\\s+)(${lang}:\\s*{[\\s\\S]*?transferFlow:\\s*{)([\\s\\S]*?)(\\n\\s+},\\n\\s+},)`, 'g');
  
  content = content.replace(langRegex, (match, indent, prefix, existing, suffix) => {
    // Build new translations
    let additions = '';
    
    // Toast section
    if (!existing.includes('toast:')) {
      additions += `\n      toast: {`;
      Object.entries(translationsToAdd.toast).forEach(([key, translations]) => {
        additions += `\n        ${key}: "${translations[lang as keyof typeof translations.fr]}",`;
      });
      additions += `\n      },`;
    }
    
    // Form section additions
    const formAdditions: string[] = [];
    Object.entries(translationsToAdd.form).forEach(([key, translations]) => {
      if (!existing.includes(`${key}:`)) {
        formAdditions.push(`        ${key}: "${translations[lang as keyof typeof translations.fr]}",`);
      }
    });
    if (formAdditions.length > 0) {
      const formMatch = existing.match(/(form:\s*{[^}]*)/);
      if (formMatch) {
        existing = existing.replace(
          /(form:\s*{[^}]*)(},)/,
          `$1\n${formAdditions.join('\n')}\n      $2`
        );
      }
    }
    
    // Progress section additions
    const progressAdditions: string[] = [];
    Object.entries(translationsToAdd.progress).forEach(([key, translations]) => {
      if (!existing.includes(`${key}:`)) {
        progressAdditions.push(`        ${key}: "${translations[lang as keyof typeof translations.fr]}",`);
      }
    });
    if (progressAdditions.length > 0) {
      // Check if progress section exists
      if (existing.includes('progress:')) {
        existing = existing.replace(
          /(progress:\s*{[^}]*)(},)/,
          `$1\n${progressAdditions.join('\n')}\n      $2`
        );
      } else {
        // Add entire progress section after verification
        additions += `\n      progress: {`;
        Object.entries(translationsToAdd.progress).forEach(([key, translations]) => {
          additions += `\n        ${key}: "${translations[lang as keyof typeof translations.fr]}",`;
        });
        additions += `\n      },`;
      }
    }
    
    // Complete section additions
    const completeAdditions: string[] = [];
    Object.entries(translationsToAdd.complete).forEach(([key, translations]) => {
      if (!existing.includes(`${key}:`)) {
        completeAdditions.push(`        ${key}: "${translations[lang as keyof typeof translations.fr]}",`);
      }
    });
    if (completeAdditions.length > 0) {
      const completeMatch = existing.match(/(complete:\s*{[^}]*)/);
      if (completeMatch) {
        existing = existing.replace(
          /(complete:\s*{[^}]*)(},)/,
          `$1\n${completeAdditions.join('\n')}\n      $2`
        );
      }
    }
    
    return `${indent}${prefix}${additions}${existing}${suffix}`;
  });
}

// Add translations for each language
['fr', 'en', 'es', 'pt', 'it', 'de', 'nl'].forEach(lang => {
  addTranslationsToLanguage(lang);
});

// Write back to file
fs.writeFileSync(i18nFilePath, content, 'utf-8');

console.log('✅ TransferFlow translations added successfully!');
