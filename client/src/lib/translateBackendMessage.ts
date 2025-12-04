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
};

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
  
  // Cherche le message dans le mapping
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
