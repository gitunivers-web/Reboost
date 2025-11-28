import { Language, translations } from './i18n';

/**
 * Mapping des messages français du backend vers les clés de traduction
 * Cela permet de traduire automatiquement les messages du backend
 */
const messageMapping: Record<string, { key: string; path: string[] }> = {
  // Auth - Signup
  'Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.': {
    key: 'signupSuccessDesc',
    path: ['auth']
  },
  'Impossible de créer le compte. Veuillez vérifier vos informations.': {
    key: 'accountCreationError',
    path: ['auth']
  },
  'Un compte avec cet email existe déjà. Veuillez vous connecter ou utiliser une autre adresse email.': {
    key: 'emailAlreadyExists',
    path: ['auth']
  },
  
  // Auth - Login
  'Identifiants invalides': {
    key: 'invalidCredentials',
    path: ['auth']
  },
  'Veuillez vérifier votre email avant de vous connecter': {
    key: 'pleaseVerifyEmail',
    path: ['auth']
  },
  'Email non vérifié. Veuillez vérifier votre email avant de continuer.': {
    key: 'emailNotVerifiedDesc',
    path: ['auth']
  },
  
  // Auth - 2FA
  'Authentification à deux facteurs activée avec succès': {
    key: 'twoFactorEnabledSuccess',
    path: ['auth']
  },
  'Authentification à deux facteurs désactivée': {
    key: 'twoFactorDisabledSuccess',
    path: ['auth']
  },
  
  // Auth - Password Reset
  'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.': {
    key: 'passwordResetSuccess',
    path: ['auth']
  },
  
  // Auth - Verification
  'Email de vérification renvoyé avec succès': {
    key: 'verificationEmailResent',
    path: ['auth']
  },
  
  // Auth - Logout
  'Déconnexion réussie': {
    key: 'logoutSuccess',
    path: ['auth']
  },
  
  // Session & Auth errors
  'Authentification requise': {
    key: 'authRequired',
    path: ['auth']
  },
  'Session invalide': {
    key: 'invalidSession',
    path: ['auth']
  },
  'Votre compte est connecté sur un autre appareil. Veuillez vous reconnecter.': {
    key: 'sessionDuplicateError',
    path: ['auth']
  },
  'Compte bloqué. Veuillez contacter le support.': {
    key: 'accountBlocked',
    path: ['auth']
  },
  'Compte suspendu': {
    key: 'accountSuspended',
    path: ['auth']
  },
  'Compte inactif': {
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
