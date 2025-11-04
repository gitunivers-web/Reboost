import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'fr' | 'en' | 'es' | 'pt' | 'it' | 'de' | 'nl';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguage = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'fr',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-storage',
    }
  )
);

type TranslationKeys = {
  hero: {
    title: string;
    subtitle: string;
    cta1: string;
    cta2: string;
    trustIndicator: string;
    slides: Array<{
      title: string;
      subtitle: string;
    }>;
  };
  nav: {
    home: string;
    products: string;
    howItWorks: string;
    resources: string;
    about: string;
    contact: string;
    dashboard: string;
    loans: string;
    transfers: string;
    history: string;
    settings: string;
    logout: string;
  };
  dashboard: {
    welcome: string;
    currentBalance: string;
    activeLoans: string;
    totalBorrowed: string;
    availableCredit: string;
    lastUpdated: string;
    borrowingCapacity: string;
    canBorrowUpTo: string;
    quickActions: string;
    newLoan: string;
    transferFunds: string;
    transactionHistory: string;
    fees: string;
    pendingTransfers: string;
    availableFunds: string;
    upcomingRepayments: string;
  };
  loan: {
    amount: string;
    interestRate: string;
    nextPayment: string;
    viewAll: string;
  };
  transfer: {
    requestSubmitted: string;
    documentVerification: string;
    complianceCheck: string;
    approvalPending: string;
    transferComplete: string;
    pending: string;
    inProgress: string;
    approved: string;
    rejected: string;
  };
  fee: {
    type: string;
    reason: string;
    amount: string;
    date: string;
    downloadStatement: string;
    loanFees: string;
    transferFees: string;
    accountFees: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
  };
  about: {
    title: string;
    subtitle: string;
    mission: string;
    missionText: string;
    stats: {
      clients: string;
      loansProvided: string;
      successRate: string;
      yearsExperience: string;
    };
  };
  howItWorks: {
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
  };
  products: {
    title: string;
    subtitle: string;
    businessTitle: string;
    businessSubtitle: string;
    termLoans: string;
    termLoansDesc: string;
    lineOfCredit: string;
    lineOfCreditDesc: string;
    equipmentFinancing: string;
    equipmentFinancingDesc: string;
    invoiceFactoring: string;
    invoiceFactoringDesc: string;
  };
  contact: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    send: string;
    success: string;
    error: string;
  };
  resources: {
    title: string;
    subtitle: string;
    faqTitle: string;
    faqs: {
      question: string;
      answer: string;
    }[];
  };
  legal: {
    termsTitle: string;
    privacyTitle: string;
    lastUpdated: string;
    terms: {
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
      section3Title: string;
      section3Content: string;
      section4Title: string;
      section4Content: string;
      section5Title: string;
      section5Content: string;
      section6Title: string;
      section6Content: string;
    };
    privacy: {
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
      section2List: string[];
      section3Title: string;
      section3Content: string;
      section3List: string[];
      section4Title: string;
      section4Content: string;
      section5Title: string;
      section5Content: string;
      section6Title: string;
      section6Content: string;
      section7Title: string;
      section7Content: string;
    };
  };
  individualLoans: {
    title: string;
    subtitle: string;
    personalLoan: string;
    personalLoanDesc: string;
    mortgageLoan: string;
    mortgageLoanDesc: string;
    autoLoan: string;
    autoLoanDesc: string;
    studentLoan: string;
    studentLoanDesc: string;
    greenLoan: string;
    greenLoanDesc: string;
    renovationLoan: string;
    renovationLoanDesc: string;
    amount: string;
    rate: string;
    duration: string;
    rateDisclaimer: string;
    compareLoans: string;
  };
  features: {
    title: string;
    subtitle: string;
    security: string;
    securityDesc: string;
    fast: string;
    fastDesc: string;
    competitive: string;
    competitiveDesc: string;
    flexible: string;
    flexibleDesc: string;
  };
  stats: {
    clients: string;
    funded: string;
    satisfaction: string;
    years: string;
  };
  testimonials: {
    title: string;
    subtitle: string;
    reviews: Array<{
      name: string;
      role: string;
      company: string;
      text: string;
      rating: number;
    }>;
  };
};

