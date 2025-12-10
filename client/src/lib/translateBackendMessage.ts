import { Language, translations } from './i18n';

/**
 * Mapping des messages français du backend vers les clés de traduction
 * Cela permet de traduire automatiquement les messages du backend
 */
const messageMapping: Record<string, { key: string; path: string[] }> = {
  // Auth - Signup
  'Votre compte a été créé avec succès. Un lien de confirmation vous a été envoyé par courriel.': {
    key: 'signupSuccessDesc',
    path: ['auth']
  },
  'La création du compte n\'a pas abouti. Merci de vérifier les données saisies.': {
    key: 'accountCreationError',
    path: ['auth']
  },
  'Cette adresse électronique est déjà associée à un compte existant. Connectez-vous ou utilisez une autre adresse.': {
    key: 'emailAlreadyExists',
    path: ['auth']
  },
  'Le domaine de messagerie indiqué n\'est pas reconnu. Vérifiez votre adresse électronique.': {
    key: 'invalidEmailDomain',
    path: ['auth']
  },
  
  // Auth - Login
  'Les informations d\'identification fournies sont incorrectes': {
    key: 'invalidCredentials',
    path: ['auth']
  },
  'Confirmez votre adresse électronique avant d\'accéder à votre espace': {
    key: 'pleaseVerifyEmail',
    path: ['auth']
  },
  'Adresse non confirmée. Validez votre courriel pour poursuivre.': {
    key: 'emailNotVerifiedDesc',
    path: ['auth']
  },
  
  // Auth - 2FA
  'La double authentification est désormais active sur votre compte': {
    key: 'twoFactorEnabledSuccess',
    path: ['auth']
  },
  'La double authentification a été retirée de votre compte': {
    key: 'twoFactorDisabledSuccess',
    path: ['auth']
  },
  
  // Auth - Password Reset
  'Votre nouveau code d\'accès a été enregistré. Vous pouvez à présent vous identifier.': {
    key: 'passwordResetSuccess',
    path: ['auth']
  },
  
  // Auth - Verification
  'Un nouveau lien de confirmation vous a été transmis': {
    key: 'verificationEmailResent',
    path: ['auth']
  },
  
  // Auth - Logout
  'Vous avez été déconnecté de votre espace': {
    key: 'logoutSuccess',
    path: ['auth']
  },
  
  // Session & Auth errors
  'Une identification est nécessaire pour accéder à cette ressource': {
    key: 'authRequired',
    path: ['auth']
  },
  'Votre session n\'est plus valide': {
    key: 'invalidSession',
    path: ['auth']
  },
  'Une connexion active existe sur un autre terminal. Veuillez vous authentifier à nouveau.': {
    key: 'sessionDuplicateError',
    path: ['auth']
  },
  'Votre compte est temporairement suspendu. Contactez notre service clientèle.': {
    key: 'accountBlocked',
    path: ['auth']
  },
  'Compte en attente de régularisation': {
    key: 'accountSuspended',
    path: ['auth']
  },
  'Compte non activé': {
    key: 'accountInactive',
    path: ['auth']
  },
  
  // File upload errors
  'Type de fichier non autorisé. Formats acceptés: JPEG, JPG, PDF': {
    key: 'invalidFileTypeJpegPdf',
    path: ['fileErrors']
  },
  'Type de fichier non autorisé. Formats acceptés: PDF, JPEG, PNG, WEBP': {
    key: 'invalidFileTypePdfImages',
    path: ['fileErrors']
  },
  'Type de fichier non autorisé. Seuls les formats JPEG, PNG, WebP et PDF sont acceptés.': {
    key: 'invalidFileTypePdfImages',
    path: ['fileErrors']
  },
  'Type de fichier non autorisé. Seules les images JPEG, PNG et WebP sont acceptées.': {
    key: 'invalidFileTypeImages',
    path: ['fileErrors']
  },
  'Type de fichier non autorisé. Seuls les fichiers PDF, JPEG et PNG sont acceptés.': {
    key: 'invalidFileTypePdfImages',
    path: ['fileErrors']
  },
  'Type de fichier non reconnu': {
    key: 'unrecognizedFileType',
    path: ['fileErrors']
  },
  'Type MIME non autorisé.': {
    key: 'invalidMimeType',
    path: ['fileErrors']
  },
  'Le fichier dépasse la taille maximale autorisée (10MB)': {
    key: 'fileTooLarge10MB',
    path: ['fileErrors']
  },
  'Erreur lors de la validation du fichier': {
    key: 'fileValidationError',
    path: ['fileErrors']
  },
  'Erreur lors du nettoyage de l\'image': {
    key: 'imageCleaningError',
    path: ['fileErrors']
  },
  'Erreur lors du nettoyage du PDF': {
    key: 'pdfCleaningError',
    path: ['fileErrors']
  },
  'Type de fichier non supporté': {
    key: 'unsupportedFileType',
    path: ['fileErrors']
  },
  'Fichier invalide': {
    key: 'invalidFile',
    path: ['fileErrors']
  },
};