export const translations: Record<Language, TranslationKeys> = {
  fr: {
    hero: {
      title: 'Réalisez vos projets avec Altus Group',
      subtitle: 'Solutions de financement pour particuliers et professionnels - Taux compétitifs et processus transparent',
      cta1: 'Demander un prêt',
      cta2: 'Mon espace',
      trustIndicator: 'Plus de 15 000 clients satisfaits nous font confiance',
      slides: [
        {
          title: 'Réalisez vos projets avec Altus Group',
          subtitle: 'Solutions de financement pour particuliers et professionnels - Taux compétitifs et processus transparent',
        },
        {
          title: 'Des solutions financières sur mesure',
          subtitle: 'Accompagnement personnalisé pour concrétiser tous vos projets professionnels et personnels',
        },
        {
          title: 'Votre partenaire de confiance',
          subtitle: 'Plus de 15 000 clients satisfaits nous font confiance pour leurs besoins de financement',
        },
        {
          title: 'Financez vos ambitions',
          subtitle: 'Des taux avantageux et un processus simple pour donner vie à vos projets',
        },
        {
          title: 'Expertise et accompagnement',
          subtitle: 'Une équipe dédiée pour vous guider à chaque étape de votre projet',
        },
      ],
    },
    nav: {
      home: 'Accueil',
      products: 'Nos Prêts',
      howItWorks: 'Comment ça marche',
      resources: 'Ressources',
      about: 'À propos',
      contact: 'Contact',
      dashboard: 'Tableau de bord',
      loans: 'Prêts',
      transfers: 'Transferts',
      history: 'Historique',
      settings: 'Paramètres',
      logout: 'Déconnexion',
    },
    dashboard: {
      welcome: 'Bienvenue',
      currentBalance: 'Solde actuel',
      activeLoans: 'Prêts actifs',
      totalBorrowed: 'Total emprunté',
      availableCredit: 'Crédit disponible',
      lastUpdated: 'Dernière mise à jour',
      borrowingCapacity: 'Capacité d\'emprunt',
      canBorrowUpTo: 'Vous pouvez emprunter jusqu\'à',
      quickActions: 'Actions rapides',
      newLoan: 'Nouveau prêt',
      transferFunds: 'Transférer des fonds',
      transactionHistory: 'Historique des transactions',
      fees: 'Frais',
      pendingTransfers: 'Transferts en attente',
      availableFunds: 'Fonds disponibles',
      upcomingRepayments: 'Remboursements à venir',
    },
    loan: {
      amount: 'Montant',
      interestRate: 'Taux d\'intérêt',
      nextPayment: 'Prochain paiement',
      viewAll: 'Voir tout',
    },
    transfer: {
      requestSubmitted: 'Demande soumise',
      documentVerification: 'Vérification des documents',
      complianceCheck: 'Contrôle de conformité',
      approvalPending: 'Approbation en attente',
      transferComplete: 'Transfert terminé',
      pending: 'En attente',
      inProgress: 'En cours',
      approved: 'Approuvé',
      rejected: 'Rejeté',
    },
    fee: {
      type: 'Type de frais',
      reason: 'Motif',
      amount: 'Montant',
      date: 'Date',
      downloadStatement: 'Télécharger le relevé',
      loanFees: 'Frais de prêt',
      transferFees: 'Frais de transfert',
      accountFees: 'Frais de compte',
    },
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
    },
    about: {
      title: 'À propos d\'Altus Group',
      subtitle: 'Votre partenaire de confiance pour le financement des particuliers et professionnels',
      mission: 'Notre Mission',
      missionText: 'Chez Altus Group, nous démocratisons l\'accès au financement pour tous. Que vous soyez un particulier avec un projet personnel ou une entreprise en développement, nous proposons des solutions de crédit modernes, transparentes et adaptées à vos besoins. Notre technologie de pointe nous permet d\'analyser rapidement votre situation et de vous proposer des offres personnalisées avec des taux compétitifs. Nous croyons en la transparence totale : pas de frais cachés, des conditions claires et un accompagnement à chaque étape.',
      stats: {
        clients: 'Clients actifs',
        loansProvided: 'Prêts accordés',
        successRate: 'Taux de satisfaction',
        yearsExperience: 'Années d\'expérience',
      },
    },
    howItWorks: {
      title: 'Comment ça marche',
      subtitle: 'Un processus 100% digital en 4 étapes simples',
      step1Title: 'Demande en ligne - 4 minutes',
      step1Desc: 'Remplissez notre formulaire sécurisé avec vos informations personnelles ou professionnelles. Pas besoin de déplacement, tout se fait en ligne avec vérification d\'identité instantanée (KYC) et téléchargement de documents simplifié.',
      step2Title: 'Analyse automatisée - 24-48h',
      step2Desc: 'Notre technologie d\'évaluation de crédit analyse votre profil financier, vos revenus et votre historique. Grâce à nos algorithmes avancés et l\'intégration aux bureaux de crédit, nous vous donnons une réponse de principe sous 48h maximum.',
      step3Title: 'Offre personnalisée transparente',
      step3Desc: 'Recevez votre offre de prêt avec toutes les informations : montant, taux APR, mensualités, durée, coût total du crédit. Aucun frais caché, conditions claires et possibilité de simuler différents scénarios avant d\'accepter.',
      step4Title: 'Déblocage rapide - 2 à 5 jours',
      step4Desc: 'Signature électronique de votre contrat et transfert automatique des fonds sur votre compte bancaire. Pour les prêts professionnels, possibilité de mise en place d\'un échéancier personnalisé adapté à votre trésorerie.',
    },
    products: {
      title: 'Nos Solutions de Prêts',
      subtitle: 'Des produits adaptés à vos besoins - Particuliers et Professionnels',
      businessTitle: 'Prêts Professionnels',
      businessSubtitle: 'Des produits adaptés à vos besoins professionnels',
      termLoans: 'Prêts à Terme Professionnels',
      termLoansDesc: 'Financement à moyen et long terme pour vos investissements stratégiques : développement, acquisition, expansion. De 10 000€ à 500 000€ sur 1 à 7 ans. Taux fixes de 3,5% à 8,5% APR selon profil. Remboursement anticipé sans pénalité.',
      lineOfCredit: 'Ligne de Crédit Renouvelable',
      lineOfCreditDesc: 'Crédit flexible pour gérer votre trésorerie et faire face aux imprévus. De 5 000€ à 100 000€. Taux de 4,0% à 9,0% APR. Ne payez des intérêts que sur les sommes utilisées. Reconstitution automatique du capital disponible.',
      equipmentFinancing: 'Financement d\'Équipement',
      equipmentFinancingDesc: 'Financez vos équipements professionnels, véhicules utilitaires, machines, outils. De 20 000€ à 300 000€ sur 2 à 5 ans. Taux de 3,9% à 7,5% APR. L\'équipement peut servir de garantie, facilitant l\'obtention du prêt.',
      invoiceFactoring: 'Affacturage / Cession de Créances',
      invoiceFactoringDesc: 'Transformez vos factures clients en liquidités immédiates pour améliorer votre cash-flow. Avance jusqu\'à 90% du montant des factures sous 24-48h. Frais de 1% à 3% selon volume et délai. Idéal pour les entreprises B2B.',
    },
    contact: {
      title: 'Contactez-nous',
      subtitle: 'Notre équipe est à votre écoute',
      name: 'Nom complet',
      email: 'Email',
      phone: 'Téléphone',
      message: 'Message',
      send: 'Envoyer',
      success: 'Message envoyé avec succès',
      error: 'Erreur lors de l\'envoi du message',
    },
    resources: {
      title: 'Ressources',
      subtitle: 'Toutes les informations pour vous accompagner dans votre projet',
      faqTitle: 'Questions Fréquentes',
      faqs: [
        {
          question: 'Quels documents sont nécessaires pour une demande de prêt ?',
          answer: 'Pour les particuliers : pièce d\'identité, justificatif de domicile, derniers bulletins de salaire (3 mois), avis d\'imposition. Pour les professionnels : Kbis de moins de 3 mois, bilans et comptes de résultat (2 derniers exercices), relevés bancaires professionnels (3-6 mois), pièce d\'identité du dirigeant. Tous les documents sont téléchargeables directement en ligne de manière sécurisée.',
        },
        {
          question: 'Combien de temps prend le processus d\'approbation ?',
          answer: 'Notre technologie d\'évaluation automatisée vous donne une réponse de principe en 15 secondes à 48 heures maximum. Une fois votre dossier validé et complet, les fonds sont transférés sous 2 à 5 jours ouvrables. Pour les montants importants (>100 000€), comptez 5 à 7 jours pour une analyse approfondie.',
        },
        {
          question: 'Quel est le montant minimum et maximum que je peux emprunter ?',
          answer: 'Prêts personnels : de 1 000€ à 75 000€. Prêts immobiliers : de 50 000€ à 500 000€. Prêts professionnels à terme : de 10 000€ à 500 000€. Lignes de crédit : de 5 000€ à 100 000€. Le montant exact dépend de votre capacité de remboursement calculée selon vos revenus, charges et historique de crédit.',
        },
        {
          question: 'Puis-je rembourser mon prêt par anticipation ?',
          answer: 'Oui, tous nos prêts permettent le remboursement anticipé sans pénalité ni frais cachés. Vous pouvez rembourser partiellement ou totalement votre crédit à tout moment depuis votre espace client. Cela réduit automatiquement le coût total des intérêts. Vous gardez ainsi le contrôle total sur votre crédit.',
        },
        {
          question: 'Quels sont les critères d\'éligibilité pour un prêt ?',
          answer: 'Particuliers : être majeur, résider en France, avoir des revenus réguliers et un taux d\'endettement <40%. Professionnels : entreprise active depuis 6+ mois, chiffre d\'affaires mensuel minimum de 15 000€, pas de défaut de paiement récent. Le score de crédit est vérifié automatiquement via les bureaux de crédit (Experian, Equifax). Les dossiers sont étudiés au cas par cas.',
        },
        {
          question: 'Comment sont calculés les taux d\'intérêt ?',
          answer: 'Nos taux sont calculés par un algorithme qui analyse plusieurs facteurs : votre score de crédit, la durée du prêt, le montant emprunté, vos revenus et charges, votre historique de remboursement et la santé financière (pour les entreprises). Les taux varient de 3,5% à 9,0% APR selon le profil. Nos taux sont parmi les plus compétitifs du marché grâce à notre réseau de partenaires financiers.',
        },
        {
          question: 'Y a-t-il des frais de dossier ou frais cachés ?',
          answer: 'Transparence totale : nous affichons tous les frais dès la simulation. Frais de dossier : 0€ à 150€ selon le type de prêt. Pas de frais de remboursement anticipé. Pas de frais mensuels de gestion. Le TAEG (Taux Annuel Effectif Global) inclut tous les coûts pour une comparaison facile avec d\'autres offres.',
        },
        {
          question: 'Comment calculer ma capacité d\'emprunt ?',
          answer: 'Votre capacité d\'emprunt dépend de votre taux d\'endettement qui ne doit pas dépasser 40% de vos revenus nets. Formule : (Revenus mensuels × 0,40) - Charges de crédit existantes = Mensualité maximale disponible. Notre simulateur en ligne calcule automatiquement votre capacité d\'emprunt et vous propose des montants adaptés. Vous pouvez ajuster la durée pour moduler les mensualités.',
        },
        {
          question: 'Puis-je obtenir un prêt avec un score de crédit faible ?',
          answer: 'Oui, nous acceptons des profils variés. Notre technologie d\'évaluation analyse aussi des données alternatives au-delà du simple score de crédit : stabilité professionnelle, revenus récurrents, épargne, historique bancaire. Scores acceptés dès 500-560 pour certains produits. Même avec un historique imparfait, vous pouvez obtenir un prêt, mais les taux seront ajustés au risque.',
        },
        {
          question: 'Que se passe-t-il si je ne peux pas rembourser une mensualité ?',
          answer: 'Contactez-nous immédiatement. Nous proposons plusieurs solutions : report de mensualité (franchise temporaire), modulation à la baisse des échéances, rééchelonnement du prêt. Des pénalités de retard peuvent s\'appliquer mais nous privilégions toujours le dialogue pour trouver une solution adaptée à votre situation. Un accompagnement personnalisé est disponible en cas de difficultés.',
        },
      ],
    },
    legal: {
      termsTitle: 'Conditions d\'Utilisation',
      privacyTitle: 'Politique de Confidentialité',
      lastUpdated: 'Dernière mise à jour : Janvier 2025',
      terms: {
        section1Title: '1. Acceptation des Conditions',
        section1Content: 'En accédant et en utilisant les services de Altus Group, vous acceptez et acceptez d\'être lié par les termes et dispositions de cet accord.',
        section2Title: '2. Licence d\'Utilisation',
        section2Content: 'L\'autorisation est accordée pour accéder temporairement aux matériaux (informations ou logiciels) sur la plateforme de Altus Group pour une visualisation personnelle et non commerciale uniquement.',
        section3Title: '3. Contrat de Prêt',
        section3Content: 'Tous les prêts sont soumis à l\'approbation de crédit. Les termes et conditions seront fournis dans un contrat de prêt séparé lors de l\'approbation de votre demande.',
        section4Title: '4. Déclarations et Garanties',
        section4Content: 'Vous déclarez et garantissez que toutes les informations fournies dans votre demande de prêt sont exactes, complètes et à jour.',
        section5Title: '5. Limitation de Responsabilité',
        section5Content: 'En aucun cas Altus Group ou ses fournisseurs ne seront responsables de tout dommage découlant de l\'utilisation ou de l\'impossibilité d\'utiliser les matériaux sur la plateforme de Altus Group.',
        section6Title: '6. Modifications',
        section6Content: 'Altus Group peut réviser ces conditions d\'utilisation à tout moment sans préavis. En utilisant cette plateforme, vous acceptez d\'être lié par la version actuelle de ces conditions.',
      },
      privacy: {
        section1Title: '1. Informations que Nous Collectons',
        section1Content: 'Nous collectons les informations que vous nous fournissez directement lorsque vous créez un compte, demandez un prêt ou communiquez avec nous. Cela peut inclure votre nom, adresse e-mail, numéro de téléphone, informations commerciales et données financières.',
        section2Title: '2. Comment Nous Utilisons Vos Informations',
        section2Content: 'Nous utilisons les informations que nous collectons pour :',
        section2List: [
          'Traiter vos demandes de prêt',
          'Communiquer avec vous sur nos services',
          'Améliorer notre plateforme et nos services',
          'Se conformer aux exigences légales et réglementaires',
        ],
        section3Title: '3. Partage d\'Informations',
        section3Content: 'Nous ne vendons pas vos informations personnelles. Nous pouvons partager vos informations avec :',
        section3List: [
          'Les bureaux de crédit pour l\'évaluation du crédit',
          'Les prestataires de services qui nous assistent dans nos opérations',
          'Les régulateurs et les forces de l\'ordre lorsque requis par la loi',
        ],
        section4Title: '4. Sécurité des Données',
        section4Content: 'Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos informations personnelles contre l\'accès, l\'altération, la divulgation ou la destruction non autorisés.',
        section5Title: '5. Vos Droits',
        section5Content: 'Vous avez le droit d\'accéder, de corriger ou de supprimer vos informations personnelles. Vous pouvez également vous opposer à certains traitements de vos données.',
        section6Title: '6. Cookies',
        section6Content: 'Nous utilisons des cookies et des technologies de suivi similaires pour améliorer votre expérience sur notre plateforme. Vous pouvez contrôler les cookies via les paramètres de votre navigateur.',
        section7Title: '7. Nous Contacter',
        section7Content: 'Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter à privacy@altus-group.com',
      },
    },
    individualLoans: {
      title: 'Prêts pour Particuliers',
      subtitle: 'Des solutions de financement adaptées à tous vos projets de vie',
      personalLoan: 'Prêt Personnel',
      personalLoanDesc: 'Financement flexible pour tous vos projets sans justificatif d\'utilisation : voyage, mariage, achat équipement. De 1 000€ à 75 000€ sur 12 à 84 mois. Taux TAEG de 2,9% à 7,9% selon profil. Réponse en 48h, fonds sous 5 jours.',
      mortgageLoan: 'Prêt Immobilier',
      mortgageLoanDesc: 'Financez votre résidence principale, secondaire ou investissement locatif. De 50 000€ à 500 000€ sur 10 à 25 ans. Taux fixes ou variables à partir de 1,5% TAEG. Jusqu\'à 110% d\'apport incluant frais de notaire. Simulation personnalisée gratuite.',
      autoLoan: 'Crédit Auto / Moto',
      autoLoanDesc: 'Financez votre véhicule neuf ou d\'occasion, auto ou moto. De 3 000€ à 75 000€ sur 12 à 84 mois. Taux TAEG de 1,9% à 5,9%. Possibilité d\'inclure l\'assurance et les accessoires. Réponse immédiate chez votre concessionnaire partenaire.',
      studentLoan: 'Prêt Étudiant',
      studentLoanDesc: 'Financez vos études supérieures, frais de scolarité, logement étudiant. De 1 000€ à 50 000€. Différé de remboursement total jusqu\'à la fin des études. Taux préférentiels dès 1,5% TAEG. Sans caution parentale sous conditions.',
      greenLoan: 'Prêt Vert / Éco-PTZ',
      greenLoanDesc: 'Financez travaux de rénovation énergétique : isolation, pompe à chaleur, panneaux solaires. De 7 000€ à 50 000€. Taux bonifiés dès 0,5% TAEG. Éligible aux aides d\'État MaPrimeRénov. Jusqu\'à 30 000€ sans apport.',
      renovationLoan: 'Prêt Travaux',
      renovationLoanDesc: 'Rénovez, agrandissez, embellissez votre logement. De 1 500€ à 75 000€ sur 12 à 120 mois. Taux TAEG de 2,5% à 6,9%. Sans garantie hypothécaire jusqu\'à 50 000€. Déblocage progressif selon avancement des travaux possible.',
      amount: 'Montant',
      rate: 'Taux TAEG',
      duration: 'Durée',
      rateDisclaimer: 'Taux indicatifs soumis à conditions d\'éligibilité. TAEG fixe. Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.',
      compareLoans: 'Comparer tous les prêts',
    },
    features: {
      title: 'Pourquoi Choisir Altus Group ?',
      subtitle: 'Une plateforme de prêt moderne et transparente qui met vos besoins au centre',
      security: 'Sécurité Bancaire de Niveau Entreprise',
      securityDesc: 'Cryptage AES-256, conformité RGPD, certification SOC 2 Type II et ISO 27001. Vos données financières sont protégées avec les mêmes standards que les grandes banques. Authentification multi-facteurs et surveillance 24/7 contre la fraude.',
      fast: 'Réponse Ultra-Rapide 24-48h',
      fastDesc: 'Notre technologie d\'IA analyse votre dossier en temps réel. Réponse de principe en 15 secondes à 48h maximum. Fonds virés sous 2-5 jours. Interface 100% digitale, zéro paperasse, signature électronique. Gagnez du temps sur votre projet.',
      competitive: 'Taux Parmi Les Plus Bas du Marché',
      competitiveDesc: 'Grâce à notre réseau de 50+ partenaires financiers et notre technologie d\'évaluation optimisée, nous négocions pour vous les meilleurs taux : de 1,5% à 9,0% selon profil. Comparaison automatique pour vous garantir la meilleure offre.',
      flexible: 'Flexibilité Maximale Sans Pénalité',
      flexibleDesc: 'Remboursement anticipé gratuit à tout moment. Modulation des mensualités possible selon votre situation. Report de mensualités en cas de difficultés. Choix de la date de prélèvement. Vous gardez le contrôle total de votre crédit.',
    },
    stats: {
      clients: 'Clients Satisfaits',
      funded: 'Prêts Accordés',
      satisfaction: 'Taux de Satisfaction',
      years: 'Années d\'Expérience',
    },
    testimonials: {
      title: 'Ce que disent nos clients',
      subtitle: 'Plus de 15 000 particuliers et professionnels nous font confiance',
      reviews: [
        { name: 'Sophie Martin', role: 'Chef d\'entreprise', company: 'Boutique Bio Paris', text: 'Altus Group m\'a permis d\'obtenir un financement rapide pour développer mon commerce. Le processus était simple et transparent, j\'ai reçu les fonds en moins d\'une semaine.', rating: 5 },
        { name: 'Thomas Dubois', role: 'Particulier', company: 'Propriétaire', text: 'Excellent service pour mon prêt immobilier. Les conseillers sont à l\'écoute et m\'ont trouvé le meilleur taux. Je recommande vivement leurs services.', rating: 5 },
        { name: 'Marie Laurent', role: 'Directrice Financière', company: 'Tech Solutions SARL', text: 'Grâce à Altus Group, nous avons pu financer l\'achat de nouveaux équipements. La flexibilité de remboursement et le taux compétitif ont fait la différence.', rating: 5 },
        { name: 'Pierre Moreau', role: 'Artisan', company: 'Boulangerie Traditionnelle', text: 'Un service professionnel et efficace. J\'ai obtenu mon prêt travaux sans complications. L\'équipe m\'a accompagné à chaque étape.', rating: 5 },
        { name: 'Isabelle Rousseau', role: 'Commerçante', company: 'Mode & Accessoires', text: 'Je suis très satisfaite du financement obtenu pour l\'expansion de ma boutique. Altus Group comprend vraiment les besoins des entrepreneurs.', rating: 5 },
        { name: 'Jean Petit', role: 'Particulier', company: 'Père de famille', text: 'Mon crédit auto a été approuvé rapidement avec un excellent taux. Le simulateur en ligne m\'a permis de comparer facilement les offres.', rating: 5 },
        { name: 'Caroline Durand', role: 'Infirmière', company: 'Hôpital Saint-Louis', text: 'J\'ai pu financer mes travaux de rénovation énergétique grâce à leur prêt vert. Les taux bonifiés et les conseils sur les aides d\'État m\'ont beaucoup aidée.', rating: 5 },
        { name: 'Marc Lefebvre', role: 'Gérant', company: 'Restaurant Le Gourmet', text: 'La ligne de crédit renouvelable a sauvé ma trésorerie pendant la période difficile. Flexibilité maximale et remboursement anticipé sans frais.', rating: 5 },
        { name: 'Nathalie Bernard', role: 'Architecte', company: 'Bernard & Associés', text: 'Processus 100% digital et rapide. J\'ai obtenu mon prêt professionnel en 3 jours. L\'interface est intuitive et claire.', rating: 5 },
        { name: 'François Garnier', role: 'Étudiant', company: 'École de Commerce', text: 'Le prêt étudiant avec différé de remboursement m\'a permis de financer mes études sans stress. Taux préférentiels et sans caution parentale.', rating: 5 },
        { name: 'Amélie Roussel', role: 'Pharmacienne', company: 'Pharmacie Centrale', text: 'Financement d\'équipement médical approuvé en 48h. Le service client est réactif et professionnel. Très satisfaite de l\'accompagnement.', rating: 5 },
        { name: 'Laurent Mercier', role: 'Développeur', company: 'Tech Startup', text: 'Prêt personnel pour mon projet de formation professionnelle. Pas de justificatif d\'utilisation requis, processus transparent et rapide.', rating: 5 },
        { name: 'Sylvie Blanc', role: 'Professeure', company: 'Lycée Voltaire', text: 'Mon prêt immobilier a été approuvé avec un taux très compétitif. La simulation en ligne m\'a aidée à comparer et choisir la meilleure offre.', rating: 5 },
        { name: 'David Roux', role: 'Entrepreneur', company: 'Startup Innovante', text: 'Le financement d\'équipement m\'a permis d\'acheter les machines nécessaires pour lancer ma production. Remboursement adapté à mon cash-flow.', rating: 5 },
        { name: 'Émilie Girard', role: 'Avocate', company: 'Cabinet Girard', text: 'Processus d\'approbation ultra-rapide grâce à la technologie d\'IA. J\'ai reçu une réponse de principe en moins de 24 heures. Impressionnant !', rating: 5 },
        { name: 'Philippe Simon', role: 'Plombier', company: 'Simon Plomberie', text: 'Prêt travaux pour rénover mon local professionnel. Déblocage progressif selon l\'avancement, c\'est exactement ce qu\'il me fallait.', rating: 5 },
        { name: 'Véronique Martin', role: 'Designer', company: 'Studio Créatif', text: 'La ligne de crédit m\'a donné la flexibilité nécessaire pour gérer les variations de trésorerie de mon activité. Je ne paie que sur ce que j\'utilise.', rating: 5 },
        { name: 'Alexandre Dupont', role: 'Médecin', company: 'Cabinet Médical', text: 'Financement de mon installation en cabinet privé. Montant important approuvé rapidement avec un taux fixe avantageux. Très professionnel.', rating: 5 },
        { name: 'Céline Bonnet', role: 'Fleuriste', company: 'Fleurs & Nature', text: 'Prêt professionnel pour développer ma boutique en ligne. Le processus était simple et l\'équipe m\'a accompagnée à chaque étape. Merci !', rating: 5 },
        { name: 'Olivier Chevalier', role: 'Ingénieur', company: 'Consultant Indépendant', text: 'Crédit auto pour mon véhicule professionnel. Réponse immédiate et fonds transférés en 3 jours. Service impeccable et taux compétitif.', rating: 5 },
        { name: 'Patricia Moreau', role: 'Esthéticienne', company: 'Institut Beauté', text: 'Financement pour l\'achat de nouveaux équipements esthétiques. Pas de frais cachés, tout est transparent dès le début. Je recommande vivement.', rating: 5 },
        { name: 'Julien Fontaine', role: 'Chef cuisinier', company: 'Bistrot Moderne', text: 'Affacturage pour améliorer mon cash-flow. Transformation de mes factures en liquidités en 24h. Solution parfaite pour mon activité B2B.', rating: 5 },
      ],
    },
  },
  en: {
    hero: {
      title: 'Make Your Projects a Reality with Altus Group',
      subtitle: 'Financing solutions for individuals and businesses - Competitive rates and transparent process',
      cta1: 'Request a Loan',
      cta2: 'My Account',
      trustIndicator: 'Trusted by 15,000+ satisfied clients',
      slides: [
        {
          title: 'Make Your Projects a Reality with Altus Group',
          subtitle: 'Financing solutions for individuals and businesses - Competitive rates and transparent process',
        },
        {
          title: 'Tailored Financial Solutions',
          subtitle: 'Personalized support to bring all your professional and personal projects to life',
        },
        {
          title: 'Your Trusted Partner',
          subtitle: 'Over 15,000 satisfied clients trust us for their financing needs',
        },
        {
          title: 'Finance Your Ambitions',
          subtitle: 'Competitive rates and a simple process to make your projects come true',
        },
        {
          title: 'Expertise and Support',
          subtitle: 'A dedicated team to guide you every step of the way',
        },
      ],
    },
    nav: {
      home: 'Home',
      products: 'Our Loans',
      howItWorks: 'How It Works',
      resources: 'Resources',
      about: 'About',
      contact: 'Contact',
      dashboard: 'Dashboard',
      loans: 'Loans',
      transfers: 'Transfers',
      history: 'History',
      settings: 'Settings',
      logout: 'Logout',
    },
    dashboard: {
      welcome: 'Welcome',
      currentBalance: 'Current Balance',
      activeLoans: 'Active Loans',
      totalBorrowed: 'Total Borrowed',
      availableCredit: 'Available Credit',
      lastUpdated: 'Last Updated',
      borrowingCapacity: 'Borrowing Capacity',
      canBorrowUpTo: 'You can borrow up to',
      quickActions: 'Quick Actions',
      newLoan: 'New Loan',
      transferFunds: 'Transfer Funds',
      transactionHistory: 'Transaction History',
      fees: 'Fees',
      pendingTransfers: 'Pending Transfers',
      availableFunds: 'Available Funds',
      upcomingRepayments: 'Upcoming Repayments',
    },
    loan: {
      amount: 'Amount',
      interestRate: 'Interest Rate',
      nextPayment: 'Next Payment',
      viewAll: 'View All',
    },
    transfer: {
      requestSubmitted: 'Request Submitted',
      documentVerification: 'Document Verification',
      complianceCheck: 'Compliance Check',
      approvalPending: 'Approval Pending',
      transferComplete: 'Transfer Complete',
      pending: 'Pending',
      inProgress: 'In Progress',
      approved: 'Approved',
      rejected: 'Rejected',
    },
    fee: {
      type: 'Fee Type',
      reason: 'Reason',
      amount: 'Amount',
      date: 'Date',
      downloadStatement: 'Download Statement',
      loanFees: 'Loan Fees',
      transferFees: 'Transfer Fees',
      accountFees: 'Account Fees',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
    about: {
      title: 'About Altus Group',
      subtitle: 'Your trusted partner for financing individuals and businesses',
      mission: 'Our Mission',
      missionText: 'At Altus Group, we democratize access to financing for everyone. Whether you\'re an individual with a personal project or a growing business, we offer modern, transparent credit solutions tailored to your needs. Our cutting-edge technology enables us to quickly analyze your situation and offer personalized deals with competitive rates. We believe in total transparency: no hidden fees, clear terms, and support at every step.',
      stats: {
        clients: 'Active clients',
        loansProvided: 'Loans provided',
        successRate: 'Satisfaction rate',
        yearsExperience: 'Years of experience',
      },
    },
    howItWorks: {
      title: 'How It Works',
      subtitle: 'A 100% digital process in 4 simple steps',
      step1Title: 'Online Application - 4 Minutes',
      step1Desc: 'Complete our secure form with your personal or business information. No need to travel, everything is done online with instant identity verification (KYC) and simplified document upload.',
      step2Title: 'Automated Analysis - 24-48h',
      step2Desc: 'Our credit assessment technology analyzes your financial profile, income, and history. Thanks to our advanced algorithms and credit bureau integration, we give you an approval response within 48 hours maximum.',
      step3Title: 'Transparent Personalized Offer',
      step3Desc: 'Receive your loan offer with all information: amount, APR rate, monthly payments, duration, total credit cost. No hidden fees, clear terms, and ability to simulate different scenarios before accepting.',
      step4Title: 'Fast Disbursement - 2 to 5 Days',
      step4Desc: 'Electronic signature of your contract and automatic transfer of funds to your bank account. For business loans, possibility of setting up a personalized payment schedule adapted to your cash flow.',
    },
    products: {
      title: 'Our Loan Solutions',
      subtitle: 'Products tailored to your needs - Individuals and Businesses',
      businessTitle: 'Business Loans',
      businessSubtitle: 'Products tailored to your business needs',
      termLoans: 'Professional Term Loans',
      termLoansDesc: 'Medium and long-term financing for your strategic investments: development, acquisition, expansion. From €10,000 to €500,000 over 1 to 7 years. Fixed rates from 3.5% to 8.5% APR depending on profile. Early repayment without penalty.',
      lineOfCredit: 'Revolving Line of Credit',
      lineOfCreditDesc: 'Flexible credit to manage your cash flow and handle unexpected expenses. From €5,000 to €100,000. Rates from 4.0% to 9.0% APR. Pay interest only on amounts used. Automatic reconstitution of available capital.',
      equipmentFinancing: 'Equipment Financing',
      equipmentFinancingDesc: 'Finance your professional equipment, utility vehicles, machines, tools. From €20,000 to €300,000 over 2 to 5 years. Rates from 3.9% to 7.5% APR. Equipment can serve as collateral, facilitating loan approval.',
      invoiceFactoring: 'Invoice Factoring / Receivables',
      invoiceFactoringDesc: 'Turn your customer invoices into immediate cash to improve cash flow. Advance up to 90% of invoice amounts within 24-48h. Fees from 1% to 3% depending on volume and delay. Ideal for B2B companies.',
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'Our team is here to help',
      name: 'Full name',
      email: 'Email',
      phone: 'Phone',
      message: 'Message',
      send: 'Send',
      success: 'Message sent successfully',
      error: 'Error sending message',
    },
    resources: {
      title: 'Resources',
      subtitle: 'All the information to support you in your project',
      faqTitle: 'Frequently Asked Questions',
      faqs: [
        {
          question: 'What documents are required for a loan application?',
          answer: 'For individuals: ID, proof of address, recent pay slips (3 months), tax notice. For businesses: company registration (<3 months), balance sheets and income statements (last 2 years), business bank statements (3-6 months), director\'s ID. All documents can be uploaded directly online securely.',
        },
        {
          question: 'How long does the approval process take?',
          answer: 'Our automated assessment technology gives you an approval response in 15 seconds to 48 hours maximum. Once your complete file is validated, funds are transferred within 2 to 5 business days. For larger amounts (>€100,000), allow 5 to 7 days for thorough analysis.',
        },
        {
          question: 'What is the minimum and maximum amount I can borrow?',
          answer: 'Personal loans: €1,000 to €75,000. Mortgage loans: €50,000 to €500,000. Business term loans: €10,000 to €500,000. Lines of credit: €5,000 to €100,000. The exact amount depends on your repayment capacity calculated based on income, expenses, and credit history.',
        },
        {
          question: 'Can I repay my loan early?',
          answer: 'Yes, all our loans allow early repayment without penalty or hidden fees. You can partially or fully repay your credit anytime from your customer area. This automatically reduces the total interest cost. You maintain full control over your credit.',
        },
        {
          question: 'What are the eligibility criteria for a loan?',
          answer: 'Individuals: be of legal age, reside in France, have regular income, and debt ratio <40%. Businesses: active for 6+ months, minimum monthly revenue of €15,000, no recent payment defaults. Credit score is automatically verified via credit bureaus (Experian, Equifax). Cases are reviewed individually.',
        },
        {
          question: 'How are interest rates calculated?',
          answer: 'Our rates are calculated by an algorithm that analyzes several factors: your credit score, loan duration, amount borrowed, income and expenses, repayment history, and financial health (for businesses). Rates range from 3.5% to 9.0% APR depending on profile. Our rates are among the most competitive on the market thanks to our network of financial partners.',
        },
        {
          question: 'Are there application fees or hidden charges?',
          answer: 'Total transparency: we display all fees from the simulation. Application fees: €0 to €150 depending on loan type. No early repayment fees. No monthly management fees. The APR (Annual Percentage Rate) includes all costs for easy comparison with other offers.',
        },
        {
          question: 'How to calculate my borrowing capacity?',
          answer: 'Your borrowing capacity depends on your debt ratio which must not exceed 40% of your net income. Formula: (Monthly income × 0.40) - Existing credit charges = Maximum available monthly payment. Our online simulator automatically calculates your borrowing capacity and suggests appropriate amounts. You can adjust the duration to modulate payments.',
        },
        {
          question: 'Can I get a loan with a low credit score?',
          answer: 'Yes, we accept various profiles. Our assessment technology also analyzes alternative data beyond the simple credit score: professional stability, recurring income, savings, banking history. Scores accepted from 500-560 for certain products. Even with imperfect history, you can get a loan, but rates will be adjusted to risk.',
        },
        {
          question: 'What happens if I cannot pay a monthly payment?',
          answer: 'Contact us immediately. We offer several solutions: payment deferral (temporary grace period), downward payment modulation, loan rescheduling. Late penalties may apply but we always favor dialogue to find a solution adapted to your situation. Personalized support is available in case of difficulties.',
        },
      ],
    },
    legal: {
      termsTitle: 'Terms of Service',
      privacyTitle: 'Privacy Policy',
      lastUpdated: 'Last updated: January 2025',
      terms: {
        section1Title: '1. Acceptance of Terms',
        section1Content: 'By accessing and using Altus Group\'s services, you accept and agree to be bound by the terms and provision of this agreement.',
        section2Title: '2. Use License',
        section2Content: 'Permission is granted to temporarily access the materials (information or software) on Altus Group\'s platform for personal, non-commercial transitory viewing only.',
        section3Title: '3. Loan Agreement',
        section3Content: 'All loans are subject to credit approval. Terms and conditions will be provided in a separate loan agreement upon approval of your application.',
        section4Title: '4. Representations and Warranties',
        section4Content: 'You represent and warrant that all information provided in your loan application is accurate, complete, and current.',
        section5Title: '5. Limitation of Liability',
        section5Content: 'In no event shall Altus Group or its suppliers be liable for any damages arising out of the use or inability to use the materials on Altus Group\'s platform.',
        section6Title: '6. Modifications',
        section6Content: 'Altus Group may revise these terms of service at any time without notice. By using this platform, you agree to be bound by the current version of these terms.',
      },
      privacy: {
        section1Title: '1. Information We Collect',
        section1Content: 'We collect information you provide directly to us when you create an account, apply for a loan, or communicate with us. This may include your name, email address, phone number, business information, and financial data.',
        section2Title: '2. How We Use Your Information',
        section2Content: 'We use the information we collect to:',
        section2List: [
          'Process your loan applications',
          'Communicate with you about our services',
          'Improve our platform and services',
          'Comply with legal and regulatory requirements',
        ],
        section3Title: '3. Information Sharing',
        section3Content: 'We do not sell your personal information. We may share your information with:',
        section3List: [
          'Credit bureaus for credit assessment',
          'Service providers who assist in our operations',
          'Regulators and law enforcement when required by law',
        ],
        section4Title: '4. Data Security',
        section4Content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
        section5Title: '5. Your Rights',
        section5Content: 'You have the right to access, correct, or delete your personal information. You may also object to certain processing of your data.',
        section6Title: '6. Cookies',
        section6Content: 'We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookies through your browser settings.',
        section7Title: '7. Contact Us',
        section7Content: 'If you have questions about this Privacy Policy, please contact us at privacy@altus-group.com',
      },
    },
    individualLoans: {
      title: 'Personal Loans',
      subtitle: 'Financing solutions tailored to all your life projects',
      personalLoan: 'Personal Loan',
      personalLoanDesc: 'Flexible financing for all your projects without proof of use: travel, wedding, equipment purchase. From €1,000 to €75,000 over 12 to 84 months. APR rates from 2.9% to 7.9% depending on profile. Response in 48h, funds within 5 days.',
      mortgageLoan: 'Mortgage Loan',
      mortgageLoanDesc: 'Finance your primary, secondary residence or rental investment. From €50,000 to €500,000 over 10 to 25 years. Fixed or variable rates from 1.5% APR. Up to 110% contribution including notary fees. Free personalized simulation.',
      autoLoan: 'Auto / Motorcycle Loan',
      autoLoanDesc: 'Finance your new or used vehicle, car or motorcycle. From €3,000 to €75,000 over 12 to 84 months. APR rates from 1.9% to 5.9%. Possibility to include insurance and accessories. Instant response at your partner dealership.',
      studentLoan: 'Student Loan',
      studentLoanDesc: 'Finance your higher education, tuition fees, student housing. From €1,000 to €50,000. Total repayment deferral until end of studies. Preferential rates from 1.5% APR. Without parental guarantee under conditions.',
      greenLoan: 'Green Loan / Eco-PTZ',
      greenLoanDesc: 'Finance energy renovation work: insulation, heat pump, solar panels. From €7,000 to €50,000. Subsidized rates from 0.5% APR. Eligible for state aid MaPrimeRénov. Up to €30,000 without contribution.',
      renovationLoan: 'Home Improvement Loan',
      renovationLoanDesc: 'Renovate, expand, beautify your home. From €1,500 to €75,000 over 12 to 120 months. APR rates from 2.5% to 6.9%. Without mortgage guarantee up to €50,000. Progressive release according to work progress possible.',
      amount: 'Amount',
      rate: 'APR Rate',
      duration: 'Duration',
      rateDisclaimer: 'Indicative rates subject to eligibility conditions. Fixed APR. Credit commits you and must be repaid. Check your repayment capacity before committing.',
      compareLoans: 'Compare all loans',
    },
    features: {
      title: 'Why Choose Altus Group?',
      subtitle: 'A modern and transparent lending platform that puts your needs first',
      security: 'Enterprise-Grade Banking Security',
      securityDesc: 'AES-256 encryption, GDPR compliance, SOC 2 Type II and ISO 27001 certification. Your financial data is protected with the same standards as major banks. Multi-factor authentication and 24/7 fraud monitoring.',
      fast: 'Ultra-Fast Response 24-48h',
      fastDesc: 'Our AI technology analyzes your file in real-time. Approval response in 15 seconds to 48h maximum. Funds transferred within 2-5 days. 100% digital interface, zero paperwork, electronic signature. Save time on your project.',
      competitive: 'Among The Lowest Rates on the Market',
      competitiveDesc: 'Thanks to our network of 50+ financial partners and optimized assessment technology, we negotiate the best rates for you: from 1.5% to 9.0% depending on profile. Automatic comparison to guarantee you the best offer.',
      flexible: 'Maximum Flexibility Without Penalty',
      flexibleDesc: 'Free early repayment anytime. Possible payment modulation according to your situation. Payment deferral in case of difficulties. Choice of debit date. You maintain total control of your credit.',
    },
    stats: {
      clients: 'Satisfied Clients',
      funded: 'Loans Provided',
      satisfaction: 'Satisfaction Rate',
      years: 'Years of Experience',
    },
    testimonials: {
      title: 'What Our Clients Say',
      subtitle: 'Trusted by 15,000+ individuals and businesses',
      reviews: [
        { name: 'Sophie Martin', role: 'Business Owner', company: 'Organic Store Paris', text: 'Altus Group enabled me to obtain quick financing to develop my business. The process was simple and transparent, I received the funds in less than a week.', rating: 5 },
        { name: 'Thomas Dubois', role: 'Individual', company: 'Homeowner', text: 'Excellent service for my mortgage. The advisors are attentive and found me the best rate. I highly recommend their services.', rating: 5 },
        { name: 'Marie Laurent', role: 'CFO', company: 'Tech Solutions Ltd', text: 'Thanks to Altus Group, we were able to finance the purchase of new equipment. The repayment flexibility and competitive rate made all the difference.', rating: 5 },
        { name: 'Pierre Moreau', role: 'Craftsman', company: 'Traditional Bakery', text: 'A professional and efficient service. I got my home improvement loan without complications. The team supported me every step of the way.', rating: 5 },
        { name: 'Isabelle Rousseau', role: 'Retailer', company: 'Fashion & Accessories', text: 'I am very satisfied with the financing obtained for the expansion of my shop. Altus Group truly understands the needs of entrepreneurs.', rating: 5 },
        { name: 'Jean Petit', role: 'Individual', company: 'Family Man', text: 'My car loan was approved quickly with an excellent rate. The online simulator allowed me to easily compare offers.', rating: 5 },
        { name: 'Caroline Durand', role: 'Nurse', company: 'Saint-Louis Hospital', text: 'I was able to finance my energy renovation work thanks to their green loan. The subsidized rates and advice on state aid helped me a lot.', rating: 5 },
        { name: 'Marc Lefebvre', role: 'Manager', company: 'Le Gourmet Restaurant', text: 'The revolving credit line saved my cash flow during the difficult period. Maximum flexibility and free early repayment.', rating: 5 },
        { name: 'Nathalie Bernard', role: 'Architect', company: 'Bernard & Associates', text: '100% digital and fast process. I got my business loan in 3 days. The interface is intuitive and clear.', rating: 5 },
        { name: 'François Garnier', role: 'Student', company: 'Business School', text: 'The student loan with deferred repayment allowed me to finance my studies stress-free. Preferential rates and without parental guarantee.', rating: 5 },
      ],
    },
  },
  es: {
    hero: {
      title: 'Haga Realidad sus Proyectos con Altus Group',
      subtitle: 'Soluciones de financiamiento para particulares y empresas - Tasas competitivas y proceso transparente',
      cta1: 'Solicitar Préstamo',
      cta2: 'Mi Cuenta',
      trustIndicator: 'Más de 15,000 clientes satisfechos confían en nosotros',
      slides: [
        {
          title: 'Haga Realidad sus Proyectos con Altus Group',
          subtitle: 'Soluciones de financiamiento para particulares y empresas - Tasas competitivas y proceso transparente',
        },
        {
          title: 'Soluciones Financieras a Medida',
          subtitle: 'Acompañamiento personalizado para concretar todos sus proyectos profesionales y personales',
        },
        {
          title: 'Su Socio de Confianza',
          subtitle: 'Más de 15,000 clientes satisfechos confían en nosotros para sus necesidades de financiamiento',
        },
        {
          title: 'Financie sus Ambiciones',
          subtitle: 'Tasas ventajosas y un proceso simple para dar vida a sus proyectos',
        },
        {
          title: 'Experiencia y Acompañamiento',
          subtitle: 'Un equipo dedicado para guiarle en cada etapa de su proyecto',
        },
      ],
    },
    nav: {
      home: 'Inicio',
      products: 'Nuestros Préstamos',
      howItWorks: 'Cómo Funciona',
      resources: 'Recursos',
      about: 'Acerca de',
      contact: 'Contacto',
      dashboard: 'Panel',
      loans: 'Préstamos',
      transfers: 'Transferencias',
      history: 'Historial',
      settings: 'Configuración',
      logout: 'Cerrar Sesión',
    },
    dashboard: {
      welcome: 'Bienvenido',
      currentBalance: 'Saldo Actual',
      activeLoans: 'Préstamos Activos',
      totalBorrowed: 'Total Prestado',
      availableCredit: 'Crédito Disponible',
      lastUpdated: 'Última Actualización',
      borrowingCapacity: 'Capacidad de Préstamo',
      canBorrowUpTo: 'Puede pedir prestado hasta',
      quickActions: 'Acciones Rápidas',
      newLoan: 'Nuevo Préstamo',
      transferFunds: 'Transferir Fondos',
      transactionHistory: 'Historial de Transacciones',
      fees: 'Tarifas',
      pendingTransfers: 'Transferencias Pendientes',
      availableFunds: 'Fondos Disponibles',
      upcomingRepayments: 'Próximos Reembolsos',
    },
    loan: {
      amount: 'Cantidad',
      interestRate: 'Tasa de Interés',
      nextPayment: 'Próximo Pago',
      viewAll: 'Ver Todo',
    },
    transfer: {
      requestSubmitted: 'Solicitud Enviada',
      documentVerification: 'Verificación de Documentos',
      complianceCheck: 'Control de Cumplimiento',
      approvalPending: 'Aprobación Pendiente',
      transferComplete: 'Transferencia Completa',
      pending: 'Pendiente',
      inProgress: 'En Progreso',
      approved: 'Aprobado',
      rejected: 'Rechazado',
    },
    fee: {
      type: 'Tipo de Tarifa',
      reason: 'Motivo',
      amount: 'Cantidad',
      date: 'Fecha',
      downloadStatement: 'Descargar Estado de Cuenta',
      loanFees: 'Tarifas de Préstamo',
      transferFees: 'Tarifas de Transferencia',
      accountFees: 'Tarifas de Cuenta',
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
    },
    about: {
      title: 'Acerca de Altus Group',
      subtitle: 'Su socio de confianza para financiar particulares y empresas',
      mission: 'Nuestra Misión',
      missionText: 'En Altus Group, democratizamos el acceso al financiamiento para todos. Ya sea que sea un particular con un proyecto personal o una empresa en desarrollo, ofrecemos soluciones de crédito modernas, transparentes y adaptadas a sus necesidades. Nuestra tecnología de vanguardia nos permite analizar rápidamente su situación y ofrecerle ofertas personalizadas con tasas competitivas. Creemos en la transparencia total: sin cargos ocultos, condiciones claras y acompañamiento en cada paso.',
      stats: {
        clients: 'Clientes activos',
        loansProvided: 'Préstamos otorgados',
        successRate: 'Tasa de satisfacción',
        yearsExperience: 'Años de experiencia',
      },
    },
    howItWorks: {
      title: 'Cómo Funciona',
      subtitle: 'Un proceso 100% digital en 4 pasos simples',
      step1Title: 'Solicitud en línea - 4 Minutos',
      step1Desc: 'Complete nuestro formulario seguro con su información personal o empresarial. No necesita desplazarse, todo se hace en línea con verificación de identidad instantánea (KYC) y carga de documentos simplificada.',
      step2Title: 'Análisis automatizado - 24-48h',
      step2Desc: 'Nuestra tecnología de evaluación crediticia analiza su perfil financiero, ingresos e historial. Gracias a nuestros algoritmos avanzados y la integración con burós de crédito, le damos una respuesta de principio en máximo 48h.',
      step3Title: 'Oferta personalizada transparente',
      step3Desc: 'Reciba su oferta de préstamo con toda la información: monto, tasa TAE, mensualidades, duración, costo total del crédito. Sin cargos ocultos, condiciones claras y posibilidad de simular diferentes escenarios antes de aceptar.',
      step4Title: 'Desembolso rápido - 2 a 5 días',
      step4Desc: 'Firma electrónica de su contrato y transferencia automática de fondos a su cuenta bancaria. Para préstamos empresariales, posibilidad de establecer un calendario de pagos personalizado adaptado a su flujo de caja.',
    },
    products: {
      title: 'Nuestras Soluciones de Préstamos',
      subtitle: 'Productos adaptados a sus necesidades - Particulares y Empresas',
      businessTitle: 'Préstamos Empresariales',
      businessSubtitle: 'Productos adaptados a sus necesidades empresariales',
      termLoans: 'Préstamos a Plazo Profesionales',
      termLoansDesc: 'Financiamiento a mediano y largo plazo para sus inversiones estratégicas: desarrollo, adquisición, expansión. De €10,000 a €500,000 de 1 a 7 años. Tasas fijas de 3.5% a 8.5% TAE según perfil. Pago anticipado sin penalización.',
      lineOfCredit: 'Línea de Crédito Renovable',
      lineOfCreditDesc: 'Crédito flexible para gestionar su flujo de caja y enfrentar gastos imprevistos. De €5,000 a €100,000. Tasas de 4.0% a 9.0% TAE. Pague intereses solo sobre las cantidades utilizadas. Reconstitución automática del capital disponible.',
      equipmentFinancing: 'Financiamiento de Equipos',
      equipmentFinancingDesc: 'Financie sus equipos profesionales, vehículos utilitarios, maquinaria, herramientas. De €20,000 a €300,000 de 2 a 5 años. Tasas de 3.9% a 7.5% TAE. El equipo puede servir como garantía, facilitando la aprobación del préstamo.',
      invoiceFactoring: 'Factoraje / Cesión de Créditos',
      invoiceFactoringDesc: 'Convierta sus facturas de clientes en efectivo inmediato para mejorar su flujo de caja. Anticipo hasta el 90% del monto de facturas en 24-48h. Tarifas del 1% al 3% según volumen y plazo. Ideal para empresas B2B.',
    },
    contact: {
      title: 'Contáctenos',
      subtitle: 'Nuestro equipo está aquí para ayudar',
      name: 'Nombre completo',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      message: 'Mensaje',
      send: 'Enviar',
      success: 'Mensaje enviado correctamente',
      error: 'Error al enviar el mensaje',
    },
    resources: {
      title: 'Recursos',
      subtitle: 'Toda la información para apoyarlo en su proyecto',
      faqTitle: 'Preguntas Frecuentes',
      faqs: [
        {
          question: '¿Qué documentos se requieren para una solicitud de préstamo?',
          answer: 'Para particulares: identificación, comprobante de domicilio, recibos de nómina recientes (3 meses), aviso de impuestos. Para empresas: registro mercantil (<3 meses), balances y estados de resultados (últimos 2 años), estados de cuenta bancarios comerciales (3-6 meses), identificación del director. Todos los documentos pueden cargarse directamente en línea de forma segura.',
        },
        {
          question: '¿Cuánto tiempo toma el proceso de aprobación?',
          answer: 'Nuestra tecnología de evaluación automatizada le da una respuesta de principio en 15 segundos a 48 horas máximo. Una vez validado y completo su expediente, los fondos se transfieren en 2 a 5 días hábiles. Para montos mayores (>€100,000), cuente con 5 a 7 días para un análisis exhaustivo.',
        },
        {
          question: '¿Cuál es el monto mínimo y máximo que puedo pedir prestado?',
          answer: 'Préstamos personales: €1,000 a €75,000. Préstamos hipotecarios: €50,000 a €500,000. Préstamos a plazo empresariales: €10,000 a €500,000. Líneas de crédito: €5,000 a €100,000. El monto exacto depende de su capacidad de pago calculada según ingresos, gastos e historial crediticio.',
        },
        {
          question: '¿Puedo pagar mi préstamo anticipadamente?',
          answer: 'Sí, todos nuestros préstamos permiten el pago anticipado sin penalización ni cargos ocultos. Puede reembolsar parcial o totalmente su crédito en cualquier momento desde su área de cliente. Esto reduce automáticamente el costo total de intereses. Mantiene control total de su crédito.',
        },
        {
          question: '¿Cuáles son los criterios de elegibilidad para un préstamo?',
          answer: 'Particulares: ser mayor de edad, residir en Francia, tener ingresos regulares y tasa de endeudamiento <40%. Empresas: activas por 6+ meses, ingresos mensuales mínimos de €15,000, sin incumplimientos de pago recientes. El puntaje crediticio se verifica automáticamente vía burós de crédito (Experian, Equifax). Los casos se estudian individualmente.',
        },
        {
          question: '¿Cómo se calculan las tasas de interés?',
          answer: 'Nuestras tasas se calculan mediante un algoritmo que analiza varios factores: su puntaje crediticio, duración del préstamo, monto prestado, ingresos y gastos, historial de pagos y salud financiera (para empresas). Las tasas varían de 3.5% a 9.0% TAE según perfil. Nuestras tasas están entre las más competitivas del mercado gracias a nuestra red de socios financieros.',
        },
        {
          question: '¿Hay cargos de solicitud o cargos ocultos?',
          answer: 'Transparencia total: mostramos todos los cargos desde la simulación. Cargos de solicitud: €0 a €150 según tipo de préstamo. Sin cargos por pago anticipado. Sin cargos mensuales de gestión. La TAE (Tasa Anual Equivalente) incluye todos los costos para comparación fácil con otras ofertas.',
        },
        {
          question: '¿Cómo calcular mi capacidad de préstamo?',
          answer: 'Su capacidad de préstamo depende de su tasa de endeudamiento que no debe superar el 40% de sus ingresos netos. Fórmula: (Ingresos mensuales × 0.40) - Cargos de crédito existentes = Pago mensual máximo disponible. Nuestro simulador en línea calcula automáticamente su capacidad de préstamo y sugiere montos apropiados. Puede ajustar la duración para modular los pagos.',
        },
        {
          question: '¿Puedo obtener un préstamo con un puntaje crediticio bajo?',
          answer: 'Sí, aceptamos varios perfiles. Nuestra tecnología de evaluación también analiza datos alternativos más allá del simple puntaje crediticio: estabilidad profesional, ingresos recurrentes, ahorros, historial bancario. Puntajes aceptados desde 500-560 para ciertos productos. Incluso con historial imperfecto, puede obtener un préstamo, pero las tasas se ajustarán al riesgo.',
        },
        {
          question: '¿Qué sucede si no puedo pagar una mensualidad?',
          answer: 'Contáctenos inmediatamente. Ofrecemos varias soluciones: aplazamiento de mensualidad (gracia temporal), modulación a la baja de cuotas, re-escalamiento del préstamo. Pueden aplicarse penalidades por retraso pero siempre privilegiamos el diálogo para encontrar una solución adaptada a su situación. Acompañamiento personalizado disponible en caso de dificultades.',
        },
      ],
    },
    legal: {
      termsTitle: 'Términos de Servicio',
      privacyTitle: 'Política de Privacidad',
      lastUpdated: 'Última actualización: Enero 2025',
      terms: {
        section1Title: '1. Aceptación de Términos',
        section1Content: 'Al acceder y utilizar los servicios de Altus Group, acepta y está de acuerdo en estar sujeto a los términos y disposiciones de este acuerdo.',
        section2Title: '2. Licencia de Uso',
        section2Content: 'Se otorga permiso para acceder temporalmente a los materiales (información o software) en la plataforma de Altus Group solo para visualización personal y no comercial.',
        section3Title: '3. Contrato de Préstamo',
        section3Content: 'Todos los préstamos están sujetos a aprobación de crédito. Los términos y condiciones se proporcionarán en un contrato de préstamo separado al aprobar su solicitud.',
        section4Title: '4. Declaraciones y Garantías',
        section4Content: 'Usted declara y garantiza que toda la información proporcionada en su solicitud de préstamo es precisa, completa y actual.',
        section5Title: '5. Limitación de Responsabilidad',
        section5Content: 'En ningún caso Altus Group o sus proveedores serán responsables de cualquier daño que surja del uso o la imposibilidad de usar los materiales en la plataforma de Altus Group.',
        section6Title: '6. Modificaciones',
        section6Content: 'Altus Group puede revisar estos términos de servicio en cualquier momento sin previo aviso. Al usar esta plataforma, acepta estar sujeto a la versión actual de estos términos.',
      },
      privacy: {
        section1Title: '1. Información que Recopilamos',
        section1Content: 'Recopilamos información que nos proporciona directamente cuando crea una cuenta, solicita un préstamo o se comunica con nosotros. Esto puede incluir su nombre, dirección de correo electrónico, número de teléfono, información comercial y datos financieros.',
        section2Title: '2. Cómo Usamos su Información',
        section2Content: 'Usamos la información que recopilamos para:',
        section2List: [
          'Procesar sus solicitudes de préstamo',
          'Comunicarnos con usted sobre nuestros servicios',
          'Mejorar nuestra plataforma y servicios',
          'Cumplir con los requisitos legales y regulatorios',
        ],
        section3Title: '3. Compartir Información',
        section3Content: 'No vendemos su información personal. Podemos compartir su información con:',
        section3List: [
          'Burós de crédito para evaluación crediticia',
          'Proveedores de servicios que nos ayudan en nuestras operaciones',
          'Reguladores y fuerzas del orden cuando lo requiera la ley',
        ],
        section4Title: '4. Seguridad de Datos',
        section4Content: 'Implementamos medidas técnicas y organizativas apropiadas para proteger su información personal contra el acceso, alteración, divulgación o destrucción no autorizados.',
        section5Title: '5. Sus Derechos',
        section5Content: 'Tiene derecho a acceder, corregir o eliminar su información personal. También puede oponerse a cierto procesamiento de sus datos.',
        section6Title: '6. Cookies',
        section6Content: 'Utilizamos cookies y tecnologías de seguimiento similares para mejorar su experiencia en nuestra plataforma. Puede controlar las cookies a través de la configuración de su navegador.',
        section7Title: '7. Contáctenos',
        section7Content: 'Si tiene preguntas sobre esta Política de Privacidad, contáctenos en privacy@altus-group.com',
      },
    },
    individualLoans: {
      title: 'Préstamos para Particulares',
      subtitle: 'Soluciones de financiamiento adaptadas a todos sus proyectos de vida',
      personalLoan: 'Préstamo Personal',
      personalLoanDesc: 'Financiamiento flexible para todos sus proyectos sin justificante de uso: viaje, boda, compra de equipo. De €1,000 a €75,000 de 12 a 84 meses. Tasas TAE de 2.9% a 7.9% según perfil. Respuesta en 48h, fondos en 5 días.',
      mortgageLoan: 'Préstamo Hipotecario',
      mortgageLoanDesc: 'Financie su residencia principal, secundaria o inversión de alquiler. De €50,000 a €500,000 de 10 a 25 años. Tasas fijas o variables desde 1.5% TAE. Hasta 110% de aporte incluyendo gastos notariales. Simulación personalizada gratuita.',
      autoLoan: 'Crédito Auto / Moto',
      autoLoanDesc: 'Financie su vehículo nuevo o usado, auto o moto. De €3,000 a €75,000 de 12 a 84 meses. Tasas TAE de 1.9% a 5.9%. Posibilidad de incluir seguro y accesorios. Respuesta inmediata en su concesionario asociado.',
      studentLoan: 'Préstamo Estudiantil',
      studentLoanDesc: 'Financie sus estudios superiores, matrícula, alojamiento estudiantil. De €1,000 a €50,000. Diferimiento de pago total hasta fin de estudios. Tasas preferenciales desde 1.5% TAE. Sin garantía parental bajo condiciones.',
      greenLoan: 'Préstamo Verde / Eco-PTZ',
      greenLoanDesc: 'Financie trabajos de renovación energética: aislamiento, bomba de calor, paneles solares. De €7,000 a €50,000. Tasas bonificadas desde 0.5% TAE. Elegible para ayudas estatales MaPrimeRénov. Hasta €30,000 sin aporte.',
      renovationLoan: 'Préstamo para Reformas',
      renovationLoanDesc: 'Renueve, amplíe, embellezca su vivienda. De €1,500 a €75,000 de 12 a 120 meses. Tasas TAE de 2.5% a 6.9%. Sin garantía hipotecaria hasta €50,000. Desembolso progresivo según avance de obras posible.',
      amount: 'Monto',
      rate: 'Tasa TAE',
      duration: 'Duración',
      rateDisclaimer: 'Tasas indicativas sujetas a condiciones de elegibilidad. TAE fija. Un crédito le compromete y debe ser reembolsado. Verifique sus capacidades de pago antes de comprometerse.',
      compareLoans: 'Comparar todos los préstamos',
    },
    features: {
      title: '¿Por Qué Elegir Altus Group?',
      subtitle: 'Una plataforma de préstamos moderna y transparente que prioriza sus necesidades',
      security: 'Seguridad Bancaria de Nivel Empresarial',
      securityDesc: 'Cifrado AES-256, cumplimiento RGPD, certificación SOC 2 Type II e ISO 27001. Sus datos financieros están protegidos con los mismos estándares que los grandes bancos. Autenticación multifactor y monitoreo 24/7 contra fraude.',
      fast: 'Respuesta Ultra-Rápida 24-48h',
      fastDesc: 'Nuestra tecnología de IA analiza su expediente en tiempo real. Respuesta de aprobación en 15 segundos a 48h máximo. Fondos transferidos en 2-5 días. Interfaz 100% digital, cero papeleo, firma electrónica. Ahorre tiempo en su proyecto.',
      competitive: 'Entre Las Tasas Más Bajas del Mercado',
      competitiveDesc: 'Gracias a nuestra red de 50+ socios financieros y tecnología de evaluación optimizada, negociamos para usted las mejores tasas: de 1.5% a 9.0% según perfil. Comparación automática para garantizarle la mejor oferta.',
      flexible: 'Flexibilidad Máxima Sin Penalización',
      flexibleDesc: 'Pago anticipado gratuito en cualquier momento. Posible modulación de mensualidades según su situación. Aplazamiento de mensualidades en caso de dificultades. Elección de fecha de débito. Mantiene control total de su crédito.',
    },
    stats: {
      clients: 'Clientes Satisfechos',
      funded: 'Préstamos Otorgados',
      satisfaction: 'Tasa de Satisfacción',
      years: 'Años de Experiencia',
    },
    testimonials: {
      title: 'Lo que dicen nuestros clientes',
      subtitle: 'Más de 15,000 particulares y profesionales confían en nosotros',
      reviews: [
        { name: 'Carlos García', role: 'Empresario', company: 'Restaurante El Sabor', text: 'Altus Group me permitió obtener financiamiento rápido para expandir mi negocio. El proceso fue simple y transparente.', rating: 5 },
        { name: 'María Rodríguez', role: 'Arquitecta', company: 'Estudio Creativo', text: 'Excelente servicio para mi préstamo inmobiliario. Los asesores encontraron la mejor tasa para mí.', rating: 5 },
        { name: 'José Martínez', role: 'Ingeniero', company: 'Tech Solutions', text: 'Gracias a Altus Group financiamos nuevos equipos. La flexibilidad de pago fue perfecta.', rating: 5 },
        { name: 'Ana López', role: 'Comerciante', company: 'Moda Boutique', text: 'Proceso 100% digital y rápido. Obtuve mi préstamo profesional en 3 días.', rating: 5 },
        { name: 'Miguel Sánchez', role: 'Estudiante', company: 'Universidad', text: 'El préstamo estudiantil con pago diferido me permitió financiar mis estudios sin estrés.', rating: 5 },
      ],
    },
  },
  pt: {
    hero: {
      title: 'Realize seus projetos com Altus Group',
      subtitle: 'Soluções de financiamento para particulares e profissionais - Taxas competitivas e processo transparente',
      cta1: 'Solicitar empréstimo',
      cta2: 'Meu espaço',
      trustIndicator: 'Mais de 15.000 clientes satisfeitos confiam em nós',
      slides: [
        {
          title: 'Realize seus projetos com Altus Group',
          subtitle: 'Soluções de financiamento para particulares e profissionais - Taxas competitivas e processo transparente',
        },
        {
          title: 'Soluções Financeiras sob Medida',
          subtitle: 'Acompanhamento personalizado para concretizar todos os seus projetos profissionais e pessoais',
        },
        {
          title: 'Seu Parceiro de Confiança',
          subtitle: 'Mais de 15.000 clientes satisfeitos confiam em nós para suas necessidades de financiamento',
        },
        {
          title: 'Financie suas Ambições',
          subtitle: 'Taxas vantajosas e um processo simples para dar vida aos seus projetos',
        },
        {
          title: 'Experiência e Acompanhamento',
          subtitle: 'Uma equipe dedicada para guiá-lo em cada etapa do seu projeto',
        },
      ],
    },
    nav: {
      home: 'Início',
      products: 'Nossos Empréstimos',
      howItWorks: 'Como funciona',
      resources: 'Recursos',
      about: 'Sobre nós',
      contact: 'Contato',
      dashboard: 'Painel',
      loans: 'Empréstimos',
      transfers: 'Transferências',
      history: 'Histórico',
      settings: 'Configurações',
      logout: 'Sair',
    },
    dashboard: {
      welcome: 'Bem-vindo',
      currentBalance: 'Saldo atual',
      activeLoans: 'Empréstimos ativos',
      totalBorrowed: 'Total emprestado',
      availableCredit: 'Crédito disponível',
      lastUpdated: 'Última atualização',
      borrowingCapacity: 'Capacidade de empréstimo',
      canBorrowUpTo: 'Você pode emprestar até',
      quickActions: 'Ações rápidas',
      newLoan: 'Novo empréstimo',
      transferFunds: 'Transferir fundos',
      transactionHistory: 'Histórico de transações',
      fees: 'Taxas',
      pendingTransfers: 'Transferências pendentes',
      availableFunds: 'Fundos disponíveis',
      upcomingRepayments: 'Próximos pagamentos',
    },
    loan: {
      amount: 'Montante',
      interestRate: 'Taxa de juros',
      nextPayment: 'Próximo pagamento',
      viewAll: 'Ver tudo',
    },
    transfer: {
      requestSubmitted: 'Solicitação enviada',
      documentVerification: 'Verificação de documentos',
      complianceCheck: 'Verificação de conformidade',
      approvalPending: 'Aprovação pendente',
      transferComplete: 'Transferência concluída',
      pending: 'Pendente',
      inProgress: 'Em andamento',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
    },
    fee: {
      type: 'Tipo de taxa',
      reason: 'Motivo',
      amount: 'Montante',
      date: 'Data',
      downloadStatement: 'Baixar extrato',
      loanFees: 'Taxas de empréstimo',
      transferFees: 'Taxas de transferência',
      accountFees: 'Taxas de conta',
    },
    common: {
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
    },
    about: {
      title: 'Sobre Altus Group',
      subtitle: 'Seu parceiro de confiança para financiamento de particulares e profissionais',
      mission: 'Nossa Missão',
      missionText: 'Na Altus Group, democratizamos o acesso ao financiamento para todos. Seja você um particular com um projeto pessoal ou uma empresa em desenvolvimento, oferecemos soluções de crédito modernas, transparentes e adaptadas às suas necessidades. Nossa tecnologia de ponta nos permite analisar rapidamente sua situação e oferecer ofertas personalizadas com taxas competitivas. Acreditamos na transparência total: sem taxas ocultas, condições claras e acompanhamento em cada etapa.',
      stats: {
        clients: 'Clientes ativos',
        loansProvided: 'Empréstimos concedidos',
        successRate: 'Taxa de satisfação',
        yearsExperience: 'Anos de experiência',
      },
    },
    howItWorks: {
      title: 'Como funciona',
      subtitle: 'Um processo 100% digital em 4 etapas simples',
      step1Title: 'Solicitação online - 4 minutos',
      step1Desc: 'Preencha nosso formulário seguro com suas informações pessoais ou profissionais. Não é necessário deslocamento, tudo é feito online com verificação de identidade instantânea (KYC) e upload de documentos simplificado.',
      step2Title: 'Análise automatizada - 24-48h',
      step2Desc: 'Nossa tecnologia de avaliação de crédito analisa seu perfil financeiro, rendimentos e histórico. Graças aos nossos algoritmos avançados e integração com agências de crédito, damos uma resposta de aprovação em 48h no máximo.',
      step3Title: 'Oferta personalizada transparente',
      step3Desc: 'Receba sua oferta de empréstimo com todas as informações: montante, taxa APR, mensalidades, duração, custo total do crédito. Sem taxas ocultas, condições claras e possibilidade de simular diferentes cenários antes de aceitar.',
      step4Title: 'Liberação rápida - 2 a 5 dias',
      step4Desc: 'Assinatura eletrônica do seu contrato e transferência automática dos fundos para sua conta bancária. Para empréstimos profissionais, possibilidade de estabelecer um cronograma personalizado adaptado ao seu fluxo de caixa.',
    },
    products: {
      title: 'Nossas Soluções de Empréstimos',
      subtitle: 'Produtos adaptados às suas necessidades - Particulares e Profissionais',
      businessTitle: 'Empréstimos Profissionais',
      businessSubtitle: 'Produtos adaptados às suas necessidades profissionais',
      termLoans: 'Empréstimos a Prazo Profissionais',
      termLoansDesc: 'Financiamento a médio e longo prazo para seus investimentos estratégicos: desenvolvimento, aquisição, expansão. De €10.000 a €500.000 de 1 a 7 anos. Taxas fixas de 3,5% a 8,5% APR conforme perfil. Pagamento antecipado sem penalidade.',
      lineOfCredit: 'Linha de Crédito Renovável',
      lineOfCreditDesc: 'Crédito flexível para gerir seu fluxo de caixa e enfrentar imprevistos. De €5.000 a €100.000. Taxa de 4,0% a 9,0% APR. Pague juros apenas sobre as quantias utilizadas. Reconstituição automática do capital disponível.',
      equipmentFinancing: 'Financiamento de Equipamentos',
      equipmentFinancingDesc: 'Financie seus equipamentos profissionais, veículos utilitários, máquinas, ferramentas. De €20.000 a €300.000 de 2 a 5 anos. Taxa de 3,9% a 7,5% APR. O equipamento pode servir como garantia, facilitando a obtenção do empréstimo.',
      invoiceFactoring: 'Factoring / Cessão de Créditos',
      invoiceFactoringDesc: 'Transforme suas faturas de clientes em liquidez imediata para melhorar seu fluxo de caixa. Adiantamento até 90% do valor das faturas em 24-48h. Taxas de 1% a 3% conforme volume e prazo. Ideal para empresas B2B.',
    },
    contact: {
      title: 'Entre em contato',
      subtitle: 'Nossa equipe está à sua disposição',
      name: 'Nome completo',
      email: 'Email',
      phone: 'Telefone',
      message: 'Mensagem',
      send: 'Enviar',
      success: 'Mensagem enviada com sucesso',
      error: 'Erro ao enviar mensagem',
    },
    resources: {
      title: 'Recursos',
      subtitle: 'Todas as informações para acompanhá-lo em seu projeto',
      faqTitle: 'Perguntas Frequentes',
      faqs: [
        {
          question: 'Quais documentos são necessários para uma solicitação de empréstimo?',
          answer: 'Para particulares: documento de identidade, comprovante de residência, últimos contracheques (3 meses), declaração de impostos. Para profissionais: registro da empresa (menos de 3 meses), balanços e demonstrações de resultados (últimos 2 anos), extratos bancários profissionais (3-6 meses), documento de identidade do diretor. Todos os documentos podem ser carregados diretamente online de forma segura.',
        },
        {
          question: 'Quanto tempo leva o processo de aprovação?',
          answer: 'Nossa tecnologia de avaliação automatizada dá uma resposta de aprovação em 15 segundos a 48 horas no máximo. Após a validação do seu dossiê completo, os fundos são transferidos em 2 a 5 dias úteis. Para valores altos (>€100.000), conte com 5 a 7 dias para análise aprofundada.',
        },
        {
          question: 'Qual é o valor mínimo e máximo que posso emprestar?',
          answer: 'Empréstimos pessoais: de €1.000 a €75.000. Empréstimos imobiliários: de €50.000 a €500.000. Empréstimos profissionais a prazo: de €10.000 a €500.000. Linhas de crédito: de €5.000 a €100.000. O valor exato depende da sua capacidade de reembolso calculada conforme rendimentos, encargos e histórico de crédito.',
        },
        {
          question: 'Posso reembolsar meu empréstimo antecipadamente?',
          answer: 'Sim, todos os nossos empréstimos permitem reembolso antecipado sem penalidade ou taxas ocultas. Você pode reembolsar parcial ou totalmente seu crédito a qualquer momento através da sua área de cliente. Isso reduz automaticamente o custo total dos juros. Você mantém controle total sobre seu crédito.',
        },
        {
          question: 'Quais são os critérios de elegibilidade para um empréstimo?',
          answer: 'Particulares: ser maior de idade, residir na França, ter rendimentos regulares e taxa de endividamento <40%. Profissionais: empresa ativa há 6+ meses, faturamento mensal mínimo de €15.000, sem inadimplências recentes. O score de crédito é verificado automaticamente através de agências de crédito. Os dossiês são estudados caso a caso.',
        },
        {
          question: 'Como são calculadas as taxas de juros?',
          answer: 'Nossas taxas são calculadas por um algoritmo que analisa vários fatores: seu score de crédito, duração do empréstimo, montante emprestado, seus rendimentos e encargos, histórico de reembolso e saúde financeira (para empresas). As taxas variam de 3,5% a 9,0% APR conforme o perfil. Nossas taxas estão entre as mais competitivas do mercado graças à nossa rede de parceiros financeiros.',
        },
        {
          question: 'Há taxas de dossiê ou taxas ocultas?',
          answer: 'Transparência total: exibimos todas as taxas desde a simulação. Taxas de dossiê: €0 a €150 conforme tipo de empréstimo. Sem taxas de reembolso antecipado. Sem taxas mensais de gestão. A TAEG (Taxa Anual Efetiva Global) inclui todos os custos para fácil comparação com outras ofertas.',
        },
        {
          question: 'Como calcular minha capacidade de empréstimo?',
          answer: 'Sua capacidade de empréstimo depende da sua taxa de endividamento que não deve exceder 40% dos seus rendimentos líquidos. Fórmula: (Rendimentos mensais × 0,40) - Encargos de crédito existentes = Mensalidade máxima disponível. Nosso simulador online calcula automaticamente sua capacidade de empréstimo e sugere valores adaptados. Você pode ajustar a duração para modular as mensalidades.',
        },
        {
          question: 'Posso obter um empréstimo com um score de crédito baixo?',
          answer: 'Sim, aceitamos perfis variados. Nossa tecnologia de avaliação analisa também dados alternativos além do simples score de crédito: estabilidade profissional, rendimentos recorrentes, poupança, histórico bancário. Scores aceitos a partir de 500-560 para certos produtos. Mesmo com histórico imperfeito, você pode obter um empréstimo, mas as taxas serão ajustadas ao risco.',
        },
        {
          question: 'O que acontece se eu não conseguir pagar uma mensalidade?',
          answer: 'Entre em contato imediatamente. Oferecemos várias soluções: adiamento de mensalidade (carência temporária), modulação para baixo das prestações, reescalonamento do empréstimo. Penalidades de atraso podem ser aplicadas mas sempre privilegiamos o diálogo para encontrar uma solução adaptada à sua situação. Acompanhamento personalizado disponível em caso de dificuldades.',
        },
      ],
    },
    legal: {
      termsTitle: 'Termos de Uso',
      privacyTitle: 'Política de Privacidade',
      lastUpdated: 'Última atualização: Janeiro 2025',
      terms: {
        section1Title: '1. Aceitação dos Termos',
        section1Content: 'Ao acessar e usar os serviços da Altus Group, você aceita e concorda em estar vinculado aos termos e disposições deste acordo.',
        section2Title: '2. Licença de Uso',
        section2Content: 'É concedida permissão para acessar temporariamente os materiais (informações ou software) na plataforma Altus Group para visualização pessoal e não comercial apenas.',
        section3Title: '3. Contrato de Empréstimo',
        section3Content: 'Todos os empréstimos estão sujeitos à aprovação de crédito. Os termos e condições serão fornecidos em um contrato de empréstimo separado após a aprovação da sua solicitação.',
        section4Title: '4. Declarações e Garantias',
        section4Content: 'Você declara e garante que todas as informações fornecidas na sua solicitação de empréstimo são precisas, completas e atualizadas.',
        section5Title: '5. Limitação de Responsabilidade',
        section5Content: 'Em nenhum caso a Altus Group ou seus fornecedores serão responsáveis por quaisquer danos decorrentes do uso ou incapacidade de usar os materiais na plataforma Altus Group.',
        section6Title: '6. Modificações',
        section6Content: 'A Altus Group pode revisar estes termos de uso a qualquer momento sem aviso prévio. Ao usar esta plataforma, você concorda em estar vinculado à versão atual destes termos.',
      },
      privacy: {
        section1Title: '1. Informações que Coletamos',
        section1Content: 'Coletamos informações que você nos fornece diretamente ao criar uma conta, solicitar um empréstimo ou comunicar-se conosco. Isso pode incluir seu nome, endereço de e-mail, número de telefone, informações comerciais e dados financeiros.',
        section2Title: '2. Como Usamos Suas Informações',
        section2Content: 'Usamos as informações que coletamos para:',
        section2List: [
          'Processar suas solicitações de empréstimo',
          'Comunicar com você sobre nossos serviços',
          'Melhorar nossa plataforma e serviços',
          'Cumprir com requisitos legais e regulatórios',
        ],
        section3Title: '3. Compartilhamento de Informações',
        section3Content: 'Não vendemos suas informações pessoais. Podemos compartilhar suas informações com:',
        section3List: [
          'Agências de crédito para avaliação de crédito',
          'Provedores de serviços que nos auxiliam em nossas operações',
          'Reguladores e autoridades legais quando exigido por lei',
        ],
        section4Title: '4. Segurança de Dados',
        section4Content: 'Implementamos medidas técnicas e organizacionais apropriadas para proteger suas informações pessoais contra acesso, alteração, divulgação ou destruição não autorizados.',
        section5Title: '5. Seus Direitos',
        section5Content: 'Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Você também pode se opor a certos processamentos de seus dados.',
        section6Title: '6. Cookies',
        section6Content: 'Usamos cookies e tecnologias de rastreamento similares para melhorar sua experiência em nossa plataforma. Você pode controlar os cookies através das configurações do seu navegador.',
        section7Title: '7. Entre em Contato',
        section7Content: 'Se você tiver dúvidas sobre esta política de privacidade, entre em contato conosco em privacy@altus-group.com',
      },
    },
    individualLoans: {
      title: 'Empréstimos para Particulares',
      subtitle: 'Soluções de financiamento adaptadas a todos os seus projetos de vida',
      personalLoan: 'Empréstimo Pessoal',
      personalLoanDesc: 'Financiamento flexível para todos os seus projetos sem comprovante de uso: viagem, casamento, compra de equipamentos. De €1.000 a €75.000 de 12 a 84 meses. Taxa TAEG de 2,9% a 7,9% conforme perfil. Resposta em 48h, fundos em 5 dias.',
      mortgageLoan: 'Empréstimo Imobiliário',
      mortgageLoanDesc: 'Financie sua residência principal, secundária ou investimento para locação. De €50.000 a €500.000 de 10 a 25 anos. Taxas fixas ou variáveis a partir de 1,5% TAEG. Até 110% de contribuição incluindo despesas notariais. Simulação personalizada gratuita.',
      autoLoan: 'Crédito Auto / Moto',
      autoLoanDesc: 'Financie seu veículo novo ou usado, auto ou moto. De €3.000 a €75.000 de 12 a 84 meses. Taxa TAEG de 1,9% a 5,9%. Possibilidade de incluir seguro e acessórios. Resposta imediata em seu concessionário parceiro.',
      studentLoan: 'Empréstimo Estudantil',
      studentLoanDesc: 'Financie seus estudos superiores, mensalidades, moradia estudantil. De €1.000 a €50.000. Diferimento de pagamento total até o fim dos estudos. Taxas preferenciais a partir de 1,5% TAEG. Sem fiador parental sob condições.',
      greenLoan: 'Empréstimo Verde / Eco-PTZ',
      greenLoanDesc: 'Financie trabalhos de renovação energética: isolamento, bomba de calor, painéis solares. De €7.000 a €50.000. Taxas bonificadas a partir de 0,5% TAEG. Elegível para auxílios estatais. Até €30.000 sem contribuição.',
      renovationLoan: 'Empréstimo para Obras',
      renovationLoanDesc: 'Renove, amplie, embeleze sua moradia. De €1.500 a €75.000 de 12 a 120 meses. Taxa TAEG de 2,5% a 6,9%. Sem garantia hipotecária até €50.000. Liberação progressiva conforme andamento das obras possível.',
      amount: 'Montante',
      rate: 'Taxa TAEG',
      duration: 'Duração',
      rateDisclaimer: 'Taxas indicativas sujeitas a condições de elegibilidade. TAEG fixa. Um crédito compromete você e deve ser reembolsado. Verifique suas capacidades de pagamento antes de se comprometer.',
      compareLoans: 'Comparar todos os empréstimos',
    },
    features: {
      title: 'Por Que Escolher Altus Group?',
      subtitle: 'Uma plataforma de empréstimo moderna e transparente que coloca suas necessidades no centro',
      security: 'Segurança Bancária de Nível Empresarial',
      securityDesc: 'Criptografia AES-256, conformidade RGPD, certificação SOC 2 Type II e ISO 27001. Seus dados financeiros são protegidos com os mesmos padrões dos grandes bancos. Autenticação multifator e monitoramento 24/7 contra fraude.',
      fast: 'Resposta Ultra-Rápida 24-48h',
      fastDesc: 'Nossa tecnologia de IA analisa seu dossiê em tempo real. Resposta de aprovação em 15 segundos a 48h no máximo. Fundos transferidos em 2-5 dias. Interface 100% digital, zero papelada, assinatura eletrônica. Ganhe tempo em seu projeto.',
      competitive: 'Entre as Taxas Mais Baixas do Mercado',
      competitiveDesc: 'Graças à nossa rede de 50+ parceiros financeiros e nossa tecnologia de avaliação otimizada, negociamos para você as melhores taxas: de 1,5% a 9,0% conforme perfil. Comparação automática para garantir a melhor oferta.',
      flexible: 'Flexibilidade Máxima Sem Penalidade',
      flexibleDesc: 'Pagamento antecipado gratuito a qualquer momento. Modulação possível de mensalidades conforme sua situação. Adiamento de mensalidades em caso de dificuldades. Escolha de data de débito. Mantenha controle total do seu crédito.',
    },
    stats: {
      clients: 'Clientes Satisfeitos',
      funded: 'Empréstimos Concedidos',
      satisfaction: 'Taxa de Satisfação',
      years: 'Anos de Experiência',
    },
    testimonials: {
      title: 'O que dizem nossos clientes',
      subtitle: 'Mais de 15.000 particulares e profissionais confiam em nós',
      reviews: [
        { name: 'Pedro Silva', role: 'Empresário', company: 'Café Lisboa', text: 'Altus Group me permitiu obter financiamento rápido para desenvolver meu negócio. O processo foi simples e transparente.', rating: 5 },
        { name: 'Ana Santos', role: 'Arquiteta', company: 'Studio Criativo', text: 'Excelente serviço para meu empréstimo imobiliário. Os consultores encontraram a melhor taxa para mim.', rating: 5 },
        { name: 'João Costa', role: 'Engenheiro', company: 'Tech Solutions', text: 'Graças ao Altus Group financiamos novos equipamentos. A flexibilidade de pagamento foi perfeita.', rating: 5 },
        { name: 'Maria Oliveira', role: 'Comerciante', company: 'Moda Boutique', text: 'Processo 100% digital e rápido. Obtive meu empréstimo profissional em 3 dias.', rating: 5 },
        { name: 'Carlos Ferreira', role: 'Estudante', company: 'Universidade', text: 'O empréstimo estudantil com pagamento diferido me permitiu financiar meus estudos sem estresse.', rating: 5 },
      ],
    },
  },
  it: {
    hero: {
      title: 'Realizza i tuoi progetti con Altus Group',
      subtitle: 'Soluzioni di finanziamento per privati e professionisti - Tassi competitivi e processo trasparente',
      cta1: 'Richiedi un prestito',
      cta2: 'Il mio spazio',
      trustIndicator: 'Più di 15.000 clienti soddisfatti si fidano di noi',
      slides: [
        {
          title: 'Realizza i tuoi progetti con Altus Group',
          subtitle: 'Soluzioni di finanziamento per privati e professionisti - Tassi competitivi e processo trasparente',
        },
        {
          title: 'Soluzioni Finanziarie su Misura',
          subtitle: 'Accompagnamento personalizzato per concretizzare tutti i tuoi progetti professionali e personali',
        },
        {
          title: 'Il Tuo Partner di Fiducia',
          subtitle: 'Più di 15.000 clienti soddisfatti si fidano di noi per le loro esigenze di finanziamento',
        },
        {
          title: 'Finanzia le Tue Ambizioni',
          subtitle: 'Tassi vantaggiosi e un processo semplice per dare vita ai tuoi progetti',
        },
        {
          title: 'Esperienza e Accompagnamento',
          subtitle: 'Un team dedicato per guidarti in ogni fase del tuo progetto',
        },
      ],
    },
    nav: {
      home: 'Home',
      products: 'I Nostri Prestiti',
      howItWorks: 'Come funziona',
      resources: 'Risorse',
      about: 'Chi siamo',
      contact: 'Contatto',
      dashboard: 'Dashboard',
      loans: 'Prestiti',
      transfers: 'Trasferimenti',
      history: 'Storico',
      settings: 'Impostazioni',
      logout: 'Esci',
    },
    dashboard: {
      welcome: 'Benvenuto',
      currentBalance: 'Saldo attuale',
      activeLoans: 'Prestiti attivi',
      totalBorrowed: 'Totale preso in prestito',
      availableCredit: 'Credito disponibile',
      lastUpdated: 'Ultimo aggiornamento',
      borrowingCapacity: 'Capacità di prestito',
      canBorrowUpTo: 'Puoi prendere in prestito fino a',
      quickActions: 'Azioni rapide',
      newLoan: 'Nuovo prestito',
      transferFunds: 'Trasferisci fondi',
      transactionHistory: 'Storico transazioni',
      fees: 'Commissioni',
      pendingTransfers: 'Trasferimenti in sospeso',
      availableFunds: 'Fondi disponibili',
      upcomingRepayments: 'Prossimi rimborsi',
    },
    loan: {
      amount: 'Importo',
      interestRate: 'Tasso di interesse',
      nextPayment: 'Prossimo pagamento',
      viewAll: 'Vedi tutto',
    },
    transfer: {
      requestSubmitted: 'Richiesta inviata',
      documentVerification: 'Verifica documenti',
      complianceCheck: 'Controllo conformità',
      approvalPending: 'Approvazione in sospeso',
      transferComplete: 'Trasferimento completato',
      pending: 'In sospeso',
      inProgress: 'In corso',
      approved: 'Approvato',
      rejected: 'Rifiutato',
    },
    fee: {
      type: 'Tipo di commissione',
      reason: 'Motivo',
      amount: 'Importo',
      date: 'Data',
      downloadStatement: 'Scarica estratto conto',
      loanFees: 'Commissioni prestito',
      transferFees: 'Commissioni trasferimento',
      accountFees: 'Commissioni conto',
    },
    common: {
      loading: 'Caricamento...',
      error: 'Errore',
      success: 'Successo',
    },
    about: {
      title: 'Chi siamo - Altus Group',
      subtitle: 'Il tuo partner di fiducia per il finanziamento di privati e professionisti',
      mission: 'La Nostra Missione',
      missionText: 'In Altus Group, democratizziamo l\'accesso al finanziamento per tutti. Che tu sia un privato con un progetto personale o un\'azienda in sviluppo, offriamo soluzioni di credito moderne, trasparenti e adattate alle tue esigenze. La nostra tecnologia all\'avanguardia ci permette di analizzare rapidamente la tua situazione e offrirti offerte personalizzate con tassi competitivi. Crediamo nella trasparenza totale: nessuna commissione nascosta, condizioni chiare e supporto ad ogni passo.',
      stats: {
        clients: 'Clienti attivi',
        loansProvided: 'Prestiti concessi',
        successRate: 'Tasso di soddisfazione',
        yearsExperience: 'Anni di esperienza',
      },
    },
    howItWorks: {
      title: 'Come funziona',
      subtitle: 'Un processo 100% digitale in 4 semplici passi',
      step1Title: 'Richiesta online - 4 minuti',
      step1Desc: 'Compila il nostro modulo sicuro con le tue informazioni personali o professionali. Non è necessario spostarsi, tutto si fa online con verifica istantanea dell\'identità (KYC) e caricamento semplificato dei documenti.',
      step2Title: 'Analisi automatizzata - 24-48h',
      step2Desc: 'La nostra tecnologia di valutazione del credito analizza il tuo profilo finanziario, redditi e storico. Grazie ai nostri algoritmi avanzati e all\'integrazione con le agenzie di credito, ti diamo una risposta di approvazione entro 48h massimo.',
      step3Title: 'Offerta personalizzata trasparente',
      step3Desc: 'Ricevi la tua offerta di prestito con tutte le informazioni: importo, tasso APR, rate mensili, durata, costo totale del credito. Nessuna commissione nascosta, condizioni chiare e possibilità di simulare diversi scenari prima di accettare.',
      step4Title: 'Erogazione rapida - 2-5 giorni',
      step4Desc: 'Firma elettronica del tuo contratto e trasferimento automatico dei fondi sul tuo conto bancario. Per i prestiti professionali, possibilità di impostare un piano di pagamento personalizzato adattato al tuo flusso di cassa.',
    },
    products: {
      title: 'Le Nostre Soluzioni di Prestito',
      subtitle: 'Prodotti adattati alle tue esigenze - Privati e Professionisti',
      businessTitle: 'Prestiti Professionali',
      businessSubtitle: 'Prodotti adattati alle tue esigenze professionali',
      termLoans: 'Prestiti a Termine Professionali',
      termLoansDesc: 'Finanziamento a medio e lungo termine per i tuoi investimenti strategici: sviluppo, acquisizione, espansione. Da €10.000 a €500.000 da 1 a 7 anni. Tassi fissi dal 3,5% all\'8,5% APR secondo profilo. Rimborso anticipato senza penalità.',
      lineOfCredit: 'Linea di Credito Revolving',
      lineOfCreditDesc: 'Credito flessibile per gestire il tuo flusso di cassa e far fronte agli imprevisti. Da €5.000 a €100.000. Tasso dal 4,0% al 9,0% APR. Paghi interessi solo sulle somme utilizzate. Ricostituzione automatica del capitale disponibile.',
      equipmentFinancing: 'Finanziamento Attrezzature',
      equipmentFinancingDesc: 'Finanzia le tue attrezzature professionali, veicoli commerciali, macchinari, strumenti. Da €20.000 a €300.000 da 2 a 5 anni. Tasso dal 3,9% al 7,5% APR. L\'attrezzatura può servire da garanzia, facilitando l\'ottenimento del prestito.',
      invoiceFactoring: 'Factoring / Cessione Crediti',
      invoiceFactoringDesc: 'Trasforma le tue fatture clienti in liquidità immediata per migliorare il tuo flusso di cassa. Anticipo fino al 90% dell\'importo delle fatture entro 24-48h. Commissioni dall\'1% al 3% secondo volume e ritardo. Ideale per aziende B2B.',
    },
    contact: {
      title: 'Contattaci',
      subtitle: 'Il nostro team è a tua disposizione',
      name: 'Nome completo',
      email: 'Email',
      phone: 'Telefono',
      message: 'Messaggio',
      send: 'Invia',
      success: 'Messaggio inviato con successo',
      error: 'Errore nell\'invio del messaggio',
    },
    resources: {
      title: 'Risorse',
      subtitle: 'Tutte le informazioni per accompagnarti nel tuo progetto',
      faqTitle: 'Domande Frequenti',
      faqs: [
        {
          question: 'Quali documenti sono necessari per una richiesta di prestito?',
          answer: 'Per privati: documento d\'identità, prova di residenza, ultime buste paga (3 mesi), dichiarazione dei redditi. Per professionisti: visura camerale (meno di 3 mesi), bilanci e conti economici (ultimi 2 anni), estratti conto bancari professionali (3-6 mesi), documento d\'identità del dirigente. Tutti i documenti possono essere caricati direttamente online in modo sicuro.',
        },
        {
          question: 'Quanto tempo richiede il processo di approvazione?',
          answer: 'La nostra tecnologia di valutazione automatizzata ti dà una risposta di approvazione in 15 secondi fino a 48 ore massimo. Una volta convalidato il tuo dossier completo, i fondi vengono trasferiti entro 2-5 giorni lavorativi. Per importi elevati (>€100.000), conta 5-7 giorni per un\'analisi approfondita.',
        },
        {
          question: 'Qual è l\'importo minimo e massimo che posso prendere in prestito?',
          answer: 'Prestiti personali: da €1.000 a €75.000. Mutui ipotecari: da €50.000 a €500.000. Prestiti professionali a termine: da €10.000 a €500.000. Linee di credito: da €5.000 a €100.000. L\'importo esatto dipende dalla tua capacità di rimborso calcolata secondo redditi, oneri e storico creditizio.',
        },
        {
          question: 'Posso rimborsare il mio prestito anticipatamente?',
          answer: 'Sì, tutti i nostri prestiti permettono il rimborso anticipato senza penalità o commissioni nascoste. Puoi rimborsare parzialmente o totalmente il tuo credito in qualsiasi momento dalla tua area clienti. Questo riduce automaticamente il costo totale degli interessi. Mantieni così il controllo totale sul tuo credito.',
        },
        {
          question: 'Quali sono i criteri di eleggibilità per un prestito?',
          answer: 'Privati: essere maggiorenni, risiedere in Francia, avere redditi regolari e tasso di indebitamento <40%. Professionisti: azienda attiva da 6+ mesi, fatturato mensile minimo di €15.000, nessun inadempimento di pagamento recente. Il punteggio di credito viene verificato automaticamente tramite le agenzie di credito. I dossier vengono studiati caso per caso.',
        },
        {
          question: 'Come vengono calcolati i tassi di interesse?',
          answer: 'I nostri tassi vengono calcolati da un algoritmo che analizza diversi fattori: il tuo punteggio di credito, la durata del prestito, l\'importo preso in prestito, i tuoi redditi e oneri, lo storico di rimborso e la salute finanziaria (per le aziende). I tassi variano dal 3,5% al 9,0% APR secondo il profilo. I nostri tassi sono tra i più competitivi sul mercato grazie alla nostra rete di partner finanziari.',
        },
        {
          question: 'Ci sono commissioni di pratica o commissioni nascoste?',
          answer: 'Trasparenza totale: mostriamo tutte le commissioni dalla simulazione. Commissioni di pratica: €0 a €150 secondo il tipo di prestito. Nessuna commissione di rimborso anticipato. Nessuna commissione mensile di gestione. Il TAEG (Tasso Annuo Effettivo Globale) include tutti i costi per un facile confronto con altre offerte.',
        },
        {
          question: 'Come calcolare la mia capacità di prestito?',
          answer: 'La tua capacità di prestito dipende dal tuo tasso di indebitamento che non deve superare il 40% dei tuoi redditi netti. Formula: (Redditi mensili × 0,40) - Oneri di credito esistenti = Rata massima disponibile. Il nostro simulatore online calcola automaticamente la tua capacità di prestito e suggerisce importi adattati. Puoi regolare la durata per modulare le rate.',
        },
        {
          question: 'Posso ottenere un prestito con un punteggio di credito basso?',
          answer: 'Sì, accettiamo profili vari. La nostra tecnologia di valutazione analizza anche dati alternativi oltre al semplice punteggio di credito: stabilità professionale, redditi ricorrenti, risparmio, storico bancario. Punteggi accettati da 500-560 per certi prodotti. Anche con uno storico imperfetto, puoi ottenere un prestito, ma i tassi verranno adeguati al rischio.',
        },
        {
          question: 'Cosa succede se non posso pagare una rata mensile?',
          answer: 'Contattaci immediatamente. Offriamo diverse soluzioni: differimento di rata (sospensione temporanea), modulazione al ribasso delle rate, riscadenziamento del prestito. Possono essere applicate penalità di ritardo ma privilegiamo sempre il dialogo per trovare una soluzione adattata alla tua situazione. Supporto personalizzato disponibile in caso di difficoltà.',
        },
      ],
    },
    legal: {
      termsTitle: 'Termini di Utilizzo',
      privacyTitle: 'Politica sulla Privacy',
      lastUpdated: 'Ultimo aggiornamento: Gennaio 2025',
      terms: {
        section1Title: '1. Accettazione dei Termini',
        section1Content: 'Accedendo e utilizzando i servizi di Altus Group, accetti e accetti di essere vincolato dai termini e disposizioni di questo accordo.',
        section2Title: '2. Licenza d\'Uso',
        section2Content: 'L\'autorizzazione è concessa per accedere temporaneamente ai materiali (informazioni o software) sulla piattaforma Altus Group solo per visualizzazione personale e non commerciale.',
        section3Title: '3. Contratto di Prestito',
        section3Content: 'Tutti i prestiti sono soggetti all\'approvazione del credito. I termini e le condizioni verranno forniti in un contratto di prestito separato all\'approvazione della tua richiesta.',
        section4Title: '4. Dichiarazioni e Garanzie',
        section4Content: 'Dichiari e garantisci che tutte le informazioni fornite nella tua richiesta di prestito sono accurate, complete e aggiornate.',
        section5Title: '5. Limitazione di Responsabilità',
        section5Content: 'In nessun caso Altus Group o i suoi fornitori saranno responsabili per eventuali danni derivanti dall\'uso o dall\'impossibilità di utilizzare i materiali sulla piattaforma Altus Group.',
        section6Title: '6. Modifiche',
        section6Content: 'Altus Group può rivedere questi termini di utilizzo in qualsiasi momento senza preavviso. Utilizzando questa piattaforma, accetti di essere vincolato dalla versione corrente di questi termini.',
      },
      privacy: {
        section1Title: '1. Informazioni che Raccogliamo',
        section1Content: 'Raccogliamo le informazioni che ci fornisci direttamente quando crei un account, richiedi un prestito o comunichi con noi. Questo può includere il tuo nome, indirizzo email, numero di telefono, informazioni commerciali e dati finanziari.',
        section2Title: '2. Come Utilizziamo le Tue Informazioni',
        section2Content: 'Utilizziamo le informazioni che raccogliamo per:',
        section2List: [
          'Elaborare le tue richieste di prestito',
          'Comunicare con te sui nostri servizi',
          'Migliorare la nostra piattaforma e servizi',
          'Conformarci ai requisiti legali e regolamentari',
        ],
        section3Title: '3. Condivisione delle Informazioni',
        section3Content: 'Non vendiamo le tue informazioni personali. Possiamo condividere le tue informazioni con:',
        section3List: [
          'Agenzie di credito per la valutazione del credito',
          'Fornitori di servizi che ci assistono nelle nostre operazioni',
          'Regolatori e forze dell\'ordine quando richiesto dalla legge',
        ],
        section4Title: '4. Sicurezza dei Dati',
        section4Content: 'Implementiamo misure tecniche e organizzative appropriate per proteggere le tue informazioni personali contro l\'accesso, l\'alterazione, la divulgazione o la distruzione non autorizzati.',
        section5Title: '5. I Tuoi Diritti',
        section5Content: 'Hai il diritto di accedere, correggere o eliminare le tue informazioni personali. Puoi anche opporti a determinati trattamenti dei tuoi dati.',
        section6Title: '6. Cookie',
        section6Content: 'Utilizziamo cookie e tecnologie di tracciamento simili per migliorare la tua esperienza sulla nostra piattaforma. Puoi controllare i cookie tramite le impostazioni del tuo browser.',
        section7Title: '7. Contattaci',
        section7Content: 'Se hai domande riguardo a questa politica sulla privacy, contattaci all\'indirizzo privacy@altus-group.com',
      },
    },
    individualLoans: {
      title: 'Prestiti per Privati',
      subtitle: 'Soluzioni di finanziamento adattate a tutti i tuoi progetti di vita',
      personalLoan: 'Prestito Personale',
      personalLoanDesc: 'Finanziamento flessibile per tutti i tuoi progetti senza giustificativo d\'uso: viaggio, matrimonio, acquisto attrezzature. Da €1.000 a €75.000 da 12 a 84 mesi. Tasso TAEG dal 2,9% al 7,9% secondo profilo. Risposta in 48h, fondi in 5 giorni.',
      mortgageLoan: 'Mutuo Ipotecario',
      mortgageLoanDesc: 'Finanzia la tua residenza principale, secondaria o investimento in affitto. Da €50.000 a €500.000 da 10 a 25 anni. Tassi fissi o variabili a partire dall\'1,5% TAEG. Fino al 110% di contributo incluse spese notarili. Simulazione personalizzata gratuita.',
      autoLoan: 'Credito Auto / Moto',
      autoLoanDesc: 'Finanzia il tuo veicolo nuovo o usato, auto o moto. Da €3.000 a €75.000 da 12 a 84 mesi. Tasso TAEG dall\'1,9% al 5,9%. Possibilità di includere assicurazione e accessori. Risposta immediata presso il tuo concessionario partner.',
      studentLoan: 'Prestito Studenti',
      studentLoanDesc: 'Finanzia i tuoi studi superiori, tasse scolastiche, alloggio studenti. Da €1.000 a €50.000. Differimento del rimborso totale fino alla fine degli studi. Tassi preferenziali dall\'1,5% TAEG. Senza garante parentale a condizioni.',
      greenLoan: 'Prestito Verde / Eco-PTZ',
      greenLoanDesc: 'Finanzia lavori di ristrutturazione energetica: isolamento, pompa di calore, pannelli solari. Da €7.000 a €50.000. Tassi agevolati dallo 0,5% TAEG. Idoneo per aiuti statali. Fino a €30.000 senza contributo.',
      renovationLoan: 'Prestito Ristrutturazione',
      renovationLoanDesc: 'Ristruttura, amplia, abbellisci la tua casa. Da €1.500 a €75.000 da 12 a 120 mesi. Tasso TAEG dal 2,5% al 6,9%. Senza garanzia ipotecaria fino a €50.000. Erogazione progressiva secondo avanzamento lavori possibile.',
      amount: 'Importo',
      rate: 'Tasso TAEG',
      duration: 'Durata',
      rateDisclaimer: 'Tassi indicativi soggetti a condizioni di eleggibilità. TAEG fisso. Un credito ti impegna e deve essere rimborsato. Verifica le tue capacità di rimborso prima di impegnarti.',
      compareLoans: 'Confronta tutti i prestiti',
    },
    features: {
      title: 'Perché Scegliere Altus Group?',
      subtitle: 'Una piattaforma di prestito moderna e trasparente che mette le tue esigenze al centro',
      security: 'Sicurezza Bancaria di Livello Aziendale',
      securityDesc: 'Crittografia AES-256, conformità GDPR, certificazione SOC 2 Type II e ISO 27001. I tuoi dati finanziari sono protetti con gli stessi standard delle grandi banche. Autenticazione a più fattori e monitoraggio 24/7 contro le frodi.',
      fast: 'Risposta Ultra-Rapida 24-48h',
      fastDesc: 'La nostra tecnologia IA analizza il tuo dossier in tempo reale. Risposta di approvazione in 15 secondi fino a 48h massimo. Fondi trasferiti in 2-5 giorni. Interfaccia 100% digitale, zero burocrazia, firma elettronica. Risparmia tempo sul tuo progetto.',
      competitive: 'Tra i Tassi Più Bassi del Mercato',
      competitiveDesc: 'Grazie alla nostra rete di 50+ partner finanziari e alla nostra tecnologia di valutazione ottimizzata, negoziamo per te i migliori tassi: dall\'1,5% al 9,0% secondo il profilo. Confronto automatico per garantirti la migliore offerta.',
      flexible: 'Massima Flessibilità Senza Penalità',
      flexibleDesc: 'Rimborso anticipato gratuito in qualsiasi momento. Modulazione possibile delle rate secondo la tua situazione. Differimento delle rate in caso di difficoltà. Scelta della data di addebito. Mantieni il controllo totale del tuo credito.',
    },
    stats: {
      clients: 'Clienti Soddisfatti',
      funded: 'Prestiti Concessi',
      satisfaction: 'Tasso di Soddisfazione',
      years: 'Anni di Esperienza',
    },
    testimonials: {
      title: 'Cosa dicono i nostri clienti',
      subtitle: 'Più di 15.000 privati e professionisti si fidano di noi',
      reviews: [
        { name: 'Marco Rossi', role: 'Imprenditore', company: 'Ristorante Roma', text: 'Altus Group mi ha permesso di ottenere un finanziamento rapido per sviluppare il mio business. Il processo era semplice e trasparente.', rating: 5 },
        { name: 'Giulia Bianchi', role: 'Architetto', company: 'Studio Creativo', text: 'Servizio eccellente per il mio prestito immobiliare. I consulenti hanno trovato il miglior tasso per me.', rating: 5 },
        { name: 'Luca Ferrari', role: 'Ingegnere', company: 'Tech Solutions', text: 'Grazie ad Altus Group abbiamo finanziato nuove attrezzature. La flessibilità di pagamento è stata perfetta.', rating: 5 },
        { name: 'Sofia Romano', role: 'Commerciante', company: 'Boutique Moda', text: 'Processo 100% digitale e veloce. Ho ottenuto il mio prestito professionale in 3 giorni.', rating: 5 },
        { name: 'Alessandro Marino', role: 'Studente', company: 'Università', text: 'Il prestito studenti con pagamento differito mi ha permesso di finanziare i miei studi senza stress.', rating: 5 },
      ],
    },
  },
  de: {
    hero: {
      title: 'Verwirklichen Sie Ihre Projekte mit Altus Group',
      subtitle: 'Finanzierungslösungen für Privatpersonen und Unternehmen - Wettbewerbsfähige Zinsen und transparenter Prozess',
      cta1: 'Kredit beantragen',
      cta2: 'Mein Bereich',
      trustIndicator: 'Mehr als 15.000 zufriedene Kunden vertrauen uns',
      slides: [
        {
          title: 'Verwirklichen Sie Ihre Projekte mit Altus Group',
          subtitle: 'Finanzierungslösungen für Privatpersonen und Unternehmen - Wettbewerbsfähige Zinsen und transparenter Prozess',
        },
        {
          title: 'Maßgeschneiderte Finanzlösungen',
          subtitle: 'Persönliche Betreuung zur Verwirklichung all Ihrer beruflichen und privaten Projekte',
        },
        {
          title: 'Ihr vertrauenswürdiger Partner',
          subtitle: 'Mehr als 15.000 zufriedene Kunden vertrauen uns für ihre Finanzierungsbedürfnisse',
        },
        {
          title: 'Finanzieren Sie Ihre Ambitionen',
          subtitle: 'Vorteilhafte Zinsen und ein einfacher Prozess, um Ihre Projekte zum Leben zu erwecken',
        },
        {
          title: 'Expertise und Begleitung',
          subtitle: 'Ein engagiertes Team, das Sie bei jedem Schritt Ihres Projekts begleitet',
        },
      ],
    },
    nav: {
      home: 'Startseite',
      products: 'Unsere Kredite',
      howItWorks: 'Wie es funktioniert',
      resources: 'Ressourcen',
      about: 'Über uns',
      contact: 'Kontakt',
      dashboard: 'Dashboard',
      loans: 'Kredite',
      transfers: 'Überweisungen',
      history: 'Verlauf',
      settings: 'Einstellungen',
      logout: 'Abmelden',
    },
    dashboard: {
      welcome: 'Willkommen',
      currentBalance: 'Aktueller Saldo',
      activeLoans: 'Aktive Kredite',
      totalBorrowed: 'Gesamt geliehen',
      availableCredit: 'Verfügbarer Kredit',
      lastUpdated: 'Letzte Aktualisierung',
      borrowingCapacity: 'Kreditkapazität',
      canBorrowUpTo: 'Sie können bis zu leihen',
      quickActions: 'Schnellaktionen',
      newLoan: 'Neuer Kredit',
      transferFunds: 'Geld überweisen',
      transactionHistory: 'Transaktionsverlauf',
      fees: 'Gebühren',
      pendingTransfers: 'Ausstehende Überweisungen',
      availableFunds: 'Verfügbare Mittel',
      upcomingRepayments: 'Bevorstehende Rückzahlungen',
    },
    loan: {
      amount: 'Betrag',
      interestRate: 'Zinssatz',
      nextPayment: 'Nächste Zahlung',
      viewAll: 'Alle anzeigen',
    },
    transfer: {
      requestSubmitted: 'Anfrage eingereicht',
      documentVerification: 'Dokumentenprüfung',
      complianceCheck: 'Compliance-Prüfung',
      approvalPending: 'Genehmigung ausstehend',
      transferComplete: 'Überweisung abgeschlossen',
      pending: 'Ausstehend',
      inProgress: 'In Bearbeitung',
      approved: 'Genehmigt',
      rejected: 'Abgelehnt',
    },
    fee: {
      type: 'Gebührentyp',
      reason: 'Grund',
      amount: 'Betrag',
      date: 'Datum',
      downloadStatement: 'Kontoauszug herunterladen',
      loanFees: 'Kreditgebühren',
      transferFees: 'Überweisungsgebühren',
      accountFees: 'Kontogebühren',
    },
    common: {
      loading: 'Lädt...',
      error: 'Fehler',
      success: 'Erfolg',
    },
    about: {
      title: 'Über Altus Group',
      subtitle: 'Ihr vertrauenswürdiger Partner für die Finanzierung von Privatpersonen und Unternehmen',
      mission: 'Unsere Mission',
      missionText: 'Bei Altus Group demokratisieren wir den Zugang zu Finanzierungen für alle. Ob Sie eine Privatperson mit einem persönlichen Projekt oder ein wachsendes Unternehmen sind, wir bieten moderne, transparente Kreditlösungen, die auf Ihre Bedürfnisse zugeschnitten sind. Unsere modernste Technologie ermöglicht es uns, Ihre Situation schnell zu analysieren und personalisierte Angebote mit wettbewerbsfähigen Zinsen anzubieten. Wir glauben an totale Transparenz: keine versteckten Gebühren, klare Bedingungen und Unterstützung bei jedem Schritt.',
      stats: {
        clients: 'Aktive Kunden',
        loansProvided: 'Gewährte Kredite',
        successRate: 'Zufriedenheitsrate',
        yearsExperience: 'Jahre Erfahrung',
      },
    },
    howItWorks: {
      title: 'Wie es funktioniert',
      subtitle: 'Ein 100% digitaler Prozess in 4 einfachen Schritten',
      step1Title: 'Online-Antrag - 4 Minuten',
      step1Desc: 'Füllen Sie unser sicheres Formular mit Ihren persönlichen oder geschäftlichen Informationen aus. Kein Reisen erforderlich, alles wird online mit sofortiger Identitätsprüfung (KYC) und vereinfachtem Dokumenten-Upload erledigt.',
      step2Title: 'Automatisierte Analyse - 24-48h',
      step2Desc: 'Unsere Kreditbewertungstechnologie analysiert Ihr Finanzprofil, Einkommen und Historie. Dank unserer fortschrittlichen Algorithmen und Integration mit Kreditbüros geben wir Ihnen innerhalb von maximal 48 Stunden eine Genehmigungsantwort.',
      step3Title: 'Transparentes personalisiertes Angebot',
      step3Desc: 'Erhalten Sie Ihr Kreditangebot mit allen Informationen: Betrag, APR-Zinssatz, monatliche Raten, Laufzeit, Gesamtkreditkosten. Keine versteckten Gebühren, klare Bedingungen und die Möglichkeit, verschiedene Szenarien zu simulieren, bevor Sie akzeptieren.',
      step4Title: 'Schnelle Auszahlung - 2 bis 5 Tage',
      step4Desc: 'Elektronische Unterzeichnung Ihres Vertrags und automatische Überweisung der Mittel auf Ihr Bankkonto. Für Unternehmenskredite ist die Einrichtung eines personalisierten Zahlungsplans möglich, der an Ihren Cashflow angepasst ist.',
    },
    products: {
      title: 'Unsere Kreditlösungen',
      subtitle: 'Produkte, die auf Ihre Bedürfnisse zugeschnitten sind - Privatpersonen und Unternehmen',
      businessTitle: 'Unternehmenskredite',
      businessSubtitle: 'Produkte, die auf Ihre geschäftlichen Bedürfnisse zugeschnitten sind',
      termLoans: 'Professionelle Laufzeitkredite',
      termLoansDesc: 'Mittel- und langfristige Finanzierung für Ihre strategischen Investitionen: Entwicklung, Akquisition, Expansion. Von €10.000 bis €500.000 über 1 bis 7 Jahre. Feste Zinssätze von 3,5% bis 8,5% APR je nach Profil. Vorzeitige Rückzahlung ohne Strafe.',
      lineOfCredit: 'Revolvierende Kreditlinie',
      lineOfCreditDesc: 'Flexibler Kredit zur Verwaltung Ihres Cashflows und zur Bewältigung unerwarteter Ausgaben. Von €5.000 bis €100.000. Zinssätze von 4,0% bis 9,0% APR. Zahlen Sie Zinsen nur auf verwendete Beträge. Automatische Wiederherstellung des verfügbaren Kapitals.',
      equipmentFinancing: 'Ausrüstungsfinanzierung',
      equipmentFinancingDesc: 'Finanzieren Sie Ihre professionelle Ausrüstung, Nutzfahrzeuge, Maschinen, Werkzeuge. Von €20.000 bis €300.000 über 2 bis 5 Jahre. Zinssätze von 3,9% bis 7,5% APR. Die Ausrüstung kann als Sicherheit dienen und die Kreditgenehmigung erleichtern.',
      invoiceFactoring: 'Factoring / Forderungsabtretung',
      invoiceFactoringDesc: 'Verwandeln Sie Ihre Kundenrechnungen in sofortige Liquidität, um Ihren Cashflow zu verbessern. Vorschuss bis zu 90% der Rechnungsbeträge innerhalb von 24-48h. Gebühren von 1% bis 3% je nach Volumen und Verzögerung. Ideal für B2B-Unternehmen.',
    },
    contact: {
      title: 'Kontaktieren Sie uns',
      subtitle: 'Unser Team steht Ihnen zur Verfügung',
      name: 'Vollständiger Name',
      email: 'E-Mail',
      phone: 'Telefon',
      message: 'Nachricht',
      send: 'Senden',
      success: 'Nachricht erfolgreich gesendet',
      error: 'Fehler beim Senden der Nachricht',
    },
    resources: {
      title: 'Ressourcen',
      subtitle: 'Alle Informationen, um Sie bei Ihrem Projekt zu unterstützen',
      faqTitle: 'Häufig gestellte Fragen',
      faqs: [
        {
          question: 'Welche Dokumente sind für einen Kreditantrag erforderlich?',
          answer: 'Für Privatpersonen: Personalausweis, Adressnachweis, aktuelle Gehaltsabrechnungen (3 Monate), Steuerbescheid. Für Unternehmen: Handelsregisterauszug (<3 Monate), Bilanzen und Gewinn- und Verlustrechnungen (letzte 2 Jahre), geschäftliche Kontoauszüge (3-6 Monate), Ausweis des Geschäftsführers. Alle Dokumente können sicher direkt online hochgeladen werden.',
        },
        {
          question: 'Wie lange dauert der Genehmigungsprozess?',
          answer: 'Unsere automatisierte Bewertungstechnologie gibt Ihnen in 15 Sekunden bis maximal 48 Stunden eine Genehmigungsantwort. Sobald Ihre vollständige Akte validiert ist, werden die Mittel innerhalb von 2 bis 5 Werktagen überwiesen. Für größere Beträge (>€100.000) rechnen Sie mit 5 bis 7 Tagen für eine gründliche Analyse.',
        },
        {
          question: 'Was ist der Mindest- und Höchstbetrag, den ich leihen kann?',
          answer: 'Privatkredite: von €1.000 bis €75.000. Hypothekenkredite: von €50.000 bis €500.000. Unternehmenskredite: von €10.000 bis €500.000. Kreditlinien: von €5.000 bis €100.000. Der genaue Betrag hängt von Ihrer Rückzahlungsfähigkeit ab, die anhand von Einkommen, Ausgaben und Kredithistorie berechnet wird.',
        },
        {
          question: 'Kann ich meinen Kredit vorzeitig zurückzahlen?',
          answer: 'Ja, alle unsere Kredite erlauben vorzeitige Rückzahlung ohne Strafe oder versteckte Gebühren. Sie können Ihren Kredit jederzeit teilweise oder vollständig über Ihren Kundenbereich zurückzahlen. Dies reduziert automatisch die Gesamtzinskosten. Sie behalten so die volle Kontrolle über Ihren Kredit.',
        },
        {
          question: 'Was sind die Zulassungskriterien für einen Kredit?',
          answer: 'Privatpersonen: volljährig sein, in Frankreich wohnen, regelmäßiges Einkommen haben und Schuldenverhältnis <40%. Unternehmen: seit 6+ Monaten aktiv, monatlicher Mindestumsatz von €15.000, keine kürzlichen Zahlungsausfälle. Die Kreditwürdigkeit wird automatisch über Kreditbüros überprüft. Die Fälle werden einzeln geprüft.',
        },
        {
          question: 'Wie werden die Zinssätze berechnet?',
          answer: 'Unsere Zinssätze werden von einem Algorithmus berechnet, der mehrere Faktoren analysiert: Ihre Kreditwürdigkeit, Kreditlaufzeit, geliehener Betrag, Ihr Einkommen und Ausgaben, Rückzahlungshistorie und finanzielle Gesundheit (für Unternehmen). Die Zinssätze variieren je nach Profil von 3,5% bis 9,0% APR. Unsere Zinssätze gehören zu den wettbewerbsfähigsten auf dem Markt dank unserem Netzwerk von Finanzpartnern.',
        },
        {
          question: 'Gibt es Bearbeitungsgebühren oder versteckte Kosten?',
          answer: 'Totale Transparenz: Wir zeigen alle Gebühren ab der Simulation an. Bearbeitungsgebühren: €0 bis €150 je nach Kreditart. Keine Gebühren für vorzeitige Rückzahlung. Keine monatlichen Verwaltungsgebühren. Der effektive Jahreszins (APR) enthält alle Kosten für einen einfachen Vergleich mit anderen Angeboten.',
        },
        {
          question: 'Wie berechne ich meine Kreditfähigkeit?',
          answer: 'Ihre Kreditfähigkeit hängt von Ihrem Schuldenverhältnis ab, das 40% Ihres Nettoeinkommens nicht überschreiten darf. Formel: (Monatliches Einkommen × 0,40) - Bestehende Kreditbelastungen = Maximale verfügbare monatliche Rate. Unser Online-Simulator berechnet automatisch Ihre Kreditfähigkeit und schlägt angepasste Beträge vor. Sie können die Laufzeit anpassen, um die Raten zu modulieren.',
        },
        {
          question: 'Kann ich mit niedriger Kreditwürdigkeit einen Kredit erhalten?',
          answer: 'Ja, wir akzeptieren verschiedene Profile. Unsere Bewertungstechnologie analysiert auch alternative Daten über die einfache Kreditwürdigkeit hinaus: berufliche Stabilität, wiederkehrendes Einkommen, Ersparnisse, Bankenhistorie. Scores werden ab 500-560 für bestimmte Produkte akzeptiert. Selbst mit unvollkommener Historie können Sie einen Kredit erhalten, aber die Zinssätze werden an das Risiko angepasst.',
        },
        {
          question: 'Was passiert, wenn ich eine monatliche Rate nicht zahlen kann?',
          answer: 'Kontaktieren Sie uns sofort. Wir bieten mehrere Lösungen: Zahlungsaufschub (vorübergehende Gnadenfrist), Reduzierung der Raten, Umschuldung des Kredits. Verzugsstrafen können anfallen, aber wir bevorzugen immer den Dialog, um eine an Ihre Situation angepasste Lösung zu finden. Personalisierte Unterstützung ist bei Schwierigkeiten verfügbar.',
        },
      ],
    },
    legal: {
      termsTitle: 'Nutzungsbedingungen',
      privacyTitle: 'Datenschutzrichtlinie',
      lastUpdated: 'Letzte Aktualisierung: Januar 2025',
      terms: {
        section1Title: '1. Annahme der Bedingungen',
        section1Content: 'Durch den Zugriff auf und die Nutzung der Dienste von Altus Group akzeptieren Sie und erklären sich damit einverstanden, an die Bedingungen und Bestimmungen dieser Vereinbarung gebunden zu sein.',
        section2Title: '2. Nutzungslizenz',
        section2Content: 'Die Erlaubnis wird erteilt, vorübergehend auf die Materialien (Informationen oder Software) auf der Altus Group-Plattform nur für persönliche, nichtkommerzielle vorübergehende Ansicht zuzugreifen.',
        section3Title: '3. Kreditvertrag',
        section3Content: 'Alle Kredite unterliegen der Kreditgenehmigung. Die Bedingungen werden in einem separaten Kreditvertrag bei Genehmigung Ihres Antrags bereitgestellt.',
        section4Title: '4. Erklärungen und Garantien',
        section4Content: 'Sie erklären und garantieren, dass alle in Ihrem Kreditantrag bereitgestellten Informationen genau, vollständig und aktuell sind.',
        section5Title: '5. Haftungsbeschränkung',
        section5Content: 'In keinem Fall haften Altus Group oder seine Lieferanten für Schäden, die sich aus der Nutzung oder Unfähigkeit zur Nutzung der Materialien auf der Altus Group-Plattform ergeben.',
        section6Title: '6. Änderungen',
        section6Content: 'Altus Group kann diese Nutzungsbedingungen jederzeit ohne Vorankündigung überarbeiten. Durch die Nutzung dieser Plattform erklären Sie sich damit einverstanden, an die aktuelle Version dieser Bedingungen gebunden zu sein.',
      },
      privacy: {
        section1Title: '1. Informationen, die wir sammeln',
        section1Content: 'Wir sammeln Informationen, die Sie uns direkt zur Verfügung stellen, wenn Sie ein Konto erstellen, einen Kredit beantragen oder mit uns kommunizieren. Dies kann Ihren Namen, E-Mail-Adresse, Telefonnummer, Geschäftsinformationen und Finanzdaten umfassen.',
        section2Title: '2. Wie wir Ihre Informationen verwenden',
        section2Content: 'Wir verwenden die von uns gesammelten Informationen um:',
        section2List: [
          'Ihre Kreditanträge zu bearbeiten',
          'Mit Ihnen über unsere Dienstleistungen zu kommunizieren',
          'Unsere Plattform und Dienstleistungen zu verbessern',
          'Gesetzliche und regulatorische Anforderungen zu erfüllen',
        ],
        section3Title: '3. Informationsweitergabe',
        section3Content: 'Wir verkaufen Ihre persönlichen Informationen nicht. Wir können Ihre Informationen teilen mit:',
        section3List: [
          'Kreditbüros zur Kreditbewertung',
          'Dienstleistern, die uns bei unseren Geschäftstätigkeiten unterstützen',
          'Aufsichtsbehörden und Strafverfolgungsbehörden, wenn gesetzlich vorgeschrieben',
        ],
        section4Title: '4. Datensicherheit',
        section4Content: 'Wir implementieren geeignete technische und organisatorische Maßnahmen zum Schutz Ihrer persönlichen Informationen vor unbefugtem Zugriff, Änderung, Offenlegung oder Zerstörung.',
        section5Title: '5. Ihre Rechte',
        section5Content: 'Sie haben das Recht, auf Ihre persönlichen Informationen zuzugreifen, sie zu korrigieren oder zu löschen. Sie können auch bestimmten Verarbeitungen Ihrer Daten widersprechen.',
        section6Title: '6. Cookies',
        section6Content: 'Wir verwenden Cookies und ähnliche Tracking-Technologien, um Ihre Erfahrung auf unserer Plattform zu verbessern. Sie können Cookies über Ihre Browsereinstellungen steuern.',
        section7Title: '7. Kontaktieren Sie uns',
        section7Content: 'Wenn Sie Fragen zu dieser Datenschutzrichtlinie haben, kontaktieren Sie uns bitte unter privacy@altus-group.com',
      },
    },
    individualLoans: {
      title: 'Kredite für Privatpersonen',
      subtitle: 'Finanzierungslösungen für alle Ihre Lebensprojekte',
      personalLoan: 'Privatkredit',
      personalLoanDesc: 'Flexible Finanzierung für alle Ihre Projekte ohne Verwendungsnachweis: Reise, Hochzeit, Ausrüstungskauf. Von €1.000 bis €75.000 von 12 bis 84 Monaten. APR-Zinssatz von 2,9% bis 7,9% je nach Profil. Antwort in 48h, Mittel in 5 Tagen.',
      mortgageLoan: 'Hypothekenkredit',
      mortgageLoanDesc: 'Finanzieren Sie Ihren Hauptwohnsitz, Zweitwohnsitz oder Mietinvestition. Von €50.000 bis €500.000 von 10 bis 25 Jahren. Feste oder variable Zinssätze ab 1,5% APR. Bis zu 110% Eigenkapital einschließlich Notarkosten. Kostenlose personalisierte Simulation.',
      autoLoan: 'Auto-/Motorradkredit',
      autoLoanDesc: 'Finanzieren Sie Ihr neues oder gebrauchtes Fahrzeug, Auto oder Motorrad. Von €3.000 bis €75.000 von 12 bis 84 Monaten. APR-Zinssatz von 1,9% bis 5,9%. Möglichkeit, Versicherung und Zubehör einzuschließen. Sofortige Antwort bei Ihrem Partnerhändler.',
      studentLoan: 'Studentenkredit',
      studentLoanDesc: 'Finanzieren Sie Ihr Hochschulstudium, Studiengebühren, Studentenwohnung. Von €1.000 bis €50.000. Vollständige Zahlungsaussetzung bis zum Ende des Studiums. Vorzugszinssätze ab 1,5% APR. Ohne elterliche Bürgschaft unter Bedingungen.',
      greenLoan: 'Grüner Kredit / Öko-PTZ',
      greenLoanDesc: 'Finanzieren Sie energetische Renovierungsarbeiten: Isolierung, Wärmepumpe, Solarpaneele. Von €7.000 bis €50.000. Ermäßigte Zinssätze ab 0,5% APR. Berechtigt für staatliche Beihilfen. Bis zu €30.000 ohne Eigenkapital.',
      renovationLoan: 'Renovierungskredit',
      renovationLoanDesc: 'Renovieren, erweitern, verschönern Sie Ihr Zuhause. Von €1.500 bis €75.000 von 12 bis 120 Monaten. APR-Zinssatz von 2,5% bis 6,9%. Ohne Hypothekengarantie bis €50.000. Schrittweise Auszahlung je nach Baufortschritt möglich.',
      amount: 'Betrag',
      rate: 'APR-Zinssatz',
      duration: 'Laufzeit',
      rateDisclaimer: 'Indikative Zinssätze vorbehaltlich Zulassungsbedingungen. Fester APR. Ein Kredit verpflichtet Sie und muss zurückgezahlt werden. Überprüfen Sie Ihre Rückzahlungsfähigkeit, bevor Sie sich verpflichten.',
      compareLoans: 'Alle Kredite vergleichen',
    },
    features: {
      title: 'Warum Altus Group wählen?',
      subtitle: 'Eine moderne und transparente Kreditplattform, die Ihre Bedürfnisse in den Mittelpunkt stellt',
      security: 'Bank-Sicherheit auf Unternehmensniveau',
      securityDesc: 'AES-256-Verschlüsselung, DSGVO-Konformität, SOC 2 Type II und ISO 27001-Zertifizierung. Ihre Finanzdaten sind mit denselben Standards geschützt wie bei großen Banken. Multi-Faktor-Authentifizierung und 24/7-Überwachung gegen Betrug.',
      fast: 'Ultra-schnelle Antwort 24-48h',
      fastDesc: 'Unsere KI-Technologie analysiert Ihre Akte in Echtzeit. Genehmigungsantwort in 15 Sekunden bis maximal 48h. Mittel in 2-5 Tagen überwiesen. 100% digitale Oberfläche, kein Papierkram, elektronische Unterschrift. Sparen Sie Zeit bei Ihrem Projekt.',
      competitive: 'Unter den niedrigsten Zinssätzen auf dem Markt',
      competitiveDesc: 'Dank unserem Netzwerk von 50+ Finanzpartnern und unserer optimierten Bewertungstechnologie verhandeln wir die besten Zinssätze für Sie: von 1,5% bis 9,0% je nach Profil. Automatischer Vergleich, um Ihnen das beste Angebot zu garantieren.',
      flexible: 'Maximale Flexibilität ohne Strafe',
      flexibleDesc: 'Kostenlose vorzeitige Rückzahlung jederzeit. Mögliche Modulation der Raten je nach Ihrer Situation. Aussetzung der Raten bei Schwierigkeiten. Wahl des Abbuchungsdatums. Behalten Sie die vollständige Kontrolle über Ihren Kredit.',
    },
    stats: {
      clients: 'Zufriedene Kunden',
      funded: 'Gewährte Kredite',
      satisfaction: 'Zufriedenheitsrate',
      years: 'Jahre Erfahrung',
    },
    testimonials: {
      title: 'Was unsere Kunden sagen',
      subtitle: 'Über 15.000 Privatpersonen und Unternehmen vertrauen uns',
      reviews: [
        { name: 'Hans Müller', role: 'Unternehmer', company: 'Restaurant Berlin', text: 'Altus Group ermöglichte mir eine schnelle Finanzierung für die Entwicklung meines Geschäfts. Der Prozess war einfach und transparent.', rating: 5 },
        { name: 'Anna Schmidt', role: 'Architektin', company: 'Kreativstudio', text: 'Ausgezeichneter Service für meine Hypothek. Die Berater fanden den besten Zinssatz für mich.', rating: 5 },
        { name: 'Michael Weber', role: 'Ingenieur', company: 'Tech Solutions', text: 'Dank Altus Group haben wir neue Ausrüstung finanziert. Die Rückzahlungsflexibilität war perfekt.', rating: 5 },
        { name: 'Sarah Fischer', role: 'Händlerin', company: 'Mode Boutique', text: '100% digitaler und schneller Prozess. Ich erhielt meinen Geschäftskredit in 3 Tagen.', rating: 5 },
        { name: 'Thomas Becker', role: 'Student', company: 'Universität', text: 'Der Studentenkredit mit Zahlungsaufschub ermöglichte mir, mein Studium stressfrei zu finanzieren.', rating: 5 },
      ],
    },
  },
  nl: {
    hero: {
      title: 'Realiseer uw projecten met Altus Group',
      subtitle: 'Financieringsoplossingen voor particulieren en professionals - Concurrerende tarieven en transparant proces',
      cta1: 'Lening aanvragen',
      cta2: 'Mijn ruimte',
      trustIndicator: 'Meer dan 15.000 tevreden klanten vertrouwen ons',
      slides: [
        {
          title: 'Realiseer uw projecten met Altus Group',
          subtitle: 'Financieringsoplossingen voor particulieren en professionals - Concurrerende tarieven en transparant proces',
        },
        {
          title: 'Financiële Oplossingen op Maat',
          subtitle: 'Persoonlijke begeleiding om al uw professionele en persoonlijke projecten te realiseren',
        },
        {
          title: 'Uw Vertrouwde Partner',
          subtitle: 'Meer dan 15.000 tevreden klanten vertrouwen ons voor hun financieringsbehoeften',
        },
        {
          title: 'Financier uw Ambities',
          subtitle: 'Voordelige tarieven en een eenvoudig proces om uw projecten tot leven te brengen',
        },
        {
          title: 'Expertise en Begeleiding',
          subtitle: 'Een toegewijd team om u bij elke stap van uw project te begeleiden',
        },
      ],
    },
    nav: {
      home: 'Home',
      products: 'Onze Leningen',
      howItWorks: 'Hoe werkt het',
      resources: 'Bronnen',
      about: 'Over ons',
      contact: 'Contact',
      dashboard: 'Dashboard',
      loans: 'Leningen',
      transfers: 'Overboekingen',
      history: 'Geschiedenis',
      settings: 'Instellingen',
      logout: 'Afmelden',
    },
    dashboard: {
      welcome: 'Welkom',
      currentBalance: 'Huidig saldo',
      activeLoans: 'Actieve leningen',
      totalBorrowed: 'Totaal geleend',
      availableCredit: 'Beschikbaar krediet',
      lastUpdated: 'Laatst bijgewerkt',
      borrowingCapacity: 'Leencapaciteit',
      canBorrowUpTo: 'U kunt lenen tot',
      quickActions: 'Snelle acties',
      newLoan: 'Nieuwe lening',
      transferFunds: 'Geld overmaken',
      transactionHistory: 'Transactiegeschiedenis',
      fees: 'Kosten',
      pendingTransfers: 'Uitstaande overboekingen',
      availableFunds: 'Beschikbare middelen',
      upcomingRepayments: 'Aankomende terugbetalingen',
    },
    loan: {
      amount: 'Bedrag',
      interestRate: 'Rentepercentage',
      nextPayment: 'Volgende betaling',
      viewAll: 'Alles bekijken',
    },
    transfer: {
      requestSubmitted: 'Aanvraag ingediend',
      documentVerification: 'Documentenverificatie',
      complianceCheck: 'Compliance controle',
      approvalPending: 'Goedkeuring in behandeling',
      transferComplete: 'Overboeking voltooid',
      pending: 'In behandeling',
      inProgress: 'Bezig',
      approved: 'Goedgekeurd',
      rejected: 'Afgewezen',
    },
    fee: {
      type: 'Kostentype',
      reason: 'Reden',
      amount: 'Bedrag',
      date: 'Datum',
      downloadStatement: 'Overzicht downloaden',
      loanFees: 'Leningkosten',
      transferFees: 'Overboekingskosten',
      accountFees: 'Rekeningkosten',
    },
    common: {
      loading: 'Laden...',
      error: 'Fout',
      success: 'Succes',
    },
    about: {
      title: 'Over Altus Group',
      subtitle: 'Uw vertrouwde partner voor financiering van particulieren en bedrijven',
      mission: 'Onze Missie',
      missionText: 'Bij Altus Group democratiseren we de toegang tot financiering voor iedereen. Of u nu een particulier bent met een persoonlijk project of een groeiend bedrijf, wij bieden moderne, transparante kredietoplossingen die zijn afgestemd op uw behoeften. Onze geavanceerde technologie stelt ons in staat uw situatie snel te analyseren en gepersonaliseerde aanbiedingen met concurrerende tarieven aan te bieden. Wij geloven in totale transparantie: geen verborgen kosten, duidelijke voorwaarden en ondersteuning bij elke stap.',
      stats: {
        clients: 'Actieve klanten',
        loansProvided: 'Verstrekte leningen',
        successRate: 'Tevredenheidspercentage',
        yearsExperience: 'Jaar ervaring',
      },
    },
    howItWorks: {
      title: 'Hoe werkt het',
      subtitle: 'Een 100% digitaal proces in 4 eenvoudige stappen',
      step1Title: 'Online aanvraag - 4 minuten',
      step1Desc: 'Vul ons beveiligd formulier in met uw persoonlijke of zakelijke informatie. Geen reizen nodig, alles wordt online gedaan met directe identiteitsverificatie (KYC) en vereenvoudigde documentupload.',
      step2Title: 'Geautomatiseerde analyse - 24-48u',
      step2Desc: 'Onze kredietbeoordelingstechnologie analyseert uw financiële profiel, inkomsten en geschiedenis. Dankzij onze geavanceerde algoritmen en integratie met kredietbureaus geven we u binnen maximaal 48 uur een goedkeuringsantwoord.',
      step3Title: 'Transparant gepersonaliseerd aanbod',
      step3Desc: 'Ontvang uw leningaanbod met alle informatie: bedrag, APR-tarief, maandelijkse betalingen, looptijd, totale kredietkosten. Geen verborgen kosten, duidelijke voorwaarden en de mogelijkheid om verschillende scenario\'s te simuleren voordat u accepteert.',
      step4Title: 'Snelle uitbetaling - 2 tot 5 dagen',
      step4Desc: 'Elektronische ondertekening van uw contract en automatische overboeking van de middelen naar uw bankrekening. Voor bedrijfsleningen is de opzet van een gepersonaliseerd betalingsschema mogelijk dat is aangepast aan uw cashflow.',
    },
    products: {
      title: 'Onze Leningoplossingen',
      subtitle: 'Producten afgestemd op uw behoeften - Particulieren en Bedrijven',
      businessTitle: 'Zakelijke Leningen',
      businessSubtitle: 'Producten afgestemd op uw zakelijke behoeften',
      termLoans: 'Professionele Lopende Leningen',
      termLoansDesc: 'Middellange en langetermijnfinanciering voor uw strategische investeringen: ontwikkeling, acquisitie, expansie. Van €10.000 tot €500.000 over 1 tot 7 jaar. Vaste tarieven van 3,5% tot 8,5% APR afhankelijk van profiel. Vervroegde terugbetaling zonder boete.',
      lineOfCredit: 'Revolving Kredietlijn',
      lineOfCreditDesc: 'Flexibel krediet om uw cashflow te beheren en onverwachte uitgaven op te vangen. Van €5.000 tot €100.000. Tarieven van 4,0% tot 9,0% APR. Betaal alleen rente over gebruikte bedragen. Automatische heraanvulling van beschikbaar kapitaal.',
      equipmentFinancing: 'Apparatuurfinanciering',
      equipmentFinancingDesc: 'Financier uw professionele apparatuur, bedrijfsvoertuigen, machines, gereedschap. Van €20.000 tot €300.000 over 2 tot 5 jaar. Tarieven van 3,9% tot 7,5% APR. De apparatuur kan als zekerheid dienen, waardoor leninggoedkeuring wordt vergemakkelijkt.',
      invoiceFactoring: 'Factoring / Cessie van Vorderingen',
      invoiceFactoringDesc: 'Verander uw klantfacturen in onmiddellijke liquiditeit om uw cashflow te verbeteren. Voorschot tot 90% van de factuurbe dragen binnen 24-48u. Kosten van 1% tot 3% afhankelijk van volume en vertraging. Ideaal voor B2B-bedrijven.',
    },
    contact: {
      title: 'Neem contact op',
      subtitle: 'Ons team staat tot uw beschikking',
      name: 'Volledige naam',
      email: 'E-mail',
      phone: 'Telefoon',
      message: 'Bericht',
      send: 'Verzenden',
      success: 'Bericht succesvol verzonden',
      error: 'Fout bij het verzenden van bericht',
    },
    resources: {
      title: 'Bronnen',
      subtitle: 'Alle informatie om u bij uw project te begeleiden',
      faqTitle: 'Veelgestelde Vragen',
      faqs: [
        {
          question: 'Welke documenten zijn nodig voor een leningaanvraag?',
          answer: 'Voor particulieren: identiteitsbewijs, adresbewijs, recente loonstroken (3 maanden), belastingaangifte. Voor bedrijven: handelsregisteruittreksel (<3 maanden), balansen en resultatenrekeningen (laatste 2 jaar), zakelijke bankrekeninguittreksels (3-6 maanden), identiteitsbewijs van de directeur. Alle documenten kunnen veilig direct online worden geüpload.',
        },
        {
          question: 'Hoe lang duurt het goedkeuringsproces?',
          answer: 'Onze geautomatiseerde beoordelingstechnologie geeft u in 15 seconden tot maximaal 48 uur een goedkeuringsantwoord. Zodra uw volledige dossier is gevalideerd, worden de middelen binnen 2 tot 5 werkdagen overgemaakt. Voor grotere bedragen (>€100.000) rekent u op 5 tot 7 dagen voor een grondige analyse.',
        },
        {
          question: 'Wat is het minimale en maximale bedrag dat ik kan lenen?',
          answer: 'Persoonlijke leningen: van €1.000 tot €75.000. Hypothecaire leningen: van €50.000 tot €500.000. Zakelijke lopen de leningen: van €10.000 tot €500.000. Kredietlijnen: van €5.000 tot €100.000. Het exacte bedrag hangt af van uw terugbetalingscapaciteit berekend op basis van inkomsten, lasten en kredietgeschiedenis.',
        },
        {
          question: 'Kan ik mijn lening vervroegd terugbetalen?',
          answer: 'Ja, al onze leningen staan vervroegde terugbetaling zonder boete of verborgen kosten toe. U kunt uw krediet op elk moment gedeeltelijk of volledig terugbetalen via uw klantengebied. Dit vermindert automatisch de totale rentekosten. U behoudt zo de volledige controle over uw krediet.',
        },
        {
          question: 'Wat zijn de geschiktheidscriteria voor een lening?',
          answer: 'Particulieren: meerderjarig zijn, woonachtig in Frankrijk, regelmatig inkomen hebben en schuldquote <40%. Bedrijven: sinds 6+ maanden actief, minimale maandelijkse omzet van €15.000, geen recente betalingsachterstanden. De kredietwaardigheid wordt automatisch geverifieerd via kredietbureaus. De dossiers worden per geval bestudeerd.',
        },
        {
          question: 'Hoe worden de rentetarieven berekend?',
          answer: 'Onze tarieven worden berekend door een algoritme dat verschillende factoren analyseert: uw kredietwaardigheid, leningduur, geleend bedrag, uw inkomsten en lasten, terugbetalingsgeschiedenis en financiële gezondheid (voor bedrijven). De tarieven variëren van 3,5% tot 9,0% APR afhankelijk van het profiel. Onze tarieven behoren tot de meest concurrerende op de markt dankzij ons netwerk van financiële partners.',
        },
        {
          question: 'Zijn er dossierkosten of verborgen kosten?',
          answer: 'Totale transparantie: we tonen alle kosten vanaf de simulatie. Dossierkosten: €0 tot €150 afhankelijk van het type lening. Geen kosten voor vervroegde terugbetaling. Geen maandelijkse beheerkosten. Het JKP (Jaarlijks Kostenpercentage) omvat alle kosten voor een gemakkelijke vergelijking met andere aanbiedingen.',
        },
        {
          question: 'Hoe bereken ik mijn leencapaciteit?',
          answer: 'Uw leencapaciteit hangt af van uw schuldquote die niet meer dan 40% van uw netto-inkomen mag bedragen. Formule: (Maandelijks inkomen × 0,40) - Bestaande kredietlasten = Maximale beschikbare maandelijkse betaling. Onze online simulator berekent automatisch uw leencapaciteit en stelt aangepaste bedragen voor. U kunt de looptijd aanpassen om de betalingen te moduleren.',
        },
        {
          question: 'Kan ik een lening krijgen met een lage kredietwaardigheid?',
          answer: 'Ja, we accepteren verschillende profielen. Onze beoordelingstechnologie analyseert ook alternatieve gegevens naast de eenvoudige kredietwaardigheid: beroepsstabiliteit, terugkerend inkomen, besparingen, bankgeschiedenis. Scores worden geaccepteerd vanaf 500-560 voor bepaalde producten. Zelfs met een onvolmaakte geschiedenis kunt u een lening krijgen, maar de tarieven worden aangepast aan het risico.',
        },
        {
          question: 'Wat gebeurt er als ik een maandelijkse betaling niet kan doen?',
          answer: 'Neem onmiddellijk contact op. Wij bieden verschillende oplossingen: uitstel van betaling (tijdelijke betalingsvrijstelling), verlaging van termijnen, herfinanciering van de lening. Vertragingsboetes kunnen van toepassing zijn, maar we geven altijd de voorkeur aan dialoog om een oplossing te vinden die is aangepast aan uw situatie. Gepersonaliseerde ondersteuning is beschikbaar bij moeilijkheden.',
        },
      ],
    },
    legal: {
      termsTitle: 'Gebruiksvoorwaarden',
      privacyTitle: 'Privacybeleid',
      lastUpdated: 'Laatst bijgewerkt: Januari 2025',
      terms: {
        section1Title: '1. Aanvaarding van de Voorwaarden',
        section1Content: 'Door toegang te krijgen tot en gebruik te maken van de diensten van Altus Group, accepteert u en gaat u akkoord gebonden te zijn aan de voorwaarden en bepalingen van deze overeenkomst.',
        section2Title: '2. Gebruikslicentie',
        section2Content: 'Toestemming wordt verleend om tijdelijk toegang te krijgen tot de materialen (informatie of software) op het Altus Group-platform alleen voor persoonlijke, niet-commerciële tijdelijke weergave.',
        section3Title: '3. Leningovereenkomst',
        section3Content: 'Alle leningen zijn onderworpen aan kredietgoedkeuring. De voorwaarden worden verstrekt in een afzonderlijke leningovereenkomst bij goedkeuring van uw aanvraag.',
        section4Title: '4. Verklaringen en Garanties',
        section4Content: 'U verklaart en garandeert dat alle informatie die in uw leningaanvraag is verstrekt nauwkeurig, volledig en actueel is.',
        section5Title: '5. Beperking van Aansprakelijkheid',
        section5Content: 'In geen geval zijn Altus Group of zijn leveranciers aansprakelijk voor schade die voortvloeit uit het gebruik of het onvermogen om de materialen op het Altus Group-platform te gebruiken.',
        section6Title: '6. Wijzigingen',
        section6Content: 'Altus Group kan deze gebruiksvoorwaarden op elk moment zonder voorafgaande kennisgeving herzien. Door dit platform te gebruiken, gaat u akkoord gebonden te zijn aan de huidige versie van deze voorwaarden.',
      },
      privacy: {
        section1Title: '1. Informatie die We Verzamelen',
        section1Content: 'We verzamelen informatie die u ons rechtstreeks verstrekt wanneer u een account aanmaakt, een lening aanvraagt of met ons communiceert. Dit kan uw naam, e-mailadres, telefoonnummer, zakelijke informatie en financiële gegevens omvatten.',
        section2Title: '2. Hoe We Uw Informatie Gebruiken',
        section2Content: 'We gebruiken de informatie die we verzamelen om:',
        section2List: [
          'Uw leningaanvragen te verwerken',
          'Met u te communiceren over onze diensten',
          'Ons platform en diensten te verbeteren',
          'Te voldoen aan wettelijke en regelgevende vereisten',
        ],
        section3Title: '3. Informatie Delen',
        section3Content: 'We verkopen uw persoonlijke informatie niet. We kunnen uw informatie delen met:',
        section3List: [
          'Kredietbureaus voor kredietbeoordeling',
          'Dienstverleners die ons helpen bij onze activiteiten',
          'Toezichthouders en wetshandhavingsinstanties wanneer wettelijk vereist',
        ],
        section4Title: '4. Gegevensbeveiliging',
        section4Content: 'We implementeren passende technische en organisatorische maatregelen om uw persoonlijke informatie te beschermen tegen ongeautoriseerde toegang, wijziging, openbaarmaking of vernietiging.',
        section5Title: '5. Uw Rechten',
        section5Content: 'U heeft het recht om toegang te krijgen tot, uw persoonlijke informatie te corrigeren of te verwijderen. U kunt ook bezwaar maken tegen bepaalde verwerkingen van uw gegevens.',
        section6Title: '6. Cookies',
        section6Content: 'We gebruiken cookies en vergelijkbare trackingtechnologieën om uw ervaring op ons platform te verbeteren. U kunt cookies beheren via uw browserinstellingen.',
        section7Title: '7. Neem Contact Op',
        section7Content: 'Als u vragen heeft over dit privacybeleid, neem dan contact met ons op via privacy@altus-group.com',
      },
    },
    individualLoans: {
      title: 'Leningen voor Particulieren',
      subtitle: 'Financieringsoplossingen afgestemd op al uw levensprojecten',
      personalLoan: 'Persoonlijke Lening',
      personalLoanDesc: 'Flexibele financiering voor al uw projecten zonder gebruiksbewijs: reis, huwelijk, aankoop apparatuur. Van €1.000 tot €75.000 van 12 tot 84 maanden. APR-tarief van 2,9% tot 7,9% afhankelijk van profiel. Antwoord in 48u, middelen in 5 dagen.',
      mortgageLoan: 'Hypothecaire Lening',
      mortgageLoanDesc: 'Financier uw hoofdverblijf, tweede woning of huurinvestering. Van €50.000 tot €500.000 van 10 tot 25 jaar. Vaste of variabele tarieven vanaf 1,5% APR. Tot 110% eigen inbreng inclusief notariskosten. Gratis gepersonaliseerde simulatie.',
      autoLoan: 'Auto / Motor Krediet',
      autoLoanDesc: 'Financier uw nieuwe of gebruikte voertuig, auto of motor. Van €3.000 tot €75.000 van 12 tot 84 maanden. APR-tarief van 1,9% tot 5,9%. Mogelijkheid om verzekering en accessoires op te nemen. Onmiddellijk antwoord bij uw partnerdealer.',
      studentLoan: 'Studielening',
      studentLoanDesc: 'Financier uw hoger onderwijs, collegegeld, studentenhuisvesting. Van €1.000 tot €50.000. Volledige betalingsuitstel tot einde van de studie. Voorkeurtarieven vanaf 1,5% APR. Zonder ouderlijke borgstelling onder voorwaarden.',
      greenLoan: 'Groene Lening / Eco-PTZ',
      greenLoanDesc: 'Financier energierenovatiewerkzaamheden: isolatie, warmtepomp, zonnepanelen. Van €7.000 tot €50.000. Verlaagde tarieven vanaf 0,5% APR. In aanmerking voor staatssteun. Tot €30.000 zonder eigen inbreng.',
      renovationLoan: 'Renovatielening',
      renovationLoanDesc: 'Renoveer, vergroot, verfraai uw woning. Van €1.500 tot €75.000 van 12 tot 120 maanden. APR-tarief van 2,5% tot 6,9%. Zonder hypothecaire garantie tot €50.000. Geleidelijke uitbetaling volgens voortgang van werkzaamheden mogelijk.',
      amount: 'Bedrag',
      rate: 'APR-tarief',
      duration: 'Looptijd',
      rateDisclaimer: 'Indicatieve tarieven onder voorbehoud van geschiktheidsvoorwaarden. Vast APR. Een krediet verplicht u en moet worden terugbetaald. Controleer uw terugbetalingscapaciteit voordat u zich verbindt.',
      compareLoans: 'Alle leningen vergelijken',
    },
    features: {
      title: 'Waarom Kiezen voor Altus Group?',
      subtitle: 'Een modern en transparant leningplatform dat uw behoeften centraal stelt',
      security: 'Bankbeveiliging op Bedrijfsniveau',
      securityDesc: 'AES-256-versleuteling, GDPR-naleving, SOC 2 Type II en ISO 27001-certificering. Uw financiële gegevens zijn beschermd met dezelfde normen als grote banken. Multi-factor authenticatie en 24/7-monitoring tegen fraude.',
      fast: 'Ultra-snelle Reactie 24-48u',
      fastDesc: 'Onze AI-technologie analyseert uw dossier in realtime. Goedkeuringsantwoord in 15 seconden tot maximaal 48u. Middelen overgemaakt in 2-5 dagen. 100% digitale interface, geen papierwerk, elektronische handtekening. Bespaar tijd op uw project.',
      competitive: 'Onder de Laagste Tarieven op de Markt',
      competitiveDesc: 'Dankzij ons netwerk van 50+ financiële partners en onze geoptimaliseerde beoordelingstechnologie onderhandelen we de beste tarieven voor u: van 1,5% tot 9,0% afhankelijk van profiel. Automatische vergelijking om u de beste aanbieding te garanderen.',
      flexible: 'Maximale Flexibiliteit Zonder Boete',
      flexibleDesc: 'Gratis vervroegde terugbetaling op elk moment. Mogelijke modulatie van betalingen volgens uw situatie. Uitstel van betalingen bij moeilijkheden. Keuze van afschrijvingsdatum. Behoud volledige controle over uw krediet.',
    },
    stats: {
      clients: 'Tevreden Klanten',
      funded: 'Verstrekte Leningen',
      satisfaction: 'Tevredenheidspercentage',
      years: 'Jaar Ervaring',
    },
    testimonials: {
      title: 'Wat onze klanten zeggen',
      subtitle: 'Meer dan 15.000 particulieren en bedrijven vertrouwen ons',
      reviews: [
        { name: 'Jan de Vries', role: 'Ondernemer', company: 'Restaurant Amsterdam', text: 'Altus Group stelde me in staat om snel financiering te krijgen voor de ontwikkeling van mijn bedrijf. Het proces was eenvoudig en transparant.', rating: 5 },
        { name: 'Sophie Jansen', role: 'Architect', company: 'Creatieve Studio', text: 'Uitstekende service voor mijn hypotheek. De adviseurs vonden het beste tarief voor mij.', rating: 5 },
        { name: 'Peter van Dam', role: 'Ingenieur', company: 'Tech Solutions', text: 'Dankzij Altus Group hebben we nieuwe apparatuur gefinancierd. De terugbetalingsflexibiliteit was perfect.', rating: 5 },
        { name: 'Emma Bakker', role: 'Handelaar', company: 'Mode Boetiek', text: '100% digitaal en snel proces. Ik kreeg mijn zakelijke lening in 3 dagen.', rating: 5 },
        { name: 'Lucas Visser', role: 'Student', company: 'Universiteit', text: 'De studentenlening met uitgestelde betaling stelde me in staat mijn studie zonder stress te financieren.', rating: 5 },
      ],
    },
  },
};

export const useTranslations = () => {
  const { language } = useLanguage();
  return translations[language];
};