interface DynamicPatternConfig {
  pattern: RegExp;
  key: string;
  path: string[];
  extractValues: (match: RegExpMatchArray) => Record<string, string>;
}

const dynamicPatterns: DynamicPatternConfig[] = [
  {
    // Pattern for cumulative financing limit error
    // Includes U+00A0 (non-breaking space) and U+202F (narrow non-breaking space) 
    // used by French locale number formatting
    // Also allows optional space before € symbol
    pattern: /Le montant demandé dépasse votre plafond de financement autorisé\. Montant cumulé actuel: ([0-9\s\u00a0\u202f,.]+)[\s\u00a0\u202f]?€\. Plafond maximum: ([0-9\s\u00a0\u202f,.]+)[\s\u00a0\u202f]?€\. Capacité restante: ([0-9\s\u00a0\u202f,.]+)[\s\u00a0\u202f]?€\./,
    key: 'cumulativeLimitMessage',
    path: ['loanOffers'],
    extractValues: (match) => ({
      current: match[1].replace(/[\u00a0\u202f]/g, ' ').trim(),
      max: match[2].replace(/[\u00a0\u202f]/g, ' ').trim(),
      remaining: match[3].replace(/[\u00a0\u202f]/g, ' ').trim()
    })
  },
  {
    // Pattern for max active loans error
    pattern: /Vous avez atteint le nombre maximum de prêts actifs pour votre tier (\w+) \((\d+)\/(\d+)\)\. Complétez un prêt pour en demander un nouveau\./,
    key: 'maxLoansMessage',
    path: ['loanOffers'],
    extractValues: (match) => ({
      tier: match[1].trim(),
      current: match[2].trim(),
      max: match[3].trim()
    })
  }
];

function translateDynamicMessage(message: string, language: Language): string | null {
  for (const config of dynamicPatterns) {
    const match = message.match(config.pattern);
    if (match) {
      try {
        let translation: any = translations[language];
        
        for (const key of config.path) {
          translation = translation[key];
          if (!translation) {
            return null;
          }
        }
        
        let template = translation[config.key];
        if (typeof template !== 'string') {
          return null;
        }
        
        const values = config.extractValues(match);
        for (const [placeholder, value] of Object.entries(values)) {
          template = template.replace(`{${placeholder}}`, value);
        }
        
        return template;
      } catch (error) {
        console.error('Error translating dynamic message:', error);
        return null;
      }
    }
  }
  return null;
}

/**
 * Traduit un message du backend dans la langue sélectionnée
 * @param message - Le message en français renvoyé par le backend
 * @param language - La langue cible
 * @returns Le message traduit, ou le message original si aucune traduction n'est trouvée
 */
export function translateBackendMessage(
  message: string | undefined,
  language: Language
): string {
  if (!message) return '';
  
  // Try dynamic pattern matching first (for messages with variables)
  const dynamicTranslation = translateDynamicMessage(message, language);
  if (dynamicTranslation) {
    return dynamicTranslation;
  }
  
  // Cherche le message dans le mapping statique
  const mapping = messageMapping[message];
  
  if (!mapping) {
    // Si le message n'est pas dans le mapping, retourne le message original
    return message;
  }
  
  // Récupère la traduction appropriée
  try {
    let translation: any = translations[language];
    
    // Navigue dans le chemin de traduction
    for (const key of mapping.path) {
      translation = translation[key];
      if (!translation) {
        return message;
      }
    }
    
    // Récupère la valeur finale
    const result = translation[mapping.key];
    return typeof result === 'string' ? result : message;
  } catch (error) {
    console.error('Error translating backend message:', error);
    return message;
  }
}

/**
 * Hook pour faciliter l'utilisation de translateBackendMessage
 * @param message - Le message du backend
 * @param language - La langue actuelle
 * @returns Le message traduit
 */
export function useBackendTranslation(message: string | undefined, language: Language): string {
  return translateBackendMessage(message, language);
}
