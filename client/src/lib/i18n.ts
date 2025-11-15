import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'fr' | 'en' | 'es' | 'pt' | 'it' | 'de' | 'nl';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  isAutoDetected: boolean;
  setAutoDetected: (value: boolean) => void;
}

function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'fr';
  }
  
  const browserLang = navigator.language.toLowerCase();
  
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('pt')) return 'pt';
  if (browserLang.startsWith('it')) return 'it';
  if (browserLang.startsWith('de')) return 'de';
  if (browserLang.startsWith('nl')) return 'nl';
  
  return 'en';
}

function getInitialLanguage(): Language {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return 'fr';
  }
  
  const stored = localStorage.getItem('language-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.state?.language) {
        return parsed.state.language;
      }
    } catch (e) {
      console.error('Failed to parse stored language:', e);
    }
  }
  return detectBrowserLanguage();
}

// Detect language based on IP geolocation
export async function detectLanguageFromIP(): Promise<Language | null> {
  try {
    const response = await fetch('/api/detect-language');
    const data = await response.json();
    
    if (data.language && ['fr', 'en', 'es', 'pt', 'it', 'de', 'nl'].includes(data.language)) {
      console.log(`🌍 Language detected from IP: ${data.language} (${data.country || 'Unknown'})`);
      return data.language as Language;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to detect language from IP:', error);
    return null;
  }
}

export const useLanguage = create<LanguageStore>()(
  persist(
    (set) => ({
      language: getInitialLanguage(),
      isAutoDetected: false,
      setLanguage: (language) => set({ language, isAutoDetected: false }),
      setAutoDetected: (value) => set({ isAutoDetected: value }),
    }),
    {
      name: 'language-storage',
    }
  )
);

// Auto-detect language on app initialization
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('language-storage');
  let hasStoredLanguage = false;
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      hasStoredLanguage = !!parsed.state?.language;
    } catch (e) {
      // Ignore
    }
  }
  
  // Only auto-detect if user hasn't manually selected a language
  if (!hasStoredLanguage) {
    detectLanguageFromIP().then((detectedLang) => {
      if (detectedLang) {
        useLanguage.setState({ 
          language: detectedLang, 
          isAutoDetected: true 
        });
      }
    });
  }
}

type TranslationKeys = {
  hero: {
    title: string;
    subtitle: string;
    cta1: string;
    cta2: string;
    learnMore: string;
    trustIndicator: string;
    trustBadges: {
      response24h: string;
      swissSecurity: string;
      fastApproval: string;
    };
    calculator: {
      title: string;
      subtitle: string;
      loanAmount: string;
      duration: string;
      monthlyPayment: string;
      perMonth: string;
      applyNow: string;
      disclaimer: string;
    };
    slides: Array<{
      title: string;
      subtitle: string;
    }>;
  };
  nav: {
    home: string;
    products: string;
    tagline: string;
    more: string;
    moreInfo: string;
    language: string;
    loansMenu: {
      label: string;
      items: Array<{
        title: string;
        description: string;
        href: string;
      }>;
    };
    howItWorks: string;
    resources: string;
    faq: string;
    about: string;
    contact: string;
    phone: string;
    dashboard: string;
    loans: string;
    myLoans: string;
    newLoan: string;
    contracts: string;
    loansSection: string;
    transfers: string;
    history: string;
    settings: string;
    logout: string;
    users: string;
    documents: string;
    reports: string;
  };
  contracts: {
    title: string;
    description: string;
    loanNumber: string;
    approvedOn: string;
    actionRequired: string;
    step1: string;
    step1Description: string;
    step2: string;
    step2Description: string;
    downloadContract: string;
    tabPending: string;
    tabReview: string;
    tabCompleted: string;
    inReview: string;
    signed: string;
    noPendingContracts: string;
    noPendingContractsDescription: string;
    noReviewContracts: string;
    noReviewContractsDescription: string;
    noCompletedContracts: string;
    noCompletedContractsDescription: string;
    reviewMessage: string;
    signedSuccess: string;
    downloadOriginal: string;
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
    yourGlobalBalance: string;
    noActiveLoans: string;
    noTransfers: string;
    dataLoadError: string;
    available: string;
    notifications: string;
    noNotifications: string;
    viewDetails: string;
    availableOffers: string;
    contractToSign: string;
    moreTransfers: string;
    goodMorning: string;
    goodAfternoon: string;
    goodEvening: string;
    totalBalance: string;
    newTransfer: string;
    requestLoan: string;
    manageAccounts: string;
    cashflow: string;
    incomeExpensesSixMonths: string;
    income: string;
    expenses: string;
    creditUtilization: string;
    used: string;
    recentActivity: string;
    latestTransactions: string;
    viewAll: string;
    noRecentTransactions: string;
    yourActiveLoans: string;
    yourActiveLoansDescription: string;
    activeLoan: string;
    pendingRequests: string;
    pendingRequestsDescription: string;
    pendingLoan: string;
    repaid: string;
    upcomingDueDates: string;
    amount: string;
    monthJan: string;
    monthFeb: string;
    monthMar: string;
    monthApr: string;
    monthMay: string;
    monthJun: string;
  };
  loan: {
    pageTitle: string;
    pageDescription: string;
    tabMyLoans: string;
    tabCalculator: string;
    amount: string;
    interestRate: string;
    nextPayment: string;
    viewAll: string;
    status: string;
    downloadContract: string;
    uploadSignedContract: string;
    downloading: string;
    uploading: string;
    loanNumber: string;
    requestSubmitted: string;
    requestSubmittedDesc: string;
    requestError: string;
    loanApproved: string;
    approvalInstructions: string;
    approvalStep1: string;
    approvalStep2: string;
    approvalStep3: string;
    downloadContractButton: string;
    uploadContractButton: string;
    uploading2: string;
  };
  transfer: {
    pageTitle: string;
    pageDescription: string;
    searchPlaceholder: string;
    allStatuses: string;
    filterTitle: string;
    filterDescription: string;
    noTransfersFound: string;
    noTransfersMessage: string;
    createTransfer: string;
    newTransfer: string;
    requestSubmitted: string;
    documentVerification: string;
    complianceCheck: string;
    approvalPending: string;
    transferComplete: string;
    pending: string;
    inProgress: string;
    approved: string;
    rejected: string;
    completed: string;
    suspended: string;
    noAccount: string;
    validation: string;
    validating: string;
    onHold: string;
    processing: string;
    processingComplete: string;
  };
  history: {
    pageTitle: string;
    pageDescription: string;
    totalCredits: string;
    totalDebits: string;
    totalTransactions: string;
    filterTitle: string;
    filterDescription: string;
    searchPlaceholder: string;
    filterType: string;
    allTypes: string;
    typeCredit: string;
    typeDebit: string;
    typeFee: string;
    noTransactionsFound: string;
    noTransactionsFoundFiltered: string;
    noTransactionsYet: string;
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
    feesToPay: string;
    unpaidFeesCount: string;
    unpaidFeesSingular: string;
    pendingValidation: string;
    autoValidatedViaCode: string;
    totalUnpaid: string;
    totalOverall: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    active: string;
    pending: string;
    completed: string;
    suspended: string;
    saving: string;
    cancel: string;
    save: string;
    close: string;
    noData: string;
    months: string;
    years: string;
  };
  settings: {
    title: string;
    profile: string;
    notifications: string;
    security: string;
    appearance: string;
    personalInfo: string;
    updateInfo: string;
    fullName: string;
    email: string;
    phone: string;
    company: string;
    saveChanges: string;
    accountType: string;
    yourAccountType: string;
    individualAccount: string;
    businessAccount: string;
    individualAccess: string;
    businessAccess: string;
    verified: string;
    notificationPreferences: string;
    chooseNotifications: string;
    emailAlerts: string;
    emailAlertsDesc: string;
    transferUpdates: string;
    transferUpdatesDesc: string;
    loanReminders: string;
    loanRemindersDesc: string;
    marketingEmails: string;
    marketingEmailsDesc: string;
    savePreferences: string;
    changePassword: string;
    updatePassword: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    themeSettings: string;
    chooseTheme: string;
    lightMode: string;
    darkMode: string;
    systemMode: string;
    languageSettings: string;
    chooseLanguage: string;
    changePhoto: string;
    uploading: string;
    twoFactorAuth: string;
    twoFactorAuthDesc: string;
    twoFactorEnabled: string;
    enable2FA: string;
    twoFactorEnabledDesc: string;
    twoFactorDisabledDesc: string;
    disable: string;
    configure: string;
    enabled: string;
    twoFactorActiveMessage: string;
    theme: string;
    themeDesc: string;
    light: string;
    dark: string;
    languageLabel: string;
    languageDesc: string;
    disable2FASuccess: string;
    disable2FASuccessDesc: string;
    disable2FAError: string;
  };
  messages: {
    profileUpdated: string;
    profileUpdatedDesc: string;
    preferencesUpdated: string;
    preferencesUpdatedDesc: string;
    passwordChanged: string;
    passwordChangedDesc: string;
    passwordMismatch: string;
    errorUpdatingProfile: string;
    errorUpdatingPreferences: string;
    errorChangingPassword: string;
    avatarUpdated: string;
    avatarUpdatedDesc: string;
    errorUploadingAvatar: string;
    invalidFileType: string;
    fileTooLarge: string;
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
    step1Duration: string;
    step2Title: string;
    step2Desc: string;
    step2Duration: string;
    step3Title: string;
    step3Desc: string;
    step3Duration: string;
    step4Title: string;
    step4Desc: string;
    step4Duration: string;
    averageTimePrefix: string;
    averageTimeValue: string;
    requiredDocumentsTitle: string;
    requiredDocumentsSubtitle: string;
    personalLoanTitle: string;
    businessLoanTitle: string;
    documents: {
      personal: string[];
      professional: string[];
    };
    tipTitle: string;
    tipMessage: string;
    tipContactCta: string;
    eligibilityTitle: string;
    eligibilitySubtitle: string;
    individualsTitle: string;
    professionalsTitle: string;
    requiredTag: string;
    eligibility: {
      personal: Array<{ label: string; required: boolean }>;
      professional: Array<{ label: string; required: boolean }>;
    };
    securityTitle: string;
    security: {
      dataProtectionTitle: string;
      dataProtectionItems: string[];
      guaranteesTitle: string;
      guaranteesItems: string[];
    };
    ctaTitle: string;
    ctaSubtitle: string;
    ctaRequestButton: string;
    ctaContactButton: string;
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
    miscellaneousCredit: string;
    miscellaneousCreditDesc: string;
    amount: string;
    rate: string;
    duration: string;
    rateDisclaimer: string;
    compareLoans: string;
  };
  businessLoans: {
    title: string;
    subtitle: string;
    businessLoan: string;
    businessLoanDesc: string;
    businessLoanFeatures: string[];
    cashFlowCredit: string;
    cashFlowCreditDesc: string;
    cashFlowCreditFeatures: string[];
    equipmentFinancing: string;
    equipmentFinancingDesc: string;
    equipmentFinancingFeatures: string[];
    commercialProperty: string;
    commercialPropertyDesc: string;
    commercialPropertyFeatures: string[];
    lineOfCredit: string;
    lineOfCreditDesc: string;
    lineOfCreditFeatures: string[];
    lineOfCreditDuration: string;
    vehicleFleet: string;
    vehicleFleetDesc: string;
    vehicleFleetFeatures: string[];
    smeLoan: string;
    smeLoanDesc: string;
    smeLoanFeatures: string[];
    amount: string;
    rate: string;
    duration: string;
    months: string;
    years: string;
    features: string;
    learnMore: string;
    advantagesTitle: string;
    advantages: string[];
    eligibilityTitle: string;
    eligibility: string[];
    rateDisclaimer: string;
    simulateLoan: string;
    contactAdvisor: string;
  };
  professionalFAQ: {
    title: string;
    subtitle: string;
    faqs: {
      question: string;
      answer: string;
    }[];
    notFoundTitle: string;
    notFoundDesc: string;
    contactUs: string;
    helpCenter: string;
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
  partners: {
    title: string;
    subtitle: string;
    banksNetwork: string;
    loansFunded: string;
    yearsExperience: string;
    satisfactionRate: string;
    networkTitle: string;
    benefits: string[];
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
  auth: {
    title: string;
    subtitle: string;
    loginTab: string;
    signupTab: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    phone: string;
    companyName: string;
    siret: string;
    accountType: string;
    personal: string;
    personalLoan: string;
    business: string;
    businessLoan: string;
    login: string;
    loggingIn: string;
    signup: string;
    signingUp: string;
    backToHome: string;
    loginSuccess: string;
    loginSuccessDesc: string;
    signupSuccess: string;
    signupSuccessDesc: string;
    loginError: string;
    loginErrorDesc: string;
    signupError: string;
    signupErrorDesc: string;
    emailNotVerified: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    fullNamePlaceholder: string;
    phonePlaceholder: string;
    companyNamePlaceholder: string;
    siretPlaceholder: string;
    required: string;
    companyRequired: string;
    emailInvalid: string;
    passwordMinLength: string;
    passwordUppercase: string;
    passwordLowercase: string;
    passwordNumber: string;
    passwordSpecial: string;
    passwordMatch: string;
    invalidOtp: string;
    sessionExpired: string;
    sessionExpiredMessage: string;
    accessDenied: string;
    authenticationRequired: string;
    verificationError: string;
    verificationInProgress: string;
    emailVerified: string;
    accountActiveAutoLogin: string;
    linkExpiredInvalid: string;
    tokenMissing: string;
    pleaseTwoFactorCode: string;
    verificationCodeSent: string;
    twoFactorAuth: string;
    enterOtpCode: string;
    otpExpiresIn: string;
    backToLogin: string;
  };
  errors: {
    sessionExpired: string;
    accessDenied: string;
    authRequired: string;
    networkError: string;
    unexpectedError: string;
    verificationFailed: string;
  };
  bankCard: {
    title: string;
    subtitle: string;
    learnMore: string;
    viewDetails: string;
    orderNow: string;
    orderCard: string;
    orderSuccess: string;
    orderSuccessDesc: string;
    modalTitle: string;
    modalSubtitle: string;
    advantagesTitle: string;
    advantages: {
      cashback: string;
      cashbackDesc: string;
      noFees: string;
      noFeesDesc: string;
      protection: string;
      protectionDesc: string;
      rewards: string;
      rewardsDesc: string;
      global: string;
      globalDesc: string;
      support: string;
      supportDesc: string;
      maxSecurity: string;
      maxSecurityDesc: string;
      instantActivation: string;
      instantActivationDesc: string;
      noFeesEuro: string;
      noFeesEuroDesc: string;
      globallyAccepted: string;
      globallyAcceptedDesc: string;
    };
    usageZonesTitle: string;
    usageZones: {
      worldwide: string;
      worldwideDesc: string;
      online: string;
      onlineDesc: string;
      stores: string;
      storesDesc: string;
      atm: string;
      atmDesc: string;
    };
    feesTitle: string;
    fees: {
      annualFee: string;
      annualFeeAmount: string;
      transactionFee: string;
      transactionFeeAmount: string;
      withdrawalFee: string;
      withdrawalFeeAmount: string;
      foreignFee: string;
      foreignFeeAmount: string;
    };
    specificationsTitle: string;
    specifications: {
      cardType: string;
      cardTypeValue: string;
      creditLimit: string;
      creditLimitValue: string;
      validity: string;
      validityValue: string;
      delivery: string;
      deliveryValue: string;
    };
    orderProcess: string;
    orderProcessDesc: string;
    termsConditions: string;
    close: string;
  };
  notifications: {
    loan_request: { title: string; message: string };
    loan_under_review: { title: string; message: string };
    loan_approved: { title: string; message: string };
    loan_rejected: { title: string; message: string };
    loan_contract_generated: { title: string; message: string };
    loan_contract_signed: { title: string; message: string };
    loan_disbursed: { title: string; message: string };
    transfer_initiated: { title: string; message: string };
    transfer_completed: { title: string; message: string };
    transfer_approved: { title: string; message: string };
    transfer_suspended: { title: string; message: string };
    code_issued: { title: string; message: string };
    kyc_approved: { title: string; message: string };
    kyc_rejected: { title: string; message: string };
    fee_added: { title: string; message: string };
    account_status_changed: { title: string; message: string };
    admin_message_sent: { title: string; message: string };
    general: { title: string; message: string };
    twoFactorSuggestion: { title: string; message: string };
    markAllRead: string;
    markAsRead: string;
    deleteNotification: string;
  };
  dialogs: {
    newLoan: {
      title: string;
      subtitle: string;
      subtitleFirstRequest: string;
      subtitleRegular: string;
      loanType: string;
      selectLoanType: string;
      amount: string;
      enterAmount: string;
      duration: string;
      selectDuration: string;
      months: string;
      estimatedRate: string;
      monthlyPayment: string;
      totalRepayment: string;
      firstRequestAlert: string;
      firstRequestAlertDesc: string;
      addBankAccount: string;
      selectAccount: string;
      bankName: string;
      bankNamePlaceholder: string;
      accountLabel: string;
      accountLabelPlaceholder: string;
      iban: string;
      ibanPlaceholder: string;
      bic: string;
      bicPlaceholder: string;
      uploadDocuments: string;
      kycDocumentsTab: string;
      additionalDocumentsTab: string;
      loanDetailsTab: string;
      identity: string;
      proof_of_address: string;
      income_proof: string;
      business_registration: string;
      financial_statements: string;
      tax_returns: string;
      requiredDocuments: string;
      identityDoc: string;
      addressProof: string;
      bankStatement: string;
      uploadingInProgress: string;
      documentsUploadedSuccess: string;
      submit: string;
      submitting: string;
      cancel: string;
      loanTypes: {
        personal: string;
        auto: string;
        mortgage: string;
        green: string;
        renovation: string;
        student: string;
        business: string;
        cashFlow: string;
        equipment: string;
        commercialProperty: string;
        lineOfCredit: string;
        vehicleFleet: string;
      };
      errors: {
        amountMustBePositive: string;
        amountMaxExceeded: string;
        rateMustBePositive: string;
        rateMaxExceeded: string;
        durationMustBePositive: string;
        durationMaxExceeded: string;
        documentsRequired: string;
      };
      success: {
        loanSubmitted: string;
        loanSubmittedDesc: string;
        documentsUploaded: string;
        documentsUploadedDesc: string;
      };
      error: {
        loanError: string;
        loanErrorDesc: string;
        partialUploadError: string;
        partialUploadErrorDesc: string;
      };
    };
    transfer: {
      title: string;
      subtitle: string;
      selectAccount: string;
      noAccountsAvailable: string;
      amount: string;
      enterAmount: string;
      amountPlaceholder: string;
      recipient: string;
      recipientPlaceholder: string;
      feesDescription: string;
      availableFunds: string;
      feesAndProcessing: string;
      submit: string;
      submitting: string;
      creating: string;
      createTransfer: string;
      cancel: string;
      transferSuccess: string;
      transferSuccessDesc: string;
      transferError: string;
      transferErrorDesc: string;
    };
    loanRequestModal: {
      title: string;
      description: string;
      loanType: string;
      selectLoanTypePlaceholder: string;
      loanAmount: string;
      duration: string;
      durationMonths: string;
      months: string;
      interestRate: string;
      estimatedMonthlyPayment: string;
      requiredDocuments: string;
      requiredDocumentsDescription: string;
      required: string;
      optional: string;
      attach: string;
      cancel: string;
      submit: string;
      validationError: string;
      requestSent: string;
      requestSentDescription: string;
      error: string;
      errorDescription: string;
      fileTooLarge: string;
      fileTooLargeDescription: string;
      missingDocuments: string;
      missingDocumentsPrefix: string;
    };
    cardTerms: {
      title: string;
      acceptTerms: string;
      declineTerms: string;
    };
    welcome: {
      title: string;
      description: string;
      accountTypeTitle: string;
      individualAccount: string;
      businessAccount: string;
      individualAccess: string;
      businessAccess: string;
      availableOffers: string;
      getStarted: string;
      dialog: {
        title: string;
        description: string;
      };
      account: {
        badgeLabel: string;
        individual: {
          description: string;
        };
        business: {
          description: string;
        };
      };
      offers: {
        title: string;
        individual: string[];
        business: string[];
      };
      important: {
        title: string;
        message: string;
        individualSwitch: string;
        businessSwitch: string;
      };
      cta: {
        primary: string;
        pending: string;
      };
    };
    transactionHistory: {
      title: string;
      type: string;
      amount: string;
      date: string;
      status: string;
      noTransactions: string;
      close: string;
    };
  };
  verify: {
    verifying: string;
    success: string;
    successMessage: string;
    goToDashboard: string;
    error: string;
    errorMessage: string;
    tryAgain: string;
    backToSignup: string;
    backToHome: string;
  };
  forgotPassword: {
    title: string;
    description: string;
    instructions: string;
    emailLabel: string;
    emailPlaceholder: string;
    sendResetLink: string;
    sending: string;
    backToLogin: string;
    emailSent: string;
    emailSentDesc: string;
    error: string;
    errorDesc: string;
  };
  resetPassword: {
    title: string;
    description: string;
    newPassword: string;
    newPasswordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
    requirements: string;
    minLength: string;
    uppercase: string;
    lowercase: string;
    number: string;
    specialChar: string;
    passwordStrength: string;
    weak: string;
    medium: string;
    strong: string;
    veryStrong: string;
    resetPassword: string;
    resetting: string;
    success: string;
    successMessage: string;
    error: string;
    invalidToken: string;
    passwordMismatch: string;
  };
  twoFactorAuth: {
    setup: {
      title: string;
      description: string;
      step1: string;
      step1Description: string;
      step2: string;
      step2Description: string;
      step3: string;
      step3Description: string;
      qrCodeInstructions: string;
      cantScanQR: string;
      secretKey: string;
      enterCode: string;
      codePlaceholder: string;
      verify: string;
      verifying: string;
      cancel: string;
      successTitle: string;
      successMessage: string;
      errorTitle: string;
      errorMessage: string;
    };
    disable: {
      title: string;
      description: string;
      enterPassword: string;
      passwordPlaceholder: string;
      disable: string;
      disabling: string;
      cancel: string;
      successTitle: string;
      successMessage: string;
      errorTitle: string;
      errorMessage: string;
    };
    login: {
      title: string;
      description: string;
      enterCode: string;
      codePlaceholder: string;
      verify: string;
      verifying: string;
      cancel: string;
      errorTitle: string;
      errorMessage: string;
    };
  };
  bankAccounts: {
    title: string;
    description: string;
    addAccount: string;
    noAccountsTitle: string;
    noAccountsDescription: string;
    accountLabel: string;
    bankName: string;
    iban: string;
    bic: string;
    createdAt: string;
    actions: string;
    delete: string;
    deleteConfirm: string;
    deleteSuccess: string;
    addAccountTitle: string;
    addAccountDescription: string;
    accountLabelLabel: string;
    accountLabelPlaceholder: string;
    accountLabelRequired: string;
    bankNameLabel: string;
    bankNamePlaceholder: string;
    bankNameRequired: string;
    ibanLabel: string;
    ibanPlaceholder: string;
    ibanRequired: string;
    invalidIban: string;
    bicLabel: string;
    bicPlaceholder: string;
    invalidBic: string;
    submit: string;
    submitting: string;
    cancel: string;
    addSuccess: string;
    addSuccessDesc: string;
    addError: string;
    addFirstAccount: string;
    deleteSuccessDesc: string;
    deleteError: string;
  };
  welcomeModal: {
    title: string;
    description: string;
    accountType: string;
    individualAccount: string;
    businessAccount: string;
    individualAccess: string;
    businessAccess: string;
    availableOffers: string;
    getStarted: string;
  };
  calculator: {
    title: string;
    description: string;
    loanAmount: string;
    interestRate: string;
    loanDuration: string;
    months: string;
    calculate: string;
    results: string;
    monthlyPayment: string;
    totalInterest: string;
    totalAmount: string;
    amortizationSchedule: string;
    month: string;
    payment: string;
    principal: string;
    interest: string;
    balance: string;
    downloadSchedule: string;
  };
  amortization: {
    interactiveTitle: string;
    interactiveDescription: string;
    calculatorTitle: string;
    calculatorDescription: string;
    selectActiveLoan: string;
    chooseLoan: string;
    loanOf: string;
    at: string;
    loanAmount: string;
    annualInterestRate: string;
    duration: string;
    years: string;
    calculateAmortization: string;
    calculatePlan: string;
    monthlyPayment: string;
    totalPayment: string;
    totalInterest: string;
    table: string;
    evolution: string;
    cumulative: string;
    breakdown: string;
    month: string;
    payment: string;
    principal: string;
    interest: string;
    balance: string;
    amount: string;
    monthLabel: string;
    noActiveLoans: string;
    noActiveLoansDesc: string;
    loanType: string;
    selectType: string;
    personal: string;
    business: string;
    realEstate: string;
    automaticallyCalculated: string;
    rateInfo: string;
    requestLoan: string;
    sending: string;
    chart: string;
    balanceEvolution: string;
    principalVsInterest: string;
    monthlyRepaymentPlan: string;
    remainingBalance: string;
    errors: {
      amountPositive: string;
      amountMax: string;
      rateNegative: string;
      rateMax: string;
      durationPositive: string;
      durationMax: string;
    };
  };
  kycDocuments: {
    title: string;
    description: string;
    uploadDocuments: string;
    documentType: string;
    selectDocumentType: string;
    identity: string;
    proof_of_address: string;
    income_proof: string;
    business_registration: string;
    financial_statements: string;
    tax_returns: string;
    chooseFile: string;
    upload: string;
    uploading: string;
    uploadSuccess: string;
    uploadSuccessDesc: string;
    uploadError: string;
    status: string;
    pending: string;
    approved: string;
    rejected: string;
    uploadedAt: string;
    noDocuments: string;
  };
  transferFlow: {
    backToDashboard: string;
    form: {
      title: string;
      subtitle: string;
      amountLabel: string;
      amountPlaceholder: string;
      amountHelper: string;
      accountLabel: string;
      accountPlaceholder: string;
      externalAccountLabel: string;
      selectAccountPlaceholder: string;
      noAccount: string;
      recipientLabel: string;
      recipientPlaceholder: string;
      initiateButton: string;
      initiating: string;
    };
    verification: {
      title: string;
      subtitle: string;
      doNotClose: string;
      doNotCloseDesc: string;
      progressLabel: string;
      verificationSteps: string;
      step1: string;
      step2: string;
      step3: string;
      step4: string;
    };
    validation: {
      title: string;
      subtitle: string;
      demoCodeLabel: string;
      codeLabel: string;
      codePlaceholder: string;
      codeHelpText: string;
      validateButton: string;
      validating: string;
      resendButton: string;
      historyLabel: string;
    };
    progress: {
      titlePaused: string;
      titleInProgress: string;
      securityVerificationTitle: string;
      transferProcessingTitle: string;
      toPrefix: string;
      securityVerificationRequired: string;
      enterVerificationCode: string;
      codeFromAdvisor: string;
      validationCodeLabel: string;
      enterCodePlaceholder: string;
      validating: string;
      validateAndContinue: string;
      processingTransfer: string;
      doNotCloseProcessing: string;
      amountLabel: string;
      progressLabel: string;
      pauseTitle: string;
      pauseDescription: string;
      pauseCodeLabel: string;
      pauseCodePlaceholder: string;
      validatePauseCode: string;
      statusLabel: string;
      statusCompleted: string;
      statusProcessing: string;
      eventsLabel: string;
      circularProgressTitle: string;
      circularProgressSubtitle: string;
    };
    complete: {
      title: string;
      subtitle: string;
      successMessage: string;
      referenceLabel: string;
      returnToDashboard: string;
      amountLabel: string;
      recipientLabel: string;
      feesLabel: string;
    };
    toast: {
      transferInProgress: string;
      transferAlreadyInProgress: string;
      transferInitiated: string;
      selectExternalAccount: string;
      noActiveLoan: string;
      initiated: string;
      initiatedDesc: string;
      error: string;
      errorInitiation: string;
      codeValidated: string;
      codeInvalid: string;
      codeInvalidDesc: string;
      codeSent: string;
      codeSentDesc: string;
      approved: string;
      approvedDesc: string;
      fieldsRequired: string;
      fieldsRequiredDesc: string;
      invalidCode: string;
      invalidCodeDesc: string;
      codeRequired: string;
      codeRequiredDesc: string;
      unblocked: string;
      unblockedDesc: string;
    };
  };
  loanOffers: {
    pageTitle: string;
    pageSubtitle: string;
    accountInfo: string;
    individualTab: string;
    businessTab: string;
    individual: string;
    business: string;
    amountLabel: string;
    rateLabel: string;
    durationLabel: string;
    advantagesLabel: string;
    requestButton: string;
    loginToRequest: string;
    types: {
      personalLoan: { title: string; description: string; features: string[] };
      mortgageLoan: { title: string; description: string; features: string[] };
      autoLoan: { title: string; description: string; features: string[] };
      studentLoan: { title: string; description: string; features: string[] };
      greenLoan: { title: string; description: string; features: string[] };
      renovationLoan: { title: string; description: string; features: string[] };
      businessLoan: { title: string; description: string; features: string[] };
      cashFlowCredit: { title: string; description: string; features: string[] };
      equipmentFinancing: { title: string; description: string; features: string[] };
      commercialPropertyLoan: { title: string; description: string; features: string[] };
      lineOfCredit: { title: string; description: string; features: string[] };
      vehicleFleetLoan: { title: string; description: string; features: string[] };
    };
  };
  cardTermsContent: {
    title: string;
    lastUpdated: string;
    section1: {
      title: string;
      content: string;
    };
    section2: {
      title: string;
      subtitle1: string;
      content1: string;
      subtitle2: string;
      item1: string;
      item2: string;
    };
    section3: {
      title: string;
      content: string;
      list: string[];
    };
    section4: {
      title: string;
      subtitle1: string;
      content1: string;
      subtitle2: string;
      list1: string[];
      subtitle3: string;
      list2: string[];
    };
    section5: {
      title: string;
      subtitle1: string;
      list1: string[];
      subtitle2: string;
      content2: string;
      subtitle3: string;
      content3: string;
    };
    section6: {
      title: string;
      content: string;
      list: string[];
      content2: string;
    };
    section7: {
      title: string;
      list: string[];
    };
    section8: {
      title: string;
      content: string;
    };
    section9: {
      title: string;
      subtitle1: string;
      content1: string;
      subtitle2: string;
      content2: string;
      subtitle3: string;
      content3: string;
    };
    section10: {
      title: string;
      content: string;
      list: string[];
      content2: string;
    };
    section11: {
      title: string;
      content: string;
    };
    section12: {
      title: string;
      content: string;
      list: string[];
      content2: string;
    };
    section13: {
      title: string;
      content: string;
    };
    note: string;
  };
  processTimeline: {
    title: string;
    subtitle: string;
    step1Title: string;
    step1Duration: string;
    step1Description: string;
    step1Docs: string[];
    step2Title: string;
    step2Duration: string;
    step2Description: string;
    step2Docs: string[];
    step3Title: string;
    step3Duration: string;
    step3Description: string;
    step3Docs: string[];
    step4Title: string;
    step4Duration: string;
    step4Description: string;
    step4Docs: string[];
    documentsTitle: string;
    creationTitle: string;
    creationDocs: string[];
    repriseTitle: string;
    repriseDocs: string[];
    developmentTitle: string;
    developmentDocs: string[];
    incompleteTitle: string;
    incompleteDescription: string;
    needHelp: string;
    averageTime: string;
    averageTimeValue: string;
    startApplication: string;
  };
  guaranteesSection: {
    title: string;
    subtitle: string;
    organizationalTitle: string;
    organizationalItems: string[];
    realTitle: string;
    realItems: string[];
    personalTitle: string;
    personalItems: string[];
    insuranceTitle: string;
    insuranceItems: string[];
    taxBenefitsTitle: string;
    taxBenefit1Title: string;
    taxBenefit1Description: string;
    taxBenefit2Title: string;
    taxBenefit2Description: string;
    taxBenefit3Title: string;
    taxBenefit3Description: string;
    taxBenefit4Title: string;
    taxBenefit4Description: string;
    taxAdvice: string;
    contributionTitle: string;
    equipmentPercentage: string;
    equipmentLabel: string;
    equipmentDescription: string;
    creationPercentage: string;
    creationLabel: string;
    creationDescription: string;
    realEstatePercentage: string;
    realEstateLabel: string;
    realEstateDescription: string;
    contributionDisclaimer: string;
  };
  footer: {
    description: string;
    phone: string;
    email: string;
    address: string;
    hoursTitle: string;
    hours: {
      weekdays: string;
      weekend: string;
      support: string;
    };
    certificationsTitle: string;
    certifications: string[];
    productsTitle: string;
    products: {
      personal: string;
      business: string;
      mortgage: string;
      auto: string;
      renovation: string;
    };
    companyTitle: string;
    careers: string;
    legalTitle: string;
    legalLinks: {
      terms: string;
      privacy: string;
      cgu: string;
      cookies: string;
      gdpr: string;
    };
    helpTitle: string;
    helpLinks: {
      faq: string;
      userGuide: string;
      support: string;
      simulator: string;
      contactUs: string;
    };
    copyright: string;
    regulatory: string;
    disclaimer: string;
  };
  seo: {
    home: {
      title: string;
      description: string;
      keywords?: string;
    };
    about: {
      title: string;
      description: string;
      keywords?: string;
    };
    contact: {
      title: string;
      description: string;
      keywords?: string;
    };
    howItWorks: {
      title: string;
      description: string;
      keywords?: string;
    };
    forgotPassword: {
      title: string;
      description: string;
      emailSentTitle: string;
      emailSentDescription: string;
    };
    resetPassword: {
      title: string;
      description: string;
    };
    twoFactorSetup: {
      title: string;
      description: string;
    };
    verifyTwoFactor: {
      title: string;
      description: string;
    };
  };
  admin: {
    common: {
      status: {
        pending: string;
        active: string;
        approved: string;
        rejected: string;
        suspended: string;
        completed: string;
        signed: string;
        inProgress: string;
      };
      actions: {
        approve: string;
        reject: string;
        delete: string;
        suspend: string;
        save: string;
        download: string;
        upload: string;
        send: string;
        edit: string;
        cancel: string;
        disburse: string;
      };
      labels: {
        user: string;
        userName: string;
        userEmail: string;
        amount: string;
        type: string;
        rate: string;
        duration: string;
        status: string;
        date: string;
        createdAt: string;
        actions: string;
        fees: string;
        progress: string;
        codes: string;
        recipient: string;
        contract: string;
        months: string;
        total: string;
        active: string;
        pending: string;
        recent: string;
        all: string;
        noData: string;
        loading: string;
        error: string;
        success: string;
        balance: string;
        loans: string;
      };
      messages: {
        error: string;
        success: string;
        updated: string;
        approved: string;
        rejected: string;
        deleted: string;
        disbursed: string;
        cannotApprove: string;
        cannotReject: string;
        cannotDelete: string;
        cannotUpdate: string;
        loadError: string;
      };
      empty: {
        noResults: string;
        noData: string;
      };
    };
    dashboard: {
      title: string;
      description: string;
      totalUsers: string;
      activeUsers: string;
      pendingUsers: string;
      transfers: string;
      transfersPending: string;
      loans: string;
      loansActive: string;
      totalVolume: string;
      volumeDescription: string;
      recentUsers: string;
      recentUsersDescription: string;
      recentTransfers: string;
      recentTransfersDescription: string;
    };
    loans: {
      title: string;
      description: string;
      allLoans: string;
      allLoansDescription: string;
      loanApproved: string;
      loanApprovedDesc: string;
      loanRejected: string;
      loanRejectedDesc: string;
      loanDeleted: string;
      loanDeletedDesc: string;
      fundsDisbursed: string;
      fundsDisbursedDesc: string;
      contractGenerated: string;
      contractSigned: string;
      approveReason: string;
      rejectReason: string;
      deleteReason: string;
      approveDialogTitle: string;
      approveDialogDesc: string;
      rejectDialogTitle: string;
      rejectDialogDesc: string;
      disburseDialogTitle: string;
      disburseDialogDesc: string;
      deleteDialogTitle: string;
      deleteDialogDesc: string;
    };
    transfers: {
      title: string;
      description: string;
      allTransfers: string;
      allTransfersDescription: string;
      transferUpdated: string;
      transferUpdatedDesc: string;
      approveDialogTitle: string;
      approveDialogDesc: string;
      suspendDialogTitle: string;
      suspendDialogDesc: string;
    };
  };
  expertise: {
    title: string;
    subtitle: string;
    realEstate: string;
    realEstateDesc: string;
    personal: string;
    personalDesc: string;
    professional: string;
    professionalDesc: string;
    consolidation: string;
    consolidationDesc: string;
    business: string;
    businessDesc: string;
    investment: string;
    investmentDesc: string;
  };
  howItWorksSection: {
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
    ctaText: string;
    ctaButton: string;
  };
  premiumTestimonials: {
    title: string;
    subtitle: string;
    testimonial1Name: string;
    testimonial1Role: string;
    testimonial1Content: string;
    testimonial2Name: string;
    testimonial2Role: string;
    testimonial2Content: string;
    testimonial3Name: string;
    testimonial3Role: string;
    testimonial3Content: string;
    testimonial4Name: string;
    testimonial4Role: string;
    testimonial4Content: string;
  };
  bankingSecurity: {
    badge: string;
    title: string;
    subtitle: string;
    aes256Title: string;
    aes256Desc: string;
    mfaTitle: string;
    mfaDesc: string;
    kycTitle: string;
    kycDesc: string;
    euHostingTitle: string;
    euHostingDesc: string;
    monitoringTitle: string;
    monitoringDesc: string;
    gdprTitle: string;
    gdprDesc: string;
    certified: string;
    compliance: string;
    audited: string;
  };
  finalCTA: {
    badge: string;
    title: string;
    subtitle: string;
    benefit1: string;
    benefit2: string;
    benefit3: string;
    benefit4: string;
    primaryButton: string;
    secondaryButton: string;
    trustText: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
    stat4Value: string;
    stat4Label: string;
  };
};

const howItWorksEN = {
  title: 'How It Works',
  subtitle: 'An ultra-fast 100% digital process in 4 simple steps',
  step1Title: 'Registration - 3 Minutes',
  step1Desc: 'Create your Altus Finance Group account in just minutes. Securely enter your personal or business information. Instant identity verification (KYC) ensures your account security.',
  step2Title: 'Login - Access Your Dashboard',
  step2Desc: 'Log in to your secure personal client dashboard. You will find all the necessary tools to manage your finances and submit loan requests. 24/7 access from any device.',
  step3Title: 'Loan Request - From Your Dashboard',
  step3Desc: 'Submit your loan request directly from your user dashboard. Fill out the form with the desired amount and upload your supporting documents. Our technology analyzes your profile and gives you an approval response within 24 to 48 hours.',
  step4Title: 'Disbursement and Transfer - Within 7 to 15 Days',
  step4Desc: 'Once your request is approved, electronically sign your contract from your dashboard. Funds are released to your secure Altus Finance Group account, then transferred to your personal or business bank account within 7 to 15 days.',
  averageTimePrefix: 'Average total time:',
  averageTimeValue: '2 to 3 weeks from application submission to fund disbursement',
  requiredDocumentsTitle: 'Required Documents',
  requiredDocumentsSubtitle: 'Prepare these documents to expedite your application',
  personalLoanTitle: 'Personal Loan',
  businessLoanTitle: 'Business Loan',
  documents: {
    personal: [
      'Valid ID (national ID card, passport)',
      'Proof of address (less than 3 months)',
      'Last 3 pay slips',
      'Latest tax assessment',
      'Bank statements (3 months)',
      'Project justification (quotes, invoices)'
    ],
    professional: [
      'Kbis less than 3 months old',
      'Manager\'s ID document',
      'Company bylaws',
      'Financial statements (last 3 years)',
      'Complete tax package',
      'Professional bank statements (6 months)',
      'Business plan (startup/takeover)',
      '3-year financial forecast',
      'Quotes or proforma invoices (equipment)'
    ]
  },
  tipTitle: 'Tip:',
  tipMessage: 'Missing documents? Our team will help you complete your file.',
  tipContactCta: 'Contact us →',
  eligibilityTitle: 'Eligibility Criteria',
  eligibilitySubtitle: 'Check if you meet the requirements for your loan',
  individualsTitle: 'Individuals',
  professionalsTitle: 'Professionals',
  requiredTag: 'Required',
  eligibility: {
    personal: [
      { label: 'Adult and French resident', required: true },
      { label: 'Verifiable regular income', required: true },
      { label: 'No banking ban', required: true },
      { label: 'Debt ratio < 35%', required: true },
      { label: 'Acceptable credit score', required: false }
    ],
    professional: [
      { label: 'Company registered in France', required: true },
      { label: 'Operating for +6 months', required: true },
      { label: 'Up-to-date financial statements', required: true },
      { label: 'No collective proceedings', required: true },
      { label: 'Personal contribution 10-30%', required: true }
    ]
  },
  securityTitle: 'Security & Guarantees',
  security: {
    dataProtectionTitle: 'Your Protected Data',
    dataProtectionItems: [
      '256-bit SSL encryption',
      'GDPR and ACPR compliance',
      'Secure servers in France',
      'Two-factor authentication'
    ],
    guaranteesTitle: 'Guarantee Organizations',
    guaranteesItems: [
      'BPI France (40-70% of loan)',
      'SIAGI (craftsmen/merchants)',
      'France Active (social economy)',
      'Mandatory borrower insurance'
    ]
  },
  ctaTitle: 'Ready to Get Started?',
  ctaSubtitle: 'Submit your online application in minutes and get a quick response',
  ctaRequestButton: 'Request a Loan',
  ctaContactButton: 'Talk to an Advisor'
};

export const translations: Record<Language, TranslationKeys> = {
  fr: {
    hero: {
      title: 'Réalisez vos projets avec Altus Finance Group',
      subtitle: 'Solutions de financement pour particuliers et professionnels - Taux compétitifs et processus transparent',
      cta1: 'Demander un financement',
      cta2: 'Mon espace',
      learnMore: 'En savoir plus',
      trustIndicator: 'Plus de 15 000 clients satisfaits nous font confiance',
      trustBadges: {
        response24h: 'Réponse en 24h',
        swissSecurity: 'Sécurité bancaire suisse',
        fastApproval: 'Approbation rapide',
      },
      calculator: {
        title: 'Calculez votre budget',
        subtitle: 'Obtenez une estimation instantanée',
        loanAmount: 'Montant du prêt',
        duration: 'Durée (mois)',
        monthlyPayment: 'Paiement mensuel',
        perMonth: 'par mois',
        applyNow: 'Faire une demande',
        disclaimer: 'Demande gratuite - Sans engagement - Processus confidentiel',
      },
      slides: [
        {
          title: 'Altus Finance Group',
          subtitle: 'Solutions de financement professionnelles et sécurisées pour accompagner votre croissance.',
        },
        {
          title: 'Expertise Financière d\'Excellence',
          subtitle: 'Des solutions sur mesure adaptées à vos ambitions entrepreneuriales et patrimoniales.',
        },
        {
          title: 'Votre Partenaire de Confiance',
          subtitle: 'Accompagnement personnalisé et discrétion absolue pour tous vos projets de financement.',
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
      tagline: 'Solutions Financières Premium',
      more: 'Plus',
      moreInfo: 'Plus d\'informations',
      language: 'Langue',
      loansMenu: {
        label: 'Nos Prêts',
        items: [
          {
            title: 'Crédit Personnel',
            description: 'Financez vos projets personnels avec des taux avantageux',
            href: '/loans/personal-credit',
          },
          {
            title: 'Rachat de Crédit',
            description: 'Regroupez vos crédits pour simplifier vos remboursements',
            href: '/loans/loan-refinancing',
          },
          {
            title: 'Rachat de Leasing',
            description: 'Optimisez vos coûts en rachetant votre leasing',
            href: '/loans/lease-refinancing',
          },
          {
            title: 'Rachat Carte de Crédit',
            description: 'Réduisez vos taux d\'intérêt sur vos cartes de crédit',
            href: '/loans/credit-card-refinancing',
          },
          {
            title: 'Crédits Divers',
            description: 'Solutions de financement adaptées à tous vos besoins',
            href: '/products',
          },
          {
            title: 'Prêts PME',
            description: 'Financements professionnels pour développer votre entreprise',
            href: '/products',
          },
        ],
      },
      howItWorks: 'Comment ça marche',
      resources: 'Ressources',
      faq: 'FAQ',
      about: 'À propos',
      contact: 'Contact',
      phone: '+352 40 63 48',
      dashboard: 'Tableau de bord',
      loans: 'Prêts',
      myLoans: 'Mes prêts',
      newLoan: 'Demande de prêt',
      contracts: 'Contrats',
      loansSection: 'Prêts',
      transfers: 'Transferts',
      history: 'Historique',
      settings: 'Paramètres',
      logout: 'Déconnexion',
      users: 'Utilisateurs',
      documents: 'Documents KYC',
      reports: 'Rapports',
    },
    contracts: {
      title: 'Gestion des Contrats',
      description: 'Téléchargez, signez et renvoyez vos contrats de prêt en toute sécurité.',
      loanNumber: 'Prêt',
      approvedOn: 'Approuvé le',
      actionRequired: 'Action requise',
      step1: '1. Télécharger le contrat',
      step1Description: 'Téléchargez et lisez attentivement votre contrat de prêt.',
      step2: '2. Signer et renvoyer',
      step2Description: 'Signez le contrat et renvoyez-le au format PDF.',
      downloadContract: 'Télécharger le contrat',
      tabPending: 'À signer',
      tabReview: 'En vérification',
      tabCompleted: 'Terminés',
      inReview: 'En vérification',
      signed: 'Signé',
      noPendingContracts: 'Aucun contrat en attente',
      noPendingContractsDescription: 'Tous vos contrats ont été signés et envoyés.',
      noReviewContracts: 'Aucun contrat en vérification',
      noReviewContractsDescription: 'Aucun contrat n\'est actuellement en attente de vérification.',
      noCompletedContracts: 'Aucun contrat signé',
      noCompletedContractsDescription: 'Vos contrats signés apparaîtront ici.',
      reviewMessage: 'Votre contrat signé a été reçu et est en cours de vérification par notre équipe. Vous serez notifié dès que les fonds seront débloqués.',
      signedSuccess: 'Contrat signé et validé avec succès',
      downloadOriginal: 'Télécharger le contrat original',
    },
    dashboard: {
      welcome: 'Bienvenue',
      welcomeUser: 'Bienvenue, {name}',
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
      yourGlobalBalance: 'Votre solde global',
      noActiveLoans: 'Aucun prêt actif',
      noTransfers: 'Aucun transfert trouvé',
      dataLoadError: 'Erreur lors du chargement des données',
      available: 'disponible',
      notifications: 'Notifications',
      noNotifications: 'Aucune notification',
      viewDetails: 'Voir les détails',
      availableOffers: 'Offres disponibles pour vous',
      contractToSign: 'Contrat à signer',
      moreTransfers: 'transfert(s) supplémentaire(s)',
      goodMorning: 'Bonjour',
      goodAfternoon: 'Bon après-midi',
      goodEvening: 'Bonsoir',
      totalBalance: 'Solde total',
      newTransfer: 'Nouveau transfert',
      requestLoan: 'Demander un prêt',
      manageAccounts: 'Gérer les comptes',
      cashflow: 'Flux de trésorerie',
      incomeExpensesSixMonths: 'Revenus et dépenses sur 6 mois',
      income: 'Revenus',
      expenses: 'Dépenses',
      creditUtilization: 'Utilisation du crédit',
      used: 'utilisé',
      recentActivity: 'Activité récente',
      latestTransactions: 'Dernières transactions',
      viewAll: 'Tout voir',
      noRecentTransactions: 'Aucune transaction récente',
      pendingRequests: 'Demandes en attente',
      pendingRequestsDescription: 'Vos demandes de prêt en cours de traitement',
      noPendingRequests: 'Aucune demande en attente',
      pendingLoan: 'Demande en attente',
      yourActiveLoans: 'Vos emprunts en cours',
      yourActiveLoansDescription: 'Suivez vos remboursements et échéances',
      activeLoan: 'Prêt actif',
      repaid: 'Remboursé',
      upcomingDueDates: 'Échéances à venir',
      amount: 'Montant',
      monthJan: 'Jan',
      monthFeb: 'Fév',
      monthMar: 'Mar',
      monthApr: 'Avr',
      monthMay: 'Mai',
      monthJun: 'Juin',
      serverError: 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion et réessayer.',
      diagnosticInfo: 'Informations de diagnostic (développement)',
      retry: 'Réessayer',
      financeOverview: 'Voici un aperçu de vos finances',
      yourCreditLimit: 'Votre limite de crédit',
      maximum: 'Maximum',
      activeLoanSingular: 'prêt actif',
      activeLoansPlural: 'prêts actifs',
      loanNumber: 'Prêt #',
      progression: 'Progression',
      nextSixMonths: 'Prochains 6 mois',
      repayment: 'Remboursement',
      noUpcomingRepayments: 'Aucun remboursement à venir',
      pendingContracts: 'Contrats en attente',
      contractsToSign: 'contrat(s) à signer',
      generatedOn: 'Généré le',
      view: 'Voir',
    },
    loan: {
      pageTitle: 'Mes prêts',
      pageDescription: 'Gérez vos prêts et simulez vos remboursements',
      tabMyLoans: 'Mes prêts',
      tabCalculator: 'Calculateur',
      amount: 'Montant',
      interestRate: 'Taux d\'intérêt',
      nextPayment: 'Prochain paiement',
      viewAll: 'Voir tout',
      status: 'Statut',
      downloadContract: 'Télécharger le contrat',
      uploadSignedContract: 'Télécharger le contrat signé',
      downloading: 'Téléchargement...',
      uploading: 'Téléchargement...',
      loanNumber: 'Prêt',
      requestSubmitted: 'Demande de prêt soumise',
      requestSubmittedDesc: 'Votre demande est en attente d\'approbation par un administrateur. Vous recevrez une notification dès qu\'elle sera traitée.',
      requestError: 'Échec de la soumission de la demande de prêt',
      loanApproved: '🎉 Votre prêt a été approuvé !',
      approvalInstructions: 'Pour finaliser votre prêt, veuillez suivre ces étapes :',
      approvalStep1: 'Téléchargez votre contrat de prêt (PDF)',
      approvalStep2: 'Lisez-le attentivement et signez-le',
      approvalStep3: 'Renvoyez le contrat signé (PDF) via le bouton ci-dessous',
      downloadContractButton: '1. Télécharger le contrat',
      uploadContractButton: '2. Renvoyer le contrat signé',
      uploading2: 'Envoi en cours...',
    },
    transfer: {
      pageTitle: 'Mes transferts',
      pageDescription: 'Gérez et suivez tous vos transferts de fonds',
      searchPlaceholder: 'Rechercher par destinataire ou ID...',
      allStatuses: 'Tous les statuts',
      filterTitle: 'Filtres et recherche',
      filterDescription: 'Affinez votre liste de transferts',
      noTransfersFound: 'Aucun transfert trouvé',
      noTransfersMessage: 'Vous n\'avez pas encore effectué de transfert',
      createTransfer: 'Créer un transfert',
      newTransfer: 'Nouveau transfert',
      requestSubmitted: 'Demande soumise',
      documentVerification: 'Vérification des documents',
      complianceCheck: 'Contrôle de conformité',
      approvalPending: 'Approbation en attente',
      transferComplete: 'Transfert terminé',
      pending: 'En attente',
      inProgress: 'En cours',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      completed: 'Complété',
      suspended: 'Suspendu',
      noAccount: 'Aucun compte enregistré',
      validation: 'Validation',
      validating: 'Validation...',
      onHold: 'Transfert en pause',
      processing: 'Transfert en cours',
      processingComplete: 'Transfert complété',
    },
    history: {
      pageTitle: 'Historique des transactions',
      pageDescription: 'Consultez l\'historique complet de toutes vos transactions',
      totalCredits: 'Total crédits',
      totalDebits: 'Total débits',
      totalTransactions: 'Total transactions',
      filterTitle: 'Filtres et recherche',
      filterDescription: 'Affinez votre historique de transactions',
      searchPlaceholder: 'Rechercher par description ou ID...',
      filterType: 'Type',
      allTypes: 'Tous les types',
      typeCredit: 'Crédit',
      typeDebit: 'Débit',
      typeFee: 'Frais',
      noTransactionsFound: 'Aucune transaction trouvée',
      noTransactionsFoundFiltered: 'Essayez de modifier vos critères de recherche',
      noTransactionsYet: 'Vous n\'avez pas encore de transactions',
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
      feesToPay: 'Frais à payer',
      unpaidFeesCount: 'frais impayés',
      unpaidFeesSingular: 'frais impayé',
      pendingValidation: 'En attente de validation',
      autoValidatedViaCode: 'Auto-validé via code',
      totalUnpaid: 'Total impayé',
      totalOverall: 'Total général',
    },
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      active: 'Actif',
      pending: 'En attente',
      completed: 'Complété',
      suspended: 'Suspendu',
      saving: 'Enregistrement...',
      cancel: 'Annuler',
      save: 'Enregistrer',
      close: 'Fermer',
      noData: 'Aucune donnée disponible',
      months: 'mois',
      years: 'ans',
    },
    settings: {
      title: 'Paramètres',
      profile: 'Profil',
      notifications: 'Notifications',
      security: 'Sécurité',
      appearance: 'Apparence',
      personalInfo: 'Informations personnelles',
      updateInfo: 'Mettez à jour vos informations de profil',
      fullName: 'Nom complet',
      email: 'Email',
      phone: 'Téléphone',
      company: 'Entreprise',
      saveChanges: 'Enregistrer les modifications',
      accountType: 'Type de compte',
      yourAccountType: 'Votre compte',
      individualAccount: 'Compte Particulier',
      businessAccount: 'Compte Professionnel',
      individualAccess: 'Accès aux services de financement personnel',
      businessAccess: 'Accès complet aux services de financement d\'entreprise',
      verified: 'Vérifié',
      notificationPreferences: 'Préférences de notification',
      chooseNotifications: 'Choisissez comment vous souhaitez être notifié',
      emailAlerts: 'Alertes par email',
      emailAlertsDesc: 'Recevez des alertes importantes par email',
      transferUpdates: 'Mises à jour de transfert',
      transferUpdatesDesc: 'Notifications sur l\'état de vos transferts',
      loanReminders: 'Rappels de paiement',
      loanRemindersDesc: 'Rappels pour vos échéances de prêt',
      marketingEmails: 'Emails marketing',
      marketingEmailsDesc: 'Recevez des nouvelles et des offres spéciales',
      savePreferences: 'Enregistrer les préférences',
      changePassword: 'Modifier le mot de passe',
      updatePassword: 'Mise à jour de votre mot de passe',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmNewPassword: 'Confirmer le nouveau mot de passe',
      themeSettings: 'Paramètres de thème',
      chooseTheme: 'Sélectionnez votre thème préféré',
      lightMode: 'Mode clair',
      darkMode: 'Mode sombre',
      systemMode: 'Système',
      languageSettings: 'Paramètres de langue',
      chooseLanguage: 'Sélectionnez votre langue',
      changePhoto: 'Changer la photo',
      uploading: 'Téléchargement...',
      twoFactorAuth: 'Authentification à deux facteurs',
      twoFactorAuthDesc: 'Ajoutez une couche de sécurité supplémentaire à votre compte',
      twoFactorEnabled: 'Authentification à deux facteurs activée',
      enable2FA: 'Activer 2FA',
      twoFactorEnabledDesc: 'Votre compte est protégé par l\'authentification à deux facteurs',
      twoFactorDisabledDesc: 'Protégez votre compte avec une vérification en deux étapes via Google Authenticator',
      disable: 'Désactiver',
      configure: 'Configurer',
      enabled: 'Activé',
      twoFactorActiveMessage: 'Votre compte est sécurisé avec Google Authenticator. Un code sera demandé à chaque connexion.',
      theme: 'Thème',
      themeDesc: 'Choisissez votre thème préféré',
      light: 'Clair',
      dark: 'Sombre',
      languageLabel: 'Langue',
      languageDesc: 'Sélectionnez votre langue',
      disable2FASuccess: 'Succès',
      disable2FASuccessDesc: '2FA désactivée avec succès',
      disable2FAError: 'Erreur lors de la désactivation 2FA',
    },
    messages: {
      profileUpdated: 'Profil mis à jour',
      profileUpdatedDesc: 'Vos informations ont été enregistrées avec succès.',
      preferencesUpdated: 'Préférences enregistrées',
      preferencesUpdatedDesc: 'Vos préférences de notification ont été mises à jour.',
      passwordChanged: 'Mot de passe modifié',
      passwordChangedDesc: 'Votre mot de passe a été modifié avec succès.',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      errorUpdatingProfile: 'Erreur lors de la mise à jour du profil',
      errorUpdatingPreferences: 'Erreur lors de la mise à jour des préférences',
      errorChangingPassword: 'Erreur lors du changement de mot de passe',
      avatarUpdated: 'Photo de profil mise à jour',
      avatarUpdatedDesc: 'Votre photo de profil a été mise à jour avec succès.',
      errorUploadingAvatar: 'Erreur lors du téléchargement de la photo',
      invalidFileType: 'Type de fichier non autorisé. Seules les images JPEG, PNG et WebP sont acceptées.',
      fileTooLarge: 'Le fichier est trop volumineux (max 5MB).',
    },
    about: {
      title: 'À propos d\'Altus Finance Group',
      subtitle: 'Votre partenaire de confiance pour le financement des particuliers et professionnels',
      mission: 'Notre Mission',
      missionText: 'Chez Altus Finance Group, nous démocratisons l\'accès au financement pour tous. Que vous soyez un particulier avec un projet personnel ou une entreprise en développement, nous proposons des solutions de crédit modernes, transparentes et adaptées à vos besoins. Notre technologie de pointe nous permet d\'analyser rapidement votre situation et de vous proposer des offres personnalisées avec des taux compétitifs. Nous croyons en la transparence totale : pas de frais cachés, des conditions claires et un accompagnement à chaque étape.',
      stats: {
        clients: 'Clients actifs',
        loansProvided: 'Prêts accordés',
        successRate: 'Taux de satisfaction',
        yearsExperience: 'Années d\'expérience',
      },
    },
    howItWorks: {
      title: 'Comment ça marche',
      subtitle: 'Un processus 100% digital ultra-rapide en 4 étapes simples',
      step1Title: 'Inscription - 3 minutes',
      step1Desc: 'Créez votre compte Altus Finance Group en quelques minutes. Renseignez vos informations personnelles ou professionnelles de manière sécurisée. La vérification d\'identité instantanée (KYC) garantit la sécurité de votre compte.',
      step1Duration: '3 min',
      step2Title: 'Connexion - Accédez à votre espace',
      step2Desc: 'Connectez-vous à votre espace client personnel sécurisé. Vous y trouverez tous les outils nécessaires pour gérer vos finances et faire vos demandes de prêt. Accès 24/7 depuis n\'importe quel appareil.',
      step2Duration: 'Instantané',
      step3Title: 'Demande et analyse - Réponse instantanée',
      step3Desc: 'Soumettez votre demande de prêt directement depuis votre espace utilisateur. Remplissez le formulaire avec le montant souhaité et téléchargez vos documents justificatifs. Grâce à notre technologie d\'analyse en temps réel, vous recevez une réponse de principe en quelques minutes à 24 heures maximum.',
      step3Duration: '< 24h',
      step4Title: 'Déblocage immédiat - Fonds disponibles instantanément',
      step4Desc: 'Une fois votre demande approuvée, signez électroniquement votre contrat depuis votre espace. Les fonds sont immédiatement débloqués sur votre compte sécurisé Altus Finance Group. Vous pouvez ensuite les transférer vers votre compte bancaire personnel ou professionnel instantanément et sans frais supplémentaires.',
      step4Duration: 'Immédiat',
      averageTimePrefix: 'Temps total moyen :',
      averageTimeValue: '24 heures maximum de la soumission de la demande au déblocage des fonds',
      requiredDocumentsTitle: 'Documents requis',
      requiredDocumentsSubtitle: 'Préparez ces documents pour accélérer votre demande',
      personalLoanTitle: 'Prêt Personnel',
      businessLoanTitle: 'Prêt Professionnel',
      documents: {
        personal: [
          'Pièce d\'identité valide (carte d\'identité, passeport)',
          'Justificatif de domicile (moins de 3 mois)',
          'Les 3 derniers bulletins de salaire',
          'Dernier avis d\'imposition',
          'Relevés bancaires (3 mois)',
          'Justification du projet (devis, factures)'
        ],
        professional: [
          'Kbis de moins de 3 mois',
          'Pièce d\'identité du dirigeant',
          'Statuts de la société',
          'Bilans financiers (3 dernières années)',
          'Liasse fiscale complète',
          'Relevés bancaires professionnels (6 mois)',
          'Business plan (création/reprise)',
          'Prévisionnel financier sur 3 ans',
          'Devis ou factures pro forma (équipements)'
        ]
      },
      tipTitle: 'Astuce :',
      tipMessage: 'Documents manquants ? Notre équipe vous aidera à compléter votre dossier.',
      tipContactCta: 'Contactez-nous →',
      eligibilityTitle: 'Critères d\'éligibilité',
      eligibilitySubtitle: 'Vérifiez si vous remplissez les conditions pour votre prêt',
      individualsTitle: 'Particuliers',
      professionalsTitle: 'Professionnels',
      requiredTag: 'Obligatoire',
      eligibility: {
        personal: [
          { label: 'Majeur et résident français', required: true },
          { label: 'Revenus réguliers vérifiables', required: true },
          { label: 'Pas d\'interdiction bancaire', required: true },
          { label: 'Taux d\'endettement < 35%', required: true },
          { label: 'Score de crédit acceptable', required: false }
        ],
        professional: [
          { label: 'Entreprise immatriculée en France', required: true },
          { label: 'En activité depuis +6 mois', required: true },
          { label: 'Bilans financiers à jour', required: true },
          { label: 'Pas de procédure collective', required: true },
          { label: 'Apport personnel 10-30%', required: true }
        ]
      },
      securityTitle: 'Sécurité et Garanties',
      security: {
        dataProtectionTitle: 'Vos Données Protégées',
        dataProtectionItems: [
          'Cryptage SSL 256 bits',
          'Conformité RGPD et ACPR',
          'Serveurs sécurisés en France',
          'Authentification à deux facteurs'
        ],
        guaranteesTitle: 'Organismes de Garantie',
        guaranteesItems: [
          'BPI France (40-70% du prêt)',
          'SIAGI (artisans/commerçants)',
          'France Active (économie sociale)',
          'Assurance emprunteur obligatoire'
        ]
      },
      ctaTitle: 'Prêt à commencer ?',
      ctaSubtitle: 'Soumettez votre demande en ligne en quelques minutes et obtenez une réponse rapide',
      ctaRequestButton: 'Demander un prêt',
      ctaContactButton: 'Parler à un conseiller'
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
          answer: 'Grâce à notre technologie d\'analyse en temps réel, vous recevez une réponse de principe en quelques minutes à 24 heures maximum. Une fois approuvé, les fonds sont immédiatement débloqués sur votre compte sécurisé Altus Finance Group. Vous pouvez ensuite les transférer vers votre compte bancaire personnel ou professionnel quand vous le souhaitez, instantanément et sans frais supplémentaires.',
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
          answer: 'Nos taux sont calculés par un algorithme qui analyse plusieurs facteurs : votre score de crédit, la durée du prêt, le montant emprunté, vos revenus et charges, votre historique de remboursement et la santé financière (pour les entreprises). Les taux varient de 0,5% à 9,0% TAEG selon le profil et le type de prêt. Nos taux sont parmi les plus compétitifs du marché grâce à notre réseau de partenaires financiers.',
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
        section1Content: 'En accédant et en utilisant les services de Altus Finance Group, vous acceptez et acceptez d\'être lié par les termes et dispositions de cet accord.',
        section2Title: '2. Licence d\'Utilisation',
        section2Content: 'L\'autorisation est accordée pour accéder temporairement aux matériaux (informations ou logiciels) sur la plateforme de Altus Finance Group pour une visualisation personnelle et non commerciale uniquement.',
        section3Title: '3. Contrat de Prêt',
        section3Content: 'Tous les prêts sont soumis à l\'approbation de crédit. Les termes et conditions seront fournis dans un contrat de prêt séparé lors de l\'approbation de votre demande.',
        section4Title: '4. Déclarations et Garanties',
        section4Content: 'Vous déclarez et garantissez que toutes les informations fournies dans votre demande de prêt sont exactes, complètes et à jour.',
        section5Title: '5. Limitation de Responsabilité',
        section5Content: 'En aucun cas Altus Finance Group ou ses fournisseurs ne seront responsables de tout dommage découlant de l\'utilisation ou de l\'impossibilité d\'utiliser les matériaux sur la plateforme de Altus Finance Group.',
        section6Title: '6. Modifications',
        section6Content: 'Altus Finance Group peut réviser ces conditions d\'utilisation à tout moment sans préavis. En utilisant cette plateforme, vous acceptez d\'être lié par la version actuelle de ces conditions.',
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
      miscellaneousCredit: 'Crédits Divers',
      miscellaneousCreditDesc: 'Financez tous vos projets personnels : événements, équipements, loisirs, santé, bien-être. De 500€ à 50 000€ sur 6 à 96 mois. Taux TAEG de 2,9% à 8,9%. Procédure simplifiée, réponse rapide en 24h. Déblocage des fonds en 3 à 5 jours.',
      amount: 'Montant',
      rate: 'Taux TAEG',
      duration: 'Durée',
      rateDisclaimer: 'Taux indicatifs soumis à conditions d\'éligibilité. TAEG fixe. Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager...',
      compareLoans: 'Comparer tous les prêts',
    },
    businessLoans: {
      title: 'Solutions pour Professionnels',
      subtitle: 'Des financements adaptés aux besoins de votre entreprise, TPE, PME ou auto-entrepreneur',
      businessLoan: 'Prêt Professionnel',
      businessLoanDesc: 'Financement pour vos projets d\'entreprise, développement et trésorerie',
      businessLoanFeatures: ['Réponse sous 48h', 'Taux fixe', 'Remboursement flexible'],
      cashFlowCredit: 'Crédit de Trésorerie',
      cashFlowCreditDesc: 'Solution rapide pour gérer vos besoins en fonds de roulement',
      cashFlowCreditFeatures: ['Déblocage rapide', 'Sans garantie jusqu\'à 50k€', 'Flexible'],
      equipmentFinancing: 'Financement Équipement',
      equipmentFinancingDesc: 'Achetez vos équipements professionnels et matériels',
      equipmentFinancingFeatures: ['Jusqu\'à 100% du montant', 'Option leasing', 'Déduction fiscale'],
      commercialProperty: 'Prêt Immobilier Pro',
      commercialPropertyDesc: 'Acquérez vos locaux, bureaux ou entrepôts professionnels',
      commercialPropertyFeatures: ['Durée longue', 'Apport à partir de 20%', 'Taux compétitif'],
      lineOfCredit: 'Ligne de Crédit',
      lineOfCreditDesc: 'Crédit renouvelable pour vos besoins ponctuels',
      lineOfCreditFeatures: ['Disponible 24/7', 'Remboursement libre', 'Renouvellement auto'],
      lineOfCreditDuration: 'Renouvelable',
      vehicleFleet: 'Crédit Véhicule Pro',
      vehicleFleetDesc: 'Financez votre flotte automobile ou véhicules utilitaires',
      vehicleFleetFeatures: ['LOA ou crédit classique', 'Option rachat', 'Assurance incluse'],
      smeLoan: 'Prêts PME',
      smeLoanDesc: 'Solutions de financement dédiées aux PME pour croissance, développement et investissements stratégiques',
      smeLoanFeatures: ['Montants élevés jusqu\'à 1M€', 'Durée flexible 1-10 ans', 'Accompagnement expert'],
      amount: 'Montant',
      rate: 'TAEG',
      duration: 'Durée',
      months: 'mois',
      years: 'ans',
      features: 'Avantages',
      learnMore: 'En savoir plus',
      advantagesTitle: 'Avantages ALTUS Pro',
      advantages: [
        'Conseiller dédié pour votre entreprise',
        'Étude personnalisée de votre dossier',
        'Accompagnement dans vos démarches',
        'Montage de dossier business plan inclus',
      ],
      eligibilityTitle: 'Critères d\'éligibilité',
      eligibility: [
        'Entreprise immatriculée en France',
        'Activité depuis plus de 6 mois',
        'Pas d\'interdiction bancaire',
        'Bilans comptables à jour',
      ],
      rateDisclaimer: 'Taux indicatifs soumis à l\'étude et l\'acceptation de votre dossier. TAEG fixe.',
      simulateLoan: 'Simuler mon prêt professionnel',
      contactAdvisor: 'Contacter un conseiller',
    },
    professionalFAQ: {
      title: 'Questions Fréquentes',
      subtitle: 'Trouvez rapidement des réponses à vos questions',
      faqs: [
        {
          question: 'Quels sont les documents nécessaires pour une demande de prêt professionnel ?',
          answer: 'Pour les professionnels : Kbis de moins de 3 mois, pièce d\'identité du dirigeant, bilans comptables des 3 dernières années, liasse fiscale complète, relevés bancaires professionnels (6 mois), business plan (création), prévisionnel financier. Pour les particuliers : pièce d\'identité, justificatif de domicile, derniers bulletins de salaire et avis d\'imposition.',
        },
        {
          question: 'Quel apport personnel est requis pour un prêt professionnel ?',
          answer: 'L\'apport personnel varie selon le projet : 10-15% pour l\'achat d\'équipement ou de matériel, 20-30% pour une création ou reprise d\'entreprise, 20-25% pour l\'immobilier professionnel. Un apport plus important peut améliorer vos conditions de financement et diminuer votre taux.',
        },
        {
          question: 'Quel est le délai pour obtenir une réponse et les fonds ?',
          answer: 'Réponse de principe en 24-48h après soumission du dossier complet. L\'accord définitif intervient sous 48h. Le déblocage des fonds s\'effectue sous 7 à 15 jours après signature du contrat et mise en place des garanties. Délai total moyen : 2 à 3 semaines.',
        },
        {
          question: 'Quelles garanties puis-je proposer pour mon prêt professionnel ?',
          answer: 'Plusieurs options : garanties réelles (hypothèque, nantissement fonds de commerce, gage matériel), garanties personnelles (caution solidaire du dirigeant), organismes de cautionnement (BPI France 40-70%, SIAGI, France Active, SOCAMA), ou assurance emprunteur (obligatoire : décès/PTIA, optionnelle : IPT/IPP/ITT).',
        },
        {
          question: 'Les intérêts d\'emprunt sont-ils déductibles fiscalement ?',
          answer: 'Oui ! Les intérêts d\'emprunt professionnel sont entièrement déductibles du résultat fiscal de votre entreprise, réduisant ainsi votre impôt sur les bénéfices. De plus, les cotisations d\'assurance emprunteur sont également déductibles. La TVA sur les intérêts et frais est récupérable pour les entreprises assujetties.',
        },
        {
          question: 'Puis-je obtenir un prêt si mon entreprise a moins d\'un an ?',
          answer: 'Oui, nous finançons les créations d\'entreprise avec un business plan solide et un apport personnel de 20-30%. Nous étudions votre expérience professionnelle, la viabilité du projet et vos prévisions. Un prêt d\'honneur (BPI France, Initiative France) peut renforcer votre dossier.',
        },
        {
          question: 'Puis-je rembourser mon prêt professionnel par anticipation ?',
          answer: 'Oui, tous nos prêts professionnels sont remboursables par anticipation. Les indemnités sont plafonnées par la loi : maximum 6 mois d\'intérêts ou 3% du capital restant dû. Certains contrats prévoient la gratuité du remboursement anticipé après une certaine période.',
        },
        {
          question: 'Quels sont les taux actuels pour les prêts professionnels ?',
          answer: 'Nos taux TAEG varient selon le projet : Immobilier pro 2,9-5,5% (5-25 ans), Équipement 3,9-7,5% (2-5 ans), Fonds de commerce 4,7% (5-10 ans), Trésorerie 4,0-9,0% (3-36 mois), Véhicules pro 3,2-6,5% (2-6 ans). Taux personnalisés selon votre profil et durée.',
        },
        {
          question: 'Comment fonctionne le processus de demande en ligne ?',
          answer: '1) Remplissez notre formulaire en ligne (5 min) et téléchargez vos documents. 2) Analyse de votre dossier par nos experts (24-48h). 3) Recevez votre accord de principe avec conditions. 4) Signature électronique du contrat. 5) Mise en place des garanties. 6) Déblocage des fonds sur votre compte Altus.',
        },
        {
          question: 'Puis-je cumuler plusieurs types de financement ?',
          answer: 'Oui, vous pouvez combiner plusieurs solutions : prêt bancaire + crédit-bail pour l\'équipement, prêt professionnel + prêt d\'honneur (BPI France) pour renforcer vos fonds propres, ou ligne de crédit + prêt amortissable pour conjuguer flexibilité et financement long terme.',
        },
        {
          question: 'Y a-t-il des frais de dossier et autres frais ?',
          answer: 'Frais de dossier : 1-2% du montant pour les prêts professionnels (négociables). Frais de garantie : variables selon le type (hypothèque, nantissement). Assurance emprunteur : 0,10% à 0,40% du capital emprunté par an. Tous les frais sont détaillés dans votre offre de prêt.',
        },
        {
          question: 'Que se passe-t-il si je rencontre des difficultés de remboursement ?',
          answer: 'Contactez-nous dès les premiers signes de difficulté. Nous pouvons étudier : un report d\'échéances temporaire, une modulation des mensualités, un allongement de la durée du prêt, ou une réorganisation de vos crédits. L\'accompagnement préventif est toujours préférable.',
        },
      ],
      notFoundTitle: 'Vous ne trouvez pas la réponse à votre question ?',
      notFoundDesc: 'Notre équipe d\'experts est disponible du lundi au vendredi de 9h à 19h',
      contactUs: 'Contactez-nous',
      helpCenter: 'Centre d\'aide',
    },
    features: {
      title: 'Pourquoi Choisir Altus Finance Group ?',
      subtitle: 'Une plateforme de prêt moderne et transparente qui met vos besoins au centre',
      security: 'Sécurité Bancaire de Niveau Entreprise',
      securityDesc: 'Cryptage AES-256, conformité RGPD, certification SOC 2 Type II et ISO 27001. Vos données financières sont protégées avec les mêmes standards que les grandes banques. Authentification multi-facteurs et surveillance 24/7 contre la fraude.',
      fast: 'Réponse Express - Quelques Minutes à 24h',
      fastDesc: 'Notre technologie d\'IA analyse votre dossier en temps réel. Réponse de principe en quelques minutes à 24h maximum. Fonds immédiatement débloqués sur votre compte Altus sécurisé. Transférez ensuite vers votre compte bancaire quand vous le souhaitez. 100% digital, zéro paperasse.',
      competitive: 'Taux Parmi Les Plus Bas du Marché',
      competitiveDesc: 'Grâce à notre réseau de 50+ partenaires financiers et notre technologie d\'évaluation optimisée, nous négocions pour vous les meilleurs taux : de 0,5% à 9,0% TAEG selon profil et type de prêt. Comparaison automatique pour vous garantir la meilleure offre.',
      flexible: 'Flexibilité Maximale Sans Pénalité',
      flexibleDesc: 'Remboursement anticipé gratuit à tout moment. Modulation des mensualités possible selon votre situation. Report de mensualités en cas de difficultés. Choix de la date de prélèvement. Vous gardez le contrôle total de votre crédit.',
    },
    stats: {
      clients: 'Clients Satisfaits',
      funded: 'Prêts Accordés',
      satisfaction: 'Taux de Satisfaction',
      years: 'Années d\'Expérience',
    },
    partners: {
      title: 'Nos Partenaires Financiers',
      subtitle: 'Nous collaborons avec un large réseau de banques et institutions financières de premier plan pour vous garantir les meilleures conditions',
      banksNetwork: 'Banques Partenaires',
      loansFunded: 'Prêts Financés',
      yearsExperience: 'Ans d\'Expérience',
      satisfactionRate: 'Taux de Satisfaction',
      networkTitle: 'Un Réseau de Partenaires de Confiance',
      benefits: [
        'Accès à plus de 50 institutions financières pour comparer les meilleures offres',
        'Négociation de taux préférentiels grâce à notre volume d\'affaires',
        'Expertise reconnue dans le courtage de crédit depuis plus de 15 ans'
      ]
    },
    testimonials: {
      title: 'Ce que disent nos clients',
      subtitle: 'Plus de 15 000 particuliers et professionnels nous font confiance',
      reviews: [
        { name: 'Sophie Martin', role: 'Chef d\'entreprise', company: 'Boutique Bio Paris', text: 'Altus Finance Group m\'a permis d\'obtenir un financement rapide pour développer mon commerce. Le processus était simple et transparent, j\'ai reçu les fonds en moins d\'une semaine.', rating: 5 },
        { name: 'Thomas Dubois', role: 'Particulier', company: 'Propriétaire', text: 'Excellent service pour mon prêt immobilier. Les conseillers sont à l\'écoute et m\'ont trouvé le meilleur taux. Je recommande vivement leurs services.', rating: 5 },
        { name: 'Marie Laurent', role: 'Directrice Financière', company: 'Tech Solutions SARL', text: 'Grâce à Altus Finance Group, nous avons pu financer l\'achat de nouveaux équipements. La flexibilité de remboursement et le taux compétitif ont fait la différence.', rating: 5 },
        { name: 'Pierre Moreau', role: 'Artisan', company: 'Boulangerie Traditionnelle', text: 'Un service professionnel et efficace. J\'ai obtenu mon prêt travaux sans complications. L\'équipe m\'a accompagné à chaque étape.', rating: 5 },
        { name: 'Isabelle Rousseau', role: 'Commerçante', company: 'Mode & Accessoires', text: 'Je suis très satisfaite du financement obtenu pour l\'expansion de ma boutique. Altus Finance Group comprend vraiment les besoins des entrepreneurs.', rating: 5 },
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
    auth: {
      title: 'ALTUS',
      subtitle: 'Votre partenaire de confiance pour le financement',
      loginTab: 'Connexion',
      signupTab: 'Inscription',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      fullName: 'Nom complet',
      phone: 'Téléphone',
      companyName: 'Nom de l\'entreprise',
      siret: 'SIRET',
      accountType: 'Type de compte',
      personal: 'Particulier',
      personalLoan: 'Prêt personnel',
      business: 'Professionnel',
      businessLoan: 'Prêt entreprise',
      login: 'Se connecter',
      loggingIn: 'Connexion en cours...',
      signup: 'Créer mon compte',
      signingUp: 'Inscription en cours...',
      backToHome: 'Retour à l\'accueil',
      loginSuccess: 'Connexion réussie !',
      loginSuccessDesc: 'Bienvenue sur ALTUS',
      signupSuccess: 'Inscription réussie !',
      signupSuccessDesc: 'Un email de vérification a été envoyé à votre adresse.',
      loginError: 'Erreur de connexion',
      loginErrorDesc: 'Email ou mot de passe incorrect',
      signupError: 'Erreur',
      signupErrorDesc: 'Une erreur est survenue lors de l\'inscription',
      emailNotVerified: 'Email non vérifié',
      emailPlaceholder: 'jean.dupont@example.com',
      passwordPlaceholder: '••••••••',
      fullNamePlaceholder: 'Jean Dupont',
      phonePlaceholder: '+33 6 12 34 56 78',
      companyNamePlaceholder: 'SARL ALTUS',
      siretPlaceholder: '123 456 789 00010',
      required: 'requis',
      companyRequired: 'Le nom de l\'entreprise est requis pour un compte professionnel',
      emailInvalid: 'Email invalide',
      passwordMinLength: 'Le mot de passe doit contenir au moins 12 caractères',
      passwordUppercase: 'Le mot de passe doit contenir au moins une majuscule',
      passwordLowercase: 'Le mot de passe doit contenir au moins une minuscule',
      passwordNumber: 'Le mot de passe doit contenir au moins un chiffre',
      passwordSpecial: 'Le mot de passe doit contenir au moins un caractère spécial',
      passwordMatch: 'Les mots de passe ne correspondent pas',
      invalidOtp: 'Code invalide ou expiré',
      sessionExpired: 'Session expirée',
      sessionExpiredMessage: 'Votre session a expiré. Veuillez vous reconnecter.',
      accessDenied: 'Accès refusé',
      authenticationRequired: 'Authentification requise',
      verificationError: 'Erreur lors de la vérification',
      verificationInProgress: 'Vérification en cours',
      emailVerified: 'Email vérifié',
      accountActiveAutoLogin: 'Votre compte est maintenant actif. Vous êtes automatiquement connecté et serez redirigé vers votre tableau de bord dans quelques secondes...',
      linkExpiredInvalid: 'Le lien de vérification est peut-être expiré ou invalide.',
      tokenMissing: 'Token de vérification manquant',
      pleaseTwoFactorCode: 'Veuillez entrer votre code d\'authentification à deux facteurs',
      verificationCodeSent: 'Code de vérification envoyé',
      twoFactorAuth: 'Authentification à deux facteurs',
      enterOtpCode: 'Entrez le code à 6 chiffres envoyé à votre email',
      otpExpiresIn: 'Le code expire dans 10 minutes',
      backToLogin: 'Retour à la connexion',
    },
    errors: {
      sessionExpired: 'Session expirée',
      accessDenied: 'Accès refusé',
      authRequired: 'Authentification requise',
      networkError: 'Erreur réseau. Veuillez réessayer.',
      unexpectedError: 'Une erreur inattendue s\'est produite',
      verificationFailed: 'Échec de la vérification',
    },
    bankCard: {
      title: 'Carte Bancaire Professionnelle',
      subtitle: 'Profitez d\'une carte bancaire dédiée à vos transactions professionnelles',
      learnMore: 'En savoir plus',
      viewDetails: 'Voir les détails',
      orderNow: 'Commander maintenant',
      orderCard: 'Commander ma carte',
      orderSuccess: 'Commande de carte virtuelle',
      orderSuccessDesc: 'Votre carte virtuelle est en cours d\'activation. Vous recevrez les détails par email dans quelques instants.',
      modalTitle: 'Carte Bancaire Professionnelle Altus',
      modalSubtitle: 'Une carte bancaire complète pour tous vos besoins professionnels',
      advantagesTitle: 'Avantages de la carte',
      advantages: {
        cashback: 'Cashback 2%',
        cashbackDesc: 'Profitez de 2% de cashback sur tous vos achats professionnels',
        noFees: 'Sans frais cachés',
        noFeesDesc: 'Transparence totale sur tous les frais et commissions',
        protection: 'Protection maximale',
        protectionDesc: 'Assurance achats et protection contre la fraude incluses',
        rewards: 'Programme de récompenses',
        rewardsDesc: 'Cumulez des points sur chaque transaction',
        global: 'Acceptée mondialement',
        globalDesc: 'Utilisable dans plus de 200 pays et territoires',
        support: 'Service client réactif',
        supportDesc: 'Service client réactif durant nos horaires d\'ouverture',
        maxSecurity: 'Sécurité maximale',
        maxSecurityDesc: 'Numéros temporaires avec protection totale',
        instantActivation: 'Activation instantanée',
        instantActivationDesc: 'Utilisable immédiatement',
        noFeesEuro: 'Sans frais',
        noFeesEuroDesc: '0% de frais en zone euro',
        globallyAccepted: 'Acceptée mondialement',
        globallyAcceptedDesc: 'Compatible Apple Pay & Google Pay',
      },
      usageZonesTitle: 'Zones d\'utilisation',
      usageZones: {
        worldwide: 'Paiements internationaux',
        worldwideDesc: 'Acceptée dans tous les commerces et sites web du monde entier',
        online: 'Achats en ligne',
        onlineDesc: 'Sécurisée pour tous vos achats sur internet',
        stores: 'En magasin',
        storesDesc: 'Paiement sans contact et avec code PIN',
        atm: 'Retraits d\'espèces',
        atmDesc: 'Retraits gratuits dans notre réseau de distributeurs partenaires',
      },
      feesTitle: 'Frais et tarification',
      fees: {
        annualFee: 'Cotisation annuelle',
        annualFeeAmount: 'Gratuit la première année, puis 49€/an',
        transactionFee: 'Frais de transaction',
        transactionFeeAmount: '0% en zone euro',
        withdrawalFee: 'Retrait d\'espèces',
        withdrawalFeeAmount: 'Gratuit dans le réseau partenaire',
        foreignFee: 'Paiement en devise étrangère',
        foreignFeeAmount: '1,5% hors zone euro',
      },
      specificationsTitle: 'Caractéristiques techniques',
      specifications: {
        cardType: 'Type de carte',
        cardTypeValue: 'Visa Business Premium',
        creditLimit: 'Plafond',
        creditLimitValue: 'Jusqu\'à 50 000€ par mois',
        validity: 'Validité',
        validityValue: '5 ans',
        delivery: 'Délai de livraison',
        deliveryValue: '5-7 jours ouvrés',
      },
      orderProcess: 'Comment commander',
      orderProcessDesc: 'Commandez votre carte en quelques clics. Après validation de votre demande, vous recevrez votre carte sous 5-7 jours ouvrés.',
      termsConditions: 'Voir les conditions générales',
      close: 'Fermer',
    },
    notifications: {
      loan_request: { title: 'Demande de prêt soumise', message: 'Votre demande de prêt {loanType} de {amount} € a été soumise avec succès. Nous examinerons votre dossier dans les plus brefs délais.' },
      loan_under_review: { title: 'Demande en cours d\'examen', message: 'Votre demande de prêt de {amount} € est actuellement en cours d\'examen par notre équipe.' },
      loan_approved: { title: 'Prêt approuvé', message: 'Votre demande de prêt de {amount} € a été approuvée. Vous pouvez maintenant procéder à la signature du contrat.' },
      loan_rejected: { title: 'Prêt refusé', message: 'Votre demande de prêt a été refusée. Raison : {reason}' },
      loan_contract_generated: { title: 'Contrat de prêt disponible', message: 'Votre contrat de prêt de {amount} € est maintenant disponible. Veuillez le télécharger, le signer et le renvoyer.' },
      loan_contract_signed: { title: 'Contrat signé reçu', message: 'Nous avons bien reçu votre contrat signé pour le prêt de {amount} €. Votre prêt sera traité dans les plus brefs délais.' },
      loan_disbursed: { title: 'Fonds déboursés', message: 'Les fonds de votre prêt de {amount} € ont été déboursés avec succès sur votre compte.' },
      transfer_initiated: { title: 'Transfert initié', message: 'Votre transfert de {amount} € vers {recipientName} a été initié et est en cours de traitement.' },
      transfer_completed: { title: 'Transfert terminé', message: 'Votre transfert de {amount} € a été complété avec succès.' },
      transfer_approved: { title: 'Transfert approuvé', message: 'Votre demande de transfert a été approuvée par l\'administration.' },
      transfer_suspended: { title: 'Transfert suspendu', message: 'Votre transfert a été suspendu. Raison : {reason}' },
      code_issued: { title: 'Code de validation émis', message: 'Un nouveau code de validation (#{sequence}) a été émis pour votre transfert. Vérifiez vos emails.' },
      kyc_approved: { title: 'Documents KYC approuvés', message: 'Vos documents ont été vérifiés et approuvés. Votre compte est maintenant actif.' },
      kyc_rejected: { title: 'Documents KYC refusés', message: 'Vos documents ont été refusés. Raison : {reason}. Veuillez soumettre de nouveaux documents.' },
      fee_added: { title: 'Nouveaux frais', message: 'Des frais de {amount} € ont été ajoutés à votre compte. Raison : {reason}' },
      account_status_changed: { title: 'Statut du compte modifié', message: 'Le statut de votre compte a été modifié : {newStatus}. {reason}' },
      admin_message_sent: { title: 'Nouveau message de l\'administration', message: '{subject}' },
      general: { title: 'Notification', message: 'Vous avez une nouvelle notification.' },
      twoFactorSuggestion: { title: 'Sécurisez votre compte', message: 'Activez l\'authentification à deux facteurs pour renforcer la sécurité de votre compte.' },
      markAllRead: 'Tout marquer comme lu',
      markAsRead: 'Marquer comme lu',
      deleteNotification: 'Supprimer',
    },
    dialogs: {
      newLoan: {
        title: 'Nouvelle demande de prêt',
        subtitle: 'Complétez les informations pour votre demande',
        subtitleFirstRequest: 'Première demande : veuillez fournir vos documents d\'identité et compléter le formulaire',
        subtitleRegular: 'Remplissez le formulaire pour soumettre une nouvelle demande de prêt',
        loanType: 'Type de prêt',
        selectLoanType: 'Sélectionnez le type de prêt',
        amount: 'Montant',
        enterAmount: 'Entrez le montant souhaité',
        duration: 'Durée',
        selectDuration: 'Sélectionnez la durée',
        months: 'mois',
        estimatedRate: 'Taux estimé',
        monthlyPayment: 'Mensualité estimée',
        totalRepayment: 'Montant total à rembourser',
        firstRequestAlert: 'Première demande :',
        firstRequestAlertDesc: 'Vos documents seront vérifiés une seule fois. Les demandes suivantes ne nécessiteront plus de documents.',
        addBankAccount: 'Ajouter un compte bancaire',
        selectAccount: 'Sélectionnez un compte',
        bankName: 'Nom de la banque',
        bankNamePlaceholder: 'Ex: BNP Paribas',
        accountLabel: 'Libellé du compte',
        accountLabelPlaceholder: 'Ex: Compte courant principal',
        iban: 'IBAN',
        ibanPlaceholder: 'FR76 1234 5678 9012 3456 7890 123',
        bic: 'BIC/SWIFT',
        bicPlaceholder: 'BNPAFRPP',
        uploadDocuments: 'Télécharger vos documents',
        kycDocumentsTab: 'Documents KYC',
        additionalDocumentsTab: 'Documents supplémentaires',
        loanDetailsTab: 'Détails du prêt',
        identity: 'Pièce d\'identité',
        proof_of_address: 'Justificatif de domicile',
        income_proof: 'Justificatif de revenus',
        business_registration: 'Extrait Kbis',
        financial_statements: 'Bilans financiers',
        tax_returns: 'Déclaration d\'impôts',
        requiredDocuments: 'Documents requis',
        identityDoc: 'Pièce d\'identité (Carte d\'identité ou Passeport)',
        addressProof: 'Justificatif de domicile (moins de 3 mois)',
        bankStatement: 'Relevé bancaire (derniers 3 mois)',
        uploadingInProgress: 'Envoi en cours...',
        documentsUploadedSuccess: 'document(s) téléchargé(s) avec succès',
        submit: 'Soumettre la demande',
        submitting: 'Soumission...',
        cancel: 'Annuler',
        loanTypes: {
          personal: 'Prêt personnel',
          auto: 'Prêt auto',
          mortgage: 'Prêt immobilier',
          green: 'Prêt vert',
          renovation: 'Prêt rénovation',
          student: 'Prêt étudiant',
          business: 'Prêt professionnel',
          cashFlow: 'Crédit de trésorerie',
          equipment: 'Financement équipement',
          commercialProperty: 'Prêt immobilier pro',
          lineOfCredit: 'Ligne de crédit',
          vehicleFleet: 'Crédit véhicule pro',
        },
        errors: {
          amountMustBePositive: 'Le montant doit être supérieur à 0',
          amountMaxExceeded: 'Le montant ne peut pas dépasser 1 000 000 €',
          rateMustBePositive: 'Le taux doit être positif',
          rateMaxExceeded: 'Le taux ne peut pas dépasser 20%',
          durationMustBePositive: 'La durée doit être supérieure à 0',
          durationMaxExceeded: 'La durée ne peut pas dépasser 360 mois',
          documentsRequired: 'Vous devez télécharger vos documents KYC pour votre première demande',
        },
        success: {
          loanSubmitted: 'Demande de prêt envoyée',
          loanSubmittedDesc: 'Votre demande de prêt a été soumise avec succès.',
          documentsUploaded: 'Documents téléchargés',
          documentsUploadedDesc: 'document(s) envoyé(s) avec succès.',
        },
        error: {
          loanError: 'Erreur',
          loanErrorDesc: 'Impossible de créer la demande de prêt.',
          partialUploadError: 'Erreur partielle',
          partialUploadErrorDesc: 'document(s) n\'ont pas pu être téléchargés.',
        },
      },
      transfer: {
        title: 'Transférer des fonds',
        subtitle: 'Initiez un transfert sécurisé vers un compte externe',
        selectAccount: 'Sélectionnez un compte',
        noAccountsAvailable: 'Aucun compte bancaire disponible',
        amount: 'Montant',
        enterAmount: 'Entrez le montant',
        amountPlaceholder: '50000',
        recipient: 'Destinataire',
        recipientPlaceholder: 'Nom de l\'entreprise ou du bénéficiaire',
        feesDescription: 'Des frais de transfert de 25€ seront appliqués. Votre transfert sera traité dans les 2-3 jours ouvrables.',
        availableFunds: 'Fonds disponibles',
        feesAndProcessing: 'Frais de 2% • Traitement sous 24-48h',
        submit: 'Initier le transfert',
        submitting: 'Traitement...',
        creating: 'Création...',
        createTransfer: 'Créer le transfert',
        cancel: 'Annuler',
        transferSuccess: 'Transfert initié',
        transferSuccessDesc: 'Votre demande de transfert a été créée avec succès.',
        transferError: 'Erreur',
        transferErrorDesc: 'Impossible de créer le transfert.',
      },
      loanRequestModal: {
        title: 'Demander un prêt',
        description: 'Remplissez le formulaire ci-dessous et joignez les documents requis pour soumettre votre demande de prêt.',
        loanType: 'Type de prêt',
        selectLoanTypePlaceholder: 'Sélectionnez un type de prêt',
        loanAmount: 'Montant du prêt',
        duration: 'Durée',
        durationMonths: 'Durée (mois)',
        months: 'mois',
        interestRate: 'Taux d\'intérêt',
        estimatedMonthlyPayment: 'Paiement mensuel estimé',
        requiredDocuments: 'Documents requis',
        requiredDocumentsDescription: 'Veuillez joindre tous les documents marqués comme requis pour finaliser votre demande.',
        required: 'Requis',
        optional: 'Optionnel',
        attach: 'Joindre',
        cancel: 'Annuler',
        submit: 'Envoyer la demande',
        validationError: 'Veuillez sélectionner un type de prêt',
        requestSent: 'Demande envoyée',
        requestSentDescription: 'Votre demande de prêt a été envoyée avec succès. Vous recevrez une réponse très bientôt.',
        error: 'Erreur',
        errorDescription: 'Une erreur est survenue lors de l\'envoi de votre demande.',
        fileTooLarge: 'Fichier trop volumineux',
        fileTooLargeDescription: 'La taille maximale par fichier est de 10MB.',
        missingDocuments: 'Documents manquants',
        missingDocumentsPrefix: 'Veuillez joindre tous les documents requis:',
      },
      cardTerms: {
        title: 'Conditions générales de la carte bancaire',
        acceptTerms: 'Accepter les conditions',
        declineTerms: 'Refuser',
      },
      welcome: {
        title: 'Bienvenue sur ALTUS',
        description: 'Votre compte a été créé avec succès',
        accountTypeTitle: 'Votre type de compte',
        individualAccount: 'Compte Particulier',
        businessAccount: 'Compte Professionnel',
        individualAccess: 'Accès aux services de financement personnel',
        businessAccess: 'Accès complet aux services de financement d\'entreprise',
        availableOffers: 'Offres disponibles pour vous',
        getStarted: 'Commencer',
        dialog: {
          title: 'Bienvenue sur Altus Finance Group !',
          description: 'Nous sommes ravis de vous accompagner dans vos projets de financement.',
        },
        account: {
          badgeLabel: 'Votre compte :',
          individual: {
            description: 'Vous avez accès aux offres de prêt pour particuliers. Ces offres sont spécialement conçues pour vos besoins personnels et projets individuels.',
          },
          business: {
            description: 'Vous avez accès aux offres de prêt professionnels. Ces offres sont spécialement conçues pour le développement et la croissance de votre entreprise.',
          },
        },
        offers: {
          title: 'Offres disponibles pour vous',
          individual: [
            'Prêt Personnel',
            'Prêt Immobilier',
            'Crédit Auto',
            'Prêt Étudiant',
            'Prêt Vert',
            'Prêt Travaux',
          ],
          business: [
            'Prêt Professionnel',
            'Crédit de Trésorerie',
            'Financement Équipement',
            'Prêt Immobilier Pro',
            'Ligne de Crédit',
            'Crédit Véhicule Pro',
          ],
        },
        important: {
          title: 'Important :',
          message: 'Seules les offres mentionnées ci-dessus vous seront accessibles dans votre espace.',
          individualSwitch: ' Si vous souhaitez accéder aux offres professionnelles, vous devrez créer un compte entreprise.',
          businessSwitch: ' Si vous souhaitez accéder aux offres pour particuliers, vous devrez créer un compte personnel.',
        },
        cta: {
          primary: 'Compris, commencer',
          pending: 'Chargement...',
        },
      },
      transactionHistory: {
        title: 'Historique des transactions',
        type: 'Type',
        amount: 'Montant',
        date: 'Date',
        status: 'Statut',
        noTransactions: 'Aucune transaction trouvée',
        close: 'Fermer',
      },
    },
    verify: {
      verifying: 'Vérification en cours...',
      success: 'Email vérifié !',
      successMessage: 'Votre email a été vérifié avec succès. Vous allez être redirigé vers le tableau de bord.',
      goToDashboard: 'Aller au tableau de bord',
      error: 'Erreur de vérification',
      errorMessage: 'Le lien de vérification est invalide ou a expiré.',
      tryAgain: 'Réessayer',
      backToSignup: 'Retour à l\'inscription',
      backToHome: 'Retour à l\'accueil',
    },
    forgotPassword: {
      title: 'Mot de passe oublié',
      description: 'Réinitialisez votre mot de passe',
      instructions: 'Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.',
      emailLabel: 'Adresse email',
      emailPlaceholder: 'votre.email@exemple.com',
      sendResetLink: 'Envoyer le lien',
      sending: 'Envoi...',
      backToLogin: 'Retour à la connexion',
      emailSent: 'Email envoyé',
      emailSentDesc: 'Un lien de réinitialisation a été envoyé à votre adresse email.',
      error: 'Erreur',
      errorDesc: 'Une erreur s\'est produite. Veuillez réessayer.',
    },
    resetPassword: {
      title: 'Réinitialiser le mot de passe',
      description: 'Créez un nouveau mot de passe',
      newPassword: 'Nouveau mot de passe',
      newPasswordPlaceholder: 'Entrez votre nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      confirmPasswordPlaceholder: 'Confirmez votre nouveau mot de passe',
      requirements: 'Exigences du mot de passe :',
      minLength: 'Au moins 12 caractères',
      uppercase: 'Une lettre majuscule',
      lowercase: 'Une lettre minuscule',
      number: 'Un chiffre',
      specialChar: 'Un caractère spécial',
      passwordStrength: 'Force du mot de passe',
      weak: 'Faible',
      medium: 'Moyen',
      strong: 'Fort',
      veryStrong: 'Très fort',
      resetPassword: 'Réinitialiser',
      resetting: 'Réinitialisation...',
      success: 'Succès',
      successMessage: 'Votre mot de passe a été réinitialisé avec succès.',
      error: 'Erreur',
      invalidToken: 'Le lien de réinitialisation est invalide ou a expiré.',
      passwordMismatch: 'Les mots de passe ne correspondent pas.',
    },
    twoFactorAuth: {
      setup: {
        title: 'Configurer l\'authentification à deux facteurs',
        description: 'Renforcez la sécurité de votre compte',
        step1: 'Étape 1: Télécharger l\'application',
        step1Description: 'Téléchargez Google Authenticator ou Authy sur votre téléphone',
        step2: 'Étape 2: Scanner le QR code',
        step2Description: 'Scannez ce QR code avec votre application d\'authentification',
        step3: 'Étape 3: Vérifier le code',
        step3Description: 'Entrez le code à 6 chiffres généré par l\'application',
        qrCodeInstructions: 'Scannez ce QR code avec votre application d\'authentification',
        cantScanQR: 'Impossible de scanner ? Entrez ce code manuellement :',
        secretKey: 'Clé secrète',
        enterCode: 'Entrez le code à 6 chiffres',
        codePlaceholder: '000000',
        verify: 'Activer 2FA',
        verifying: 'Vérification...',
        cancel: 'Annuler',
        successTitle: '2FA activé',
        successMessage: 'L\'authentification à deux facteurs a été activée avec succès.',
        errorTitle: 'Erreur',
        errorMessage: 'Le code est invalide. Veuillez réessayer.',
      },
      disable: {
        title: 'Désactiver l\'authentification à deux facteurs',
        description: 'Entrez votre mot de passe pour confirmer',
        enterPassword: 'Mot de passe',
        passwordPlaceholder: 'Entrez votre mot de passe',
        disable: 'Désactiver 2FA',
        disabling: 'Désactivation...',
        cancel: 'Annuler',
        successTitle: '2FA désactivé',
        successMessage: 'L\'authentification à deux facteurs a été désactivée.',
        errorTitle: 'Erreur',
        errorMessage: 'Mot de passe incorrect.',
      },
      login: {
        title: 'Authentification à deux facteurs',
        description: 'Entrez le code de votre application d\'authentification',
        enterCode: 'Code à 6 chiffres',
        codePlaceholder: '000000',
        verify: 'Vérifier',
        verifying: 'Vérification...',
        cancel: 'Annuler',
        errorTitle: 'Erreur',
        errorMessage: 'Code invalide. Veuillez réessayer.',
      },
    },
    bankAccounts: {
      title: 'Comptes bancaires',
      description: 'Gérez vos comptes bancaires externes',
      addAccount: 'Ajouter un compte',
      noAccountsTitle: 'Aucun compte bancaire',
      noAccountsDescription: 'Ajoutez un compte bancaire pour pouvoir effectuer des transferts.',
      accountLabel: 'Libellé',
      bankName: 'Banque',
      iban: 'IBAN',
      bic: 'BIC',
      createdAt: 'Ajouté le',
      actions: 'Actions',
      delete: 'Supprimer',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce compte ?',
      deleteSuccess: 'Compte supprimé avec succès',
      addAccountTitle: 'Ajouter un compte bancaire',
      addAccountDescription: 'Ajoutez un compte bancaire externe pour les transferts',
      accountLabelLabel: 'Libellé du compte',
      accountLabelPlaceholder: 'Ex: Compte courant principal',
      accountLabelRequired: 'Le libellé est requis',
      bankNameLabel: 'Nom de la banque',
      bankNamePlaceholder: 'Ex: BNP Paribas',
      bankNameRequired: 'Le nom de la banque est requis',
      ibanLabel: 'IBAN',
      ibanPlaceholder: 'FR76 1234 5678 9012 3456 7890 123',
      ibanRequired: 'L\'IBAN est requis',
      invalidIban: 'Format IBAN invalide',
      bicLabel: 'BIC/SWIFT',
      bicPlaceholder: 'BNPAFRPP',
      invalidBic: 'Format BIC invalide',
      submit: 'Ajouter le compte',
      submitting: 'Ajout...',
      cancel: 'Annuler',
      addSuccess: 'Compte ajouté',
      addSuccessDesc: 'Le compte bancaire a été ajouté avec succès.',
      addError: 'Erreur lors de l\'ajout du compte',
      addFirstAccount: 'Ajouter votre premier compte',
      deleteSuccessDesc: 'Le compte bancaire a été supprimé avec succès.',
      deleteError: 'Impossible de supprimer le compte bancaire.',
    },
    welcomeModal: {
      title: 'Bienvenue sur ALTUS',
      description: 'Votre compte a été créé avec succès',
      accountType: 'Votre type de compte',
      individualAccount: 'Compte Particulier',
      businessAccount: 'Compte Professionnel',
      individualAccess: 'Accès aux services de financement personnel',
      businessAccess: 'Accès complet aux services de financement d\'entreprise',
      availableOffers: 'Offres disponibles pour vous',
      getStarted: 'Commencer',
    },
    calculator: {
      title: 'Calculateur d\'amortissement',
      description: 'Simulez votre plan de remboursement',
      loanAmount: 'Montant du prêt',
      interestRate: 'Taux d\'intérêt annuel (%)',
      loanDuration: 'Durée du prêt',
      months: 'mois',
      calculate: 'Calculer',
      results: 'Résultats',
      monthlyPayment: 'Mensualité',
      totalInterest: 'Intérêts totaux',
      totalAmount: 'Montant total',
      amortizationSchedule: 'Tableau d\'amortissement',
      month: 'Mois',
      payment: 'Paiement',
      principal: 'Capital',
      interest: 'Intérêts',
      balance: 'Solde restant',
      downloadSchedule: 'Télécharger le tableau',
    },
    amortization: {
      interactiveTitle: 'Tableau d\'amortissement interactif',
      interactiveDescription: 'Sélectionnez un prêt actif et personnalisez les paramètres pour voir l\'impact sur les remboursements',
      calculatorTitle: 'Calculateur d\'Amortissement Interactif',
      calculatorDescription: 'Simulez votre plan de remboursement et visualisez l\'évolution de votre prêt',
      selectActiveLoan: 'Sélectionner un prêt actif',
      chooseLoan: 'Choisissez un prêt...',
      loanOf: 'Prêt de',
      at: 'à',
      loanAmount: 'Montant du prêt (€)',
      annualInterestRate: 'Taux d\'intérêt annuel (%)',
      duration: 'Durée (années)',
      years: 'années',
      calculateAmortization: 'Calculer l\'amortissement',
      calculatePlan: 'Calculer le plan d\'amortissement',
      monthlyPayment: 'Paiement mensuel',
      totalPayment: 'Total à rembourser',
      totalInterest: 'Total des intérêts',
      table: 'Tableau',
      evolution: 'Évolution',
      cumulative: 'Cumul',
      breakdown: 'Répartition',
      month: 'Mois',
      payment: 'Paiement',
      principal: 'Principal',
      interest: 'Intérêts',
      balance: 'Solde',
      amount: 'Montant (€)',
      monthLabel: 'Mois',
      noActiveLoans: 'Aucun prêt actif',
      noActiveLoansDesc: 'Vous n\'avez aucun prêt actif pour le moment. Demandez un nouveau prêt pour utiliser cette fonctionnalité.',
      loanType: 'Type de prêt',
      selectType: 'Sélectionnez le type',
      personal: 'Personnel',
      business: 'Professionnel',
      realEstate: 'Immobilier',
      automaticallyCalculated: 'Calculé automatiquement',
      rateInfo: 'Le taux d\'intérêt est calculé automatiquement en fonction du montant et du type de prêt. Toutes les demandes de prêt nécessitent une approbation administrative.',
      requestLoan: 'Demander ce prêt',
      sending: 'Envoi...',
      chart: 'Graphique',
      balanceEvolution: 'Évolution du solde et des paiements',
      principalVsInterest: 'Répartition Principal vs Intérêts',
      monthlyRepaymentPlan: 'Plan de remboursement mensuel',
      remainingBalance: 'Solde restant',
      errors: {
        amountPositive: 'Le montant du prêt doit être supérieur à 0 €',
        amountMax: 'Le montant du prêt ne peut pas dépasser 10 000 000 €',
        rateNegative: 'Le taux d\'intérêt ne peut pas être négatif',
        rateMax: 'Le taux d\'intérêt ne peut pas dépasser 100%',
        durationPositive: 'La durée du prêt doit être supérieure à 0 année',
        durationMax: 'La durée du prêt ne peut pas dépasser 50 années',
      },
    },
    kycDocuments: {
      title: 'Documents KYC',
      description: 'Téléchargez vos documents d\'identification',
      uploadDocuments: 'Télécharger vos documents',
      documentType: 'Type de document',
      selectDocumentType: 'Sélectionnez le type',
      identity: 'Pièce d\'identité',
      proof_of_address: 'Justificatif de domicile',
      income_proof: 'Justificatif de revenus',
      business_registration: 'Extrait Kbis',
      financial_statements: 'Bilans financiers',
      tax_returns: 'Déclaration d\'impôts',
      chooseFile: 'Choisir un fichier',
      upload: 'Télécharger',
      uploading: 'Téléchargement...',
      uploadSuccess: 'Document téléchargé',
      uploadSuccessDesc: 'Votre document a été téléchargé avec succès.',
      uploadError: 'Erreur lors du téléchargement',
      status: 'Statut',
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Refusé',
      uploadedAt: 'Téléchargé le',
      noDocuments: 'Aucun document téléchargé',
    },
    transferFlow: {
      backToDashboard: 'Retour au tableau de bord',
      form: {
        title: 'Nouveau transfert',
        subtitle: 'Initiez un transfert sécurisé vers un compte externe',
        amountLabel: 'Montant (EUR)',
        amountPlaceholder: '10000',
        amountHelper: 'Fonds disponibles pour le transfert',
        accountLabel: 'Compte externe (optionnel)',
        accountPlaceholder: 'Sélectionner un compte',
        externalAccountLabel: 'Sélectionner un compte bancaire externe',
        selectAccountPlaceholder: 'Choisissez un compte enregistré',
        noAccount: 'Aucun compte enregistré',
        recipientLabel: 'Bénéficiaire',
        recipientPlaceholder: 'Nom du bénéficiaire',
        initiateButton: 'Initier le transfert',
        initiating: 'Initiation...',
      },
      verification: {
        title: 'Vérification du transfert',
        subtitle: 'Veuillez patienter pendant la vérification de votre transfert',
        doNotClose: 'Ne fermez pas cette page',
        doNotCloseDesc: 'Votre transfert est en cours de vérification par notre système sécurisé. Cette opération prend environ 45 secondes.',
        progressLabel: 'Progression de la vérification',
        verificationSteps: 'Étapes de vérification',
        step1: 'Vérification du compte émetteur',
        step2: 'Validation du montant et des frais',
        step3: 'Contrôle de sécurité anti-fraude',
        step4: 'Préparation du transfert sécurisé',
      },
      validation: {
        title: 'Validation du transfert',
        subtitle: 'Code {sequence} / {total}',
        demoCodeLabel: 'Code de démonstration :',
        codeLabel: 'Code de validation (6 chiffres)',
        codePlaceholder: '000000',
        codeHelpText: 'Un code a été envoyé à votre email',
        validateButton: 'Valider',
        validating: 'Validation...',
        resendButton: 'Renvoyer',
        historyLabel: 'Historique',
      },
      progress: {
        titlePaused: 'Transfert en pause',
        titleInProgress: 'Transfert en cours',
        securityVerificationTitle: 'Vérification de sécurité',
        transferProcessingTitle: 'Traitement du transfert',
        toPrefix: 'vers',
        securityVerificationRequired: 'Vérification de sécurité requise',
        enterVerificationCode: 'Veuillez entrer le code de vérification',
        codeFromAdvisor: 'Code reçu de votre conseiller',
        validationCodeLabel: 'Code de validation',
        enterCodePlaceholder: 'Entrez le code à 6 chiffres',
        validating: 'Validation en cours...',
        validateAndContinue: 'Valider et continuer',
        processingTransfer: 'Traitement du transfert en cours',
        doNotCloseProcessing: 'Ne fermez pas cette fenêtre pendant le traitement',
        amountLabel: 'Montant: {amount} EUR vers {recipient}',
        progressLabel: 'Progression',
        pauseTitle: 'Code de déblocage requis à {percent}%',
        pauseDescription: 'Veuillez contacter le service client pour obtenir le code de déblocage de votre transfert.',
        pauseCodeLabel: 'Code de déblocage',
        pauseCodePlaceholder: 'Entrez le code',
        validatePauseCode: 'Valider le code',
        statusLabel: 'État actuel',
        statusCompleted: 'Transfert terminé !',
        statusProcessing: 'Traitement en cours par notre système bancaire...',
        eventsLabel: 'Événements',
        circularProgressTitle: 'Vérification du transfert',
        circularProgressSubtitle: 'Votre opération est en cours de traitement sécurisé.',
      },
      complete: {
        title: 'Transfert complété',
        subtitle: 'Votre transfert a été effectué avec succès',
        successMessage: 'Votre transfert a été traité avec succès',
        referenceLabel: 'Référence',
        returnToDashboard: 'Retour au tableau de bord',
        amountLabel: 'Montant',
        recipientLabel: 'Bénéficiaire',
        feesLabel: 'Frais',
      },
      toast: {
        transferInProgress: 'Transfert en cours',
        transferAlreadyInProgress: 'Un transfert est déjà en cours',
        transferInitiated: 'Transfert initié avec succès',
        selectExternalAccount: 'Veuillez sélectionner un compte externe',
        noActiveLoan: 'Aucun prêt actif disponible pour le transfert',
        initiated: 'Transfert initié',
        initiatedDesc: 'Vérification de votre transfert en cours...',
        error: 'Erreur',
        errorInitiation: 'Échec de l\'initiation du transfert',
        codeValidated: 'Code validé',
        codeInvalid: 'Code invalide',
        codeInvalidDesc: 'Le code est incorrect ou expiré',
        codeSent: 'Code envoyé',
        codeSentDesc: 'Code {sequence} envoyé avec succès',
        approved: 'Transfert approuvé',
        approvedDesc: 'Votre transfert est approuvé et en cours de traitement.',
        fieldsRequired: 'Champs requis',
        fieldsRequiredDesc: 'Veuillez remplir tous les champs',
        invalidCode: 'Code invalide',
        invalidCodeDesc: 'Le code doit contenir 6 chiffres',
        codeRequired: 'Code requis',
        codeRequiredDesc: 'Veuillez entrer le code de déblocage',
        unblocked: 'Transfert débloqué',
        unblockedDesc: 'Le transfert a été débloqué avec succès',
      },
    },
    loanOffers: {
      pageTitle: 'Nos offres de prêt',
      pageSubtitle: 'Découvrez toutes nos solutions de financement pour particuliers et professionnels',
      accountInfo: 'Compte {accountType} :',
      individualTab: 'Prêts Particuliers',
      businessTab: 'Prêts Professionnels',
      individual: 'Particulier',
      business: 'Professionnel',
      amountLabel: 'Montant',
      rateLabel: 'Taux',
      durationLabel: 'Durée',
      advantagesLabel: 'Avantages',
      requestButton: 'Demander ce prêt',
      loginToRequest: 'Se connecter pour demander',
      types: {
        personalLoan: {
          title: 'Prêt Personnel',
          description: 'Financement flexible pour tous vos projets personnels',
          features: ['Réponse rapide', 'Sans justificatif d\'utilisation', 'Remboursement flexible'],
        },
        mortgageLoan: {
          title: 'Prêt Immobilier',
          description: 'Financez l\'achat de votre résidence principale ou secondaire',
          features: ['Taux fixe ou variable', 'Jusqu\'à 80% du montant', 'Assurance incluse'],
        },
        autoLoan: {
          title: 'Crédit Auto',
          description: 'Achetez votre véhicule neuf ou d\'occasion',
          features: ['Déblocage rapide', 'Possibilité de remboursement anticipé', 'Assurance optionnelle'],
        },
        studentLoan: {
          title: 'Prêt Étudiant',
          description: 'Financez vos études avec des conditions avantageuses',
          features: ['Différé de remboursement', 'Taux préférentiels', 'Sans caution parentale possible'],
        },
        greenLoan: {
          title: 'Prêt Vert',
          description: 'Financez vos projets de rénovation énergétique',
          features: ['Taux réduit', 'Éligible aux aides d\'État', 'Financement éco-responsable'],
        },
        renovationLoan: {
          title: 'Prêt Travaux',
          description: 'Rénovez et améliorez votre logement',
          features: ['Sans hypothèque jusqu\'à 75k€', 'Déblocage progressif possible', 'Déduction fiscale possible'],
        },
        businessLoan: {
          title: 'Prêt Professionnel',
          description: 'Financement pour vos projets d\'entreprise, développement et trésorerie',
          features: ['Réponse sous 48h', 'Taux fixe', 'Remboursement flexible'],
        },
        cashFlowCredit: {
          title: 'Crédit de Trésorerie',
          description: 'Solution rapide pour gérer vos besoins en fonds de roulement',
          features: ['Déblocage rapide', 'Sans garantie jusqu\'à 50k€', 'Flexible'],
        },
        equipmentFinancing: {
          title: 'Financement Équipement',
          description: 'Achetez vos équipements professionnels et matériels',
          features: ['Jusqu\'à 100% du montant', 'Option leasing', 'Déduction fiscale'],
        },
        commercialPropertyLoan: {
          title: 'Prêt Immobilier Pro',
          description: 'Acquérez vos locaux, bureaux ou entrepôts professionnels',
          features: ['Durée longue', 'Apport à partir de 20%', 'Taux compétitif'],
        },
        lineOfCredit: {
          title: 'Ligne de Crédit',
          description: 'Crédit renouvelable pour vos besoins ponctuels',
          features: ['Disponible 24/7', 'Remboursement libre', 'Renouvellement auto'],
        },
        vehicleFleetLoan: {
          title: 'Crédit Véhicule Pro',
          description: 'Financez votre flotte automobile ou véhicules utilitaires',
          features: ['LOA ou crédit classique', 'Option rachat', 'Assurance incluse'],
        },
      },
    },
    cardTermsContent: {
      title: 'Conditions Générales d\'Utilisation - Carte Virtuelle ALTUS',
      lastUpdated: 'Dernière mise à jour : Novembre 2025',
      section1: {
        title: '1. OBJET ET CHAMP D\'APPLICATION',
        content: 'Les présentes conditions générales (ci-après « CGU ») régissent l\'utilisation de la carte bancaire virtuelle ALTUS (ci-après « la Carte Virtuelle »), proposée par ALTUS Finance Group aux clients titulaires d\'un compte ALTUS (ci-après « le Titulaire »). La Carte Virtuelle est un moyen de paiement dématérialisé lié à votre compte ALTUS.',
      },
      section2: {
        title: '2. DESCRIPTION DU SERVICE',
        subtitle1: '2.1 Nature de la Carte Virtuelle',
        content1: 'La Carte Virtuelle est une carte de paiement dématérialisée comportant un numéro de carte à 16 chiffres, une date d\'expiration et un cryptogramme visuel (CVV). Elle fonctionne comme une carte bancaire physique mais existe uniquement sous forme électronique.',
        subtitle2: '2.2 Type de Carte',
        item1: 'Carte virtuelle permanente : coordonnées fixes pendant toute sa durée de validité (3 ans)',
        item2: 'Carte virtuelle éphémère : coordonnées temporaires avec montant et durée paramétrables',
      },
      section3: {
        title: '3. CONDITIONS D\'ÉLIGIBILITÉ',
        content: 'Pour obtenir une Carte Virtuelle, le Titulaire doit :',
        list: [
          'Être client ALTUS avec un compte actif et approvisionné',
          'Avoir complété la vérification d\'identité (KYC)',
          'Ne pas être en situation de découvert non autorisé',
          'Avoir activé l\'authentification forte (double facteur)',
          'Accepter les présentes CGU et les Conditions Tarifaires',
        ],
      },
      section4: {
        title: '4. ACTIVATION ET UTILISATION',
        subtitle1: '4.1 Activation',
        content1: 'La Carte Virtuelle est activée instantanément dès sa création via l\'application ou l\'espace client ALTUS. Le Titulaire reçoit immédiatement les coordonnées complètes de la carte.',
        subtitle2: '4.2 Utilisations autorisées',
        list1: [
          'Paiements sur tous les sites marchands en ligne acceptant Visa/Mastercard',
          'Paiements récurrents et abonnements (carte permanente uniquement)',
          'Achats sur sites internationaux',
          'Paiements sans contact en magasin (si ajoutée à Apple Pay/Google Pay)',
        ],
        subtitle3: '4.3 Limitations',
        list2: [
          'Pas de retraits d\'espèces aux distributeurs automatiques',
          'Présentation physique impossible (location de voiture, certains hôtels)',
          'Certains prestataires peuvent refuser les cartes virtuelles',
        ],
      },
      section5: {
        title: '5. SÉCURITÉ ET PROTECTION',
        subtitle1: '5.1 Sécurité renforcée',
        list1: [
          'Les coordonnées de votre carte bancaire physique ne sont jamais exposées',
          'Possibilité de verrouiller/déverrouiller instantanément la carte',
          'Suppression définitive en un clic',
          'Protection 3D Secure sur toutes les transactions',
          'CVV dynamique pour une sécurité maximale',
        ],
        subtitle2: '5.2 Obligations du Titulaire',
        content2: 'Le Titulaire s\'engage à conserver les coordonnées de sa Carte Virtuelle de manière confidentielle et à ne pas les communiquer à des tiers. En cas de suspicion de fraude, le Titulaire doit immédiatement verrouiller ou supprimer la carte via son espace client.',
        subtitle3: '5.3 Garanties et assurances',
        content3: 'La Carte Virtuelle bénéficie des mêmes garanties que votre carte physique, incluant la protection contre la fraude, l\'assurance achats et la garantie de livraison conforme.',
      },
      section6: {
        title: '6. PLAFONDS ET LIMITES',
        content: 'Les plafonds de paiement de la Carte Virtuelle sont identiques à ceux de votre carte principale ALTUS :',
        list: [
          'Plafond mensuel : jusqu\'à 50 000 € selon votre profil',
          'Plafond par transaction : jusqu\'à 10 000 €',
          'Possibilité d\'ajuster temporairement les plafonds depuis l\'application',
        ],
        content2: 'Pour les cartes éphémères, vous définissez le montant maximum et la durée de validité lors de la création.',
      },
      section7: {
        title: '7. TARIFICATION',
        list: [
          'Création de carte virtuelle : Gratuit',
          'Frais de transaction en zone euro : 0%',
          'Paiements hors zone euro : 1,5% du montant',
          'Cotisation annuelle : Gratuit',
          'Verrouillage/Déverrouillage : Gratuit et illimité',
        ],
      },
      section8: {
        title: '8. DÉBIT ET RELEVÉ',
        content: 'Toutes les opérations effectuées avec la Carte Virtuelle sont débitées en temps réel sur votre compte ALTUS. Elles apparaissent immédiatement dans votre historique de transactions et sur vos relevés mensuels.',
      },
      section9: {
        title: '9. OPPOSITION ET RÉSILIATION',
        subtitle1: '9.1 Verrouillage temporaire',
        content1: 'Vous pouvez verrouiller votre Carte Virtuelle à tout moment depuis votre espace client. Le déverrouillage est instantané.',
        subtitle2: '9.2 Suppression définitive',
        content2: 'La suppression d\'une Carte Virtuelle est immédiate et irréversible. Les abonnements liés à cette carte seront automatiquement refusés. Il est recommandé de mettre à jour vos informations de paiement chez les commerçants concernés avant suppression.',
        subtitle3: '9.3 En cas de fraude',
        content3: 'En cas de perte ou vol présumé des coordonnées, supprimez immédiatement la carte depuis votre application et contactez notre service client au +33 1 XX XX XX XX (disponible 24h/24, 7j/7).',
      },
      section10: {
        title: '10. RESPONSABILITÉ',
        content: 'ALTUS ne pourra être tenu responsable en cas de :',
        list: [
          'Refus d\'un commerçant d\'accepter la Carte Virtuelle',
          'Interruption temporaire du service pour maintenance',
          'Utilisation frauduleuse résultant d\'une négligence du Titulaire',
          'Litiges commerciaux entre le Titulaire et un commerçant',
        ],
        content2: 'Le Titulaire est entièrement responsable de l\'utilisation de sa Carte Virtuelle et des opérations effectuées jusqu\'à la notification d\'une utilisation frauduleuse.',
      },
      section11: {
        title: '11. DURÉE ET MODIFICATION',
        content: 'Les présentes CGU sont conclues pour une durée indéterminée. ALTUS se réserve le droit de modifier les présentes CGU à tout moment. Toute modification sera notifiée au Titulaire au moins 2 mois avant son entrée en vigueur. L\'absence d\'opposition dans ce délai vaudra acceptation.',
      },
      section12: {
        title: '12. RÉCLAMATIONS',
        content: 'Pour toute réclamation, le Titulaire peut contacter le service client ALTUS :',
        list: [
          'Par email : support@altusgroup.com',
          'Par téléphone : +33 1 XX XX XX XX',
          'Via l\'espace client sécurisé',
        ],
        content2: 'En l\'absence de réponse satisfaisante dans un délai de 2 mois, le Titulaire peut saisir le Médiateur de l\'AMF.',
      },
      section13: {
        title: '13. DROIT APPLICABLE ET JURIDICTION',
        content: 'Les présentes CGU sont régies par le droit français. Tout litige relatif à leur interprétation ou exécution relève de la compétence exclusive des tribunaux français.',
      },
      note: 'En activant votre Carte Virtuelle ALTUS, vous reconnaissez avoir lu, compris et accepté l\'intégralité des présentes Conditions Générales d\'Utilisation.',
    },
    processTimeline: {
      title: 'Processus de Financement',
      subtitle: 'De votre demande au déblocage des fonds : un parcours simplifié et rapide',
      step1Title: 'Demande en ligne',
      step1Duration: '5 minutes',
      step1Description: 'Remplissez notre formulaire sécurisé et téléchargez vos justificatifs',
      step1Docs: [
        'Kbis de moins de 3 mois',
        'Pièce d\'identité du dirigeant',
        'Derniers bilans comptables',
        'Relevés bancaires (3 mois)'
      ],
      step2Title: 'Analyse du dossier',
      step2Duration: '24-48h',
      step2Description: 'Notre équipe d\'experts étudie votre demande et votre capacité de remboursement',
      step2Docs: [
        'Vérification des documents',
        'Analyse financière',
        'Étude de solvabilité',
        'Calcul du taux personnalisé'
      ],
      step3Title: 'Accord de principe',
      step3Duration: '48h',
      step3Description: 'Réception de votre offre de prêt détaillée avec conditions définitives',
      step3Docs: [
        'Montant accordé',
        'TAEG et mensualités',
        'Garanties requises',
        'Conditions suspensives'
      ],
      step4Title: 'Déblocage des fonds',
      step4Duration: '7-15 jours',
      step4Description: 'Signature électronique du contrat et versement sous 7 à 15 jours après mise en place des garanties',
      step4Docs: [
        'Signature contrat de prêt',
        'Mise en place garanties',
        'Assurance emprunteur',
        'Virement des fonds'
      ],
      documentsTitle: 'Documents à Préparer selon Votre Projet',
      creationTitle: 'Création d\'entreprise',
      creationDocs: [
        'Business plan détaillé',
        'Prévisionnel financier sur 3 ans',
        'Plan de financement',
        'CV du dirigeant et expérience',
        'Justificatif apport personnel'
      ],
      repriseTitle: 'Reprise d\'entreprise',
      repriseDocs: [
        'Protocole d\'accord de reprise',
        'Bilans des 3 derniers exercices',
        'Évaluation du fonds de commerce',
        'Bail commercial',
        'Attestation non-gage'
      ],
      developmentTitle: 'Développement',
      developmentDocs: [
        'Bilans des 3 derniers exercices',
        'Liasse fiscale complète',
        'Devis fournisseurs (équipement)',
        'Relevés bancaires pro (6 mois)',
        'Prévisionnel d\'activité'
      ],
      incompleteTitle: 'Dossier incomplet ? Pas de panique !',
      incompleteDescription: 'Notre équipe vous accompagne pour constituer votre dossier. Nous vous aidons à obtenir les documents manquants.',
      needHelp: 'Besoin d\'aide ?',
      averageTime: 'Délai total moyen :',
      averageTimeValue: '2 à 3 semaines du dépôt du dossier au déblocage des fonds',
      startApplication: 'Commencer ma demande'
    },
    guaranteesSection: {
      title: 'Garanties & Sécurisation',
      subtitle: 'Plusieurs options pour sécuriser votre financement et optimiser votre fiscalité',
      organizationalTitle: 'Garanties Organismes',
      organizationalItems: [
        'BPI France (40-70% du prêt)',
        'SIAGI (garantie artisans/commerçants)',
        'France Active (économie sociale)',
        'SOCAMA (agriculteurs)'
      ],
      realTitle: 'Garanties Réelles',
      realItems: [
        'Hypothèque sur biens immobiliers',
        'Nantissement fonds de commerce',
        'Gage sur matériel/équipement',
        'Privilège du prêteur de deniers'
      ],
      personalTitle: 'Garanties Personnelles',
      personalItems: [
        'Caution solidaire du dirigeant',
        'Caution bancaire professionnelle',
        'Garantie à première demande',
        'Lettre de confort groupe'
      ],
      insuranceTitle: 'Assurance Emprunteur',
      insuranceItems: [
        'Décès / PTIA (obligatoire)',
        'Invalidité permanente (IPT/IPP)',
        'Incapacité temporaire (ITT)',
        'Cotisations fiscalement déductibles'
      ],
      taxBenefitsTitle: 'Avantages Fiscaux du Prêt Professionnel',
      taxBenefit1Title: 'Déductibilité des intérêts',
      taxBenefit1Description: 'Les intérêts d\'emprunt sont déductibles du résultat fiscal de votre entreprise, réduisant ainsi votre impôt sur les bénéfices.',
      taxBenefit2Title: 'Amortissement accéléré',
      taxBenefit2Description: 'Pour les équipements financés, possibilité d\'amortissement accéléré selon certaines conditions (matériel neuf, écologique, etc.).',
      taxBenefit3Title: 'Crédit d\'impôt',
      taxBenefit3Description: 'Certains investissements ouvrent droit à des crédits d\'impôt (transition énergétique, numérique, formation).',
      taxBenefit4Title: 'TVA récupérable',
      taxBenefit4Description: 'La TVA sur les intérêts et frais de dossier est récupérable pour les entreprises assujetties.',
      taxAdvice: 'Conseil fiscal : Consultez votre expert-comptable pour optimiser la déductibilité de vos emprunts et maximiser vos avantages fiscaux.',
      contributionTitle: 'Apport Personnel Requis',
      equipmentPercentage: '10-15%',
      equipmentLabel: 'Équipement',
      equipmentDescription: 'Matériel, véhicules',
      creationPercentage: '20-30%',
      creationLabel: 'Création / Reprise',
      creationDescription: 'Fonds de commerce',
      realEstatePercentage: '20-25%',
      realEstateLabel: 'Immobilier Pro',
      realEstateDescription: 'Locaux, bureaux',
      contributionDisclaimer: '* Pourcentages indicatifs pouvant varier selon votre projet et votre profil'
    },
    footer: {
      description: 'Votre partenaire de confiance pour tous vos projets de financement. Solutions de prêt adaptées aux particuliers et professionnels.',
      phone: '+352 40 63 48',
      email: 'infos@altusfinancegroup.com',
      address: '19 Rue Sigismond, L-2537 Luxembourg',
      hoursTitle: 'Horaires d\'ouverture',
      hours: {
        weekdays: 'Lun - Ven : 9h00 - 19h00',
        weekend: 'Sam : 9h00 - 17h00',
        support: 'Service client réactif',
      },
      certificationsTitle: 'Certifications & Sécurité',
      certifications: [
        'Régulé par l\'ACPR',
        'Certifié ISO 27001',
        'Conforme RGPD',
        'SSL/TLS Sécurisé',
        'Membre FBF',
      ],
      productsTitle: 'Nos Produits',
      products: {
        personal: 'Prêts particuliers',
        business: 'Prêts professionnels',
        mortgage: 'Prêt immobilier',
        auto: 'Crédit auto',
        renovation: 'Prêt travaux',
      },
      companyTitle: 'Entreprise',
      careers: 'Carrières',
      legalTitle: 'Légal',
      legalLinks: {
        terms: 'Mentions légales',
        privacy: 'Politique de confidentialité',
        cgu: 'CGU',
        cookies: 'Cookies',
        gdpr: 'RGPD',
      },
      helpTitle: 'Aide',
      helpLinks: {
        faq: 'FAQ',
        userGuide: 'Guide d\'utilisation',
        support: 'Support client',
        simulator: 'Simulateur de prêt',
        contactUs: 'Nous contacter',
      },
      copyright: 'Altus Finance Group. Tous droits réservés.',
      regulatory: 'Altus Finance Group est une marque de financement agréée par l\'ACPR. Organisme de crédit soumis au contrôle de la Banque de France.',
      disclaimer: 'Attention, emprunter de l\'argent coûte aussi de l\'argent. Les informations sur cette page sont données à titre indicatif et ne constituent pas une offre contractuelle. Toute demande de crédit est soumise à l\'étude et à l\'acceptation du dossier. Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.',
    },
    seo: {
      home: {
        title: 'Altus Finance Group - Prêt Professionnel & Personnel | Financement Rapide et Compétitif',
        description: 'Solutions de prêt professionnel et personnel avec Altus Finance Group. Obtenez un financement rapide pour votre entreprise ou projet personnel. Taux compétitifs, processus simple et transparent.',
        keywords: 'prêt professionnel, crédit entreprise, financement professionnel, prêt personnel, crédit rapide, taux compétitifs, Altus Finance Group',
      },
      about: {
        title: 'À propos d\'Altus Finance Group - Notre Mission et Nos Valeurs | Solutions de Financement',
        description: 'Découvrez Altus Finance Group, leader en solutions de prêt professionnel avec plus de 15 ans d\'expérience, 15 000+ clients satisfaits et 500M€ de prêts accordés. Notre mission : rendre le financement accessible à tous.',
        keywords: 'à propos Altus Finance Group, mission Altus Finance Group, valeurs entreprise financement, expérience prêt professionnel, financement entreprise fiable',
      },
      contact: {
        title: 'Contactez-nous - Altus Finance Group | Questions sur nos Prêts Professionnels',
        description: 'Une question sur nos solutions de financement ? Contactez Altus Finance Group. Notre équipe est à votre disposition pour vous accompagner dans votre projet de prêt professionnel. Réponse rapide garantie.',
        keywords: 'contact Altus Finance Group, nous contacter, service client prêt, aide financement entreprise, support client Altus',
      },
      howItWorks: {
        title: 'Comment Obtenir un Prêt Pro - Processus Détaillé | Altus Finance Group',
        description: 'Découvrez le processus complet pour obtenir un prêt professionnel avec Altus Finance Group. De la demande en ligne au déblocage des fonds : critères, documents requis et délais. Réponse en 24-48h.',
        keywords: 'comment obtenir prêt professionnel, processus crédit pro, documents prêt entreprise, critères éligibilité, délai financement, étapes demande prêt',
      },
      forgotPassword: {
        title: 'Mot de passe oublié | Altus Finance Group',
        description: 'Réinitialisez votre mot de passe',
        emailSentTitle: 'Email envoyé | Altus Finance Group',
        emailSentDescription: 'Un lien de réinitialisation a été envoyé',
      },
      resetPassword: {
        title: 'Réinitialiser le mot de passe | Altus Finance Group',
        description: 'Créez un nouveau mot de passe pour votre compte',
      },
      twoFactorSetup: {
        title: 'Configuration 2FA | Altus Finance Group',
        description: 'Configurez l\'authentification à deux facteurs pour sécuriser votre compte',
      },
      verifyTwoFactor: {
        title: 'Vérification 2FA | Altus Finance Group',
        description: 'Vérification à deux facteurs',
      },
    },
    admin: {
      common: {
        status: {
          pending: 'En attente',
          active: 'Actif',
          approved: 'Approuvé',
          rejected: 'Refusé',
          suspended: 'Suspendu',
          completed: 'Terminé',
          signed: 'Signé',
          inProgress: 'En cours',
        },
        actions: {
          approve: 'Approuver',
          reject: 'Rejeter',
          delete: 'Supprimer',
          suspend: 'Suspendre',
          save: 'Enregistrer',
          download: 'Télécharger',
          upload: 'Téléverser',
          send: 'Envoyer',
          edit: 'Modifier',
          cancel: 'Annuler',
          disburse: 'Débloquer',
        },
        labels: {
          user: 'Utilisateur',
          userName: 'Nom d\'utilisateur',
          userEmail: 'Email utilisateur',
          amount: 'Montant',
          type: 'Type',
          rate: 'Taux',
          duration: 'Durée',
          status: 'Statut',
          date: 'Date',
          createdAt: 'Créé',
          actions: 'Actions',
          fees: 'Frais',
          progress: 'Progression',
          codes: 'Codes',
          recipient: 'Destinataire',
          contract: 'Contrat',
          months: 'mois',
          total: 'Total',
          active: 'actifs',
          pending: 'en attente',
          recent: 'Récents',
          all: 'Tous',
          noData: 'Aucune donnée',
          loading: 'Chargement...',
          error: 'Erreur',
          success: 'Succès',
          balance: 'Solde',
          loans: 'Prêts',
        },
        messages: {
          error: 'Erreur',
          success: 'Succès',
          updated: 'Mis à jour',
          approved: 'Approuvé',
          rejected: 'Rejeté',
          deleted: 'Supprimé',
          disbursed: 'Débloqué',
          cannotApprove: 'Impossible d\'approuver',
          cannotReject: 'Impossible de rejeter',
          cannotDelete: 'Impossible de supprimer',
          cannotUpdate: 'Impossible de mettre à jour',
          loadError: 'Erreur de chargement',
        },
        empty: {
          noResults: 'Aucun résultat',
          noData: 'Aucune donnée disponible',
        },
      },
      dashboard: {
        title: 'Console Admin',
        description: 'Vue d\'ensemble de la plateforme et gestion des utilisateurs',
        totalUsers: 'Total Utilisateurs',
        activeUsers: 'actifs',
        pendingUsers: 'en attente',
        transfers: 'Transferts',
        transfersPending: 'en cours',
        loans: 'Prêts',
        loansActive: 'actifs',
        totalVolume: 'Volume Total',
        volumeDescription: 'Transferts totaux',
        recentUsers: 'Utilisateurs Récents',
        recentUsersDescription: 'Dernières inscriptions',
        recentTransfers: 'Transferts Récents',
        recentTransfersDescription: 'Dernières opérations',
      },
      loans: {
        title: 'Gestion des Prêts',
        description: 'Gérer toutes les demandes de prêts de la plateforme',
        allLoans: 'Tous les Prêts',
        allLoansDescription: 'Liste complète des demandes de prêts',
        loanApproved: 'Prêt approuvé',
        loanApprovedDesc: 'Le prêt a été approuvé avec succès. Le contrat a été généré.',
        loanRejected: 'Prêt rejeté',
        loanRejectedDesc: 'Le prêt a été rejeté avec succès',
        loanDeleted: 'Prêt supprimé',
        loanDeletedDesc: 'Le prêt a été supprimé avec succès',
        fundsDisbursed: 'Fonds débloqués',
        fundsDisbursedDesc: 'Les fonds ont été débloqués avec succès. L\'utilisateur a été notifié.',
        contractGenerated: '📄 Généré',
        contractSigned: '✅ Signé',
        approveReason: 'Raison d\'approbation',
        rejectReason: 'Raison du refus',
        deleteReason: 'Raison de la suppression',

        approveDialogDesc: 'Cette action approuvera le prêt de {amount} pour {userName} et générera le contrat.',
        rejectDialogTitle: 'Rejeter le prêt',
        rejectDialogDesc: 'Cette action rejettera définitivement le prêt. L\'utilisateur sera notifié.',
        disburseDialogTitle: 'Débloquer les fonds',
        disburseDialogDesc: 'Cette action débloquera les fonds de {amount} pour {userName}. Le prêt passera en statut actif et l\'utilisateur pourra effectuer des transferts.',
        deleteDialogTitle: 'Supprimer le prêt',
        deleteDialogDesc: 'Cette action supprimera le prêt de manière définitive.',
      },
      transfers: {
        title: 'Gestion des Transferts',
        description: 'Valider ou suspendre les demandes de transfert',
        allTransfers: 'Tous les Transferts',
        allTransfersDescription: 'Liste complète des transferts de fonds',
        transferUpdated: 'Transfert mis à jour',
        transferUpdatedDesc: 'Le statut du transfert a été modifié avec succès',
        approveDialogTitle: 'Approuver le transfert',
        approveDialogDesc: 'Cette action approuvera le transfert et mettra à jour son statut en "en cours".',
        suspendDialogTitle: 'Suspendre le transfert',
        suspendDialogDesc: 'Cette action suspend le transfert. Il pourra être réactivé ultérieurement.',
      },
    },
    expertise: {
      title: 'Nos Domaines d\'Expertise',
      subtitle: 'Des solutions financières sur mesure pour tous vos projets',
      realEstate: 'Crédit Immobilier',
      realEstateDesc: 'Financement de votre résidence principale ou secondaire avec des taux avantageux et un accompagnement personnalisé.',
      personal: 'Prêt Personnel',
      personalDesc: 'Solutions flexibles pour vos projets personnels : voyage, travaux, événements ou consolidation de dettes.',
      professional: 'Crédit Professionnel',
      professionalDesc: 'Accompagnement dédié pour le développement de votre activité professionnelle et l\'acquisition d\'équipements.',
      consolidation: 'Rachat de Crédit',
      consolidationDesc: 'Regroupez vos crédits en cours pour simplifier votre gestion et réduire vos mensualités.',
      business: 'Financement Entreprise',
      businessDesc: 'Solutions de financement adaptées aux besoins de votre entreprise pour soutenir sa croissance.',
      investment: 'Investissement Locatif',
      investmentDesc: 'Financez vos projets d\'investissement immobilier locatif avec des conditions optimales.',
    },
    howItWorksSection: {
      title: 'Comment ça marche ?',
      subtitle: 'Un processus simple et rapide en 4 étapes',
      step1Title: 'Inscription',
      step1Desc: 'Créez votre compte en quelques minutes et complétez votre profil en toute sécurité.',
      step2Title: 'Analyse',
      step2Desc: 'Notre équipe d\'experts analyse votre dossier et évalue votre capacité d\'emprunt.',
      step3Title: 'Validation',
      step3Desc: 'Recevez votre offre personnalisée et signez électroniquement votre contrat.',
      step4Title: 'Déblocage',
      step4Desc: 'Les fonds sont transférés sur votre compte sous 7 à 15 jours ouvrés.',
      ctaText: 'Prêt à commencer votre projet ?',
      ctaButton: 'Commencer ma demande',
    },
    premiumTestimonials: {
      title: 'Ils nous font confiance',
      subtitle: 'Découvrez les témoignages de nos clients satisfaits',
      testimonial1Name: 'Marie Dubois',
      testimonial1Role: 'Propriétaire',
      testimonial1Content: 'Un service exceptionnel ! J\'ai obtenu mon prêt immobilier en moins de 3 semaines. L\'équipe est professionnelle et à l\'écoute.',
      testimonial2Name: 'Sophie Laurent',
      testimonial2Role: 'Entrepreneuse',
      testimonial2Content: 'Grâce à Altus Finance Group, j\'ai pu financer le développement de mon entreprise. Un accompagnement personnalisé du début à la fin.',
      testimonial3Name: 'Pierre Richard',
      testimonial3Role: 'Investisseur',
      testimonial3Content: 'Les taux proposés sont très compétitifs et le processus est 100% digital. Je recommande vivement leurs services.',
      testimonial4Name: 'Anne Martin',
      testimonial4Role: 'Commerçante',
      testimonial4Content: 'Une équipe réactive et des solutions adaptées à mes besoins. Le rachat de crédit m\'a permis de mieux gérer mon budget.',
    },
    bankingSecurity: {
      badge: 'Sécurité Bancaire',
      title: 'Votre sécurité, notre priorité',
      subtitle: 'Protection maximale de vos données avec les standards bancaires les plus élevés',
      aes256Title: 'Cryptage AES-256',
      aes256Desc: 'Toutes vos données sont protégées par un cryptage de niveau militaire, garantissant une confidentialité absolue.',
      mfaTitle: 'Authentification MFA',
      mfaDesc: 'Double authentification obligatoire pour sécuriser l\'accès à votre compte et vos transactions.',
      kycTitle: 'Processus KYC/AML',
      kycDesc: 'Vérification d\'identité rigoureuse conforme aux normes européennes anti-blanchiment.',
      euHostingTitle: 'Hébergement UE',
      euHostingDesc: 'Serveurs sécurisés situés en Union Européenne pour une conformité RGPD totale.',
      monitoringTitle: 'Surveillance 24/7',
      monitoringDesc: 'Monitoring continu des activités suspectes par nos systèmes de détection avancés.',
      gdprTitle: 'Conformité RGPD',
      gdprDesc: 'Respect strict du règlement européen sur la protection des données personnelles.',
      certified: 'Certifié ISO 27001',
      compliance: 'Conformité RGPD',
      audited: 'Audits réguliers',
    },
    finalCTA: {
      badge: 'Démarrez maintenant',
      title: 'Prêt à réaliser vos projets ?',
      subtitle: 'Rejoignez des milliers de clients qui nous font confiance pour financer leurs projets',
      benefit1: 'Réponse sous 24 à 48 heures',
      benefit2: 'Processus 100% digital et sécurisé',
      benefit3: 'Accompagnement personnalisé',
      benefit4: 'Taux compétitifs garantis',
      primaryButton: 'Ouvrir mon dossier',
      secondaryButton: 'Parler à un conseiller',
      trustText: '✓ Sans engagement • Réponse sous 24h • 100% sécurisé',
      stat1Value: '15 000+',
      stat1Label: 'Clients satisfaits',
      stat2Value: '98%',
      stat2Label: 'Taux d\'approbation',
      stat3Value: '24h',
      stat3Label: 'Délai de réponse',
      stat4Value: '€500M+',
      stat4Label: 'Fonds distribués',
    },
  },
  en: {
    hero: {
      title: 'Realize your projects with Altus Finance Group',
      subtitle: 'Financing solutions for individuals and professionals - Competitive rates and transparent process',
      cta1: 'Request funding',
      cta2: 'My Account',
      learnMore: 'Learn More',
      trustIndicator: 'More than 15,000 satisfied clients trust us',
      trustBadges: {
        response24h: '24h Response Time',
        swissSecurity: 'Swiss Bank Security',
        fastApproval: 'Fast Approval',
      },
      calculator: {
        title: 'Calculate Your Budget',
        subtitle: 'Get an instant estimate',
        loanAmount: 'Loan Amount',
        duration: 'Duration (months)',
        monthlyPayment: 'Monthly Payment',
        perMonth: 'per month',
        applyNow: 'Apply Now',
        disclaimer: 'Free application - No commitment - Confidential process',
      },
      slides: [
        {
          title: 'Altus Finance Group',
          subtitle: 'Professional and secure financing solutions to support your growth.',
        },
        {
          title: 'Excellence in Financial Expertise',
          subtitle: 'Tailored solutions adapted to your entrepreneurial and wealth management ambitions.',
        },
        {
          title: 'Your Trusted Partner',
          subtitle: 'Personalized support and absolute discretion for all your financing projects.',
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
      tagline: 'Premium Financial Solutions',
      more: 'More',
      moreInfo: 'More information',
      language: 'Language',
      loansMenu: {
        label: 'Our Loans',
        items: [
          {
            title: 'Personal Credit',
            description: 'Finance your personal projects with competitive rates',
            href: '/loans/personal-credit',
          },
          {
            title: 'Loan Refinancing',
            description: 'Consolidate your loans to simplify repayments',
            href: '/loans/loan-refinancing',
          },
          {
            title: 'Lease Refinancing',
            description: 'Optimize your costs by refinancing your lease',
            href: '/loans/lease-refinancing',
          },
          {
            title: 'Credit Card Refinancing',
            description: 'Reduce your credit card interest rates',
            href: '/loans/credit-card-refinancing',
          },
          {
            title: 'Various Credits',
            description: 'Financing solutions tailored to all your needs',
            href: '/products',
          },
          {
            title: 'SME Loans',
            description: 'Business financing to grow your company',
            href: '/products',
          },
        ],
      },
      howItWorks: 'How It Works',
      resources: 'Resources',
      faq: 'FAQ',
      about: 'About',
      contact: 'Contact',
      phone: '+352 40 63 48',
      dashboard: 'Dashboard',
      loans: 'Loans',
      myLoans: 'My Loans',
      newLoan: 'Loan Request',
      contracts: 'Contracts',
      loansSection: 'Loans',
      transfers: 'Transfers',
      history: 'History',
      settings: 'Settings',
      logout: 'Logout',
      users: 'Users',
      documents: 'KYC Documents',
      reports: 'Reports',
    },
    contracts: {
      title: 'Contract Management',
      description: 'Download, sign and return your loan contracts securely.',
      loanNumber: 'Loan',
      approvedOn: 'Approved on',
      actionRequired: 'Action required',
      step1: '1. Download the contract',
      step1Description: 'Download and carefully read your loan contract.',
      step2: '2. Sign and return',
      step2Description: 'Sign the contract and return it in PDF format.',
      downloadContract: 'Download contract',
      tabPending: 'To sign',
      tabReview: 'Under review',
      tabCompleted: 'Completed',
      inReview: 'Under review',
      signed: 'Signed',
      noPendingContracts: 'No pending contracts',
      noPendingContractsDescription: 'All your contracts have been signed and sent.',
      noReviewContracts: 'No contracts under review',
      noReviewContractsDescription: 'No contracts are currently pending review.',
      noCompletedContracts: 'No signed contracts',
      noCompletedContractsDescription: 'Your signed contracts will appear here.',
      reviewMessage: 'Your signed contract has been received and is being reviewed by our team. You will be notified once the funds are released.',
      signedSuccess: 'Contract signed and validated successfully',
      downloadOriginal: 'Download original contract',
    },
    dashboard: {
      welcome: 'Welcome',
      welcomeUser: 'Welcome, {name}',
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
      yourGlobalBalance: 'Your Global Balance',
      noActiveLoans: 'No Active Loans',
      noTransfers: 'No Transfers Found',
      dataLoadError: 'Error loading data',
      available: 'available',
      notifications: 'Notifications',
      noNotifications: 'No notifications',
      viewDetails: 'View Details',
      availableOffers: 'Available offers for you',
      contractToSign: 'Contract to sign',
      moreTransfers: 'more transfer(s)',
      goodMorning: 'Good morning',
      goodAfternoon: 'Good afternoon',
      goodEvening: 'Good evening',
      totalBalance: 'Total balance',
      newTransfer: 'New transfer',
      requestLoan: 'Request a loan',
      manageAccounts: 'Manage accounts',
      cashflow: 'Cash flow',
      incomeExpensesSixMonths: 'Income and expenses over 6 months',
      income: 'Income',
      expenses: 'Expenses',
      creditUtilization: 'Credit utilization',
      used: 'used',
      recentActivity: 'Recent activity',
      latestTransactions: 'Latest transactions',
      viewAll: 'View all',
      noRecentTransactions: 'No recent transactions',
      pendingRequests: 'Pending requests',
      pendingRequestsDescription: 'Your loan requests in progress',
      noPendingRequests: 'No pending requests',
      pendingLoan: 'Pending request',
      yourActiveLoans: 'Your active loans',
      yourActiveLoansDescription: 'Track your repayments and due dates',
      activeLoan: 'Active loan',
      repaid: 'Repaid',
      upcomingDueDates: 'Upcoming due dates',
      amount: 'Amount',
      monthJan: 'Jan',
      monthFeb: 'Feb',
      monthMar: 'Mar',
      monthApr: 'Apr',
      monthMay: 'May',
      monthJun: 'Jun',
      serverError: 'Unable to connect to the server. Please check your connection and try again.',
      diagnosticInfo: 'Diagnostic information (development)',
      retry: 'Retry',
      financeOverview: 'Here is an overview of your finances',
      yourCreditLimit: 'Your credit limit',
      maximum: 'Maximum',
      activeLoanSingular: 'active loan',
      activeLoansPlural: 'active loans',
      loanNumber: 'Loan #',
      progression: 'Progress',
      nextSixMonths: 'Next 6 months',
      repayment: 'Repayment',
      noUpcomingRepayments: 'No upcoming repayments',
      pendingContracts: 'Pending contracts',
      contractsToSign: 'contract(s) to sign',
      generatedOn: 'Generated on',
      view: 'View',
    },
    loan: {
      pageTitle: 'My Loans',
      pageDescription: 'Manage your loans and simulate your repayments',
      tabMyLoans: 'My Loans',
      tabCalculator: 'Calculator',
      amount: 'Amount',
      interestRate: 'Interest Rate',
      nextPayment: 'Next Payment',
      viewAll: 'View All',
      status: 'Status',
      downloadContract: 'Download Contract',
      uploadSignedContract: 'Upload Signed Contract',
      downloading: 'Downloading...',
      uploading: 'Uploading...',
      loanNumber: 'Loan',
      requestSubmitted: 'Loan request submitted',
      requestSubmittedDesc: 'Your request is pending approval by an administrator. You will receive a notification as soon as it is processed.',
      requestError: 'Failed to submit loan request',
      loanApproved: '🎉 Your loan has been approved!',
      approvalInstructions: 'To finalize your loan, please follow these steps:',
      approvalStep1: 'Download your loan contract (PDF)',
      approvalStep2: 'Read it carefully and sign it',
      approvalStep3: 'Return the signed contract (PDF) via the button below',
      downloadContractButton: '1. Download contract',
      uploadContractButton: '2. Upload signed contract',
      uploading2: 'Uploading...',
    },
    transfer: {
      pageTitle: 'My Transfers',
      pageDescription: 'Manage and track all your fund transfers',
      searchPlaceholder: 'Search by recipient or ID...',
      allStatuses: 'All statuses',
      filterTitle: 'Filters and search',
      filterDescription: 'Refine your transfer list',
      noTransfersFound: 'No transfers found',
      noTransfersMessage: 'You haven\'t made any transfers yet',
      createTransfer: 'Create transfer',
      newTransfer: 'New transfer',
      requestSubmitted: 'Request Submitted',
      documentVerification: 'Document Verification',
      complianceCheck: 'Compliance Check',
      approvalPending: 'Approval Pending',
      transferComplete: 'Transfer Complete',
      pending: 'Pending',
      inProgress: 'In Progress',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
      suspended: 'Suspended',
      noAccount: 'No registered account',
      validation: 'Validation',
      validating: 'Validating...',
      onHold: 'Transfer on hold',
      processing: 'Transfer in progress',
      processingComplete: 'Transfer completed',
    },
    history: {
      pageTitle: 'Transaction History',
      pageDescription: 'View the complete history of all your transactions',
      totalCredits: 'Total credits',
      totalDebits: 'Total debits',
      totalTransactions: 'Total transactions',
      filterTitle: 'Filters and search',
      filterDescription: 'Refine your transaction history',
      searchPlaceholder: 'Search by description or ID...',
      filterType: 'Type',
      allTypes: 'All types',
      typeCredit: 'Credit',
      typeDebit: 'Debit',
      typeFee: 'Fee',
      noTransactionsFound: 'No transactions found',
      noTransactionsFoundFiltered: 'Try modifying your search criteria',
      noTransactionsYet: 'You don\'t have any transactions yet',
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
      feesToPay: 'Fees to Pay',
      unpaidFeesCount: 'unpaid fees',
      unpaidFeesSingular: 'unpaid fee',
      pendingValidation: 'Pending validation',
      autoValidatedViaCode: 'Auto-validated via code',
      totalUnpaid: 'Total Unpaid',
      totalOverall: 'Total Overall',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      active: 'Active',
      pending: 'Pending',
      completed: 'Completed',
      suspended: 'Suspended',
      saving: 'Saving...',
      cancel: 'Cancel',
      save: 'Save',
      close: 'Close',
      noData: 'No data available',
      months: 'months',
      years: 'years',
    },
    about: {
      title: 'About Altus Finance Group',
      subtitle: 'Your trusted partner for financing individuals and businesses',
      mission: 'Our Mission',
      missionText: 'At Altus Finance Group, we democratize access to financing for everyone. Whether you\'re an individual with a personal project or a growing business, we offer modern, transparent credit solutions tailored to your needs. Our cutting-edge technology enables us to quickly analyze your situation and offer personalized deals with competitive rates. We believe in total transparency: no hidden fees, clear terms, and support at every step.',
      stats: {
        clients: 'Active clients',
        loansProvided: 'Loans provided',
        successRate: 'Satisfaction rate',
        yearsExperience: 'Years of experience',
      },
    },
    howItWorks: {
      title: 'How It Works',
      subtitle: 'An ultra-fast 100% digital process in 4 simple steps',
      step1Title: 'Online Application - 4 Minutes',
      step1Desc: 'Complete our secure form with your personal or business information. No need to travel, everything is done online with instant identity verification (KYC) and simplified document upload.',
      step1Duration: '3 min',
      step2Title: 'Ultra-Fast Response - Minutes to 24h',
      step2Desc: 'Our credit assessment technology analyzes your financial profile, income, and history in real-time. Thanks to our advanced algorithms and credit bureau integration, we give you an approval response in minutes to 24 hours maximum.',
      step2Duration: 'Instant',
      step3Title: 'Immediate Fund Disbursement',
      step3Desc: 'Once your application is approved, funds are immediately released to your secure Altus Finance Group account. You maintain full control of your funds with 24/7 access from your client dashboard.',
      step3Duration: '< 24h',
      step4Title: 'Transfer to Your Account - At Your Pace',
      step4Desc: 'Transfer your funds whenever you want to your personal or business bank account directly from your Altus dashboard. Instant or scheduled transfers according to your needs, with no additional fees.',
      step4Duration: 'Immediate',
      averageTimePrefix: 'Average total time:',
      averageTimeValue: '2 to 3 weeks from application submission to fund disbursement',
      requiredDocumentsTitle: 'Required Documents',
      requiredDocumentsSubtitle: 'Prepare these documents to expedite your application',
      personalLoanTitle: 'Personal Loan',
      businessLoanTitle: 'Business Loan',
      documents: {
        personal: [
          'Valid ID (national ID card, passport)',
          'Proof of address (less than 3 months)',
          'Last 3 pay slips',
          'Latest tax assessment',
          'Bank statements (3 months)',
          'Project justification (quotes, invoices)'
        ],
        professional: [
          'Kbis less than 3 months old',
          'Manager\'s ID document',
          'Company bylaws',
          'Financial statements (last 3 years)',
          'Complete tax package',
          'Professional bank statements (6 months)',
          'Business plan (startup/takeover)',
          '3-year financial forecast',
          'Quotes or proforma invoices (equipment)'
        ]
      },
      tipTitle: 'Tip:',
      tipMessage: 'Missing documents? Our team will help you complete your file.',
      tipContactCta: 'Contact us →',
      eligibilityTitle: 'Eligibility Criteria',
      eligibilitySubtitle: 'Check if you meet the requirements for your loan',
      individualsTitle: 'Individuals',
      professionalsTitle: 'Professionals',
      requiredTag: 'Required',
      eligibility: {
        personal: [
          { label: 'Adult and French resident', required: true },
          { label: 'Verifiable regular income', required: true },
          { label: 'No banking ban', required: true },
          { label: 'Debt ratio < 35%', required: true },
          { label: 'Acceptable credit score', required: false }
        ],
        professional: [
          { label: 'Company registered in France', required: true },
          { label: 'Operating for +6 months', required: true },
          { label: 'Up-to-date financial statements', required: true },
          { label: 'No collective proceedings', required: true },
          { label: 'Personal contribution 10-30%', required: true }
        ]
      },
      securityTitle: 'Security & Guarantees',
      security: {
        dataProtectionTitle: 'Your Protected Data',
        dataProtectionItems: [
          '256-bit SSL encryption',
          'GDPR and ACPR compliance',
          'Secure servers in France',
          'Two-factor authentication'
        ],
        guaranteesTitle: 'Guarantee Organizations',
        guaranteesItems: [
          'BPI France (40-70% of loan)',
          'SIAGI (craftsmen/merchants)',
          'France Active (social economy)',
          'Mandatory borrower insurance'
        ]
      },
      ctaTitle: 'Ready to Get Started?',
      ctaSubtitle: 'Submit your online application in minutes and get a quick response',
      ctaRequestButton: 'Request a Loan',
      ctaContactButton: 'Talk to an Advisor'
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
          answer: 'Thanks to our real-time analysis technology, you receive an approval response in minutes to 24 hours maximum. Once approved, funds are immediately released to your secure Altus Finance Group account. You can then transfer them to your personal or business bank account whenever you want, instantly and at no extra cost.',
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
          answer: 'Our rates are calculated by an algorithm that analyzes several factors: your credit score, loan duration, amount borrowed, income and expenses, repayment history, and financial health (for businesses). Rates range from 0.5% to 9.0% APR depending on profile and loan type. Our rates are among the most competitive on the market thanks to our network of financial partners.',
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
        section1Content: 'By accessing and using Altus Finance Group\'s services, you accept and agree to be bound by the terms and provision of this agreement.',
        section2Title: '2. Use License',
        section2Content: 'Permission is granted to temporarily access the materials (information or software) on Altus Finance Group\'s platform for personal, non-commercial transitory viewing only.',
        section3Title: '3. Loan Agreement',
        section3Content: 'All loans are subject to credit approval. Terms and conditions will be provided in a separate loan agreement upon approval of your application.',
        section4Title: '4. Representations and Warranties',
        section4Content: 'You represent and warrant that all information provided in your loan application is accurate, complete, and current.',
        section5Title: '5. Limitation of Liability',
        section5Content: 'In no event shall Altus Finance Group or its suppliers be liable for any damages arising out of the use or inability to use the materials on Altus Finance Group\'s platform.',
        section6Title: '6. Modifications',
        section6Content: 'Altus Finance Group may revise these terms of service at any time without notice. By using this platform, you agree to be bound by the current version of these terms.',
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
      miscellaneousCredit: 'Miscellaneous Credit',
      miscellaneousCreditDesc: 'Finance all your personal projects: events, equipment, leisure, health, wellness. From €500 to €50,000 over 6 to 96 months. APR rates from 2.9% to 8.9%. Simplified procedure, quick response in 24h. Fund disbursement in 3 to 5 days.',
      amount: 'Amount',
      rate: 'APR Rate',
      duration: 'Duration',
      rateDisclaimer: 'Indicative rates subject to eligibility conditions. Fixed APR. Credit commits you and must be repaid. Check your repayment capacity before committing.',
      compareLoans: 'Compare all loans',
    },
    businessLoans: {
      title: 'Solutions for Professionals',
      subtitle: 'Financing tailored to the needs of your business, micro-enterprise, SME or self-employed',
      businessLoan: 'Business Loan',
      businessLoanDesc: 'Financing for your business projects, development and cash flow',
      businessLoanFeatures: ['Response within 48h', 'Fixed rate', 'Flexible repayment'],
      cashFlowCredit: 'Cash Flow Credit',
      cashFlowCreditDesc: 'Quick solution to manage your working capital needs',
      cashFlowCreditFeatures: ['Quick disbursement', 'No collateral up to €50k', 'Flexible'],
      equipmentFinancing: 'Equipment Financing',
      equipmentFinancingDesc: 'Purchase your professional equipment and materials',
      equipmentFinancingFeatures: ['Up to 100% financing', 'Leasing option', 'Tax deductible'],
      commercialProperty: 'Commercial Real Estate Loan',
      commercialPropertyDesc: 'Acquire your premises, offices or professional warehouses',
      commercialPropertyFeatures: ['Long duration', 'Down payment from 20%', 'Competitive rate'],
      lineOfCredit: 'Line of Credit',
      lineOfCreditDesc: 'Revolving credit for your occasional needs',
      lineOfCreditFeatures: ['Available 24/7', 'Free repayment', 'Auto renewal'],
      lineOfCreditDuration: 'Renewable',
      vehicleFleet: 'Professional Vehicle Credit',
      vehicleFleetDesc: 'Finance your vehicle fleet or commercial vehicles',
      vehicleFleetFeatures: ['Lease or classic credit', 'Buyback option', 'Insurance included'],
      smeLoan: 'SME Loans',
      smeLoanDesc: 'Dedicated financing solutions for SMEs for growth, development and strategic investments',
      smeLoanFeatures: ['High amounts up to €1M', 'Flexible 1-10 year terms', 'Expert support'],
      amount: 'Amount',
      rate: 'APR',
      duration: 'Duration',
      months: 'months',
      years: 'years',
      features: 'Advantages',
      learnMore: 'Learn more',
      advantagesTitle: 'ALTUS Pro Advantages',
      advantages: [
        'Dedicated advisor for your business',
        'Personalized study of your file',
        'Support throughout your process',
        'Business plan package included',
      ],
      eligibilityTitle: 'Eligibility Criteria',
      eligibility: [
        'Company registered in France',
        'Active for more than 6 months',
        'No banking ban',
        'Up-to-date financial statements',
      ],
      rateDisclaimer: 'Indicative rates subject to study and acceptance of your application. Fixed APR.',
      simulateLoan: 'Simulate my business loan',
      contactAdvisor: 'Contact an advisor',
    },
    professionalFAQ: {
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to your questions quickly',
      faqs: [
        {
          question: 'What documents are required for a business loan application?',
          answer: 'For professionals: Company registration less than 3 months old, director\'s ID, financial statements for the last 3 years, complete tax documents, business bank statements (6 months), business plan (for startups), financial forecast. For individuals: ID, proof of address, recent pay slips and tax notice.',
        },
        {
          question: 'What personal contribution is required for a business loan?',
          answer: 'Personal contribution varies by project: 10-15% for equipment or material purchase, 20-30% for business creation or acquisition, 20-25% for commercial real estate. A larger contribution can improve your financing conditions and reduce your rate.',
        },
        {
          question: 'What is the timeframe to get a response and funds?',
          answer: 'Initial approval within 24-48h after submitting complete application. Final approval within 48h. Fund disbursement occurs 7 to 15 days after contract signature and guarantee setup. Average total time: 2 to 3 weeks.',
        },
        {
          question: 'What guarantees can I offer for my business loan?',
          answer: 'Several options: real guarantees (mortgage, business goodwill pledge, material lien), personal guarantees (joint and several surety from director), guarantee organizations (BPI France 40-70%, SIAGI, France Active, SOCAMA), or borrower insurance (mandatory: death/PTIA, optional: IPT/IPP/ITT).',
        },
        {
          question: 'Are loan interest payments tax deductible?',
          answer: 'Yes! Business loan interest is fully deductible from your company\'s taxable income, thus reducing your profit tax. Additionally, borrower insurance premiums are also deductible. VAT on interest and fees is recoverable for liable companies.',
        },
        {
          question: 'Can I get a loan if my company is less than one year old?',
          answer: 'Yes, we finance business startups with a solid business plan and personal contribution of 20-30%. We evaluate your professional experience, project viability and projections. An honor loan (BPI France, Initiative France) can strengthen your application.',
        },
        {
          question: 'Can I repay my business loan early?',
          answer: 'Yes, all our business loans allow early repayment. Penalties are capped by law: maximum 6 months interest or 3% of remaining capital. Some contracts provide free early repayment after a certain period.',
        },
        {
          question: 'What are the current rates for business loans?',
          answer: 'Our APR rates vary by project: Commercial real estate 2.9-5.5% (5-25 years), Equipment 3.9-7.5% (2-5 years), Business goodwill 4.7% (5-10 years), Cash flow 4.0-9.0% (3-36 months), Professional vehicles 3.2-6.5% (2-6 years). Rates personalized based on your profile and duration.',
        },
        {
          question: 'How does the online application process work?',
          answer: '1) Fill out our online form (5 min) and upload your documents. 2) Analysis of your application by our experts (24-48h). 3) Receive your approval in principle with conditions. 4) Electronic signature of contract. 5) Guarantee setup. 6) Fund disbursement to your Altus account.',
        },
        {
          question: 'Can I combine multiple types of financing?',
          answer: 'Yes, you can combine several solutions: bank loan + leasing for equipment, business loan + honor loan (BPI France) to strengthen equity, or line of credit + amortizing loan to combine flexibility and long-term financing.',
        },
        {
          question: 'Are there application fees and other charges?',
          answer: 'Application fees: 1-2% of amount for business loans (negotiable). Guarantee fees: variable depending on type (mortgage, pledge). Borrower insurance: 0.10% to 0.40% of borrowed capital per year. All fees are detailed in your loan offer.',
        },
        {
          question: 'What happens if I have repayment difficulties?',
          answer: 'Contact us at the first signs of difficulty. We can explore: temporary payment deferral, payment modulation, loan term extension, or credit reorganization. Preventive support is always preferable.',
        },
      ],
      notFoundTitle: 'Can\'t find the answer to your question?',
      notFoundDesc: 'Our team of experts is available Monday to Friday from 9am to 7pm',
      contactUs: 'Contact us',
      helpCenter: 'Help center',
    },
    features: {
      title: 'Why Choose Altus Finance Group?',
      subtitle: 'A modern and transparent lending platform that puts your needs first',
      security: 'Enterprise-Grade Banking Security',
      securityDesc: 'AES-256 encryption, GDPR compliance, SOC 2 Type II and ISO 27001 certification. Your financial data is protected with the same standards as major banks. Multi-factor authentication and 24/7 fraud monitoring.',
      fast: 'Express Response - Minutes to 24h',
      fastDesc: 'Our AI technology analyzes your file in real-time. Approval response in minutes to 24 hours maximum. Funds immediately released to your secure Altus account. Then transfer to your bank account whenever you want. 100% digital, zero paperwork.',
      competitive: 'Among The Lowest Rates on the Market',
      competitiveDesc: 'Thanks to our network of 50+ financial partners and optimized assessment technology, we negotiate the best rates for you: from 0.5% to 9.0% APR depending on profile and loan type. Automatic comparison to guarantee you the best offer.',
      flexible: 'Maximum Flexibility Without Penalty',
      flexibleDesc: 'Free early repayment anytime. Possible payment modulation according to your situation. Payment deferral in case of difficulties. Choice of debit date. You maintain total control of your credit.',
    },
    stats: {
      clients: 'Satisfied Clients',
      funded: 'Loans Provided',
      satisfaction: 'Satisfaction Rate',
      years: 'Years of Experience',
    },
    partners: {
      title: 'Our Financial Partners',
      subtitle: 'We collaborate with a wide network of leading banks and financial institutions to guarantee you the best conditions',
      banksNetwork: 'Partner Banks',
      loansFunded: 'Loans Funded',
      yearsExperience: 'Years of Experience',
      satisfactionRate: 'Satisfaction Rate',
      networkTitle: 'A Network of Trusted Partners',
      benefits: [
        'Access to over 50 financial institutions to compare the best offers',
        'Preferential rate negotiation thanks to our business volume',
        'Recognized expertise in credit brokerage for over 25 years'
      ]
    },
    testimonials: {
      title: 'What Our Clients Say',
      subtitle: 'Trusted by 15,000+ individuals and businesses',
      reviews: [
        { name: 'Sophie Martin', role: 'Business Owner', company: 'Organic Store Paris', text: 'Altus Finance Group enabled me to obtain quick financing to develop my business. The process was simple and transparent, I received the funds in less than a week.', rating: 5 },
        { name: 'Thomas Dubois', role: 'Individual', company: 'Homeowner', text: 'Excellent service for my mortgage. The advisors are attentive and found me the best rate. I highly recommend their services.', rating: 5 },
        { name: 'Marie Laurent', role: 'CFO', company: 'Tech Solutions Ltd', text: 'Thanks to Altus Finance Group, we were able to finance the purchase of new equipment. The repayment flexibility and competitive rate made all the difference.', rating: 5 },
        { name: 'Pierre Moreau', role: 'Craftsman', company: 'Traditional Bakery', text: 'A professional and efficient service. I got my home improvement loan without complications. The team supported me every step of the way.', rating: 5 },
        { name: 'Isabelle Rousseau', role: 'Retailer', company: 'Fashion & Accessories', text: 'I am very satisfied with the financing obtained for the expansion of my shop. Altus Finance Group truly understands the needs of entrepreneurs.', rating: 5 },
        { name: 'Jean Petit', role: 'Individual', company: 'Family Man', text: 'My car loan was approved quickly with an excellent rate. The online simulator allowed me to easily compare offers.', rating: 5 },
        { name: 'Caroline Durand', role: 'Nurse', company: 'Saint-Louis Hospital', text: 'I was able to finance my energy renovation work thanks to their green loan. The subsidized rates and advice on state aid helped me a lot.', rating: 5 },
        { name: 'Marc Lefebvre', role: 'Manager', company: 'Le Gourmet Restaurant', text: 'The revolving credit line saved my cash flow during the difficult period. Maximum flexibility and free early repayment.', rating: 5 },
        { name: 'Nathalie Bernard', role: 'Architect', company: 'Bernard & Associates', text: '100% digital and fast process. I got my business loan in 3 days. The interface is intuitive and clear.', rating: 5 },
        { name: 'François Garnier', role: 'Student', company: 'Business School', text: 'The student loan with deferred repayment allowed me to finance my studies stress-free. Preferential rates and without parental guarantee.', rating: 5 },
      ],
    },
    auth: {
      title: 'ALTUS',
      subtitle: 'Your trusted partner for financing',
      loginTab: 'Login',
      signupTab: 'Sign up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      fullName: 'Full name',
      phone: 'Phone',
      companyName: 'Company name',
      siret: 'SIRET',
      accountType: 'Account type',
      personal: 'Personal',
      personalLoan: 'Personal loan',
      business: 'Business/Professional',
      businessLoan: 'Business loan',
      login: 'Log in',
      loggingIn: 'Logging in...',
      signup: 'Create my account',
      signingUp: 'Signing up...',
      backToHome: 'Back to home',
      loginSuccess: 'Login successful!',
      loginSuccessDesc: 'Welcome to ALTUS',
      signupSuccess: 'Sign up successful!',
      signupSuccessDesc: 'A verification email has been sent to your address.',
      loginError: 'Login error',
      loginErrorDesc: 'Incorrect email or password',
      signupError: 'Error',
      signupErrorDesc: 'An error occurred during sign up',
      emailNotVerified: 'Email not verified',
      emailPlaceholder: 'john.doe@example.com',
      passwordPlaceholder: '••••••••',
      fullNamePlaceholder: 'John Doe',
      phonePlaceholder: '+44 20 1234 5678',
      companyNamePlaceholder: 'Company Ltd',
      siretPlaceholder: '123 456 789 00010',
      required: 'required',
      companyRequired: 'Company name is required for business accounts',
      emailInvalid: 'Invalid email',
      passwordMinLength: 'Password must contain at least 12 characters',
      passwordUppercase: 'Password must contain at least one uppercase letter',
      passwordLowercase: 'Password must contain at least one lowercase letter',
      passwordNumber: 'Password must contain at least one number',
      passwordSpecial: 'Password must contain at least one special character',
      passwordMatch: 'Passwords do not match',
      invalidOtp: 'Invalid or expired code',
      sessionExpired: 'Session expired',
      sessionExpiredMessage: 'Your session has expired. Please log in again.',
      accessDenied: 'Access denied',
      authenticationRequired: 'Authentication required',
      verificationError: 'Verification error',
      verificationInProgress: 'Verification in progress',
      emailVerified: 'Email verified',
      accountActiveAutoLogin: 'Your account is now active. You are automatically logged in and will be redirected to your dashboard in a few seconds...',
      linkExpiredInvalid: 'The verification link may be expired or invalid.',
      tokenMissing: 'Verification token missing',
      pleaseTwoFactorCode: 'Please enter your two-factor authentication code',
      verificationCodeSent: 'Verification code sent',
      twoFactorAuth: 'Two-factor authentication',
      enterOtpCode: 'Enter the 6-digit code sent to your email',
      otpExpiresIn: 'The code expires in 10 minutes',
      backToLogin: 'Back to login',
    },
    errors: {
      sessionExpired: 'Session expired',
      accessDenied: 'Access denied',
      authRequired: 'Authentication required',
      networkError: 'Network error. Please try again.',
      unexpectedError: 'An unexpected error occurred',
      verificationFailed: 'Verification failed',
    },
    settings: {
      title: 'Settings',
      profile: 'Profile',
      notifications: 'Notifications',
      security: 'Security',
      appearance: 'Appearance',
      personalInfo: 'Personal information',
      updateInfo: 'Update your profile information',
      fullName: 'Full name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company',
      saveChanges: 'Save changes',
      accountType: 'Account type',
      yourAccountType: 'Your account',
      individualAccount: 'Personal Account',
      businessAccount: 'Business Account',
      individualAccess: 'Access to personal financing services',
      businessAccess: 'Full access to business financing services',
      verified: 'Verified',
      notificationPreferences: 'Notification preferences',
      chooseNotifications: 'Choose how you want to be notified',
      emailAlerts: 'Email alerts',
      emailAlertsDesc: 'Receive important alerts by email',
      transferUpdates: 'Transfer updates',
      transferUpdatesDesc: 'Notifications about your transfer status',
      loanReminders: 'Payment reminders',
      loanRemindersDesc: 'Reminders for your loan payment dates',
      marketingEmails: 'Marketing emails',
      marketingEmailsDesc: 'Receive news and special offers',
      savePreferences: 'Save preferences',
      changePassword: 'Change password',
      updatePassword: 'Update your password',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmNewPassword: 'Confirm new password',
      themeSettings: 'Theme settings',
      chooseTheme: 'Select your preferred theme',
      lightMode: 'Light mode',
      darkMode: 'Dark mode',
      systemMode: 'System',
      languageSettings: 'Language settings',
      chooseLanguage: 'Select your language',
      changePhoto: 'Change photo',
      uploading: 'Uploading...',
      twoFactorAuth: 'Two-factor authentication',
      twoFactorAuthDesc: 'Add an extra layer of security to your account',
      twoFactorEnabled: 'Two-factor authentication enabled',
      enable2FA: 'Enable 2FA',
      twoFactorEnabledDesc: 'Your account is protected by two-factor authentication',
      twoFactorDisabledDesc: 'Protect your account with two-step verification via Google Authenticator',
      disable: 'Disable',
      configure: 'Configure',
      enabled: 'Enabled',
      twoFactorActiveMessage: 'Your account is secured with Google Authenticator. A code will be required at each login.',
      theme: 'Theme',
      themeDesc: 'Choose your preferred theme',
      light: 'Light',
      dark: 'Dark',
      languageLabel: 'Language',
      languageDesc: 'Select your language',
      disable2FASuccess: 'Success',
      disable2FASuccessDesc: '2FA disabled successfully',
      disable2FAError: 'Error disabling 2FA',
    },
    messages: {
      profileUpdated: 'Profile updated',
      profileUpdatedDesc: 'Your information has been successfully saved.',
      preferencesUpdated: 'Preferences saved',
      preferencesUpdatedDesc: 'Your notification preferences have been updated.',
      passwordChanged: 'Password changed',
      passwordChangedDesc: 'Your password has been successfully changed.',
      passwordMismatch: 'Passwords do not match',
      errorUpdatingProfile: 'Error updating profile',
      errorUpdatingPreferences: 'Error updating preferences',
      errorChangingPassword: 'Error changing password',
      avatarUpdated: 'Profile photo updated',
      avatarUpdatedDesc: 'Your profile photo has been successfully updated.',
      errorUploadingAvatar: 'Error uploading photo',
      invalidFileType: 'Unauthorized file type. Only JPEG, PNG and WebP images are accepted.',
      fileTooLarge: 'File is too large (max 5MB).',
    },
    bankCard: {
      title: 'Professional Bank Card',
      subtitle: 'Enjoy a bank card dedicated to your professional transactions',
      learnMore: 'Learn more',
      viewDetails: 'View details',
      orderNow: 'Order now',
      orderCard: 'Order my card',
      orderSuccess: 'Virtual card order',
      orderSuccessDesc: 'Your virtual card is being activated. You will receive details by email shortly.',
      modalTitle: 'Altus Professional Bank Card',
      modalSubtitle: 'A complete bank card for all your professional needs',
      advantagesTitle: 'Card Benefits',
      advantages: {
        cashback: '2% Cashback',
        cashbackDesc: 'Enjoy 2% cashback on all your professional purchases',
        noFees: 'No Hidden Fees',
        noFeesDesc: 'Complete transparency on all fees and commissions',
        protection: 'Maximum Protection',
        protectionDesc: 'Purchase insurance and fraud protection included',
        rewards: 'Rewards Program',
        rewardsDesc: 'Earn points on every transaction',
        global: 'Accepted Worldwide',
        globalDesc: 'Usable in over 200 countries and territories',
        support: 'Responsive support',
        supportDesc: 'Responsive customer service during business hours',
        maxSecurity: 'Max security',
        maxSecurityDesc: 'Temporary numbers with total protection',
        instantActivation: 'Instant activation',
        instantActivationDesc: 'Usable immediately',
        noFeesEuro: 'No fees',
        noFeesEuroDesc: '0% fees in euro zone',
        globallyAccepted: 'Globally accepted',
        globallyAcceptedDesc: 'Compatible with Apple Pay & Google Pay',
      },
      usageZonesTitle: 'Usage Zones',
      usageZones: {
        worldwide: 'International Payments',
        worldwideDesc: 'Accepted at all stores and websites worldwide',
        online: 'Online Shopping',
        onlineDesc: 'Secure for all your internet purchases',
        stores: 'In Store',
        storesDesc: 'Contactless payment and PIN code',
        atm: 'Cash Withdrawals',
        atmDesc: 'Free withdrawals at our partner ATM network',
      },
      feesTitle: 'Fees and Pricing',
      fees: {
        annualFee: 'Annual Fee',
        annualFeeAmount: 'Free first year, then £49/year',
        transactionFee: 'Transaction Fee',
        transactionFeeAmount: '0% in Eurozone',
        withdrawalFee: 'Cash Withdrawal',
        withdrawalFeeAmount: 'Free at partner network',
        foreignFee: 'Foreign Currency Payment',
        foreignFeeAmount: '1.5% outside Eurozone',
      },
      specificationsTitle: 'Technical Specifications',
      specifications: {
        cardType: 'Card Type',
        cardTypeValue: 'Visa Business Premium',
        creditLimit: 'Limit',
        creditLimitValue: 'Up to £50,000 per month',
        validity: 'Validity',
        validityValue: '5 years',
        delivery: 'Delivery Time',
        deliveryValue: '5-7 business days',
      },
      orderProcess: 'How to Order',
      orderProcessDesc: 'Order your card in a few clicks. After validation of your request, you will receive your card within 5-7 business days.',
      termsConditions: 'View terms and conditions',
      close: 'Close',
    },
    notifications: {
      loan_request: { title: 'Loan Request Submitted', message: 'Your {loanType} loan request for £{amount} has been successfully submitted. We will review your application shortly.' },
      loan_under_review: { title: 'Application Under Review', message: 'Your loan application for £{amount} is currently being reviewed by our team.' },
      loan_approved: { title: 'Loan Approved', message: 'Your loan application for £{amount} has been approved. You can now proceed to contract signing.' },
      loan_rejected: { title: 'Loan Rejected', message: 'Your loan application has been rejected. Reason: {reason}' },
      loan_contract_generated: { title: 'Loan Contract Available', message: 'Your loan contract for £{amount} is now available. Please download it, sign it, and return it.' },
      loan_contract_signed: { title: 'Signed Contract Received', message: 'We have received your signed contract for the £{amount} loan. Your loan will be processed shortly.' },
      loan_disbursed: { title: 'Funds Disbursed', message: 'Your loan funds of £{amount} have been successfully disbursed to your account.' },
      transfer_initiated: { title: 'Transfer Initiated', message: 'Your transfer of £{amount} to {recipientName} has been initiated and is being processed.' },
      transfer_completed: { title: 'Transfer Completed', message: 'Your transfer of £{amount} has been completed successfully.' },
      transfer_approved: { title: 'Transfer Approved', message: 'Your transfer request has been approved by the administration.' },
      transfer_suspended: { title: 'Transfer Suspended', message: 'Your transfer has been suspended. Reason: {reason}' },
      code_issued: { title: 'Validation Code Issued', message: 'A new validation code (#{sequence}) has been issued for your transfer. Check your emails.' },
      kyc_approved: { title: 'KYC Documents Approved', message: 'Your documents have been verified and approved. Your account is now active.' },
      kyc_rejected: { title: 'KYC Documents Rejected', message: 'Your documents have been rejected. Reason: {reason}. Please submit new documents.' },
      fee_added: { title: 'New Fee', message: 'Fees of £{amount} have been added to your account. Reason: {reason}' },
      account_status_changed: { title: 'Account Status Changed', message: 'Your account status has been updated to: {newStatus}. {reason}' },
      admin_message_sent: { title: 'New Admin Message', message: '{subject}' },
      general: { title: 'Notification', message: 'You have a new notification.' },
      twoFactorSuggestion: { title: 'Secure Your Account', message: 'Enable two-factor authentication to strengthen your account security.' },
      markAllRead: 'Mark all as read',
      markAsRead: 'Mark as read',
      deleteNotification: 'Delete',
    },
    dialogs: {
      newLoan: {
        title: 'New Loan Request',
        subtitle: 'Complete the information for your request',
        subtitleFirstRequest: 'First request: please provide your identity documents and complete the form',
        subtitleRegular: 'Fill out the form to submit a new loan request',
        loanType: 'Loan Type',
        selectLoanType: 'Select loan type',
        amount: 'Amount',
        enterAmount: 'Enter desired amount',
        duration: 'Duration',
        selectDuration: 'Select duration',
        months: 'months',
        estimatedRate: 'Estimated Rate',
        monthlyPayment: 'Estimated Monthly Payment',
        totalRepayment: 'Total Amount to Repay',
        firstRequestAlert: 'First Request:',
        firstRequestAlertDesc: 'Your documents will be verified once. Subsequent requests will no longer require documents.',
        addBankAccount: 'Add Bank Account',
        selectAccount: 'Select an account',
        bankName: 'Bank Name',
        bankNamePlaceholder: 'E.g.: HSBC',
        accountLabel: 'Account Label',
        accountLabelPlaceholder: 'E.g.: Main checking account',
        iban: 'IBAN',
        ibanPlaceholder: 'GB29 NWBK 6016 1331 9268 19',
        bic: 'BIC/SWIFT',
        bicPlaceholder: 'NWBKGB2L',
        uploadDocuments: 'Upload Your Documents',
        kycDocumentsTab: 'KYC Documents',
        additionalDocumentsTab: 'Additional Documents',
        loanDetailsTab: 'Loan Details',
        identity: 'Identity Document',
        proof_of_address: 'Proof of Address',
        income_proof: 'Proof of Income',
        business_registration: 'Business Registration',
        financial_statements: 'Financial Statements',
        tax_returns: 'Tax Returns',
        requiredDocuments: 'Required Documents',
        identityDoc: 'Identity Document (ID Card or Passport)',
        addressProof: 'Proof of Address (less than 3 months old)',
        bankStatement: 'Bank Statement (last 3 months)',
        uploadingInProgress: 'Uploading...',
        documentsUploadedSuccess: 'document(s) uploaded successfully',
        submit: 'Submit Request',
        submitting: 'Submitting...',
        cancel: 'Cancel',
        loanTypes: {
          personal: 'Personal Loan',
          auto: 'Auto Loan',
          mortgage: 'Mortgage Loan',
          green: 'Green Loan',
          renovation: 'Home Improvement Loan',
          student: 'Student Loan',
          business: 'Business Loan',
          cashFlow: 'Cash Flow Credit',
          equipment: 'Equipment Financing',
          commercialProperty: 'Commercial Property Loan',
          lineOfCredit: 'Line of Credit',
          vehicleFleet: 'Fleet Vehicle Credit',
        },
        errors: {
          amountMustBePositive: 'Amount must be greater than 0',
          amountMaxExceeded: 'Amount cannot exceed £1,000,000',
          rateMustBePositive: 'Rate must be positive',
          rateMaxExceeded: 'Rate cannot exceed 20%',
          durationMustBePositive: 'Duration must be greater than 0',
          durationMaxExceeded: 'Duration cannot exceed 360 months',
          documentsRequired: 'You must upload your KYC documents for your first request',
        },
        success: {
          loanSubmitted: 'Loan Request Submitted',
          loanSubmittedDesc: 'Your loan request has been successfully submitted.',
          documentsUploaded: 'Documents Uploaded',
          documentsUploadedDesc: 'document(s) sent successfully.',
        },
        error: {
          loanError: 'Error',
          loanErrorDesc: 'Unable to create the loan request.',
          partialUploadError: 'Partial Error',
          partialUploadErrorDesc: 'document(s) could not be uploaded.',
        },
      },
      transfer: {
        title: 'Transfer Funds',
        subtitle: 'Initiate a secure transfer to an external account',
        selectAccount: 'Select an account',
        noAccountsAvailable: 'No bank accounts available',
        amount: 'Amount',
        enterAmount: 'Enter amount',
        amountPlaceholder: '50000',
        recipient: 'Recipient',
        recipientPlaceholder: 'Recipient name or company',
        feesDescription: 'Transfer fees of 25€ will apply',
        availableFunds: 'Available Funds',
        feesAndProcessing: '2% fee • Processing within 24-48h',
        submit: 'Initiate Transfer',
        submitting: 'Processing...',
        creating: 'Creating...',
        createTransfer: 'Create transfer',
        cancel: 'Cancel',
        transferSuccess: 'Transfer initiated',
        transferSuccessDesc: 'Your transfer request has been created successfully',
        transferError: 'Error',
        transferErrorDesc: 'Unable to create transfer',
      },
      loanRequestModal: {
        title: 'Request a Loan',
        description: 'Fill out the form below and attach the required documents to submit your loan request.',
        loanType: 'Loan Type',
        selectLoanTypePlaceholder: 'Select a loan type',
        loanAmount: 'Loan Amount',
        duration: 'Duration',
        durationMonths: 'Duration (months)',
        months: 'months',
        interestRate: 'Interest Rate',
        estimatedMonthlyPayment: 'Estimated Monthly Payment',
        requiredDocuments: 'Required Documents',
        requiredDocumentsDescription: 'Please attach all documents marked as required to finalize your request.',
        required: 'Required',
        optional: 'Optional',
        attach: 'Attach',
        cancel: 'Cancel',
        submit: 'Submit Request',
        validationError: 'Please select a loan type',
        requestSent: 'Request Sent',
        requestSentDescription: 'Your loan request has been successfully submitted. You will receive a response within 48 hours.',
        error: 'Error',
        errorDescription: 'An error occurred while submitting your request.',
        fileTooLarge: 'File Too Large',
        fileTooLargeDescription: 'Maximum file size is 10MB.',
        missingDocuments: 'Missing Documents',
        missingDocumentsPrefix: 'Please attach all required documents:',
      },
      cardTerms: {
        title: 'Bank Card Terms and Conditions',
        acceptTerms: 'Accept Terms',
        declineTerms: 'Decline',
      },
      welcome: {
        title: 'Welcome to ALTUS',
        description: 'Your account has been successfully created',
        accountTypeTitle: 'Your Account Type',
        individualAccount: 'Personal Account',
        businessAccount: 'Business Account',
        individualAccess: 'Access to personal financing services',
        businessAccess: 'Full access to business financing services',
        availableOffers: 'Available offers for you',
        getStarted: 'Get Started',
        dialog: {
          title: 'Welcome to Altus Finance Group!',
          description: 'We are delighted to support you with your financing projects.',
        },
        account: {
          badgeLabel: 'Your account:',
          individual: {
            description: 'You have access to personal loan offers. These offers are specially designed for your personal needs and individual projects.',
          },
          business: {
            description: 'You have access to professional loan offers. These offers are specially designed for the development and growth of your business.',
          },
        },
        offers: {
          title: 'Available offers for you',
          individual: [
            'Personal Loan',
            'Mortgage',
            'Auto Loan',
            'Student Loan',
            'Green Loan',
            'Home Improvement Loan',
          ],
          business: [
            'Professional Loan',
            'Cash Flow Credit',
            'Equipment Financing',
            'Commercial Mortgage',
            'Line of Credit',
            'Vehicle Loan',
          ],
        },
        important: {
          title: 'Important:',
          message: 'Only the offers mentioned above will be accessible in your account.',
          individualSwitch: ' If you wish to access professional offers, you will need to create a business account.',
          businessSwitch: ' If you wish to access personal offers, you will need to create a personal account.',
        },
        cta: {
          primary: 'Got it, let\'s start',
          pending: 'Loading...',
        },
      },
      transactionHistory: {
        title: 'Transaction History',
        type: 'Type',
        amount: 'Amount',
        date: 'Date',
        status: 'Status',
        noTransactions: 'No transactions found',
        close: 'Close',
      },
    },
    verify: {
      verifying: 'Verifying...',
      success: 'Email Verified!',
      successMessage: 'Your email has been successfully verified. You will be redirected to the dashboard.',
      goToDashboard: 'Go to Dashboard',
      error: 'Verification Error',
      errorMessage: 'The verification link is invalid or has expired.',
      tryAgain: 'Try Again',
      backToSignup: 'Back to Signup',
      backToHome: 'Back to Home',
    },
    forgotPassword: {
      title: 'Forgot Password',
      description: 'Reset your password',
      instructions: 'Enter your email address and we will send you a link to reset your password.',
      emailLabel: 'Email Address',
      emailPlaceholder: 'your.email@example.com',
      sendResetLink: 'Send Reset Link',
      sending: 'Sending...',
      backToLogin: 'Back to Login',
      emailSent: 'Email Sent',
      emailSentDesc: 'A reset link has been sent to your email address.',
      error: 'Error',
      errorDesc: 'An error occurred. Please try again.',
    },
    resetPassword: {
      title: 'Reset Password',
      description: 'Create a new password',
      newPassword: 'New Password',
      newPasswordPlaceholder: 'Enter your new password',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm your new password',
      requirements: 'Password Requirements:',
      minLength: 'At least 12 characters',
      uppercase: 'One uppercase letter',
      lowercase: 'One lowercase letter',
      number: 'One number',
      specialChar: 'One special character',
      passwordStrength: 'Password Strength',
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
      veryStrong: 'Very Strong',
      resetPassword: 'Reset',
      resetting: 'Resetting...',
      success: 'Success',
      successMessage: 'Your password has been successfully reset.',
      error: 'Error',
      invalidToken: 'The reset link is invalid or has expired.',
      passwordMismatch: 'Passwords do not match.',
    },
    twoFactorAuth: {
      setup: {
        title: 'Set Up Two-Factor Authentication',
        description: 'Strengthen your account security',
        step1: 'Step 1: Download the App',
        step1Description: 'Download Google Authenticator or Authy on your phone',
        step2: 'Step 2: Scan the QR Code',
        step2Description: 'Scan this QR code with your authenticator app',
        step3: 'Step 3: Verify the Code',
        step3Description: 'Enter the 6-digit code generated by the app',
        qrCodeInstructions: 'Scan this QR code with your authenticator app',
        cantScanQR: 'Can\'t scan? Enter this code manually:',
        secretKey: 'Secret Key',
        enterCode: 'Enter 6-digit code',
        codePlaceholder: '000000',
        verify: 'Enable 2FA',
        verifying: 'Verifying...',
        cancel: 'Cancel',
        successTitle: '2FA Enabled',
        successMessage: 'Two-factor authentication has been successfully enabled.',
        errorTitle: 'Error',
        errorMessage: 'The code is invalid. Please try again.',
      },
      disable: {
        title: 'Disable Two-Factor Authentication',
        description: 'Enter your password to confirm',
        enterPassword: 'Password',
        passwordPlaceholder: 'Enter your password',
        disable: 'Disable 2FA',
        disabling: 'Disabling...',
        cancel: 'Cancel',
        successTitle: '2FA Disabled',
        successMessage: 'Two-factor authentication has been disabled.',
        errorTitle: 'Error',
        errorMessage: 'Incorrect password.',
      },
      login: {
        title: 'Two-Factor Authentication',
        description: 'Enter the code from your authenticator app',
        enterCode: '6-digit code',
        codePlaceholder: '000000',
        verify: 'Verify',
        verifying: 'Verifying...',
        cancel: 'Cancel',
        errorTitle: 'Error',
        errorMessage: 'Invalid code. Please try again.',
      },
    },
    bankAccounts: {
      title: 'Bank Accounts',
      description: 'Manage your external bank accounts',
      addAccount: 'Add Account',
      noAccountsTitle: 'No Bank Accounts',
      noAccountsDescription: 'Add a bank account to make transfers.',
      accountLabel: 'Label',
      bankName: 'Bank',
      iban: 'IBAN',
      bic: 'BIC',
      createdAt: 'Added on',
      actions: 'Actions',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this account?',
      deleteSuccess: 'Account deleted successfully',
      addAccountTitle: 'Add Bank Account',
      addAccountDescription: 'Add an external bank account for transfers',
      accountLabelLabel: 'Account Label',
      accountLabelPlaceholder: 'E.g.: Main checking account',
      accountLabelRequired: 'Label is required',
      bankNameLabel: 'Bank Name',
      bankNamePlaceholder: 'E.g.: HSBC',
      bankNameRequired: 'Bank name is required',
      ibanLabel: 'IBAN',
      ibanPlaceholder: 'GB29 NWBK 6016 1331 9268 19',
      ibanRequired: 'IBAN is required',
      invalidIban: 'Invalid IBAN format',
      bicLabel: 'BIC/SWIFT',
      bicPlaceholder: 'NWBKGB2L',
      invalidBic: 'Invalid BIC format',
      submit: 'Add Account',
      submitting: 'Adding...',
      cancel: 'Cancel',
      addSuccess: 'Account Added',
      addSuccessDesc: 'The bank account has been successfully added.',
      addError: 'Error adding account',
      addFirstAccount: 'Add your first account',
      deleteSuccessDesc: 'The bank account has been successfully deleted.',
      deleteError: 'Unable to delete the bank account.',
    },
    welcomeModal: {
      title: 'Welcome to ALTUS',
      description: 'Your account has been successfully created',
      accountType: 'Your Account Type',
      individualAccount: 'Personal Account',
      businessAccount: 'Business Account',
      individualAccess: 'Access to personal financing services',
      businessAccess: 'Full access to business financing services',
      availableOffers: 'Available offers for you',
      getStarted: 'Get Started',
    },
    calculator: {
      title: 'Amortization Calculator',
      description: 'Simulate your repayment plan',
      loanAmount: 'Loan Amount',
      interestRate: 'Annual Interest Rate (%)',
      loanDuration: 'Loan Duration',
      months: 'months',
      calculate: 'Calculate',
      results: 'Results',
      monthlyPayment: 'Monthly Payment',
      totalInterest: 'Total Interest',
      totalAmount: 'Total Amount',
      amortizationSchedule: 'Amortization Schedule',
      month: 'Month',
      payment: 'Payment',
      principal: 'Principal',
      interest: 'Interest',
      balance: 'Remaining Balance',
      downloadSchedule: 'Download Schedule',
    },
    amortization: {
      interactiveTitle: 'Interactive Amortization Schedule',
      interactiveDescription: 'Select an active loan and customize the parameters to see the impact on repayments',
      calculatorTitle: 'Interactive Amortization Calculator',
      calculatorDescription: 'Simulate your repayment plan and visualize your loan evolution',
      selectActiveLoan: 'Select an active loan',
      chooseLoan: 'Choose a loan...',
      loanOf: 'Loan of',
      at: 'at',
      loanAmount: 'Loan Amount (€)',
      annualInterestRate: 'Annual Interest Rate (%)',
      duration: 'Duration (years)',
      years: 'years',
      calculateAmortization: 'Calculate Amortization',
      calculatePlan: 'Calculate Amortization Plan',
      monthlyPayment: 'Monthly Payment',
      totalPayment: 'Total Payment',
      totalInterest: 'Total Interest',
      table: 'Table',
      evolution: 'Evolution',
      cumulative: 'Cumulative',
      breakdown: 'Breakdown',
      month: 'Month',
      payment: 'Payment',
      principal: 'Principal',
      interest: 'Interest',
      balance: 'Balance',
      amount: 'Amount (€)',
      monthLabel: 'Month',
      noActiveLoans: 'No active loans',
      noActiveLoansDesc: 'You don\'t have any active loans at the moment. Request a new loan to use this feature.',
      loanType: 'Loan Type',
      selectType: 'Select type',
      personal: 'Personal',
      business: 'Business',
      realEstate: 'Real Estate',
      automaticallyCalculated: 'Automatically calculated',
      rateInfo: 'The interest rate is calculated automatically based on the amount and loan type. All loan requests require administrative approval.',
      requestLoan: 'Request this loan',
      sending: 'Sending...',
      chart: 'Chart',
      balanceEvolution: 'Balance and payments evolution',
      principalVsInterest: 'Principal vs Interest breakdown',
      monthlyRepaymentPlan: 'Monthly repayment plan',
      remainingBalance: 'Remaining balance',
      errors: {
        amountPositive: 'The loan amount must be greater than €0',
        amountMax: 'The loan amount cannot exceed €10,000,000',
        rateNegative: 'The interest rate cannot be negative',
        rateMax: 'The interest rate cannot exceed 100%',
        durationPositive: 'The loan duration must be greater than 0 years',
        durationMax: 'The loan duration cannot exceed 50 years',
      },
    },
    kycDocuments: {
      title: 'KYC Documents',
      description: 'Upload your identification documents',
      uploadDocuments: 'Upload Your Documents',
      documentType: 'Document Type',
      selectDocumentType: 'Select type',
      identity: 'Identity Document',
      proof_of_address: 'Proof of Address',
      income_proof: 'Proof of Income',
      business_registration: 'Business Registration',
      financial_statements: 'Financial Statements',
      tax_returns: 'Tax Returns',
      chooseFile: 'Choose File',
      upload: 'Upload',
      uploading: 'Uploading...',
      uploadSuccess: 'Document Uploaded',
      uploadSuccessDesc: 'Your document has been successfully uploaded.',
      uploadError: 'Upload Error',
      status: 'Status',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      uploadedAt: 'Uploaded on',
      noDocuments: 'No documents uploaded',
    },
    transferFlow: {
      backToDashboard: 'Back to Dashboard',
      form: {
        title: 'New Transfer',
        subtitle: 'Initiate a secure transfer to an external account',
        amountLabel: 'Amount (EUR)',
        amountPlaceholder: '10000',
        amountHelper: 'Available funds for transfer',
        accountLabel: 'External Account (optional)',
        accountPlaceholder: 'Select an account',
        externalAccountLabel: 'Select an external bank account',
        selectAccountPlaceholder: 'Choose a registered account',
        noAccount: 'No account registered',
        recipientLabel: 'Recipient',
        recipientPlaceholder: 'Recipient name',
        initiateButton: 'Initiate Transfer',
        initiating: 'Initiating...',
      },
      verification: {
        title: 'Transfer Verification',
        subtitle: 'Please wait while we verify your transfer',
        doNotClose: 'Do not close this page',
        doNotCloseDesc: 'Your transfer is being verified by our secure system. This operation takes approximately 45 seconds.',
        progressLabel: 'Verification Progress',
        verificationSteps: 'Verification Steps',
        step1: 'Sender account verification',
        step2: 'Amount and fees validation',
        step3: 'Anti-fraud security check',
        step4: 'Secure transfer preparation',
      },
      validation: {
        title: 'Transfer Validation',
        subtitle: 'Code {sequence} / {total}',
        demoCodeLabel: 'Demo code:',
        codeLabel: 'Validation Code (6 digits)',
        codePlaceholder: '000000',
        codeHelpText: 'A code has been sent to your email',
        validateButton: 'Validate',
        validating: 'Validating...',
        resendButton: 'Resend',
        historyLabel: 'History',
      },
      progress: {
        titlePaused: 'Transfer Paused',
        titleInProgress: 'Transfer in Progress',
        securityVerificationTitle: 'Security Verification',
        transferProcessingTitle: 'Transfer Processing',
        toPrefix: 'to',
        securityVerificationRequired: 'Security verification required',
        enterVerificationCode: 'Please enter the verification code',
        codeFromAdvisor: 'Code received from your advisor',
        validationCodeLabel: 'Validation code',
        enterCodePlaceholder: 'Enter the 6-digit code',
        validating: 'Validating...',
        validateAndContinue: 'Validate and continue',
        processingTransfer: 'Processing transfer',
        doNotCloseProcessing: 'Do not close this window during processing',
        amountLabel: 'Amount: {amount} EUR to {recipient}',
        progressLabel: 'Progress',
        pauseTitle: 'Unlock code required at {percent}%',
        pauseDescription: 'Please contact customer service to obtain your transfer unlock code.',
        pauseCodeLabel: 'Unlock Code',
        pauseCodePlaceholder: 'Enter code',
        validatePauseCode: 'Validate Code',
        statusLabel: 'Current Status',
        statusCompleted: 'Transfer completed!',
        statusProcessing: 'Processing by our banking system...',
        eventsLabel: 'Events',
        circularProgressTitle: 'Transfer verification',
        circularProgressSubtitle: 'Your transaction is being securely processed.',
      },
      complete: {
        title: 'Transfer Completed',
        subtitle: 'Your transfer has been successfully completed',
        successMessage: 'Your transfer has been processed successfully',
        referenceLabel: 'Reference',
        returnToDashboard: 'Return to Dashboard',
        amountLabel: 'Amount',
        recipientLabel: 'Recipient',
        feesLabel: 'Fees',
      },
      toast: {
        transferInProgress: 'Transfer in progress',
        transferAlreadyInProgress: 'A transfer is already in progress',
        transferInitiated: 'Transfer initiated successfully',
        selectExternalAccount: 'Please select an external account',
        noActiveLoan: 'No active loan available for transfer',
        initiated: 'Transfer Initiated',
        initiatedDesc: 'Your transfer verification is in progress...',
        error: 'Error',
        errorInitiation: 'Transfer initiation failed',
        codeValidated: 'Code Validated',
        codeInvalid: 'Invalid Code',
        codeInvalidDesc: 'The code is incorrect or expired',
        codeSent: 'Code Sent',
        codeSentDesc: 'Code {sequence} sent successfully',
        approved: 'Transfer Approved',
        approvedDesc: 'Your transfer is approved and being processed.',
        fieldsRequired: 'Required Fields',
        fieldsRequiredDesc: 'Please fill in all fields',
        invalidCode: 'Invalid Code',
        invalidCodeDesc: 'Code must contain 6 digits',
        codeRequired: 'Code Required',
        codeRequiredDesc: 'Please enter the unlock code',
        unblocked: 'Transfer Unblocked',
        unblockedDesc: 'Transfer has been successfully unblocked',
      },
    },
    loanOffers: {
      pageTitle: 'Our Loan Offers',
      pageSubtitle: 'Discover all our financing solutions for individuals and professionals',
      accountInfo: '{accountType} Account:',
      individualTab: 'Personal Loans',
      businessTab: 'Business Loans',
      individual: 'Individual',
      business: 'Professional',
      amountLabel: 'Amount',
      rateLabel: 'Rate',
      durationLabel: 'Duration',
      advantagesLabel: 'Advantages',
      requestButton: 'Request this Loan',
      loginToRequest: 'Login to Request',
      types: {
        personalLoan: {
          title: 'Personal Loan',
          description: 'Flexible financing for all your personal projects',
          features: ['Quick response', 'No usage justification required', 'Flexible repayment'],
        },
        mortgageLoan: {
          title: 'Mortgage Loan',
          description: 'Finance the purchase of your primary or secondary residence',
          features: ['Fixed or variable rate', 'Up to 80% of amount', 'Insurance included'],
        },
        autoLoan: {
          title: 'Auto Loan',
          description: 'Purchase your new or used vehicle',
          features: ['Fast disbursement', 'Early repayment option', 'Optional insurance'],
        },
        studentLoan: {
          title: 'Student Loan',
          description: 'Finance your studies with advantageous conditions',
          features: ['Deferred repayment', 'Preferential rates', 'Parental guarantee optional'],
        },
        greenLoan: {
          title: 'Green Loan',
          description: 'Finance your energy renovation projects',
          features: ['Reduced rate', 'Eligible for government aid', 'Eco-responsible financing'],
        },
        renovationLoan: {
          title: 'Renovation Loan',
          description: 'Renovate and improve your home',
          features: ['No mortgage up to 75k', 'Progressive disbursement possible', 'Possible tax deduction'],
        },
        businessLoan: {
          title: 'Business Loan',
          description: 'Financing for your business projects, development and cash flow',
          features: ['Response within 48h', 'Fixed rate', 'Flexible repayment'],
        },
        cashFlowCredit: {
          title: 'Cash Flow Credit',
          description: 'Quick solution to manage your working capital needs',
          features: ['Fast disbursement', 'No guarantee up to 50k', 'Flexible'],
        },
        equipmentFinancing: {
          title: 'Equipment Financing',
          description: 'Purchase your professional equipment and materials',
          features: ['Up to 100% of amount', 'Leasing option', 'Tax deduction'],
        },
        commercialPropertyLoan: {
          title: 'Commercial Property Loan',
          description: 'Acquire your professional premises, offices or warehouses',
          features: ['Long duration', 'Down payment from 20%', 'Competitive rate'],
        },
        lineOfCredit: {
          title: 'Line of Credit',
          description: 'Revolving credit for your occasional needs',
          features: ['Available 24/7', 'Free repayment', 'Auto renewal'],
        },
        vehicleFleetLoan: {
          title: 'Commercial Vehicle Loan',
          description: 'Finance your vehicle fleet or commercial vehicles',
          features: ['Lease or traditional credit', 'Buyback option', 'Insurance included'],
        },
      },
    },
    cardTermsContent: {
      title: 'Terms and Conditions - ALTUS Virtual Card',
      lastUpdated: 'Last updated: November 2025',
      section1: {
        title: '1. PURPOSE AND SCOPE',
        content: 'These general terms and conditions (hereinafter "T&C") govern the use of the ALTUS virtual bank card (hereinafter "Virtual Card"), offered by ALTUS Finance Group to customers holding an ALTUS account (hereinafter "Cardholder"). The Virtual Card is a dematerialized means of payment linked to your ALTUS account.',
      },
      section2: {
        title: '2. SERVICE DESCRIPTION',
        subtitle1: '2.1 Nature of the Virtual Card',
        content1: 'The Virtual Card is a dematerialized payment card with a 16-digit card number, expiration date, and visual cryptogram (CVV). It functions like a physical bank card but exists only in electronic form.',
        subtitle2: '2.2 Card Type',
        item1: 'Permanent virtual card: fixed credentials for its entire validity period (3 years)',
        item2: 'Temporary virtual card: temporary credentials with configurable amount and duration',
      },
      section3: {
        title: '3. ELIGIBILITY CONDITIONS',
        content: 'To obtain a Virtual Card, the Cardholder must:',
        list: [
          'Be an ALTUS customer with an active and funded account',
          'Have completed identity verification (KYC)',
          'Not be in an unauthorized overdraft situation',
          'Have activated strong authentication (two-factor)',
          'Accept these T&C and the Pricing Conditions',
        ],
      },
      section4: {
        title: '4. ACTIVATION AND USE',
        subtitle1: '4.1 Activation',
        content1: 'The Virtual Card is instantly activated upon creation via the ALTUS application or client area. The Cardholder immediately receives the complete card credentials.',
        subtitle2: '4.2 Authorized Uses',
        list1: [
          'Payments on all online merchant sites accepting Visa/Mastercard',
          'Recurring payments and subscriptions (permanent card only)',
          'Purchases on international sites',
          'Contactless payments in stores (if added to Apple Pay/Google Pay)',
        ],
        subtitle3: '4.3 Limitations',
        list2: [
          'No cash withdrawals at ATMs',
          'Physical presentation impossible (car rental, some hotels)',
          'Some providers may refuse virtual cards',
        ],
      },
      section5: {
        title: '5. SECURITY AND PROTECTION',
        subtitle1: '5.1 Enhanced Security',
        list1: [
          'Your physical bank card credentials are never exposed',
          'Ability to instantly lock/unlock the card',
          'Permanent deletion with one click',
          '3D Secure protection on all transactions',
          'Dynamic CVV for maximum security',
        ],
        subtitle2: '5.2 Cardholder Obligations',
        content2: 'The Cardholder agrees to keep Virtual Card credentials confidential and not share them with third parties. In case of suspected fraud, the Cardholder must immediately lock or delete the card via their client area.',
        subtitle3: '5.3 Guarantees and Insurance',
        content3: 'The Virtual Card benefits from the same guarantees as your physical card, including fraud protection, purchase insurance, and compliant delivery guarantee.',
      },
      section6: {
        title: '6. LIMITS AND CEILINGS',
        content: 'The Virtual Card payment limits are identical to those of your main ALTUS card:',
        list: [
          'Monthly limit: up to €50,000 depending on your profile',
          'Per transaction limit: up to €10,000',
          'Ability to temporarily adjust limits from the application',
        ],
        content2: 'For temporary cards, you define the maximum amount and validity duration during creation.',
      },
      section7: {
        title: '7. PRICING',
        list: [
          'Virtual card creation: Free',
          'Transaction fees in euro zone: 0%',
          'Payments outside euro zone: 1.5% of amount',
          'Annual fee: Free',
          'Lock/Unlock: Free and unlimited',
        ],
      },
      section8: {
        title: '8. DEBIT AND STATEMENT',
        content: 'All operations performed with the Virtual Card are debited in real-time from your ALTUS account. They appear immediately in your transaction history and on your monthly statements.',
      },
      section9: {
        title: '9. OPPOSITION AND TERMINATION',
        subtitle1: '9.1 Temporary Lock',
        content1: 'You can lock your Virtual Card at any time from your client area. Unlocking is instant.',
        subtitle2: '9.2 Permanent Deletion',
        content2: 'Deletion of a Virtual Card is immediate and irreversible. Subscriptions linked to this card will be automatically refused. It is recommended to update your payment information with concerned merchants before deletion.',
        subtitle3: '9.3 In Case of Fraud',
        content3: 'In case of loss or suspected theft of credentials, immediately delete the card from your application and contact our customer service at +44 XX XX XX XX (available 24/7).',
      },
      section10: {
        title: '10. LIABILITY',
        content: 'ALTUS cannot be held liable in case of:',
        list: [
          'Merchant refusal to accept the Virtual Card',
          'Temporary service interruption for maintenance',
          'Fraudulent use resulting from Cardholder negligence',
          'Commercial disputes between Cardholder and merchant',
        ],
        content2: 'The Cardholder is fully responsible for use of their Virtual Card and operations performed until notification of fraudulent use.',
      },
      section11: {
        title: '11. TERM AND MODIFICATION',
        content: 'These T&C are concluded for an indefinite period. ALTUS reserves the right to modify these T&C at any time. Any modification will be notified to the Cardholder at least 2 months before its entry into force. Absence of opposition within this period will constitute acceptance.',
      },
      section12: {
        title: '12. COMPLAINTS',
        content: 'For any complaint, the Cardholder may contact ALTUS customer service:',
        list: [
          'By email: support@altusgroup.com',
          'By phone: +44 XX XX XX XX',
          'Via secure client area',
        ],
        content2: 'In the absence of a satisfactory response within 2 months, the Cardholder may contact the Financial Services Ombudsman.',
      },
      section13: {
        title: '13. APPLICABLE LAW AND JURISDICTION',
        content: 'These T&C are governed by English law. Any dispute relating to their interpretation or execution falls under the exclusive jurisdiction of English courts.',
      },
      note: 'By activating your ALTUS Virtual Card, you acknowledge having read, understood, and accepted all of these Terms and Conditions.',
    },
    processTimeline: {
      title: 'Financing Process',
      subtitle: 'From your request to fund disbursement: a simplified and fast journey',
      step1Title: 'Online Application',
      step1Duration: '5 minutes',
      step1Description: 'Fill out our secure form and upload your supporting documents',
      step1Docs: [
        'Company registration less than 3 months old',
        'Manager\'s ID',
        'Latest financial statements',
        'Bank statements (3 months)'
      ],
      step2Title: 'File Analysis',
      step2Duration: '24-48h',
      step2Description: 'Our expert team reviews your request and repayment capacity',
      step2Docs: [
        'Document verification',
        'Financial analysis',
        'Creditworthiness assessment',
        'Personalized rate calculation'
      ],
      step3Title: 'Approval in Principle',
      step3Duration: '48h',
      step3Description: 'Receipt of your detailed loan offer with final conditions',
      step3Docs: [
        'Approved amount',
        'APR and monthly payments',
        'Required guarantees',
        'Suspensive conditions'
      ],
      step4Title: 'Fund Disbursement',
      step4Duration: '7-15 days',
      step4Description: 'Electronic contract signature and payment within 7 to 15 days after guarantee implementation',
      step4Docs: [
        'Loan contract signature',
        'Guarantee implementation',
        'Borrower insurance',
        'Fund transfer'
      ],
      documentsTitle: 'Documents to Prepare Based on Your Project',
      creationTitle: 'Business Creation',
      creationDocs: [
        'Detailed business plan',
        '3-year financial forecast',
        'Financing plan',
        'Manager\'s CV and experience',
        'Proof of personal contribution'
      ],
      repriseTitle: 'Business Acquisition',
      repriseDocs: [
        'Acquisition agreement protocol',
        'Last 3 years\' financial statements',
        'Business valuation',
        'Commercial lease',
        'No-lien certificate'
      ],
      developmentTitle: 'Development',
      developmentDocs: [
        'Last 3 years\' financial statements',
        'Complete tax package',
        'Supplier quotes (equipment)',
        'Business bank statements (6 months)',
        'Business forecast'
      ],
      incompleteTitle: 'Incomplete file? Don\'t panic!',
      incompleteDescription: 'Our team helps you build your file. We assist you in obtaining missing documents.',
      needHelp: 'Need help?',
      averageTime: 'Average total time:',
      averageTimeValue: '2 to 3 weeks from file submission to fund disbursement',
      startApplication: 'Start my application'
    },
    guaranteesSection: {
      title: 'Guarantees & Security',
      subtitle: 'Multiple options to secure your financing and optimize your taxes',
      organizationalTitle: 'Organizational Guarantees',
      organizationalItems: [
        'BPI France (40-70% of loan)',
        'SIAGI (craftsmen/merchants guarantee)',
        'France Active (social economy)',
        'SOCAMA (farmers)'
      ],
      realTitle: 'Real Guarantees',
      realItems: [
        'Real estate mortgage',
        'Business pledge',
        'Equipment/material lien',
        'Money lender\'s privilege'
      ],
      personalTitle: 'Personal Guarantees',
      personalItems: [
        'Manager\'s joint surety',
        'Professional bank guarantee',
        'First demand guarantee',
        'Group comfort letter'
      ],
      insuranceTitle: 'Borrower Insurance',
      insuranceItems: [
        'Death / PTIA (mandatory)',
        'Permanent disability (IPT/IPP)',
        'Temporary incapacity (ITT)',
        'Tax-deductible premiums'
      ],
      taxBenefitsTitle: 'Professional Loan Tax Benefits',
      taxBenefit1Title: 'Interest deductibility',
      taxBenefit1Description: 'Loan interest is deductible from your company\'s taxable income, thus reducing your profit tax.',
      taxBenefit2Title: 'Accelerated depreciation',
      taxBenefit2Description: 'For financed equipment, accelerated depreciation is possible under certain conditions (new, ecological equipment, etc.).',
      taxBenefit3Title: 'Tax credit',
      taxBenefit3Description: 'Certain investments qualify for tax credits (energy transition, digital, training).',
      taxBenefit4Title: 'Recoverable VAT',
      taxBenefit4Description: 'VAT on interest and processing fees is recoverable for taxable companies.',
      taxAdvice: 'Tax advice: Consult your accountant to optimize loan deductibility and maximize your tax benefits.',
      contributionTitle: 'Required Personal Contribution',
      equipmentPercentage: '10-15%',
      equipmentLabel: 'Equipment',
      equipmentDescription: 'Equipment, vehicles',
      creationPercentage: '20-30%',
      creationLabel: 'Creation / Acquisition',
      creationDescription: 'Business assets',
      realEstatePercentage: '20-25%',
      realEstateLabel: 'Commercial Real Estate',
      realEstateDescription: 'Premises, offices',
      contributionDisclaimer: '* Indicative percentages may vary depending on your project and profile'
    },
    footer: {
      description: 'Your trusted partner for all your financing projects. Loan solutions tailored to individuals and professionals.',
      phone: '+352 40 63 48',
      email: 'infos@altusfinancegroup.com',
      address: '19 Rue Sigismond, L-2537 Luxembourg',
      hoursTitle: 'Opening Hours',
      hours: {
        weekdays: 'Mon - Fri: 9:00 AM - 7:00 PM',
        weekend: 'Sat: 9:00 AM - 5:00 PM',
        support: 'Responsive support',
      },
      certificationsTitle: 'Certifications & Security',
      certifications: [
        'Regulated by ACPR',
        'ISO 27001 Certified',
        'GDPR Compliant',
        'SSL/TLS Secured',
        'FBF Member',
      ],
      productsTitle: 'Our Products',
      products: {
        personal: 'Personal Loans',
        business: 'Business Loans',
        mortgage: 'Mortgage Loan',
        auto: 'Auto Credit',
        renovation: 'Home Improvement Loan',
      },
      companyTitle: 'Company',
      careers: 'Careers',
      legalTitle: 'Legal',
      legalLinks: {
        terms: 'Legal Notice',
        privacy: 'Privacy Policy',
        cgu: 'Terms of Use',
        cookies: 'Cookies',
        gdpr: 'GDPR',
      },
      helpTitle: 'Help',
      helpLinks: {
        faq: 'FAQ',
        userGuide: 'User Guide',
        support: 'Customer Support',
        simulator: 'Loan Simulator',
        contactUs: 'Contact Us',
      },
      copyright: 'Altus Finance Group. All rights reserved.',
      regulatory: 'Altus Finance Group is a financing brand approved by the ACPR. Credit organization subject to the control of the Bank of France.',
      disclaimer: 'Attention, borrowing money also costs money. The information on this page is provided for informational purposes only and does not constitute a contractual offer. All credit applications are subject to review and acceptance of the file. A credit commits you and must be repaid. Check your repayment capacity before committing.',
    },
    seo: {
      home: {
        title: 'Altus Finance Group - Professional & Personal Loans | Fast and Competitive Financing',
        description: 'Professional and personal loan solutions with Altus Finance Group. Get fast financing for your business or personal project. Competitive rates, simple and transparent process.',
      },
      about: {
        title: 'About Altus Finance Group - Our Mission and Values | Financing Solutions',
        description: 'Discover Altus Finance Group, leader in professional loan solutions with over 15 years of experience, 15,000+ satisfied clients and €500M in loans granted. Our mission: make financing accessible to all.',
      },
      contact: {
        title: 'Contact Us - Altus Finance Group | Questions About Our Professional Loans',
        description: 'Have a question about our financing solutions? Contact Altus Finance Group. Our team is available to support you with your professional loan project. Fast response guaranteed.',
      },
      howItWorks: {
        title: 'How to Get a Business Loan - Detailed Process | Altus Finance Group',
        description: 'Discover the complete process to obtain a professional loan with Altus Finance Group. From online application to fund release: criteria, required documents and timeframes. Response in 24-48h.',
      },
      forgotPassword: {
        title: 'Forgot Password | Altus Finance Group',
        description: 'Reset your password',
        emailSentTitle: 'Email Sent | Altus Finance Group',
        emailSentDescription: 'A reset link has been sent',
      },
      resetPassword: {
        title: 'Reset Password | Altus Finance Group',
        description: 'Create a new password for your account',
      },
      twoFactorSetup: {
        title: '2FA Setup | Altus Finance Group',
        description: 'Set up two-factor authentication to secure your account',
      },
      verifyTwoFactor: {
        title: '2FA Verification | Altus Finance Group',
        description: 'Two-factor verification',
      },
    },
    admin: {
      common: {
        status: {
          pending: 'Pending',
          active: 'Active',
          approved: 'Approved',
          rejected: 'Rejected',
          suspended: 'Suspended',
          completed: 'Completed',
          signed: 'Signed',
          inProgress: 'In Progress',
        },
        actions: {
          approve: 'Approve',
          reject: 'Reject',
          delete: 'Delete',
          suspend: 'Suspend',
          save: 'Save',
          download: 'Download',
          upload: 'Upload',
          send: 'Send',
          edit: 'Edit',
          cancel: 'Cancel',
          disburse: 'Disburse',
        },
        labels: {
          user: 'User',
          userName: 'User Name',
          userEmail: 'User Email',
          amount: 'Amount',
          type: 'Type',
          rate: 'Rate',
          duration: 'Duration',
          status: 'Status',
          date: 'Date',
          createdAt: 'Created',
          actions: 'Actions',
          fees: 'Fees',
          progress: 'Progress',
          codes: 'Codes',
          recipient: 'Recipient',
          contract: 'Contract',
          months: 'months',
          total: 'Total',
          active: 'active',
          pending: 'pending',
          recent: 'Recent',
          all: 'All',
          noData: 'No data',
          loading: 'Loading...',
          error: 'Error',
          success: 'Success',
          balance: 'Balance',
          loans: 'Loans',
        },
        messages: {
          error: 'Error',
          success: 'Success',
          updated: 'Updated',
          approved: 'Approved',
          rejected: 'Rejected',
          deleted: 'Deleted',
          disbursed: 'Disbursed',
          cannotApprove: 'Cannot approve',
          cannotReject: 'Cannot reject',
          cannotDelete: 'Cannot delete',
          cannotUpdate: 'Cannot update',
          loadError: 'Loading error',
        },
        empty: {
          noResults: 'No results',
          noData: 'No data available',
        },
      },
      dashboard: {
        title: 'Admin Console',
        description: 'Platform overview and user management',
        totalUsers: 'Total Users',
        activeUsers: 'active',
        pendingUsers: 'pending',
        transfers: 'Transfers',
        transfersPending: 'in progress',
        loans: 'Loans',
        loansActive: 'active',
        totalVolume: 'Total Volume',
        volumeDescription: 'Total transfers',
        recentUsers: 'Recent Users',
        recentUsersDescription: 'Latest registrations',
        recentTransfers: 'Recent Transfers',
        recentTransfersDescription: 'Latest transactions',
      },
      loans: {
        title: 'Loan Management',
        description: 'Manage all platform loan requests',
        allLoans: 'All Loans',
        allLoansDescription: 'Complete list of loan applications',
        loanApproved: 'Loan approved',
        loanApprovedDesc: 'The loan has been successfully approved. The contract has been generated.',
        loanRejected: 'Loan rejected',
        loanRejectedDesc: 'The loan has been successfully rejected',
        loanDeleted: 'Loan deleted',
        loanDeletedDesc: 'The loan has been successfully deleted',
        fundsDisbursed: 'Funds disbursed',
        fundsDisbursedDesc: 'The funds have been successfully disbursed. The user has been notified.',
        contractGenerated: '📄 Generated',
        contractSigned: '✅ Signed',
        approveReason: 'Approval reason',
        rejectReason: 'Rejection reason',
        deleteReason: 'Deletion reason',

        approveDialogDesc: 'This action will approve the {amount} loan for {userName} and generate the contract.',
        rejectDialogTitle: 'Reject loan',
        rejectDialogDesc: 'This action will permanently reject the loan. The user will be notified.',
        disburseDialogTitle: 'Disburse funds',
        disburseDialogDesc: 'This action will disburse {amount} to {userName}. The loan will become active and the user will be able to make transfers.',
        deleteDialogTitle: 'Delete loan',
        deleteDialogDesc: 'This action will permanently delete the loan.',
      },
      transfers: {
        title: 'Transfer Management',
        description: 'Approve or suspend transfer requests',
        allTransfers: 'All Transfers',
        allTransfersDescription: 'Complete list of fund transfers',
        transferUpdated: 'Transfer updated',
        transferUpdatedDesc: 'The transfer status has been successfully updated',
        approveDialogTitle: 'Approve transfer',
        approveDialogDesc: 'This action will approve the transfer and update its status to "in progress".',
        suspendDialogTitle: 'Suspend transfer',
        suspendDialogDesc: 'This action will suspend the transfer. It can be reactivated later.',
      },
    },
    expertise: {
      title: 'Our Areas of Expertise',
      subtitle: 'Tailored financial solutions for all your projects',
      realEstate: 'Real Estate Loan',
      realEstateDesc: 'Financing for your primary or secondary residence with advantageous rates and personalized support.',
      personal: 'Personal Loan',
      personalDesc: 'Flexible solutions for your personal projects: travel, renovations, events, or debt consolidation.',
      professional: 'Professional Credit',
      professionalDesc: 'Dedicated support for developing your professional activity and acquiring equipment.',
      consolidation: 'Debt Consolidation',
      consolidationDesc: 'Consolidate your current loans to simplify management and reduce monthly payments.',
      business: 'Business Financing',
      businessDesc: 'Financing solutions tailored to your company\'s needs to support its growth.',
      investment: 'Rental Investment',
      investmentDesc: 'Finance your rental real estate investment projects with optimal conditions.',
    },
    howItWorksSection: {
      title: 'How It Works',
      subtitle: 'A simple and quick process in 4 steps',
      step1Title: 'Registration',
      step1Desc: 'Create your account in just a few minutes and complete your profile securely.',
      step2Title: 'Analysis',
      step2Desc: 'Our team of experts analyzes your application and assesses your borrowing capacity.',
      step3Title: 'Validation',
      step3Desc: 'Receive your personalized offer and electronically sign your contract.',
      step4Title: 'Disbursement',
      step4Desc: 'Funds are transferred to your account within 7 to 15 business days.',
      ctaText: 'Ready to start your project?',
      ctaButton: 'Start my application',
    },
    premiumTestimonials: {
      title: 'They Trust Us',
      subtitle: 'Discover testimonials from our satisfied customers',
      testimonial1Name: 'Marie Dubois',
      testimonial1Role: 'Homeowner',
      testimonial1Content: 'Exceptional service! I obtained my mortgage in less than 3 weeks. The team is professional and attentive.',
      testimonial2Name: 'Sophie Laurent',
      testimonial2Role: 'Entrepreneur',
      testimonial2Content: 'Thanks to Altus Finance Group, I was able to finance my business development. Personalized support from start to finish.',
      testimonial3Name: 'Pierre Richard',
      testimonial3Role: 'Investor',
      testimonial3Content: 'The rates offered are very competitive and the process is 100% digital. I highly recommend their services.',
      testimonial4Name: 'Anne Martin',
      testimonial4Role: 'Business Owner',
      testimonial4Content: 'A responsive team and solutions tailored to my needs. The debt consolidation helped me better manage my budget.',
    },
    bankingSecurity: {
      badge: 'Banking Security',
      title: 'Your security, our priority',
      subtitle: 'Maximum protection of your data with the highest banking standards',
      aes256Title: 'AES-256 Encryption',
      aes256Desc: 'All your data is protected by military-grade encryption, ensuring absolute confidentiality.',
      mfaTitle: 'MFA Authentication',
      mfaDesc: 'Mandatory two-factor authentication to secure access to your account and transactions.',
      kycTitle: 'KYC/AML Process',
      kycDesc: 'Rigorous identity verification compliant with European anti-money laundering standards.',
      euHostingTitle: 'EU Hosting',
      euHostingDesc: 'Secure servers located in the European Union for full GDPR compliance.',
      monitoringTitle: '24/7 Monitoring',
      monitoringDesc: 'Continuous monitoring of suspicious activities by our advanced detection systems.',
      gdprTitle: 'GDPR Compliance',
      gdprDesc: 'Strict compliance with European regulations on personal data protection.',
      certified: 'ISO 27001 Certified',
      compliance: 'GDPR Compliant',
      audited: 'Regular Audits',
    },
    finalCTA: {
      badge: 'Start Now',
      title: 'Ready to realize your projects?',
      subtitle: 'Join thousands of clients who trust us to finance their projects',
      benefit1: 'Response within 24 to 48 hours',
      benefit2: '100% digital and secure process',
      benefit3: 'Personalized support',
      benefit4: 'Guaranteed competitive rates',
      primaryButton: 'Open my file',
      secondaryButton: 'Talk to an advisor',
      trustText: '✓ No commitment • 24h response • 100% secure',
      stat1Value: '15,000+',
      stat1Label: 'Satisfied Customers',
      stat2Value: '98%',
      stat2Label: 'Approval Rate',
      stat3Value: '24h',
      stat3Label: 'Response Time',
      stat4Value: '€500M+',
      stat4Label: 'Funds Distributed',
    },
  },
  es: {
    hero: {
      title: 'Haga Realidad sus Proyectos con Altus Finance Group',
      subtitle: 'Soluciones de financiamiento para particulares y empresas - Tasas competitivas y proceso transparente',
      cta1: 'Solicitar financiación',
      cta2: 'Mi Cuenta',
      learnMore: 'Saber Más',
      trustIndicator: 'Más de 15,000 clientes satisfechos confían en nosotros',
      trustBadges: {
        response24h: 'Respuesta en 24h',
        swissSecurity: 'Seguridad bancaria suiza',
        fastApproval: 'Aprobación rápida',
      },
      calculator: {
        title: 'Calcule su Presupuesto',
        subtitle: 'Obtenga una estimación instantánea',
        loanAmount: 'Monto del Préstamo',
        duration: 'Duración (meses)',
        monthlyPayment: 'Pago Mensual',
        perMonth: 'por mes',
        applyNow: 'Solicitar Ahora',
        disclaimer: 'Solicitud gratuita - Sin compromiso - Proceso confidencial',
      },
      slides: [
        {
          title: 'Altus Finance Group',
          subtitle: 'Soluciones de financiación profesionales y seguras para acompañar su crecimiento.',
        },
        {
          title: 'Experiencia Financiera de Excelencia',
          subtitle: 'Soluciones a medida adaptadas a sus ambiciones empresariales y patrimoniales.',
        },
        {
          title: 'Su Socio de Confianza',
          subtitle: 'Acompañamiento personalizado y discreción absoluta para todos sus proyectos de financiación.',
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
      tagline: 'Soluciones Financieras Premium',
      more: 'Más',
      moreInfo: 'Más información',
      language: 'Idioma',
      loansMenu: {
        label: 'Nuestros Préstamos',
        items: [
          {
            title: 'Crédito Personal',
            description: 'Financie sus proyectos personales con tasas competitivas',
            href: '/loans/personal-credit',
          },
          {
            title: 'Refinanciación de Préstamos',
            description: 'Agrupe sus préstamos para simplificar los reembolsos',
            href: '/loans/loan-refinancing',
          },
          {
            title: 'Refinanciación de Leasing',
            description: 'Optimice sus costos refinanciando su leasing',
            href: '/loans/lease-refinancing',
          },
          {
            title: 'Refinanciación de Tarjeta de Crédito',
            description: 'Reduzca las tasas de interés de sus tarjetas de crédito',
            href: '/loans/credit-card-refinancing',
          },
          {
            title: 'Créditos Diversos',
            description: 'Soluciones de financiamiento adaptadas a todas sus necesidades',
            href: '/products',
          },
          {
            title: 'Préstamos PYME',
            description: 'Financiamiento empresarial para hacer crecer su compañía',
            href: '/products',
          },
        ],
      },
      howItWorks: 'Cómo Funciona',
      resources: 'Recursos',
      faq: 'FAQ',
      about: 'Acerca de',
      contact: 'Contacto',
      phone: '+352 40 63 48',
      dashboard: 'Panel',
      loans: 'Préstamos',
      myLoans: 'Mis Préstamos',
      newLoan: 'Solicitud de Préstamo',
      contracts: 'Contratos',
      loansSection: 'Préstamos',
      transfers: 'Transferencias',
      history: 'Historial',
      settings: 'Configuración',
      logout: 'Cerrar Sesión',
      users: 'Usuarios',
      documents: 'Documentos KYC',
      reports: 'Informes',
    },
    contracts: {
      title: 'Gestión de Contratos',
      description: 'Descargue, firme y devuelva sus contratos de préstamo de forma segura.',
      loanNumber: 'Préstamo',
      approvedOn: 'Aprobado el',
      actionRequired: 'Acción requerida',
      step1: '1. Descargar el contrato',
      step1Description: 'Descargue y lea detenidamente su contrato de préstamo.',
      step2: '2. Firmar y devolver',
      step2Description: 'Firme el contrato y devuélvalo en formato PDF.',
      downloadContract: 'Descargar contrato',
      tabPending: 'Por firmar',
      tabReview: 'En verificación',
      tabCompleted: 'Completados',
      inReview: 'En verificación',
      signed: 'Firmado',
      noPendingContracts: 'No hay contratos pendientes',
      noPendingContractsDescription: 'Todos sus contratos han sido firmados y enviados.',
      noReviewContracts: 'No hay contratos en verificación',
      noReviewContractsDescription: 'Actualmente no hay contratos pendientes de verificación.',
      noCompletedContracts: 'No hay contratos firmados',
      noCompletedContractsDescription: 'Sus contratos firmados aparecerán aquí.',
      reviewMessage: 'Su contrato firmado ha sido recibido y está siendo verificado por nuestro equipo. Se le notificará cuando se liberen los fondos.',
      signedSuccess: 'Contrato firmado y validado con éxito',
      downloadOriginal: 'Descargar contrato original',
    },
    dashboard: {
      welcome: 'Bienvenido',
      welcomeUser: 'Bienvenido, {name}',
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
      yourGlobalBalance: 'Su Saldo Global',
      noActiveLoans: 'Sin Préstamos Activos',
      noTransfers: 'No se encontraron transferencias',
      dataLoadError: 'Error al cargar datos',
      available: 'disponible',
      notifications: 'Notificaciones',
      noNotifications: 'Sin notificaciones',
      viewDetails: 'Ver Detalles',
      availableOffers: 'Ofertas disponibles para usted',
      contractToSign: 'Contrato para firmar',
      moreTransfers: 'transferencia(s) adicional(es)',
      goodMorning: 'Buenos días',
      goodAfternoon: 'Buenas tardes',
      goodEvening: 'Buenas noches',
      totalBalance: 'Saldo total',
      newTransfer: 'Nueva transferencia',
      requestLoan: 'Solicitar un préstamo',
      manageAccounts: 'Gestionar cuentas',
      cashflow: 'Flujo de caja',
      incomeExpensesSixMonths: 'Ingresos y gastos en 6 meses',
      income: 'Ingresos',
      expenses: 'Gastos',
      creditUtilization: 'Utilización del crédito',
      used: 'utilizado',
      recentActivity: 'Actividad reciente',
      latestTransactions: 'Últimas transacciones',
      viewAll: 'Ver todo',
      noRecentTransactions: 'Sin transacciones recientes',
      pendingRequests: 'Solicitudes pendientes',
      pendingRequestsDescription: 'Sus solicitudes de préstamo en proceso',
      noPendingRequests: 'No hay solicitudes pendientes',
      pendingLoan: 'Solicitud pendiente',
      yourActiveLoans: 'Sus préstamos activos',
      yourActiveLoansDescription: 'Realice un seguimiento de sus reembolsos y vencimientos',
      activeLoan: 'Préstamo activo',
      repaid: 'Reembolsado',
      upcomingDueDates: 'Próximos vencimientos',
      amount: 'Cantidad',
      monthJan: 'Ene',
      monthFeb: 'Feb',
      monthMar: 'Mar',
      monthApr: 'Abr',
      monthMay: 'May',
      monthJun: 'Jun',
      serverError: 'No se puede conectar al servidor. Por favor, verifique su conexión e inténtelo de nuevo.',
      diagnosticInfo: 'Información de diagnóstico (desarrollo)',
      retry: 'Reintentar',
      financeOverview: 'Aquí tiene una vista general de sus finanzas',
      yourCreditLimit: 'Su límite de crédito',
      maximum: 'Máximo',
      activeLoanSingular: 'préstamo activo',
      activeLoansPlural: 'préstamos activos',
      loanNumber: 'Préstamo #',
      progression: 'Progreso',
      nextSixMonths: 'Próximos 6 meses',
      repayment: 'Reembolso',
      noUpcomingRepayments: 'Sin reembolsos próximos',
      pendingContracts: 'Contratos pendientes',
      contractsToSign: 'contrato(s) para firmar',
      generatedOn: 'Generado el',
      view: 'Ver',
    },
    loan: {
      pageTitle: 'Mis Préstamos',
      pageDescription: 'Gestione sus préstamos y simule sus reembolsos',
      tabMyLoans: 'Mis Préstamos',
      tabCalculator: 'Calculadora',
      amount: 'Cantidad',
      interestRate: 'Tasa de Interés',
      nextPayment: 'Próximo Pago',
      viewAll: 'Ver Todo',
      status: 'Estado',
      downloadContract: 'Descargar Contrato',
      uploadSignedContract: 'Subir Contrato Firmado',
      downloading: 'Descargando...',
      uploading: 'Subiendo...',
      loanNumber: 'Préstamo',
      requestSubmitted: 'Solicitud de préstamo enviada',
      requestSubmittedDesc: 'Su solicitud está pendiente de aprobación por un administrador. Recibirá una notificación tan pronto como sea procesada.',
      requestError: 'Error al enviar la solicitud de préstamo',
      loanApproved: '🎉 ¡Su préstamo ha sido aprobado!',
      approvalInstructions: 'Para finalizar su préstamo, siga estos pasos:',
      approvalStep1: 'Descargue su contrato de préstamo (PDF)',
      approvalStep2: 'Léalo detenidamente y fírmelo',
      approvalStep3: 'Devuelva el contrato firmado (PDF) mediante el botón de abajo',
      downloadContractButton: '1. Descargar contrato',
      uploadContractButton: '2. Subir contrato firmado',
      uploading2: 'Subiendo...',
    },
    transfer: {
      pageTitle: 'Mis Transferencias',
      pageDescription: 'Gestione y rastree todas sus transferencias de fondos',
      searchPlaceholder: 'Buscar por destinatario o ID...',
      allStatuses: 'Todos los estados',
      filterTitle: 'Filtros y búsqueda',
      filterDescription: 'Refine su lista de transferencias',
      noTransfersFound: 'No se encontraron transferencias',
      noTransfersMessage: 'Aún no ha realizado ninguna transferencia',
      createTransfer: 'Crear transferencia',
      newTransfer: 'Nueva transferencia',
      requestSubmitted: 'Solicitud Enviada',
      documentVerification: 'Verificación de Documentos',
      complianceCheck: 'Control de Cumplimiento',
      approvalPending: 'Aprobación Pendiente',
      transferComplete: 'Transferencia Completa',
      pending: 'Pendiente',
      inProgress: 'En Progreso',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      completed: 'Completado',
      suspended: 'Suspendido',
      noAccount: 'Sin cuenta registrada',
      validation: 'Validación',
      validating: 'Validando...',
      onHold: 'Transferencia en pausa',
      processing: 'Transferencia en progreso',
      processingComplete: 'Transferencia completada',
    },
    history: {
      pageTitle: 'Historial de Transacciones',
      pageDescription: 'Consulte el historial completo de todas sus transacciones',
      totalCredits: 'Total créditos',
      totalDebits: 'Total débitos',
      totalTransactions: 'Total transacciones',
      filterTitle: 'Filtros y búsqueda',
      filterDescription: 'Refine su historial de transacciones',
      searchPlaceholder: 'Buscar por descripción o ID...',
      filterType: 'Tipo',
      allTypes: 'Todos los tipos',
      typeCredit: 'Crédito',
      typeDebit: 'Débito',
      typeFee: 'Tarifa',
      noTransactionsFound: 'No se encontraron transacciones',
      noTransactionsFoundFiltered: 'Intente modificar sus criterios de búsqueda',
      noTransactionsYet: 'Aún no tiene transacciones',
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
      feesToPay: 'Tarifas a Pagar',
      unpaidFeesCount: 'tarifas impagadas',
      unpaidFeesSingular: 'tarifa impagada',
      pendingValidation: 'Pendiente de validación',
      autoValidatedViaCode: 'Auto-validado vía código',
      totalUnpaid: 'Total Impagado',
      totalOverall: 'Total General',
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      active: 'Activo',
      pending: 'Pendiente',
      completed: 'Completado',
      suspended: 'Suspendido',
      saving: 'Guardando...',
      cancel: 'Cancelar',
      save: 'Guardar',
      close: 'Cerrar',
      noData: 'Sin datos disponibles',
      months: 'meses',
      years: 'años',
    },
    about: {
      title: 'Acerca de Altus Finance Group',
      subtitle: 'Su socio de confianza para financiar particulares y empresas',
      mission: 'Nuestra Misión',
      missionText: 'En Altus Finance Group, democratizamos el acceso al financiamiento para todos. Ya sea que sea un particular con un proyecto personal o una empresa en desarrollo, ofrecemos soluciones de crédito modernas, transparentes y adaptadas a sus necesidades. Nuestra tecnología de vanguardia nos permite analizar rápidamente su situación y ofrecerle ofertas personalizadas con tasas competitivas. Creemos en la transparencia total: sin cargos ocultos, condiciones claras y acompañamiento en cada paso.',
      stats: {
        clients: 'Clientes activos',
        loansProvided: 'Préstamos otorgados',
        successRate: 'Tasa de satisfacción',
        yearsExperience: 'Años de experiencia',
      },
    },
    howItWorks: {
      title: 'Cómo Funciona',
      subtitle: 'Un proceso 100% digital ultra-rápido en 4 pasos simples',
      step1Title: 'Registro - 3 Minutos',
      step1Desc: 'Cree su cuenta Altus Finance Group en solo minutos. Ingrese su información personal o empresarial de forma segura. La verificación de identidad instantánea (KYC) garantiza la seguridad de su cuenta.',
      step1Duration: '3 min',
      step2Title: 'Inicio de sesión - Acceda a su panel',
      step2Desc: 'Inicie sesión en su panel de cliente personal seguro. Encontrará todas las herramientas necesarias para gestionar sus finanzas y enviar solicitudes de préstamo. Acceso 24/7 desde cualquier dispositivo.',
      step2Duration: 'Instante',
      step3Title: 'Solicitud y análisis - Respuesta instantánea',
      step3Desc: 'Envíe su solicitud de préstamo directamente desde su panel de usuario. Complete el formulario con el monto deseado y cargue sus documentos justificativos. Gracias a nuestra tecnología de análisis en tiempo real, recibe una respuesta de principio en minutos hasta 24 horas como máximo.',
      step3Duration: '< 24h',
      step4Title: 'Desembolso inmediato - Fondos disponibles instantáneamente',
      step4Desc: 'Una vez aprobada su solicitud, firme electrónicamente su contrato desde su panel. Los fondos se desbloquean inmediatamente en su cuenta segura Altus Finance Group. Luego puede transferirlos a su cuenta bancaria personal o empresarial instantáneamente y sin cargos adicionales.',
      step4Duration: 'Inmediato',
      averageTimePrefix: 'Tiempo total promedio:',
      averageTimeValue: '24 horas máximo desde la presentación de la solicitud hasta el desembolso de fondos',
      requiredDocumentsTitle: 'Documentos Requeridos',
      requiredDocumentsSubtitle: 'Prepare estos documentos para agilizar su solicitud',
      personalLoanTitle: 'Préstamo Personal',
      businessLoanTitle: 'Préstamo Empresarial',
      documents: {
        personal: [
          'Identificación válida (DNI, pasaporte)',
          'Comprobante de domicilio (menos de 3 meses)',
          'Últimos 3 recibos de nómina',
          'Última declaración de impuestos',
          'Estados de cuenta bancarios (3 meses)',
          'Justificación del proyecto (presupuestos, facturas)'
        ],
        professional: [
          'Registro mercantil de menos de 3 meses',
          'Documento de identidad del gerente',
          'Estatutos de la empresa',
          'Estados financieros (últimos 3 años)',
          'Paquete fiscal completo',
          'Estados de cuenta bancarios profesionales (6 meses)',
          'Plan de negocios (inicio/adquisición)',
          'Proyección financiera a 3 años',
          'Presupuestos o facturas proforma (equipos)'
        ]
      },
      tipTitle: 'Consejo:',
      tipMessage: '¿Faltan documentos? Nuestro equipo le ayudará a completar su expediente.',
      tipContactCta: 'Contáctenos →',
      eligibilityTitle: 'Criterios de Elegibilidad',
      eligibilitySubtitle: 'Verifique si cumple con los requisitos para su préstamo',
      individualsTitle: 'Particulares',
      professionalsTitle: 'Profesionales',
      requiredTag: 'Obligatorio',
      eligibility: {
        personal: [
          { label: 'Mayor de edad y residente francés', required: true },
          { label: 'Ingresos regulares verificables', required: true },
          { label: 'Sin prohibición bancaria', required: true },
          { label: 'Tasa de endeudamiento < 35%', required: true },
          { label: 'Puntaje crediticio aceptable', required: false }
        ],
        professional: [
          { label: 'Empresa registrada en Francia', required: true },
          { label: 'En operación por +6 meses', required: true },
          { label: 'Estados financieros actualizados', required: true },
          { label: 'Sin procedimientos colectivos', required: true },
          { label: 'Aporte personal 10-30%', required: true }
        ]
      },
      securityTitle: 'Seguridad y Garantías',
      security: {
        dataProtectionTitle: 'Sus Datos Protegidos',
        dataProtectionItems: [
          'Cifrado SSL de 256 bits',
          'Cumplimiento de RGPD y ACPR',
          'Servidores seguros en Francia',
          'Autenticación de dos factores'
        ],
        guaranteesTitle: 'Organizaciones de Garantía',
        guaranteesItems: [
          'BPI France (40-70% del préstamo)',
          'SIAGI (artesanos/comerciantes)',
          'France Active (economía social)',
          'Seguro de prestatario obligatorio'
        ]
      },
      ctaTitle: '¿Listo para Comenzar?',
      ctaSubtitle: 'Presente su solicitud en línea en minutos y obtenga una respuesta rápida',
      ctaRequestButton: 'Solicitar un Préstamo',
      ctaContactButton: 'Hablar con un Asesor'
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
          answer: 'Gracias a nuestra tecnología de análisis en tiempo real, recibe una respuesta de aprobación en minutos a 24 horas máximo. Una vez aprobado, los fondos se liberan inmediatamente en su cuenta segura Altus Finance Group. Luego puede transferirlos a su cuenta bancaria personal o profesional cuando lo desee, instantáneamente y sin cargos adicionales.',
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
          answer: 'Nuestras tasas se calculan mediante un algoritmo que analiza varios factores: su puntaje crediticio, duración del préstamo, monto prestado, ingresos y gastos, historial de pagos y salud financiera (para empresas). Las tasas varían de 0.5% a 9.0% TAE según perfil y tipo de préstamo. Nuestras tasas están entre las más competitivas del mercado gracias a nuestra red de socios financieros.',
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
        section1Content: 'Al acceder y utilizar los servicios de Altus Finance Group, acepta y está de acuerdo en estar sujeto a los términos y disposiciones de este acuerdo.',
        section2Title: '2. Licencia de Uso',
        section2Content: 'Se otorga permiso para acceder temporalmente a los materiales (información o software) en la plataforma de Altus Finance Group solo para visualización personal y no comercial.',
        section3Title: '3. Contrato de Préstamo',
        section3Content: 'Todos los préstamos están sujetos a aprobación de crédito. Los términos y condiciones se proporcionarán en un contrato de préstamo separado al aprobar su solicitud.',
        section4Title: '4. Declaraciones y Garantías',
        section4Content: 'Usted declara y garantiza que toda la información proporcionada en su solicitud de préstamo es precisa, completa y actual.',
        section5Title: '5. Limitación de Responsabilidad',
        section5Content: 'En ningún caso Altus Finance Group o sus proveedores serán responsables de cualquier daño que surja del uso o la imposibilidad de usar los materiales en la plataforma de Altus Finance Group.',
        section6Title: '6. Modificaciones',
        section6Content: 'Altus Finance Group puede revisar estos términos de servicio en cualquier momento sin previo aviso. Al usar esta plataforma, acepta estar sujeto a la versión actual de estos términos.',
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
      miscellaneousCredit: 'Créditos Diversos',
      miscellaneousCreditDesc: 'Financie todos sus proyectos personales: eventos, equipos, ocio, salud, bienestar. De €500 a €50,000 de 6 a 96 meses. Tasas TAE de 2.9% a 8.9%. Procedimiento simplificado, respuesta rápida en 24h. Desembolso de fondos en 3 a 5 días.',
      amount: 'Monto',
      rate: 'Tasa TAE',
      duration: 'Duración',
      rateDisclaimer: 'Tasas indicativas sujetas a condiciones de elegibilidad. TAE fija. Un crédito le compromete y debe ser reembolsado. Verifique sus capacidades de pago antes de comprometerse.',
      compareLoans: 'Comparar todos los préstamos',
    },
    features: {
      title: '¿Por Qué Elegir Altus Finance Group?',
      subtitle: 'Una plataforma de préstamos moderna y transparente que prioriza sus necesidades',
      security: 'Seguridad Bancaria de Nivel Empresarial',
      securityDesc: 'Cifrado AES-256, cumplimiento RGPD, certificación SOC 2 Type II e ISO 27001. Sus datos financieros están protegidos con los mismos estándares que los grandes bancos. Autenticación multifactor y monitoreo 24/7 contra fraude.',
      fast: 'Respuesta Express - Minutos a 24h',
      fastDesc: 'Nuestra tecnología de IA analiza su expediente en tiempo real. Respuesta de aprobación en minutos a 24 horas máximo. Fondos inmediatamente desbloqueados en su cuenta segura Altus. Luego transfiera a su cuenta bancaria cuando desee. 100% digital, cero papeleo.',
      competitive: 'Entre Las Tasas Más Bajas del Mercado',
      competitiveDesc: 'Gracias a nuestra red de 50+ socios financieros y tecnología de evaluación optimizada, negociamos para usted las mejores tasas: de 0.5% a 9.0% TAE según perfil y tipo de préstamo. Comparación automática para garantizarle la mejor oferta.',
      flexible: 'Flexibilidad Máxima Sin Penalización',
      flexibleDesc: 'Pago anticipado gratuito en cualquier momento. Posible modulación de mensualidades según su situación. Aplazamiento de mensualidades en caso de dificultades. Elección de fecha de débito. Mantiene control total de su crédito.',
    },
    stats: {
      clients: 'Clientes Satisfechos',
      funded: 'Préstamos Otorgados',
      satisfaction: 'Tasa de Satisfacción',
      years: 'Años de Experiencia',
    },
    partners: {
      title: 'Nuestros Socios Financieros',
      subtitle: 'Colaboramos con una amplia red de bancos e instituciones financieras de primer nivel para garantizarle las mejores condiciones',
      banksNetwork: 'Bancos Asociados',
      loansFunded: 'Préstamos Financiados',
      yearsExperience: 'Años de Experiencia',
      satisfactionRate: 'Tasa de Satisfacción',
      networkTitle: 'Una Red de Socios de Confianza',
      benefits: [
        'Acceso a más de 50 instituciones financieras para comparar las mejores ofertas',
        'Negociación de tasas preferenciales gracias a nuestro volumen de negocios',
        'Experiencia reconocida en intermediación de crédito desde hace más de 25 años'
      ]
    },
    testimonials: {
      title: 'Lo que dicen nuestros clientes',
      subtitle: 'Más de 15,000 particulares y profesionales confían en nosotros',
      reviews: [
        { name: 'Carlos García', role: 'Empresario', company: 'Restaurante El Sabor', text: 'Altus Finance Group me permitió obtener financiamiento rápido para desarrollar mi negocio. El proceso fue simple y transparente, recibí los fondos en menos de una semana.', rating: 5 },
        { name: 'María Rodríguez', role: 'Particular', company: 'Propietaria', text: 'Excelente servicio para mi préstamo inmobiliario. Los asesores son atentos y me encontraron la mejor tasa. Recomiendo ampliamente sus servicios.', rating: 5 },
        { name: 'José Martínez', role: 'Director Financiero', company: 'Tech Solutions SL', text: 'Gracias a Altus Finance Group pudimos financiar la compra de nuevos equipos. La flexibilidad de pago y la tasa competitiva marcaron la diferencia.', rating: 5 },
        { name: 'Ana López', role: 'Artesana', company: 'Panadería Tradicional', text: 'Un servicio profesional y eficiente. Obtuve mi préstamo para obras sin complicaciones. El equipo me acompañó en cada paso.', rating: 5 },
        { name: 'Miguel Sánchez', role: 'Comerciante', company: 'Moda & Accesorios', text: 'Estoy muy satisfecho con el financiamiento obtenido para la expansión de mi tienda. Altus Finance Group realmente entiende las necesidades de los emprendedores.', rating: 5 },
        { name: 'Juan Fernández', role: 'Particular', company: 'Padre de familia', text: 'Mi crédito auto fue aprobado rápidamente con una excelente tasa. El simulador en línea me permitió comparar fácilmente las ofertas.', rating: 5 },
        { name: 'Patricia Jiménez', role: 'Enfermera', company: 'Hospital San José', text: 'Pude financiar mis trabajos de renovación energética gracias a su préstamo verde. Las tasas bonificadas y el asesoramiento sobre ayudas estatales me ayudaron mucho.', rating: 5 },
        { name: 'Ricardo Morales', role: 'Gerente', company: 'Restaurante La Cocina', text: 'La línea de crédito renovable salvó mi tesorería durante el período difícil. Flexibilidad máxima y pago anticipado sin cargos.', rating: 5 },
        { name: 'Sandra Herrera', role: 'Arquitecta', company: 'Herrera & Asociados', text: 'Proceso 100% digital y rápido. Obtuve mi préstamo profesional en 3 días. La interfaz es intuitiva y clara.', rating: 5 },
        { name: 'Francisco Ruiz', role: 'Estudiante', company: 'Escuela de Negocios', text: 'El préstamo estudiantil con pago diferido me permitió financiar mis estudios sin estrés. Tasas preferenciales y sin garantía parental.', rating: 5 },
        { name: 'Elena Vargas', role: 'Farmacéutica', company: 'Farmacia Central', text: 'Financiamiento de equipo médico aprobado en 48h. El servicio al cliente es reactivo y profesional. Muy satisfecha con el acompañamiento.', rating: 5 },
        { name: 'Andrés Castro', role: 'Desarrollador', company: 'Startup Tech', text: 'Préstamo personal para mi proyecto de formación profesional. Sin justificante de uso requerido, proceso transparente y rápido.', rating: 5 },
        { name: 'Carmen Navarro', role: 'Profesora', company: 'Colegio Cervantes', text: 'Mi préstamo inmobiliario fue aprobado con una tasa muy competitiva. La simulación en línea me ayudó a comparar y elegir la mejor oferta.', rating: 5 },
        { name: 'Pablo Ramírez', role: 'Emprendedor', company: 'Startup Innovadora', text: 'El financiamiento de equipo me permitió comprar las máquinas necesarias para lanzar mi producción. Pago adaptado a mi flujo de caja.', rating: 5 },
        { name: 'Isabel Ortiz', role: 'Abogada', company: 'Bufete Ortiz', text: 'Proceso de aprobación ultra-rápido gracias a la tecnología de IA. Recibí una respuesta de principio en menos de 24 horas. Impresionante!', rating: 5 },
        { name: 'Javier Torres', role: 'Fontanero', company: 'Torres Fontanería', text: 'Préstamo para obras para renovar mi local profesional. Desembolso progresivo según avance, es exactamente lo que necesitaba.', rating: 5 },
        { name: 'Beatriz Romero', role: 'Diseñadora', company: 'Estudio Creativo', text: 'La línea de crédito me dio la flexibilidad necesaria para gestionar las variaciones de tesorería de mi actividad. Solo pago por lo que uso.', rating: 5 },
        { name: 'Antonio Delgado', role: 'Médico', company: 'Consultorio Médico', text: 'Financiamiento de mi instalación en consultorio privado. Monto importante aprobado rápidamente con una tasa fija ventajosa. Muy profesional.', rating: 5 },
        { name: 'Rosa Vega', role: 'Florista', company: 'Flores & Naturaleza', text: 'Préstamo profesional para desarrollar mi tienda en línea. El proceso fue simple y el equipo me acompañó en cada etapa. Gracias!', rating: 5 },
        { name: 'Diego Mendoza', role: 'Ingeniero', company: 'Consultor Independiente', text: 'Crédito auto para mi vehículo profesional. Respuesta inmediata y fondos transferidos en 3 días. Servicio impecable y tasa competitiva.', rating: 5 },
        { name: 'Lucía Campos', role: 'Esteticista', company: 'Instituto Belleza', text: 'Financiamiento para la compra de nuevos equipos estéticos. Sin cargos ocultos, todo es transparente desde el inicio. Recomiendo ampliamente.', rating: 5 },
        { name: 'Marcos Silva', role: 'Chef', company: 'Bistró Moderno', text: 'Factoraje para mejorar mi flujo de caja. Transformación de mis facturas en liquidez en 24h. Solución perfecta para mi actividad B2B.', rating: 5 },
      ],
    },
    auth: {
      title: 'ALTUS',
      subtitle: 'Su socio de confianza para financiamiento',
      loginTab: 'Iniciar sesión',
      signupTab: 'Registrarse',
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      fullName: 'Nombre completo',
      phone: 'Teléfono',
      companyName: 'Nombre de la empresa',
      siret: 'SIRET',
      accountType: 'Tipo de cuenta',
      personal: 'Personal',
      personalLoan: 'Préstamo personal',
      business: 'Empresa/Profesional',
      businessLoan: 'Préstamo empresarial',
      login: 'Iniciar sesión',
      loggingIn: 'Iniciando sesión...',
      signup: 'Crear mi cuenta',
      signingUp: 'Registrándose...',
      backToHome: 'Volver al inicio',
      loginSuccess: '¡Inicio de sesión exitoso!',
      loginSuccessDesc: 'Bienvenido a ALTUS',
      signupSuccess: '¡Registro exitoso!',
      signupSuccessDesc: 'Se ha enviado un correo de verificación a su dirección.',
      loginError: 'Error de inicio de sesión',
      loginErrorDesc: 'Correo electrónico o contraseña incorrectos',
      signupError: 'Error',
      signupErrorDesc: 'Ocurrió un error durante el registro',
      emailNotVerified: 'Correo electrónico no verificado',
      emailPlaceholder: 'juan.perez@example.com',
      passwordPlaceholder: '••••••••',
      fullNamePlaceholder: 'Juan Pérez',
      phonePlaceholder: '+34 912 34 56 78',
      companyNamePlaceholder: 'Empresa SL',
      siretPlaceholder: '123 456 789 00010',
      required: 'requerido',
      companyRequired: 'El nombre de la empresa es requerido para cuentas empresariales',
      emailInvalid: 'Correo electrónico inválido',
      passwordMinLength: 'La contraseña debe contener al menos 12 caracteres',
      passwordUppercase: 'La contraseña debe contener al menos una letra mayúscula',
      passwordLowercase: 'La contraseña debe contener al menos una letra minúscula',
      passwordNumber: 'La contraseña debe contener al menos un número',
      passwordSpecial: 'La contraseña debe contener al menos un carácter especial',
      passwordMatch: 'Las contraseñas no coinciden',
      invalidOtp: 'Código inválido o caducado',
      sessionExpired: 'Sesión expirada',
      sessionExpiredMessage: 'Su sesión ha expirado. Por favor, vuelva a iniciar sesión.',
      accessDenied: 'Acceso denegado',
      authenticationRequired: 'Autenticación requerida',
      verificationError: 'Error durante la verificación',
      verificationInProgress: 'Verificación en curso',
      emailVerified: 'Email verificado',
      accountActiveAutoLogin: 'Su cuenta está ahora activa. Está conectado automáticamente y será redirigido a su panel en unos segundos...',
      linkExpiredInvalid: 'El enlace de verificación puede estar caducado o ser inválido.',
      tokenMissing: 'Token de verificación faltante',
      pleaseTwoFactorCode: 'Por favor, ingrese su código de autenticación de dos factores',
      verificationCodeSent: 'Código de verificación enviado',
      twoFactorAuth: 'Autenticación de dos factores',
      enterOtpCode: 'Ingrese el código de 6 dígitos enviado a su correo electrónico',
      otpExpiresIn: 'El código expira en 10 minutos',
      backToLogin: 'Volver al inicio de sesión',
    },
    errors: {
      sessionExpired: 'Sesión expirada',
      accessDenied: 'Acceso denegado',
      authRequired: 'Autenticación requerida',
      networkError: 'Error de red. Inténtelo de nuevo.',
      unexpectedError: 'Se produjo un error inesperado',
      verificationFailed: 'Falló la verificación',
    },
    settings: {
      title: 'Configuración',
      profile: 'Perfil',
      notifications: 'Notificaciones',
      security: 'Seguridad',
      appearance: 'Apariencia',
      personalInfo: 'Información personal',
      updateInfo: 'Actualice su información de perfil',
      fullName: 'Nombre completo',
      email: 'Email',
      phone: 'Teléfono',
      company: 'Empresa',
      saveChanges: 'Guardar cambios',
      accountType: 'Tipo de cuenta',
      yourAccountType: 'Su cuenta',
      individualAccount: 'Cuenta Personal',
      businessAccount: 'Cuenta Empresarial',
      individualAccess: 'Acceso a servicios de financiamiento personal',
      businessAccess: 'Acceso completo a servicios de financiamiento empresarial',
      verified: 'Verificado',
      notificationPreferences: 'Preferencias de notificación',
      chooseNotifications: 'Elija cómo desea ser notificado',
      emailAlerts: 'Alertas por email',
      emailAlertsDesc: 'Reciba alertas importantes por email',
      transferUpdates: 'Actualizaciones de transferencia',
      transferUpdatesDesc: 'Notificaciones sobre el estado de sus transferencias',
      loanReminders: 'Recordatorios de pago',
      loanRemindersDesc: 'Recordatorios para sus vencimientos de préstamo',
      marketingEmails: 'Emails de marketing',
      marketingEmailsDesc: 'Reciba noticias y ofertas especiales',
      savePreferences: 'Guardar preferencias',
      changePassword: 'Cambiar contraseña',
      updatePassword: 'Actualización de su contraseña',
      currentPassword: 'Contraseña actual',
      newPassword: 'Nueva contraseña',
      confirmNewPassword: 'Confirmar nueva contraseña',
      themeSettings: 'Configuración de tema',
      chooseTheme: 'Seleccione su tema preferido',
      lightMode: 'Modo claro',
      darkMode: 'Modo oscuro',
      systemMode: 'Sistema',
      languageSettings: 'Configuración de idioma',
      chooseLanguage: 'Seleccione su idioma',
      changePhoto: 'Cambiar foto',
      uploading: 'Subiendo...',
      twoFactorAuth: 'Autenticación de dos factores',
      twoFactorAuthDesc: 'Añada una capa adicional de seguridad a su cuenta',
      twoFactorEnabled: 'Autenticación de dos factores activada',
      enable2FA: 'Activar 2FA',
      twoFactorEnabledDesc: 'Su cuenta está protegida por autenticación de dos factores',
      twoFactorDisabledDesc: 'Proteja su cuenta con verificación en dos pasos mediante Google Authenticator',
      disable: 'Desactivar',
      configure: 'Configurar',
      enabled: 'Activado',
      twoFactorActiveMessage: 'Su cuenta está asegurada con Google Authenticator. Se requerirá un código en cada inicio de sesión.',
      theme: 'Tema',
      themeDesc: 'Elija su tema preferido',
      light: 'Claro',
      dark: 'Oscuro',
      languageLabel: 'Idioma',
      languageDesc: 'Seleccione su idioma',
      disable2FASuccess: 'Éxito',
      disable2FASuccessDesc: '2FA desactivado exitosamente',
      disable2FAError: 'Error al desactivar 2FA',
    },
    messages: {
      profileUpdated: 'Perfil actualizado',
      profileUpdatedDesc: 'Su información se ha guardado exitosamente.',
      preferencesUpdated: 'Preferencias guardadas',
      preferencesUpdatedDesc: 'Sus preferencias de notificación se han actualizado.',
      passwordChanged: 'Contraseña modificada',
      passwordChangedDesc: 'Su contraseña se ha modificado exitosamente.',
      passwordMismatch: 'Las contraseñas no coinciden',
      errorUpdatingProfile: 'Error al actualizar el perfil',
      errorUpdatingPreferences: 'Error al actualizar las preferencias',
      errorChangingPassword: 'Error al cambiar la contraseña',
      avatarUpdated: 'Foto de perfil actualizada',
      avatarUpdatedDesc: 'Su foto de perfil se ha actualizado exitosamente.',
      errorUploadingAvatar: 'Error al cargar la foto',
      invalidFileType: 'Tipo de archivo no autorizado. Solo se aceptan imágenes JPEG, PNG y WebP.',
      fileTooLarge: 'El archivo es demasiado grande (máx 5MB).',
    },
    bankCard: {
      title: 'Tarjeta Bancaria Profesional',
      subtitle: 'Disfrute de una tarjeta bancaria dedicada a sus transacciones profesionales',
      learnMore: 'Más información',
      viewDetails: 'Ver detalles',
      orderNow: 'Ordenar ahora',
      orderCard: 'Ordenar mi tarjeta',
      orderSuccess: 'Pedido de tarjeta virtual',
      orderSuccessDesc: 'Su tarjeta virtual se está activando. Recibirá los detalles por correo en breve.',
      modalTitle: 'Tarjeta Bancaria Profesional Altus',
      modalSubtitle: 'Una tarjeta bancaria completa para todas sus necesidades profesionales',
      advantagesTitle: 'Ventajas de la tarjeta',
      advantages: {
        cashback: 'Cashback 2%',
        cashbackDesc: 'Disfrute del 2% de cashback en todas sus compras profesionales',
        noFees: 'Sin comisiones ocultas',
        noFeesDesc: 'Transparencia total en todas las comisiones',
        protection: 'Protección máxima',
        protectionDesc: 'Seguro de compras y protección contra fraude incluidos',
        rewards: 'Programa de recompensas',
        rewardsDesc: 'Acumule puntos en cada transacción',
        global: 'Aceptada mundialmente',
        globalDesc: 'Utilizable en más de 200 países y territorios',
        support: 'Soporte reactivo',
        supportDesc: 'Servicio al cliente receptivo durante horario laboral',
        maxSecurity: 'Seguridad máxima',
        maxSecurityDesc: 'Números temporales con protección total',
        instantActivation: 'Activación instantánea',
        instantActivationDesc: 'Utilizable inmediatamente',
        noFeesEuro: 'Sin comisiones',
        noFeesEuroDesc: '0% de comisiones en zona euro',
        globallyAccepted: 'Aceptada mundialmente',
        globallyAcceptedDesc: 'Compatible con Apple Pay y Google Pay',
      },
      usageZonesTitle: 'Zonas de uso',
      usageZones: {
        worldwide: 'Pagos internacionales',
        worldwideDesc: 'Aceptada en todos los comercios y sitios web del mundo',
        online: 'Compras en línea',
        onlineDesc: 'Segura para todas sus compras en internet',
        stores: 'En tienda',
        storesDesc: 'Pago sin contacto y con código PIN',
        atm: 'Retiros de efectivo',
        atmDesc: 'Retiros gratuitos en nuestra red de cajeros asociados',
      },
      feesTitle: 'Tarifas y precios',
      fees: {
        annualFee: 'Cuota anual',
        annualFeeAmount: 'Gratis el primer año, luego 49€/año',
        transactionFee: 'Comisión de transacción',
        transactionFeeAmount: '0% en zona euro',
        withdrawalFee: 'Retiro de efectivo',
        withdrawalFeeAmount: 'Gratis en la red asociada',
        foreignFee: 'Pago en moneda extranjera',
        foreignFeeAmount: '1,5% fuera de la zona euro',
      },
      specificationsTitle: 'Características técnicas',
      specifications: {
        cardType: 'Tipo de tarjeta',
        cardTypeValue: 'Visa Business Premium',
        creditLimit: 'Límite',
        creditLimitValue: 'Hasta 50.000€ por mes',
        validity: 'Validez',
        validityValue: '5 años',
        delivery: 'Plazo de entrega',
        deliveryValue: '5-7 días hábiles',
      },
      orderProcess: 'Cómo ordenar',
      orderProcessDesc: 'Ordene su tarjeta en unos pocos clics. Después de la validación de su solicitud, recibirá su tarjeta en 5-7 días hábiles.',
      termsConditions: 'Ver términos y condiciones',
      close: 'Cerrar',
    },
    notifications: {
      loan_request: { title: 'Solicitud de Préstamo Enviada', message: 'Su solicitud de préstamo {loanType} por {amount} € ha sido enviada con éxito. Revisaremos su solicitud próximamente.' },
      loan_under_review: { title: 'Solicitud en Revisión', message: 'Su solicitud de préstamo por {amount} € está siendo revisada por nuestro equipo.' },
      loan_approved: { title: 'Préstamo Aprobado', message: 'Su solicitud de préstamo por {amount} € ha sido aprobada. Ahora puede proceder a la firma del contrato.' },
      loan_rejected: { title: 'Préstamo Rechazado', message: 'Su solicitud de préstamo ha sido rechazada. Razón: {reason}' },
      loan_contract_generated: { title: 'Contrato de Préstamo Disponible', message: 'Su contrato de préstamo por {amount} € está disponible. Por favor descárguelo, fírmelo y devuélvalo.' },
      loan_contract_signed: { title: 'Contrato Firmado Recibido', message: 'Hemos recibido su contrato firmado para el préstamo de {amount} €. Su préstamo será procesado próximamente.' },
      loan_disbursed: { title: 'Fondos Desembolsados', message: 'Los fondos de su préstamo por {amount} € han sido desembolsados exitosamente en su cuenta.' },
      transfer_initiated: { title: 'Transferencia Iniciada', message: 'Su transferencia de {amount} € a {recipientName} ha sido iniciada y está siendo procesada.' },
      transfer_completed: { title: 'Transferencia Completada', message: 'Su transferencia de {amount} € ha sido completada exitosamente.' },
      transfer_approved: { title: 'Transferencia Aprobada', message: 'Su solicitud de transferencia ha sido aprobada por la administración.' },
      transfer_suspended: { title: 'Transferencia Suspendida', message: 'Su transferencia ha sido suspendida. Razón: {reason}' },
      code_issued: { title: 'Código de Validación Emitido', message: 'Se ha emitido un nuevo código de validación (#{sequence}) para su transferencia. Verifique sus correos.' },
      kyc_approved: { title: 'Documentos KYC Aprobados', message: 'Sus documentos han sido verificados y aprobados. Su cuenta está ahora activa.' },
      kyc_rejected: { title: 'Documentos KYC Rechazados', message: 'Sus documentos han sido rechazados. Razón: {reason}. Por favor envíe nuevos documentos.' },
      fee_added: { title: 'Nueva Tarifa', message: 'Se han agregado tarifas de {amount} € a su cuenta. Razón: {reason}' },
      account_status_changed: { title: 'Estado de Cuenta Modificado', message: 'El estado de su cuenta ha sido actualizado a: {newStatus}. {reason}' },
      admin_message_sent: { title: 'Nuevo Mensaje de Administración', message: '{subject}' },
      general: { title: 'Notificación', message: 'Tiene una nueva notificación.' },
      twoFactorSuggestion: { title: 'Asegure Su Cuenta', message: 'Active la autenticación de dos factores para fortalecer la seguridad de su cuenta.' },
      markAllRead: 'Marcar todo como leído',
      markAsRead: 'Marcar como leído',
      deleteNotification: 'Eliminar',
    },
    dialogs: {
      newLoan: {
        title: 'Nueva Solicitud de Préstamo',
        subtitle: 'Complete la información para su solicitud',
        subtitleFirstRequest: 'Primera solicitud: proporcione sus documentos de identidad y complete el formulario',
        subtitleRegular: 'Complete el formulario para enviar una nueva solicitud de préstamo',
        loanType: 'Tipo de Préstamo',
        selectLoanType: 'Seleccione el tipo de préstamo',
        amount: 'Monto',
        enterAmount: 'Ingrese el monto deseado',
        duration: 'Duración',
        selectDuration: 'Seleccione la duración',
        months: 'meses',
        estimatedRate: 'Tasa Estimada',
        monthlyPayment: 'Pago Mensual Estimado',
        totalRepayment: 'Monto Total a Pagar',
        firstRequestAlert: 'Primera solicitud:',
        firstRequestAlertDesc: 'Sus documentos serán verificados una vez. Las solicitudes siguientes ya no requerirán documentos.',
        addBankAccount: 'Agregar Cuenta Bancaria',
        selectAccount: 'Seleccione una cuenta',
        bankName: 'Nombre del Banco',
        bankNamePlaceholder: 'Ej: Santander',
        accountLabel: 'Etiqueta de la Cuenta',
        accountLabelPlaceholder: 'Ej: Cuenta corriente principal',
        iban: 'IBAN',
        ibanPlaceholder: 'ES91 2100 0418 4502 0005 1332',
        bic: 'BIC/SWIFT',
        bicPlaceholder: 'CAIXESBBXXX',
        uploadDocuments: 'Subir Sus Documentos',
        kycDocumentsTab: 'Documentos KYC',
        additionalDocumentsTab: 'Documentos Adicionales',
        loanDetailsTab: 'Detalles del Préstamo',
        identity: 'Documento de Identidad',
        proof_of_address: 'Comprobante de Domicilio',
        income_proof: 'Comprobante de Ingresos',
        business_registration: 'Registro Mercantil',
        financial_statements: 'Estados Financieros',
        tax_returns: 'Declaración de Impuestos',
        requiredDocuments: 'Documentos Requeridos',
        identityDoc: 'Documento de Identidad (Cédula o Pasaporte)',
        addressProof: 'Comprobante de Domicilio (menos de 3 meses)',
        bankStatement: 'Estado de Cuenta Bancaria (últimos 3 meses)',
        uploadingInProgress: 'Subiendo...',
        documentsUploadedSuccess: 'documento(s) cargado(s) exitosamente',
        submit: 'Enviar Solicitud',
        submitting: 'Enviando...',
        cancel: 'Cancelar',
        loanTypes: {
          personal: 'Préstamo Personal',
          auto: 'Préstamo Auto',
          mortgage: 'Préstamo Hipotecario',
          green: 'Préstamo Verde',
          renovation: 'Préstamo para Reformas',
          student: 'Préstamo Estudiantil',
          business: 'Préstamo Empresarial',
          cashFlow: 'Crédito de Flujo de Caja',
          equipment: 'Financiamiento de Equipos',
          commercialProperty: 'Préstamo Inmobiliario Comercial',
          lineOfCredit: 'Línea de Crédito',
          vehicleFleet: 'Crédito Flota de Vehículos',
        },
        errors: {
          amountMustBePositive: 'El monto debe ser mayor que 0',
          amountMaxExceeded: 'El monto no puede exceder 1.000.000 €',
          rateMustBePositive: 'La tasa debe ser positiva',
          rateMaxExceeded: 'La tasa no puede exceder el 20%',
          durationMustBePositive: 'La duración debe ser mayor que 0',
          durationMaxExceeded: 'La duración no puede exceder 360 meses',
          documentsRequired: 'Debe cargar sus documentos KYC para su primera solicitud',
        },
        success: {
          loanSubmitted: 'Solicitud de Préstamo Enviada',
          loanSubmittedDesc: 'Su solicitud de préstamo ha sido enviada exitosamente.',
          documentsUploaded: 'Documentos Cargados',
          documentsUploadedDesc: 'documento(s) enviado(s) exitosamente.',
        },
        error: {
          loanError: 'Error',
          loanErrorDesc: 'No se pudo crear la solicitud de préstamo.',
          partialUploadError: 'Error Parcial',
          partialUploadErrorDesc: 'documento(s) no se pudieron cargar.',
        },
      },
      transfer: {
        title: 'Transferir Fondos',
        subtitle: 'Inicie una transferencia segura a una cuenta externa',
        selectAccount: 'Seleccione una cuenta',
        noAccountsAvailable: 'No hay cuentas bancarias disponibles',
        amount: 'Monto',
        enterAmount: 'Ingrese el monto',
        amountPlaceholder: '50000',
        recipient: 'Destinatario',
        recipientPlaceholder: 'Nombre de la empresa o beneficiario',
        feesDescription: 'Se aplicarán tarifas de transferencia de 25€',
        availableFunds: 'Fondos Disponibles',
        feesAndProcessing: 'Tarifa del 2% • Procesamiento en 24-48h',
        submit: 'Iniciar Transferencia',
        submitting: 'Procesando...',
        creating: 'Creando...',
        createTransfer: 'Crear transferencia',
        cancel: 'Cancelar',
        transferSuccess: 'Transferencia iniciada',
        transferSuccessDesc: 'Su solicitud de transferencia ha sido creada exitosamente',
        transferError: 'Error',
        transferErrorDesc: 'No se pudo crear la transferencia',
      },
      loanRequestModal: {
        title: 'Solicitar un Préstamo',
        description: 'Complete el formulario a continuación y adjunte los documentos requeridos para enviar su solicitud de préstamo.',
        loanType: 'Tipo de Préstamo',
        selectLoanTypePlaceholder: 'Seleccione un tipo de préstamo',
        loanAmount: 'Monto del Préstamo',
        duration: 'Duración',
        durationMonths: 'Duración (meses)',
        months: 'meses',
        interestRate: 'Tasa de Interés',
        estimatedMonthlyPayment: 'Pago Mensual Estimado',
        requiredDocuments: 'Documentos Requeridos',
        requiredDocumentsDescription: 'Por favor adjunte todos los documentos marcados como requeridos para finalizar su solicitud.',
        required: 'Requerido',
        optional: 'Opcional',
        attach: 'Adjuntar',
        cancel: 'Cancelar',
        submit: 'Enviar Solicitud',
        validationError: 'Por favor seleccione un tipo de préstamo',
        requestSent: 'Solicitud Enviada',
        requestSentDescription: 'Su solicitud de préstamo ha sido enviada exitosamente. Recibirá una respuesta en 48 horas.',
        error: 'Error',
        errorDescription: 'Ocurrió un error al enviar su solicitud.',
        fileTooLarge: 'Archivo Demasiado Grande',
        fileTooLargeDescription: 'El tamaño máximo de archivo es de 10MB.',
        missingDocuments: 'Documentos Faltantes',
        missingDocumentsPrefix: 'Por favor adjunte todos los documentos requeridos:',
      },
      cardTerms: {
        title: 'Términos y Condiciones de la Tarjeta Bancaria',
        acceptTerms: 'Aceptar Términos',
        declineTerms: 'Rechazar',
      },
      welcome: {
        title: 'Bienvenido a ALTUS',
        description: 'Su cuenta ha sido creada exitosamente',
        accountTypeTitle: 'Su Tipo de Cuenta',
        individualAccount: 'Cuenta Personal',
        businessAccount: 'Cuenta Empresarial',
        individualAccess: 'Acceso a servicios de financiamiento personal',
        businessAccess: 'Acceso completo a servicios de financiamiento empresarial',
        availableOffers: 'Ofertas disponibles para usted',
        getStarted: 'Comenzar',
        dialog: {
          title: '¡Bienvenido a Altus Finance Group!',
          description: 'Estamos encantados de acompañarle en sus proyectos de financiamiento.',
        },
        account: {
          badgeLabel: 'Su cuenta:',
          individual: {
            description: 'Tiene acceso a ofertas de préstamos personales. Estas ofertas están especialmente diseñadas para sus necesidades personales y proyectos individuales.',
          },
          business: {
            description: 'Tiene acceso a ofertas de préstamos profesionales. Estas ofertas están especialmente diseñadas para el desarrollo y crecimiento de su empresa.',
          },
        },
        offers: {
          title: 'Ofertas disponibles para usted',
          individual: [
            'Préstamo Personal',
            'Préstamo Hipotecario',
            'Crédito Auto',
            'Préstamo Estudiantil',
            'Préstamo Verde',
            'Préstamo para Obras',
          ],
          business: [
            'Préstamo Profesional',
            'Crédito de Tesorería',
            'Financiamiento de Equipo',
            'Hipoteca Comercial',
            'Línea de Crédito',
            'Crédito para Vehículo Profesional',
          ],
        },
        important: {
          title: 'Importante:',
          message: 'Solo las ofertas mencionadas arriba serán accesibles en su espacio.',
          individualSwitch: ' Si desea acceder a ofertas profesionales, deberá crear una cuenta empresarial.',
          businessSwitch: ' Si desea acceder a ofertas personales, deberá crear una cuenta personal.',
        },
        cta: {
          primary: 'Entendido, comenzar',
          pending: 'Cargando...',
        },
      },
      transactionHistory: {
        title: 'Historial de Transacciones',
        type: 'Tipo',
        amount: 'Monto',
        date: 'Fecha',
        status: 'Estado',
        noTransactions: 'No se encontraron transacciones',
        close: 'Cerrar',
      },
    },
    verify: {
      verifying: 'Verificando...',
      success: '¡Correo Verificado!',
      successMessage: 'Su correo ha sido verificado exitosamente. Será redirigido al panel de control.',
      goToDashboard: 'Ir al Panel',
      error: 'Error de Verificación',
      errorMessage: 'El enlace de verificación es inválido o ha expirado.',
      tryAgain: 'Intentar de Nuevo',
      backToSignup: 'Volver al Registro',
      backToHome: 'Volver al Inicio',
    },
    forgotPassword: {
      title: 'Contraseña Olvidada',
      description: 'Reinicie su contraseña',
      instructions: 'Ingrese su dirección de correo electrónico y le enviaremos un enlace para reiniciar su contraseña.',
      emailLabel: 'Dirección de Correo Electrónico',
      emailPlaceholder: 'su.correo@ejemplo.com',
      sendResetLink: 'Enviar Enlace',
      sending: 'Enviando...',
      backToLogin: 'Volver al Inicio de Sesión',
      emailSent: 'Correo Enviado',
      emailSentDesc: 'Se ha enviado un enlace de reinicio a su dirección de correo electrónico.',
      error: 'Error',
      errorDesc: 'Ocurrió un error. Por favor intente de nuevo.',
    },
    resetPassword: {
      title: 'Reiniciar Contraseña',
      description: 'Cree una nueva contraseña',
      newPassword: 'Nueva Contraseña',
      newPasswordPlaceholder: 'Ingrese su nueva contraseña',
      confirmPassword: 'Confirmar Contraseña',
      confirmPasswordPlaceholder: 'Confirme su nueva contraseña',
      requirements: 'Requisitos de Contraseña:',
      minLength: 'Al menos 12 caracteres',
      uppercase: 'Una letra mayúscula',
      lowercase: 'Una letra minúscula',
      number: 'Un número',
      specialChar: 'Un carácter especial',
      passwordStrength: 'Fuerza de la Contraseña',
      weak: 'Débil',
      medium: 'Media',
      strong: 'Fuerte',
      veryStrong: 'Muy Fuerte',
      resetPassword: 'Reiniciar',
      resetting: 'Reiniciando...',
      success: 'Éxito',
      successMessage: 'Su contraseña ha sido reiniciada exitosamente.',
      error: 'Error',
      invalidToken: 'El enlace de reinicio es inválido o ha expirado.',
      passwordMismatch: 'Las contraseñas no coinciden.',
    },
    twoFactorAuth: {
      setup: {
        title: 'Configurar Autenticación de Dos Factores',
        description: 'Fortalezca la seguridad de su cuenta',
        step1: 'Paso 1: Descargar la Aplicación',
        step1Description: 'Descargue Google Authenticator o Authy en su teléfono',
        step2: 'Paso 2: Escanear el Código QR',
        step2Description: 'Escanee este código QR con su aplicación de autenticación',
        step3: 'Paso 3: Verificar el Código',
        step3Description: 'Ingrese el código de 6 dígitos generado por la aplicación',
        qrCodeInstructions: 'Escanee este código QR con su aplicación de autenticación',
        cantScanQR: '¿No puede escanear? Ingrese este código manualmente:',
        secretKey: 'Clave Secreta',
        enterCode: 'Ingrese el código de 6 dígitos',
        codePlaceholder: '000000',
        verify: 'Activar 2FA',
        verifying: 'Verificando...',
        cancel: 'Cancelar',
        successTitle: '2FA Activado',
        successMessage: 'La autenticación de dos factores ha sido activada exitosamente.',
        errorTitle: 'Error',
        errorMessage: 'El código es inválido. Por favor intente de nuevo.',
      },
      disable: {
        title: 'Desactivar Autenticación de Dos Factores',
        description: 'Ingrese su contraseña para confirmar',
        enterPassword: 'Contraseña',
        passwordPlaceholder: 'Ingrese su contraseña',
        disable: 'Desactivar 2FA',
        disabling: 'Desactivando...',
        cancel: 'Cancelar',
        successTitle: '2FA Desactivado',
        successMessage: 'La autenticación de dos factores ha sido desactivada.',
        errorTitle: 'Error',
        errorMessage: 'Contraseña incorrecta.',
      },
      login: {
        title: 'Autenticación de Dos Factores',
        description: 'Ingrese el código de su aplicación de autenticación',
        enterCode: 'Código de 6 dígitos',
        codePlaceholder: '000000',
        verify: 'Verificar',
        verifying: 'Verificando...',
        cancel: 'Cancelar',
        errorTitle: 'Error',
        errorMessage: 'Código inválido. Por favor intente de nuevo.',
      },
    },
    bankAccounts: {
      title: 'Cuentas Bancarias',
      description: 'Administre sus cuentas bancarias externas',
      addAccount: 'Agregar Cuenta',
      noAccountsTitle: 'Sin Cuentas Bancarias',
      noAccountsDescription: 'Agregue una cuenta bancaria para realizar transferencias.',
      accountLabel: 'Etiqueta',
      bankName: 'Banco',
      iban: 'IBAN',
      bic: 'BIC',
      createdAt: 'Agregado el',
      actions: 'Acciones',
      delete: 'Eliminar',
      deleteConfirm: '¿Está seguro que desea eliminar esta cuenta?',
      deleteSuccess: 'Cuenta eliminada exitosamente',
      addAccountTitle: 'Agregar Cuenta Bancaria',
      addAccountDescription: 'Agregue una cuenta bancaria externa para transferencias',
      accountLabelLabel: 'Etiqueta de la Cuenta',
      accountLabelPlaceholder: 'Ej: Cuenta corriente principal',
      accountLabelRequired: 'La etiqueta es requerida',
      bankNameLabel: 'Nombre del Banco',
      bankNamePlaceholder: 'Ej: Santander',
      bankNameRequired: 'El nombre del banco es requerido',
      ibanLabel: 'IBAN',
      ibanPlaceholder: 'ES91 2100 0418 4502 0005 1332',
      ibanRequired: 'El IBAN es requerido',
      invalidIban: 'Formato de IBAN inválido',
      bicLabel: 'BIC/SWIFT',
      bicPlaceholder: 'CAIXESBBXXX',
      invalidBic: 'Formato de BIC inválido',
      submit: 'Agregar Cuenta',
      submitting: 'Agregando...',
      cancel: 'Cancelar',
      addSuccess: 'Cuenta Agregada',
      addSuccessDesc: 'La cuenta bancaria ha sido agregada exitosamente.',
      addError: 'Error al agregar cuenta',
      addFirstAccount: 'Agregar su primera cuenta',
      deleteSuccessDesc: 'La cuenta bancaria ha sido eliminada exitosamente.',
      deleteError: 'No se pudo eliminar la cuenta bancaria.',
    },
    welcomeModal: {
      title: 'Bienvenido a ALTUS',
      description: 'Su cuenta ha sido creada exitosamente',
      accountType: 'Su Tipo de Cuenta',
      individualAccount: 'Cuenta Personal',
      businessAccount: 'Cuenta Empresarial',
      individualAccess: 'Acceso a servicios de financiamiento personal',
      businessAccess: 'Acceso completo a servicios de financiamiento empresarial',
      availableOffers: 'Ofertas disponibles para usted',
      getStarted: 'Comenzar',
    },
    calculator: {
      title: 'Calculadora de Amortización',
      description: 'Simule su plan de pago',
      loanAmount: 'Monto del Préstamo',
      interestRate: 'Tasa de Interés Anual (%)',
      loanDuration: 'Duración del Préstamo',
      months: 'meses',
      calculate: 'Calcular',
      results: 'Resultados',
      monthlyPayment: 'Pago Mensual',
      totalInterest: 'Intereses Totales',
      totalAmount: 'Monto Total',
      amortizationSchedule: 'Tabla de Amortización',
      month: 'Mes',
      payment: 'Pago',
      principal: 'Capital',
      interest: 'Intereses',
      balance: 'Saldo Restante',
      downloadSchedule: 'Descargar Tabla',
    },
    amortization: {
      interactiveTitle: 'Tabla de Amortización Interactiva',
      interactiveDescription: 'Seleccione un préstamo activo y personalice los parámetros para ver el impacto en los pagos',
      calculatorTitle: 'Calculadora de Amortización Interactiva',
      calculatorDescription: 'Simule su plan de pago y visualice la evolución de su préstamo',
      selectActiveLoan: 'Seleccionar un préstamo activo',
      chooseLoan: 'Elija un préstamo...',
      loanOf: 'Préstamo de',
      at: 'al',
      loanAmount: 'Monto del Préstamo (€)',
      annualInterestRate: 'Tasa de Interés Anual (%)',
      duration: 'Duración (años)',
      years: 'años',
      calculateAmortization: 'Calcular Amortización',
      calculatePlan: 'Calcular Plan de Amortización',
      monthlyPayment: 'Pago Mensual',
      totalPayment: 'Total a Pagar',
      totalInterest: 'Total de Intereses',
      table: 'Tabla',
      evolution: 'Evolución',
      cumulative: 'Acumulativo',
      breakdown: 'Desglose',
      month: 'Mes',
      payment: 'Pago',
      principal: 'Principal',
      interest: 'Intereses',
      balance: 'Saldo',
      amount: 'Monto (€)',
      monthLabel: 'Mes',
      noActiveLoans: 'Sin préstamos activos',
      noActiveLoansDesc: 'No tiene préstamos activos en este momento. Solicite un nuevo préstamo para usar esta función.',
      loanType: 'Tipo de Préstamo',
      selectType: 'Seleccione el tipo',
      personal: 'Personal',
      business: 'Empresarial',
      realEstate: 'Inmobiliario',
      automaticallyCalculated: 'Calculado automáticamente',
      rateInfo: 'La tasa de interés se calcula automáticamente según el monto y el tipo de préstamo. Todas las solicitudes de préstamo requieren aprobación administrativa.',
      requestLoan: 'Solicitar este préstamo',
      sending: 'Enviando...',
      chart: 'Gráfico',
      balanceEvolution: 'Evolución del saldo y pagos',
      principalVsInterest: 'Desglose Principal vs Intereses',
      monthlyRepaymentPlan: 'Plan de pago mensual',
      remainingBalance: 'Saldo restante',
      errors: {
        amountPositive: 'El monto del préstamo debe ser mayor que €0',
        amountMax: 'El monto del préstamo no puede exceder €10,000,000',
        rateNegative: 'La tasa de interés no puede ser negativa',
        rateMax: 'La tasa de interés no puede exceder el 100%',
        durationPositive: 'La duración del préstamo debe ser mayor que 0 años',
        durationMax: 'La duración del préstamo no puede exceder 50 años',
      },
    },
    kycDocuments: {
      title: 'Documentos KYC',
      description: 'Suba sus documentos de identificación',
      uploadDocuments: 'Suba Sus Documentos',
      documentType: 'Tipo de Documento',
      selectDocumentType: 'Seleccione el tipo',
      identity: 'Documento de Identidad',
      proof_of_address: 'Comprobante de Domicilio',
      income_proof: 'Comprobante de Ingresos',
      business_registration: 'Registro Mercantil',
      financial_statements: 'Estados Financieros',
      tax_returns: 'Declaración de Impuestos',
      chooseFile: 'Elegir Archivo',
      upload: 'Subir',
      uploading: 'Subiendo...',
      uploadSuccess: 'Documento Subido',
      uploadSuccessDesc: 'Su documento ha sido subido exitosamente.',
      uploadError: 'Error al subir',
      status: 'Estado',
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      uploadedAt: 'Subido el',
      noDocuments: 'No se subieron documentos',
    },
    transferFlow: {
      backToDashboard: 'Volver al Panel',
      form: {
        title: 'Nueva Transferencia',
        subtitle: 'Inicie una transferencia segura a una cuenta externa',
        amountLabel: 'Monto (EUR)',
        amountPlaceholder: '10000',
        amountHelper: 'Monto fijo basado en su préstamo activo (no modificable)',
        accountLabel: 'Cuenta Externa (opcional)',
        accountPlaceholder: 'Seleccionar una cuenta',
        externalAccountLabel: 'Cuenta externa *',
        selectAccountPlaceholder: 'Seleccionar una cuenta',
        noAccount: 'Ninguna cuenta registrada',
        recipientLabel: 'Beneficiario',
        recipientPlaceholder: 'Nombre del beneficiario',
        initiateButton: 'Iniciar Transferencia',
        initiating: 'Iniciando...',
      },
      verification: {
        title: 'Verificación de Transferencia',
        subtitle: 'Por favor espere mientras verificamos su transferencia',
        doNotClose: 'No cierre esta página',
        doNotCloseDesc: 'Su transferencia está siendo verificada por nuestro sistema seguro. Esta operación toma aproximadamente 45 segundos.',
        progressLabel: 'Progreso de Verificación',
        verificationSteps: 'Pasos de Verificación',
        step1: 'Verificación de cuenta emisora',
        step2: 'Validación de monto y tarifas',
        step3: 'Control de seguridad antifraude',
        step4: 'Preparación de transferencia segura',
      },
      validation: {
        title: 'Validación de Transferencia',
        subtitle: 'Código {sequence} / {total}',
        demoCodeLabel: 'Código de demostración:',
        codeLabel: 'Código de Validación (6 dígitos)',
        codePlaceholder: '000000',
        codeHelpText: 'Se ha enviado un código a su correo electrónico',
        validateButton: 'Validar',
        validating: 'Validando...',
        resendButton: 'Reenviar',
        historyLabel: 'Historial',
      },
      progress: {
        titlePaused: 'Transferencia en Pausa',
        titleInProgress: 'Transferencia en Curso',
        securityVerificationTitle: 'Verificación de seguridad',
        transferProcessingTitle: 'Transferencia en proceso',
        toPrefix: 'Para:',
        securityVerificationRequired: 'Verificación de seguridad requerida',
        enterVerificationCode: 'Por razones de seguridad, ingrese el código de verificación que se le envió',
        codeFromAdvisor: 'Su asesor le proporcionará el código de seguridad',
        validationCodeLabel: 'Código de validación (6 dígitos)',
        enterCodePlaceholder: 'Ingrese el código de 6 dígitos',
        validating: 'Validando...',
        validateAndContinue: 'Validar y continuar',
        processingTransfer: 'Procesando su transferencia...',
        doNotCloseProcessing: 'Su operación se está procesando de forma segura. No cierre esta página.',
        amountLabel: 'Monto: {amount} EUR a {recipient}',
        progressLabel: 'Progreso',
        pauseTitle: 'Código de desbloqueo requerido al {percent}%',
        pauseDescription: 'Por favor contacte al servicio al cliente para obtener el código de desbloqueo de su transferencia.',
        pauseCodeLabel: 'Código de Desbloqueo',
        pauseCodePlaceholder: 'Ingrese el código',
        validatePauseCode: 'Validar Código',
        statusLabel: 'Estado Actual',
        statusCompleted: '¡Transferencia completada!',
        statusProcessing: 'Procesamiento en curso por nuestro sistema bancario...',
        eventsLabel: 'Eventos',
        circularProgressTitle: 'Verificación de la transferencia',
        circularProgressSubtitle: 'Su operación está siendo procesada de forma segura.',
      },
      complete: {
        title: 'Transferencia Completada',
        subtitle: 'Su transferencia se ha realizado exitosamente',
        successMessage: 'Su transferencia se ha completado con éxito. Los fondos estarán disponibles en 24 a 72 horas.',
        referenceLabel: 'Referencia',
        returnToDashboard: 'Volver al panel',
        amountLabel: 'Monto',
        recipientLabel: 'Beneficiario',
        feesLabel: 'Tarifas',
      },
      toast: {
        transferInProgress: 'Transferencia en curso',
        transferAlreadyInProgress: 'Ya hay una transferencia en curso para este préstamo. Redirigiendo...',
        transferInitiated: 'Transferencia iniciada con éxito. Verificación en curso...',
        selectExternalAccount: 'Por favor, seleccione una cuenta externa.',
        noActiveLoan: 'No hay préstamo activo disponible.',
        initiated: 'Transferencia Iniciada',
        initiatedDesc: 'Verificación de su transferencia en curso...',
        error: 'Error',
        errorInitiation: 'Fallo al iniciar la transferencia',
        codeValidated: 'Código Validado',
        codeInvalid: 'Código Inválido',
        codeInvalidDesc: 'El código es incorrecto o ha expirado',
        codeSent: 'Código Enviado',
        codeSentDesc: 'Código {sequence} enviado exitosamente',
        approved: 'Transferencia Aprobada',
        approvedDesc: 'Su transferencia está aprobada y siendo procesada.',
        fieldsRequired: 'Campos Requeridos',
        fieldsRequiredDesc: 'Por favor complete todos los campos',
        invalidCode: 'Código Inválido',
        invalidCodeDesc: 'El código debe contener 6 dígitos',
        codeRequired: 'Código Requerido',
        codeRequiredDesc: 'Por favor ingrese el código de desbloqueo',
        unblocked: 'Transferencia Desbloqueada',
        unblockedDesc: 'La transferencia ha sido desbloqueada exitosamente',
      },
    },
    loanOffers: {
      pageTitle: 'Nuestras Ofertas de Préstamos',
      pageSubtitle: 'Descubra todas nuestras soluciones de financiamiento para particulares y profesionales',
      accountInfo: 'Cuenta {accountType}:',
      individualTab: 'Préstamos Personales',
      businessTab: 'Préstamos Empresariales',
      individual: 'Particular',
      business: 'Profesional',
      amountLabel: 'Monto',
      rateLabel: 'Tasa',
      durationLabel: 'Duración',
      advantagesLabel: 'Ventajas',
      requestButton: 'Solicitar este Préstamo',
      loginToRequest: 'Iniciar Sesión para Solicitar',
      types: {
        personalLoan: {
          title: 'Préstamo Personal',
          description: 'Financiamiento flexible para todos sus proyectos personales',
          features: ['Respuesta rápida', 'Sin justificación de uso', 'Reembolso flexible'],
        },
        mortgageLoan: {
          title: 'Préstamo Hipotecario',
          description: 'Financie la compra de su residencia principal o secundaria',
          features: ['Tasa fija o variable', 'Hasta el 80% del monto', 'Seguro incluido'],
        },
        autoLoan: {
          title: 'Crédito Auto',
          description: 'Compre su vehículo nuevo o usado',
          features: ['Desembolso rápido', 'Posibilidad de reembolso anticipado', 'Seguro opcional'],
        },
        studentLoan: {
          title: 'Préstamo Estudiantil',
          description: 'Financie sus estudios con condiciones ventajosas',
          features: ['Reembolso diferido', 'Tasas preferenciales', 'Garantía parental opcional'],
        },
        greenLoan: {
          title: 'Préstamo Verde',
          description: 'Financie sus proyectos de renovación energética',
          features: ['Tasa reducida', 'Elegible para ayudas estatales', 'Financiamiento eco-responsable'],
        },
        renovationLoan: {
          title: 'Préstamo para Reformas',
          description: 'Renueve y mejore su vivienda',
          features: ['Sin hipoteca hasta 75k€', 'Desembolso progresivo posible', 'Deducción fiscal posible'],
        },
        businessLoan: {
          title: 'Préstamo Empresarial',
          description: 'Financiamiento para sus proyectos empresariales, desarrollo y tesorería',
          features: ['Respuesta en 48h', 'Tasa fija', 'Reembolso flexible'],
        },
        cashFlowCredit: {
          title: 'Crédito de Tesorería',
          description: 'Solución rápida para gestionar sus necesidades de capital de trabajo',
          features: ['Desembolso rápido', 'Sin garantía hasta 50k€', 'Flexible'],
        },
        equipmentFinancing: {
          title: 'Financiamiento de Equipos',
          description: 'Compre sus equipos y materiales profesionales',
          features: ['Hasta el 100% del monto', 'Opción de arrendamiento', 'Deducción fiscal'],
        },
        commercialPropertyLoan: {
          title: 'Préstamo Inmobiliario Comercial',
          description: 'Adquiera sus locales profesionales, oficinas o almacenes',
          features: ['Duración larga', 'Entrada desde el 20%', 'Tasa competitiva'],
        },
        lineOfCredit: {
          title: 'Línea de Crédito',
          description: 'Crédito renovable para sus necesidades puntuales',
          features: ['Disponible 24/7', 'Reembolso libre', 'Renovación automática'],
        },
        vehicleFleetLoan: {
          title: 'Crédito para Flota de Vehículos',
          description: 'Financie su flota automotriz o vehículos utilitarios',
          features: ['Arrendamiento o crédito tradicional', 'Opción de recompra', 'Seguro incluido'],
        },
      },
    },
    cardTermsContent: {
      title: 'Condiciones Generales de Uso - Tarjeta Virtual ALTUS',
      lastUpdated: 'Última actualización: Noviembre 2025',
      section1: {
        title: '1. OBJETO Y ÁMBITO DE APLICACIÓN',
        content: 'Las presentes condiciones generales (en adelante "CGU") rigen el uso de la tarjeta bancaria virtual ALTUS (en adelante "la Tarjeta Virtual"), propuesta por ALTUS Finance Group a los clientes titulares de una cuenta ALTUS (en adelante "el Titular"). La Tarjeta Virtual es un medio de pago desmaterializado vinculado a su cuenta ALTUS.',
      },
      section2: {
        title: '2. DESCRIPCIÓN DEL SERVICIO',
        subtitle1: '2.1 Naturaleza de la Tarjeta Virtual',
        content1: 'La Tarjeta Virtual es una tarjeta de pago desmaterializada que incluye un número de tarjeta de 16 dígitos, una fecha de vencimiento y un criptograma visual (CVV). Funciona como una tarjeta bancaria física pero existe únicamente en forma electrónica.',
        subtitle2: '2.2 Tipo de Tarjeta',
        item1: 'Tarjeta virtual permanente: credenciales fijas durante toda su validez (3 años)',
        item2: 'Tarjeta virtual efímera: credenciales temporales con monto y duración configurables',
      },
      section3: {
        title: '3. CONDICIONES DE ELEGIBILIDAD',
        content: 'Para obtener una Tarjeta Virtual, el Titular debe:',
        list: [
          'Ser cliente ALTUS con una cuenta activa y con fondos',
          'Haber completado la verificación de identidad (KYC)',
          'No estar en situación de descubierto no autorizado',
          'Haber activado la autenticación fuerte (doble factor)',
          'Aceptar las presentes CGU y las Condiciones Tarifarias',
        ],
      },
      section4: {
        title: '4. ACTIVACIÓN Y USO',
        subtitle1: '4.1 Activación',
        content1: 'La Tarjeta Virtual se activa instantáneamente desde su creación a través de la aplicación o el área de cliente ALTUS. El Titular recibe inmediatamente las credenciales completas de la tarjeta.',
        subtitle2: '4.2 Usos Autorizados',
        list1: [
          'Pagos en todos los sitios comerciales en línea que acepten Visa/Mastercard',
          'Pagos recurrentes y suscripciones (solo tarjeta permanente)',
          'Compras en sitios internacionales',
          'Pagos sin contacto en tienda (si se agrega a Apple Pay/Google Pay)',
        ],
        subtitle3: '4.3 Limitaciones',
        list2: [
          'Sin retiros de efectivo en cajeros automáticos',
          'Presentación física imposible (alquiler de automóviles, algunos hoteles)',
          'Algunos proveedores pueden rechazar tarjetas virtuales',
        ],
      },
      section5: {
        title: '5. SEGURIDAD Y PROTECCIÓN',
        subtitle1: '5.1 Seguridad Reforzada',
        list1: [
          'Las credenciales de su tarjeta bancaria física nunca se exponen',
          'Posibilidad de bloquear/desbloquear instantáneamente la tarjeta',
          'Eliminación definitiva con un clic',
          'Protección 3D Secure en todas las transacciones',
          'CVV dinámico para máxima seguridad',
        ],
        subtitle2: '5.2 Obligaciones del Titular',
        content2: 'El Titular se compromete a conservar las credenciales de su Tarjeta Virtual de manera confidencial y a no comunicarlas a terceros. En caso de sospecha de fraude, el Titular debe bloquear o eliminar inmediatamente la tarjeta a través de su área de cliente.',
        subtitle3: '5.3 Garantías y Seguros',
        content3: 'La Tarjeta Virtual se beneficia de las mismas garantías que su tarjeta física, incluyendo protección contra fraude, seguro de compras y garantía de entrega conforme.',
      },
      section6: {
        title: '6. LÍMITES Y TECHOS',
        content: 'Los límites de pago de la Tarjeta Virtual son idénticos a los de su tarjeta principal ALTUS:',
        list: [
          'Límite mensual: hasta 50.000 € según su perfil',
          'Límite por transacción: hasta 10.000 €',
          'Posibilidad de ajustar temporalmente los límites desde la aplicación',
        ],
        content2: 'Para tarjetas efímeras, usted define el monto máximo y la duración de validez durante la creación.',
      },
      section7: {
        title: '7. TARIFAS',
        list: [
          'Creación de tarjeta virtual: Gratis',
          'Tarifas de transacción en zona euro: 0%',
          'Pagos fuera de zona euro: 1,5% del monto',
          'Cuota anual: Gratis',
          'Bloqueo/Desbloqueo: Gratis e ilimitado',
        ],
      },
      section8: {
        title: '8. DÉBITO Y EXTRACTO',
        content: 'Todas las operaciones realizadas con la Tarjeta Virtual se debitan en tiempo real de su cuenta ALTUS. Aparecen inmediatamente en su historial de transacciones y en sus extractos mensuales.',
      },
      section9: {
        title: '9. OPOSICIÓN Y RESOLUCIÓN',
        subtitle1: '9.1 Bloqueo Temporal',
        content1: 'Puede bloquear su Tarjeta Virtual en cualquier momento desde su área de cliente. El desbloqueo es instantáneo.',
        subtitle2: '9.2 Eliminación Definitiva',
        content2: 'La eliminación de una Tarjeta Virtual es inmediata e irreversible. Las suscripciones vinculadas a esta tarjeta serán automáticamente rechazadas. Se recomienda actualizar su información de pago con los comerciantes concernidos antes de la eliminación.',
        subtitle3: '9.3 En Caso de Fraude',
        content3: 'En caso de pérdida o robo presunto de credenciales, elimine inmediatamente la tarjeta desde su aplicación y contacte a nuestro servicio de atención al cliente al +34 XX XX XX XX (disponible 24h/24, 7d/7).',
      },
      section10: {
        title: '10. RESPONSABILIDAD',
        content: 'ALTUS no podrá ser responsable en caso de:',
        list: [
          'Rechazo de un comerciante a aceptar la Tarjeta Virtual',
          'Interrupción temporal del servicio por mantenimiento',
          'Uso fraudulento resultante de negligencia del Titular',
          'Disputas comerciales entre el Titular y un comerciante',
        ],
        content2: 'El Titular es enteramente responsable del uso de su Tarjeta Virtual y de las operaciones realizadas hasta la notificación de un uso fraudulento.',
      },
      section11: {
        title: '11. DURACIÓN Y MODIFICACIÓN',
        content: 'Las presentes CGU se concluyen por duración indeterminada. ALTUS se reserva el derecho de modificar las presentes CGU en cualquier momento. Toda modificación será notificada al Titular al menos 2 meses antes de su entrada en vigor. La ausencia de oposición en este plazo valdrá aceptación.',
      },
      section12: {
        title: '12. RECLAMACIONES',
        content: 'Para cualquier reclamación, el Titular puede contactar al servicio de atención al cliente ALTUS:',
        list: [
          'Por correo electrónico: support@altusgroup.com',
          'Por teléfono: +34 XX XX XX XX',
          'A través del área de cliente segura',
        ],
        content2: 'En ausencia de respuesta satisfactoria en un plazo de 2 meses, el Titular puede recurrir al Mediador de la AMF.',
      },
      section13: {
        title: '13. DERECHO APLICABLE Y JURISDICCIÓN',
        content: 'Las presentes CGU se rigen por el derecho español. Todo litigio relativo a su interpretación o ejecución es competencia exclusiva de los tribunales españoles.',
      },
      note: 'Al activar su Tarjeta Virtual ALTUS, usted reconoce haber leído, comprendido y aceptado la totalidad de las presentes Condiciones Generales de Uso.',
    },
    processTimeline: {
      title: 'Proceso de Financiamiento',
      subtitle: 'Desde su solicitud hasta el desembolso de fondos: un recorrido simplificado y rápido',
      step1Title: 'Solicitud en línea',
      step1Duration: '5 minutos',
      step1Description: 'Complete nuestro formulario seguro y cargue sus documentos justificativos',
      step1Docs: [
        'Registro de empresa de menos de 3 meses',
        'Documento de identidad del gerente',
        'Últimos estados financieros',
        'Estados de cuenta bancarios (3 meses)'
      ],
      step2Title: 'Análisis del expediente',
      step2Duration: '24-48h',
      step2Description: 'Nuestro equipo de expertos estudia su solicitud y capacidad de reembolso',
      step2Docs: [
        'Verificación de documentos',
        'Análisis financiero',
        'Estudio de solvencia',
        'Cálculo de tasa personalizada'
      ],
      step3Title: 'Aprobación preliminar',
      step3Duration: '48h',
      step3Description: 'Recepción de su oferta de préstamo detallada con condiciones definitivas',
      step3Docs: [
        'Monto aprobado',
        'TAE y mensualidades',
        'Garantías requeridas',
        'Condiciones suspensivas'
      ],
      step4Title: 'Desembolso de fondos',
      step4Duration: '7-15 días',
      step4Description: 'Firma electrónica del contrato y pago en 7 a 15 días después de implementar las garantías',
      step4Docs: [
        'Firma del contrato de préstamo',
        'Implementación de garantías',
        'Seguro del prestatario',
        'Transferencia de fondos'
      ],
      documentsTitle: 'Documentos a Preparar según su Proyecto',
      creationTitle: 'Creación de empresa',
      creationDocs: [
        'Plan de negocio detallado',
        'Previsión financiera a 3 años',
        'Plan de financiamiento',
        'CV del gerente y experiencia',
        'Justificante de aporte personal'
      ],
      repriseTitle: 'Adquisición de empresa',
      repriseDocs: [
        'Protocolo de acuerdo de adquisición',
        'Balances de los últimos 3 ejercicios',
        'Valoración del fondo de comercio',
        'Contrato de arrendamiento comercial',
        'Certificado sin gravámenes'
      ],
      developmentTitle: 'Desarrollo',
      developmentDocs: [
        'Balances de los últimos 3 ejercicios',
        'Paquete fiscal completo',
        'Cotizaciones de proveedores (equipo)',
        'Estados de cuenta bancarios profesionales (6 meses)',
        'Previsión de actividad'
      ],
      incompleteTitle: '¿Expediente incompleto? ¡No se preocupe!',
      incompleteDescription: 'Nuestro equipo le ayuda a constituir su expediente. Le asistimos para obtener los documentos faltantes.',
      needHelp: '¿Necesita ayuda?',
      averageTime: 'Tiempo total promedio:',
      averageTimeValue: '2 a 3 semanas desde la presentación del expediente hasta el desembolso de fondos',
      startApplication: 'Comenzar mi solicitud'
    },
    guaranteesSection: {
      title: 'Garantías y Seguridad',
      subtitle: 'Múltiples opciones para asegurar su financiamiento y optimizar sus impuestos',
      organizationalTitle: 'Garantías Organizacionales',
      organizationalItems: [
        'BPI France (40-70% del préstamo)',
        'SIAGI (garantía artesanos/comerciantes)',
        'France Active (economía social)',
        'SOCAMA (agricultores)'
      ],
      realTitle: 'Garantías Reales',
      realItems: [
        'Hipoteca sobre bienes inmobiliarios',
        'Prenda del fondo de comercio',
        'Prenda sobre material/equipo',
        'Privilegio del prestamista de dinero'
      ],
      personalTitle: 'Garantías Personales',
      personalItems: [
        'Fianza solidaria del gerente',
        'Fianza bancaria profesional',
        'Garantía a primera solicitud',
        'Carta de confort del grupo'
      ],
      insuranceTitle: 'Seguro del Prestatario',
      insuranceItems: [
        'Fallecimiento / PTIA (obligatorio)',
        'Invalidez permanente (IPT/IPP)',
        'Incapacidad temporal (ITT)',
        'Cotizaciones fiscalmente deducibles'
      ],
      taxBenefitsTitle: 'Ventajas Fiscales del Préstamo Profesional',
      taxBenefit1Title: 'Deducibilidad de intereses',
      taxBenefit1Description: 'Los intereses del préstamo son deducibles del resultado fiscal de su empresa, reduciendo así su impuesto sobre los beneficios.',
      taxBenefit2Title: 'Depreciación acelerada',
      taxBenefit2Description: 'Para equipos financiados, posibilidad de depreciación acelerada bajo ciertas condiciones (equipo nuevo, ecológico, etc.).',
      taxBenefit3Title: 'Crédito fiscal',
      taxBenefit3Description: 'Ciertas inversiones dan derecho a créditos fiscales (transición energética, digital, formación).',
      taxBenefit4Title: 'IVA recuperable',
      taxBenefit4Description: 'El IVA sobre intereses y gastos de tramitación es recuperable para empresas sujetas.',
      taxAdvice: 'Consejo fiscal: Consulte a su contador para optimizar la deducibilidad de sus préstamos y maximizar sus ventajas fiscales.',
      contributionTitle: 'Aporte Personal Requerido',
      equipmentPercentage: '10-15%',
      equipmentLabel: 'Equipo',
      equipmentDescription: 'Material, vehículos',
      creationPercentage: '20-30%',
      creationLabel: 'Creación / Adquisición',
      creationDescription: 'Fondo de comercio',
      realEstatePercentage: '20-25%',
      realEstateLabel: 'Inmobiliario Profesional',
      realEstateDescription: 'Locales, oficinas',
      contributionDisclaimer: '* Porcentajes indicativos que pueden variar según su proyecto y perfil'
    },
    footer: {
      description: 'Su socio de confianza para todos sus proyectos de financiamiento. Soluciones de préstamo adaptadas a particulares y profesionales.',
      phone: '+352 40 63 48',
      email: 'infos@altusfinancegroup.com',
      address: '19 Rue Sigismond, L-2537 Luxembourg',
      hoursTitle: 'Horario de Atención',
      hours: {
        weekdays: 'Lun - Vie: 9:00 - 19:00',
        weekend: 'Sáb: 9:00 - 17:00',
        support: 'Soporte reactivo',
      },
      certificationsTitle: 'Certificaciones y Seguridad',
      certifications: [
        'Regulado por ACPR',
        'Certificado ISO 27001',
        'Cumplimiento RGPD',
        'Seguridad SSL/TLS',
        'Miembro FBF',
      ],
      productsTitle: 'Nuestros Productos',
      products: {
        personal: 'Préstamos Personales',
        business: 'Préstamos Profesionales',
        mortgage: 'Préstamo Hipotecario',
        auto: 'Crédito Automático',
        renovation: 'Préstamo para Reformas',
      },
      companyTitle: 'Empresa',
      careers: 'Carreras',
      legalTitle: 'Legal',
      legalLinks: {
        terms: 'Aviso Legal',
        privacy: 'Política de Privacidad',
        cgu: 'CGU',
        cookies: 'Cookies',
        gdpr: 'RGPD',
      },
      helpTitle: 'Ayuda',
      helpLinks: {
        faq: 'FAQ',
        userGuide: 'Guía de Usuario',
        support: 'Soporte al Cliente',
        simulator: 'Simulador de Préstamos',
        contactUs: 'Contáctenos',
      },
      copyright: 'Altus Finance Group. Todos los derechos reservados.',
      regulatory: 'Altus Finance Group es una marca de financiamiento aprobada por la ACPR. Organismo de crédito sujeto al control del Banco de Francia.',
      disclaimer: 'Atención, pedir dinero prestado también cuesta dinero. La información en esta página se proporciona únicamente con fines informativos y no constituye una oferta contractual. Todas las solicitudes de crédito están sujetas a revisión y aceptación del expediente. Un crédito le compromete y debe ser reembolsado. Verifique su capacidad de reembolso antes de comprometerse.',
    },
    seo: {
      home: {
        title: 'Altus Finance Group - Préstamos Profesionales y Personales | Financiamiento Rápido y Competitivo',
        description: 'Soluciones de préstamos profesionales y personales con Altus Finance Group. Obtenga financiamiento rápido para su negocio o proyecto personal. Tasas competitivas, proceso simple y transparente.',
      },
      about: {
        title: 'Acerca de Altus Finance Group - Nuestra Misión y Valores | Soluciones de Financiamiento',
        description: 'Descubra Altus Finance Group, líder en soluciones de préstamos profesionales con más de 15 años de experiencia, 10,000+ clientes satisfechos y €500M en préstamos otorgados. Nuestra misión: hacer el financiamiento accesible para todos.',
      },
      contact: {
        title: 'Contáctenos - Altus Finance Group | Preguntas sobre Nuestros Préstamos Profesionales',
        description: '¿Tiene una pregunta sobre nuestras soluciones de financiamiento? Contacte a Altus Finance Group. Nuestro equipo está disponible para apoyarlo con su proyecto de préstamo profesional. Respuesta rápida garantizada.',
      },
      howItWorks: {
        title: 'Cómo Obtener un Préstamo Comercial - Proceso Detallado | Altus Finance Group',
        description: 'Descubra el proceso completo para obtener un préstamo profesional con Altus Finance Group. Desde la solicitud en línea hasta la liberación de fondos: criterios, documentos requeridos y plazos. Respuesta en 24-48h.',
      },
      forgotPassword: {
        title: 'Olvidó su Contraseña | Altus Finance Group',
        description: 'Restablezca su contraseña',
        emailSentTitle: 'Correo Enviado | Altus Finance Group',
        emailSentDescription: 'Se ha enviado un enlace de restablecimiento',
      },
      resetPassword: {
        title: 'Restablecer Contraseña | Altus Finance Group',
        description: 'Cree una nueva contraseña para su cuenta',
      },
      twoFactorSetup: {
        title: 'Configuración 2FA | Altus Finance Group',
        description: 'Configure la autenticación de dos factores para asegurar su cuenta',
      },
      verifyTwoFactor: {
        title: 'Verificación 2FA | Altus Finance Group',
        description: 'Verificación de dos factores',
      },
    },
    businessLoans: {
      title: 'Soluciones para Profesionales',
      subtitle: 'Financiamiento adaptado a las necesidades de su empresa, microempresa, PYME o autónomo',
      businessLoan: 'Préstamo Profesional',
      businessLoanDesc: 'Financiamiento para sus proyectos empresariales, desarrollo y flujo de caja',
      businessLoanFeatures: ['Respuesta en 48h', 'Tasa fija', 'Reembolso flexible'],
      cashFlowCredit: 'Crédito de Flujo de Caja',
      cashFlowCreditDesc: 'Solución rápida para gestionar sus necesidades de capital de trabajo',
      cashFlowCreditFeatures: ['Desembolso rápido', 'Sin garantía hasta €50k', 'Flexible'],
      equipmentFinancing: 'Financiamiento de Equipos',
      equipmentFinancingDesc: 'Compre sus equipos y materiales profesionales',
      equipmentFinancingFeatures: ['Hasta 100% del monto', 'Opción de leasing', 'Deducible de impuestos'],
      commercialProperty: 'Préstamo Inmobiliario Profesional',
      commercialPropertyDesc: 'Adquiera sus locales, oficinas o almacenes profesionales',
      commercialPropertyFeatures: ['Larga duración', 'Aporte desde 20%', 'Tasa competitiva'],
      lineOfCredit: 'Línea de Crédito',
      lineOfCreditDesc: 'Crédito renovable para sus necesidades ocasionales',
      lineOfCreditFeatures: ['Disponible 24/7', 'Reembolso libre', 'Renovación automática'],
      lineOfCreditDuration: 'Renovable',
      vehicleFleet: 'Crédito para Vehículos Profesionales',
      vehicleFleetDesc: 'Financie su flota de vehículos o vehículos utilitarios',
      vehicleFleetFeatures: ['Leasing o crédito clásico', 'Opción de recompra', 'Seguro incluido'],
      smeLoan: 'Préstamos PYME',
      smeLoanDesc: 'Soluciones de financiamiento dedicadas a PYME para crecimiento, desarrollo e inversiones estratégicas',
      smeLoanFeatures: ['Montos altos hasta €1M', 'Duración flexible 1-10 años', 'Acompañamiento experto'],
      amount: 'Monto',
      rate: 'TAE',
      duration: 'Duración',
      months: 'meses',
      years: 'años',
      features: 'Ventajas',
      learnMore: 'Más información',
      advantagesTitle: 'Ventajas ALTUS Pro',
      advantages: [
        'Asesor dedicado para su empresa',
        'Estudio personalizado de su expediente',
        'Acompañamiento en sus trámites',
        'Montaje de plan de negocios incluido',
      ],
      eligibilityTitle: 'Criterios de Elegibilidad',
      eligibility: [
        'Empresa registrada en Francia',
        'Activa desde más de 6 meses',
        'Sin prohibición bancaria',
        'Estados financieros actualizados',
      ],
      rateDisclaimer: 'Tasas indicativas sujetas al estudio y aceptación de su solicitud. TAE fija.',
      simulateLoan: 'Simular mi préstamo profesional',
      contactAdvisor: 'Contactar a un asesor',
    },
    professionalFAQ: {
      title: 'Preguntas Frecuentes',
      subtitle: 'Encuentre respuestas a sus preguntas rápidamente',
      faqs: [
        {
          question: '¿Qué documentos se requieren para una solicitud de préstamo profesional?',
          answer: 'Para profesionales: Registro de empresa con menos de 3 meses, identificación del director, estados financieros de los últimos 3 años, documentos fiscales completos, extractos bancarios comerciales (6 meses), plan de negocios (para startups), previsión financiera. Para particulares: identificación, comprobante de domicilio, recibos de sueldo recientes y aviso de impuestos.',
        },
        {
          question: '¿Qué contribución personal se requiere para un préstamo profesional?',
          answer: 'La contribución personal varía según el proyecto: 10-15% para compra de equipos o materiales, 20-30% para creación o adquisición de negocios, 20-25% para bienes raíces comerciales. Una contribución mayor puede mejorar sus condiciones de financiamiento y reducir su tasa.',
        },
        {
          question: '¿Cuál es el plazo para obtener una respuesta y los fondos?',
          answer: 'Aprobación inicial en 24-48h después de enviar la solicitud completa. Aprobación final en 48h. El desembolso de fondos ocurre de 7 a 15 días después de la firma del contrato y configuración de garantías. Tiempo total promedio: 2 a 3 semanas.',
        },
        {
          question: '¿Qué garantías puedo ofrecer para mi préstamo profesional?',
          answer: 'Varias opciones: garantías reales (hipoteca, prenda de fondo de comercio, gravamen de material), garantías personales (fianza solidaria del director), organizaciones de garantía (BPI France 40-70%, SIAGI, France Active, SOCAMA), o seguro del prestatario (obligatorio: muerte/PTIA, opcional: IPT/IPP/ITT).',
        },
        {
          question: '¿Los pagos de intereses del préstamo son deducibles de impuestos?',
          answer: '¡Sí! Los intereses del préstamo profesional son completamente deducibles del ingreso imponible de su empresa, reduciendo así su impuesto sobre beneficios. Además, las primas del seguro del prestatario también son deducibles. El IVA sobre intereses y comisiones es recuperable para empresas responsables.',
        },
        {
          question: '¿Puedo obtener un préstamo si mi empresa tiene menos de un año?',
          answer: 'Sí, financiamos startups con un plan de negocios sólido y contribución personal del 20-30%. Evaluamos su experiencia profesional, viabilidad del proyecto y proyecciones. Un préstamo de honor (BPI France, Initiative France) puede fortalecer su solicitud.',
        },
        {
          question: '¿Puedo pagar mi préstamo profesional anticipadamente?',
          answer: 'Sí, todos nuestros préstamos profesionales permiten pago anticipado. Las penalizaciones están limitadas por ley: máximo 6 meses de intereses o 3% del capital restante. Algunos contratos ofrecen pago anticipado gratuito después de un cierto período.',
        },
        {
          question: '¿Cuáles son las tasas actuales para préstamos profesionales?',
          answer: 'Nuestras tasas TAE varían según el proyecto: Bienes raíces comerciales 2.9-5.5% (5-25 años), Equipos 3.9-7.5% (2-5 años), Fondo de comercio 4.7% (5-10 años), Flujo de caja 4.0-9.0% (3-36 meses), Vehículos profesionales 3.2-6.5% (2-6 años). Tasas personalizadas según su perfil y duración.',
        },
        {
          question: '¿Cómo funciona el proceso de solicitud en línea?',
          answer: '1) Complete nuestro formulario en línea (5 min) y cargue sus documentos. 2) Análisis de su solicitud por nuestros expertos (24-48h). 3) Reciba su aprobación en principio con condiciones. 4) Firma electrónica del contrato. 5) Configuración de garantías. 6) Desembolso de fondos en su cuenta Altus.',
        },
        {
          question: '¿Puedo combinar múltiples tipos de financiamiento?',
          answer: 'Sí, puede combinar varias soluciones: préstamo bancario + leasing para equipos, préstamo profesional + préstamo de honor (BPI France) para fortalecer el capital, o línea de crédito + préstamo amortizable para combinar flexibilidad y financiamiento a largo plazo.',
        },
        {
          question: '¿Hay tarifas de solicitud y otros cargos?',
          answer: 'Tarifas de solicitud: 1-2% del monto para préstamos profesionales (negociables). Tarifas de garantía: variables según el tipo (hipoteca, prenda). Seguro del prestatario: 0.10% a 0.40% del capital prestado por año. Todas las tarifas se detallan en su oferta de préstamo.',
        },
        {
          question: '¿Qué sucede si tengo dificultades de reembolso?',
          answer: 'Contáctenos ante los primeros signos de dificultad. Podemos explorar: aplazamiento temporal de pagos, modulación de pagos, extensión del plazo del préstamo, o reorganización de crédito. El apoyo preventivo siempre es preferible.',
        },
      ],
      notFoundTitle: '¿No encuentra la respuesta a su pregunta?',
      notFoundDesc: 'Nuestro equipo de expertos está disponible de lunes a viernes de 9am a 7pm',
      contactUs: 'Contáctenos',
      helpCenter: 'Centro de ayuda',
    },
    admin: {
      common: {
        status: {
          pending: 'Pendiente',
          active: 'Activo',
          approved: 'Aprobado',
          rejected: 'Rechazado',
          suspended: 'Suspendido',
          completed: 'Completado',
          signed: 'Firmado',
          inProgress: 'En progreso',
        },
        actions: {
          approve: 'Aprobar',
          reject: 'Rechazar',
          delete: 'Eliminar',
          suspend: 'Suspender',
          save: 'Guardar',
          download: 'Descargar',
          upload: 'Subir',
          send: 'Enviar',
          edit: 'Editar',
          cancel: 'Cancelar',
          disburse: 'Desembolsar',
        },
        labels: {
          user: 'Usuario',
          userName: 'Nombre de usuario',
          userEmail: 'Email del usuario',
          amount: 'Monto',
          type: 'Tipo',
          rate: 'Tasa',
          duration: 'Duración',
          status: 'Estado',
          date: 'Fecha',
          createdAt: 'Creado',
          actions: 'Acciones',
          fees: 'Comisiones',
          progress: 'Progreso',
          codes: 'Códigos',
          recipient: 'Destinatario',
          contract: 'Contrato',
          months: 'meses',
          total: 'Total',
          active: 'activos',
          pending: 'pendientes',
          recent: 'Recientes',
          all: 'Todos',
          noData: 'Sin datos',
          loading: 'Cargando...',
          error: 'Error',
          success: 'Éxito',
          balance: 'Saldo',
          loans: 'Préstamos',
        },
        messages: {
          error: 'Error',
          success: 'Éxito',
          updated: 'Actualizado',
          approved: 'Aprobado',
          rejected: 'Rechazado',
          deleted: 'Eliminado',
          disbursed: 'Desembolsado',
          cannotApprove: 'No se puede aprobar',
          cannotReject: 'No se puede rechazar',
          cannotDelete: 'No se puede eliminar',
          cannotUpdate: 'No se puede actualizar',
          loadError: 'Error de carga',
        },
        empty: {
          noResults: 'Sin resultados',
          noData: 'No hay datos disponibles',
        },
      },
      dashboard: {
        title: 'Consola de Administración',
        description: 'Vista general de la plataforma y gestión de usuarios',
        totalUsers: 'Total de Usuarios',
        activeUsers: 'activos',
        pendingUsers: 'pendientes',
        transfers: 'Transferencias',
        transfersPending: 'en curso',
        loans: 'Préstamos',
        loansActive: 'activos',
        totalVolume: 'Volumen Total',
        volumeDescription: 'Transferencias totales',
        recentUsers: 'Usuarios Recientes',
        recentUsersDescription: 'Últimas inscripciones',
        recentTransfers: 'Transferencias Recientes',
        recentTransfersDescription: 'Últimas operaciones',
      },
      loans: {
        title: 'Gestión de Préstamos',
        description: 'Gestionar todas las solicitudes de préstamos de la plataforma',
        allLoans: 'Todos los Préstamos',
        allLoansDescription: 'Lista completa de solicitudes de préstamos',
        loanApproved: 'Préstamo aprobado',
        loanApprovedDesc: 'El préstamo ha sido aprobado exitosamente. Se ha generado el contrato.',
        loanRejected: 'Préstamo rechazado',
        loanRejectedDesc: 'El préstamo ha sido rechazado exitosamente',
        loanDeleted: 'Préstamo eliminado',
        loanDeletedDesc: 'El préstamo ha sido eliminado exitosamente',
        fundsDisbursed: 'Fondos desembolsados',
        fundsDisbursedDesc: 'Los fondos han sido desembolsados exitosamente. El usuario ha sido notificado.',
        contractGenerated: '📄 Generado',
        contractSigned: '✅ Firmado',
        approveReason: 'Razón de aprobación',
        rejectReason: 'Razón de rechazo',
        deleteReason: 'Razón de eliminación',

        approveDialogDesc: 'Esta acción aprobará el préstamo de {amount} para {userName} y generará el contrato.',
        rejectDialogTitle: 'Rechazar préstamo',
        rejectDialogDesc: 'Esta acción rechazará definitivamente el préstamo. El usuario será notificado.',
        disburseDialogTitle: 'Desembolsar fondos',
        disburseDialogDesc: 'Esta acción desembolsará {amount} a {userName}. El préstamo pasará a estado activo y el usuario podrá realizar transferencias.',
        deleteDialogTitle: 'Eliminar préstamo',
        deleteDialogDesc: 'Esta acción eliminará el préstamo de manera definitiva.',
      },
      transfers: {
        title: 'Gestión de Transferencias',
        description: 'Aprobar o suspender solicitudes de transferencia',
        allTransfers: 'Todas las Transferencias',
        allTransfersDescription: 'Lista completa de transferencias de fondos',
        transferUpdated: 'Transferencia actualizada',
        transferUpdatedDesc: 'El estado de la transferencia se ha actualizado exitosamente',
        approveDialogTitle: 'Aprobar transferencia',
        approveDialogDesc: 'Esta acción aprobará la transferencia y actualizará su estado a "en curso".',
        suspendDialogTitle: 'Suspender transferencia',
        suspendDialogDesc: 'Esta acción suspenderá la transferencia. Podrá reactivarse más tarde.',
      },
    },
    expertise: {
      title: 'Nuestras Áreas de Expertise',
      subtitle: 'Soluciones financieras personalizadas para todos sus proyectos',
      realEstate: 'Crédito Inmobiliario',
      realEstateDesc: 'Financiamiento de su residencia principal o secundaria con tasas ventajosas y apoyo personalizado.',
      personal: 'Préstamo Personal',
      personalDesc: 'Soluciones flexibles para sus proyectos personales: viaje, reformas, eventos o consolidación de deudas.',
      professional: 'Crédito Profesional',
      professionalDesc: 'Apoyo dedicado para el desarrollo de su actividad profesional y la adquisición de equipos.',
      consolidation: 'Compra de Crédito',
      consolidationDesc: 'Agrupe sus créditos actuales para simplificar la gestión y reducir sus cuotas mensuales.',
      business: 'Financiamiento Empresarial',
      businessDesc: 'Soluciones de financiamiento adaptadas a las necesidades de su empresa para apoyar su crecimiento.',
      investment: 'Inversión de Alquiler',
      investmentDesc: 'Financie sus proyectos de inversión inmobiliaria de alquiler con condiciones óptimas.',
    },
    howItWorksSection: {
      title: '¿Cómo funciona?',
      subtitle: 'Un proceso simple y rápido en 4 pasos',
      step1Title: 'Registro',
      step1Desc: 'Cree su cuenta en pocos minutos y complete su perfil de forma segura.',
      step2Title: 'Análisis',
      step2Desc: 'Nuestro equipo de expertos analiza su solicitud y evalúa su capacidad de endeudamiento.',
      step3Title: 'Validación',
      step3Desc: 'Reciba su oferta personalizada y firme electrónicamente su contrato.',
      step4Title: 'Desembolso',
      step4Desc: 'Los fondos se transfieren a su cuenta en 7 a 15 días hábiles.',
      ctaText: '¿Listo para comenzar su proyecto?',
      ctaButton: 'Comenzar mi solicitud',
    },
    premiumTestimonials: {
      title: 'Confían en nosotros',
      subtitle: 'Descubra los testimonios de nuestros clientes satisfechos',
      testimonial1Name: 'María Dubois',
      testimonial1Role: 'Propietaria',
      testimonial1Content: '¡Servicio excepcional! Obtuve mi hipoteca en menos de 3 semanas. El equipo es profesional y atento.',
      testimonial2Name: 'Sofía Laurent',
      testimonial2Role: 'Emprendedora',
      testimonial2Content: 'Gracias a Altus Finance Group, pude financiar el desarrollo de mi empresa. Acompañamiento personalizado de principio a fin.',
      testimonial3Name: 'Pedro Richard',
      testimonial3Role: 'Inversor',
      testimonial3Content: 'Las tasas ofrecidas son muy competitivas y el proceso es 100% digital. Recomiendo ampliamente sus servicios.',
      testimonial4Name: 'Ana Martín',
      testimonial4Role: 'Comerciante',
      testimonial4Content: 'Un equipo receptivo y soluciones adaptadas a mis necesidades. La consolidación de crédito me ayudó a gestionar mejor mi presupuesto.',
    },
    bankingSecurity: {
      badge: 'Seguridad Bancaria',
      title: 'Su seguridad, nuestra prioridad',
      subtitle: 'Máxima protección de sus datos con los más altos estándares bancarios',
      aes256Title: 'Cifrado AES-256',
      aes256Desc: 'Todos sus datos están protegidos por cifrado de nivel militar, garantizando confidencialidad absoluta.',
      mfaTitle: 'Autenticación MFA',
      mfaDesc: 'Autenticación de dos factores obligatoria para asegurar el acceso a su cuenta y transacciones.',
      kycTitle: 'Proceso KYC/AML',
      kycDesc: 'Verificación de identidad rigurosa conforme a las normas europeas anti lavado de dinero.',
      euHostingTitle: 'Alojamiento UE',
      euHostingDesc: 'Servidores seguros ubicados en la Unión Europea para un cumplimiento total del RGPD.',
      monitoringTitle: 'Monitoreo 24/7',
      monitoringDesc: 'Monitoreo continuo de actividades sospechosas por nuestros sistemas de detección avanzados.',
      gdprTitle: 'Cumplimiento RGPD',
      gdprDesc: 'Estricto cumplimiento de la normativa europea sobre protección de datos personales.',
      certified: 'Certificado ISO 27001',
      compliance: 'Cumplimiento RGPD',
      audited: 'Auditorías regulares',
    },
    finalCTA: {
      badge: 'Comience ahora',
      title: '¿Listo para realizar sus proyectos?',
      subtitle: 'Únase a miles de clientes que confían en nosotros para financiar sus proyectos',
      benefit1: 'Respuesta en 24 a 48 horas',
      benefit2: 'Proceso 100% digital y seguro',
      benefit3: 'Acompañamiento personalizado',
      benefit4: 'Tasas competitivas garantizadas',
      primaryButton: 'Abrir mi expediente',
      secondaryButton: 'Hablar con un asesor',
      trustText: '✓ Sin compromiso • Respuesta en 24h • 100% seguro',
      stat1Value: '15.000+',
      stat1Label: 'Clientes satisfechos',
      stat2Value: '98%',
      stat2Label: 'Tasa de aprobación',
      stat3Value: '24h',
      stat3Label: 'Tiempo de respuesta',
      stat4Value: '€500M+',
      stat4Label: 'Fondos distribuidos',
    },
  },
  pt: {
    hero: {
      title: 'Realize seus Projetos com Altus Finance Group',
      subtitle: 'Soluções de financiamento para particulares e empresas - Taxas competitivas e processo transparente',
      cta1: 'Solicitar financiamento',
      cta2: 'Minha Conta',
      learnMore: 'Saiba Mais',
      trustIndicator: 'Mais de 15.000 clientes satisfeitos confiam em nós',
      trustBadges: {
        response24h: 'Resposta em 24h',
        swissSecurity: 'Segurança bancária suíça',
        fastApproval: 'Aprovação rápida',
      },
      calculator: {
        title: 'Calcule seu Orçamento',
        subtitle: 'Obtenha uma estimativa instantânea',
        loanAmount: 'Valor do Empréstimo',
        duration: 'Duração (meses)',
        monthlyPayment: 'Pagamento Mensal',
        perMonth: 'por mês',
        applyNow: 'Solicitar Agora',
        disclaimer: 'Solicitação gratuita - Sem compromisso - Processo confidencial',
      },
      slides: [
        {
          title: 'Altus Finance Group',
          subtitle: 'Soluções de financiamento profissionais e seguras para acompanhar o seu crescimento.',
        },
        {
          title: 'Expertise Financeira de Excelência',
          subtitle: 'Soluções sob medida adaptadas às suas ambições empresariais e patrimoniais.',
        },
        {
          title: 'Seu Parceiro de Confiança',
          subtitle: 'Acompanhamento personalizado e discrição absoluta para todos os seus projetos de financiamento.',
        },
        {
          title: 'Soluções Financeiras Personalizadas',
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
          title: 'Expertise e Acompanhamento',
          subtitle: 'Uma equipe dedicada para orientá-lo em cada etapa do seu projeto',
        },
      ],
    },
    nav: {
      home: 'Início',
      products: 'Nossos Empréstimos',
      tagline: 'Soluções Financeiras Premium',
      more: 'Mais',
      moreInfo: 'Mais informações',
      language: 'Idioma',
      loansMenu: {
        label: 'Nossos Empréstimos',
        items: [
          {
            title: 'Crédito Pessoal',
            description: 'Financie seus projetos pessoais com taxas competitivas',
            href: '/loans/personal-credit',
          },
          {
            title: 'Refinanciamento de Empréstimos',
            description: 'Consolide seus empréstimos para simplificar os reembolsos',
            href: '/loans/loan-refinancing',
          },
          {
            title: 'Refinanciamento de Leasing',
            description: 'Otimize seus custos refinanciando seu leasing',
            href: '/loans/lease-refinancing',
          },
          {
            title: 'Refinanciamento de Cartão de Crédito',
            description: 'Reduza as taxas de juros dos seus cartões de crédito',
            href: '/loans/credit-card-refinancing',
          },
          {
            title: 'Créditos Diversos',
            description: 'Soluções de financiamento adaptadas a todas as suas necessidades',
            href: '/products',
          },
          {
            title: 'Empréstimos PME',
            description: 'Financiamento empresarial para crescer sua empresa',
            href: '/products',
          },
        ],
      },
      howItWorks: 'Como Funciona',
      resources: 'Recursos',
      faq: 'FAQ',
      about: 'Sobre',
      contact: 'Contato',
      phone: '+352 40 63 48',
      dashboard: 'Painel',
      loans: 'Empréstimos',
      myLoans: 'Meus Empréstimos',
      newLoan: 'Pedido de Empréstimo',
      contracts: 'Contratos',
      loansSection: 'Empréstimos',
      transfers: 'Transferências',
      history: 'Histórico',
      settings: 'Configurações',
      logout: 'Sair',
      users: 'Usuários',
      documents: 'Documentos KYC',
      reports: 'Relatórios',
    },
    contracts: {
      title: 'Gestão de Contratos',
      description: 'Baixe, assine e devolva seus contratos de empréstimo com segurança.',
      loanNumber: 'Empréstimo',
      approvedOn: 'Aprovado em',
      actionRequired: 'Ação necessária',
      step1: '1. Baixar o contrato',
      step1Description: 'Baixe e leia atentamente seu contrato de empréstimo.',
      step2: '2. Assinar e devolver',
      step2Description: 'Assine o contrato e devolva-o em formato PDF.',
      downloadContract: 'Baixar contrato',
      tabPending: 'Para assinar',
      tabReview: 'Em verificação',
      tabCompleted: 'Concluídos',
      inReview: 'Em verificação',
      signed: 'Assinado',
      noPendingContracts: 'Nenhum contrato pendente',
      noPendingContractsDescription: 'Todos os seus contratos foram assinados e enviados.',
      noReviewContracts: 'Nenhum contrato em verificação',
      noReviewContractsDescription: 'Atualmente não há contratos pendentes de verificação.',
      noCompletedContracts: 'Nenhum contrato assinado',
      noCompletedContractsDescription: 'Seus contratos assinados aparecerão aqui.',
      reviewMessage: 'Seu contrato assinado foi recebido e está sendo verificado por nossa equipe. Você será notificado assim que os fundos forem liberados.',
      signedSuccess: 'Contrato assinado e validado com sucesso',
      downloadOriginal: 'Baixar contrato original',
    },
    dashboard: {
      welcome: 'Bem-vindo',
      welcomeUser: 'Bem-vindo, {name}',
      currentBalance: 'Saldo Atual',
      activeLoans: 'Empréstimos Ativos',
      totalBorrowed: 'Total Emprestado',
      availableCredit: 'Crédito Disponível',
      lastUpdated: 'Última Atualização',
      borrowingCapacity: 'Capacidade de Empréstimo',
      canBorrowUpTo: 'Você pode pedir emprestado até',
      quickActions: 'Ações Rápidas',
      newLoan: 'Novo Empréstimo',
      transferFunds: 'Transferir Fundos',
      transactionHistory: 'Histórico de Transações',
      fees: 'Taxas',
      pendingTransfers: 'Transferências Pendentes',
      availableFunds: 'Fundos Disponíveis',
      upcomingRepayments: 'Próximos Reembolsos',
      yourGlobalBalance: 'Seu Saldo Global',
      noActiveLoans: 'Nenhum Empréstimo Ativo',
      noTransfers: 'Nenhuma Transferência Encontrada',
      dataLoadError: 'Erro ao carregar dados',
      available: 'disponível',
      notifications: 'Notificações',
      noNotifications: 'Sem notificações',
      viewDetails: 'Ver Detalhes',
      availableOffers: 'Ofertas disponíveis para você',
      contractToSign: 'Contrato para assinar',
      moreTransfers: 'transferência(s) adicional(is)',
      goodMorning: 'Bom dia',
      goodAfternoon: 'Boa tarde',
      goodEvening: 'Boa noite',
      totalBalance: 'Saldo total',
      newTransfer: 'Nova transferência',
      requestLoan: 'Solicitar um empréstimo',
      manageAccounts: 'Gerenciar contas',
      cashflow: 'Fluxo de caixa',
      incomeExpensesSixMonths: 'Receitas e despesas em 6 meses',
      income: 'Receitas',
      expenses: 'Despesas',
      creditUtilization: 'Utilização de crédito',
      used: 'utilizado',
      recentActivity: 'Atividade recente',
      latestTransactions: 'Últimas transações',
      viewAll: 'Ver tudo',
      noRecentTransactions: 'Sem transações recentes',
      pendingRequests: 'Solicitações pendentes',
      pendingRequestsDescription: 'Suas solicitações de empréstimo em processo',
      noPendingRequests: 'Nenhuma solicitação pendente',
      pendingLoan: 'Solicitação pendente',
      yourActiveLoans: 'Seus empréstimos ativos',
      yourActiveLoansDescription: 'Acompanhe seus reembolsos e vencimentos',
      activeLoan: 'Empréstimo ativo',
      repaid: 'Reembolsado',
      upcomingDueDates: 'Próximos vencimentos',
      amount: 'Quantia',
      monthJan: 'Jan',
      monthFeb: 'Fev',
      monthMar: 'Mar',
      monthApr: 'Abr',
      monthMay: 'Mai',
      monthJun: 'Jun',
      serverError: 'Não foi possível conectar ao servidor. Por favor, verifique sua conexão e tente novamente.',
      diagnosticInfo: 'Informações de diagnóstico (desenvolvimento)',
      retry: 'Tentar novamente',
      financeOverview: 'Aqui está uma visão geral de suas finanças',
      yourCreditLimit: 'Seu limite de crédito',
      maximum: 'Máximo',
      activeLoanSingular: 'empréstimo ativo',
      activeLoansPlural: 'empréstimos ativos',
      loanNumber: 'Empréstimo #',
      progression: 'Progresso',
      nextSixMonths: 'Próximos 6 meses',
      repayment: 'Reembolso',
      noUpcomingRepayments: 'Sem reembolsos próximos',
      pendingContracts: 'Contratos pendentes',
      contractsToSign: 'contrato(s) para assinar',
      generatedOn: 'Gerado em',
      view: 'Ver',
    },
    loan: {
      pageTitle: 'Meus Empréstimos',
      pageDescription: 'Gerencie seus empréstimos e simule seus reembolsos',
      tabMyLoans: 'Meus Empréstimos',
      tabCalculator: 'Calculadora',
      amount: 'Valor',
      interestRate: 'Taxa de Juros',
      nextPayment: 'Próximo Pagamento',
      viewAll: 'Ver Tudo',
      status: 'Status',
      downloadContract: 'Baixar Contrato',
      uploadSignedContract: 'Enviar Contrato Assinado',
      downloading: 'Baixando...',
      uploading: 'Enviando...',
      loanNumber: 'Empréstimo',
      requestSubmitted: 'Solicitação de empréstimo enviada',
      requestSubmittedDesc: 'Sua solicitação está pendente de aprovação por um administrador. Você receberá uma notificação assim que for processada.',
      requestError: 'Falha ao enviar a solicitação de empréstimo',
      loanApproved: '🎉 Seu empréstimo foi aprovado!',
      approvalInstructions: 'Para finalizar seu empréstimo, siga estas etapas:',
      approvalStep1: 'Baixe seu contrato de empréstimo (PDF)',
      approvalStep2: 'Leia-o cuidadosamente e assine-o',
      approvalStep3: 'Envie o contrato assinado (PDF) através do botão abaixo',
      downloadContractButton: '1. Baixar contrato',
      uploadContractButton: '2. Enviar contrato assinado',
      uploading2: 'Enviando...',
    },
    transfer: {
      pageTitle: 'Minhas Transferências',
      pageDescription: 'Gerencie e rastreie todas as suas transferências de fundos',
      searchPlaceholder: 'Buscar por destinatário ou ID...',
      allStatuses: 'Todos os status',
      filterTitle: 'Filtros e busca',
      filterDescription: 'Refine sua lista de transferências',
      noTransfersFound: 'Nenhuma transferência encontrada',
      noTransfersMessage: 'Você ainda não fez nenhuma transferência',
      createTransfer: 'Criar transferência',
      newTransfer: 'Nova transferência',
      requestSubmitted: 'Solicitação Enviada',
      documentVerification: 'Verificação de Documentos',
      complianceCheck: 'Verificação de Conformidade',
      approvalPending: 'Aprovação Pendente',
      transferComplete: 'Transferência Concluída',
      pending: 'Pendente',
      inProgress: 'Em Andamento',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      completed: 'Concluído',
      suspended: 'Suspenso',
      noAccount: 'Nenhuma conta registrada',
      validation: 'Validação',
      validating: 'Validando...',
      onHold: 'Transferência em pausa',
      processing: 'Transferência em andamento',
      processingComplete: 'Transferência concluída',
    },
    history: {
      pageTitle: 'Histórico de Transações',
      pageDescription: 'Consulte o histórico completo de todas as suas transações',
      totalCredits: 'Total créditos',
      totalDebits: 'Total débitos',
      totalTransactions: 'Total transações',
      filterTitle: 'Filtros e busca',
      filterDescription: 'Refine seu histórico de transações',
      searchPlaceholder: 'Buscar por descrição ou ID...',
      allTypes: 'Todos os tipos',
      typeCredit: 'Crédito',
      typeDebit: 'Débito',
      typeFee: 'Taxa',
      noTransactionsFound: 'Nenhuma transação encontrada',
      filterType: 'Tipo',
      noTransactionsFoundFiltered: 'Tente modificar seus critérios de pesquisa',
      noTransactionsYet: 'Você ainda não tem transações',
    },
    fee: {
      type: 'Tipo de Taxa',
      reason: 'Motivo',
      amount: 'Valor',
      date: 'Data',
      downloadStatement: 'Baixar Extrato',
      loanFees: 'Taxas de Empréstimo',
      transferFees: 'Taxas de Transferência',
      accountFees: 'Taxas da Conta',
      feesToPay: 'Taxas a Pagar',
      unpaidFeesCount: 'taxas não pagas',
      unpaidFeesSingular: 'taxa não paga',
      pendingValidation: 'Pendente de validação',
      autoValidatedViaCode: 'Auto-validado via código',
      totalUnpaid: 'Total Não Pago',
      totalOverall: 'Total Geral',
    },
    common: {
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      active: 'Ativo',
      pending: 'Pendente',
      completed: 'Concluído',
      suspended: 'Suspenso',
      saving: 'Salvando...',
      cancel: 'Cancelar',
      save: 'Salvar',
      close: 'Fechar',
      noData: 'Sem dados disponíveis',
      months: 'meses',
      years: 'anos',
    },
    about: {
      title: 'Sobre Altus Finance Group',
      subtitle: 'Seu parceiro de confiança para financiar particulares e empresas',
      mission: 'Nossa Missão',
      missionText: 'Na Altus Finance Group, democratizamos o acesso ao financiamento para todos. Seja você um particular com um projeto pessoal ou uma empresa em desenvolvimento, oferecemos soluções de crédito modernas, transparentes e adaptadas às suas necessidades. Nossa tecnologia de ponta nos permite analisar rapidamente sua situação e oferecer ofertas personalizadas com taxas competitivas. Acreditamos na transparência total: sem taxas ocultas, condições claras e suporte em cada etapa.',
      stats: {
        clients: 'Clientes ativos',
        loansProvided: 'Empréstimos concedidos',
        successRate: 'Taxa de satisfação',
        yearsExperience: 'Anos de experiência',
      },
    },
    howItWorks: {
      ...howItWorksEN,
      title: 'Como Funciona',
      subtitle: 'Um processo 100% digital ultra-rápido em 4 etapas simples',
      step1Title: 'Registro - 3 Minutos',
      step1Desc: 'Crie sua conta Altus Finance Group em apenas minutos. Insira suas informações pessoais ou empresariais de forma segura. A verificação de identidade instantânea (KYC) garante a segurança da sua conta.',
      step1Duration: '3 min',
      step2Title: 'Login - Acesse seu painel',
      step2Desc: 'Faça login no seu painel de cliente pessoal seguro. Você encontrará todas as ferramentas necessárias para gerenciar suas finanças e enviar solicitações de empréstimo. Acesso 24/7 de qualquer dispositivo.',
      step2Duration: 'Instante',
      step3Title: 'Solicitação e análise - Resposta instantânea',
      step3Desc: 'Envie sua solicitação de empréstimo diretamente do seu painel de usuário. Preencha o formulário com o valor desejado e carregue seus documentos justificativos. Graças à nossa tecnologia de análise em tempo real, você recebe uma resposta em minutos até 24 horas no máximo.',
      step3Duration: '< 24h',
      step4Title: 'Liberação imediata - Fundos disponíveis instantaneamente',
      step4Desc: 'Assim que sua solicitação for aprovada, assine eletronicamente seu contrato do seu painel. Os fundos são liberados imediatamente em sua conta segura Altus Finance Group. Você pode então transferi-los para sua conta bancária pessoal ou empresarial instantaneamente e sem taxas adicionais.',
      step4Duration: 'Imediato',
      averageTimeValue: '24 horas no máximo desde a apresentação da solicitação até a liberação dos fundos',
    },
    products: {
      title: 'Nossas Soluções de Empréstimos',
      subtitle: 'Produtos adaptados às suas necessidades - Particulares e Empresas',
      businessTitle: 'Empréstimos Empresariais',
      businessSubtitle: 'Produtos adaptados às suas necessidades empresariais',
      termLoans: 'Empréstimos a Prazo Profissionais',
      termLoansDesc: 'Financiamento a médio e longo prazo para seus investimentos estratégicos: desenvolvimento, aquisição, expansão. De €10.000 a €500.000 de 1 a 7 anos. Taxas fixas de 3,5% a 8,5% TAE segundo perfil. Reembolso antecipado sem penalidade.',
      lineOfCredit: 'Linha de Crédito Rotativo',
      lineOfCreditDesc: 'Crédito flexível para gerenciar seu fluxo de caixa e lidar com despesas imprevistas. De €5.000 a €100.000. Taxas de 4,0% a 9,0% TAE. Pague juros apenas sobre valores utilizados. Reconstituição automática do capital disponível.',
      equipmentFinancing: 'Financiamento de Equipamentos',
      equipmentFinancingDesc: 'Financie seus equipamentos profissionais, veículos utilitários, máquinas, ferramentas. De €20.000 a €300.000 de 2 a 5 anos. Taxas de 3,9% a 7,5% TAE. O equipamento pode servir como garantia, facilitando a aprovação do empréstimo.',
      invoiceFactoring: 'Factoring / Cessão de Créditos',
      invoiceFactoringDesc: 'Transforme suas faturas de clientes em dinheiro imediato para melhorar seu fluxo de caixa. Antecipação de até 90% do valor das faturas em 24-48h. Taxas de 1% a 3% dependendo do volume e prazo. Ideal para empresas B2B.',
    },
    contact: {
      title: 'Contate-nos',
      subtitle: 'Nossa equipe está aqui para ajudar',
      name: 'Nome completo',
      email: 'E-mail',
      phone: 'Telefone',
      message: 'Mensagem',
      send: 'Enviar',
      success: 'Mensagem enviada com sucesso',
      error: 'Erro ao enviar mensagem',
    },
    resources: {
      title: 'Recursos',
      subtitle: 'Todas as informações para apoiá-lo em seu projeto',
      faqTitle: 'Perguntas Frequentes',
      faqs: [
        {
          question: 'Quais documentos são necessários para uma solicitação de empréstimo?',
          answer: 'Para particulares: documento de identidade, comprovante de residência, contracheques recentes (3 meses), declaração de imposto de renda. Para empresas: registro comercial (<3 meses), balanços e demonstrações de resultados (últimos 2 anos), extratos bancários comerciais (3-6 meses), documento do diretor. Todos os documentos podem ser enviados diretamente online de forma segura.',
        },
        {
          question: 'Quanto tempo leva o processo de aprovação?',
          answer: 'Graças à nossa tecnologia de análise em tempo real, você recebe uma resposta de aprovação em minutos a 24 horas no máximo. Uma vez aprovado, os fundos são imediatamente liberados em sua conta segura Altus Finance Group. Você pode então transferi-los para sua conta bancária pessoal ou empresarial quando quiser, instantaneamente e sem custo adicional.',
        },
        {
          question: 'Qual é o valor mínimo e máximo que posso pedir emprestado?',
          answer: 'Empréstimos pessoais: €1.000 a €75.000. Empréstimos hipotecários: €50.000 a €500.000. Empréstimos a prazo empresariais: €10.000 a €500.000. Linhas de crédito: €5.000 a €100.000. O valor exato depende da sua capacidade de pagamento calculada com base em renda, despesas e histórico de crédito.',
        },
        {
          question: 'Posso pagar meu empréstimo antecipadamente?',
          answer: 'Sim, todos os nossos empréstimos permitem o reembolso antecipado sem penalidade ou taxas ocultas. Você pode reembolsar parcial ou totalmente seu crédito a qualquer momento da sua área de cliente. Isso reduz automaticamente o custo total dos juros. Você mantém controle total do seu crédito.',
        },
        {
          question: 'Quais são os critérios de elegibilidade para um empréstimo?',
          answer: 'Particulares: ser maior de idade, residir na França, ter renda regular e taxa de endividamento <40%. Empresas: ativas por 6+ meses, receita mensal mínima de €15.000, sem inadimplências recentes. A pontuação de crédito é verificada automaticamente via bureaus de crédito (Experian, Equifax). Os casos são analisados individualmente.',
        },
        {
          question: 'Como são calculadas as taxas de juros?',
          answer: 'Nossas taxas são calculadas por um algoritmo que analisa vários fatores: sua pontuação de crédito, duração do empréstimo, valor emprestado, renda e despesas, histórico de pagamento e saúde financeira (para empresas). As taxas variam de 0,5% a 9,0% TAE dependendo do perfil e tipo de empréstimo. Nossas taxas estão entre as mais competitivas do mercado graças à nossa rede de parceiros financeiros.',
        },
        {
          question: 'Existem taxas de solicitação ou taxas ocultas?',
          answer: 'Transparência total: exibimos todas as taxas desde a simulação. Taxas de solicitação: €0 a €150 dependendo do tipo de empréstimo. Sem taxas de reembolso antecipado. Sem taxas mensais de gestão. A TAE (Taxa Anual Efetiva) inclui todos os custos para fácil comparação com outras ofertas.',
        },
        {
          question: 'Como calcular minha capacidade de empréstimo?',
          answer: 'Sua capacidade de empréstimo depende da sua taxa de endividamento que não deve exceder 40% da sua renda líquida. Fórmula: (Renda mensal × 0,40) - Encargos de crédito existentes = Pagamento mensal máximo disponível. Nosso simulador online calcula automaticamente sua capacidade de empréstimo e sugere valores apropriados. Você pode ajustar a duração para modular os pagamentos.',
        },
        {
          question: 'Posso obter um empréstimo com baixa pontuação de crédito?',
          answer: 'Sim, aceitamos vários perfis. Nossa tecnologia de avaliação também analisa dados alternativos além da simples pontuação de crédito: estabilidade profissional, renda recorrente, poupança, histórico bancário. Pontuações aceitas a partir de 500-560 para certos produtos. Mesmo com histórico imperfeito, você pode obter um empréstimo, mas as taxas serão ajustadas ao risco.',
        },
        {
          question: 'O que acontece se eu não puder pagar uma parcela mensal?',
          answer: 'Entre em contato conosco imediatamente. Oferecemos várias soluções: adiamento de parcela (carência temporária), modulação de parcelas para baixo, reescalonamento do empréstimo. Penalidades por atraso podem ser aplicadas, mas sempre priorizamos o diálogo para encontrar uma solução adaptada à sua situação. Acompanhamento personalizado disponível em caso de dificuldades.',
        },
      ],
    },
    legal: {
      termsTitle: 'Termos de Serviço',
      privacyTitle: 'Política de Privacidade',
      lastUpdated: 'Última atualização: Janeiro 2025',
      terms: {
        section1Title: '1. Aceitação dos Termos',
        section1Content: 'Ao acessar e usar os serviços da Altus Finance Group, você aceita e concorda em ficar vinculado aos termos e disposições deste acordo.',
        section2Title: '2. Licença de Uso',
        section2Content: 'É concedida permissão para acessar temporariamente os materiais (informações ou software) na plataforma da Altus Finance Group apenas para visualização pessoal e não comercial.',
        section3Title: '3. Contrato de Empréstimo',
        section3Content: 'Todos os empréstimos estão sujeitos à aprovação de crédito. Os termos e condições serão fornecidos em um contrato de empréstimo separado na aprovação da sua solicitação.',
        section4Title: '4. Declarações e Garantias',
        section4Content: 'Você declara e garante que todas as informações fornecidas em sua solicitação de empréstimo são precisas, completas e atuais.',
        section5Title: '5. Limitação de Responsabilidade',
        section5Content: 'Em nenhuma circunstância a Altus Finance Group ou seus fornecedores serão responsáveis por quaisquer danos decorrentes do uso ou incapacidade de usar os materiais na plataforma da Altus Finance Group.',
        section6Title: '6. Modificações',
        section6Content: 'A Altus Finance Group pode revisar estes termos de serviço a qualquer momento sem aviso prévio. Ao usar esta plataforma, você concorda em ficar vinculado à versão atual destes termos.',
      },
      privacy: {
        section1Title: '1. Informações que Coletamos',
        section1Content: 'Coletamos informações que você nos fornece diretamente quando cria uma conta, solicita um empréstimo ou se comunica conosco. Isso pode incluir seu nome, endereço de e-mail, número de telefone, informações comerciais e dados financeiros.',
        section2Title: '2. Como Usamos suas Informações',
        section2Content: 'Usamos as informações que coletamos para:',
        section2List: [
          'Processar suas solicitações de empréstimo',
          'Comunicar com você sobre nossos serviços',
          'Melhorar nossa plataforma e serviços',
          'Cumprir requisitos legais e regulamentares',
        ],
        section3Title: '3. Compartilhamento de Informações',
        section3Content: 'Não vendemos suas informações pessoais. Podemos compartilhar suas informações com:',
        section3List: [
          'Bureaus de crédito para avaliação de crédito',
          'Provedores de serviços que auxiliam em nossas operações',
          'Reguladores e autoridades quando exigido por lei',
        ],
        section4Title: '4. Segurança de Dados',
        section4Content: 'Implementamos medidas técnicas e organizacionais apropriadas para proteger suas informações pessoais contra acesso, alteração, divulgação ou destruição não autorizados.',
        section5Title: '5. Seus Direitos',
        section5Content: 'Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Você também pode se opor a certo processamento de seus dados.',
        section6Title: '6. Cookies',
        section6Content: 'Usamos cookies e tecnologias de rastreamento semelhantes para melhorar sua experiência em nossa plataforma. Você pode controlar cookies através das configurações do seu navegador.',
        section7Title: '7. Contate-nos',
        section7Content: 'Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco em privacy@altus-group.com',
      },
    },
    individualLoans: {
      title: 'Empréstimos Pessoais',
      subtitle: 'Soluções de financiamento adaptadas a todos os seus projetos de vida',
      personalLoan: 'Empréstimo Pessoal',
      personalLoanDesc: 'Financiamento flexível para todos os seus projetos sem comprovante de uso: viagem, casamento, compra de equipamentos. De €1.000 a €75.000 de 12 a 84 meses. Taxas TAE de 2,9% a 7,9% dependendo do perfil. Resposta em 48h, fundos em 5 dias.',
      mortgageLoan: 'Empréstimo Hipotecário',
      mortgageLoanDesc: 'Financie sua residência principal, secundária ou investimento para aluguel. De €50.000 a €500.000 de 10 a 25 anos. Taxas fixas ou variáveis a partir de 1,5% TAE. Até 110% de contribuição incluindo taxas de cartório. Simulação personalizada gratuita.',
      autoLoan: 'Crédito Auto / Moto',
      autoLoanDesc: 'Financie seu veículo novo ou usado, carro ou moto. De €3.000 a €75.000 de 12 a 84 meses. Taxas TAE de 1,9% a 5,9%. Possibilidade de incluir seguro e acessórios. Resposta instantânea na concessionária parceira.',
      studentLoan: 'Empréstimo Estudantil',
      studentLoanDesc: 'Financie seus estudos superiores, mensalidades, moradia estudantil. De €1.000 a €50.000. Diferimento total de pagamento até o fim dos estudos. Taxas preferenciais a partir de 1,5% TAE. Sem garantia dos pais sob condições.',
      greenLoan: 'Empréstimo Verde / Eco-PTZ',
      greenLoanDesc: 'Financie obras de reforma energética: isolamento, bomba de calor, painéis solares. De €7.000 a €50.000. Taxas subsidiadas a partir de 0,5% TAE. Elegível para ajuda estatal MaPrimeRénov. Até €30.000 sem contribuição.',
      renovationLoan: 'Empréstimo para Reformas',
      renovationLoanDesc: 'Renove, amplie, embeleze sua casa. De €1.500 a €75.000 de 12 a 120 meses. Taxas TAE de 2,5% a 6,9%. Sem garantia hipotecária até €50.000. Liberação progressiva conforme progresso das obras possível.',
      miscellaneousCredit: 'Créditos Diversos',
      miscellaneousCreditDesc: 'Financie todos os seus projetos pessoais: eventos, equipamentos, lazer, saúde, bem-estar. De €500 a €50.000 de 6 a 96 meses. Taxas TAE de 2,9% a 8,9%. Procedimento simplificado, resposta rápida em 24h. Desembolso de fundos em 3 a 5 dias.',
      amount: 'Valor',
      rate: 'Taxa TAE',
      duration: 'Duração',
      rateDisclaimer: 'Taxas indicativas sujeitas a condições de elegibilidade. TAE fixa. Um crédito compromete você e deve ser reembolsado. Verifique sua capacidade de pagamento antes de se comprometer.',
      compareLoans: 'Comparar todos os empréstimos',
    },
    features: {
      title: 'Por Que Escolher Altus Finance Group?',
      subtitle: 'Uma plataforma de empréstimos moderna e transparente que coloca suas necessidades em primeiro lugar',
      security: 'Segurança Bancária de Nível Empresarial',
      securityDesc: 'Criptografia AES-256, conformidade GDPR, certificação SOC 2 Type II e ISO 27001. Seus dados financeiros são protegidos com os mesmos padrões dos grandes bancos. Autenticação multifator e monitoramento 24/7 contra fraude.',
      fast: 'Resposta Expressa - Minutos a 24h',
      fastDesc: 'Nossa tecnologia de IA analisa seu arquivo em tempo real. Resposta de aprovação em minutos a 24 horas no máximo. Fundos imediatamente liberados em sua conta segura Altus. Depois transfira para sua conta bancária quando quiser. 100% digital, zero papelada.',
      competitive: 'Entre as Taxas Mais Baixas do Mercado',
      competitiveDesc: 'Graças à nossa rede de 50+ parceiros financeiros e tecnologia de avaliação otimizada, negociamos as melhores taxas para você: de 0,5% a 9,0% TAE dependendo do perfil e tipo de empréstimo. Comparação automática para garantir a melhor oferta.',
      flexible: 'Flexibilidade Máxima Sem Penalidade',
      flexibleDesc: 'Reembolso antecipado gratuito a qualquer momento. Possível modulação de parcelas de acordo com sua situação. Adiamento de parcela em caso de dificuldades. Escolha da data de débito. Você mantém controle total do seu crédito.',
    },
    stats: {
      clients: 'Clientes Satisfeitos',
      funded: 'Empréstimos Concedidos',
      satisfaction: 'Taxa de Satisfação',
      years: 'Anos de Experiência',
    },
    partners: {
      title: 'Nossos Parceiros Financeiros',
      subtitle: 'Colaboramos com uma ampla rede de bancos e instituições financeiras de primeira linha para garantir as melhores condições',
      banksNetwork: 'Bancos Parceiros',
      loansFunded: 'Empréstimos Financiados',
      yearsExperience: 'Anos de Experiência',
      satisfactionRate: 'Taxa de Satisfação',
      networkTitle: 'Uma Rede de Parceiros de Confiança',
      benefits: [
        'Acesso a mais de 50 instituições financeiras para comparar as melhores ofertas',
        'Negociação de taxas preferenciais graças ao nosso volume de negócios',
        'Experiência reconhecida em intermediação de crédito há mais de 25 anos'
      ]
    },
    testimonials: {
      title: 'O que Dizem Nossos Clientes',
      subtitle: 'Mais de 15.000 particulares e profissionais confiam em nós',
      reviews: [
        { name: 'Paulo Silva', role: 'Empresário', company: 'Restaurante Sabor', text: 'A Altus Finance Group me permitiu obter financiamento rápido para desenvolver meu negócio. O processo foi simples e transparente, recebi os fundos em menos de uma semana.', rating: 5 },
        { name: 'Ana Santos', role: 'Particular', company: 'Proprietária', text: 'Excelente serviço para meu empréstimo imobiliário. Os consultores são atenciosos e encontraram a melhor taxa para mim. Recomendo muito seus serviços.', rating: 5 },
        { name: 'Carlos Oliveira', role: 'Diretor Financeiro', company: 'Tech Solutions Lda', text: 'Graças à Altus Finance Group pudemos financiar a compra de novos equipamentos. A flexibilidade de pagamento e a taxa competitiva fizeram a diferença.', rating: 5 },
        { name: 'Maria Costa', role: 'Artesã', company: 'Padaria Tradicional', text: 'Um serviço profissional e eficiente. Obtive meu empréstimo para obras sem complicações. A equipe me acompanhou em cada etapa.', rating: 5 },
        { name: 'João Ferreira', role: 'Comerciante', company: 'Moda & Acessórios', text: 'Estou muito satisfeito com o financiamento obtido para a expansão da minha loja. A Altus Finance Group realmente entende as necessidades dos empreendedores.', rating: 5 },
        { name: 'Pedro Rodrigues', role: 'Particular', company: 'Pai de família', text: 'Meu crédito auto foi aprovado rapidamente com uma excelente taxa. O simulador online me permitiu comparar facilmente as ofertas.', rating: 5 },
        { name: 'Catarina Alves', role: 'Enfermeira', company: 'Hospital São João', text: 'Pude financiar minhas obras de renovação energética graças ao empréstimo verde. As taxas bonificadas e os conselhos sobre ajudas estatais me ajudaram muito.', rating: 5 },
        { name: 'Ricardo Martins', role: 'Gerente', company: 'Restaurante O Gourmet', text: 'A linha de crédito renovável salvou meu fluxo de caixa durante o período difícil. Flexibilidade máxima e pagamento antecipado sem taxas.', rating: 5 },
        { name: 'Sofia Pereira', role: 'Arquiteta', company: 'Pereira & Associados', text: 'Processo 100% digital e rápido. Obtive meu empréstimo profissional em 3 dias. A interface é intuitiva e clara.', rating: 5 },
        { name: 'Miguel Fernandes', role: 'Estudante', company: 'Escola de Negócios', text: 'O empréstimo estudantil com pagamento diferido me permitiu financiar meus estudos sem estresse. Taxas preferenciais e sem garantia parental.', rating: 5 },
        { name: 'Teresa Carvalho', role: 'Farmacêutica', company: 'Farmácia Central', text: 'Financiamento de equipamento médico aprovado em 48h. O atendimento ao cliente é reativo e profissional. Muito satisfeita com o acompanhamento.', rating: 5 },
        { name: 'Bruno Sousa', role: 'Desenvolvedor', company: 'Startup Tech', text: 'Empréstimo pessoal para meu projeto de formação profissional. Sem comprovante de uso exigido, processo transparente e rápido.', rating: 5 },
        { name: 'Luísa Gomes', role: 'Professora', company: 'Colégio Camões', text: 'Meu empréstimo imobiliário foi aprovado com uma taxa muito competitiva. A simulação online me ajudou a comparar e escolher a melhor oferta.', rating: 5 },
        { name: 'Tiago Ribeiro', role: 'Empreendedor', company: 'Startup Inovadora', text: 'O financiamento de equipamento me permitiu comprar as máquinas necessárias para lançar minha produção. Pagamento adaptado ao meu fluxo de caixa.', rating: 5 },
        { name: 'Daniela Lopes', role: 'Advogada', company: 'Escritório Lopes', text: 'Processo de aprovação ultra-rápido graças à tecnologia de IA. Recebi uma resposta de princípio em menos de 24 horas. Impressionante!', rating: 5 },
        { name: 'André Dias', role: 'Canalizador', company: 'Dias Canalizações', text: 'Empréstimo para obras para renovar meu local profissional. Desembolso progressivo conforme andamento, é exatamente o que eu precisava.', rating: 5 },
        { name: 'Inês Pinto', role: 'Designer', company: 'Estúdio Criativo', text: 'A linha de crédito me deu a flexibilidade necessária para gerir as variações de tesouraria da minha atividade. Só pago pelo que uso.', rating: 5 },
        { name: 'Rui Mendes', role: 'Médico', company: 'Consultório Médico', text: 'Financiamento da minha instalação em consultório privado. Montante importante aprovado rapidamente com uma taxa fixa vantajosa. Muito profissional.', rating: 5 },
        { name: 'Marta Nunes', role: 'Florista', company: 'Flores & Natureza', text: 'Empréstimo profissional para desenvolver minha loja online. O processo foi simples e a equipe me acompanhou em cada etapa. Obrigada!', rating: 5 },
        { name: 'Gonçalo Correia', role: 'Engenheiro', company: 'Consultor Independente', text: 'Crédito auto para meu veículo profissional. Resposta imediata e fundos transferidos em 3 dias. Serviço impecável e taxa competitiva.', rating: 5 },
        { name: 'Vera Monteiro', role: 'Esteticista', company: 'Instituto Beleza', text: 'Financiamento para a compra de novos equipamentos estéticos. Sem taxas ocultas, tudo é transparente desde o início. Recomendo muito.', rating: 5 },
        { name: 'Nuno Reis', role: 'Chef', company: 'Bistrô Moderno', text: 'Factoring para melhorar meu fluxo de caixa. Transformação das minhas faturas em liquidez em 24h. Solução perfeita para minha atividade B2B.', rating: 5 },
      ],
    },
    auth: {
      title: 'ALTUS',
      subtitle: 'Seu parceiro de confiança para financiamento',
      loginTab: 'Entrar',
      signupTab: 'Cadastrar',
      email: 'E-mail',
      password: 'Senha',
      confirmPassword: 'Confirmar senha',
      fullName: 'Nome completo',
      phone: 'Telefone',
      companyName: 'Nome da empresa',
      siret: 'SIRET',
      accountType: 'Tipo de conta',
      personal: 'Pessoal',
      personalLoan: 'Empréstimo pessoal',
      business: 'Empresa/Profissional',
      businessLoan: 'Empréstimo empresarial',
      login: 'Entrar',
      loggingIn: 'Entrando...',
      signup: 'Criar minha conta',
      signingUp: 'Cadastrando...',
      backToHome: 'Voltar ao início',
      loginSuccess: 'Login bem-sucedido!',
      loginSuccessDesc: 'Bem-vindo à ALTUS',
      signupSuccess: 'Cadastro bem-sucedido!',
      signupSuccessDesc: 'Um e-mail de verificação foi enviado para seu endereço.',
      loginError: 'Erro de login',
      loginErrorDesc: 'E-mail ou senha incorretos',
      signupError: 'Erro',
      signupErrorDesc: 'Ocorreu um erro durante o cadastro',
      emailNotVerified: 'E-mail não verificado',
      emailPlaceholder: 'joao.silva@exemplo.com',
      passwordPlaceholder: '••••••••',
      fullNamePlaceholder: 'João Silva',
      phonePlaceholder: '+55 11 91234-5678',
      companyNamePlaceholder: 'Empresa Ltda',
      siretPlaceholder: '123 456 789 00010',
      required: 'obrigatório',
      companyRequired: 'Nome da empresa é obrigatório para contas empresariais',
      emailInvalid: 'E-mail inválido',
      passwordMinLength: 'A senha deve conter pelo menos 12 caracteres',
      passwordUppercase: 'A senha deve conter pelo menos uma letra maiúscula',
      passwordLowercase: 'A senha deve conter pelo menos uma letra minúscula',
      passwordNumber: 'A senha deve conter pelo menos um número',
      passwordSpecial: 'A senha deve conter pelo menos um caractere especial',
      passwordMatch: 'As senhas devem coincidir',
      invalidOtp: 'Código inválido ou expirado',
      sessionExpired: 'Sessão expirada',
      sessionExpiredMessage: 'Sua sessão expirou. Por favor, faça login novamente.',
      accessDenied: 'Acesso negado',
      authenticationRequired: 'Autenticação necessária',
      verificationError: 'Erro durante a verificação',
      verificationInProgress: 'Verificação em andamento',
      emailVerified: 'Email verificado',
      accountActiveAutoLogin: 'Sua conta está agora ativa. Você está automaticamente conectado e será redirecionado ao seu painel em alguns segundos...',
      linkExpiredInvalid: 'O link de verificação pode estar expirado ou inválido.',
      tokenMissing: 'Token de verificação faltando',
      pleaseTwoFactorCode: 'Por favor, insira seu código de autenticação de dois fatores',
      verificationCodeSent: 'Código de verificação enviado',
      twoFactorAuth: 'Autenticação de dois fatores',
      enterOtpCode: 'Insira o código de 6 dígitos enviado para seu email',
      otpExpiresIn: 'O código expira em 10 minutos',
      backToLogin: 'Voltar ao login',
    },
    errors: {
      sessionExpired: 'Sessão expirada',
      accessDenied: 'Acesso negado',
      authRequired: 'Autenticação necessária',
      networkError: 'Erro de rede. Tente novamente.',
      unexpectedError: 'Ocorreu um erro inesperado',
      verificationFailed: 'Falha na verificação',
    },
    settings: {
      title: 'Configurações',
      profile: 'Perfil',
      notifications: 'Notificações',
      security: 'Segurança',
      appearance: 'Aparência',
      personalInfo: 'Informações Pessoais',
      updateInfo: 'Atualize suas informações de perfil',
      fullName: 'Nome completo',
      email: 'E-mail',
      phone: 'Telefone',
      company: 'Empresa',
      saveChanges: 'Salvar Alterações',
      accountType: 'Tipo de Conta',
      yourAccountType: 'Sua conta',
      individualAccount: 'Conta Pessoal',
      businessAccount: 'Conta Empresarial',
      individualAccess: 'Acesso a serviços de financiamento pessoal',
      businessAccess: 'Acesso completo a serviços de financiamento empresarial',
      verified: 'Verificado',
      notificationPreferences: 'Preferências de Notificação',
      chooseNotifications: 'Escolha como deseja ser notificado',
      emailAlerts: 'Alertas por E-mail',
      emailAlertsDesc: 'Receba alertas importantes por e-mail',
      transferUpdates: 'Atualizações de Transferência',
      transferUpdatesDesc: 'Notificações sobre o status de suas transferências',
      loanReminders: 'Lembretes de Pagamento',
      loanRemindersDesc: 'Lembretes para suas parcelas de empréstimo',
      marketingEmails: 'E-mails de Marketing',
      marketingEmailsDesc: 'Receba novidades e ofertas especiais',
      savePreferences: 'Salvar Preferências',
      changePassword: 'Alterar Senha',
      updatePassword: 'Atualização de sua senha',
      currentPassword: 'Senha atual',
      newPassword: 'Nova senha',
      confirmNewPassword: 'Confirmar nova senha',
      themeSettings: 'Configurações de Tema',
      chooseTheme: 'Selecione seu tema preferido',
      lightMode: 'Modo Claro',
      darkMode: 'Modo Escuro',
      systemMode: 'Sistema',
      languageSettings: 'Configurações de Idioma',
      chooseLanguage: 'Selecione seu idioma',
      changePhoto: 'Alterar foto',
      uploading: 'Carregando...',
      twoFactorAuth: 'Autenticação de dois fatores',
      twoFactorAuthDesc: 'Adicione uma camada extra de segurança à sua conta',
      twoFactorEnabled: 'Autenticação de dois fatores ativada',
      enable2FA: 'Ativar 2FA',
      twoFactorEnabledDesc: 'Sua conta está protegida por autenticação de dois fatores',
      twoFactorDisabledDesc: 'Proteja sua conta com verificação em duas etapas via Google Authenticator',
      disable: 'Desativar',
      configure: 'Configurar',
      enabled: 'Ativado',
      twoFactorActiveMessage: 'Sua conta está protegida com Google Authenticator. Um código será solicitado em cada login.',
      theme: 'Tema',
      themeDesc: 'Escolha seu tema preferido',
      light: 'Claro',
      dark: 'Escuro',
      languageLabel: 'Idioma',
      languageDesc: 'Selecione seu idioma',
      disable2FASuccess: 'Sucesso',
      disable2FASuccessDesc: '2FA desativado com sucesso',
      disable2FAError: 'Erro ao desativar 2FA',
    },
    messages: {
      profileUpdated: 'Perfil atualizado',
      profileUpdatedDesc: 'Suas informações foram salvas com sucesso.',
      preferencesUpdated: 'Preferências salvas',
      preferencesUpdatedDesc: 'Suas preferências de notificação foram atualizadas.',
      passwordChanged: 'Senha alterada',
      passwordChangedDesc: 'Sua senha foi alterada com sucesso.',
      passwordMismatch: 'As senhas não coincidem',
      errorUpdatingProfile: 'Erro ao atualizar perfil',
      errorUpdatingPreferences: 'Erro ao atualizar preferências',
      errorChangingPassword: 'Erro ao alterar senha',
      avatarUpdated: 'Foto de perfil atualizada',
      avatarUpdatedDesc: 'Sua foto de perfil foi atualizada com sucesso.',
      errorUploadingAvatar: 'Erro ao enviar foto',
      invalidFileType: 'Tipo de arquivo não permitido. Apenas imagens JPEG, PNG e WebP são aceitas.',
      fileTooLarge: 'O arquivo é muito grande (máx. 5MB).',
    },
    bankCard: {
      title: 'Cartão Bancário Premium Altus',
      subtitle: 'Peça seu cartão exclusivo e aproveite vantagens excepcionais',
      learnMore: 'Saiba Mais',
      viewDetails: 'Ver detalhes',
      orderNow: 'Pedir Agora',
      orderCard: 'Pedir Cartão',
      orderSuccess: 'Pedido de cartão virtual',
      orderSuccessDesc: 'Seu cartão virtual está sendo ativado. Você receberá detalhes por e-mail em breve.',
      modalTitle: 'Cartão Bancário Premium Altus',
      modalSubtitle: 'Descubra todas as vantagens do nosso cartão exclusivo',
      advantagesTitle: 'Vantagens Exclusivas',
      advantages: {
        cashback: 'Cashback de 2%',
        cashbackDesc: 'Ganhe 2% de cashback em todas as suas compras',
        noFees: 'Sem Taxas Anuais',
        noFeesDesc: 'Primeiro ano gratuito, depois €49/ano',
        protection: 'Proteção Total',
        protectionDesc: 'Seguro de viagem e proteção de compras incluídos',
        rewards: 'Programa de Recompensas',
        rewardsDesc: 'Acumule pontos a cada compra',
        global: 'Aceitação Global',
        globalDesc: 'Aceito em milhões de estabelecimentos em todo o mundo',
        support: 'Suporte responsivo',
        supportDesc: 'Assistência responsiva durante horário comercial',
        maxSecurity: 'Segurança máxima',
        maxSecurityDesc: 'Números temporários com proteção total',
        instantActivation: 'Ativação instantânea',
        instantActivationDesc: 'Utilizável imediatamente',
        noFeesEuro: 'Sem taxas',
        noFeesEuroDesc: '0% de taxas em zona euro',
        globallyAccepted: 'Aceita globalmente',
        globallyAcceptedDesc: 'Compatível com Apple Pay e Google Pay',
      },
      usageZonesTitle: 'Zonas de Uso',
      usageZones: {
        worldwide: 'Mundo Inteiro',
        worldwideDesc: 'Use seu cartão em qualquer lugar do mundo',
        online: 'Compras Online',
        onlineDesc: 'Pagamento seguro para todas as suas compras online',
        stores: 'Lojas Físicas',
        storesDesc: 'Aceito em milhões de lojas em todo o mundo',
        atm: 'Saques em Caixas Eletrônicos',
        atmDesc: 'Saques gratuitos em caixas eletrônicos da rede',
      },
      feesTitle: 'Taxas e Tarifas',
      fees: {
        annualFee: 'Taxa Anual',
        annualFeeAmount: 'Grátis no primeiro ano, depois €49/ano',
        transactionFee: 'Taxa de Transação',
        transactionFeeAmount: '0% nas compras',
        withdrawalFee: 'Taxa de Saque',
        withdrawalFeeAmount: '3 saques gratuitos/mês, depois €2/saque',
        foreignFee: 'Taxa de Câmbio',
        foreignFeeAmount: '1,5% em transações estrangeiras',
      },
      specificationsTitle: 'Especificações',
      specifications: {
        cardType: 'Tipo de Cartão',
        cardTypeValue: 'Visa Premium / Mastercard World Elite',
        creditLimit: 'Limite de Crédito',
        creditLimitValue: 'Até €50.000 conforme perfil',
        validity: 'Validade',
        validityValue: '5 anos',
        delivery: 'Entrega',
        deliveryValue: '7-10 dias úteis',
      },
      orderProcess: 'Processo de Pedido',
      orderProcessDesc: 'Preencha o formulário de pedido, forneça seus documentos, aguarde a aprovação (24-48h) e receba seu cartão em casa.',
      termsConditions: 'Termos e Condições do Cartão Premium Altus',
      close: 'Fechar',
    },
    notifications: {
      loan_request: { title: 'Nova solicitação de empréstimo', message: 'Sua solicitação de empréstimo foi recebida' },
      loan_under_review: { title: 'Empréstimo em análise', message: 'Seu empréstimo está sendo analisado' },
      loan_approved: { title: 'Empréstimo aprovado', message: 'Parabéns! Seu empréstimo foi aprovado' },
      loan_rejected: { title: 'Empréstimo recusado', message: 'Sua solicitação de empréstimo foi recusada' },
      loan_contract_generated: { title: 'Contrato gerado', message: 'Seu contrato de empréstimo está pronto para download' },
      loan_contract_signed: { title: 'Contrato assinado', message: 'Seu contrato foi recebido e está sendo processado' },
      loan_disbursed: { title: 'Fundos liberados', message: 'Os fundos do empréstimo foram depositados em sua conta' },
      transfer_initiated: { title: 'Transferência iniciada', message: 'Sua solicitação de transferência foi iniciada' },
      transfer_completed: { title: 'Transferência concluída', message: 'Sua transferência foi concluída com sucesso' },
      transfer_approved: { title: 'Transferência aprovada', message: 'Sua transferência foi aprovada' },
      transfer_suspended: { title: 'Transferência suspensa', message: 'Sua transferência foi suspensa' },
      code_issued: { title: 'Código emitido', message: 'Um código de transferência foi gerado' },
      kyc_approved: { title: 'KYC aprovado', message: 'Sua verificação de identidade foi aprovada' },
      kyc_rejected: { title: 'KYC rejeitado', message: 'Sua verificação de identidade foi rejeitada' },
      fee_added: { title: 'Nova taxa', message: 'Uma nova taxa foi adicionada à sua conta' },
      account_status_changed: { title: 'Status da conta alterado', message: 'O status da sua conta foi atualizado' },
      admin_message_sent: { title: 'Nova mensagem', message: 'Você recebeu uma mensagem do administrador' },
      general: { title: 'Notificação', message: 'Você tem uma nova notificação' },
      twoFactorSuggestion: { title: 'Sugestão de segurança', message: 'Recomendamos ativar a autenticação de dois fatores para maior segurança da conta' },
      markAllRead: 'Marcar todas como lidas',
      markAsRead: 'Marcar como lida',
      deleteNotification: 'Excluir notificação',
    },
    dialogs: {
      newLoan: {
        title: 'Nova Solicitação de Empréstimo',
        subtitle: 'Preencha o formulário abaixo para solicitar um empréstimo',
        subtitleFirstRequest: 'Primeira solicitação: forneça seus documentos de identidade e preencha o formulário',
        subtitleRegular: 'Preencha o formulário para enviar uma nova solicitação de empréstimo',
        loanType: 'Tipo de Empréstimo',
        selectLoanType: 'Selecione o tipo',
        amount: 'Valor',
        enterAmount: 'Digite o valor',
        duration: 'Duração',
        selectDuration: 'Selecione a duração',
        months: 'meses',
        estimatedRate: 'Taxa Estimada',
        monthlyPayment: 'Parcela Mensal',
        totalRepayment: 'Reembolso Total',
        firstRequestAlert: 'Primeira solicitação de empréstimo',
        firstRequestAlertDesc: 'Para sua primeira solicitação, você precisa adicionar uma conta bancária e enviar documentos KYC.',
        addBankAccount: 'Adicionar Conta Bancária',
        selectAccount: 'Selecionar Conta',
        bankName: 'Nome do Banco',
        bankNamePlaceholder: 'Ex: Banco do Brasil',
        accountLabel: 'Rótulo da Conta',
        accountLabelPlaceholder: 'Ex: Conta Principal',
        iban: 'IBAN',
        ibanPlaceholder: 'BRXX XXXX XXXX XXXX XXXX XXXX X',
        bic: 'BIC/SWIFT',
        bicPlaceholder: 'XXXXXXXX',
        uploadDocuments: 'Enviar Documentos',
        kycDocumentsTab: 'Documentos KYC',
        additionalDocumentsTab: 'Documentos Adicionais',
        loanDetailsTab: 'Detalhes do Empréstimo',
        identity: 'Documento de Identidade',
        proof_of_address: 'Comprovante de Residência',
        income_proof: 'Comprovante de Renda',
        business_registration: 'Registro Comercial',
        financial_statements: 'Demonstrações Financeiras',
        tax_returns: 'Declaração de Imposto de Renda',
        requiredDocuments: 'Documentos Requeridos',
        identityDoc: 'Documento de Identidade (RG ou Passaporte)',
        addressProof: 'Comprovante de Residência (menos de 3 meses)',
        bankStatement: 'Extrato Bancário (últimos 3 meses)',
        uploadingInProgress: 'Enviando...',
        documentsUploadedSuccess: 'documento(s) carregado(s) com sucesso',
        submit: 'Enviar Solicitação',
        submitting: 'Enviando...',
        cancel: 'Cancelar',
        loanTypes: {
          personal: 'Empréstimo Pessoal',
          auto: 'Crédito Auto',
          mortgage: 'Empréstimo Hipotecário',
          green: 'Empréstimo Verde',
          renovation: 'Empréstimo para Reformas',
          student: 'Empréstimo Estudantil',
          business: 'Empréstimo Empresarial',
          cashFlow: 'Gestão de Fluxo de Caixa',
          equipment: 'Financiamento de Equipamentos',
          commercialProperty: 'Imóvel Comercial',
          lineOfCredit: 'Linha de Crédito',
          vehicleFleet: 'Frota de Veículos',
        },
        errors: {
          amountMustBePositive: 'O valor deve ser maior que 0',
          amountMaxExceeded: 'O valor não pode exceder €1.000.000',
          rateMustBePositive: 'A taxa deve ser positiva',
          rateMaxExceeded: 'A taxa não pode exceder 20%',
          durationMustBePositive: 'A duração deve ser maior que 0',
          durationMaxExceeded: 'A duração não pode exceder 360 meses',
          documentsRequired: 'Você deve enviar seus documentos KYC para sua primeira solicitação',
        },
        success: {
          loanSubmitted: 'Solicitação de Empréstimo Enviada',
          loanSubmittedDesc: 'Sua solicitação de empréstimo foi enviada com sucesso.',
          documentsUploaded: 'Documentos Carregados',
          documentsUploadedDesc: 'documento(s) enviado(s) com sucesso.',
        },
        error: {
          loanError: 'Erro',
          loanErrorDesc: 'Não foi possível criar a solicitação de empréstimo.',
          partialUploadError: 'Erro Parcial',
          partialUploadErrorDesc: 'documento(s) não puderam ser carregados.',
        },
      },
      transfer: {
        title: 'Nova Transferência',
        subtitle: 'Transfira fundos para sua conta bancária',
        selectAccount: 'Selecionar Conta',
        noAccountsAvailable: 'Nenhuma conta bancária disponível. Adicione uma conta primeiro.',
        amount: 'Valor',
        enterAmount: 'Digite o valor',
        amountPlaceholder: '50000',
        recipient: 'Destinatário',
        recipientPlaceholder: 'Nome da empresa ou beneficiário',
        feesDescription: 'Taxas de transferência de 25€ serão aplicadas',
        availableFunds: 'Fundos Disponíveis',
        feesAndProcessing: 'Taxas e Processamento',
        submit: 'Iniciar Transferência',
        submitting: 'Processando...',
        creating: 'Criando...',
        createTransfer: 'Criar transferência',
        cancel: 'Cancelar',
        transferSuccess: 'Transferência iniciada',
        transferSuccessDesc: 'Sua solicitação de transferência foi criada com sucesso',
        transferError: 'Erro',
        transferErrorDesc: 'Não foi possível criar a transferência',
      },
      loanRequestModal: {
        title: 'Solicitar um Empréstimo',
        description: 'Preencha o formulário abaixo e anexe os documentos necessários para enviar sua solicitação de empréstimo.',
        loanType: 'Tipo de Empréstimo',
        selectLoanTypePlaceholder: 'Selecione um tipo de empréstimo',
        loanAmount: 'Valor do Empréstimo',
        duration: 'Duração',
        durationMonths: 'Duração (meses)',
        months: 'meses',
        interestRate: 'Taxa de Juros',
        estimatedMonthlyPayment: 'Pagamento Mensal Estimado',
        requiredDocuments: 'Documentos Requeridos',
        requiredDocumentsDescription: 'Por favor, anexe todos os documentos marcados como obrigatórios para finalizar sua solicitação.',
        required: 'Obrigatório',
        optional: 'Opcional',
        attach: 'Anexar',
        cancel: 'Cancelar',
        submit: 'Enviar Solicitação',
        validationError: 'Por favor, selecione um tipo de empréstimo',
        requestSent: 'Solicitação Enviada',
        requestSentDescription: 'Sua solicitação de empréstimo foi enviada com sucesso. Você receberá uma resposta em 48 horas.',
        error: 'Erro',
        errorDescription: 'Ocorreu um erro ao enviar sua solicitação.',
        fileTooLarge: 'Arquivo Muito Grande',
        fileTooLargeDescription: 'O tamanho máximo do arquivo é de 10MB.',
        missingDocuments: 'Documentos Faltando',
        missingDocumentsPrefix: 'Por favor, anexe todos os documentos obrigatórios:',
      },
      cardTerms: {
        title: 'Termos e Condições do Cartão Premium Altus',
        acceptTerms: 'Aceitar e Pedir Cartão',
        declineTerms: 'Recusar',
      },
      welcome: {
        title: 'Bem-vindo à Altus Finance Group',
        description: 'Sua conta foi criada com sucesso. Escolha entre nossas ofertas personalizadas para começar.',
        accountTypeTitle: 'Tipo de Conta',
        individualAccount: 'Conta Pessoal',
        businessAccount: 'Conta Empresarial',
        individualAccess: 'Acesso a empréstimos pessoais e gestão de finanças pessoais',
        businessAccess: 'Acesso completo a soluções de financiamento empresarial e serviços premium',
        availableOffers: 'Ofertas Disponíveis para Você',
        getStarted: 'Começar',
        dialog: {
          title: 'Bem-vindo ao Altus Finance Group!',
          description: 'Estamos felizes em apoiá-lo em seus projetos de financiamento.',
        },
        account: {
          badgeLabel: 'Sua conta:',
          individual: {
            description: 'Você tem acesso a ofertas de empréstimos pessoais. Essas ofertas são especialmente projetadas para suas necessidades pessoais e projetos individuais.',
          },
          business: {
            description: 'Você tem acesso a ofertas de empréstimos profissionais. Essas ofertas são especialmente projetadas para o desenvolvimento e crescimento de sua empresa.',
          },
        },
        offers: {
          title: 'Ofertas disponíveis para você',
          individual: [
            'Empréstimo Pessoal',
            'Empréstimo Hipotecário',
            'Crédito Auto',
            'Empréstimo Estudantil',
            'Empréstimo Verde',
            'Empréstimo para Reformas',
          ],
          business: [
            'Empréstimo Profissional',
            'Crédito de Tesouraria',
            'Financiamento de Equipamentos',
            'Hipoteca Comercial',
            'Linha de Crédito',
            'Crédito para Veículo Profissional',
          ],
        },
        important: {
          title: 'Importante:',
          message: 'Apenas as ofertas mencionadas acima estarão acessíveis em seu espaço.',
          individualSwitch: ' Se você deseja acessar ofertas profissionais, precisará criar uma conta empresarial.',
          businessSwitch: ' Se você deseja acessar ofertas pessoais, precisará criar uma conta pessoal.',
        },
        cta: {
          primary: 'Entendi, começar',
          pending: 'Carregando...',
        },
      },
      transactionHistory: {
        title: 'Histórico de Transações',
        type: 'Tipo',
        amount: 'Valor',
        date: 'Data',
        status: 'Status',
        noTransactions: 'Nenhuma transação encontrada',
        close: 'Fechar',
      },
    },
    verify: {
      verifying: 'Verificando...',
      success: 'E-mail Verificado!',
      successMessage: 'Seu e-mail foi verificado com sucesso. Você pode agora fazer login na sua conta.',
      goToDashboard: 'Ir para o Painel',
      error: 'Verificação Falhou',
      errorMessage: 'Não foi possível verificar seu e-mail. O link pode ter expirado.',
      tryAgain: 'Tentar Novamente',
      backToSignup: 'Voltar ao Cadastro',
      backToHome: 'Voltar ao Início',
    },
    forgotPassword: {
      title: 'Esqueceu a Senha?',
      description: 'Sem problema! Enviaremos instruções para redefinir sua senha.',
      instructions: 'Digite seu endereço de e-mail abaixo e enviaremos um link para redefinir sua senha.',
      emailLabel: 'Endereço de E-mail',
      emailPlaceholder: 'seuemail@exemplo.com',
      sendResetLink: 'Enviar Link de Redefinição',
      sending: 'Enviando...',
      backToLogin: 'Voltar ao Login',
      emailSent: 'E-mail Enviado!',
      emailSentDesc: 'Verifique sua caixa de entrada para instruções de redefinição de senha.',
      error: 'Erro',
      errorDesc: 'Não foi possível enviar o e-mail de redefinição. Tente novamente.',
    },
    resetPassword: {
      title: 'Redefinir Senha',
      description: 'Digite sua nova senha abaixo',
      newPassword: 'Nova Senha',
      newPasswordPlaceholder: 'Digite sua nova senha',
      confirmPassword: 'Confirmar Senha',
      confirmPasswordPlaceholder: 'Confirme sua nova senha',
      requirements: 'Requisitos da Senha',
      minLength: 'Pelo menos 12 caracteres',
      uppercase: 'Pelo menos uma letra maiúscula',
      lowercase: 'Pelo menos uma letra minúscula',
      number: 'Pelo menos um número',
      specialChar: 'Pelo menos um caractere especial',
      passwordStrength: 'Força da Senha',
      weak: 'Fraca',
      medium: 'Média',
      strong: 'Forte',
      veryStrong: 'Muito Forte',
      resetPassword: 'Redefinir Senha',
      resetting: 'Redefinindo...',
      success: 'Senha Redefinida!',
      successMessage: 'Sua senha foi redefinida com sucesso. Você pode agora fazer login com sua nova senha.',
      error: 'Erro',
      invalidToken: 'Link de redefinição inválido ou expirado',
      passwordMismatch: 'As senhas não coincidem',
    },
    twoFactorAuth: {
      setup: {
        title: 'Configurar Autenticação de Dois Fatores',
        description: 'Adicione uma camada extra de segurança à sua conta',
        step1: 'Passo 1: Instale um Aplicativo Autenticador',
        step1Description: 'Baixe um aplicativo como Google Authenticator ou Authy em seu dispositivo móvel.',
        step2: 'Passo 2: Escaneie o Código QR',
        step2Description: 'Abra seu aplicativo autenticador e escaneie o código QR abaixo.',
        step3: 'Passo 3: Digite o Código de Verificação',
        step3Description: 'Digite o código de 6 dígitos do seu aplicativo autenticador para completar a configuração.',
        qrCodeInstructions: 'Escaneie este código QR com seu aplicativo autenticador',
        cantScanQR: 'Não consegue escanear o código QR?',
        secretKey: 'Digite esta chave manualmente',
        enterCode: 'Digite o código de 6 dígitos',
        codePlaceholder: '000000',
        verify: 'Verificar e Ativar',
        verifying: 'Verificando...',
        cancel: 'Cancelar',
        successTitle: '2FA Ativado!',
        successMessage: 'A autenticação de dois fatores foi ativada com sucesso em sua conta.',
        errorTitle: 'Código Inválido',
        errorMessage: 'O código que você digitou é inválido. Tente novamente.',
      },
      disable: {
        title: 'Desativar Autenticação de Dois Fatores',
        description: 'Digite sua senha para desativar 2FA',
        enterPassword: 'Digite sua senha',
        passwordPlaceholder: 'Sua senha',
        disable: 'Desativar 2FA',
        disabling: 'Desativando...',
        cancel: 'Cancelar',
        successTitle: '2FA Desativado',
        successMessage: 'A autenticação de dois fatores foi desativada em sua conta.',
        errorTitle: 'Erro',
        errorMessage: 'Não foi possível desativar 2FA. Verifique sua senha e tente novamente.',
      },
      login: {
        title: 'Verificação de Dois Fatores',
        description: 'Digite o código de 6 dígitos do seu aplicativo autenticador',
        enterCode: 'Código de verificação',
        codePlaceholder: '000000',
        verify: 'Verificar',
        verifying: 'Verificando...',
        cancel: 'Cancelar',
        errorTitle: 'Código Inválido',
        errorMessage: 'O código que você digitou é inválido. Tente novamente.',
      },
    },
    bankAccounts: {
      title: 'Contas Bancárias',
      description: 'Gerencie suas contas bancárias para transferências',
      addAccount: 'Adicionar Conta',
      noAccountsTitle: 'Nenhuma Conta Bancária',
      noAccountsDescription: 'Você ainda não adicionou nenhuma conta bancária. Adicione uma para começar a fazer transferências.',
      accountLabel: 'Rótulo',
      bankName: 'Banco',
      iban: 'IBAN',
      bic: 'BIC',
      createdAt: 'Adicionado em',
      actions: 'Ações',
      delete: 'Excluir',
      deleteConfirm: 'Tem certeza de que deseja excluir esta conta bancária?',
      deleteSuccess: 'Conta bancária excluída com sucesso',
      addAccountTitle: 'Adicionar Conta Bancária',
      addAccountDescription: 'Adicione uma nova conta bancária para receber transferências',
      accountLabelLabel: 'Rótulo da Conta',
      accountLabelPlaceholder: 'Ex: Conta Principal',
      accountLabelRequired: 'O rótulo da conta é obrigatório',
      bankNameLabel: 'Nome do Banco',
      bankNamePlaceholder: 'Ex: Banco do Brasil',
      bankNameRequired: 'O nome do banco é obrigatório',
      ibanLabel: 'IBAN',
      ibanPlaceholder: 'BRXX XXXX XXXX XXXX XXXX XXXX X',
      ibanRequired: 'O IBAN é obrigatório',
      invalidIban: 'Formato de IBAN inválido',
      bicLabel: 'BIC/SWIFT',
      bicPlaceholder: 'XXXXXXXX',
      invalidBic: 'Formato de BIC inválido',
      submit: 'Adicionar Conta',
      submitting: 'Adicionando...',
      cancel: 'Cancelar',
      addSuccess: 'Conta Adicionada!',
      addSuccessDesc: 'Sua conta bancária foi adicionada com sucesso.',
      addError: 'Erro ao adicionar conta',
      addFirstAccount: 'Adicionar sua primeira conta',
      deleteSuccessDesc: 'A conta bancária foi excluída com sucesso.',
      deleteError: 'Não foi possível excluir a conta bancária.',
    },
    welcomeModal: {
      title: 'Bem-vindo à Altus Finance Group',
      description: 'Sua conta foi criada com sucesso. Explore nossos serviços personalizados.',
      accountType: 'Tipo de Conta',
      individualAccount: 'Conta Pessoal',
      businessAccount: 'Conta Empresarial',
      individualAccess: 'Acesso a empréstimos pessoais e gestão de finanças',
      businessAccess: 'Acesso completo a soluções empresariais e serviços premium',
      availableOffers: 'Ofertas Disponíveis',
      getStarted: 'Começar',
    },
    calculator: {
      title: 'Calculadora de Amortização',
      description: 'Simule seu plano de pagamento',
      loanAmount: 'Valor do Empréstimo',
      interestRate: 'Taxa de Juros Anual (%)',
      loanDuration: 'Duração do Empréstimo',
      months: 'meses',
      calculate: 'Calcular',
      results: 'Resultados',
      monthlyPayment: 'Parcela Mensal',
      totalInterest: 'Juros Totais',
      totalAmount: 'Valor Total',
      amortizationSchedule: 'Tabela de Amortização',
      month: 'Mês',
      payment: 'Pagamento',
      principal: 'Capital',
      interest: 'Juros',
      balance: 'Saldo Restante',
      downloadSchedule: 'Baixar Tabela',
    },
    amortization: {
      interactiveTitle: 'Tabela de Amortização Interativa',
      interactiveDescription: 'Selecione um empréstimo ativo e personalize os parâmetros para ver o impacto nos pagamentos',
      calculatorTitle: 'Calculadora de Amortização Interativa',
      calculatorDescription: 'Simule seu plano de pagamento e visualize a evolução do seu empréstimo',
      selectActiveLoan: 'Selecionar um empréstimo ativo',
      chooseLoan: 'Escolha um empréstimo...',
      loanOf: 'Empréstimo de',
      at: 'a',
      loanAmount: 'Valor do Empréstimo (€)',
      annualInterestRate: 'Taxa de Juros Anual (%)',
      duration: 'Duração (anos)',
      years: 'anos',
      calculateAmortization: 'Calcular Amortização',
      calculatePlan: 'Calcular Plano de Amortização',
      monthlyPayment: 'Parcela Mensal',
      totalPayment: 'Total a Pagar',
      totalInterest: 'Total de Juros',
      table: 'Tabela',
      evolution: 'Evolução',
      cumulative: 'Acumulativo',
      breakdown: 'Detalhamento',
      month: 'Mês',
      payment: 'Pagamento',
      principal: 'Principal',
      interest: 'Juros',
      balance: 'Saldo',
      amount: 'Valor (€)',
      monthLabel: 'Mês',
      noActiveLoans: 'Sem empréstimos ativos',
      noActiveLoansDesc: 'Você não tem empréstimos ativos no momento. Solicite um novo empréstimo para usar este recurso.',
      loanType: 'Tipo de Empréstimo',
      selectType: 'Selecione o tipo',
      personal: 'Pessoal',
      business: 'Empresarial',
      realEstate: 'Imobiliário',
      automaticallyCalculated: 'Calculado automaticamente',
      rateInfo: 'A taxa de juros é calculada automaticamente com base no valor e tipo de empréstimo. Todas as solicitações de empréstimo exigem aprovação administrativa.',
      requestLoan: 'Solicitar este empréstimo',
      sending: 'Enviando...',
      chart: 'Gráfico',
      balanceEvolution: 'Evolução do saldo e pagamentos',
      principalVsInterest: 'Detalhamento Principal vs Juros',
      monthlyRepaymentPlan: 'Plano de pagamento mensal',
      remainingBalance: 'Saldo restante',
      errors: {
        amountPositive: 'O valor do empréstimo deve ser maior que €0',
        amountMax: 'O valor do empréstimo não pode exceder €10.000.000',
        rateNegative: 'A taxa de juros não pode ser negativa',
        rateMax: 'A taxa de juros não pode exceder 100%',
        durationPositive: 'A duração do empréstimo deve ser maior que 0 anos',
        durationMax: 'A duração do empréstimo não pode exceder 50 anos',
      },
    },
    kycDocuments: {
      title: 'Documentos KYC',
      description: 'Envie seus documentos de identificação',
      uploadDocuments: 'Envie Seus Documentos',
      documentType: 'Tipo de Documento',
      selectDocumentType: 'Selecione o tipo',
      identity: 'Documento de Identidade',
      proof_of_address: 'Comprovante de Residência',
      income_proof: 'Comprovante de Renda',
      business_registration: 'Registro Empresarial',
      financial_statements: 'Demonstrações Financeiras',
      tax_returns: 'Declaração de Impostos',
      chooseFile: 'Escolher arquivo',
      upload: 'Enviar',
      uploading: 'Enviando...',
      uploadSuccess: 'Documento enviado',
      uploadSuccessDesc: 'Seu documento foi enviado com sucesso.',
      uploadError: 'Erro ao enviar',
      status: 'Status',
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      uploadedAt: 'Enviado em',
      noDocuments: 'Nenhum documento enviado',
    },
    transferFlow: {
      backToDashboard: 'Voltar ao Painel',
      form: {
        title: 'Nova Transferência',
        subtitle: 'Inicie uma transferência segura para uma conta externa',
        amountLabel: 'Valor (EUR)',
        amountPlaceholder: '10000',
        amountHelper: 'Valor fixo baseado no seu empréstimo ativo (não editável)',
        accountLabel: 'Conta Externa (opcional)',
        accountPlaceholder: 'Selecionar uma conta',
        externalAccountLabel: 'Conta externa *',
        selectAccountPlaceholder: 'Selecionar uma conta',
        noAccount: 'Nenhuma conta registrada',
        recipientLabel: 'Beneficiário',
        recipientPlaceholder: 'Nome do beneficiário',
        initiateButton: 'Iniciar Transferência',
        initiating: 'Iniciando...',
      },
      verification: {
        title: 'Verificação de Transferência',
        subtitle: 'Por favor aguarde enquanto verificamos sua transferência',
        doNotClose: 'Não feche esta página',
        doNotCloseDesc: 'Sua transferência está sendo verificada pelo nosso sistema seguro. Esta operação leva aproximadamente 45 segundos.',
        progressLabel: 'Progresso da Verificação',
        verificationSteps: 'Etapas de Verificação',
        step1: 'Verificação da conta emissora',
        step2: 'Validação do valor e taxas',
        step3: 'Controle de segurança antifraude',
        step4: 'Preparação da transferência segura',
      },
      validation: {
        title: 'Validação da Transferência',
        subtitle: 'Código {sequence} / {total}',
        demoCodeLabel: 'Código de demonstração:',
        codeLabel: 'Código de Validação (6 dígitos)',
        codePlaceholder: '000000',
        codeHelpText: 'Um código foi enviado para seu e-mail',
        validateButton: 'Validar',
        validating: 'Validando...',
        resendButton: 'Reenviar',
        historyLabel: 'Histórico',
      },
      progress: {
        titlePaused: 'Transferência Pausada',
        titleInProgress: 'Transferência em Andamento',
        securityVerificationTitle: 'Verificação de segurança',
        transferProcessingTitle: 'Transferência em processamento',
        toPrefix: 'Para:',
        securityVerificationRequired: 'Verificação de segurança necessária',
        enterVerificationCode: 'Por razões de segurança, insira o código de verificação que lhe foi enviado',
        codeFromAdvisor: 'O código de segurança será fornecido pelo seu consultor',
        validationCodeLabel: 'Código de validação (6 dígitos)',
        enterCodePlaceholder: 'Insira o código de 6 dígitos',
        validating: 'Validando...',
        validateAndContinue: 'Validar e continuar',
        processingTransfer: 'Processando sua transferência...',
        doNotCloseProcessing: 'Sua operação está sendo processada com segurança. Não feche esta página.',
        amountLabel: 'Valor: {amount} EUR para {recipient}',
        progressLabel: 'Progresso',
        pauseTitle: 'Código de desbloqueio necessário em {percent}%',
        pauseDescription: 'Entre em contato com o atendimento ao cliente para obter o código de desbloqueio da sua transferência.',
        pauseCodeLabel: 'Código de Desbloqueio',
        pauseCodePlaceholder: 'Digite o código',
        validatePauseCode: 'Validar Código',
        statusLabel: 'Estado Atual',
        statusCompleted: 'Transferência concluída!',
        statusProcessing: 'Processamento em andamento pelo nosso sistema bancário...',
        eventsLabel: 'Eventos',
        circularProgressTitle: 'Verificação da transferência',
        circularProgressSubtitle: 'Sua operação está sendo processada com segurança.',
      },
      complete: {
        title: 'Transferência Concluída',
        subtitle: 'Sua transferência foi realizada com sucesso',
        successMessage: 'Sua transferência foi concluída com sucesso. Os fundos estarão disponíveis em 24 a 72 horas.',
        referenceLabel: 'Referência',
        returnToDashboard: 'Voltar ao painel',
        amountLabel: 'Valor',
        recipientLabel: 'Beneficiário',
        feesLabel: 'Taxas',
      },
      toast: {
        transferInProgress: 'Transferência em andamento',
        transferAlreadyInProgress: 'Já existe uma transferência em andamento para este empréstimo. Redirecionando...',
        transferInitiated: 'Transferência iniciada com sucesso. Verificação em andamento...',
        selectExternalAccount: 'Por favor, selecione uma conta externa.',
        noActiveLoan: 'Nenhum empréstimo ativo disponível.',
        initiated: 'Transferência Iniciada',
        initiatedDesc: 'Verificação da sua transferência em andamento...',
        error: 'Erro',
        errorInitiation: 'Falha ao iniciar a transferência',
        codeValidated: 'Código Validado',
        codeInvalid: 'Código Inválido',
        codeInvalidDesc: 'O código está incorreto ou expirou',
        codeSent: 'Código Enviado',
        codeSentDesc: 'Código {sequence} enviado com sucesso',
        approved: 'Transferência Aprovada',
        approvedDesc: 'Sua transferência está aprovada e sendo processada.',
        fieldsRequired: 'Campos Obrigatórios',
        fieldsRequiredDesc: 'Por favor preencha todos os campos',
        invalidCode: 'Código Inválido',
        invalidCodeDesc: 'O código deve conter 6 dígitos',
        codeRequired: 'Código Obrigatório',
        codeRequiredDesc: 'Por favor digite o código de desbloqueio',
        unblocked: 'Transferência Desbloqueada',
        unblockedDesc: 'A transferência foi desbloqueada com sucesso',
      },
    },
    loanOffers: {
      pageTitle: 'Nossas Ofertas de Empréstimo',
      pageSubtitle: 'Descubra todas as nossas soluções de financiamento para particulares e profissionais',
      accountInfo: 'Conta {accountType}:',
      individualTab: 'Empréstimos Pessoais',
      businessTab: 'Empréstimos Empresariais',
      individual: 'Particular',
      business: 'Profissional',
      amountLabel: 'Valor',
      rateLabel: 'Taxa',
      durationLabel: 'Duração',
      advantagesLabel: 'Vantagens',
      requestButton: 'Solicitar este Empréstimo',
      loginToRequest: 'Entrar para Solicitar',
      types: {
        personalLoan: {
          title: 'Empréstimo Pessoal',
          description: 'Financiamento flexível para todos os seus projetos pessoais',
          features: ['Resposta rápida', 'Sem justificativa de uso', 'Reembolso flexível'],
        },
        mortgageLoan: {
          title: 'Empréstimo Imobiliário',
          description: 'Financie a compra de sua residência principal ou secundária',
          features: ['Taxa fixa ou variável', 'Até 80% do valor', 'Seguro incluído'],
        },
        autoLoan: {
          title: 'Crédito Auto',
          description: 'Compre seu veículo novo ou usado',
          features: ['Liberação rápida', 'Possibilidade de reembolso antecipado', 'Seguro opcional'],
        },
        studentLoan: {
          title: 'Empréstimo Estudantil',
          description: 'Financie seus estudos com condições vantajosas',
          features: ['Reembolso diferido', 'Taxas preferenciais', 'Garantia parental opcional'],
        },
        greenLoan: {
          title: 'Empréstimo Verde',
          description: 'Financie seus projetos de renovação energética',
          features: ['Taxa reduzida', 'Elegível para auxílios estatais', 'Financiamento eco-responsável'],
        },
        renovationLoan: {
          title: 'Empréstimo para Obras',
          description: 'Renove e melhore sua residência',
          features: ['Sem hipoteca até 75k€', 'Liberação progressiva possível', 'Dedução fiscal possível'],
        },
        businessLoan: {
          title: 'Empréstimo Empresarial',
          description: 'Financiamento para seus projetos empresariais, desenvolvimento e tesouraria',
          features: ['Resposta em 48h', 'Taxa fixa', 'Reembolso flexível'],
        },
        cashFlowCredit: {
          title: 'Crédito de Tesouraria',
          description: 'Solução rápida para gerenciar suas necessidades de capital de giro',
          features: ['Liberação rápida', 'Sem garantia até 50k€', 'Flexível'],
        },
        equipmentFinancing: {
          title: 'Financiamento de Equipamentos',
          description: 'Compre seus equipamentos e materiais profissionais',
          features: ['Até 100% do valor', 'Opção de leasing', 'Dedução fiscal'],
        },
        commercialPropertyLoan: {
          title: 'Empréstimo Imobiliário Comercial',
          description: 'Adquira seus locais profissionais, escritórios ou armazéns',
          features: ['Duração longa', 'Entrada a partir de 20%', 'Taxa competitiva'],
        },
        lineOfCredit: {
          title: 'Linha de Crédito',
          description: 'Crédito renovável para suas necessidades pontuais',
          features: ['Disponível 24/7', 'Reembolso livre', 'Renovação automática'],
        },
        vehicleFleetLoan: {
          title: 'Crédito para Frota de Veículos',
          description: 'Financie sua frota automotiva ou veículos utilitários',
          features: ['Leasing ou crédito tradicional', 'Opção de recompra', 'Seguro incluído'],
        },
      },
    },
    cardTermsContent: {
      title: 'Termos e Condições de Uso - Cartão Virtual ALTUS',
      lastUpdated: 'Última atualização: Novembro 2025',
      section1: {
        title: '1. OBJETO E ÂMBITO DE APLICAÇÃO',
        content: 'Os presentes termos e condições gerais (doravante "TCG") regem o uso do cartão bancário virtual ALTUS (doravante "Cartão Virtual"), oferecido pela ALTUS Finance Group aos clientes titulares de uma conta ALTUS (doravante "Titular"). O Cartão Virtual é um meio de pagamento desmaterializado vinculado à sua conta ALTUS.',
      },
      section2: {
        title: '2. DESCRIÇÃO DO SERVIÇO',
        subtitle1: '2.1 Natureza do Cartão Virtual',
        content1: 'O Cartão Virtual é um cartão de pagamento desmaterializado com um número de cartão de 16 dígitos, uma data de validade e um criptograma visual (CVV). Funciona como um cartão bancário físico mas existe apenas em forma eletrônica.',
        subtitle2: '2.2 Tipo de Cartão',
        item1: 'Cartão virtual permanente: credenciais fixas durante todo o período de validade (3 anos)',
        item2: 'Cartão virtual efêmero: credenciais temporárias com valor e duração configuráveis',
      },
      section3: {
        title: '3. CONDIÇÕES DE ELEGIBILIDADE',
        content: 'Para obter um Cartão Virtual, o Titular deve:',
        list: [
          'Ser cliente ALTUS com uma conta ativa e com fundos',
          'Ter concluído a verificação de identidade (KYC)',
          'Não estar em situação de saque a descoberto não autorizado',
          'Ter ativado a autenticação forte (duplo fator)',
          'Aceitar os presentes TCG e as Condições Tarifárias',
        ],
      },
      section4: {
        title: '4. ATIVAÇÃO E USO',
        subtitle1: '4.1 Ativação',
        content1: 'O Cartão Virtual é ativado instantaneamente após sua criação através do aplicativo ou da área do cliente ALTUS. O Titular recebe imediatamente as credenciais completas do cartão.',
        subtitle2: '4.2 Usos Autorizados',
        list1: [
          'Pagamentos em todos os sites comerciais online que aceitem Visa/Mastercard',
          'Pagamentos recorrentes e assinaturas (apenas cartão permanente)',
          'Compras em sites internacionais',
          'Pagamentos sem contato em loja (se adicionado ao Apple Pay/Google Pay)',
        ],
        subtitle3: '4.3 Limitações',
        list2: [
          'Sem saques em caixas eletrônicos',
          'Apresentação física impossível (aluguel de automóveis, alguns hotéis)',
          'Alguns fornecedores podem recusar cartões virtuais',
        ],
      },
      section5: {
        title: '5. SEGURANÇA E PROTEÇÃO',
        subtitle1: '5.1 Segurança Reforçada',
        list1: [
          'As credenciais do seu cartão bancário físico nunca são expostas',
          'Possibilidade de bloquear/desbloquear instantaneamente o cartão',
          'Exclusão definitiva com um clique',
          'Proteção 3D Secure em todas as transações',
          'CVV dinâmico para máxima segurança',
        ],
        subtitle2: '5.2 Obrigações do Titular',
        content2: 'O Titular compromete-se a manter as credenciais do seu Cartão Virtual de forma confidencial e a não comunicá-las a terceiros. Em caso de suspeita de fraude, o Titular deve imediatamente bloquear ou excluir o cartão através da sua área do cliente.',
        subtitle3: '5.3 Garantias e Seguros',
        content3: 'O Cartão Virtual beneficia das mesmas garantias que o seu cartão físico, incluindo proteção contra fraude, seguro de compras e garantia de entrega conforme.',
      },
      section6: {
        title: '6. LIMITES E TETOS',
        content: 'Os limites de pagamento do Cartão Virtual são idênticos aos do seu cartão principal ALTUS:',
        list: [
          'Limite mensal: até 50.000 € conforme seu perfil',
          'Limite por transação: até 10.000 €',
          'Possibilidade de ajustar temporariamente os limites através do aplicativo',
        ],
        content2: 'Para cartões efêmeros, você define o valor máximo e a duração de validade durante a criação.',
      },
      section7: {
        title: '7. TARIFAÇÃO',
        list: [
          'Criação de cartão virtual: Grátis',
          'Taxas de transação na zona euro: 0%',
          'Pagamentos fora da zona euro: 1,5% do valor',
          'Taxa anual: Grátis',
          'Bloqueio/Desbloqueio: Grátis e ilimitado',
        ],
      },
      section8: {
        title: '8. DÉBITO E EXTRATO',
        content: 'Todas as operações realizadas com o Cartão Virtual são debitadas em tempo real da sua conta ALTUS. Aparecem imediatamente no seu histórico de transações e nos seus extratos mensais.',
      },
      section9: {
        title: '9. OPOSIÇÃO E RESCISÃO',
        subtitle1: '9.1 Bloqueio Temporário',
        content1: 'Você pode bloquear seu Cartão Virtual a qualquer momento através da sua área do cliente. O desbloqueio é instantâneo.',
        subtitle2: '9.2 Exclusão Definitiva',
        content2: 'A exclusão de um Cartão Virtual é imediata e irreversível. As assinaturas vinculadas a este cartão serão automaticamente recusadas. É recomendado atualizar suas informações de pagamento junto aos comerciantes concernidos antes da exclusão.',
        subtitle3: '9.3 Em Caso de Fraude',
        content3: 'Em caso de perda ou roubo presumido das credenciais, exclua imediatamente o cartão através do seu aplicativo e entre em contato com nosso atendimento ao cliente no +351 XX XX XX XX (disponível 24h/24, 7d/7).',
      },
      section10: {
        title: '10. RESPONSABILIDADE',
        content: 'A ALTUS não poderá ser responsabilizada em caso de:',
        list: [
          'Recusa de um comerciante em aceitar o Cartão Virtual',
          'Interrupção temporária do serviço para manutenção',
          'Uso fraudulento resultante de negligência do Titular',
          'Disputas comerciais entre o Titular e um comerciante',
        ],
        content2: 'O Titular é inteiramente responsável pelo uso do seu Cartão Virtual e pelas operações realizadas até a notificação de um uso fraudulento.',
      },
      section11: {
        title: '11. DURAÇÃO E MODIFICAÇÃO',
        content: 'Os presentes TCG são celebrados por prazo indeterminado. A ALTUS reserva-se o direito de modificar os presentes TCG a qualquer momento. Qualquer modificação será notificada ao Titular pelo menos 2 meses antes de sua entrada em vigor. A ausência de oposição neste prazo valerá como aceitação.',
      },
      section12: {
        title: '12. RECLAMAÇÕES',
        content: 'Para qualquer reclamação, o Titular pode contatar o atendimento ao cliente ALTUS:',
        list: [
          'Por e-mail: support@altusgroup.com',
          'Por telefone: +351 XX XX XX XX',
          'Através da área do cliente segura',
        ],
        content2: 'Na ausência de resposta satisfatória num prazo de 2 meses, o Titular pode recorrer ao Provedor de Justiça do Banco de Portugal.',
      },
      section13: {
        title: '13. LEI APLICÁVEL E JURISDIÇÃO',
        content: 'Os presentes TCG são regidos pela lei portuguesa. Qualquer litígio relativo à sua interpretação ou execução é da competência exclusiva dos tribunais portugueses.',
      },
      note: 'Ao ativar o seu Cartão Virtual ALTUS, você reconhece ter lido, compreendido e aceitado a totalidade dos presentes Termos e Condições de Uso.',
    },
    processTimeline: {
      title: 'Processo de Financiamento',
      subtitle: 'Do seu pedido ao desembolso dos fundos: um percurso simplificado e rápido',
      step1Title: 'Pedido online',
      step1Duration: '5 minutos',
      step1Description: 'Preencha nosso formulário seguro e carregue seus documentos comprovativos',
      step1Docs: [
        'Registro da empresa com menos de 3 meses',
        'Documento de identidade do gerente',
        'Últimas demonstrações financeiras',
        'Extratos bancários (3 meses)'
      ],
      step2Title: 'Análise do dossiê',
      step2Duration: '24-48h',
      step2Description: 'Nossa equipe de especialistas estuda seu pedido e capacidade de reembolso',
      step2Docs: [
        'Verificação de documentos',
        'Análise financeira',
        'Estudo de solvabilidade',
        'Cálculo de taxa personalizada'
      ],
      step3Title: 'Aprovação preliminar',
      step3Duration: '48h',
      step3Description: 'Recepção da sua oferta de empréstimo detalhada com condições definitivas',
      step3Docs: [
        'Montante aprovado',
        'TAEG e mensalidades',
        'Garantias necessárias',
        'Condições suspensivas'
      ],
      step4Title: 'Desembolso de fundos',
      step4Duration: '7-15 dias',
      step4Description: 'Assinatura eletrônica do contrato e pagamento em 7 a 15 dias após implementação das garantias',
      step4Docs: [
        'Assinatura do contrato de empréstimo',
        'Implementação de garantias',
        'Seguro do mutuário',
        'Transferência de fundos'
      ],
      documentsTitle: 'Documentos a Preparar de Acordo com Seu Projeto',
      creationTitle: 'Criação de empresa',
      creationDocs: [
        'Plano de negócios detalhado',
        'Previsão financeira de 3 anos',
        'Plano de financiamento',
        'CV do gerente e experiência',
        'Comprovante de aporte pessoal'
      ],
      repriseTitle: 'Aquisição de empresa',
      repriseDocs: [
        'Protocolo de acordo de aquisição',
        'Balanços dos últimos 3 exercícios',
        'Avaliação do fundo de comércio',
        'Contrato de arrendamento comercial',
        'Certificado sem ônus'
      ],
      developmentTitle: 'Desenvolvimento',
      developmentDocs: [
        'Balanços dos últimos 3 exercícios',
        'Pacote fiscal completo',
        'Orçamentos de fornecedores (equipamento)',
        'Extratos bancários empresariais (6 meses)',
        'Previsão de atividade'
      ],
      incompleteTitle: 'Dossiê incompleto? Não entre em pânico!',
      incompleteDescription: 'Nossa equipe ajuda você a constituir seu dossiê. Ajudamos você a obter os documentos faltantes.',
      needHelp: 'Precisa de ajuda?',
      averageTime: 'Prazo total médio:',
      averageTimeValue: '2 a 3 semanas desde a apresentação do dossiê até o desembolso dos fundos',
      startApplication: 'Começar meu pedido'
    },
    guaranteesSection: {
      title: 'Garantias e Segurança',
      subtitle: 'Múltiplas opções para garantir seu financiamento e otimizar seus impostos',
      organizationalTitle: 'Garantias Organizacionais',
      organizationalItems: [
        'BPI France (40-70% do empréstimo)',
        'SIAGI (garantia artesãos/comerciantes)',
        'France Active (economia social)',
        'SOCAMA (agricultores)'
      ],
      realTitle: 'Garantias Reais',
      realItems: [
        'Hipoteca sobre bens imobiliários',
        'Penhor do fundo de comércio',
        'Penhor sobre material/equipamento',
        'Privilégio do credor de dinheiro'
      ],
      personalTitle: 'Garantias Pessoais',
      personalItems: [
        'Fiança solidária do gerente',
        'Fiança bancária profissional',
        'Garantia à primeira solicitação',
        'Carta de conforto do grupo'
      ],
      insuranceTitle: 'Seguro do Mutuário',
      insuranceItems: [
        'Morte / PTIA (obrigatório)',
        'Invalidez permanente (IPT/IPP)',
        'Incapacidade temporária (ITT)',
        'Cotizações fiscalmente dedutíveis'
      ],
      taxBenefitsTitle: 'Benefícios Fiscais do Empréstimo Profissional',
      taxBenefit1Title: 'Dedutibilidade de juros',
      taxBenefit1Description: 'Os juros do empréstimo são dedutíveis do resultado fiscal da sua empresa, reduzindo assim seu imposto sobre os lucros.',
      taxBenefit2Title: 'Depreciação acelerada',
      taxBenefit2Description: 'Para equipamentos financiados, possibilidade de depreciação acelerada sob certas condições (equipamento novo, ecológico, etc.).',
      taxBenefit3Title: 'Crédito fiscal',
      taxBenefit3Description: 'Certos investimentos dão direito a créditos fiscais (transição energética, digital, formação).',
      taxBenefit4Title: 'IVA recuperável',
      taxBenefit4Description: 'O IVA sobre juros e taxas de processamento é recuperável para empresas sujeitas.',
      taxAdvice: 'Conselho fiscal: Consulte seu contador para otimizar a dedutibilidade de seus empréstimos e maximizar seus benefícios fiscais.',
      contributionTitle: 'Aporte Pessoal Necessário',
      equipmentPercentage: '10-15%',
      equipmentLabel: 'Equipamento',
      equipmentDescription: 'Material, veículos',
      creationPercentage: '20-30%',
      creationLabel: 'Criação / Aquisição',
      creationDescription: 'Fundo de comércio',
      realEstatePercentage: '20-25%',
      realEstateLabel: 'Imobiliário Profissional',
      realEstateDescription: 'Locais, escritórios',
      contributionDisclaimer: '* Porcentagens indicativas que podem variar de acordo com seu projeto e perfil'
    },
    footer: {
      description: 'Seu parceiro de confiança para todos os seus projetos de financiamento. Soluções de empréstimo adaptadas a particulares e profissionais.',
      phone: '+352 40 63 48',
      email: 'infos@altusfinancegroup.com',
      address: '19 Rue Sigismond, L-2537 Luxembourg',
      hoursTitle: 'Horário de Atendimento',
      hours: {
        weekdays: 'Seg - Sex: 9h00 - 19h00',
        weekend: 'Sáb: 9h00 - 17h00',
        support: 'Suporte responsivo',
      },
      certificationsTitle: 'Certificações e Segurança',
      certifications: [
        'Regulado pela ACPR',
        'Certificado ISO 27001',
        'Conforme RGPD',
        'Segurança SSL/TLS',
        'Membro FBF',
      ],
      productsTitle: 'Nossos Produtos',
      products: {
        personal: 'Empréstimos Pessoais',
        business: 'Empréstimos Empresariais',
        mortgage: 'Empréstimo Hipotecário',
        auto: 'Crédito Auto',
        renovation: 'Empréstimo para Reformas',
      },
      companyTitle: 'Empresa',
      careers: 'Carreiras',
      legalTitle: 'Legal',
      legalLinks: {
        terms: 'Avisos Legais',
        privacy: 'Política de Privacidade',
        cgu: 'CGU',
        cookies: 'Cookies',
        gdpr: 'RGPD',
      },
      helpTitle: 'Ajuda',
      helpLinks: {
        faq: 'FAQ',
        userGuide: 'Guia do Usuário',
        support: 'Suporte ao Cliente',
        simulator: 'Simulador de Empréstimos',
        contactUs: 'Contate-nos',
      },
      copyright: 'Altus Finance Group. Todos os direitos reservados.',
      regulatory: 'Altus Finance Group é uma marca de financiamento aprovada pela ACPR. Organismo de crédito sujeito ao controle do Banco da França.',
      disclaimer: 'Atenção, pedir dinheiro emprestado também custa dinheiro. As informações nesta página são fornecidas apenas para fins informativos e não constituem uma oferta contratual. Todas as solicitações de crédito estão sujeitas a revisão e aceitação do arquivo. Um crédito o compromete e deve ser reembolsado. Verifique sua capacidade de reembolso antes de se comprometer.',
    },
    seo: {
      home: {
        title: 'Altus Finance Group - Professional & Personal Loans | Fast and Competitive Financing',
        description: 'Professional and personal loan solutions with Altus Finance Group. Get fast financing for your business or personal project. Competitive rates, simple and transparent process.',
      },
      about: {
        title: 'About Altus Finance Group - Our Mission and Values | Financing Solutions',
        description: 'Discover Altus Finance Group, leader in professional loan solutions with over 15 years of experience, 15,000+ satisfied clients and €500M in loans granted. Our mission: make financing accessible to all.',
      },
      contact: {
        title: 'Contact Us - Altus Finance Group | Questions About Our Professional Loans',
        description: 'Have a question about our financing solutions? Contact Altus Finance Group. Our team is available to support you with your professional loan project. Fast response guaranteed.',
      },
      howItWorks: {
        title: 'How to Get a Business Loan - Detailed Process | Altus Finance Group',
        description: 'Discover the complete process to obtain a professional loan with Altus Finance Group. From online application to fund release: criteria, required documents and timeframes. Response in 24-48h.',
      },
      forgotPassword: {
        title: 'Forgot Password | Altus Finance Group',
        description: 'Reset your password',
        emailSentTitle: 'Email Sent | Altus Finance Group',
        emailSentDescription: 'A reset link has been sent',
      },
      resetPassword: {
        title: 'Reset Password | Altus Finance Group',
        description: 'Create a new password for your account',
      },
      twoFactorSetup: {
        title: '2FA Setup | Altus Finance Group',
        description: 'Set up two-factor authentication to secure your account',
      },
      verifyTwoFactor: {
        title: '2FA Verification | Altus Finance Group',
        description: 'Two-factor verification',
      },
    },
    businessLoans: {
      title: 'Soluções para Profissionais',
      subtitle: 'Financiamento adaptado às necessidades da sua empresa, microempresa, PME ou autônomo',
      businessLoan: 'Empréstimo Profissional',
      businessLoanDesc: 'Financiamento para seus projetos empresariais, desenvolvimento e fluxo de caixa',
      businessLoanFeatures: ['Resposta em 48h', 'Taxa fixa', 'Pagamento flexível'],
      cashFlowCredit: 'Crédito de Tesouraria',
      cashFlowCreditDesc: 'Solução rápida para gerir suas necessidades de capital de giro',
      cashFlowCreditFeatures: ['Desembolso rápido', 'Sem garantia até €50k', 'Flexível'],
      equipmentFinancing: 'Financiamento de Equipamentos',
      equipmentFinancingDesc: 'Adquira seus equipamentos e materiais profissionais',
      equipmentFinancingFeatures: ['Até 100% de financiamento', 'Opção de leasing', 'Dedutível de impostos'],
      commercialProperty: 'Empréstimo Imobiliário Comercial',
      commercialPropertyDesc: 'Adquira suas instalações, escritórios ou armazéns profissionais',
      commercialPropertyFeatures: ['Longa duração', 'Entrada a partir de 20%', 'Taxa competitiva'],
      lineOfCredit: 'Linha de Crédito',
      lineOfCreditDesc: 'Crédito rotativo para suas necessidades pontuais',
      lineOfCreditFeatures: ['Disponível 24/7', 'Pagamento livre', 'Renovação automática'],
      lineOfCreditDuration: 'Renovável',
      vehicleFleet: 'Crédito Veículo Profissional',
      vehicleFleetDesc: 'Financie sua frota ou veículos comerciais',
      vehicleFleetFeatures: ['Leasing ou crédito clássico', 'Opção de recompra', 'Seguro incluído'],
      smeLoan: 'Empréstimos PME',
      smeLoanDesc: 'Soluções de financiamento dedicadas a PMEs para crescimento, desenvolvimento e investimentos estratégicos',
      smeLoanFeatures: ['Valores altos até €1M', 'Duração flexível 1-10 anos', 'Acompanhamento especializado'],
      amount: 'Valor',
      rate: 'TAE',
      duration: 'Duração',
      months: 'meses',
      years: 'anos',
      features: 'Vantagens',
      learnMore: 'Saiba mais',
      advantagesTitle: 'Vantagens ALTUS Pro',
      advantages: [
        'Consultor dedicado para sua empresa',
        'Estudo personalizado do seu dossiê',
        'Acompanhamento em todo o processo',
        'Pacote de plano de negócios incluído',
      ],
      eligibilityTitle: 'Critérios de Elegibilidade',
      eligibility: [
        'Empresa registrada na França',
        'Ativa há mais de 6 meses',
        'Sem interdição bancária',
        'Demonstrações financeiras atualizadas',
      ],
      rateDisclaimer: 'Taxas indicativas sujeitas a estudo e aceitação de sua solicitação. TAE fixa.',
      simulateLoan: 'Simular meu empréstimo empresarial',
      contactAdvisor: 'Contactar um consultor',
    },
    professionalFAQ: {
      title: 'Perguntas Frequentes',
      subtitle: 'Encontre respostas para suas perguntas rapidamente',
      faqs: [
        {
          question: 'Quais documentos são necessários para uma solicitação de empréstimo empresarial?',
          answer: 'Para profissionais: Registro da empresa com menos de 3 meses, identidade do diretor, demonstrações financeiras dos últimos 3 anos, documentos fiscais completos, extratos bancários comerciais (6 meses), plano de negócios (para startups), previsão financeira. Para particulares: identidade, comprovante de residência, contracheques recentes e aviso fiscal.',
        },
        {
          question: 'Qual contribuição pessoal é necessária para um empréstimo empresarial?',
          answer: 'A contribuição pessoal varia por projeto: 10-15% para compra de equipamentos ou materiais, 20-30% para criação ou aquisição de negócios, 20-25% para imóveis comerciais. Uma contribuição maior pode melhorar suas condições de financiamento e reduzir sua taxa.',
        },
        {
          question: 'Qual é o prazo para obter uma resposta e fundos?',
          answer: 'Aprovação inicial em 24-48h após envio de solicitação completa. Aprovação final em 48h. Desembolso de fundos ocorre 7 a 15 dias após assinatura do contrato e configuração de garantia. Tempo total médio: 2 a 3 semanas.',
        },
        {
          question: 'Quais garantias posso oferecer para meu empréstimo empresarial?',
          answer: 'Várias opções: garantias reais (hipoteca, penhor de fundo de comércio, penhor de material), garantias pessoais (fiança solidária do diretor), organizações de garantia (BPI France 40-70%, SIAGI, France Active, SOCAMA), ou seguro do mutuário (obrigatório: morte/PTIA, opcional: IPT/IPP/ITT).',
        },
        {
          question: 'Os juros do empréstimo são dedutíveis de impostos?',
          answer: 'Sim! Os juros do empréstimo empresarial são totalmente dedutíveis da receita tributável de sua empresa, reduzindo assim seu imposto sobre lucros. Além disso, os prêmios de seguro do mutuário também são dedutíveis. O IVA sobre juros e taxas é recuperável para empresas sujeitas.',
        },
        {
          question: 'Posso obter um empréstimo se minha empresa tiver menos de um ano?',
          answer: 'Sim, financiamos startups empresariais com um plano de negócios sólido e contribuição pessoal de 20-30%. Avaliamos sua experiência profissional, viabilidade do projeto e projeções. Um empréstimo de honra (BPI France, Initiative France) pode fortalecer sua solicitação.',
        },
        {
          question: 'Posso pagar meu empréstimo empresarial antecipadamente?',
          answer: 'Sim, todos os nossos empréstimos empresariais permitem pagamento antecipado. As penalidades são limitadas por lei: máximo de 6 meses de juros ou 3% do capital restante. Alguns contratos preveem pagamento antecipado gratuito após um certo período.',
        },
        {
          question: 'Quais são as taxas atuais para empréstimos empresariais?',
          answer: 'Nossas taxas TAE variam por projeto: Imóveis comerciais 2,9-5,5% (5-25 anos), Equipamentos 3,9-7,5% (2-5 anos), Fundo de comércio 4,7% (5-10 anos), Fluxo de caixa 4,0-9,0% (3-36 meses), Veículos profissionais 3,2-6,5% (2-6 anos). Taxas personalizadas com base em seu perfil e duração.',
        },
        {
          question: 'Como funciona o processo de solicitação online?',
          answer: '1) Preencha nosso formulário online (5 min) e carregue seus documentos. 2) Análise de sua solicitação por nossos especialistas (24-48h). 3) Receba sua aprovação de princípio com condições. 4) Assinatura eletrônica do contrato. 5) Configuração de garantia. 6) Desembolso de fundos para sua conta Altus.',
        },
        {
          question: 'Posso combinar vários tipos de financiamento?',
          answer: 'Sim, você pode combinar várias soluções: empréstimo bancário + leasing para equipamentos, empréstimo empresarial + empréstimo de honra (BPI France) para fortalecer o patrimônio, ou linha de crédito + empréstimo amortizável para combinar flexibilidade e financiamento de longo prazo.',
        },
        {
          question: 'Existem taxas de solicitação e outros encargos?',
          answer: 'Taxas de solicitação: 1-2% do valor para empréstimos empresariais (negociável). Taxas de garantia: variáveis dependendo do tipo (hipoteca, penhor). Seguro do mutuário: 0,10% a 0,40% do capital emprestado por ano. Todas as taxas são detalhadas em sua oferta de empréstimo.',
        },
        {
          question: 'O que acontece se eu tiver dificuldades de pagamento?',
          answer: 'Entre em contato conosco aos primeiros sinais de dificuldade. Podemos explorar: adiamento temporário de pagamento, modulação de pagamento, extensão do prazo do empréstimo ou reorganização de crédito. O apoio preventivo é sempre preferível.',
        },
      ],
      notFoundTitle: 'Não encontra a resposta para sua pergunta?',
      notFoundDesc: 'Nossa equipe de especialistas está disponível de segunda a sexta das 9h às 19h',
      contactUs: 'Entre em contato',
      helpCenter: 'Central de ajuda',
    },
    admin: {
      common: {
        status: {pending: 'Pendente', active: 'Ativo', approved: 'Aprovado', rejected: 'Rejeitado', suspended: 'Suspenso', completed: 'Concluído', signed: 'Assinado', inProgress: 'Em andamento'},
        actions: {approve: 'Aprovar', reject: 'Rejeitar', delete: 'Excluir', suspend: 'Suspender', save: 'Salvar', download: 'Baixar', upload: 'Carregar', send: 'Enviar', edit: 'Editar', cancel: 'Cancelar', disburse: 'Desembolsar'},
        labels: {user: 'Usuário', userName: 'Nome do usuário', userEmail: 'Email do usuário', amount: 'Montante', type: 'Tipo', rate: 'Taxa', duration: 'Duração', status: 'Estado', date: 'Data', createdAt: 'Criado', actions: 'Ações', fees: 'Taxas', progress: 'Progresso', codes: 'Códigos', recipient: 'Destinatário', contract: 'Contrato', months: 'meses', total: 'Total', active: 'ativos', pending: 'pendentes', recent: 'Recentes', all: 'Todos', noData: 'Sem dados', loading: 'Carregando...', error: 'Erro', success: 'Sucesso', balance: 'Saldo', loans: 'Empréstimos'},
        messages: {error: 'Erro', success: 'Sucesso', updated: 'Atualizado', approved: 'Aprovado', rejected: 'Rejeitado', deleted: 'Excluído', disbursed: 'Desembolsado', cannotApprove: 'Não é possível aprovar', cannotReject: 'Não é possível rejeitar', cannotDelete: 'Não é possível excluir', cannotUpdate: 'Não é possível atualizar', loadError: 'Erro ao carregar'},
        empty: {noResults: 'Sem resultados', noData: 'Nenhum dado disponível'},
      },
      dashboard: {title: 'Console de Administração', description: 'Visão geral da plataforma e gestão de usuários', totalUsers: 'Total de Usuários', activeUsers: 'ativos', pendingUsers: 'pendentes', transfers: 'Transferências', transfersPending: 'em andamento', loans: 'Empréstimos', loansActive: 'ativos', totalVolume: 'Volume Total', volumeDescription: 'Transferências totais', recentUsers: 'Usuários Recentes', recentUsersDescription: 'Últimas inscrições', recentTransfers: 'Transferências Recentes', recentTransfersDescription: 'Últimas operações'},
      loans: {title: 'Gestão de Empréstimos', description: 'Gerenciar todas as solicitações de empréstimos da plataforma', allLoans: 'Todos os Empréstimos', allLoansDescription: 'Lista completa de solicitações de empréstimos', loanApproved: 'Empréstimo aprovado', loanApprovedDesc: 'O empréstimo foi aprovado com sucesso. O contrato foi gerado.', loanRejected: 'Empréstimo rejeitado', loanRejectedDesc: 'O empréstimo foi rejeitado com sucesso', loanDeleted: 'Empréstimo excluído', loanDeletedDesc: 'O empréstimo foi excluído com sucesso', fundsDisbursed: 'Fundos desembolsados', fundsDisbursedDesc: 'Os fundos foram desembolsados ​​com sucesso. O usuário foi notificado.', contractGenerated: '📄 Gerado', contractSigned: '✅ Assinado', approveReason: 'Motivo da aprovação', rejectReason: 'Motivo da rejeição', deleteReason: 'Motivo da exclusão', approveDialogDesc: 'Esta ação aprovará o empréstimo de {amount} para {userName} e gerará o contrato.', rejectDialogTitle: 'Rejeitar empréstimo', rejectDialogDesc: 'Esta ação rejeitará permanentemente o empréstimo. O usuário será notificado.', disburseDialogTitle: 'Desembolsar fundos', disburseDialogDesc: 'Esta ação desembolsará {amount} para {userName}. O empréstimo passará para o status ativo e o usuário poderá fazer transferências.', deleteDialogTitle: 'Excluir empréstimo', deleteDialogDesc: 'Esta ação excluirá o empréstimo permanentemente.'},
      transfers: {title: 'Gestão de Transferências', description: 'Aprovar ou suspender solicitações de transferência', allTransfers: 'Todas as Transferências', allTransfersDescription: 'Lista completa de transferências de fundos', transferUpdated: 'Transferência atualizada', transferUpdatedDesc: 'O status da transferência foi atualizado com sucesso', approveDialogTitle: 'Aprovar transferência', approveDialogDesc: 'Esta ação aprovará a transferência e atualizará seu status para "em andamento".', suspendDialogTitle: 'Suspender transferência', suspendDialogDesc: 'Esta ação suspenderá a transferência. Ela poderá ser reativada posteriormente.'},
    },
  },
  it: {
    hero: {
      title: 'Realizza i tuoi progetti con Altus Finance Group',
      subtitle: 'Soluzioni di finanziamento per privati e aziende - Tassi competitivi e processo trasparente',
      cta1: 'Richiedere finanziamenti',
      cta2: 'La mia area',
      learnMore: 'Scopri di più',
      trustIndicator: 'Più di 15.000 clienti soddisfatti si fidano di noi',
      trustBadges: {
        response24h: 'Risposta in 24h',
        swissSecurity: 'Sicurezza bancaria svizzera',
        fastApproval: 'Approvazione rapida',
      },
      calculator: {
        title: 'Calcola il tuo Budget',
        subtitle: 'Ottieni una stima istantanea',
        loanAmount: 'Importo del Prestito',
        duration: 'Durata (mesi)',
        monthlyPayment: 'Pagamento Mensile',
        perMonth: 'al mese',
        applyNow: 'Richiedi Ora',
        disclaimer: 'Richiesta gratuita - Senza impegno - Processo confidenziale',
      },
      slides: [
        {
          title: 'Altus Finance Group',
          subtitle: 'Soluzioni di finanziamento professionali e sicure per accompagnare la vostra crescita.',
        },
        {
          title: 'Esperienza Finanziaria d\'Eccellenza',
          subtitle: 'Soluzioni su misura adattate alle vostre ambizioni imprenditoriali e patrimoniali.',
        },
        {
          title: 'Il Vostro Partner di Fiducia',
          subtitle: 'Assistenza personalizzata e assoluta riservatezza per tutti i vostri progetti di finanziamento.',
        },
        {
          title: 'Soluzioni finanziarie su misura',
          subtitle: 'Accompagnamento personalizzato per realizzare tutti i tuoi progetti professionali e personali',
        },
        {
          title: 'Il tuo partner di fiducia',
          subtitle: 'Più di 15.000 clienti soddisfatti si fidano di noi per le loro esigenze di finanziamento',
        },
        {
          title: 'Finanzia le tue ambizioni',
          subtitle: 'Tassi vantaggiosi e un processo semplice per dare vita ai tuoi progetti',
        },
        {
          title: 'Esperienza e accompagnamento',
          subtitle: 'Un team dedicato per guidarti in ogni fase del tuo progetto',
        },
      ],
    },
    nav: {
      home: 'Inizio',
      products: 'I nostri prestiti',
      tagline: 'Soluzioni Finanziarie Premium',
      more: 'Più',
      moreInfo: 'Più informazioni',
      language: 'Lingua',
      loansMenu: {
        label: 'I nostri prestiti',
        items: [
          {
            title: 'Credito Personale',
            description: 'Finanzia i tuoi progetti personali con tassi competitivi',
            href: '/loans/personal-credit',
          },
          {
            title: 'Rifinanziamento Prestiti',
            description: 'Consolida i tuoi prestiti per semplificare i rimborsi',
            href: '/loans/loan-refinancing',
          },
          {
            title: 'Rifinanziamento Leasing',
            description: 'Ottimizza i tuoi costi rifinanziando il tuo leasing',
            href: '/loans/lease-refinancing',
          },
          {
            title: 'Rifinanziamento Carta di Credito',
            description: 'Riduci i tassi di interesse delle tue carte di credito',
            href: '/loans/credit-card-refinancing',
          },
          {
            title: 'Crediti Vari',
            description: 'Soluzioni di finanziamento adatte a tutte le tue esigenze',
            href: '/products',
          },
          {
            title: 'Prestiti PMI',
            description: 'Finanziamenti aziendali per far crescere la tua impresa',
            href: '/products',
          },
        ],
      },
      howItWorks: 'Come funziona',
      resources: 'Risorse',
      faq: 'FAQ',
      about: 'Chi siamo',
      contact: 'Contatti',
      phone: '+352 40 63 48',
      dashboard: 'Pannello di controllo',
      loans: 'Prestiti',
      myLoans: 'I Miei Prestiti',
      newLoan: 'Richiesta di Prestito',
      contracts: 'Contratti',
      loansSection: 'Prestiti',
      transfers: 'Trasferimenti',
      history: 'Storico',
      settings: 'Impostazioni',
      logout: 'Disconnetti',
      users: 'Utenti',
      documents: 'Documenti KYC',
      reports: 'Rapporti',
    },
    contracts: {
      title: 'Gestione Contratti',
      description: 'Scarica, firma e restituisci i tuoi contratti di prestito in modo sicuro.',
      loanNumber: 'Prestito',
      approvedOn: 'Approvato il',
      actionRequired: 'Azione richiesta',
      step1: '1. Scaricare il contratto',
      step1Description: 'Scarica e leggi attentamente il tuo contratto di prestito.',
      step2: '2. Firmare e restituire',
      step2Description: 'Firma il contratto e restituiscilo in formato PDF.',
      downloadContract: 'Scarica contratto',
      tabPending: 'Da firmare',
      tabReview: 'In verifica',
      tabCompleted: 'Completati',
      inReview: 'In verifica',
      signed: 'Firmato',
      noPendingContracts: 'Nessun contratto in sospeso',
      noPendingContractsDescription: 'Tutti i tuoi contratti sono stati firmati e inviati.',
      noReviewContracts: 'Nessun contratto in verifica',
      noReviewContractsDescription: 'Attualmente non ci sono contratti in attesa di verifica.',
      noCompletedContracts: 'Nessun contratto firmato',
      noCompletedContractsDescription: 'I tuoi contratti firmati appariranno qui.',
      reviewMessage: 'Il tuo contratto firmato è stato ricevuto ed è in fase di verifica dal nostro team. Sarai avvisato una volta che i fondi saranno sbloccati.',
      signedSuccess: 'Contratto firmato e convalidato con successo',
      downloadOriginal: 'Scarica contratto originale',
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
      upcomingRepayments: 'Rimborsi in arrivo',
      yourGlobalBalance: 'Il tuo saldo globale',
      noActiveLoans: 'Nessun prestito attivo',
      noTransfers: 'Nessun trasferimento trovato',
      dataLoadError: 'Errore durante il caricamento dei dati',
      available: 'disponibile',
      notifications: 'Notifiche',
      noNotifications: 'Nessuna notifica',
      viewDetails: 'Vedi dettagli',
      availableOffers: 'Offerte disponibili per te',
      contractToSign: 'Contratto da firmare',
      moreTransfers: 'trasferimento/i aggiuntivo/i',
      goodMorning: 'Buongiorno',
      goodAfternoon: 'Buon pomeriggio',
      goodEvening: 'Buonasera',
      totalBalance: 'Saldo totale',
      newTransfer: 'Nuovo bonifico',
      requestLoan: 'Richiedere un prestito',
      manageAccounts: 'Gestisci conti',
      cashflow: 'Flusso di cassa',
      incomeExpensesSixMonths: 'Entrate e uscite in 6 mesi',
      income: 'Entrate',
      expenses: 'Uscite',
      creditUtilization: 'Utilizzo del credito',
      used: 'utilizzato',
      recentActivity: 'Attività recente',
      latestTransactions: 'Ultime transazioni',
      viewAll: 'Vedi tutto',
      noRecentTransactions: 'Nessuna transazione recente',
      pendingRequests: 'Richieste in sospeso',
      pendingRequestsDescription: 'Le tue richieste di prestito in corso',
      noPendingRequests: 'Nessuna richiesta in sospeso',
      pendingLoan: 'Richiesta in sospeso',
      yourActiveLoans: 'I tuoi prestiti attivi',
      yourActiveLoansDescription: 'Monitora i tuoi rimborsi e le scadenze',
      activeLoan: 'Prestito attivo',
      repaid: 'Rimborsato',
      upcomingDueDates: 'Prossime scadenze',
      amount: 'Importo',
      monthJan: 'Gen',
      monthFeb: 'Feb',
      monthMar: 'Mar',
      monthApr: 'Apr',
      monthMay: 'Mag',
      monthJun: 'Giu',
      serverError: 'Impossibile connettersi al server. Si prega di verificare la connessione e riprovare.',
      diagnosticInfo: 'Informazioni diagnostiche (sviluppo)',
      retry: 'Riprova',
      financeOverview: 'Ecco una panoramica delle tue finanze',
      yourCreditLimit: 'Il tuo limite di credito',
      maximum: 'Massimo',
      activeLoanSingular: 'prestito attivo',
      activeLoansPlural: 'prestiti attivi',
      loanNumber: 'Prestito #',
      progression: 'Progresso',
      nextSixMonths: 'Prossimi 6 mesi',
      repayment: 'Rimborso',
      noUpcomingRepayments: 'Nessun rimborso imminente',
      pendingContracts: 'Contratti in sospeso',
      contractsToSign: 'contratto/i da firmare',
      generatedOn: 'Generato il',
      view: 'Vedi',
    },
    loan: {
      pageTitle: 'I miei prestiti',
      pageDescription: 'Gestisci i tuoi prestiti e simula i tuoi rimborsi',
      tabMyLoans: 'I miei prestiti',
      tabCalculator: 'Calcolatore',
      amount: 'Importo',
      interestRate: 'Tasso di interesse',
      nextPayment: 'Prossimo pagamento',
      viewAll: 'Vedi tutto',
      status: 'Stato',
      downloadContract: 'Scarica il contratto',
      uploadSignedContract: 'Carica il contratto firmato',
      downloading: 'Download...',
      uploading: 'Caricamento...',
      loanNumber: 'Prestito',
      requestSubmitted: 'Richiesta di prestito inviata',
      requestSubmittedDesc: 'La tua richiesta è in attesa di approvazione da parte di un amministratore. Riceverai una notifica non appena verrà elaborata.',
      requestError: 'Impossibile inviare la richiesta di prestito',
      loanApproved: '🎉 Il tuo prestito è stato approvato!',
      approvalInstructions: 'Per finalizzare il tuo prestito, segui questi passaggi:',
      approvalStep1: 'Scarica il tuo contratto di prestito (PDF)',
      approvalStep2: 'Leggilo attentamente e firmalo',
      approvalStep3: 'Restituisci il contratto firmato (PDF) tramite il pulsante qui sotto',
      downloadContractButton: '1. Scarica contratto',
      uploadContractButton: '2. Carica contratto firmato',
      uploading2: 'Caricamento...',
    },
    transfer: {
      pageTitle: 'I miei trasferimenti',
      pageDescription: 'Gestisci e traccia tutti i tuoi trasferimenti di fondi',
      searchPlaceholder: 'Cerca per destinatario o ID...',
      allStatuses: 'Tutti gli stati',
      filterTitle: 'Filtri e ricerca',
      filterDescription: 'Affina la tua lista di trasferimenti',
      noTransfersFound: 'Nessun trasferimento trovato',
      noTransfersMessage: 'Non hai ancora effettuato trasferimenti',
      createTransfer: 'Crea trasferimento',
      newTransfer: 'Nuovo trasferimento',
      requestSubmitted: 'Richiesta inviata',
      documentVerification: 'Verifica documenti',
      complianceCheck: 'Controllo conformità',
      approvalPending: 'Approvazione in sospeso',
      transferComplete: 'Trasferimento completato',
      pending: 'In sospeso',
      inProgress: 'In corso',
      approved: 'Approvato',
      rejected: 'Rifiutato',
      completed: 'Completato',
      suspended: 'Sospeso',
      noAccount: 'Nessun conto registrato',
      validation: 'Validazione',
      validating: 'Validazione...',
      onHold: 'Trasferimento in pausa',
      processing: 'Trasferimento in corso',
      processingComplete: 'Trasferimento completato',
    },
    history: {
      pageTitle: 'Storico transazioni',
      pageDescription: 'Consulta lo storico completo di tutte le tue transazioni',
      totalCredits: 'Totale crediti',
      totalDebits: 'Totale debiti',
      totalTransactions: 'Totale transazioni',
      filterTitle: 'Filtri e ricerca',
      filterDescription: 'Affina il tuo storico transazioni',
      searchPlaceholder: 'Cerca per descrizione o ID...',
      allTypes: 'Tutti i tipi',
      typeCredit: 'Credito',
      typeDebit: 'Debito',
      typeFee: 'Commissione',
      noTransactionsFound: 'Nessuna transazione trovata',
      filterType: 'Tipo',
      noTransactionsFoundFiltered: 'Prova a modificare i criteri di ricerca',
      noTransactionsYet: 'Non hai ancora transazioni',
    },
    fee: {
      type: 'Tipo di commissione',
      reason: 'Motivo',
      amount: 'Importo',
      date: 'Data',
      downloadStatement: 'Scarica l\'estratto conto',
      loanFees: 'Commissioni prestito',
      transferFees: 'Commissioni trasferimento',
      accountFees: 'Commissioni conto',
      feesToPay: 'Commissioni da pagare',
      unpaidFeesCount: 'commissioni non pagate',
      unpaidFeesSingular: 'commissione non pagata',
      pendingValidation: 'In attesa di validazione',
      autoValidatedViaCode: 'Auto-validato tramite codice',
      totalUnpaid: 'Totale non pagato',
      totalOverall: 'Totale generale',
    },
    common: {
      loading: 'Caricamento...',
      error: 'Errore',
      success: 'Successo',
      active: 'Attivo',
      pending: 'In sospeso',
      completed: 'Completato',
      suspended: 'Sospeso',
      saving: 'Salvataggio...',
      cancel: 'Annulla',
      save: 'Salva',
      close: 'Chiudi',
      noData: 'Nessun dato disponibile',
      months: 'mesi',
      years: 'anni',
    },
    settings: {
      title: 'Impostazioni',
      profile: 'Profilo',
      notifications: 'Notifiche',
      security: 'Sicurezza',
      appearance: 'Aspetto',
      personalInfo: 'Informazioni personali',
      updateInfo: 'Aggiorna le tue informazioni del profilo',
      fullName: 'Nome completo',
      email: 'Email',
      phone: 'Telefono',
      company: 'Azienda',
      saveChanges: 'Salva modifiche',
      accountType: 'Tipo di conto',
      yourAccountType: 'Il tuo conto',
      individualAccount: 'Conto Privato',
      businessAccount: 'Conto Aziendale',
      individualAccess: 'Accesso ai servizi di finanziamento personale',
      businessAccess: 'Accesso completo ai servizi di finanziamento aziendale',
      verified: 'Verificato',
      notificationPreferences: 'Preferenze notifiche',
      chooseNotifications: 'Scegli come desideri essere notificato',
      emailAlerts: 'Avvisi via email',
      emailAlertsDesc: 'Ricevi avvisi importanti via email',
      transferUpdates: 'Aggiornamenti trasferimenti',
      transferUpdatesDesc: 'Notifiche sullo stato dei tuoi trasferimenti',
      loanReminders: 'Promemoria pagamenti',
      loanRemindersDesc: 'Promemoria per le scadenze del tuo prestito',
      marketingEmails: 'Email marketing',
      marketingEmailsDesc: 'Ricevi notizie e offerte speciali',
      savePreferences: 'Salva preferenze',
      changePassword: 'Cambia password',
      updatePassword: 'Aggiornamento della tua password',
      currentPassword: 'Password attuale',
      newPassword: 'Nuova password',
      confirmNewPassword: 'Conferma nuova password',
      themeSettings: 'Impostazioni tema',
      chooseTheme: 'Seleziona il tuo tema preferito',
      lightMode: 'Modalità chiara',
      darkMode: 'Modalità scura',
      systemMode: 'Sistema',
      languageSettings: 'Impostazioni lingua',
      chooseLanguage: 'Seleziona la tua lingua',
      changePhoto: 'Cambia foto',
      uploading: 'Caricamento...',
      twoFactorAuth: 'Autenticazione a due fattori',
      twoFactorAuthDesc: 'Aggiungi un ulteriore livello di sicurezza al tuo account',
      twoFactorEnabled: 'Autenticazione a due fattori attivata',
      enable2FA: 'Attiva 2FA',
      twoFactorEnabledDesc: 'Il tuo account è protetto dall\'autenticazione a due fattori',
      twoFactorDisabledDesc: 'Proteggi il tuo account con la verifica in due passaggi tramite Google Authenticator',
      disable: 'Disattiva',
      configure: 'Configura',
      enabled: 'Attivato',
      twoFactorActiveMessage: 'Il tuo account è protetto con Google Authenticator. Sarà richiesto un codice ad ogni accesso.',
      theme: 'Tema',
      themeDesc: 'Scegli il tuo tema preferito',
      light: 'Chiaro',
      dark: 'Scuro',
      languageLabel: 'Lingua',
      languageDesc: 'Seleziona la tua lingua',
      disable2FASuccess: 'Successo',
      disable2FASuccessDesc: '2FA disattivato con successo',
      disable2FAError: 'Errore nella disattivazione del 2FA',
    },
    messages: {
      profileUpdated: 'Profilo aggiornato',
      profileUpdatedDesc: 'Le tue informazioni sono state salvate con successo.',
      preferencesUpdated: 'Preferenze salvate',
      preferencesUpdatedDesc: 'Le tue preferenze di notifica sono state aggiornate.',
      passwordChanged: 'Password modificata',
      passwordChangedDesc: 'La tua password è stata modificata con successo.',
      passwordMismatch: 'Le password non corrispondono',
      errorUpdatingProfile: 'Errore durante l\'aggiornamento del profilo',
      errorUpdatingPreferences: 'Errore durante l\'aggiornamento delle preferenze',
      errorChangingPassword: 'Errore durante il cambio password',
      avatarUpdated: 'Foto profilo aggiornata',
      avatarUpdatedDesc: 'La tua foto profilo è stata aggiornata con successo.',
      errorUploadingAvatar: 'Errore durante il caricamento della foto',
      invalidFileType: 'Tipo di file non autorizzato. Sono accettate solo immagini JPEG, PNG e WebP.',
      fileTooLarge: 'Il file è troppo grande (max 5MB).',
    },
    about: {
      title: 'Chi siamo - Altus Finance Group',
      subtitle: 'Il tuo partner di fiducia per il finanziamento di privati e aziende',
      mission: 'La nostra missione',
      missionText: 'In Altus Finance Group, democratizziamo l\'accesso al finanziamento per tutti. Che tu sia un privato con un progetto personale o un\'azienda in sviluppo, offriamo soluzioni di credito moderne, trasparenti e adattate alle tue esigenze. La nostra tecnologia all\'avanguardia ci permette di analizzare rapidamente la tua situazione e proporti offerte personalizzate con tassi competitivi. Crediamo nella totale trasparenza: nessuna commissione nascosta, condizioni chiare e accompagnamento in ogni fase.',
      stats: {
        clients: 'Clienti attivi',
        loansProvided: 'Prestiti erogati',
        successRate: 'Tasso di soddisfazione',
        yearsExperience: 'Anni di esperienza',
      },
    },
    howItWorks: {
      ...howItWorksEN,
      title: 'Come funziona',
      subtitle: 'Un processo 100% digitale ultrarapido in 4 semplici passaggi',
      step1Title: 'Registrazione - 3 minuti',
      step1Desc: 'Crea il tuo account Altus Finance Group in pochi minuti. Inserisci le tue informazioni personali o aziendali in modo sicuro. La verifica d\'identità istantanea (KYC) garantisce la sicurezza del tuo account.',
      step1Duration: '3 min',
      step2Title: 'Login - Accedi al tuo pannello',
      step2Desc: 'Accedi al tuo pannello cliente personale sicuro. Troverai tutti gli strumenti necessari per gestire le tue finanze e inviare richieste di prestito. Accesso 24/7 da qualsiasi dispositivo.',
      step2Duration: 'Istantaneo',
      step3Title: 'Richiesta e analisi - Risposta istantanea',
      step3Desc: 'Invia la tua richiesta di prestito direttamente dal tuo pannello utente. Compila il modulo con l\'importo desiderato e carica i tuoi documenti giustificativi. Grazie alla nostra tecnologia di analisi in tempo reale, ricevi una risposta entro minuti fino a 24 ore massimo.',
      step3Duration: '< 24h',
      step4Title: 'Sblocco immediato - Fondi disponibili istantaneamente',
      step4Desc: 'Una volta approvata la tua richiesta, firma elettronicamente il tuo contratto dal tuo pannello. I fondi vengono sbloccati immediatamente sul tuo conto sicuro Altus Finance Group. Puoi quindi trasferirli sul tuo conto bancario personale o aziendale istantaneamente e senza costi aggiuntivi.',
      step4Duration: 'Immediato',
      averageTimeValue: '24 ore massimo dalla presentazione della richiesta allo sblocco dei fondi',
    },
    products: {
      title: 'Le nostre soluzioni di prestito',
      subtitle: 'Prodotti adattati alle tue esigenze - Privati e Aziende',
      businessTitle: 'Prestiti Aziendali',
      businessSubtitle: 'Prodotti adattati alle tue esigenze professionali',
      termLoans: 'Prestiti a Termine Aziendali',
      termLoansDesc: 'Finanziamento a medio e lungo termine per i tuoi investimenti strategici: sviluppo, acquisizione, espansione. Da €10.000 a €500.000 da 1 a 7 anni. Tassi fissi dal 3,5% all\'8,5% APR secondo profilo. Rimborso anticipato senza penale.',
      lineOfCredit: 'Linea di Credito Rinnovabile',
      lineOfCreditDesc: 'Credito flessibile per gestire la tua tesoreria e far fronte agli imprevisti. Da €5.000 a €100.000. Tassi dal 4,0% al 9,0% APR. Paghi interessi solo sulle somme utilizzate. Ricostituzione automatica del capitale disponibile.',
      equipmentFinancing: 'Finanziamento Attrezzature',
      equipmentFinancingDesc: 'Finanzia le tue attrezzature professionali, veicoli commerciali, macchinari, strumenti. Da €20.000 a €300.000 da 2 a 5 anni. Tassi dal 3,9% al 7,5% APR. L\'attrezzatura può servire come garanzia, facilitando l\'ottenimento del prestito.',
      invoiceFactoring: 'Factoring / Cessione crediti',
      invoiceFactoringDesc: 'Trasforma le tue fatture clienti in liquidità immediata per migliorare il tuo cash-flow. Anticipo fino al 90% dell\'importo delle fatture entro 24-48h. Costi dall\'1% al 3% secondo volume e scadenza. Ideale per aziende B2B.',
    },
    contact: {
      title: 'Contattaci',
      subtitle: 'Il nostro team è in ascolto',
      name: 'Nome completo',
      email: 'Email',
      phone: 'Telefono',
      message: 'Messaggio',
      send: 'Invia',
      success: 'Messaggio inviato con successo',
      error: 'Errore durante l\'invio del messaggio',
    },
    resources: {
      title: 'Risorse',
      subtitle: 'Tutte le informazioni per accompagnarti nel tuo progetto',
      faqTitle: 'Domande frequenti',
      faqs: [
        {
          question: 'Quali documenti sono necessari per una richiesta di prestito?',
          answer: 'Per i privati: documento d\'identità, attestazione di residenza, ultimi cedolini paga (3 mesi), avviso fiscale. Per le aziende: Kbis di meno di 3 mesi, bilanci e conti economici (ultimi 2 esercizi), estratti conto bancari aziendali (3-6 mesi), documento d\'identità del dirigente. Tutti i documenti sono scaricabili direttamente online in modo sicuro.',
        },
        {
          question: 'Quanto tempo richiede il processo di approvazione?',
          answer: 'Grazie alla nostra tecnologia di analisi in tempo reale, ricevi una risposta di principio da alcuni minuti a 24 ore massimo. Una volta approvato, i fondi vengono immediatamente sbloccati sul tuo conto sicuro Altus Finance Group. Puoi quindi trasferirli sul tuo conto bancario personale o aziendale quando vuoi, istantaneamente e senza costi aggiuntivi.',
        },
        {
          question: 'Qual è l\'importo minimo e massimo che posso prendere in prestito?',
          answer: 'Prestiti personali: da €1.000 a €75.000. Prestiti immobiliari: da €50.000 a €500.000. Prestiti aziendali a termine: da €10.000 a €500.000. Linee di credito: da €5.000 a €100.000. L\'importo esatto dipende dalla tua capacità di rimborso calcolata secondo i tuoi redditi, oneri e storia creditizia.',
        },
        {
          question: 'Posso rimborsare il mio prestito anticipatamente?',
          answer: 'Sì, tutti i nostri prestiti permettono il rimborso anticipato senza penale né costi nascosti. Puoi rimborsare parzialmente o totalmente il tuo credito in qualsiasi momento dalla tua area cliente. Questo riduce automaticamente il costo totale degli interessi. Mantieni così il controllo totale sul tuo credito.',
        },
        {
          question: 'Quali sono i criteri di ammissibilità per un prestito?',
          answer: 'Privati: essere maggiorenne, risiedere in Italia, avere redditi regolari e un tasso di indebitamento <40%. Aziende: impresa attiva da 6+ mesi, fatturato mensile minimo di €15.000, nessun mancato pagamento recente. Il punteggio di credito viene verificato automaticamente tramite le agenzie di credito. I dossier sono studiati caso per caso.',
        },
        {
          question: 'Come vengono calcolati i tassi di interesse?',
          answer: 'I nostri tassi sono calcolati da un algoritmo che analizza diversi fattori: il tuo punteggio di credito, la durata del prestito, l\'importo preso in prestito, i tuoi redditi e oneri, la tua storia di rimborso e la salute finanziaria (per le aziende). I tassi variano dallo 0,5% al 9,0% APR secondo il profilo e il tipo di prestito. I nostri tassi sono tra i più competitivi del mercato grazie alla nostra rete di partner finanziari.',
        },
        {
          question: 'Ci sono costi di pratica o costi nascosti?',
          answer: 'Totale trasparenza: mostriamo tutti i costi fin dalla simulazione. Costi di pratica: da €0 a €150 secondo il tipo di prestito. Nessun costo di rimborso anticipato. Nessun costo mensile di gestione. Il TAEG (Tasso Annuo Effettivo Globale) include tutti i costi per un facile confronto con altre offerte.',
        },
        {
          question: 'Come calcolare la mia capacità di prestito?',
          answer: 'La tua capacità di prestito dipende dal tuo tasso di indebitamento che non deve superare il 40% dei tuoi redditi netti. Formula: (Redditi mensili × 0,40) - Oneri di credito esistenti = Rata massima disponibile. Il nostro simulatore online calcola automaticamente la tua capacità di prestito e ti propone importi adatti. Puoi regolare la durata per modulare le rate.',
        },
        {
          question: 'Posso ottenere un prestito con un punteggio di credito basso?',
          answer: 'Sì, accettiamo profili vari. La nostra tecnologia di valutazione analizza anche dati alternativi oltre al semplice punteggio di credito: stabilità professionale, redditi ricorrenti, risparmi, storia bancaria. Punteggi accettati da 500-560 per certi prodotti. Anche con una storia imperfetta, puoi ottenere un prestito, ma i tassi saranno adeguati al rischio.',
        },
        {
          question: 'Cosa succede se non posso rimborsare una rata?',
          answer: 'Contattaci immediatamente. Proponiamo diverse soluzioni: rinvio di rata (franchigia temporanea), riduzione delle scadenze, riscadenziamento del prestito. Possono applicarsi penalità di ritardo ma privilegiamo sempre il dialogo per trovare una soluzione adatta alla tua situazione. Un accompagnamento personalizzato è disponibile in caso di difficoltà.',
        },
      ],
    },
    legal: {
      termsTitle: 'Condizioni d\'uso',
      privacyTitle: 'Politica sulla privacy',
      lastUpdated: 'Ultimo aggiornamento: Gennaio 2025',
      terms: {
        section1Title: '1. Accettazione delle condizioni',
        section1Content: 'Accedendo e utilizzando i servizi di Altus Finance Group, accetti e accetti di essere vincolato dai termini e dalle disposizioni di questo accordo.',
        section2Title: '2. Licenza d\'uso',
        section2Content: 'L\'autorizzazione è concessa per accedere temporaneamente ai materiali (informazioni o software) sulla piattaforma di Altus Finance Group solo per visualizzazione personale e non commerciale.',
        section3Title: '3. Contratto di prestito',
        section3Content: 'Tutti i prestiti sono soggetti all\'approvazione del credito. I termini e le condizioni saranno forniti in un contratto di prestito separato all\'approvazione della tua richiesta.',
        section4Title: '4. Dichiarazioni e garanzie',
        section4Content: 'Dichiari e garantisci che tutte le informazioni fornite nella tua richiesta di prestito sono accurate, complete e aggiornate.',
        section5Title: '5. Limitazione di responsabilità',
        section5Content: 'In nessun caso Altus Finance Group o i suoi fornitori saranno responsabili di qualsiasi danno derivante dall\'uso o dall\'impossibilità di utilizzare i materiali sulla piattaforma di Altus Finance Group.',
        section6Title: '6. Modifiche',
        section6Content: 'Altus Finance Group può rivedere queste condizioni d\'uso in qualsiasi momento senza preavviso. Utilizzando questa piattaforma, accetti di essere vincolato dalla versione attuale di queste condizioni.',
      },
      privacy: {
        section1Title: '1. Informazioni che raccogliamo',
        section1Content: 'Raccogliamo le informazioni che ci fornisci direttamente quando crei un account, richiedi un prestito o comunichi con noi. Questo può includere il tuo nome, indirizzo email, numero di telefono, informazioni aziendali e dati finanziari.',
        section2Title: '2. Come utilizziamo le tue informazioni',
        section2Content: 'Utilizziamo le informazioni che raccogliamo per:',
        section2List: [
          'Elaborare le tue richieste di prestito',
          'Comunicare con te sui nostri servizi',
          'Migliorare la nostra piattaforma e i nostri servizi',
          'Conformarsi ai requisiti legali e regolamentari',
        ],
        section3Title: '3. Condivisione delle informazioni',
        section3Content: 'Non vendiamo le tue informazioni personali. Possiamo condividere le tue informazioni con:',
        section3List: [
          'Agenzie di credito per la valutazione del credito',
          'Fornitori di servizi che ci assistono nelle nostre operazioni',
          'Regolatori e forze dell\'ordine quando richiesto dalla legge',
        ],
        section4Title: '4. Sicurezza dei dati',
        section4Content: 'Implementiamo misure tecniche e organizzative appropriate per proteggere le tue informazioni personali contro l\'accesso, la modifica, la divulgazione o la distruzione non autorizzati.',
        section5Title: '5. I tuoi diritti',
        section5Content: 'Hai il diritto di accedere, correggere o eliminare le tue informazioni personali. Puoi anche opporti a determinati trattamenti dei tuoi dati.',
        section6Title: '6. Cookie',
        section6Content: 'Utilizziamo cookie e tecnologie di tracciamento simili per migliorare la tua esperienza sulla nostra piattaforma. Puoi controllare i cookie tramite le impostazioni del tuo browser.',
        section7Title: '7. Contattaci',
        section7Content: 'Se hai domande su questa politica sulla privacy, contattaci a privacy@altus-group.com',
      },
    },
    individualLoans: {
      title: 'Prestiti per privati',
      subtitle: 'Soluzioni di finanziamento adattate a tutti i tuoi progetti di vita',
      personalLoan: 'Prestito personale',
      personalLoanDesc: 'Finanziamento flessibile per tutti i tuoi progetti senza giustificativo d\'uso: viaggio, matrimonio, acquisto attrezzature. Da €1.000 a €75.000 da 12 a 84 mesi. Tassi TAEG dal 2,9% al 7,9% secondo profilo. Risposta in 48h, fondi in 5 giorni.',
      mortgageLoan: 'Prestito immobiliare',
      mortgageLoanDesc: 'Finanzia la tua residenza principale, secondaria o investimento locativo. Da €50.000 a €500.000 da 10 a 25 anni. Tassi fissi o variabili a partire dall\'1,5% TAEG. Fino al 110% di apporto includendo spese notarili. Simulazione personalizzata gratuita.',
      autoLoan: 'Credito Auto / Moto',
      autoLoanDesc: 'Finanzia il tuo veicolo nuovo o usato, auto o moto. Da €3.000 a €75.000 da 12 a 84 mesi. Tassi TAEG dall\'1,9% al 5,9%. Possibilità di includere l\'assicurazione e gli accessori. Risposta immediata presso il tuo concessionario partner.',
      studentLoan: 'Prestito studenti',
      studentLoanDesc: 'Finanzia i tuoi studi superiori, tasse scolastiche, alloggio studenti. Da €1.000 a €50.000. Differimento di rimborso totale fino alla fine degli studi. Tassi preferenziali dall\'1,5% TAEG. Senza garanzia genitori a condizioni.',
      greenLoan: 'Prestito verde / Eco-PTZ',
      greenLoanDesc: 'Finanzia lavori di ristrutturazione energetica: isolamento, pompa di calore, pannelli solari. Da €7.000 a €50.000. Tassi agevolati dallo 0,5% TAEG. Ammissibile agli aiuti statali. Fino a €30.000 senza apporto.',
      renovationLoan: 'Prestito lavori',
      renovationLoanDesc: 'Rinnova, amplia, abbellisci la tua casa. Da €1.500 a €75.000 da 12 a 120 mesi. Tassi TAEG dal 2,5% al 6,9%. Senza garanzia ipotecaria fino a €50.000. Sblocco progressivo secondo avanzamento dei lavori possibile.',
      miscellaneousCredit: 'Crediti Diversi',
      miscellaneousCreditDesc: 'Finanzia tutti i tuoi progetti personali: eventi, attrezzature, tempo libero, salute, benessere. Da €500 a €50.000 da 6 a 96 mesi. Tassi TAEG dal 2,9% all\'8,9%. Procedura semplificata, risposta rapida in 24h. Erogazione fondi in 3-5 giorni.',
      amount: 'Importo',
      rate: 'Tasso TAEG',
      duration: 'Durata',
      rateDisclaimer: 'Tassi indicativi soggetti a condizioni di ammissibilità. TAEG fisso. Un credito ti impegna e deve essere rimborsato. Verifica le tue capacità di rimborso prima di impegnarti.',
      compareLoans: 'Confronta tutti i prestiti',
    },
    features: {
      title: 'Perché scegliere Altus Finance Group?',
      subtitle: 'Una piattaforma di prestito moderna e trasparente che mette le tue esigenze al centro',
      security: 'Sicurezza bancaria di livello aziendale',
      securityDesc: 'Crittografia AES-256, conformità GDPR, certificazione SOC 2 Type II e ISO 27001. I tuoi dati finanziari sono protetti con gli stessi standard delle grandi banche. Autenticazione multi-fattore e monitoraggio 24/7 contro le frodi.',
      fast: 'Risposta express - Minuti a 24h',
      fastDesc: 'La nostra tecnologia AI analizza il tuo dossier in tempo reale. Risposta di approvazione da minuti a 24 ore massimo. Fondi immediatamente sbloccati sul tuo conto sicuro Altus. Poi trasferisci sul tuo conto bancario quando vuoi. 100% digitale, zero burocrazia.',
      competitive: 'Tra i tassi più bassi del mercato',
      competitiveDesc: 'Grazie alla nostra rete di 50+ partner finanziari e tecnologia di valutazione ottimizzata, negoziamo i migliori tassi per te: dallo 0,5% al 9,0% APR secondo il profilo e il tipo di prestito. Confronto automatico per garantire la migliore offerta.',
      flexible: 'Massima flessibilità senza penale',
      flexibleDesc: 'Rimborso anticipato gratuito in qualsiasi momento. Possibile modulazione delle rate secondo la tua situazione. Rinvio di rata in caso di difficoltà. Scelta della data di addebito. Mantieni il controllo totale del tuo credito.',
    },
    stats: {
      clients: 'Clienti soddisfatti',
      funded: 'Prestiti erogati',
      satisfaction: 'Tasso di soddisfazione',
      years: 'Anni di esperienza',
    },
    partners: {
      title: 'I Nostri Partner Finanziari',
      subtitle: 'Collaboriamo con un ampio network di banche e istituzioni finanziarie di primo livello per garantirti le migliori condizioni',
      banksNetwork: 'Banche Partner',
      loansFunded: 'Prestiti Finanziati',
      yearsExperience: 'Anni di Esperienza',
      satisfactionRate: 'Tasso di Soddisfazione',
      networkTitle: 'Una Rete di Partner di Fiducia',
      benefits: [
        'Accesso a oltre 50 istituzioni finanziarie per confrontare le migliori offerte',
        'Negoziazione di tassi preferenziali grazie al nostro volume d\'affari',
        'Competenza riconosciuta nel brokeraggio di credito da oltre 25 anni'
      ]
    },
    testimonials: {
      title: 'Cosa dicono i nostri clienti',
      subtitle: 'Più di 15.000 privati e professionisti si fidano di noi',
      reviews: [
        { name: 'Marco Rossi', role: 'Imprenditore', company: 'Ristorante Sapore', text: 'Altus Finance Group mi ha permesso di ottenere un finanziamento rapido per sviluppare la mia attività. Il processo è stato semplice e trasparente, ho ricevuto i fondi in meno di una settimana.', rating: 5 },
        { name: 'Laura Bianchi', role: 'Privato', company: 'Proprietaria', text: 'Servizio eccellente per il mio prestito immobiliare. I consulenti sono attenti e hanno trovato il miglior tasso per me. Consiglio vivamente i loro servizi.', rating: 5 },
        { name: 'Giuseppe Verdi', role: 'Direttore Finanziario', company: 'Tech Solutions Srl', text: 'Grazie ad Altus Finance Group abbiamo potuto finanziare l\'acquisto di nuove attrezzature. La flessibilità di pagamento e il tasso competitivo hanno fatto la differenza.', rating: 5 },
        { name: 'Sofia Conti', role: 'Artigiana', company: 'Panetteria Tradizionale', text: 'Un servizio professionale ed efficiente. Ho ottenuto il mio prestito lavori senza complicazioni. Il team mi ha accompagnata in ogni fase.', rating: 5 },
        { name: 'Luca Ferrari', role: 'Commerciante', company: 'Moda & Accessori', text: 'Sono molto soddisfatto del finanziamento ottenuto per l\'espansione del mio negozio. Altus Finance Group capisce davvero le esigenze degli imprenditori.', rating: 5 },
        { name: 'Alessandro Romano', role: 'Privato', company: 'Padre di famiglia', text: 'Il mio credito auto è stato approvato rapidamente con un ottimo tasso. Il simulatore online mi ha permesso di confrontare facilmente le offerte.', rating: 5 },
        { name: 'Chiara Esposito', role: 'Infermiera', company: 'Ospedale San Giuseppe', text: 'Ho potuto finanziare i miei lavori di ristrutturazione energetica grazie al loro prestito verde. I tassi agevolati e i consigli sugli aiuti statali mi hanno aiutato molto.', rating: 5 },
        { name: 'Roberto Colombo', role: 'Gestore', company: 'Ristorante Il Gourmet', text: 'La linea di credito revolving ha salvato il mio flusso di cassa durante il periodo difficile. Massima flessibilità e rimborso anticipato senza spese.', rating: 5 },
        { name: 'Francesca Ricci', role: 'Architetto', company: 'Ricci & Associati', text: 'Processo 100% digitale e rapido. Ho ottenuto il mio prestito professionale in 3 giorni. L\'interfaccia è intuitiva e chiara.', rating: 5 },
        { name: 'Matteo Moretti', role: 'Studente', company: 'Scuola di Business', text: 'Il prestito studenti con pagamento differito mi ha permesso di finanziare i miei studi senza stress. Tassi preferenziali e senza garanzia dei genitori.', rating: 5 },
        { name: 'Valentina Greco', role: 'Farmacista', company: 'Farmacia Centrale', text: 'Finanziamento di attrezzature mediche approvato in 48h. Il servizio clienti è reattivo e professionale. Molto soddisfatta dell\'accompagnamento.', rating: 5 },
        { name: 'Davide Galli', role: 'Sviluppatore', company: 'Startup Tech', text: 'Prestito personale per il mio progetto di formazione professionale. Nessun giustificativo d\'uso richiesto, processo trasparente e rapido.', rating: 5 },
        { name: 'Elena Vitale', role: 'Professoressa', company: 'Liceo Dante', text: 'Il mio prestito immobiliare è stato approvato con un tasso molto competitivo. La simulazione online mi ha aiutato a confrontare e scegliere la migliore offerta.', rating: 5 },
        { name: 'Andrea Santoro', role: 'Imprenditore', company: 'Startup Innovativa', text: 'Il finanziamento di attrezzature mi ha permesso di acquistare le macchine necessarie per lanciare la mia produzione. Rimborso adattato al mio flusso di cassa.', rating: 5 },
        { name: 'Giulia Mancini', role: 'Avvocato', company: 'Studio Mancini', text: 'Processo di approvazione ultra-rapido grazie alla tecnologia IA. Ho ricevuto una risposta di principio in meno di 24 ore. Impressionante!', rating: 5 },
        { name: 'Simone Fontana', role: 'Idraulico', company: 'Fontana Idraulica', text: 'Prestito lavori per rinnovare il mio locale professionale. Sblocco progressivo secondo avanzamento, è esattamente quello che mi serviva.', rating: 5 },
        { name: 'Paola Marchetti', role: 'Designer', company: 'Studio Creativo', text: 'La linea di credito mi ha dato la flessibilità necessaria per gestire le variazioni di tesoreria della mia attività. Pago solo per quello che uso.', rating: 5 },
        { name: 'Stefano Ferretti', role: 'Medico', company: 'Studio Medico', text: 'Finanziamento della mia installazione in studio privato. Importo importante approvato rapidamente con un tasso fisso vantaggioso. Molto professionale.', rating: 5 },
        { name: 'Alessia De Luca', role: 'Fiorista', company: 'Fiori & Natura', text: 'Prestito professionale per sviluppare il mio negozio online. Il processo è stato semplice e il team mi ha accompagnato in ogni fase. Grazie!', rating: 5 },
        { name: 'Lorenzo Barbieri', role: 'Ingegnere', company: 'Consulente Indipendente', text: 'Credito auto per il mio veicolo professionale. Risposta immediata e fondi trasferiti in 3 giorni. Servizio impeccabile e tasso competitivo.', rating: 5 },
        { name: 'Martina Marini', role: 'Estetista', company: 'Istituto Bellezza', text: 'Finanziamento per l\'acquisto di nuove attrezzature estetiche. Nessuna spesa nascosta, tutto è trasparente dall\'inizio. Consiglio vivamente.', rating: 5 },
        { name: 'Federico Serra', role: 'Chef', company: 'Bistrot Moderno', text: 'Factoring per migliorare il mio flusso di cassa. Trasformazione delle mie fatture in liquidità in 24h. Soluzione perfetta per la mia attività B2B.', rating: 5 },
      ],
    },
    auth: {
      title: 'ALTUS',
      subtitle: 'Il tuo partner di fiducia per il finanziamento',
      loginTab: 'Accedi',
      signupTab: 'Registrati',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Conferma password',
      fullName: 'Nome completo',
      phone: 'Telefono',
      companyName: 'Nome azienda',
      siret: 'Partita IVA',
      accountType: 'Tipo di conto',
      personal: 'Personale',
      personalLoan: 'Prestito personale',
      business: 'Azienda/Professionale',
      businessLoan: 'Prestito aziendale',
      login: 'Accedi',
      loggingIn: 'Accesso in corso...',
      signup: 'Crea il mio account',
      signingUp: 'Registrazione in corso...',
      backToHome: 'Torna alla home',
      loginSuccess: 'Accesso riuscito!',
      loginSuccessDesc: 'Benvenuto su ALTUS',
      signupSuccess: 'Registrazione riuscita!',
      signupSuccessDesc: 'Un\'email di verifica è stata inviata al tuo indirizzo.',
      loginError: 'Errore di accesso',
      loginErrorDesc: 'Email o password errati',
      signupError: 'Errore',
      signupErrorDesc: 'Si è verificato un errore durante la registrazione',
      emailNotVerified: 'Email non verificata',
      emailPlaceholder: 'mario.rossi@esempio.it',
      passwordPlaceholder: '••••••••',
      fullNamePlaceholder: 'Mario Rossi',
      phonePlaceholder: '+39 333 1234567',
      companyNamePlaceholder: 'Azienda S.r.l.',
      siretPlaceholder: '12345678901',
      required: 'obbligatorio',
      companyRequired: 'Il nome dell\'azienda è obbligatorio per i conti aziendali',
      emailInvalid: 'Email non valida',
      passwordMinLength: 'La password deve contenere almeno 12 caratteri',
      passwordUppercase: 'La password deve contenere almeno una lettera maiuscola',
      passwordLowercase: 'La password deve contenere almeno una lettera minuscola',
      passwordNumber: 'La password deve contenere almeno un numero',
      passwordSpecial: 'La password deve contenere almeno un carattere speciale',
      passwordMatch: 'Le password devono corrispondere',
      invalidOtp: 'Codice non valido o scaduto',
      sessionExpired: 'Sessione scaduta',
      sessionExpiredMessage: 'La tua sessione è scaduta. Per favore, accedi di nuovo.',
      accessDenied: 'Accesso negato',
      authenticationRequired: 'Autenticazione richiesta',
      verificationError: 'Errore durante la verifica',
      verificationInProgress: 'Verifica in corso',
      emailVerified: 'Email verificato',
      accountActiveAutoLogin: 'Il tuo account è ora attivo. Sei automaticamente connesso e sarai reindirizzato alla tua dashboard tra pochi secondi...',
      linkExpiredInvalid: 'Il link di verifica potrebbe essere scaduto o non valido.',
      tokenMissing: 'Token di verifica mancante',
      pleaseTwoFactorCode: 'Inserisci il tuo codice di autenticazione a due fattori',
      verificationCodeSent: 'Codice di verifica inviato',
      twoFactorAuth: 'Autenticazione a due fattori',
      enterOtpCode: 'Inserisci il codice a 6 cifre inviato alla tua email',
      otpExpiresIn: 'Il codice scade tra 10 minuti',
      backToLogin: 'Torna al login',
    },
    errors: {
      sessionExpired: 'Sessione scaduta',
      accessDenied: 'Accesso negato',
      authRequired: 'Autenticazione richiesta',
      networkError: 'Errore di rete. Riprova.',
      unexpectedError: 'Si è verificato un errore imprevisto',
      verificationFailed: 'Verifica fallita',
    },
    bankCard: {
      title: 'Carta bancaria Premium Altus',
      subtitle: 'Richiedi la tua carta esclusiva e approfitta di vantaggi eccezionali',
      learnMore: 'Scopri di più',
      viewDetails: 'Visualizza dettagli',
      orderNow: 'Richiedi ora',
      orderCard: 'Richiedi carta',
      orderSuccess: 'Ordine carta virtuale',
      orderSuccessDesc: 'La tua carta virtuale è in attivazione. Riceverai i dettagli via email a breve.',
      modalTitle: 'Carta bancaria Premium Altus',
      modalSubtitle: 'Scopri tutti i vantaggi della nostra carta esclusiva',
      advantagesTitle: 'Vantaggi esclusivi',
      advantages: {
        cashback: 'Cashback del 2%',
        cashbackDesc: 'Guadagna il 2% di cashback su tutti i tuoi acquisti',
        noFees: 'Senza canone annuo',
        noFeesDesc: 'Primo anno gratuito, poi €49/anno',
        protection: 'Protezione totale',
        protectionDesc: 'Assicurazione viaggio e protezione acquisti inclusi',
        rewards: 'Programma premi',
        rewardsDesc: 'Accumula punti ad ogni acquisto',
        global: 'Accettazione globale',
        globalDesc: 'Accettata in milioni di esercizi in tutto il mondo',
        support: 'Supporto reattivo',
        supportDesc: 'Assistenza reattiva durante orario lavorativo',
        maxSecurity: 'Massima sicurezza',
        maxSecurityDesc: 'Numeri temporanei con protezione totale',
        instantActivation: 'Attivazione istantanea',
        instantActivationDesc: 'Utilizzabile immediatamente',
        noFeesEuro: 'Senza commissioni',
        noFeesEuroDesc: '0% di commissioni in zona euro',
        globallyAccepted: 'Accettata in tutto il mondo',
        globallyAcceptedDesc: 'Compatibile con Apple Pay e Google Pay',
      },
      usageZonesTitle: 'Zone d\'uso',
      usageZones: {
        worldwide: 'Mondo intero',
        worldwideDesc: 'Usa la tua carta ovunque nel mondo',
        online: 'Acquisti online',
        onlineDesc: 'Pagamento sicuro per tutti i tuoi acquisti online',
        stores: 'Negozi fisici',
        storesDesc: 'Accettata in milioni di negozi in tutto il mondo',
        atm: 'Prelievi agli sportelli automatici',
        atmDesc: 'Prelievi gratuiti agli sportelli della rete',
      },
      feesTitle: 'Commissioni e tariffe',
      fees: {
        annualFee: 'Canone annuo',
        annualFeeAmount: 'Gratuito il primo anno, poi €49/anno',
        transactionFee: 'Commissione transazione',
        transactionFeeAmount: '0% sugli acquisti',
        withdrawalFee: 'Commissione prelievo',
        withdrawalFeeAmount: '3 prelievi gratuiti/mese, poi €2/prelievo',
        foreignFee: 'Commissione cambio',
        foreignFeeAmount: '1,5% sulle transazioni estere',
      },
      specificationsTitle: 'Specifiche',
      specifications: {
        cardType: 'Tipo di carta',
        cardTypeValue: 'Visa Premium / Mastercard World Elite',
        creditLimit: 'Limite di credito',
        creditLimitValue: 'Fino a €50.000 secondo profilo',
        validity: 'Validità',
        validityValue: '5 anni',
        delivery: 'Consegna',
        deliveryValue: '7-10 giorni lavorativi',
      },
      orderProcess: 'Processo di richiesta',
      orderProcessDesc: 'Compila il modulo di richiesta, fornisci i tuoi documenti, attendi l\'approvazione (24-48h) e ricevi la tua carta a casa.',
      termsConditions: 'Termini e condizioni della carta Premium Altus',
      close: 'Chiudi',
    },
    notifications: {
      loan_request: { title: 'Nuova richiesta di prestito', message: 'La tua richiesta di prestito è stata ricevuta' },
      loan_under_review: { title: 'Prestito in analisi', message: 'Il tuo prestito è in fase di analisi' },
      loan_approved: { title: 'Prestito approvato', message: 'Congratulazioni! Il tuo prestito è stato approvato' },
      loan_rejected: { title: 'Prestito rifiutato', message: 'La tua richiesta di prestito è stata rifiutata' },
      loan_contract_generated: { title: 'Contratto generato', message: 'Il tuo contratto di prestito è pronto per il download' },
      loan_contract_signed: { title: 'Contratto firmato', message: 'Il tuo contratto è stato ricevuto ed è in elaborazione' },
      loan_disbursed: { title: 'Fondi sbloccati', message: 'I fondi del prestito sono stati depositati sul tuo conto' },
      transfer_initiated: { title: 'Trasferimento avviato', message: 'La tua richiesta di trasferimento è stata avviata' },
      transfer_completed: { title: 'Trasferimento completato', message: 'Il tuo trasferimento è stato completato con successo' },
      transfer_approved: { title: 'Trasferimento approvato', message: 'Il tuo trasferimento è stato approvato' },
      transfer_suspended: { title: 'Trasferimento sospeso', message: 'Il tuo trasferimento è stato sospeso' },
      code_issued: { title: 'Codice emesso', message: 'Un codice di trasferimento è stato generato' },
      kyc_approved: { title: 'KYC approvato', message: 'La tua verifica d\'identità è stata approvata' },
      kyc_rejected: { title: 'KYC rifiutato', message: 'La tua verifica d\'identità è stata rifiutata' },
      fee_added: { title: 'Nuova commissione', message: 'Una nuova commissione è stata aggiunta al tuo conto' },
      account_status_changed: { title: 'Stato conto modificato', message: 'Lo stato del tuo conto è stato aggiornato' },
      admin_message_sent: { title: 'Nuovo messaggio', message: 'Hai ricevuto un messaggio dall\'amministratore' },
      general: { title: 'Notifica', message: 'Hai una nuova notifica' },
      twoFactorSuggestion: { title: 'Suggerimento sicurezza', message: 'Raccomandiamo di attivare l\'autenticazione a due fattori per maggiore sicurezza del conto' },
      markAllRead: 'Segna tutte come lette',
      markAsRead: 'Segna come letta',
      deleteNotification: 'Elimina notifica',
    },
    dialogs: {
      newLoan: {
        title: 'Nuova richiesta di prestito',
        subtitle: 'Compila il modulo qui sotto per richiedere un prestito',
        subtitleFirstRequest: 'Prima richiesta: fornisci i tuoi documenti di identità e compila il modulo',
        subtitleRegular: 'Compila il modulo per inviare una nuova richiesta di prestito',
        loanType: 'Tipo di prestito',
        selectLoanType: 'Seleziona il tipo',
        amount: 'Importo',
        enterAmount: 'Inserisci l\'importo',
        duration: 'Durata',
        selectDuration: 'Seleziona la durata',
        months: 'mesi',
        estimatedRate: 'Tasso stimato',
        monthlyPayment: 'Rata mensile',
        totalRepayment: 'Rimborso totale',
        firstRequestAlert: 'Prima richiesta di prestito',
        firstRequestAlertDesc: 'Per la tua prima richiesta, devi aggiungere un conto bancario e inviare documenti KYC.',
        addBankAccount: 'Aggiungi conto bancario',
        selectAccount: 'Seleziona conto',
        bankName: 'Nome banca',
        bankNamePlaceholder: 'Es: Banca Intesa',
        accountLabel: 'Etichetta conto',
        accountLabelPlaceholder: 'Es: Conto principale',
        iban: 'IBAN',
        ibanPlaceholder: 'IT XX XXXX XXXX XXXX XXXX XXXX XXX',
        bic: 'BIC/SWIFT',
        bicPlaceholder: 'XXXXXXXX',
        uploadDocuments: 'Carica documenti',
        kycDocumentsTab: 'Documenti KYC',
        additionalDocumentsTab: 'Documenti aggiuntivi',
        loanDetailsTab: 'Dettagli del Prestito',
        identity: 'Documento d\'identità',
        proof_of_address: 'Attestazione di residenza',
        income_proof: 'Prova di reddito',
        business_registration: 'Registro commerciale',
        financial_statements: 'Bilanci finanziari',
        tax_returns: 'Dichiarazione fiscale',
        requiredDocuments: 'Documenti Richiesti',
        identityDoc: 'Documento d\'identità (Carta d\'identità o Passaporto)',
        addressProof: 'Attestazione di residenza (meno di 3 mesi)',
        bankStatement: 'Estratto Conto Bancario (ultimi 3 mesi)',
        uploadingInProgress: 'Caricamento in corso...',
        documentsUploadedSuccess: 'documento(i) caricato(i) con successo',
        submit: 'Invia richiesta',
        submitting: 'Invio in corso...',
        cancel: 'Annulla',
        loanTypes: {
          personal: 'Prestito personale',
          auto: 'Credito auto',
          mortgage: 'Prestito immobiliare',
          green: 'Prestito verde',
          renovation: 'Prestito lavori',
          student: 'Prestito studenti',
          business: 'Prestito aziendale',
          cashFlow: 'Gestione cash flow',
          equipment: 'Finanziamento attrezzature',
          commercialProperty: 'Immobile commerciale',
          lineOfCredit: 'Linea di credito',
          vehicleFleet: 'Flotta veicoli',
        },
        errors: {
          amountMustBePositive: 'L\'importo deve essere maggiore di 0',
          amountMaxExceeded: 'L\'importo non può superare €1.000.000',
          rateMustBePositive: 'Il tasso deve essere positivo',
          rateMaxExceeded: 'Il tasso non può superare il 20%',
          durationMustBePositive: 'La durata deve essere maggiore di 0',
          durationMaxExceeded: 'La durata non può superare 360 mesi',
          documentsRequired: 'Devi caricare i tuoi documenti KYC per la tua prima richiesta',
        },
        success: {
          loanSubmitted: 'Richiesta di Prestito Inviata',
          loanSubmittedDesc: 'La tua richiesta di prestito è stata inviata con successo.',
          documentsUploaded: 'Documenti Caricati',
          documentsUploadedDesc: 'documento(i) inviato(i) con successo.',
        },
        error: {
          loanError: 'Errore',
          loanErrorDesc: 'Impossibile creare la richiesta di prestito.',
          partialUploadError: 'Errore Parziale',
          partialUploadErrorDesc: 'documento(i) non è stato possibile caricare.',
        },
      },
      transfer: {
        title: 'Nuovo trasferimento',
        subtitle: 'Trasferisci fondi sul tuo conto bancario',
        selectAccount: 'Seleziona conto',
        noAccountsAvailable: 'Nessun conto bancario disponibile. Aggiungi prima un conto.',
        amount: 'Importo',
        enterAmount: 'Inserisci l\'importo',
        amountPlaceholder: '50000',
        recipient: 'Destinatario',
        recipientPlaceholder: 'Nome dell\'azienda o beneficiario',
        feesDescription: 'Verranno applicate commissioni di trasferimento di 25€',
        availableFunds: 'Fondi disponibili',
        feesAndProcessing: 'Commissioni e elaborazione',
        submit: 'Avvia trasferimento',
        submitting: 'Elaborazione in corso...',
        creating: 'Creazione...',
        createTransfer: 'Crea trasferimento',
        cancel: 'Annulla',
        transferSuccess: 'Trasferimento avviato',
        transferSuccessDesc: 'La richiesta di trasferimento è stata creata con successo',
        transferError: 'Errore',
        transferErrorDesc: 'Impossibile creare il trasferimento',
      },
      loanRequestModal: {
        title: 'Richiedi un Prestito',
        description: 'Compila il modulo qui sotto e allega i documenti richiesti per inviare la tua richiesta di prestito.',
        loanType: 'Tipo di Prestito',
        selectLoanTypePlaceholder: 'Seleziona un tipo di prestito',
        loanAmount: 'Importo del Prestito',
        duration: 'Durata',
        durationMonths: 'Durata (mesi)',
        months: 'mesi',
        interestRate: 'Tasso di Interesse',
        estimatedMonthlyPayment: 'Pagamento Mensile Stimato',
        requiredDocuments: 'Documenti Richiesti',
        requiredDocumentsDescription: 'Si prega di allegare tutti i documenti contrassegnati come obbligatori per completare la richiesta.',
        required: 'Obbligatorio',
        optional: 'Facoltativo',
        attach: 'Allega',
        cancel: 'Annulla',
        submit: 'Invia Richiesta',
        validationError: 'Seleziona un tipo di prestito',
        requestSent: 'Richiesta Inviata',
        requestSentDescription: 'La tua richiesta di prestito è stata inviata con successo. Riceverai una risposta entro 48 ore.',
        error: 'Errore',
        errorDescription: 'Si è verificato un errore durante l\'invio della richiesta.',
        fileTooLarge: 'File Troppo Grande',
        fileTooLargeDescription: 'La dimensione massima del file è 10MB.',
        missingDocuments: 'Documenti Mancanti',
        missingDocumentsPrefix: 'Si prega di allegare tutti i documenti obbligatori:',
      },
      cardTerms: {
        title: 'Termini e condizioni della carta Premium Altus',
        acceptTerms: 'Accetta e richiedi carta',
        declineTerms: 'Rifiuta',
      },
      welcome: {
        title: 'Benvenuto in Altus Finance Group',
        description: 'Il tuo conto è stato creato con successo. Scegli tra le nostre offerte personalizzate per iniziare.',
        accountTypeTitle: 'Tipo di conto',
        individualAccount: 'Conto privato',
        businessAccount: 'Conto aziendale',
        individualAccess: 'Accesso a prestiti personali e gestione finanze personali',
        businessAccess: 'Accesso completo a soluzioni di finanziamento aziendale e servizi premium',
        availableOffers: 'Offerte disponibili per te',
        getStarted: 'Inizia',
        dialog: {
          title: 'Benvenuto in Altus Finance Group!',
          description: 'Siamo felici di supportarti nei tuoi progetti di finanziamento.',
        },
        account: {
          badgeLabel: 'Il tuo conto:',
          individual: {
            description: 'Hai accesso alle offerte di prestiti personali. Queste offerte sono appositamente progettate per le tue esigenze personali e progetti individuali.',
          },
          business: {
            description: 'Hai accesso alle offerte di prestiti professionali. Queste offerte sono appositamente progettate per lo sviluppo e la crescita della tua azienda.',
          },
        },
        offers: {
          title: 'Offerte disponibili per te',
          individual: [
            'Prestito Personale',
            'Prestito Immobiliare',
            'Credito Auto',
            'Prestito Studenti',
            'Prestito Verde',
            'Prestito Lavori',
          ],
          business: [
            'Prestito Professionale',
            'Credito di Tesoreria',
            'Finanziamento Attrezzature',
            'Ipoteca Commerciale',
            'Linea di Credito',
            'Credito per Veicolo Professionale',
          ],
        },
        important: {
          title: 'Importante:',
          message: 'Solo le offerte menzionate sopra saranno accessibili nel tuo spazio.',
          individualSwitch: ' Se desideri accedere alle offerte professionali, dovrai creare un conto aziendale.',
          businessSwitch: ' Se desideri accedere alle offerte personali, dovrai creare un conto privato.',
        },
        cta: {
          primary: 'Capito, iniziamo',
          pending: 'Caricamento...',
        },
      },
      transactionHistory: {
        title: 'Storico transazioni',
        type: 'Tipo',
        amount: 'Importo',
        date: 'Data',
        status: 'Stato',
        noTransactions: 'Nessuna transazione trovata',
        close: 'Chiudi',
      },
    },
    verify: {
      verifying: 'Verifica in corso...',
      success: 'Email verificata!',
      successMessage: 'La tua email è stata verificata con successo. Ora puoi accedere al tuo conto.',
      goToDashboard: 'Vai alla dashboard',
      error: 'Verifica fallita',
      errorMessage: 'Impossibile verificare la tua email. Il link potrebbe essere scaduto.',
      tryAgain: 'Riprova',
      backToSignup: 'Torna alla registrazione',
      backToHome: 'Torna alla home',
    },
    forgotPassword: {
      title: 'Password dimenticata?',
      description: 'Nessun problema! Ti invieremo le istruzioni per reimpostare la tua password.',
      instructions: 'Inserisci il tuo indirizzo email qui sotto e ti invieremo un link per reimpostare la tua password.',
      emailLabel: 'Indirizzo email',
      emailPlaceholder: 'tuaemail@esempio.it',
      sendResetLink: 'Invia link di reimpostazione',
      sending: 'Invio in corso...',
      backToLogin: 'Torna all\'accesso',
      emailSent: 'Email inviata!',
      emailSentDesc: 'Controlla la tua casella di posta per le istruzioni di reimpostazione password.',
      error: 'Errore',
      errorDesc: 'Impossibile inviare l\'email di reimpostazione. Riprova.',
    },
    resetPassword: {
      title: 'Reimposta password',
      description: 'Inserisci la tua nuova password qui sotto',
      newPassword: 'Nuova password',
      newPasswordPlaceholder: 'Inserisci la tua nuova password',
      confirmPassword: 'Conferma password',
      confirmPasswordPlaceholder: 'Conferma la tua nuova password',
      requirements: 'Requisiti password',
      minLength: 'Almeno 12 caratteri',
      uppercase: 'Almeno una lettera maiuscola',
      lowercase: 'Almeno una lettera minuscola',
      number: 'Almeno un numero',
      specialChar: 'Almeno un carattere speciale',
      passwordStrength: 'Forza password',
      weak: 'Debole',
      medium: 'Media',
      strong: 'Forte',
      veryStrong: 'Molto forte',
      resetPassword: 'Reimposta password',
      resetting: 'Reimpostazione in corso...',
      success: 'Password reimpostata!',
      successMessage: 'La tua password è stata reimpostata con successo. Ora puoi accedere con la tua nuova password.',
      error: 'Errore',
      invalidToken: 'Link di reimpostazione non valido o scaduto',
      passwordMismatch: 'Le password non corrispondono',
    },
    twoFactorAuth: {
      setup: {
        title: 'Configura autenticazione a due fattori',
        description: 'Aggiungi un livello extra di sicurezza al tuo conto',
        step1: 'Passo 1: Installa un\'app autenticatore',
        step1Description: 'Scarica un\'app come Google Authenticator o Authy sul tuo dispositivo mobile.',
        step2: 'Passo 2: Scansiona il codice QR',
        step2Description: 'Apri la tua app autenticatore e scansiona il codice QR qui sotto.',
        step3: 'Passo 3: Inserisci il codice di verifica',
        step3Description: 'Inserisci il codice a 6 cifre dalla tua app autenticatore per completare la configurazione.',
        qrCodeInstructions: 'Scansiona questo codice QR con la tua app autenticatore',
        cantScanQR: 'Non riesci a scansionare il codice QR?',
        secretKey: 'Inserisci questa chiave manualmente',
        enterCode: 'Inserisci il codice a 6 cifre',
        codePlaceholder: '000000',
        verify: 'Verifica e attiva',
        verifying: 'Verifica in corso...',
        cancel: 'Annulla',
        successTitle: '2FA attivato!',
        successMessage: 'L\'autenticazione a due fattori è stata attivata con successo sul tuo conto.',
        errorTitle: 'Codice non valido',
        errorMessage: 'Il codice inserito non è valido. Riprova.',
      },
      disable: {
        title: 'Disattiva autenticazione a due fattori',
        description: 'Sei sicuro di voler disattivare l\'autenticazione a due fattori? Questo renderà il tuo conto meno sicuro.',
        enterPassword: 'Inserisci la tua password per confermare',
        passwordPlaceholder: 'La tua password',
        disable: 'Disattiva 2FA',
        disabling: 'Disattivazione in corso...',
        cancel: 'Annulla',
        successTitle: '2FA disattivato',
        successMessage: 'L\'autenticazione a due fattori è stata disattivata dal tuo conto.',
        errorTitle: 'Errore',
        errorMessage: 'Impossibile disattivare l\'autenticazione a due fattori. Verifica la tua password.',
      },
      login: {
        title: 'Verifica autenticazione a due fattori',
        description: 'Inserisci il codice a 6 cifre dalla tua app autenticatore',
        enterCode: 'Inserisci il codice di verifica',
        codePlaceholder: '000000',
        verify: 'Verifica',
        verifying: 'Verifica in corso...',
        cancel: 'Annulla',
        errorTitle: 'Codice non valido',
        errorMessage: 'Il codice inserito non è valido o è scaduto. Riprova.',
      },
    },
    bankAccounts: {
      title: 'Conti bancari',
      description: 'Gestisci i tuoi conti bancari per trasferimenti',
      addAccount: 'Aggiungi conto',
      noAccountsTitle: 'Nessun conto bancario',
      noAccountsDescription: 'Aggiungi un conto bancario per iniziare a trasferire fondi.',
      accountLabel: 'Etichetta',
      bankName: 'Banca',
      iban: 'IBAN',
      bic: 'BIC',
      createdAt: 'Creato il',
      actions: 'Azioni',
      delete: 'Elimina',
      deleteConfirm: 'Sei sicuro di voler eliminare questo conto bancario?',
      deleteSuccess: 'Conto bancario eliminato con successo',
      addAccountTitle: 'Aggiungi conto bancario',
      addAccountDescription: 'Aggiungi un nuovo conto bancario per trasferimenti',
      accountLabelLabel: 'Etichetta conto',
      accountLabelPlaceholder: 'Es: Conto principale',
      accountLabelRequired: 'L\'etichetta del conto è obbligatoria',
      bankNameLabel: 'Nome banca',
      bankNamePlaceholder: 'Es: Banca Intesa',
      bankNameRequired: 'Il nome della banca è obbligatorio',
      ibanLabel: 'IBAN',
      ibanPlaceholder: 'IT XX XXXX XXXX XXXX XXXX XXXX XXX',
      ibanRequired: 'L\'IBAN è obbligatorio',
      invalidIban: 'Formato IBAN non valido',
      bicLabel: 'BIC/SWIFT',
      bicPlaceholder: 'XXXXXXXX',
      invalidBic: 'Formato BIC non valido',
      submit: 'Aggiungi conto',
      submitting: 'Aggiunta in corso...',
      cancel: 'Annulla',
      addSuccess: 'Conto bancario aggiunto',
      addSuccessDesc: 'Il tuo conto bancario è stato aggiunto con successo.',
      addError: 'Errore durante l\'aggiunta del conto bancario',
      addFirstAccount: 'Aggiungi il tuo primo conto',
      deleteSuccessDesc: 'Il conto bancario è stato eliminato con successo.',
      deleteError: 'Impossibile eliminare il conto bancario.',
    },
    welcomeModal: {
      title: 'Benvenuto in Altus Finance Group',
      description: 'Il tuo conto è stato creato con successo. Scegli tra le nostre offerte personalizzate per iniziare.',
      accountType: 'Tipo di conto',
      individualAccount: 'Conto privato',
      businessAccount: 'Conto aziendale',
      individualAccess: 'Accesso a prestiti personali e gestione finanze personali',
      businessAccess: 'Accesso completo a soluzioni di finanziamento aziendale e servizi premium',
      availableOffers: 'Offerte disponibili per te',
      getStarted: 'Inizia',
    },
    calculator: {
      title: 'Calcolatore di prestito',
      description: 'Calcola le tue rate mensili e il costo totale del tuo prestito',
      loanAmount: 'Importo del prestito',
      interestRate: 'Tasso di interesse (%)',
      loanDuration: 'Durata del prestito',
      months: 'mesi',
      calculate: 'Calcola',
      results: 'Risultati',
      monthlyPayment: 'Rata mensile',
      totalInterest: 'Interessi totali',
      totalAmount: 'Importo totale',
      amortizationSchedule: 'Piano di ammortamento',
      month: 'Mese',
      payment: 'Pagamento',
      principal: 'Capitale',
      interest: 'Interessi',
      balance: 'Saldo',
      downloadSchedule: 'Scarica piano',
    },
    amortization: {
      interactiveTitle: 'Piano di ammortamento interattivo',
      interactiveDescription: 'Seleziona un prestito attivo e personalizza i parametri per vedere l\'impatto sui pagamenti',
      calculatorTitle: 'Calcolatore di Ammortamento Interattivo',
      calculatorDescription: 'Simula il tuo piano di rimborso e visualizza l\'evoluzione del tuo prestito',
      selectActiveLoan: 'Seleziona un prestito attivo',
      chooseLoan: 'Scegli un prestito...',
      loanOf: 'Prestito di',
      at: 'al',
      loanAmount: 'Importo del prestito (€)',
      annualInterestRate: 'Tasso di interesse annuale (%)',
      duration: 'Durata (anni)',
      years: 'anni',
      calculateAmortization: 'Calcola ammortamento',
      calculatePlan: 'Calcola piano di ammortamento',
      monthlyPayment: 'Rata mensile',
      totalPayment: 'Totale da pagare',
      totalInterest: 'Totale interessi',
      table: 'Tabella',
      evolution: 'Evoluzione',
      cumulative: 'Cumulativo',
      breakdown: 'Ripartizione',
      month: 'Mese',
      payment: 'Pagamento',
      principal: 'Capitale',
      interest: 'Interessi',
      balance: 'Saldo',
      amount: 'Importo (€)',
      monthLabel: 'Mese',
      noActiveLoans: 'Nessun prestito attivo',
      noActiveLoansDesc: 'Non hai prestiti attivi al momento. Richiedi un nuovo prestito per utilizzare questa funzione.',
      loanType: 'Tipo di prestito',
      selectType: 'Seleziona tipo',
      personal: 'Personale',
      business: 'Aziendale',
      realEstate: 'Immobiliare',
      automaticallyCalculated: 'Calcolato automaticamente',
      rateInfo: 'Il tasso di interesse viene calcolato automaticamente in base all\'importo e al tipo di prestito. Tutte le richieste di prestito richiedono l\'approvazione amministrativa.',
      requestLoan: 'Richiedi questo prestito',
      sending: 'Invio in corso...',
      chart: 'Grafico',
      balanceEvolution: 'Evoluzione del saldo e dei pagamenti',
      principalVsInterest: 'Ripartizione Capitale vs Interessi',
      monthlyRepaymentPlan: 'Piano di rimborso mensile',
      remainingBalance: 'Saldo residuo',
      errors: {
        amountPositive: 'L\'importo del prestito deve essere superiore a €0',
        amountMax: 'L\'importo del prestito non può superare €10.000.000',
        rateNegative: 'Il tasso di interesse non può essere negativo',
        rateMax: 'Il tasso di interesse non può superare il 100%',
        durationPositive: 'La durata del prestito deve essere superiore a 0 anni',
        durationMax: 'La durata del prestito non può superare 50 anni',
      },
    },
    kycDocuments: {
      title: 'Documenti KYC',
      description: 'Carica i tuoi documenti per la verifica d\'identità',
      uploadDocuments: 'Carica documenti',
      documentType: 'Tipo di documento',
      selectDocumentType: 'Seleziona tipo di documento',
      identity: 'Documento d\'identità',
      proof_of_address: 'Attestazione di residenza',
      income_proof: 'Prova di reddito',
      business_registration: 'Registro commerciale',
      financial_statements: 'Bilanci finanziari',
      tax_returns: 'Dichiarazione fiscale',
      chooseFile: 'Scegli file',
      upload: 'Carica',
      uploading: 'Caricamento in corso...',
      uploadSuccess: 'Caricamento riuscito',
      uploadSuccessDesc: 'Il tuo documento è stato caricato con successo.',
      uploadError: 'Errore durante il caricamento',
      status: 'Stato',
      pending: 'In sospeso',
      approved: 'Approvato',
      rejected: 'Rifiutato',
      uploadedAt: 'Caricato il',
      noDocuments: 'Nessun documento caricato',
    },
    transferFlow: {
      backToDashboard: 'Torna alla dashboard',
      form: {
        title: 'Nuovo trasferimento',
        subtitle: 'Inizia un trasferimento sicuro verso un conto esterno',
        amountLabel: 'Importo (EUR)',
        amountPlaceholder: '10000',
        amountHelper: 'Importo fisso basato sul prestito attivo (non modificabile)',
        accountLabel: 'Conto esterno (opzionale)',
        accountPlaceholder: 'Seleziona un conto',
        externalAccountLabel: 'Conto esterno *',
        selectAccountPlaceholder: 'Seleziona un conto',
        noAccount: 'Nessun conto registrato',
        recipientLabel: 'Beneficiario',
        recipientPlaceholder: 'Nome del beneficiario',
        initiateButton: 'Inizia il trasferimento',
        initiating: 'Inizializzazione...',
      },
      verification: {
        title: 'Verifica del trasferimento',
        subtitle: 'Attendere durante la verifica del trasferimento',
        doNotClose: 'Non chiudere questa pagina',
        doNotCloseDesc: 'Il trasferimento è in corso di verifica dal nostro sistema sicuro. Questa operazione richiede circa 45 secondi.',
        progressLabel: 'Progresso della verifica',
        verificationSteps: 'Fasi di verifica',
        step1: 'Verifica del conto emittente',
        step2: 'Convalida dell\'importo e delle commissioni',
        step3: 'Controllo di sicurezza antifrode',
        step4: 'Preparazione del trasferimento sicuro',
      },
      validation: {
        title: 'Convalida del trasferimento',
        subtitle: 'Codice {sequence} / {total}',
        demoCodeLabel: 'Codice di dimostrazione:',
        codeLabel: 'Codice di convalida (6 cifre)',
        codePlaceholder: '000000',
        codeHelpText: 'Un codice è stato inviato alla tua email',
        validateButton: 'Convalida',
        validating: 'Convalida...',
        resendButton: 'Invia di nuovo',
        historyLabel: 'Cronologia',
      },
      progress: {
        titlePaused: 'Trasferimento in pausa',
        titleInProgress: 'Trasferimento in corso',
        securityVerificationTitle: 'Verifica di sicurezza',
        transferProcessingTitle: 'Trasferimento in elaborazione',
        toPrefix: 'A:',
        securityVerificationRequired: 'Verifica di sicurezza richiesta',
        enterVerificationCode: 'Per motivi di sicurezza, inserisci il codice di verifica che ti è stato inviato',
        codeFromAdvisor: 'Il codice di sicurezza sarà fornito dal tuo consulente',
        validationCodeLabel: 'Codice di validazione (6 cifre)',
        enterCodePlaceholder: 'Inserisci il codice a 6 cifre',
        validating: 'Validazione...',
        validateAndContinue: 'Convalida e continua',
        processingTransfer: 'Elaborazione del trasferimento...',
        doNotCloseProcessing: 'La tua operazione è in fase di elaborazione sicura. Non chiudere questa pagina.',
        amountLabel: 'Importo: {amount} EUR verso {recipient}',
        progressLabel: 'Progresso',
        pauseTitle: 'Codice di sblocco richiesto al {percent}%',
        pauseDescription: 'Si prega di contattare il servizio clienti per ottenere il codice di sblocco del trasferimento.',
        pauseCodeLabel: 'Codice di sblocco',
        pauseCodePlaceholder: 'Inserisci il codice',
        validatePauseCode: 'Convalida il codice',
        statusLabel: 'Stato attuale',
        statusCompleted: 'Trasferimento completato!',
        statusProcessing: 'Elaborazione in corso dal nostro sistema bancario...',
        eventsLabel: 'Eventi',
        circularProgressTitle: 'Verifica del trasferimento',
        circularProgressSubtitle: 'La sua operazione è in corso di elaborazione sicura.',
      },
      complete: {
        title: 'Trasferimento completato',
        subtitle: 'Il tuo trasferimento è stato effettuato con successo',
        successMessage: 'Il tuo trasferimento è stato completato con successo. I fondi saranno disponibili entro 24-72 ore.',
        referenceLabel: 'Riferimento',
        returnToDashboard: 'Torna al pannello',
        amountLabel: 'Importo',
        recipientLabel: 'Beneficiario',
        feesLabel: 'Commissioni',
      },
      toast: {
        transferInProgress: 'Trasferimento in corso',
        transferAlreadyInProgress: 'Un trasferimento è già in corso per questo prestito. Reindirizzamento...',
        transferInitiated: 'Trasferimento avviato con successo. Verifica in corso...',
        selectExternalAccount: 'Si prega di selezionare un conto esterno.',
        noActiveLoan: 'Nessun prestito attivo disponibile.',
        initiated: 'Trasferimento iniziato',
        initiatedDesc: 'Verifica del trasferimento in corso...',
        error: 'Errore',
        errorInitiation: 'Impossibile avviare il trasferimento',
        codeValidated: 'Codice convalidato',
        codeInvalid: 'Codice non valido',
        codeInvalidDesc: 'Il codice è errato o scaduto',
        codeSent: 'Codice inviato',
        codeSentDesc: 'Codice {sequence} inviato con successo',
        approved: 'Trasferimento approvato',
        approvedDesc: 'Il tuo trasferimento è approvato e in elaborazione.',
        fieldsRequired: 'Campi obbligatori',
        fieldsRequiredDesc: 'Si prega di compilare tutti i campi',
        invalidCode: 'Codice non valido',
        invalidCodeDesc: 'Il codice deve contenere 6 cifre',
        codeRequired: 'Codice obbligatorio',
        codeRequiredDesc: 'Si prega di inserire il codice di sblocco',
        unblocked: 'Trasferimento sbloccato',
        unblockedDesc: 'Il trasferimento è stato sbloccato con successo',
      },
    },
    loanOffers: {
      pageTitle: 'Le nostre offerte di prestito',
      pageSubtitle: 'Scopri tutte le nostre soluzioni di finanziamento per privati e professionisti',
      accountInfo: 'Conto {accountType}:',
      individualTab: 'Prestiti Personali',
      businessTab: 'Prestiti Aziendali',
      individual: 'Privato',
      business: 'Aziendale',
      amountLabel: 'Importo',
      rateLabel: 'Tasso',
      durationLabel: 'Durata',
      advantagesLabel: 'Vantaggi',
      requestButton: 'Richiedi questo prestito',
      loginToRequest: 'Accedi per richiedere',
      types: {
        personalLoan: {
          title: 'Prestito Personale',
          description: 'Finanziamento flessibile per tutti i tuoi progetti personali',
          features: ['Risposta rapida', 'Senza giustificazione d\'uso', 'Rimborso flessibile'],
        },
        mortgageLoan: {
          title: 'Mutuo Immobiliare',
          description: 'Finanzia l\'acquisto della tua residenza principale o secondaria',
          features: ['Tasso fisso o variabile', 'Fino all\'80% dell\'importo', 'Assicurazione inclusa'],
        },
        autoLoan: {
          title: 'Credito Auto',
          description: 'Acquista il tuo veicolo nuovo o usato',
          features: ['Erogazione rapida', 'Possibilità di rimborso anticipato', 'Assicurazione opzionale'],
        },
        studentLoan: {
          title: 'Prestito Studenti',
          description: 'Finanzia i tuoi studi con condizioni vantaggiose',
          features: ['Rimborso differito', 'Tassi preferenziali', 'Garanzia parentale opzionale'],
        },
        greenLoan: {
          title: 'Prestito Verde',
          description: 'Finanzia i tuoi progetti di ristrutturazione energetica',
          features: ['Tasso ridotto', 'Ammissibile agli aiuti statali', 'Finanziamento eco-responsabile'],
        },
        renovationLoan: {
          title: 'Prestito Ristrutturazione',
          description: 'Rinnova e migliora la tua abitazione',
          features: ['Senza ipoteca fino a 75k€', 'Erogazione progressiva possibile', 'Deduzione fiscale possibile'],
        },
        businessLoan: {
          title: 'Prestito Aziendale',
          description: 'Finanziamento per i tuoi progetti aziendali, sviluppo e tesoreria',
          features: ['Risposta entro 48h', 'Tasso fisso', 'Rimborso flessibile'],
        },
        cashFlowCredit: {
          title: 'Credito di Tesoreria',
          description: 'Soluzione rapida per gestire le tue esigenze di capitale circolante',
          features: ['Erogazione rapida', 'Senza garanzia fino a 50k€', 'Flessibile'],
        },
        equipmentFinancing: {
          title: 'Finanziamento Attrezzature',
          description: 'Acquista le tue attrezzature e materiali professionali',
          features: ['Fino al 100% dell\'importo', 'Opzione leasing', 'Deduzione fiscale'],
        },
        commercialPropertyLoan: {
          title: 'Mutuo Immobiliare Commerciale',
          description: 'Acquisisci i tuoi locali professionali, uffici o magazzini',
          features: ['Durata lunga', 'Acconto dal 20%', 'Tasso competitivo'],
        },
        lineOfCredit: {
          title: 'Linea di Credito',
          description: 'Credito rinnovabile per le tue esigenze occasionali',
          features: ['Disponibile 24/7', 'Rimborso libero', 'Rinnovo automatico'],
        },
        vehicleFleetLoan: {
          title: 'Credito Flotta Veicoli',
          description: 'Finanzia la tua flotta automobilistica o veicoli commerciali',
          features: ['Leasing o credito tradizionale', 'Opzione di riacquisto', 'Assicurazione inclusa'],
        },
      },
    },
    cardTermsContent: {
      title: 'Condizioni Generali d\'Uso - Carta Virtuale ALTUS',
      lastUpdated: 'Ultimo aggiornamento: Novembre 2025',
      section1: {
        title: '1. OGGETTO E CAMPO DI APPLICAZIONE',
        content: 'Le presenti condizioni generali (di seguito "CGU") regolano l\'uso della carta bancaria virtuale ALTUS (di seguito "la Carta Virtuale"), proposta da ALTUS Finance Group ai clienti titolari di un conto ALTUS (di seguito "il Titolare"). La Carta Virtuale è un mezzo di pagamento dematerializzato collegato al vostro conto ALTUS.',
      },
      section2: {
        title: '2. DESCRIZIONE DEL SERVIZIO',
        subtitle1: '2.1 Natura della Carta Virtuale',
        content1: 'La Carta Virtuale è una carta di pagamento dematerializzata con un numero di carta a 16 cifre, una data di scadenza e un crittogramma visivo (CVV). Funziona come una carta bancaria fisica ma esiste solo in forma elettronica.',
        subtitle2: '2.2 Tipo di Carta',
        item1: 'Carta virtuale permanente: coordinate fisse per tutta la sua durata di validità (3 anni)',
        item2: 'Carta virtuale temporanea: coordinate temporanee con importo e durata parametrabili',
      },
      section3: {
        title: '3. CONDIZIONI DI IDONEITÀ',
        content: 'Per ottenere una Carta Virtuale, il Titolare deve:',
        list: [
          'Essere cliente ALTUS con un conto attivo e finanziato',
          'Aver completato la verifica d\'identità (KYC)',
          'Non essere in situazione di scoperto non autorizzato',
          'Aver attivato l\'autenticazione forte (doppio fattore)',
          'Accettare le presenti CGU e le Condizioni Tariffarie',
        ],
      },
      section4: {
        title: '4. ATTIVAZIONE E UTILIZZO',
        subtitle1: '4.1 Attivazione',
        content1: 'La Carta Virtuale viene attivata istantaneamente alla sua creazione tramite l\'applicazione o l\'area clienti ALTUS. Il Titolare riceve immediatamente le coordinate complete della carta.',
        subtitle2: '4.2 Utilizzi autorizzati',
        list1: [
          'Pagamenti su tutti i siti commerciali online che accettano Visa/Mastercard',
          'Pagamenti ricorrenti e abbonamenti (solo carta permanente)',
          'Acquisti su siti internazionali',
          'Pagamenti contactless nei negozi (se aggiunta a Apple Pay/Google Pay)',
        ],
        subtitle3: '4.3 Limitazioni',
        list2: [
          'Nessun prelievo di contanti ai distributori automatici',
          'Presentazione fisica impossibile (noleggio auto, alcuni hotel)',
          'Alcuni fornitori potrebbero rifiutare le carte virtuali',
        ],
      },
      section5: {
        title: '5. SICUREZZA E PROTEZIONE',
        subtitle1: '5.1 Sicurezza rafforzata',
        list1: [
          'Le coordinate della vostra carta bancaria fisica non vengono mai esposte',
          'Possibilità di bloccare/sbloccare istantaneamente la carta',
          'Eliminazione definitiva con un clic',
          'Protezione 3D Secure su tutte le transazioni',
          'CVV dinamico per la massima sicurezza',
        ],
        subtitle2: '5.2 Obblighi del Titolare',
        content2: 'Il Titolare si impegna a conservare le coordinate della sua Carta Virtuale in modo confidenziale e a non comunicarle a terzi. In caso di sospetta frode, il Titolare deve immediatamente bloccare o eliminare la carta tramite la sua area clienti.',
        subtitle3: '5.3 Garanzie e assicurazioni',
        content3: 'La Carta Virtuale beneficia delle stesse garanzie della vostra carta fisica, inclusa la protezione contro le frodi, l\'assicurazione acquisti e la garanzia di consegna conforme.',
      },
      section6: {
        title: '6. MASSIMALI E LIMITI',
        content: 'I massimali di pagamento della Carta Virtuale sono identici a quelli della vostra carta principale ALTUS:',
        list: [
          'Massimale mensile: fino a 50.000 € secondo il vostro profilo',
          'Massimale per transazione: fino a 10.000 €',
          'Possibilità di regolare temporaneamente i massimali dall\'applicazione',
        ],
        content2: 'Per le carte temporanee, definite l\'importo massimo e la durata di validità durante la creazione.',
      },
      section7: {
        title: '7. TARIFFAZIONE',
        list: [
          'Creazione carta virtuale: Gratuita',
          'Commissioni di transazione in zona euro: 0%',
          'Pagamenti fuori zona euro: 1,5% dell\'importo',
          'Quota annuale: Gratuita',
          'Blocco/Sblocco: Gratuito e illimitato',
        ],
      },
      section8: {
        title: '8. ADDEBITO E ESTRATTO CONTO',
        content: 'Tutte le operazioni effettuate con la Carta Virtuale vengono addebitate in tempo reale sul vostro conto ALTUS. Appaiono immediatamente nella vostra cronologia delle transazioni e sui vostri estratti conto mensili.',
      },
      section9: {
        title: '9. OPPOSIZIONE E RISOLUZIONE',
        subtitle1: '9.1 Blocco temporaneo',
        content1: 'Potete bloccare la vostra Carta Virtuale in qualsiasi momento dalla vostra area clienti. Lo sblocco è istantaneo.',
        subtitle2: '9.2 Eliminazione definitiva',
        content2: 'L\'eliminazione di una Carta Virtuale è immediata e irreversibile. Gli abbonamenti collegati a questa carta saranno automaticamente rifiutati. Si consiglia di aggiornare le informazioni di pagamento presso i commercianti interessati prima dell\'eliminazione.',
        subtitle3: '9.3 In caso di frode',
        content3: 'In caso di perdita o furto presunto delle coordinate, eliminate immediatamente la carta dalla vostra applicazione e contattate il nostro servizio clienti al +39 XX XX XX XX XX (disponibile 24h/24, 7g/7).',
      },
      section10: {
        title: '10. RESPONSABILITÀ',
        content: 'ALTUS non può essere ritenuto responsabile in caso di:',
        list: [
          'Rifiuto di un commerciante di accettare la Carta Virtuale',
          'Interruzione temporanea del servizio per manutenzione',
          'Uso fraudolento derivante da negligenza del Titolare',
          'Controversie commerciali tra il Titolare e un commerciante',
        ],
        content2: 'Il Titolare è interamente responsabile dell\'uso della sua Carta Virtuale e delle operazioni effettuate fino alla notifica di un uso fraudolento.',
      },
      section11: {
        title: '11. DURATA E MODIFICA',
        content: 'Le presenti CGU sono concluse per una durata indeterminata. ALTUS si riserva il diritto di modificare le presenti CGU in qualsiasi momento. Qualsiasi modifica sarà notificata al Titolare almeno 2 mesi prima della sua entrata in vigore. L\'assenza di opposizione entro questo termine varrà come accettazione.',
      },
      section12: {
        title: '12. RECLAMI',
        content: 'Per qualsiasi reclamo, il Titolare può contattare il servizio clienti ALTUS:',
        list: [
          'Via email: support@altusgroup.com',
          'Per telefono: +39 XX XX XX XX XX',
          'Tramite l\'area clienti sicura',
        ],
        content2: 'In assenza di risposta soddisfacente entro 2 mesi, il Titolare può rivolgersi al Mediatore dell\'AMF.',
      },
      section13: {
        title: '13. LEGGE APPLICABILE E GIURISDIZIONE',
        content: 'Le presenti CGU sono regolate dalla legge italiana. Qualsiasi controversia relativa alla loro interpretazione o esecuzione è di competenza esclusiva dei tribunali italiani.',
      },
      note: 'Attivando la vostra Carta Virtuale ALTUS, riconoscete di aver letto, compreso e accettato l\'interezza delle presenti Condizioni Generali d\'Uso.',
    },
    processTimeline: {
      title: 'Processo di Finanziamento',
      subtitle: 'Dalla vostra richiesta all\'erogazione dei fondi: un percorso semplificato e rapido',
      step1Title: 'Richiesta online',
      step1Duration: '5 minuti',
      step1Description: 'Compilate il nostro modulo sicuro e caricate i vostri documenti giustificativi',
      step1Docs: [
        'Visura camerale di meno di 3 mesi',
        'Documento d\'identità del dirigente',
        'Ultimi bilanci contabili',
        'Estratti conto bancari (3 mesi)'
      ],
      step2Title: 'Analisi del dossier',
      step2Duration: '24-48h',
      step2Description: 'Il nostro team di esperti studia la vostra richiesta e capacità di rimborso',
      step2Docs: [
        'Verifica dei documenti',
        'Analisi finanziaria',
        'Studio della solvibilità',
        'Calcolo del tasso personalizzato'
      ],
      step3Title: 'Accordo di principio',
      step3Duration: '48h',
      step3Description: 'Ricezione della vostra offerta di prestito dettagliata con condizioni definitive',
      step3Docs: [
        'Importo accordato',
        'TAEG e rate mensili',
        'Garanzie richieste',
        'Condizioni sospensive'
      ],
      step4Title: 'Erogazione dei fondi',
      step4Duration: '7-15 giorni',
      step4Description: 'Firma elettronica del contratto e versamento entro 7-15 giorni dopo l\'implementazione delle garanzie',
      step4Docs: [
        'Firma del contratto di prestito',
        'Implementazione garanzie',
        'Assicurazione mutuatario',
        'Bonifico dei fondi'
      ],
      documentsTitle: 'Documenti da Preparare secondo il Vostro Progetto',
      creationTitle: 'Creazione d\'impresa',
      creationDocs: [
        'Business plan dettagliato',
        'Previsione finanziaria a 3 anni',
        'Piano di finanziamento',
        'CV del dirigente ed esperienza',
        'Giustificativo apporto personale'
      ],
      repriseTitle: 'Acquisizione d\'impresa',
      repriseDocs: [
        'Protocollo di accordo di acquisizione',
        'Bilanci degli ultimi 3 esercizi',
        'Valutazione dell\'avviamento',
        'Contratto di locazione commerciale',
        'Attestazione senza gravami'
      ],
      developmentTitle: 'Sviluppo',
      developmentDocs: [
        'Bilanci degli ultimi 3 esercizi',
        'Pacchetto fiscale completo',
        'Preventivi fornitori (attrezzature)',
        'Estratti conto bancari professionali (6 mesi)',
        'Previsione di attività'
      ],
      incompleteTitle: 'Dossier incompleto? Niente panico!',
      incompleteDescription: 'Il nostro team vi aiuta a costituire il vostro dossier. Vi assistiamo nell\'ottenere i documenti mancanti.',
      needHelp: 'Bisogno di aiuto?',
      averageTime: 'Tempo totale medio:',
      averageTimeValue: '2-3 settimane dal deposito del dossier all\'erogazione dei fondi',
      startApplication: 'Iniziare la mia richiesta'
    },
    guaranteesSection: {
      title: 'Garanzie e Sicurezza',
      subtitle: 'Molteplici opzioni per garantire il vostro finanziamento e ottimizzare la fiscalità',
      organizationalTitle: 'Garanzie Organizzative',
      organizationalItems: [
        'BPI France (40-70% del prestito)',
        'SIAGI (garanzia artigiani/commercianti)',
        'France Active (economia sociale)',
        'SOCAMA (agricoltori)'
      ],
      realTitle: 'Garanzie Reali',
      realItems: [
        'Ipoteca su beni immobiliari',
        'Pegno sull\'avviamento',
        'Pegno su materiali/attrezzature',
        'Privilegio del prestatore di denaro'
      ],
      personalTitle: 'Garanzie Personali',
      personalItems: [
        'Fideiussione solidale del dirigente',
        'Fideiussione bancaria professionale',
        'Garanzia a prima richiesta',
        'Lettera di conforto del gruppo'
      ],
      insuranceTitle: 'Assicurazione Mutuatario',
      insuranceItems: [
        'Decesso / PTIA (obbligatoria)',
        'Invalidità permanente (IPT/IPP)',
        'Incapacità temporanea (ITT)',
        'Contributi fiscalmente deducibili'
      ],
      taxBenefitsTitle: 'Vantaggi Fiscali del Prestito Professionale',
      taxBenefit1Title: 'Deducibilità degli interessi',
      taxBenefit1Description: 'Gli interessi del prestito sono deducibili dal risultato fiscale della vostra impresa, riducendo così l\'imposta sui benefici.',
      taxBenefit2Title: 'Ammortamento accelerato',
      taxBenefit2Description: 'Per le attrezzature finanziate, possibilità di ammortamento accelerato secondo certe condizioni (materiale nuovo, ecologico, ecc.).',
      taxBenefit3Title: 'Credito d\'imposta',
      taxBenefit3Description: 'Certi investimenti danno diritto a crediti d\'imposta (transizione energetica, digitale, formazione).',
      taxBenefit4Title: 'IVA recuperabile',
      taxBenefit4Description: 'L\'IVA sugli interessi e sulle spese di pratica è recuperabile per le imprese soggette.',
      taxAdvice: 'Consiglio fiscale: Consultate il vostro commercialista per ottimizzare la deducibilità dei vostri prestiti e massimizzare i vostri vantaggi fiscali.',
      contributionTitle: 'Apporto Personale Richiesto',
      equipmentPercentage: '10-15%',
      equipmentLabel: 'Attrezzature',
      equipmentDescription: 'Materiali, veicoli',
      creationPercentage: '20-30%',
      creationLabel: 'Creazione / Acquisizione',
      creationDescription: 'Avviamento',
      realEstatePercentage: '20-25%',
      realEstateLabel: 'Immobiliare Professionale',
      realEstateDescription: 'Locali, uffici',
      contributionDisclaimer: '* Percentuali indicative che possono variare secondo il vostro progetto e profilo'
    },
    footer: {
      description: 'Il vostro partner di fiducia per tutti i vostri progetti di finanziamento. Soluzioni di prestito adattate a privati e professionisti.',
      phone: '+352 40 63 48',
      email: 'infos@altusfinancegroup.com',
      address: '19 Rue Sigismond, L-2537 Luxembourg',
      hoursTitle: 'Orari di Apertura',
      hours: {
        weekdays: 'Lun - Ven: 9:00 - 19:00',
        weekend: 'Sab: 9:00 - 17:00',
        support: 'Supporto reattivo',
      },
      certificationsTitle: 'Certificazioni e Sicurezza',
      certifications: [
        'Regolamentato da ACPR',
        'Certificato ISO 27001',
        'Conforme RGPD',
        'Sicurezza SSL/TLS',
        'Membro FBF',
      ],
      productsTitle: 'I nostri prodotti',
      products: {
        personal: 'Prestiti personali',
        business: 'Prestiti aziendali',
        mortgage: 'Mutuo ipotecario',
        auto: 'Credito auto',
        renovation: 'Prestito ristrutturazione',
      },
      companyTitle: 'Azienda',
      careers: 'Carriere',
      legalTitle: 'Legale',
      legalLinks: {
        terms: 'Note legali',
        privacy: 'Informativa sulla privacy',
        cgu: 'CGU',
        cookies: 'Cookies',
        gdpr: 'GDPR',
      },
      helpTitle: 'Aiuto',
      helpLinks: {
        faq: 'FAQ',
        userGuide: 'Guida utente',
        support: 'Assistenza clienti',
        simulator: 'Simulatore di prestito',
        contactUs: 'Contattaci',
      },
      copyright: 'Altus Finance Group. Tutti i diritti riservati.',
      regulatory: 'Altus Finance Group è un marchio di finanziamento approvato dall\'ACPR. Organismo di credito soggetto al controllo della Banca di Francia.',
      disclaimer: 'Attenzione, prendere in prestito denaro costa anche denaro. Le informazioni in questa pagina sono fornite solo a scopo informativo e non costituiscono un\'offerta contrattuale. Tutte le richieste di credito sono soggette a revisione e accettazione del dossier. Un credito vi impegna e deve essere rimborsato. Verificate la vostra capacità di rimborso prima di impegnarvi.',
    },
    seo: {
      home: {
        title: 'Altus Finance Group - Professional & Personal Loans | Fast and Competitive Financing',
        description: 'Professional and personal loan solutions with Altus Finance Group. Get fast financing for your business or personal project. Competitive rates, simple and transparent process.',
      },
      about: {
        title: 'About Altus Finance Group - Our Mission and Values | Financing Solutions',
        description: 'Discover Altus Finance Group, leader in professional loan solutions with over 15 years of experience, 15,000+ satisfied clients and €500M in loans granted. Our mission: make financing accessible to all.',
      },
      contact: {
        title: 'Contact Us - Altus Finance Group | Questions About Our Professional Loans',
        description: 'Have a question about our financing solutions? Contact Altus Finance Group. Our team is available to support you with your professional loan project. Fast response guaranteed.',
      },
      howItWorks: {
        title: 'How to Get a Business Loan - Detailed Process | Altus Finance Group',
        description: 'Discover the complete process to obtain a professional loan with Altus Finance Group. From online application to fund release: criteria, required documents and timeframes. Response in 24-48h.',
      },
      forgotPassword: {
        title: 'Forgot Password | Altus Finance Group',
        description: 'Reset your password',
        emailSentTitle: 'Email Sent | Altus Finance Group',
        emailSentDescription: 'A reset link has been sent',
      },
      resetPassword: {
        title: 'Reset Password | Altus Finance Group',
        description: 'Create a new password for your account',
      },
      twoFactorSetup: {
        title: '2FA Setup | Altus Finance Group',
        description: 'Set up two-factor authentication to secure your account',
      },
      verifyTwoFactor: {
        title: '2FA Verification | Altus Finance Group',
        description: 'Two-factor verification',
      },
    },
    businessLoans: {
      title: 'Soluzioni per Professionisti',
      subtitle: 'Finanziamenti su misura per la tua azienda, microimpresa, PMI o libero professionista',
      businessLoan: 'Prestito Aziendale',
      businessLoanDesc: 'Finanziamento per i tuoi progetti aziendali, sviluppo e flusso di cassa',
      businessLoanFeatures: ['Risposta entro 48h', 'Tasso fisso', 'Rimborso flessibile'],
      cashFlowCredit: 'Credito di Tesoreria',
      cashFlowCreditDesc: 'Soluzione rapida per gestire le tue esigenze di capitale circolante',
      cashFlowCreditFeatures: ['Erogazione rapida', 'Senza garanzia fino a €50k', 'Flessibile'],
      equipmentFinancing: 'Finanziamento Attrezzature',
      equipmentFinancingDesc: 'Acquista le tue attrezzature e materiali professionali',
      equipmentFinancingFeatures: ['Fino al 100% di finanziamento', 'Opzione leasing', 'Deducibile fiscalmente'],
      commercialProperty: 'Prestito Immobiliare Commerciale',
      commercialPropertyDesc: 'Acquista i tuoi locali, uffici o magazzini professionali',
      commercialPropertyFeatures: ['Lunga durata', 'Anticipo dal 20%', 'Tasso competitivo'],
      lineOfCredit: 'Linea di Credito',
      lineOfCreditDesc: 'Credito revolving per le tue esigenze occasionali',
      lineOfCreditFeatures: ['Disponibile 24/7', 'Rimborso libero', 'Rinnovo automatico'],
      lineOfCreditDuration: 'Rinnovabile',
      vehicleFleet: 'Credito Veicoli Professionali',
      vehicleFleetDesc: 'Finanzia la tua flotta o veicoli commerciali',
      vehicleFleetFeatures: ['Leasing o credito classico', 'Opzione riacquisto', 'Assicurazione inclusa'],
      smeLoan: 'Prestiti PMI',
      smeLoanDesc: 'Soluzioni di finanziamento dedicate alle PMI per crescita, sviluppo e investimenti strategici',
      smeLoanFeatures: ['Importi elevati fino a €1M', 'Durata flessibile 1-10 anni', 'Supporto esperto'],
      amount: 'Importo',
      rate: 'TAEG',
      duration: 'Durata',
      months: 'mesi',
      years: 'anni',
      features: 'Vantaggi',
      learnMore: 'Per saperne di più',
      advantagesTitle: 'Vantaggi ALTUS Pro',
      advantages: [
        'Consulente dedicato per la tua azienda',
        'Studio personalizzato del tuo fascicolo',
        'Supporto durante tutto il processo',
        'Pacchetto business plan incluso',
      ],
      eligibilityTitle: 'Criteri di Ammissibilità',
      eligibility: [
        'Azienda registrata in Francia',
        'Attiva da oltre 6 mesi',
        'Nessun divieto bancario',
        'Bilanci finanziari aggiornati',
      ],
      rateDisclaimer: 'Tassi indicativi soggetti a studio e accettazione della richiesta. TAEG fisso.',
      simulateLoan: 'Simula il mio prestito aziendale',
      contactAdvisor: 'Contatta un consulente',
    },
    professionalFAQ: {
      title: 'Domande Frequenti',
      subtitle: 'Trova rapidamente le risposte alle tue domande',
      faqs: [
        {
          question: 'Quali documenti sono necessari per una richiesta di prestito aziendale?',
          answer: 'Per professionisti: Iscrizione aziendale inferiore a 3 mesi, identità del direttore, bilanci degli ultimi 3 anni, documenti fiscali completi, estratti conto bancari commerciali (6 mesi), business plan (per startup), previsioni finanziarie. Per privati: identità, prova di residenza, buste paga recenti e avviso fiscale.',
        },
        {
          question: 'Quale contributo personale è richiesto per un prestito aziendale?',
          answer: 'Il contributo personale varia per progetto: 10-15% per acquisto di attrezzature o materiali, 20-30% per creazione o acquisizione di attività, 20-25% per immobili commerciali. Un contributo maggiore può migliorare le condizioni di finanziamento e ridurre il tasso.',
        },
        {
          question: 'Quali sono i tempi per ottenere risposta e fondi?',
          answer: 'Approvazione iniziale entro 24-48h dopo l\'invio della domanda completa. Approvazione finale entro 48h. L\'erogazione dei fondi avviene 7-15 giorni dopo la firma del contratto e la configurazione delle garanzie. Tempo totale medio: 2-3 settimane.',
        },
        {
          question: 'Quali garanzie posso offrire per il mio prestito aziendale?',
          answer: 'Diverse opzioni: garanzie reali (ipoteca, pegno di avviamento, pegno di materiale), garanzie personali (fideiussione solidale del direttore), organismi di garanzia (BPI France 40-70%, SIAGI, France Active, SOCAMA), o assicurazione del mutuatario (obbligatoria: morte/PTIA, facoltativa: IPT/IPP/ITT).',
        },
        {
          question: 'Gli interessi del prestito sono deducibili fiscalmente?',
          answer: 'Sì! Gli interessi del prestito aziendale sono completamente deducibili dal reddito imponibile della tua azienda, riducendo così l\'imposta sugli utili. Inoltre, anche i premi assicurativi del mutuatario sono deducibili. L\'IVA su interessi e commissioni è recuperabile per le aziende soggette.',
        },
        {
          question: 'Posso ottenere un prestito se la mia azienda ha meno di un anno?',
          answer: 'Sì, finanziamo startup aziendali con un business plan solido e contributo personale del 20-30%. Valutiamo la tua esperienza professionale, fattibilità del progetto e proiezioni. Un prestito d\'onore (BPI France, Initiative France) può rafforzare la tua richiesta.',
        },
        {
          question: 'Posso rimborsare anticipatamente il mio prestito aziendale?',
          answer: 'Sì, tutti i nostri prestiti aziendali permettono il rimborso anticipato. Le penali sono limitate per legge: massimo 6 mesi di interessi o 3% del capitale residuo. Alcuni contratti prevedono il rimborso anticipato gratuito dopo un certo periodo.',
        },
        {
          question: 'Quali sono i tassi attuali per i prestiti aziendali?',
          answer: 'I nostri tassi TAEG variano per progetto: Immobili commerciali 2,9-5,5% (5-25 anni), Attrezzature 3,9-7,5% (2-5 anni), Avviamento 4,7% (5-10 anni), Flusso di cassa 4,0-9,0% (3-36 mesi), Veicoli professionali 3,2-6,5% (2-6 anni). Tassi personalizzati in base al profilo e alla durata.',
        },
        {
          question: 'Come funziona il processo di richiesta online?',
          answer: '1) Compila il nostro modulo online (5 min) e carica i tuoi documenti. 2) Analisi della tua richiesta da parte dei nostri esperti (24-48h). 3) Ricevi la tua approvazione di principio con condizioni. 4) Firma elettronica del contratto. 5) Configurazione garanzie. 6) Erogazione fondi sul tuo conto Altus.',
        },
        {
          question: 'Posso combinare diversi tipi di finanziamento?',
          answer: 'Sì, puoi combinare diverse soluzioni: prestito bancario + leasing per attrezzature, prestito aziendale + prestito d\'onore (BPI France) per rafforzare il patrimonio, o linea di credito + prestito ammortizzabile per combinare flessibilità e finanziamento a lungo termine.',
        },
        {
          question: 'Ci sono commissioni di richiesta e altri costi?',
          answer: 'Commissioni di richiesta: 1-2% dell\'importo per prestiti aziendali (negoziabile). Commissioni di garanzia: variabili a seconda del tipo (ipoteca, pegno). Assicurazione del mutuatario: 0,10% - 0,40% del capitale preso in prestito all\'anno. Tutte le commissioni sono dettagliate nella tua offerta di prestito.',
        },
        {
          question: 'Cosa succede se ho difficoltà di rimborso?',
          answer: 'Contattaci ai primi segnali di difficoltà. Possiamo esplorare: differimento temporaneo del pagamento, modulazione del pagamento, estensione del termine del prestito o riorganizzazione del credito. Il supporto preventivo è sempre preferibile.',
        },
      ],
      notFoundTitle: 'Non riesci a trovare la risposta alla tua domanda?',
      notFoundDesc: 'Il nostro team di esperti è disponibile dal lunedì al venerdì dalle 9:00 alle 19:00',
      contactUs: 'Contattaci',
      helpCenter: 'Centro assistenza',
    },
    admin: {
      common: {
        status: {pending: 'In sospeso', active: 'Attivo', approved: 'Approvato', rejected: 'Rifiutato', suspended: 'Sospeso', completed: 'Completato', signed: 'Firmato', inProgress: 'In corso'},
        actions: {approve: 'Approva', reject: 'Rifiuta', delete: 'Elimina', suspend: 'Sospendi', save: 'Salva', download: 'Scarica', upload: 'Carica', send: 'Invia', edit: 'Modifica', cancel: 'Annulla', disburse: 'Erogare'},
        labels: {user: 'Utente', userName: 'Nome utente', userEmail: 'Email utente', amount: 'Importo', type: 'Tipo', rate: 'Tasso', duration: 'Durata', status: 'Stato', date: 'Data', createdAt: 'Creato', actions: 'Azioni', fees: 'Commissioni', progress: 'Progresso', codes: 'Codici', recipient: 'Destinatario', contract: 'Contratto', months: 'mesi', total: 'Totale', active: 'attivi', pending: 'in sospeso', recent: 'Recenti', all: 'Tutti', noData: 'Nessun dato', loading: 'Caricamento...', error: 'Errore', success: 'Successo', balance: 'Saldo', loans: 'Prestiti'},
        messages: {error: 'Errore', success: 'Successo', updated: 'Aggiornato', approved: 'Approvato', rejected: 'Rifiutato', deleted: 'Eliminato', disbursed: 'Erogato', cannotApprove: 'Impossibile approvare', cannotReject: 'Impossibile rifiutare', cannotDelete: 'Impossibile eliminare', cannotUpdate: 'Impossibile aggiornare', loadError: 'Errore di caricamento'},
        empty: {noResults: 'Nessun risultato', noData: 'Nessun dato disponibile'},
      },
      dashboard: {title: 'Console di Amministrazione', description: 'Panoramica della piattaforma e gestione utenti', totalUsers: 'Totale Utenti', activeUsers: 'attivi', pendingUsers: 'in sospeso', transfers: 'Trasferimenti', transfersPending: 'in corso', loans: 'Prestiti', loansActive: 'attivi', totalVolume: 'Volume Totale', volumeDescription: 'Trasferimenti totali', recentUsers: 'Utenti Recenti', recentUsersDescription: 'Ultime registrazioni', recentTransfers: 'Trasferimenti Recenti', recentTransfersDescription: 'Ultime operazioni'},
      loans: {title: 'Gestione Prestiti', description: 'Gestire tutte le richieste di prestito della piattaforma', allLoans: 'Tutti i Prestiti', allLoansDescription: 'Elenco completo delle richieste di prestito', loanApproved: 'Prestito approvato', loanApprovedDesc: 'Il prestito è stato approvato con successo. Il contratto è stato generato.', loanRejected: 'Prestito rifiutato', loanRejectedDesc: 'Il prestito è stato rifiutato con successo', loanDeleted: 'Prestito eliminato', loanDeletedDesc: 'Il prestito è stato eliminato con successo', fundsDisbursed: 'Fondi erogati', fundsDisbursedDesc: 'I fondi sono stati erogati con successo. L\'utente è stato notificato.', contractGenerated: '📄 Generato', contractSigned: '✅ Firmato', approveReason: 'Motivo dell\'approvazione', rejectReason: 'Motivo del rifiuto', deleteReason: 'Motivo dell\'eliminazione', approveDialogDesc: 'Questa azione approverà il prestito di {amount} per {userName} e genererà il contratto.', rejectDialogTitle: 'Rifiuta prestito', rejectDialogDesc: 'Questa azione rifiuterà permanentemente il prestito. L\'utente sarà notificato.', disburseDialogTitle: 'Eroga fondi', disburseDialogDesc: 'Questa azione erogherà {amount} a {userName}. Il prestito diventerà attivo e l\'utente potrà effettuare trasferimenti.', deleteDialogTitle: 'Elimina prestito', deleteDialogDesc: 'Questa azione eliminerà permanentemente il prestito.'},
      transfers: {title: 'Gestione Trasferimenti', description: 'Approvare o sospendere richieste di trasferimento', allTransfers: 'Tutti i Trasferimenti', allTransfersDescription: 'Elenco completo dei trasferimenti di fondi', transferUpdated: 'Trasferimento aggiornato', transferUpdatedDesc: 'Lo stato del trasferimento è stato aggiornato con successo', approveDialogTitle: 'Approva trasferimento', approveDialogDesc: 'Questa azione approverà il trasferimento e aggiornerà il suo stato in "in corso".', suspendDialogTitle: 'Sospendi trasferimento', suspendDialogDesc: 'Questa azione sospenderà il trasferimento. Potrà essere riattivato successivamente.'},
    },
  },
  de: {
    hero: {
      title: 'Verwirklichen Sie Ihre Projekte mit der Altus Finance Group',
      subtitle: 'Finanzierungslösungen für Privat- und Geschäftskunden - Wettbewerbsfähige Zinsen und transparenter Prozess',
      cta1: 'Finanzierung beantragen',
      cta2: 'Mein Bereich',
      learnMore: 'Mehr erfahren',
      trustIndicator: 'Mehr als 15.000 zufriedene Kunden vertrauen uns',
      trustBadges: {
        response24h: 'Antwort in 24h',
        swissSecurity: 'Schweizer Banksicherheit',
        fastApproval: 'Schnelle Genehmigung',
      },
      calculator: {
        title: 'Berechnen Sie Ihr Budget',
        subtitle: 'Erhalten Sie eine sofortige Schätzung',
        loanAmount: 'Kreditbetrag',
        duration: 'Laufzeit (Monate)',
        monthlyPayment: 'Monatliche Zahlung',
        perMonth: 'pro Monat',
        applyNow: 'Jetzt beantragen',
        disclaimer: 'Kostenlose Anfrage - Keine Verpflichtung - Vertraulicher Prozess',
      },
      slides: [
        {
          title: 'Altus Finance Group',
          subtitle: 'Professionelle und sichere Finanzierungslösungen zur Unterstützung Ihres Wachstums.',
        },
        {
          title: 'Finanzexpertise der Spitzenklasse',
          subtitle: 'Maßgeschneiderte Lösungen für Ihre unternehmerischen und vermögensbezogenen Ambitionen.',
        },
        {
          title: 'Ihr vertrauenswürdiger Partner',
          subtitle: 'Persönliche Betreuung und absolute Diskretion für alle Ihre Finanzierungsprojekte.',
        },
        {
          title: 'Maßgeschneiderte Finanzlösungen',
          subtitle: 'Persönliche Begleitung zur Verwirklichung all Ihrer beruflichen und privaten Projekte',
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
      tagline: 'Premium-Finanzlösungen',
      more: 'Mehr',
      moreInfo: 'Weitere Informationen',
      language: 'Sprache',
      loansMenu: {
        label: 'Unsere Kredite',
        items: [
          {
            title: 'Privatkredit',
            description: 'Finanzieren Sie Ihre persönlichen Projekte mit günstigen Zinsen',
            href: '/loans/personal-credit',
          },
          {
            title: 'Kreditumschuldung',
            description: 'Bündeln Sie Ihre Kredite zur Vereinfachung der Rückzahlungen',
            href: '/loans/loan-refinancing',
          },
          {
            title: 'Leasing-Umschuldung',
            description: 'Optimieren Sie Ihre Kosten durch Umschuldung Ihres Leasings',
            href: '/loans/lease-refinancing',
          },
          {
            title: 'Kreditkarten-Umschuldung',
            description: 'Reduzieren Sie die Zinsen Ihrer Kreditkarten',
            href: '/loans/credit-card-refinancing',
          },
          {
            title: 'Verschiedene Kredite',
            description: 'Finanzierungslösungen für alle Ihre Bedürfnisse',
            href: '/products',
          },
          {
            title: 'KMU-Kredite',
            description: 'Unternehmensfinanzierung für das Wachstum Ihres Unternehmens',
            href: '/products',
          },
        ],
      },
      howItWorks: 'Wie es funktioniert',
      resources: 'Ressourcen',
      faq: 'FAQ',
      about: 'Über uns',
      contact: 'Kontakt',
      phone: '+352 40 63 48',
      dashboard: 'Übersicht',
      loans: 'Kredite',
      myLoans: 'Meine Kredite',
      newLoan: 'Kreditantrag',
      contracts: 'Verträge',
      loansSection: 'Kredite',
      transfers: 'Überweisungen',
      history: 'Verlauf',
      settings: 'Einstellungen',
      logout: 'Abmelden',
      users: 'Benutzer',
      documents: 'KYC-Dokumente',
      reports: 'Berichte',
    },
    contracts: {
      title: 'Vertragsverwaltung',
      description: 'Laden Sie Ihre Kreditverträge herunter, unterschreiben und senden Sie sie sicher zurück.',
      loanNumber: 'Kredit',
      approvedOn: 'Genehmigt am',
      actionRequired: 'Aktion erforderlich',
      step1: '1. Vertrag herunterladen',
      step1Description: 'Laden Sie Ihren Kreditvertrag herunter und lesen Sie ihn sorgfältig.',
      step2: '2. Unterschreiben und zurücksenden',
      step2Description: 'Unterschreiben Sie den Vertrag und senden Sie ihn im PDF-Format zurück.',
      downloadContract: 'Vertrag herunterladen',
      tabPending: 'Zu unterschreiben',
      tabReview: 'In Prüfung',
      tabCompleted: 'Abgeschlossen',
      inReview: 'In Prüfung',
      signed: 'Unterschrieben',
      noPendingContracts: 'Keine ausstehenden Verträge',
      noPendingContractsDescription: 'Alle Ihre Verträge wurden unterschrieben und versendet.',
      noReviewContracts: 'Keine Verträge in Prüfung',
      noReviewContractsDescription: 'Derzeit sind keine Verträge zur Prüfung ausstehend.',
      noCompletedContracts: 'Keine unterschriebenen Verträge',
      noCompletedContractsDescription: 'Ihre unterschriebenen Verträge werden hier angezeigt.',
      reviewMessage: 'Ihr unterschriebener Vertrag wurde empfangen und wird von unserem Team geprüft. Sie werden benachrichtigt, sobald die Mittel freigegeben sind.',
      signedSuccess: 'Vertrag erfolgreich unterschrieben und validiert',
      downloadOriginal: 'Originalvertrag herunterladen',
    },
    dashboard: {
      welcome: 'Willkommen',
      currentBalance: 'Aktuelles Guthaben',
      activeLoans: 'Aktive Kredite',
      totalBorrowed: 'Gesamt geliehen',
      availableCredit: 'Verfügbarer Kredit',
      lastUpdated: 'Zuletzt aktualisiert',
      borrowingCapacity: 'Kreditkapazität',
      canBorrowUpTo: 'Sie können bis zu leihen',
      quickActions: 'Schnellaktionen',
      newLoan: 'Neuer Kredit',
      transferFunds: 'Geld überweisen',
      transactionHistory: 'Transaktionsverlauf',
      fees: 'Gebühren',
      pendingTransfers: 'Ausstehende Überweisungen',
      availableFunds: 'Verfügbare Mittel',
      upcomingRepayments: 'Anstehende Rückzahlungen',
      yourGlobalBalance: 'Ihr Gesamtsaldo',
      noActiveLoans: 'Keine aktiven Kredite',
      noTransfers: 'Keine Überweisungen gefunden',
      dataLoadError: 'Fehler beim Laden der Daten',
      available: 'verfügbar',
      notifications: 'Benachrichtigungen',
      noNotifications: 'Keine Benachrichtigungen',
      viewDetails: 'Details anzeigen',
      availableOffers: 'Verfügbare Angebote für Sie',
      contractToSign: 'Zu unterzeichnender Vertrag',
      moreTransfers: 'weitere Überweisung(en)',
      goodMorning: 'Guten Morgen',
      goodAfternoon: 'Guten Nachmittag',
      goodEvening: 'Guten Abend',
      totalBalance: 'Gesamtsaldo',
      newTransfer: 'Neue Überweisung',
      requestLoan: 'Kredit beantragen',
      manageAccounts: 'Konten verwalten',
      cashflow: 'Cashflow',
      incomeExpensesSixMonths: 'Einnahmen und Ausgaben über 6 Monate',
      income: 'Einnahmen',
      expenses: 'Ausgaben',
      creditUtilization: 'Kreditauslastung',
      used: 'verwendet',
      recentActivity: 'Neueste Aktivität',
      latestTransactions: 'Neueste Transaktionen',
      viewAll: 'Alle anzeigen',
      noRecentTransactions: 'Keine aktuellen Transaktionen',
      pendingRequests: 'Ausstehende Anfragen',
      pendingRequestsDescription: 'Ihre Kreditanträge in Bearbeitung',
      noPendingRequests: 'Keine ausstehenden Anfragen',
      pendingLoan: 'Ausstehende Anfrage',
      yourActiveLoans: 'Ihre aktiven Darlehen',
      yourActiveLoansDescription: 'Verfolgen Sie Ihre Rückzahlungen und Fälligkeiten',
      activeLoan: 'Aktives Darlehen',
      repaid: 'Zurückgezahlt',
      upcomingDueDates: 'Bevorstehende Fälligkeiten',
      amount: 'Betrag',
      monthJan: 'Jan',
      monthFeb: 'Feb',
      monthMar: 'Mär',
      monthApr: 'Apr',
      monthMay: 'Mai',
      monthJun: 'Jun',
      serverError: 'Verbindung zum Server nicht möglich. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
      diagnosticInfo: 'Diagnoseinformationen (Entwicklung)',
      retry: 'Erneut versuchen',
      financeOverview: 'Hier ist eine Übersicht Ihrer Finanzen',
      yourCreditLimit: 'Ihr Kreditlimit',
      maximum: 'Maximum',
      activeLoanSingular: 'aktives Darlehen',
      activeLoansPlural: 'aktive Darlehen',
      loanNumber: 'Darlehen #',
      progression: 'Fortschritt',
      nextSixMonths: 'Nächste 6 Monate',
      repayment: 'Rückzahlung',
      noUpcomingRepayments: 'Keine bevorstehenden Rückzahlungen',
      pendingContracts: 'Ausstehende Verträge',
      contractsToSign: 'Vertrag/Verträge zu unterschreiben',
      generatedOn: 'Erstellt am',
      view: 'Ansehen',
    },
    loan: {
      pageTitle: 'Meine Kredite',
      pageDescription: 'Verwalten Sie Ihre Kredite und simulieren Sie Ihre Rückzahlungen',
      tabMyLoans: 'Meine Kredite',
      tabCalculator: 'Rechner',
      amount: 'Betrag',
      interestRate: 'Zinssatz',
      nextPayment: 'Nächste Zahlung',
      viewAll: 'Alle anzeigen',
      status: 'Status',
      downloadContract: 'Vertrag herunterladen',
      uploadSignedContract: 'Unterzeichneten Vertrag hochladen',
      downloading: 'Wird heruntergeladen...',
      uploading: 'Wird hochgeladen...',
      loanNumber: 'Kredit',
      requestSubmitted: 'Kreditanfrage eingereicht',
      requestSubmittedDesc: 'Ihre Anfrage wartet auf Genehmigung durch einen Administrator. Sie erhalten eine Benachrichtigung, sobald sie bearbeitet wurde.',
      requestError: 'Fehler beim Einreichen der Kreditanfrage',
      loanApproved: '🎉 Ihr Kredit wurde genehmigt!',
      approvalInstructions: 'Um Ihren Kredit abzuschließen, folgen Sie bitte diesen Schritten:',
      approvalStep1: 'Laden Sie Ihren Kreditvertrag herunter (PDF)',
      approvalStep2: 'Lesen Sie ihn sorgfältig durch und unterschreiben Sie ihn',
      approvalStep3: 'Senden Sie den unterschriebenen Vertrag (PDF) über die Schaltfläche unten zurück',
      downloadContractButton: '1. Vertrag herunterladen',
      uploadContractButton: '2. Unterschriebenen Vertrag hochladen',
      uploading2: 'Wird hochgeladen...',
    },
    transfer: {
      pageTitle: 'Meine Überweisungen',
      pageDescription: 'Verwalten und verfolgen Sie alle Ihre Geldtransfers',
      searchPlaceholder: 'Nach Empfänger oder ID suchen...',
      allStatuses: 'Alle Status',
      filterTitle: 'Filter und Suche',
      filterDescription: 'Verfeinern Sie Ihre Überweisungsliste',
      noTransfersFound: 'Keine Überweisungen gefunden',
      noTransfersMessage: 'Sie haben noch keine Überweisungen getätigt',
      createTransfer: 'Überweisung erstellen',
      newTransfer: 'Neue Überweisung',
      requestSubmitted: 'Anfrage eingereicht',
      documentVerification: 'Dokumentenprüfung',
      complianceCheck: 'Compliance-Prüfung',
      approvalPending: 'Genehmigung ausstehend',
      transferComplete: 'Überweisung abgeschlossen',
      pending: 'Ausstehend',
      inProgress: 'In Bearbeitung',
      approved: 'Genehmigt',
      rejected: 'Abgelehnt',
      completed: 'Abgeschlossen',
      suspended: 'Ausgesetzt',
      noAccount: 'Kein registriertes Konto',
      validation: 'Validierung',
      validating: 'Wird validiert...',
      onHold: 'Überweisung pausiert',
      processing: 'Überweisung wird verarbeitet',
      processingComplete: 'Überweisung abgeschlossen',
    },
    history: {
      pageTitle: 'Transaktionsverlauf',
      pageDescription: 'Vollständigen Verlauf aller Ihrer Transaktionen anzeigen',
      totalCredits: 'Gutschriften gesamt',
      totalDebits: 'Belastungen gesamt',
      totalTransactions: 'Transaktionen gesamt',
      filterTitle: 'Filter und Suche',
      filterDescription: 'Verfeinern Sie Ihren Transaktionsverlauf',
      searchPlaceholder: 'Nach Beschreibung oder ID suchen...',
      allTypes: 'Alle Typen',
      typeCredit: 'Gutschrift',
      typeDebit: 'Belastung',
      typeFee: 'Gebühr',
      noTransactionsFound: 'Keine Transaktionen gefunden',
      filterType: 'Typ',
      noTransactionsFoundFiltered: 'Versuchen Sie, Ihre Suchkriterien zu ändern',
      noTransactionsYet: 'Sie haben noch keine Transaktionen',
    },
    fee: {
      type: 'Gebührenart',
      reason: 'Grund',
      amount: 'Betrag',
      date: 'Datum',
      downloadStatement: 'Kontoauszug herunterladen',
      loanFees: 'Kreditgebühren',
      transferFees: 'Überweisungsgebühren',
      accountFees: 'Kontogebühren',
      feesToPay: 'Zu zahlende Gebühren',
      unpaidFeesCount: 'unbezahlte Gebühren',
      unpaidFeesSingular: 'unbezahlte Gebühr',
      pendingValidation: 'Validierung ausstehend',
      autoValidatedViaCode: 'Automatisch per Code validiert',
      totalUnpaid: 'Gesamt unbezahlt',
      totalOverall: 'Gesamtsumme',
    },
    common: {
      loading: 'Lädt...',
      error: 'Fehler',
      success: 'Erfolg',
      active: 'Aktiv',
      pending: 'Ausstehend',
      completed: 'Abgeschlossen',
      suspended: 'Ausgesetzt',
      saving: 'Wird gespeichert...',
      cancel: 'Abbrechen',
      save: 'Speichern',
      close: 'Schließen',
      noData: 'Keine Daten verfügbar',
      months: 'Monate',
      years: 'Jahre',
    },
    settings: {
      title: 'Einstellungen',
      profile: 'Profil',
      notifications: 'Benachrichtigungen',
      security: 'Sicherheit',
      appearance: 'Erscheinungsbild',
      personalInfo: 'Persönliche Informationen',
      updateInfo: 'Aktualisieren Sie Ihre Profilinformationen',
      fullName: 'Vollständiger Name',
      email: 'E-Mail',
      phone: 'Telefon',
      company: 'Unternehmen',
      saveChanges: 'Änderungen speichern',
      accountType: 'Kontotyp',
      yourAccountType: 'Ihr Konto',
      individualAccount: 'Privatkonto',
      businessAccount: 'Geschäftskonto',
      individualAccess: 'Zugang zu persönlichen Finanzierungsdienstleistungen',
      businessAccess: 'Vollständiger Zugang zu Unternehmensfinanzierungsdienstleistungen',
      verified: 'Verifiziert',
      notificationPreferences: 'Benachrichtigungseinstellungen',
      chooseNotifications: 'Wählen Sie, wie Sie benachrichtigt werden möchten',
      emailAlerts: 'E-Mail-Benachrichtigungen',
      emailAlertsDesc: 'Wichtige Benachrichtigungen per E-Mail erhalten',
      transferUpdates: 'Überweisungsaktualisierungen',
      transferUpdatesDesc: 'Benachrichtigungen über den Status Ihrer Überweisungen',
      loanReminders: 'Zahlungserinnerungen',
      loanRemindersDesc: 'Erinnerungen für Ihre Kreditraten',
      marketingEmails: 'Marketing-E-Mails',
      marketingEmailsDesc: 'Neuigkeiten und Sonderangebote erhalten',
      savePreferences: 'Einstellungen speichern',
      changePassword: 'Passwort ändern',
      updatePassword: 'Aktualisierung Ihres Passworts',
      currentPassword: 'Aktuelles Passwort',
      newPassword: 'Neues Passwort',
      confirmNewPassword: 'Neues Passwort bestätigen',
      themeSettings: 'Design-Einstellungen',
      chooseTheme: 'Wählen Sie Ihr bevorzugtes Design',
      lightMode: 'Heller Modus',
      darkMode: 'Dunkler Modus',
      systemMode: 'System',
      languageSettings: 'Spracheinstellungen',
      chooseLanguage: 'Wählen Sie Ihre Sprache',
      changePhoto: 'Foto ändern',
      uploading: 'Hochladen...',
      twoFactorAuth: 'Zwei-Faktor-Authentifizierung',
      twoFactorAuthDesc: 'Fügen Sie Ihrem Konto eine zusätzliche Sicherheitsebene hinzu',
      twoFactorEnabled: 'Zwei-Faktor-Authentifizierung aktiviert',
      enable2FA: '2FA aktivieren',
      twoFactorEnabledDesc: 'Ihr Konto ist durch Zwei-Faktor-Authentifizierung geschützt',
      twoFactorDisabledDesc: 'Schützen Sie Ihr Konto mit Zwei-Schritt-Verifizierung über Google Authenticator',
      disable: 'Deaktivieren',
      configure: 'Konfigurieren',
      enabled: 'Aktiviert',
      twoFactorActiveMessage: 'Ihr Konto ist mit Google Authenticator gesichert. Bei jeder Anmeldung wird ein Code angefordert.',
      theme: 'Thema',
      themeDesc: 'Wählen Sie Ihr bevorzugtes Thema',
      light: 'Hell',
      dark: 'Dunkel',
      languageLabel: 'Sprache',
      languageDesc: 'Wählen Sie Ihre Sprache',
      disable2FASuccess: 'Erfolg',
      disable2FASuccessDesc: '2FA erfolgreich deaktiviert',
      disable2FAError: 'Fehler beim Deaktivieren von 2FA',
    },
    messages: {
      profileUpdated: 'Profil aktualisiert',
      profileUpdatedDesc: 'Ihre Informationen wurden erfolgreich gespeichert.',
      preferencesUpdated: 'Einstellungen gespeichert',
      preferencesUpdatedDesc: 'Ihre Benachrichtigungseinstellungen wurden aktualisiert.',
      passwordChanged: 'Passwort geändert',
      passwordChangedDesc: 'Ihr Passwort wurde erfolgreich geändert.',
      passwordMismatch: 'Die Passwörter stimmen nicht überein',
      errorUpdatingProfile: 'Fehler beim Aktualisieren des Profils',
      errorUpdatingPreferences: 'Fehler beim Aktualisieren der Einstellungen',
      errorChangingPassword: 'Fehler beim Ändern des Passworts',
      avatarUpdated: 'Profilbild aktualisiert',
      avatarUpdatedDesc: 'Ihr Profilbild wurde erfolgreich aktualisiert.',
      errorUploadingAvatar: 'Fehler beim Hochladen des Fotos',
      invalidFileType: 'Nicht erlaubter Dateityp. Nur JPEG-, PNG- und WebP-Bilder sind erlaubt.',
      fileTooLarge: 'Die Datei ist zu groß (max 5MB).',
    },
    about: {
      title: 'Über die Altus Finance Group',
      subtitle: 'Ihr vertrauenswürdiger Partner für die Finanzierung von Privat- und Geschäftskunden',
      mission: 'Unsere Mission',
      missionText: 'Bei der Altus Finance Group demokratisieren wir den Zugang zu Finanzierung für alle. Ob Sie eine Privatperson mit einem persönlichen Projekt oder ein wachsendes Unternehmen sind, wir bieten moderne, transparente und auf Ihre Bedürfnisse zugeschnittene Kreditlösungen. Unsere fortschrittliche Technologie ermöglicht es uns, Ihre Situation schnell zu analysieren und Ihnen personalisierte Angebote mit wettbewerbsfähigen Zinsen zu unterbreiten. Wir glauben an totale Transparenz: keine versteckten Gebühren, klare Bedingungen und Begleitung bei jedem Schritt.',
      stats: {
        clients: 'Aktive Kunden',
        loansProvided: 'Gewährte Kredite',
        successRate: 'Zufriedenheitsrate',
        yearsExperience: 'Jahre Erfahrung',
      },
    },
    howItWorks: {
      ...howItWorksEN,
      title: 'Wie es funktioniert',
      subtitle: 'Ein 100% digitaler, ultraschneller Prozess in 4 einfachen Schritten',
      step1Title: 'Registrierung - 3 Minuten',
      step1Desc: 'Erstellen Sie Ihr Altus Finance Group-Konto in wenigen Minuten. Geben Sie Ihre persönlichen oder geschäftlichen Informationen sicher ein. Die sofortige Identitätsprüfung (KYC) gewährleistet die Sicherheit Ihres Kontos.',
      step1Duration: '3 min',
      step2Title: 'Anmeldung - Zugang zu Ihrem Dashboard',
      step2Desc: 'Melden Sie sich bei Ihrem sicheren persönlichen Kundendashboard an. Sie finden dort alle notwendigen Tools, um Ihre Finanzen zu verwalten und Kreditanträge zu stellen. 24/7-Zugang von jedem Gerät.',
      step2Duration: 'Sofort',
      step3Title: 'Antrag und Analyse - Sofortige Antwort',
      step3Desc: 'Stellen Sie Ihren Kreditantrag direkt über Ihr Benutzerdashboard. Füllen Sie das Formular mit dem gewünschten Betrag aus und laden Sie Ihre Belege hoch. Dank unserer Echtzeit-Analysetechnologie erhalten Sie eine grundsätzliche Antwort innerhalb von Minuten bis maximal 24 Stunden.',
      step3Duration: '< 24h',
      step4Title: 'Sofortige Freigabe - Gelder sofort verfügbar',
      step4Desc: 'Sobald Ihr Antrag genehmigt ist, unterschreiben Sie Ihren Vertrag elektronisch über Ihr Dashboard. Die Mittel werden sofort auf Ihr sicheres Altus Finance Group-Konto freigegeben. Sie können diese dann sofort und ohne zusätzliche Gebühren auf Ihr persönliches oder geschäftliches Bankkonto überweisen.',
      step4Duration: 'Sofort',
      averageTimeValue: 'Maximal 24 Stunden von der Antragstellung bis zur Freigabe der Mittel',
    },
    products: {
      title: 'Unsere Kreditlösungen',
      subtitle: 'Produkte, die auf Ihre Bedürfnisse zugeschnitten sind - Privat- und Geschäftskunden',
      businessTitle: 'Geschäftskredite',
      businessSubtitle: 'Produkte, die auf Ihre geschäftlichen Bedürfnisse zugeschnitten sind',
      termLoans: 'Geschäftsdarlehen',
      termLoansDesc: 'Mittel- und langfristige Finanzierung für Ihre strategischen Investitionen: Entwicklung, Akquisition, Expansion. Von €10.000 bis €500.000 über 1 bis 7 Jahre. Feste Zinsen von 3,5% bis 8,5% effektiver Jahreszins je nach Profil. Vorzeitige Rückzahlung ohne Strafe.',
      lineOfCredit: 'Revolvierende Kreditlinie',
      lineOfCreditDesc: 'Flexibler Kredit zur Verwaltung Ihrer Liquidität und zur Bewältigung unvorhergesehener Ereignisse. Von €5.000 bis €100.000. Zinsen von 4,0% bis 9,0% effektiver Jahreszins. Zahlen Sie nur Zinsen auf genutzte Beträge. Automatische Wiederauffüllung des verfügbaren Kapitals.',
      equipmentFinancing: 'Ausrüstungsfinanzierung',
      equipmentFinancingDesc: 'Finanzieren Sie Ihre professionelle Ausrüstung, Nutzfahrzeuge, Maschinen, Werkzeuge. Von €20.000 bis €300.000 über 2 bis 5 Jahre. Zinsen von 3,9% bis 7,5% effektiver Jahreszins. Die Ausrüstung kann als Sicherheit dienen und die Kreditvergabe erleichtern.',
      invoiceFactoring: 'Factoring / Forderungsverkauf',
      invoiceFactoringDesc: 'Verwandeln Sie Ihre Kundenrechnungen in sofortige Liquidität, um Ihren Cashflow zu verbessern. Vorschuss von bis zu 90% des Rechnungsbetrags innerhalb von 24-48h. Kosten von 1% bis 3% je nach Volumen und Fälligkeit. Ideal für B2B-Unternehmen.',
    },
    contact: {
      title: 'Kontaktieren Sie uns',
      subtitle: 'Unser Team hört Ihnen zu',
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
      subtitle: 'Alle Informationen, um Sie bei Ihrem Projekt zu begleiten',
      faqTitle: 'Häufig gestellte Fragen',
      faqs: [
        {
          question: 'Welche Dokumente werden für einen Kreditantrag benötigt?',
          answer: 'Für Privatpersonen: Personalausweis, Wohnsitznachweis, letzte Gehaltsabrechnungen (3 Monate), Steuerbescheid. Für Unternehmen: Handelsregisterauszug weniger als 3 Monate alt, Bilanzen und Gewinn- und Verlustrechnungen (letzten 2 Geschäftsjahre), Geschäftskontenauszüge (3-6 Monate), Personalausweis des Geschäftsführers. Alle Dokumente können direkt sicher online hochgeladen werden.',
        },
        {
          question: 'Wie lange dauert der Genehmigungsprozess?',
          answer: 'Dank unserer Echtzeit-Analysetechnologie erhalten Sie eine grundsätzliche Antwort in wenigen Minuten bis maximal 24 Stunden. Sobald genehmigt, werden die Mittel sofort auf Ihr sicheres Altus Finance Group-Konto freigegeben. Sie können sie dann auf Ihr persönliches oder geschäftliches Bankkonto überweisen, wann immer Sie möchten, sofort und ohne zusätzliche Kosten.',
        },
        {
          question: 'Was ist der Mindest- und Höchstbetrag, den ich leihen kann?',
          answer: 'Privatkredite: von €1.000 bis €75.000. Immobilienkredite: von €50.000 bis €500.000. Geschäftsdarlehen: von €10.000 bis €500.000. Kreditlinien: von €5.000 bis €100.000. Der genaue Betrag hängt von Ihrer Rückzahlungsfähigkeit ab, die anhand Ihres Einkommens, Ihrer Belastungen und Ihrer Kreditgeschichte berechnet wird.',
        },
        {
          question: 'Kann ich meinen Kredit vorzeitig zurückzahlen?',
          answer: 'Ja, alle unsere Kredite ermöglichen eine vorzeitige Rückzahlung ohne Strafe oder versteckte Kosten. Sie können Ihren Kredit jederzeit teilweise oder vollständig über Ihren Kundenbereich zurückzahlen. Dies reduziert automatisch die Gesamtzinskosten. Sie behalten somit die volle Kontrolle über Ihren Kredit.',
        },
        {
          question: 'Was sind die Zulassungskriterien für einen Kredit?',
          answer: 'Privatpersonen: volljährig sein, in Deutschland wohnen, regelmäßiges Einkommen haben und Verschuldungsgrad <40%. Unternehmen: seit 6+ Monaten aktiv, monatlicher Umsatz von mindestens €15.000, keine jüngsten Zahlungsausfälle. Die Kreditwürdigkeit wird automatisch über Kreditauskunfteien überprüft. Die Fälle werden einzeln geprüft.',
        },
        {
          question: 'Wie werden die Zinssätze berechnet?',
          answer: 'Unsere Zinssätze werden von einem Algorithmus berechnet, der mehrere Faktoren analysiert: Ihre Kreditwürdigkeit, die Kreditlaufzeit, den geliehenen Betrag, Ihr Einkommen und Ihre Belastungen, Ihre Rückzahlungshistorie und die finanzielle Gesundheit (für Unternehmen). Die Zinssätze liegen zwischen 0,5% und 9,0% effektiver Jahreszins je nach Profil und Kreditart. Unsere Zinssätze gehören dank unseres Netzwerks von Finanzpartnern zu den wettbewerbsfähigsten auf dem Markt.',
        },
        {
          question: 'Gibt es Bearbeitungsgebühren oder versteckte Kosten?',
          answer: 'Totale Transparenz: Wir zeigen alle Kosten bereits bei der Simulation an. Bearbeitungsgebühren: €0 bis €150 je nach Kreditart. Keine Gebühren für vorzeitige Rückzahlung. Keine monatlichen Verwaltungsgebühren. Der effektive Jahreszins beinhaltet alle Kosten für einen einfachen Vergleich mit anderen Angeboten.',
        },
        {
          question: 'Wie berechne ich meine Kreditfähigkeit?',
          answer: 'Ihre Kreditfähigkeit hängt von Ihrem Verschuldungsgrad ab, der 40% Ihres Nettoeinkommens nicht überschreiten sollte. Formel: (Monatliches Einkommen × 0,40) - Bestehende Kreditbelastungen = Maximal verfügbare Rate. Unser Online-Simulator berechnet automatisch Ihre Kreditfähigkeit und schlägt Ihnen angepasste Beträge vor. Sie können die Laufzeit anpassen, um die Raten zu modulieren.',
        },
        {
          question: 'Kann ich einen Kredit mit niedriger Bonität erhalten?',
          answer: 'Ja, wir akzeptieren verschiedene Profile. Unsere Bewertungstechnologie analysiert auch alternative Daten über die einfache Bonität hinaus: berufliche Stabilität, wiederkehrendes Einkommen, Ersparnisse, Bankenhistorie. Scores ab 500-560 werden für bestimmte Produkte akzeptiert. Selbst mit einer unvollkommenen Historie können Sie einen Kredit erhalten, aber die Zinssätze werden dem Risiko angepasst.',
        },
        {
          question: 'Was passiert, wenn ich eine Rate nicht bezahlen kann?',
          answer: 'Kontaktieren Sie uns sofort. Wir bieten mehrere Lösungen: Ratenstundung (temporäre Aussetzung), Ratensenkung, Neustrukturierung des Kredits. Verzugszinsen können anfallen, aber wir bevorzugen immer den Dialog, um eine auf Ihre Situation angepasste Lösung zu finden. Eine personalisierte Begleitung steht bei Schwierigkeiten zur Verfügung.',
        },
      ],
    },
    legal: {
      termsTitle: 'Nutzungsbedingungen',
      privacyTitle: 'Datenschutzrichtlinie',
      lastUpdated: 'Zuletzt aktualisiert: Januar 2025',
      terms: {
        section1Title: '1. Annahme der Bedingungen',
        section1Content: 'Durch den Zugriff auf und die Nutzung der Dienste der Altus Finance Group stimmen Sie zu und erklären sich damit einverstanden, an die Bedingungen dieser Vereinbarung gebunden zu sein.',
        section2Title: '2. Nutzungslizenz',
        section2Content: 'Die Genehmigung wird erteilt, um temporär auf die Materialien (Informationen oder Software) auf der Plattform der Altus Finance Group nur für persönliche, nicht-kommerzielle Ansicht zuzugreifen.',
        section3Title: '3. Kreditvertrag',
        section3Content: 'Alle Kredite unterliegen der Kreditgenehmigung. Die Bedingungen werden in einem separaten Kreditvertrag bei Genehmigung Ihres Antrags bereitgestellt.',
        section4Title: '4. Erklärungen und Garantien',
        section4Content: 'Sie erklären und garantieren, dass alle in Ihrem Kreditantrag bereitgestellten Informationen korrekt, vollständig und aktuell sind.',
        section5Title: '5. Haftungsbeschränkung',
        section5Content: 'In keinem Fall haftet die Altus Finance Group oder ihre Lieferanten für Schäden, die aus der Nutzung oder der Unfähigkeit zur Nutzung der Materialien auf der Plattform der Altus Finance Group entstehen.',
        section6Title: '6. Änderungen',
        section6Content: 'Die Altus Finance Group kann diese Nutzungsbedingungen jederzeit ohne Vorankündigung überarbeiten. Durch die Nutzung dieser Plattform stimmen Sie zu, an die aktuelle Version dieser Bedingungen gebunden zu sein.',
      },
      privacy: {
        section1Title: '1. Informationen, die wir sammeln',
        section1Content: 'Wir sammeln die Informationen, die Sie uns direkt zur Verfügung stellen, wenn Sie ein Konto erstellen, einen Kredit beantragen oder mit uns kommunizieren. Dies kann Ihren Namen, E-Mail-Adresse, Telefonnummer, Geschäftsinformationen und Finanzdaten umfassen.',
        section2Title: '2. Wie wir Ihre Informationen verwenden',
        section2Content: 'Wir verwenden die gesammelten Informationen, um:',
        section2List: [
          'Ihre Kreditanträge zu bearbeiten',
          'Mit Ihnen über unsere Dienste zu kommunizieren',
          'Unsere Plattform und Dienste zu verbessern',
          'Gesetzliche und regulatorische Anforderungen zu erfüllen',
        ],
        section3Title: '3. Weitergabe von Informationen',
        section3Content: 'Wir verkaufen Ihre persönlichen Informationen nicht. Wir können Ihre Informationen teilen mit:',
        section3List: [
          'Kreditauskunfteien zur Kreditbewertung',
          'Dienstleistern, die uns bei unseren Betrieben unterstützen',
          'Regulierungsbehörden und Strafverfolgungsbehörden, wenn gesetzlich vorgeschrieben',
        ],
        section4Title: '4. Datensicherheit',
        section4Content: 'Wir implementieren angemessene technische und organisatorische Maßnahmen, um Ihre persönlichen Informationen vor unbefugtem Zugriff, Änderung, Offenlegung oder Zerstörung zu schützen.',
        section5Title: '5. Ihre Rechte',
        section5Content: 'Sie haben das Recht, auf Ihre persönlichen Informationen zuzugreifen, sie zu korrigieren oder zu löschen. Sie können auch gegen bestimmte Verarbeitungen Ihrer Daten Einspruch erheben.',
        section6Title: '6. Cookies',
        section6Content: 'Wir verwenden Cookies und ähnliche Tracking-Technologien, um Ihre Erfahrung auf unserer Plattform zu verbessern. Sie können Cookies über Ihre Browsereinstellungen kontrollieren.',
        section7Title: '7. Kontaktieren Sie uns',
        section7Content: 'Wenn Sie Fragen zu dieser Datenschutzrichtlinie haben, kontaktieren Sie uns bitte unter privacy@altus-group.com',
      },
    },
    individualLoans: {
      title: 'Privatkredite',
      subtitle: 'Finanzierungslösungen, die auf all Ihre Lebensprojekte zugeschnitten sind',
      personalLoan: 'Privatkredit',
      personalLoanDesc: 'Flexible Finanzierung für alle Ihre Projekte ohne Verwendungsnachweis: Reise, Hochzeit, Gerätekauf. Von €1.000 bis €75.000 über 12 bis 84 Monate. Effektiver Jahreszins von 2,9% bis 7,9% je nach Profil. Antwort in 48h, Mittel in 5 Tagen.',
      mortgageLoan: 'Immobilienkredit',
      mortgageLoanDesc: 'Finanzieren Sie Ihren Hauptwohnsitz, Zweitwohnsitz oder Mietobjekt. Von €50.000 bis €500.000 über 10 bis 25 Jahre. Feste oder variable Zinsen ab 1,5% effektiver Jahreszins. Bis zu 110% Eigenkapital inklusive Notarkosten. Kostenlose personalisierte Simulation.',
      autoLoan: 'Auto- / Motorradkredit',
      autoLoanDesc: 'Finanzieren Sie Ihr neues oder gebrauchtes Fahrzeug, Auto oder Motorrad. Von €3.000 bis €75.000 über 12 bis 84 Monate. Effektiver Jahreszins von 1,9% bis 5,9%. Möglichkeit, Versicherung und Zubehör einzuschließen. Sofortige Antwort bei Ihrem Partnerhändler.',
      studentLoan: 'Studentenkredit',
      studentLoanDesc: 'Finanzieren Sie Ihr Hochschulstudium, Studiengebühren, Studentenwohnung. Von €1.000 bis €50.000. Vollständiger Rückzahlungsaufschub bis zum Studienende. Vorzugszinsen ab 1,5% effektiver Jahreszins. Ohne Elternbürgschaft unter Bedingungen.',
      greenLoan: 'Grüner Kredit / Öko-PTZ',
      greenLoanDesc: 'Finanzieren Sie energetische Renovierungsarbeiten: Isolierung, Wärmepumpe, Solarpaneele. Von €7.000 bis €50.000. Subventionierte Zinsen ab 0,5% effektiver Jahreszins. Berechtigt für staatliche Beihilfen. Bis zu €30.000 ohne Eigenkapital.',
      renovationLoan: 'Renovierungskredit',
      renovationLoanDesc: 'Renovieren, erweitern, verschönern Sie Ihr Zuhause. Von €1.500 bis €75.000 über 12 bis 120 Monate. Effektiver Jahreszins von 2,5% bis 6,9%. Ohne Hypothekengarantie bis €50.000. Schrittweise Freigabe nach Baufortschritt möglich.',
      miscellaneousCredit: 'Diverse Kredite',
      miscellaneousCreditDesc: 'Finanzieren Sie alle Ihre persönlichen Projekte: Veranstaltungen, Ausrüstung, Freizeit, Gesundheit, Wohlbefinden. Von €500 bis €50.000 über 6 bis 96 Monate. Effektiver Jahreszins von 2,9% bis 8,9%. Vereinfachtes Verfahren, schnelle Antwort in 24h. Mittelauszahlung in 3-5 Tagen.',
      amount: 'Betrag',
      rate: 'Effektiver Jahreszins',
      duration: 'Laufzeit',
      rateDisclaimer: 'Indikative Zinssätze unterliegen Zulassungsbedingungen. Fester effektiver Jahreszins. Ein Kredit verpflichtet Sie und muss zurückgezahlt werden. Überprüfen Sie Ihre Rückzahlungsfähigkeit, bevor Sie sich verpflichten.',
      compareLoans: 'Alle Kredite vergleichen',
    },
    features: {
      title: 'Warum die Altus Finance Group wählen?',
      subtitle: 'Eine moderne und transparente Kreditplattform, die Ihre Bedürfnisse in den Mittelpunkt stellt',
      security: 'Banksicherheit auf Unternehmensniveau',
      securityDesc: 'AES-256-Verschlüsselung, DSGVO-Konformität, SOC 2 Type II- und ISO 27001-Zertifizierung. Ihre Finanzdaten sind mit den gleichen Standards wie bei großen Banken geschützt. Multi-Faktor-Authentifizierung und 24/7-Überwachung gegen Betrug.',
      fast: 'Express-Antwort - Minuten bis 24h',
      fastDesc: 'Unsere KI-Technologie analysiert Ihren Fall in Echtzeit. Genehmigungsantwort in Minuten bis maximal 24 Stunden. Mittel sofort auf Ihr sicheres Altus-Konto freigegeben. Dann auf Ihr Bankkonto überweisen, wann Sie möchten. 100% digital, null Papierkram.',
      competitive: 'Zu den niedrigsten Zinsen auf dem Markt',
      competitiveDesc: 'Dank unserem Netzwerk von 50+ Finanzpartnern und optimierter Bewertungstechnologie verhandeln wir die besten Zinsen für Sie: von 0,5% bis 9,0% effektiver Jahreszins je nach Profil und Kreditart. Automatischer Vergleich, um das beste Angebot zu garantieren.',
      flexible: 'Maximale Flexibilität ohne Strafe',
      flexibleDesc: 'Kostenlose vorzeitige Rückzahlung jederzeit. Mögliche Ratenmodulierung entsprechend Ihrer Situation. Ratenstundung bei Schwierigkeiten. Wahl des Abbuchungsdatums. Sie behalten die volle Kontrolle über Ihren Kredit.',
    },
    stats: {
      clients: 'Zufriedene Kunden',
      funded: 'Gewährte Kredite',
      satisfaction: 'Zufriedenheitsrate',
      years: 'Jahre Erfahrung',
    },
    partners: {
      title: 'Unsere Finanzpartner',
      subtitle: 'Wir arbeiten mit einem umfangreichen Netzwerk führender Banken und Finanzinstitute zusammen, um Ihnen die besten Konditionen zu garantieren',
      banksNetwork: 'Partnerbanken',
      loansFunded: 'Finanzierte Kredite',
      yearsExperience: 'Jahre Erfahrung',
      satisfactionRate: 'Zufriedenheitsrate',
      networkTitle: 'Ein Netzwerk Vertrauenswürdiger Partner',
      benefits: [
        'Zugang zu über 50 Finanzinstituten zum Vergleich der besten Angebote',
        'Verhandlung von Vorzugskonditionen dank unseres Geschäftsvolumens',
        'Anerkannte Expertise im Kreditvermittlung seit über 25 Jahren'
      ]
    },
    testimonials: {
      title: 'Was unsere Kunden sagen',
      subtitle: 'Mehr als 15.000 Privat- und Geschäftskunden vertrauen uns',
      reviews: [
        { name: 'Hans Müller', role: 'Unternehmer', company: 'Restaurant Genuss', text: 'Die Altus Finance Group hat es mir ermöglicht, schnell Finanzierung zu erhalten, um mein Geschäft zu entwickeln. Der Prozess war einfach und transparent, ich habe die Mittel in weniger als einer Woche erhalten.', rating: 5 },
        { name: 'Anna Schmidt', role: 'Privatperson', company: 'Eigentümerin', text: 'Ausgezeichneter Service für meinen Immobilienkredit. Die Berater sind aufmerksam und haben den besten Zins für mich gefunden. Ich empfehle ihre Dienstleistungen sehr.', rating: 5 },
        { name: 'Thomas Weber', role: 'Finanzdirektor', company: 'Tech Solutions GmbH', text: 'Dank der Altus Finance Group konnten wir den Kauf neuer Ausrüstung finanzieren. Die Zahlungsflexibilität und der wettbewerbsfähige Zins machten den Unterschied.', rating: 5 },
        { name: 'Sophie Fischer', role: 'Handwerkerin', company: 'Traditionelle Bäckerei', text: 'Ein professioneller und effizienter Service. Ich habe meinen Renovierungskredit ohne Komplikationen erhalten. Das Team hat mich bei jedem Schritt begleitet.', rating: 5 },
        { name: 'Max Schneider', role: 'Händler', company: 'Mode & Accessoires', text: 'Ich bin sehr zufrieden mit der erhaltenen Finanzierung für die Erweiterung meines Geschäfts. Altus Finance Group versteht wirklich die Bedürfnisse von Unternehmern.', rating: 5 },
        { name: 'Klaus Wagner', role: 'Privatperson', company: 'Familienvater', text: 'Mein Autokredit wurde schnell mit einem ausgezeichneten Zins genehmigt. Der Online-Simulator ermöglichte es mir, die Angebote einfach zu vergleichen.', rating: 5 },
        { name: 'Petra Hoffmann', role: 'Krankenschwester', company: 'St. Josef Krankenhaus', text: 'Ich konnte meine energetischen Renovierungsarbeiten dank ihres grünen Kredits finanzieren. Die geförderten Zinssätze und die Beratung zu staatlichen Beihilfen haben mir sehr geholfen.', rating: 5 },
        { name: 'Michael Becker', role: 'Manager', company: 'Restaurant Der Gourmet', text: 'Die revolvierende Kreditlinie hat meinen Cashflow während der schwierigen Zeit gerettet. Maximale Flexibilität und vorzeitige Rückzahlung ohne Gebühren.', rating: 5 },
        { name: 'Sabine Schulz', role: 'Architektin', company: 'Schulz & Partner', text: '100% digitaler und schneller Prozess. Ich habe meinen Geschäftskredit in 3 Tagen erhalten. Die Benutzeroberfläche ist intuitiv und klar.', rating: 5 },
        { name: 'Felix Koch', role: 'Student', company: 'Handelshochschule', text: 'Der Studentenkredit mit aufgeschobener Zahlung hat es mir ermöglicht, mein Studium stressfrei zu finanzieren. Vorzugskonditionen und ohne elterliche Bürgschaft.', rating: 5 },
        { name: 'Julia Richter', role: 'Apothekerin', company: 'Zentral-Apotheke', text: 'Finanzierung medizinischer Geräte in 48h genehmigt. Der Kundenservice ist reaktionsschnell und professionell. Sehr zufrieden mit der Begleitung.', rating: 5 },
        { name: 'Stefan Meyer', role: 'Entwickler', company: 'Tech Startup', text: 'Privatkredit für mein berufliches Weiterbildungsprojekt. Kein Verwendungsnachweis erforderlich, transparenter und schneller Prozess.', rating: 5 },
        { name: 'Monika Braun', role: 'Lehrerin', company: 'Goethe-Gymnasium', text: 'Mein Immobilienkredit wurde mit einem sehr wettbewerbsfähigen Zins genehmigt. Die Online-Simulation half mir, das beste Angebot zu vergleichen und auszuwählen.', rating: 5 },
        { name: 'Lars Zimmermann', role: 'Unternehmer', company: 'Innovative Startup', text: 'Die Ausrüstungsfinanzierung ermöglichte es mir, die notwendigen Maschinen für den Start meiner Produktion zu kaufen. Rückzahlung angepasst an meinen Cashflow.', rating: 5 },
        { name: 'Andrea Krüger', role: 'Anwältin', company: 'Kanzlei Krüger', text: 'Ultra-schneller Genehmigungsprozess dank KI-Technologie. Ich erhielt eine grundsätzliche Antwort in weniger als 24 Stunden. Beeindruckend!', rating: 5 },
        { name: 'Markus Klein', role: 'Klempner', company: 'Klein Sanitär', text: 'Renovierungskredit für die Renovierung meines Geschäftslokals. Schrittweise Freigabe nach Fortschritt, genau das, was ich brauchte.', rating: 5 },
        { name: 'Christina Wolf', role: 'Designerin', company: 'Kreativstudio', text: 'Die Kreditlinie gab mir die nötige Flexibilität, um die Schwankungen meiner Geschäftskasse zu verwalten. Ich zahle nur für das, was ich nutze.', rating: 5 },
        { name: 'Ralf Schmidt', role: 'Arzt', company: 'Medizinische Praxis', text: 'Finanzierung meiner Praxiseröffnung. Wichtiger Betrag schnell mit einem vorteilhaften festen Zinssatz genehmigt. Sehr professionell.', rating: 5 },
        { name: 'Susanne Lehmann', role: 'Floristin', company: 'Blumen & Natur', text: 'Geschäftskredit für die Entwicklung meines Online-Shops. Der Prozess war einfach und das Team begleitete mich bei jedem Schritt. Danke!', rating: 5 },
        { name: 'Oliver Frank', role: 'Ingenieur', company: 'Freiberuflicher Berater', text: 'Autokredit für mein Geschäftsfahrzeug. Sofortige Antwort und Mittel in 3 Tagen überwiesen. Tadelloser Service und wettbewerbsfähiger Zins.', rating: 5 },
        { name: 'Nicole Baumann', role: 'Kosmetikerin', company: 'Schönheitsinstitut', text: 'Finanzierung für den Kauf neuer kosmetischer Geräte. Keine versteckten Gebühren, alles ist von Anfang an transparent. Ich empfehle sehr.', rating: 5 },
        { name: 'Martin Herrmann', role: 'Chefkoch', company: 'Modernes Bistro', text: 'Factoring zur Verbesserung meines Cashflows. Umwandlung meiner Rechnungen in Liquidität in 24h. Perfekte Lösung für meine B2B-Aktivität.', rating: 5 },
      ],
    },
    auth: {
      title: 'ALTUS',
      subtitle: 'Ihr vertrauenswürdiger Partner für Finanzierung',
      loginTab: 'Anmelden',
      signupTab: 'Registrieren',
      email: 'E-Mail',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      fullName: 'Vollständiger Name',
      phone: 'Telefon',
      companyName: 'Firmenname',
      siret: 'Handelsregisternummer',
      accountType: 'Kontotyp',
      personal: 'Privat',
      personalLoan: 'Privatkredit',
      business: 'Unternehmen/Gewerblich',
      businessLoan: 'Geschäftskredit',
      login: 'Anmelden',
      loggingIn: 'Anmeldung läuft...',
      signup: 'Mein Konto erstellen',
      signingUp: 'Registrierung läuft...',
      backToHome: 'Zurück zur Startseite',
      loginSuccess: 'Anmeldung erfolgreich!',
      loginSuccessDesc: 'Willkommen bei ALTUS',
      signupSuccess: 'Registrierung erfolgreich!',
      signupSuccessDesc: 'Eine Bestätigungs-E-Mail wurde an Ihre Adresse gesendet.',
      loginError: 'Anmeldefehler',
      loginErrorDesc: 'E-Mail oder Passwort falsch',
      signupError: 'Fehler',
      signupErrorDesc: 'Bei der Registrierung ist ein Fehler aufgetreten',
      emailNotVerified: 'E-Mail nicht verifiziert',
      emailPlaceholder: 'max.mustermann@beispiel.de',
      passwordPlaceholder: '••••••••',
      fullNamePlaceholder: 'Max Mustermann',
      phonePlaceholder: '+49 151 12345678',
      companyNamePlaceholder: 'Firma GmbH',
      siretPlaceholder: 'DE123456789',
      required: 'erforderlich',
      companyRequired: 'Firmenname ist für Geschäftskonten erforderlich',
      emailInvalid: 'Ungültige E-Mail',
      passwordMinLength: 'Das Passwort muss mindestens 12 Zeichen enthalten',
      passwordUppercase: 'Das Passwort muss mindestens einen Großbuchstaben enthalten',
      passwordLowercase: 'Das Passwort muss mindestens einen Kleinbuchstaben enthalten',
      passwordNumber: 'Das Passwort muss mindestens eine Zahl enthalten',
      passwordSpecial: 'Das Passwort muss mindestens ein Sonderzeichen enthalten',
      passwordMatch: 'Die Passwörter müssen übereinstimmen',
      invalidOtp: 'Ungültiger oder abgelaufener Code',
      sessionExpired: 'Sitzung abgelaufen',
      sessionExpiredMessage: 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.',
      accessDenied: 'Zugriff verweigert',
      authenticationRequired: 'Authentifizierung erforderlich',
      verificationError: 'Fehler bei der Überprüfung',
      verificationInProgress: 'Überprüfung läuft',
      emailVerified: 'E-Mail verifiziert',
      accountActiveAutoLogin: 'Ihr Konto ist jetzt aktiv. Sie sind automatisch angemeldet und werden in wenigen Sekunden zu Ihrem Dashboard weitergeleitet...',
      linkExpiredInvalid: 'Der Bestätigungslink ist möglicherweise abgelaufen oder ungültig.',
      tokenMissing: 'Bestätigungstoken fehlt',
      pleaseTwoFactorCode: 'Bitte geben Sie Ihren Zwei-Faktor-Authentifizierungscode ein',
      verificationCodeSent: 'Bestätigungscode gesendet',
      twoFactorAuth: 'Zwei-Faktor-Authentifizierung',
      enterOtpCode: 'Geben Sie den 6-stelligen Code ein, der an Ihre E-Mail gesendet wurde',
      otpExpiresIn: 'Der Code läuft in 10 Minuten ab',
      backToLogin: 'Zurück zur Anmeldung',
    },
    errors: {
      sessionExpired: 'Sitzung abgelaufen',
      accessDenied: 'Zugriff verweigert',
      authRequired: 'Authentifizierung erforderlich',
      networkError: 'Netzwerkfehler. Bitte versuchen Sie es erneut.',
      unexpectedError: 'Ein unerwarteter Fehler ist aufgetreten',
      verificationFailed: 'Überprüfung fehlgeschlagen',
    },
    bankCard: {
      title: 'Altus Premium-Bankkarte',
      subtitle: 'Bestellen Sie Ihre exklusive Karte und profitieren Sie von außergewöhnlichen Vorteilen',
      learnMore: 'Mehr erfahren',
      viewDetails: 'Details anzeigen',
      orderNow: 'Jetzt bestellen',
      orderCard: 'Karte bestellen',
      orderSuccess: 'Virtuelle Karte bestellen',
      orderSuccessDesc: 'Ihre virtuelle Karte wird aktiviert. Sie erhalten die Details in Kürze per E-Mail.',
      modalTitle: 'Altus Premium-Bankkarte',
      modalSubtitle: 'Entdecken Sie alle Vorteile unserer exklusiven Karte',
      advantagesTitle: 'Exklusive Vorteile',
      advantages: {
        cashback: '2% Cashback',
        cashbackDesc: 'Verdienen Sie 2% Cashback auf alle Ihre Einkäufe',
        noFees: 'Keine Jahresgebühr',
        noFeesDesc: 'Erstes Jahr kostenlos, danach €49/Jahr',
        protection: 'Vollständiger Schutz',
        protectionDesc: 'Reiseversicherung und Einkaufsschutz inklusive',
        rewards: 'Prämienprogramm',
        rewardsDesc: 'Sammeln Sie Punkte bei jedem Einkauf',
        global: 'Globale Akzeptanz',
        globalDesc: 'Akzeptiert bei Millionen von Händlern weltweit',
        support: 'Reaktiver Support',
        supportDesc: 'Reaktiver Support während der Geschäftszeiten',
        maxSecurity: 'Maximale Sicherheit',
        maxSecurityDesc: 'Temporäre Nummern mit vollständigem Schutz',
        instantActivation: 'Sofortige Aktivierung',
        instantActivationDesc: 'Sofort verwendbar',
        noFeesEuro: 'Keine Gebühren',
        noFeesEuroDesc: '0% Gebühren in der Eurozone',
        globallyAccepted: 'Weltweit akzeptiert',
        globallyAcceptedDesc: 'Kompatibel mit Apple Pay & Google Pay',
      },
      usageZonesTitle: 'Nutzungsbereiche',
      usageZones: {
        worldwide: 'Weltweit',
        worldwideDesc: 'Nutzen Sie Ihre Karte überall auf der Welt',
        online: 'Online-Einkäufe',
        onlineDesc: 'Sichere Zahlung für alle Ihre Online-Einkäufe',
        stores: 'Physische Geschäfte',
        storesDesc: 'Akzeptiert bei Millionen von Geschäften weltweit',
        atm: 'Geldautomaten-Abhebungen',
        atmDesc: 'Kostenlose Abhebungen an Netzwerk-Geldautomaten',
      },
      feesTitle: 'Gebühren und Tarife',
      fees: {
        annualFee: 'Jahresgebühr',
        annualFeeAmount: 'Erstes Jahr kostenlos, danach €49/Jahr',
        transactionFee: 'Transaktionsgebühr',
        transactionFeeAmount: '0% bei Einkäufen',
        withdrawalFee: 'Abhebungsgebühr',
        withdrawalFeeAmount: '3 kostenlose Abhebungen/Monat, danach €2/Abhebung',
        foreignFee: 'Wechselgebühr',
        foreignFeeAmount: '1,5% bei Auslandstransaktionen',
      },
      specificationsTitle: 'Spezifikationen',
      specifications: {
        cardType: 'Kartentyp',
        cardTypeValue: 'Visa Premium / Mastercard World Elite',
        creditLimit: 'Kreditlimit',
        creditLimitValue: 'Bis zu €50.000 je nach Profil',
        validity: 'Gültigkeit',
        validityValue: '5 Jahre',
        delivery: 'Lieferung',
        deliveryValue: '7-10 Werktage',
      },
      orderProcess: 'Bestellvorgang',
      orderProcessDesc: 'Füllen Sie das Bestellformular aus, stellen Sie Ihre Dokumente bereit, warten Sie auf die Genehmigung (24-48h) und erhalten Sie Ihre Karte zu Hause.',
      termsConditions: 'Allgemeine Geschäftsbedingungen der Altus Premium-Karte',
      close: 'Schließen',
    },
    notifications: {
      loan_request: { title: 'Neuer Kreditantrag', message: 'Ihr Kreditantrag wurde eingereicht' },
      loan_under_review: { title: 'Kredit wird geprüft', message: 'Ihr Kredit wird geprüft' },
      loan_approved: { title: 'Kredit genehmigt', message: 'Glückwunsch! Ihr Kredit wurde genehmigt' },
      loan_rejected: { title: 'Kredit abgelehnt', message: 'Ihr Kreditantrag wurde abgelehnt' },
      loan_contract_generated: { title: 'Vertrag erstellt', message: 'Ihr Kreditvertrag steht zum Download bereit' },
      loan_contract_signed: { title: 'Vertrag unterzeichnet', message: 'Ihr Vertrag wurde erhalten und wird bearbeitet' },
      loan_disbursed: { title: 'Mittel freigegeben', message: 'Die Kreditmittel wurden auf Ihr Konto eingezahlt' },
      transfer_initiated: { title: 'Überweisung eingeleitet', message: 'Ihre Überweisungsanfrage wurde eingeleitet' },
      transfer_completed: { title: 'Überweisung abgeschlossen', message: 'Ihre Überweisung wurde erfolgreich abgeschlossen' },
      transfer_approved: { title: 'Überweisung genehmigt', message: 'Ihre Überweisung wurde genehmigt' },
      transfer_suspended: { title: 'Überweisung ausgesetzt', message: 'Ihre Überweisung wurde ausgesetzt' },
      code_issued: { title: 'Code ausgestellt', message: 'Ein Überweisungscode wurde generiert' },
      kyc_approved: { title: 'KYC genehmigt', message: 'Ihre Identitätsprüfung wurde genehmigt' },
      kyc_rejected: { title: 'KYC abgelehnt', message: 'Ihre Identitätsprüfung wurde abgelehnt' },
      fee_added: { title: 'Neue Gebühr', message: 'Eine neue Gebühr wurde Ihrem Konto hinzugefügt' },
      account_status_changed: { title: 'Kontostatus geändert', message: 'Der Status Ihres Kontos wurde aktualisiert' },
      admin_message_sent: { title: 'Neue Nachricht', message: 'Sie haben eine Nachricht vom Administrator erhalten' },
      general: { title: 'Benachrichtigung', message: 'Sie haben eine neue Benachrichtigung' },
      twoFactorSuggestion: { title: 'Sicherheitsempfehlung', message: 'Wir empfehlen, die Zwei-Faktor-Authentifizierung für mehr Kontosicherheit zu aktivieren' },
      markAllRead: 'Alle als gelesen markieren',
      markAsRead: 'Als gelesen markieren',
      deleteNotification: 'Benachrichtigung löschen',
    },
    dialogs: {
      newLoan: {
        title: 'Neuer Kreditantrag',
        subtitle: 'Füllen Sie das untenstehende Formular aus, um einen Kredit zu beantragen',
        subtitleFirstRequest: 'Erster Antrag: Bitte stellen Sie Ihre Ausweisdokumente bereit und füllen Sie das Formular aus',
        subtitleRegular: 'Füllen Sie das Formular aus, um einen neuen Kreditantrag einzureichen',
        loanType: 'Kreditart',
        selectLoanType: 'Typ wählen',
        amount: 'Betrag',
        enterAmount: 'Betrag eingeben',
        duration: 'Laufzeit',
        selectDuration: 'Laufzeit wählen',
        months: 'Monate',
        estimatedRate: 'Geschätzter Zins',
        monthlyPayment: 'Monatliche Rate',
        totalRepayment: 'Gesamtrückzahlung',
        firstRequestAlert: 'Erster Kreditantrag',
        firstRequestAlertDesc: 'Für Ihren ersten Antrag müssen Sie ein Bankkonto hinzufügen und KYC-Dokumente hochladen.',
        addBankAccount: 'Bankkonto hinzufügen',
        selectAccount: 'Konto wählen',
        bankName: 'Bankname',
        bankNamePlaceholder: 'z.B.: Deutsche Bank',
        accountLabel: 'Kontobeschriftung',
        accountLabelPlaceholder: 'z.B.: Hauptkonto',
        iban: 'IBAN',
        ibanPlaceholder: 'DE XX XXXX XXXX XXXX XXXX XX',
        bic: 'BIC/SWIFT',
        bicPlaceholder: 'XXXXXXXX',
        uploadDocuments: 'Dokumente hochladen',
        kycDocumentsTab: 'KYC-Dokumente',
        additionalDocumentsTab: 'Zusätzliche Dokumente',
        loanDetailsTab: 'Kreditdetails',
        identity: 'Personalausweis',
        proof_of_address: 'Wohnsitznachweis',
        income_proof: 'Einkommensnachweis',
        business_registration: 'Handelsregister',
        financial_statements: 'Finanzberichte',
        tax_returns: 'Steuererklärung',
        requiredDocuments: 'Erforderliche Dokumente',
        identityDoc: 'Personalausweis (Ausweis oder Reisepass)',
        addressProof: 'Wohnsitznachweis (weniger als 3 Monate alt)',
        bankStatement: 'Kontoauszug (letzte 3 Monate)',
        uploadingInProgress: 'Upload läuft...',
        documentsUploadedSuccess: 'Dokument(e) erfolgreich hochgeladen',
        submit: 'Antrag einreichen',
        submitting: 'Wird eingereicht...',
        cancel: 'Abbrechen',
        loanTypes: {
          personal: 'Privatkredit',
          auto: 'Autokredit',
          mortgage: 'Immobilienkredit',
          green: 'Grüner Kredit',
          renovation: 'Renovierungskredit',
          student: 'Studentenkredit',
          business: 'Geschäftskredit',
          cashFlow: 'Cashflow-Management',
          equipment: 'Ausrüstungsfinanzierung',
          commercialProperty: 'Gewerbeimmobilie',
          lineOfCredit: 'Kreditlinie',
          vehicleFleet: 'Fuhrpark',
        },
        errors: {
          amountMustBePositive: 'Der Betrag muss größer als 0 sein',
          amountMaxExceeded: 'Der Betrag darf 1.000.000 € nicht überschreiten',
          rateMustBePositive: 'Der Zinssatz muss positiv sein',
          rateMaxExceeded: 'Der Zinssatz darf 20% nicht überschreiten',
          durationMustBePositive: 'Die Laufzeit muss größer als 0 sein',
          durationMaxExceeded: 'Die Laufzeit darf 360 Monate nicht überschreiten',
          documentsRequired: 'Sie müssen Ihre KYC-Dokumente für Ihren ersten Antrag hochladen',
        },
        success: {
          loanSubmitted: 'Kreditantrag eingereicht',
          loanSubmittedDesc: 'Ihr Kreditantrag wurde erfolgreich eingereicht.',
          documentsUploaded: 'Dokumente hochgeladen',
          documentsUploadedDesc: 'Dokument(e) erfolgreich gesendet.',
        },
        error: {
          loanError: 'Fehler',
          loanErrorDesc: 'Kreditantrag konnte nicht erstellt werden.',
          partialUploadError: 'Teilweiser Fehler',
          partialUploadErrorDesc: 'Dokument(e) konnten nicht hochgeladen werden.',
        },
      },
      transfer: {
        title: 'Neue Überweisung',
        subtitle: 'Geld auf Ihr Bankkonto überweisen',
        selectAccount: 'Konto wählen',
        noAccountsAvailable: 'Kein Bankkonto verfügbar. Fügen Sie zuerst ein Konto hinzu.',
        amount: 'Betrag',
        enterAmount: 'Betrag eingeben',
        amountPlaceholder: '50000',
        recipient: 'Empfänger',
        recipientPlaceholder: 'Name des Unternehmens oder Begünstigten',
        feesDescription: 'Es fallen Überweisungsgebühren von 25€ an',
        availableFunds: 'Verfügbare Mittel',
        feesAndProcessing: 'Gebühren und Bearbeitung',
        submit: 'Überweisung starten',
        submitting: 'Wird bearbeitet...',
        creating: 'Wird erstellt...',
        createTransfer: 'Überweisung erstellen',
        cancel: 'Abbrechen',
        transferSuccess: 'Überweisung eingeleitet',
        transferSuccessDesc: 'Ihre Überweisungsanfrage wurde erfolgreich erstellt',
        transferError: 'Fehler',
        transferErrorDesc: 'Überweisung konnte nicht erstellt werden',
      },
      loanRequestModal: {
        title: 'Kredit beantragen',
        description: 'Füllen Sie das untenstehende Formular aus und fügen Sie die erforderlichen Dokumente bei, um Ihren Kreditantrag einzureichen.',
        loanType: 'Kreditart',
        selectLoanTypePlaceholder: 'Wählen Sie eine Kreditart',
        loanAmount: 'Kreditbetrag',
        duration: 'Laufzeit',
        durationMonths: 'Laufzeit (Monate)',
        months: 'Monate',
        interestRate: 'Zinssatz',
        estimatedMonthlyPayment: 'Geschätzte monatliche Zahlung',
        requiredDocuments: 'Erforderliche Dokumente',
        requiredDocumentsDescription: 'Bitte fügen Sie alle als erforderlich markierten Dokumente bei, um Ihren Antrag abzuschließen.',
        required: 'Erforderlich',
        optional: 'Optional',
        attach: 'Anhängen',
        cancel: 'Abbrechen',
        submit: 'Antrag einreichen',
        validationError: 'Bitte wählen Sie eine Kreditart',
        requestSent: 'Antrag gesendet',
        requestSentDescription: 'Ihr Kreditantrag wurde erfolgreich eingereicht. Sie erhalten innerhalb von 48 Stunden eine Antwort.',
        error: 'Fehler',
        errorDescription: 'Beim Senden Ihres Antrags ist ein Fehler aufgetreten.',
        fileTooLarge: 'Datei zu groß',
        fileTooLargeDescription: 'Die maximale Dateigröße beträgt 10MB.',
        missingDocuments: 'Fehlende Dokumente',
        missingDocumentsPrefix: 'Bitte fügen Sie alle erforderlichen Dokumente bei:',
      },
      cardTerms: {
        title: 'Allgemeine Geschäftsbedingungen der Altus Premium-Karte',
        acceptTerms: 'Akzeptieren und Karte bestellen',
        declineTerms: 'Ablehnen',
      },
      welcome: {
        title: 'Willkommen bei der Altus Finance Group',
        description: 'Ihr Konto wurde erfolgreich erstellt. Wählen Sie aus unseren personalisierten Angeboten, um zu beginnen.',
        accountTypeTitle: 'Kontotyp',
        individualAccount: 'Privatkonto',
        businessAccount: 'Geschäftskonto',
        individualAccess: 'Zugang zu Privatkrediten und persönlichem Finanzmanagement',
        businessAccess: 'Vollständiger Zugang zu Unternehmensfinanzierungslösungen und Premium-Services',
        availableOffers: 'Verfügbare Angebote für Sie',
        getStarted: 'Beginnen',
        dialog: {
          title: 'Willkommen bei Altus Finance Group!',
          description: 'Wir freuen uns, Sie bei Ihren Finanzierungsprojekten zu unterstützen.',
        },
        account: {
          badgeLabel: 'Ihr Konto:',
          individual: {
            description: 'Sie haben Zugang zu Privatkreditangeboten. Diese Angebote sind speziell auf Ihre persönlichen Bedürfnisse und individuellen Projekte zugeschnitten.',
          },
          business: {
            description: 'Sie haben Zugang zu professionellen Kreditangeboten. Diese Angebote sind speziell für die Entwicklung und das Wachstum Ihres Unternehmens konzipiert.',
          },
        },
        offers: {
          title: 'Verfügbare Angebote für Sie',
          individual: [
            'Privatkredit',
            'Immobilienkredit',
            'Autokredit',
            'Studentenkredit',
            'Grüner Kredit',
            'Renovierungskredit',
          ],
          business: [
            'Professioneller Kredit',
            'Liquiditätskredit',
            'Ausrüstungsfinanzierung',
            'Gewerbeimmobilie',
            'Kreditlinie',
            'Firmenfahrzeugkredit',
          ],
        },
        important: {
          title: 'Wichtig:',
          message: 'Nur die oben genannten Angebote sind in Ihrem Bereich zugänglich.',
          individualSwitch: ' Wenn Sie auf professionelle Angebote zugreifen möchten, müssen Sie ein Geschäftskonto erstellen.',
          businessSwitch: ' Wenn Sie auf private Angebote zugreifen möchten, müssen Sie ein Privatkonto erstellen.',
        },
        cta: {
          primary: 'Verstanden, loslegen',
          pending: 'Lädt...',
        },
      },
      transactionHistory: {
        title: 'Transaktionsverlauf',
        type: 'Typ',
        amount: 'Betrag',
        date: 'Datum',
        status: 'Status',
        noTransactions: 'Keine Transaktionen gefunden',
        close: 'Schließen',
      },
    },
    verify: {
      verifying: 'Wird verifiziert...',
      success: 'E-Mail verifiziert!',
      successMessage: 'Ihre E-Mail wurde erfolgreich verifiziert. Sie können sich jetzt bei Ihrem Konto anmelden.',
      goToDashboard: 'Zum Dashboard',
      error: 'Verifizierung fehlgeschlagen',
      errorMessage: 'Ihre E-Mail konnte nicht verifiziert werden. Der Link ist möglicherweise abgelaufen.',
      tryAgain: 'Erneut versuchen',
      backToSignup: 'Zurück zur Registrierung',
      backToHome: 'Zurück zur Startseite',
    },
    forgotPassword: {
      title: 'Passwort vergessen?',
      description: 'Kein Problem! Wir senden Ihnen Anweisungen zum Zurücksetzen Ihres Passworts.',
      instructions: 'Geben Sie unten Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.',
      emailLabel: 'E-Mail-Adresse',
      emailPlaceholder: 'ihrename@beispiel.de',
      sendResetLink: 'Zurücksetzungslink senden',
      sending: 'Wird gesendet...',
      backToLogin: 'Zurück zur Anmeldung',
      emailSent: 'E-Mail gesendet!',
      emailSentDesc: 'Überprüfen Sie Ihr Postfach auf Anweisungen zum Zurücksetzen des Passworts.',
      error: 'Fehler',
      errorDesc: 'Zurücksetzungs-E-Mail konnte nicht gesendet werden. Versuchen Sie es erneut.',
    },
    resetPassword: {
      title: 'Passwort zurücksetzen',
      description: 'Geben Sie unten Ihr neues Passwort ein',
      newPassword: 'Neues Passwort',
      newPasswordPlaceholder: 'Geben Sie Ihr neues Passwort ein',
      confirmPassword: 'Passwort bestätigen',
      confirmPasswordPlaceholder: 'Bestätigen Sie Ihr neues Passwort',
      requirements: 'Passwortanforderungen',
      minLength: 'Mindestens 12 Zeichen',
      uppercase: 'Mindestens ein Großbuchstabe',
      lowercase: 'Mindestens ein Kleinbuchstabe',
      number: 'Mindestens eine Zahl',
      specialChar: 'Mindestens ein Sonderzeichen',
      passwordStrength: 'Passwortstärke',
      weak: 'Schwach',
      medium: 'Mittel',
      strong: 'Stark',
      veryStrong: 'Sehr stark',
      resetPassword: 'Passwort zurücksetzen',
      resetting: 'Wird zurückgesetzt...',
      success: 'Passwort zurückgesetzt!',
      successMessage: 'Ihr Passwort wurde erfolgreich zurückgesetzt. Sie können sich jetzt mit Ihrem neuen Passwort anmelden.',
      error: 'Fehler',
      invalidToken: 'Ungültiger oder abgelaufener Zurücksetzungslink',
      passwordMismatch: 'Die Passwörter stimmen nicht überein',
    },
    twoFactorAuth: {
      setup: {
        title: 'Zwei-Faktor-Authentifizierung einrichten',
        description: 'Fügen Sie Ihrem Konto eine zusätzliche Sicherheitsebene hinzu',
        step1: 'Schritt 1: Authentifikator-App installieren',
        step1Description: 'Laden Sie eine App wie Google Authenticator oder Authy auf Ihr Mobilgerät herunter.',
        step2: 'Schritt 2: QR-Code scannen',
        step2Description: 'Öffnen Sie Ihre Authentifikator-App und scannen Sie den untenstehenden QR-Code.',
        step3: 'Schritt 3: Bestätigungscode eingeben',
        step3Description: 'Geben Sie den 6-stelligen Code aus Ihrer Authentifikator-App ein, um die Einrichtung abzuschließen.',
        qrCodeInstructions: 'Scannen Sie diesen QR-Code mit Ihrer Authentifikator-App',
        cantScanQR: 'Können Sie den QR-Code nicht scannen?',
        secretKey: 'Geben Sie diesen Schlüssel manuell ein',
        enterCode: 'Geben Sie den 6-stelligen Code ein',
        codePlaceholder: '000000',
        verify: 'Verifizieren und aktivieren',
        verifying: 'Wird verifiziert...',
        cancel: 'Abbrechen',
        successTitle: '2FA aktiviert!',
        successMessage: 'Die Zwei-Faktor-Authentifizierung wurde erfolgreich für Ihr Konto aktiviert.',
        errorTitle: 'Ungültiger Code',
        errorMessage: 'Der eingegebene Code ist ungültig. Versuchen Sie es erneut.',
      },
      disable: {
        title: 'Zwei-Faktor-Authentifizierung deaktivieren',
        description: 'Sind Sie sicher, dass Sie die Zwei-Faktor-Authentifizierung deaktivieren möchten? Dies macht Ihr Konto weniger sicher.',
        enterPassword: 'Geben Sie Ihr Passwort zur Bestätigung ein',
        passwordPlaceholder: 'Ihr Passwort',
        disable: '2FA deaktivieren',
        disabling: 'Wird deaktiviert...',
        cancel: 'Abbrechen',
        successTitle: '2FA deaktiviert',
        successMessage: 'Die Zwei-Faktor-Authentifizierung wurde von Ihrem Konto deaktiviert.',
        errorTitle: 'Fehler',
        errorMessage: 'Zwei-Faktor-Authentifizierung konnte nicht deaktiviert werden. Überprüfen Sie Ihr Passwort.',
      },
      login: {
        title: 'Zwei-Faktor-Authentifizierung verifizieren',
        description: 'Geben Sie den 6-stelligen Code aus Ihrer Authentifikator-App ein',
        enterCode: 'Geben Sie den Bestätigungscode ein',
        codePlaceholder: '000000',
        verify: 'Verifizieren',
        verifying: 'Wird verifiziert...',
        cancel: 'Abbrechen',
        errorTitle: 'Ungültiger Code',
        errorMessage: 'Der eingegebene Code ist ungültig oder abgelaufen. Versuchen Sie es erneut.',
      },
    },
    bankAccounts: {
      title: 'Bankkonten',
      description: 'Verwalten Sie Ihre Bankkonten für Überweisungen',
      addAccount: 'Konto hinzufügen',
      noAccountsTitle: 'Kein Bankkonto',
      noAccountsDescription: 'Fügen Sie ein Bankkonto hinzu, um Geld zu überweisen.',
      accountLabel: 'Beschriftung',
      bankName: 'Bank',
      iban: 'IBAN',
      bic: 'BIC',
      createdAt: 'Erstellt am',
      actions: 'Aktionen',
      delete: 'Löschen',
      deleteConfirm: 'Sind Sie sicher, dass Sie dieses Bankkonto löschen möchten?',
      deleteSuccess: 'Bankkonto erfolgreich gelöscht',
      addAccountTitle: 'Bankkonto hinzufügen',
      addAccountDescription: 'Fügen Sie ein neues Bankkonto für Überweisungen hinzu',
      accountLabelLabel: 'Kontobeschriftung',
      accountLabelPlaceholder: 'z.B.: Hauptkonto',
      accountLabelRequired: 'Kontobeschriftung ist erforderlich',
      bankNameLabel: 'Bankname',
      bankNamePlaceholder: 'z.B.: Deutsche Bank',
      bankNameRequired: 'Bankname ist erforderlich',
      ibanLabel: 'IBAN',
      ibanPlaceholder: 'DE XX XXXX XXXX XXXX XXXX XX',
      ibanRequired: 'IBAN ist erforderlich',
      invalidIban: 'Ungültiges IBAN-Format',
      bicLabel: 'BIC/SWIFT',
      bicPlaceholder: 'XXXXXXXX',
      invalidBic: 'Ungültiges BIC-Format',
      submit: 'Konto hinzufügen',
      submitting: 'Wird hinzugefügt...',
      cancel: 'Abbrechen',
      addSuccess: 'Bankkonto hinzugefügt',
      addSuccessDesc: 'Ihr Bankkonto wurde erfolgreich hinzugefügt.',
      addError: 'Fehler beim Hinzufügen des Bankkontos',
      addFirstAccount: 'Ihr erstes Konto hinzufügen',
      deleteSuccessDesc: 'Das Bankkonto wurde erfolgreich gelöscht.',
      deleteError: 'Bankkonto konnte nicht gelöscht werden.',
    },
    welcomeModal: {
      title: 'Willkommen bei der Altus Finance Group',
      description: 'Ihr Konto wurde erfolgreich erstellt. Wählen Sie aus unseren personalisierten Angeboten, um zu beginnen.',
      accountType: 'Kontotyp',
      individualAccount: 'Privatkonto',
      businessAccount: 'Geschäftskonto',
      individualAccess: 'Zugang zu Privatkrediten und persönlichem Finanzmanagement',
      businessAccess: 'Vollständiger Zugang zu Unternehmensfinanzierungslösungen und Premium-Services',
      availableOffers: 'Verfügbare Angebote für Sie',
      getStarted: 'Beginnen',
    },
    calculator: {
      title: 'Kreditrechner',
      description: 'Berechnen Sie Ihre monatlichen Raten und die Gesamtkosten Ihres Kredits',
      loanAmount: 'Kreditbetrag',
      interestRate: 'Zinssatz (%)',
      loanDuration: 'Kreditlaufzeit',
      months: 'Monate',
      calculate: 'Berechnen',
      results: 'Ergebnisse',
      monthlyPayment: 'Monatliche Rate',
      totalInterest: 'Gesamtzinsen',
      totalAmount: 'Gesamtbetrag',
      amortizationSchedule: 'Tilgungsplan',
      month: 'Monat',
      payment: 'Zahlung',
      principal: 'Kapital',
      interest: 'Zinsen',
      balance: 'Saldo',
      downloadSchedule: 'Plan herunterladen',
    },
    amortization: {
      interactiveTitle: 'Interaktiver Tilgungsplan',
      interactiveDescription: 'Wählen Sie einen aktiven Kredit und passen Sie die Parameter an, um die Auswirkungen auf die Rückzahlungen zu sehen',
      calculatorTitle: 'Interaktiver Tilgungsrechner',
      calculatorDescription: 'Simulieren Sie Ihren Rückzahlungsplan und visualisieren Sie die Entwicklung Ihres Kredits',
      selectActiveLoan: 'Aktiven Kredit auswählen',
      chooseLoan: 'Kredit wählen...',
      loanOf: 'Kredit über',
      at: 'zu',
      loanAmount: 'Kreditbetrag (€)',
      annualInterestRate: 'Jährlicher Zinssatz (%)',
      duration: 'Laufzeit (Jahre)',
      years: 'Jahre',
      calculateAmortization: 'Tilgung berechnen',
      calculatePlan: 'Tilgungsplan berechnen',
      monthlyPayment: 'Monatliche Rate',
      totalPayment: 'Gesamtrückzahlung',
      totalInterest: 'Gesamtzinsen',
      table: 'Tabelle',
      evolution: 'Entwicklung',
      cumulative: 'Kumuliert',
      breakdown: 'Aufschlüsselung',
      month: 'Monat',
      payment: 'Zahlung',
      principal: 'Kapital',
      interest: 'Zinsen',
      balance: 'Saldo',
      amount: 'Betrag (€)',
      monthLabel: 'Monat',
      noActiveLoans: 'Keine aktiven Kredite',
      noActiveLoansDesc: 'Sie haben derzeit keine aktiven Kredite. Beantragen Sie einen neuen Kredit, um diese Funktion zu nutzen.',
      loanType: 'Kreditart',
      selectType: 'Art wählen',
      personal: 'Privat',
      business: 'Geschäftlich',
      realEstate: 'Immobilien',
      automaticallyCalculated: 'Automatisch berechnet',
      rateInfo: 'Der Zinssatz wird automatisch basierend auf Betrag und Kreditart berechnet. Alle Kreditanträge erfordern eine administrative Genehmigung.',
      requestLoan: 'Diesen Kredit beantragen',
      sending: 'Wird gesendet...',
      chart: 'Diagramm',
      balanceEvolution: 'Saldo- und Zahlungsentwicklung',
      principalVsInterest: 'Kapital vs Zinsen Aufschlüsselung',
      monthlyRepaymentPlan: 'Monatlicher Rückzahlungsplan',
      remainingBalance: 'Restsaldo',
      errors: {
        amountPositive: 'Der Kreditbetrag muss größer als €0 sein',
        amountMax: 'Der Kreditbetrag darf €10.000.000 nicht überschreiten',
        rateNegative: 'Der Zinssatz kann nicht negativ sein',
        rateMax: 'Der Zinssatz darf 100% nicht überschreiten',
        durationPositive: 'Die Kreditlaufzeit muss größer als 0 Jahre sein',
        durationMax: 'Die Kreditlaufzeit darf 50 Jahre nicht überschreiten',
      },
    },
    kycDocuments: {
      title: 'KYC-Dokumente',
      description: 'Laden Sie Ihre Dokumente zur Identitätsprüfung hoch',
      uploadDocuments: 'Dokumente hochladen',
      documentType: 'Dokumenttyp',
      selectDocumentType: 'Dokumenttyp wählen',
      identity: 'Personalausweis',
      proof_of_address: 'Wohnsitznachweis',
      income_proof: 'Einkommensnachweis',
      business_registration: 'Handelsregister',
      financial_statements: 'Finanzberichte',
      tax_returns: 'Steuererklärung',
      chooseFile: 'Datei wählen',
      upload: 'Hochladen',
      uploading: 'Wird hochgeladen...',
      uploadSuccess: 'Erfolgreich hochgeladen',
      uploadSuccessDesc: 'Ihr Dokument wurde erfolgreich hochgeladen.',
      uploadError: 'Fehler beim Hochladen',
      status: 'Status',
      pending: 'Ausstehend',
      approved: 'Genehmigt',
      rejected: 'Abgelehnt',
      uploadedAt: 'Hochgeladen am',
      noDocuments: 'Keine Dokumente hochgeladen',
    },
    transferFlow: {
      backToDashboard: 'Zurück zum Dashboard',
      form: {
        title: 'Neue Überweisung',
        subtitle: 'Starten Sie eine sichere Überweisung auf ein externes Konto',
        amountLabel: 'Betrag (EUR)',
        amountPlaceholder: '10000',
        amountHelper: 'Fester Betrag basierend auf Ihrem aktiven Darlehen (nicht änderbar)',
        accountLabel: 'Externes Konto (optional)',
        accountPlaceholder: 'Konto wählen',
        externalAccountLabel: 'Externes Konto *',
        selectAccountPlaceholder: 'Konto auswählen',
        noAccount: 'Kein Konto registriert',
        recipientLabel: 'Empfänger',
        recipientPlaceholder: 'Name des Empfängers',
        initiateButton: 'Überweisung starten',
        initiating: 'Wird initiiert...',
      },
      verification: {
        title: 'Überweisungsüberprüfung',
        subtitle: 'Bitte warten Sie während der Überprüfung Ihrer Überweisung',
        doNotClose: 'Schließen Sie diese Seite nicht',
        doNotCloseDesc: 'Ihre Überweisung wird von unserem sicheren System überprüft. Dieser Vorgang dauert etwa 45 Sekunden.',
        progressLabel: 'Überprüfungsfortschritt',
        verificationSteps: 'Überprüfungsschritte',
        step1: 'Überprüfung des Senderkontos',
        step2: 'Validierung von Betrag und Gebühren',
        step3: 'Sicherheitskontrolle gegen Betrug',
        step4: 'Vorbereitung der sicheren Überweisung',
      },
      validation: {
        title: 'Überweisungsvalidierung',
        subtitle: 'Code {sequence} / {total}',
        demoCodeLabel: 'Demonstrationscode:',
        codeLabel: 'Validierungscode (6 Ziffern)',
        codePlaceholder: '000000',
        codeHelpText: 'Ein Code wurde an Ihre E-Mail gesendet',
        validateButton: 'Validieren',
        validating: 'Wird validiert...',
        resendButton: 'Erneut senden',
        historyLabel: 'Verlauf',
      },
      progress: {
        titlePaused: 'Überweisung pausiert',
        titleInProgress: 'Überweisung in Bearbeitung',
        securityVerificationTitle: 'Sicherheitsüberprüfung',
        transferProcessingTitle: 'Überweisung wird verarbeitet',
        toPrefix: 'An:',
        securityVerificationRequired: 'Sicherheitsüberprüfung erforderlich',
        enterVerificationCode: 'Aus Sicherheitsgründen geben Sie bitte den Ihnen zugesandten Verifizierungscode ein',
        codeFromAdvisor: 'Der Sicherheitscode wird Ihnen von Ihrem Berater mitgeteilt',
        validationCodeLabel: 'Validierungscode (6 Ziffern)',
        enterCodePlaceholder: 'Geben Sie den 6-stelligen Code ein',
        validating: 'Validierung...',
        validateAndContinue: 'Validieren und fortfahren',
        processingTransfer: 'Ihre Überweisung wird verarbeitet...',
        doNotCloseProcessing: 'Ihre Transaktion wird sicher verarbeitet. Schließen Sie diese Seite nicht.',
        amountLabel: 'Betrag: {amount} EUR an {recipient}',
        progressLabel: 'Fortschritt',
        pauseTitle: 'Entsperrcode erforderlich bei {percent}%',
        pauseDescription: 'Bitte kontaktieren Sie den Kundendienst, um den Entsperrcode für Ihre Überweisung zu erhalten.',
        pauseCodeLabel: 'Entsperrcode',
        pauseCodePlaceholder: 'Code eingeben',
        validatePauseCode: 'Code validieren',
        statusLabel: 'Aktueller Status',
        statusCompleted: 'Überweisung abgeschlossen!',
        statusProcessing: 'Wird von unserem Banksystem bearbeitet...',
        eventsLabel: 'Ereignisse',
        circularProgressTitle: 'Überprüfung der Überweisung',
        circularProgressSubtitle: 'Ihre Transaktion wird sicher verarbeitet.',
      },
      complete: {
        title: 'Überweisung abgeschlossen',
        subtitle: 'Ihre Überweisung wurde erfolgreich durchgeführt',
        successMessage: 'Ihre Überweisung wurde erfolgreich abgeschlossen. Die Mittel sind innerhalb von 24 bis 72 Stunden verfügbar.',
        referenceLabel: 'Referenz',
        returnToDashboard: 'Zurück zum Dashboard',
        amountLabel: 'Betrag',
        recipientLabel: 'Empfänger',
        feesLabel: 'Gebühren',
      },
      toast: {
        transferInProgress: 'Überweisung läuft',
        transferAlreadyInProgress: 'Für dieses Darlehen läuft bereits eine Überweisung. Weiterleitung...',
        transferInitiated: 'Überweisung erfolgreich eingeleitet. Verifizierung läuft...',
        selectExternalAccount: 'Bitte wählen Sie ein externes Konto.',
        noActiveLoan: 'Kein aktives Darlehen verfügbar.',
        initiated: 'Überweisung initiiert',
        initiatedDesc: 'Überprüfung Ihrer Überweisung läuft...',
        error: 'Fehler',
        errorInitiation: 'Überweisung konnte nicht initiiert werden',
        codeValidated: 'Code validiert',
        codeInvalid: 'Ungültiger Code',
        codeInvalidDesc: 'Der Code ist falsch oder abgelaufen',
        codeSent: 'Code gesendet',
        codeSentDesc: 'Code {sequence} erfolgreich gesendet',
        approved: 'Überweisung genehmigt',
        approvedDesc: 'Ihre Überweisung ist genehmigt und wird bearbeitet.',
        fieldsRequired: 'Pflichtfelder',
        fieldsRequiredDesc: 'Bitte füllen Sie alle Felder aus',
        invalidCode: 'Ungültiger Code',
        invalidCodeDesc: 'Der Code muss 6 Ziffern enthalten',
        codeRequired: 'Code erforderlich',
        codeRequiredDesc: 'Bitte geben Sie den Entsperrcode ein',
        unblocked: 'Überweisung entsperrt',
        unblockedDesc: 'Die Überweisung wurde erfolgreich entsperrt',
      },
    },
    loanOffers: {
      pageTitle: 'Unsere Kreditangebote',
      pageSubtitle: 'Entdecken Sie alle unsere Finanzierungslösungen für Privat- und Geschäftskunden',
      accountInfo: 'Konto {accountType}:',
      individualTab: 'Privatkredite',
      businessTab: 'Geschäftskredite',
      individual: 'Privat',
      business: 'Geschäftlich',
      amountLabel: 'Betrag',
      rateLabel: 'Zinssatz',
      durationLabel: 'Laufzeit',
      advantagesLabel: 'Vorteile',
      requestButton: 'Diesen Kredit beantragen',
      loginToRequest: 'Anmelden zum Beantragen',
      types: {
        personalLoan: {
          title: 'Privatkredit',
          description: 'Flexible Finanzierung für alle Ihre persönlichen Projekte',
          features: ['Schnelle Antwort', 'Keine Verwendungsnachweise erforderlich', 'Flexible Rückzahlung'],
        },
        mortgageLoan: {
          title: 'Hypothekendarlehen',
          description: 'Finanzieren Sie den Kauf Ihrer Haupt- oder Zweitwohnung',
          features: ['Fester oder variabler Zinssatz', 'Bis zu 80% des Betrags', 'Versicherung inklusive'],
        },
        autoLoan: {
          title: 'Autokredit',
          description: 'Kaufen Sie Ihr neues oder gebrauchtes Fahrzeug',
          features: ['Schnelle Auszahlung', 'Vorzeitige Rückzahlung möglich', 'Versicherung optional'],
        },
        studentLoan: {
          title: 'Studentendarlehen',
          description: 'Finanzieren Sie Ihr Studium zu vorteilhaften Konditionen',
          features: ['Aufgeschobene Rückzahlung', 'Vorzugszinsen', 'Elternbürgschaft optional'],
        },
        greenLoan: {
          title: 'Grüner Kredit',
          description: 'Finanzieren Sie Ihre energetischen Sanierungsprojekte',
          features: ['Reduzierter Zinssatz', 'Förderfähig für staatliche Beihilfen', 'Umweltfreundliche Finanzierung'],
        },
        renovationLoan: {
          title: 'Renovierungskredit',
          description: 'Renovieren und verbessern Sie Ihr Zuhause',
          features: ['Keine Hypothek bis 75k€', 'Stufenweise Auszahlung möglich', 'Steuerabzug möglich'],
        },
        businessLoan: {
          title: 'Geschäftskredit',
          description: 'Finanzierung für Ihre Unternehmensprojekte, Entwicklung und Liquidität',
          features: ['Antwort innerhalb 48h', 'Fester Zinssatz', 'Flexible Rückzahlung'],
        },
        cashFlowCredit: {
          title: 'Liquiditätskredit',
          description: 'Schnelle Lösung zur Verwaltung Ihres Betriebskapitalbedarfs',
          features: ['Schnelle Auszahlung', 'Keine Sicherheit bis 50k€', 'Flexibel'],
        },
        equipmentFinancing: {
          title: 'Ausrüstungsfinanzierung',
          description: 'Kaufen Sie Ihre professionelle Ausrüstung und Materialien',
          features: ['Bis zu 100% des Betrags', 'Leasing-Option', 'Steuerabzug'],
        },
        commercialPropertyLoan: {
          title: 'Gewerbeimmobilienkredit',
          description: 'Erwerben Sie Ihre Geschäftsräume, Büros oder Lagerhallen',
          features: ['Lange Laufzeit', 'Anzahlung ab 20%', 'Wettbewerbsfähiger Zinssatz'],
        },
        lineOfCredit: {
          title: 'Kreditlinie',
          description: 'Revolvierender Kredit für Ihren gelegentlichen Bedarf',
          features: ['Verfügbar 24/7', 'Freie Rückzahlung', 'Automatische Verlängerung'],
        },
        vehicleFleetLoan: {
          title: 'Firmenfahrzeugkredit',
          description: 'Finanzieren Sie Ihre Fahrzeugflotte oder Nutzfahrzeuge',
          features: ['Leasing oder traditioneller Kredit', 'Rückkaufoption', 'Versicherung inklusive'],
        },
      },
    },
    cardTermsContent: {
      title: 'Allgemeine Nutzungsbedingungen - ALTUS Virtuelle Karte',
      lastUpdated: 'Letzte Aktualisierung: November 2025',
      section1: {
        title: '1. ZWECK UND GELTUNGSBEREICH',
        content: 'Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") regeln die Nutzung der virtuellen Bankkarte ALTUS (nachfolgend "die Virtuelle Karte"), die von ALTUS Finance Group den Kunden mit einem ALTUS-Konto (nachfolgend "der Karteninhaber") angeboten wird. Die Virtuelle Karte ist ein dematerialisiertes Zahlungsmittel, das mit Ihrem ALTUS-Konto verbunden ist.',
      },
      section2: {
        title: '2. SERVICEBESCHREIBUNG',
        subtitle1: '2.1 Art der Virtuellen Karte',
        content1: 'Die Virtuelle Karte ist eine dematerialisierte Zahlungskarte mit einer 16-stelligen Kartennummer, einem Ablaufdatum und einem visuellen Kryptogramm (CVV). Sie funktioniert wie eine physische Bankkarte, existiert aber nur in elektronischer Form.',
        subtitle2: '2.2 Kartentyp',
        item1: 'Permanente virtuelle Karte: feste Koordinaten während ihrer gesamten Gültigkeitsdauer (3 Jahre)',
        item2: 'Temporäre virtuelle Karte: temporäre Koordinaten mit parametrierbarem Betrag und Dauer',
      },
      section3: {
        title: '3. TEILNAHMEBEDINGUNGEN',
        content: 'Um eine Virtuelle Karte zu erhalten, muss der Karteninhaber:',
        list: [
          'ALTUS-Kunde mit einem aktiven und finanzierten Konto sein',
          'Die Identitätsprüfung (KYC) abgeschlossen haben',
          'Sich nicht in einer Situation nicht genehmigter Überziehung befinden',
          'Die starke Authentifizierung (Zwei-Faktor) aktiviert haben',
          'Diese AGB und die Preisbedingungen akzeptieren',
        ],
      },
      section4: {
        title: '4. AKTIVIERUNG UND NUTZUNG',
        subtitle1: '4.1 Aktivierung',
        content1: 'Die Virtuelle Karte wird sofort nach ihrer Erstellung über die Anwendung oder den ALTUS-Kundenbereich aktiviert. Der Karteninhaber erhält sofort die vollständigen Kartenkoordinaten.',
        subtitle2: '4.2 Zugelassene Verwendungen',
        list1: [
          'Zahlungen auf allen Online-Händlerseiten, die Visa/Mastercard akzeptieren',
          'Wiederkehrende Zahlungen und Abonnements (nur permanente Karte)',
          'Einkäufe auf internationalen Websites',
          'Kontaktlose Zahlungen im Geschäft (wenn zu Apple Pay/Google Pay hinzugefügt)',
        ],
        subtitle3: '4.3 Einschränkungen',
        list2: [
          'Keine Bargeldabhebungen an Geldautomaten',
          'Physische Vorlage unmöglich (Autovermietung, einige Hotels)',
          'Einige Anbieter können virtuelle Karten ablehnen',
        ],
      },
      section5: {
        title: '5. SICHERHEIT UND SCHUTZ',
        subtitle1: '5.1 Verstärkte Sicherheit',
        list1: [
          'Die Koordinaten Ihrer physischen Bankkarte werden niemals offengelegt',
          'Möglichkeit, die Karte sofort zu sperren/entsperren',
          'Endgültige Löschung mit einem Klick',
          '3D Secure-Schutz bei allen Transaktionen',
          'Dynamischer CVV für maximale Sicherheit',
        ],
        subtitle2: '5.2 Pflichten des Karteninhabers',
        content2: 'Der Karteninhaber verpflichtet sich, die Koordinaten seiner Virtuellen Karte vertraulich zu behandeln und sie nicht an Dritte weiterzugeben. Bei Betrugsverdacht muss der Karteninhaber die Karte sofort über seinen Kundenbereich sperren oder löschen.',
        subtitle3: '5.3 Garantien und Versicherungen',
        content3: 'Die Virtuelle Karte profitiert von denselben Garantien wie Ihre physische Karte, einschließlich Betrugsschutz, Einkaufsversicherung und Garantie für konforme Lieferung.',
      },
      section6: {
        title: '6. LIMITS UND GRENZEN',
        content: 'Die Zahlungslimits der Virtuellen Karte sind identisch mit denen Ihrer ALTUS-Hauptkarte:',
        list: [
          'Monatslimit: bis zu 50.000 € je nach Profil',
          'Limit pro Transaktion: bis zu 10.000 €',
          'Möglichkeit, Limits vorübergehend über die Anwendung anzupassen',
        ],
        content2: 'Für temporäre Karten legen Sie den Höchstbetrag und die Gültigkeitsdauer bei der Erstellung fest.',
      },
      section7: {
        title: '7. PREISGESTALTUNG',
        list: [
          'Erstellung virtueller Karte: Kostenlos',
          'Transaktionsgebühren in der Eurozone: 0%',
          'Zahlungen außerhalb der Eurozone: 1,5% des Betrags',
          'Jahresbeitrag: Kostenlos',
          'Sperren/Entsperren: Kostenlos und unbegrenzt',
        ],
      },
      section8: {
        title: '8. ABBUCHUNG UND KONTOAUSZUG',
        content: 'Alle mit der Virtuellen Karte durchgeführten Transaktionen werden in Echtzeit von Ihrem ALTUS-Konto abgebucht. Sie erscheinen sofort in Ihrer Transaktionshistorie und auf Ihren monatlichen Kontoauszügen.',
      },
      section9: {
        title: '9. WIDERSPRUCH UND KÜNDIGUNG',
        subtitle1: '9.1 Temporäre Sperrung',
        content1: 'Sie können Ihre Virtuelle Karte jederzeit über Ihren Kundenbereich sperren. Die Entsperrung erfolgt sofort.',
        subtitle2: '9.2 Endgültige Löschung',
        content2: 'Die Löschung einer Virtuellen Karte ist sofort und unwiderruflich. Abonnements, die mit dieser Karte verbunden sind, werden automatisch abgelehnt. Es wird empfohlen, Ihre Zahlungsinformationen bei den betroffenen Händlern vor der Löschung zu aktualisieren.',
        subtitle3: '9.3 Im Falle von Betrug',
        content3: 'Bei vermuteter Verlust oder Diebstahl der Koordinaten löschen Sie die Karte sofort über Ihre Anwendung und kontaktieren Sie unseren Kundendienst unter +49 XX XX XX XX XX (verfügbar 24/7).',
      },
      section10: {
        title: '10. HAFTUNG',
        content: 'ALTUS kann nicht haftbar gemacht werden im Falle von:',
        list: [
          'Ablehnung eines Händlers, die Virtuelle Karte zu akzeptieren',
          'Vorübergehende Serviceunterbrechung zur Wartung',
          'Betrügerische Nutzung aufgrund von Fahrlässigkeit des Karteninhabers',
          'Handelsstreitigkeiten zwischen dem Karteninhaber und einem Händler',
        ],
        content2: 'Der Karteninhaber ist vollständig verantwortlich für die Nutzung seiner Virtuellen Karte und die durchgeführten Transaktionen bis zur Benachrichtigung über betrügerische Nutzung.',
      },
      section11: {
        title: '11. LAUFZEIT UND ÄNDERUNG',
        content: 'Diese AGB werden auf unbestimmte Zeit geschlossen. ALTUS behält sich das Recht vor, diese AGB jederzeit zu ändern. Jede Änderung wird dem Karteninhaber mindestens 2 Monate vor ihrem Inkrafttreten mitgeteilt. Das Fehlen eines Widerspruchs innerhalb dieser Frist gilt als Annahme.',
      },
      section12: {
        title: '12. BESCHWERDEN',
        content: 'Für Beschwerden kann der Karteninhaber den ALTUS-Kundendienst kontaktieren:',
        list: [
          'Per E-Mail: support@altusgroup.com',
          'Per Telefon: +49 XX XX XX XX XX',
          'Über den sicheren Kundenbereich',
        ],
        content2: 'Bei fehlender zufriedenstellender Antwort innerhalb von 2 Monaten kann sich der Karteninhaber an den AMF-Schlichter wenden.',
      },
      section13: {
        title: '13. ANWENDBARES RECHT UND GERICHTSSTAND',
        content: 'Diese AGB unterliegen deutschem Recht. Alle Streitigkeiten bezüglich ihrer Auslegung oder Ausführung fallen in die ausschließliche Zuständigkeit der deutschen Gerichte.',
      },
      note: 'Durch Aktivierung Ihrer ALTUS Virtuellen Karte bestätigen Sie, dass Sie die gesamten Allgemeinen Nutzungsbedingungen gelesen, verstanden und akzeptiert haben.',
    },
    processTimeline: {
      title: 'Finanzierungsprozess',
      subtitle: 'Von Ihrem Antrag bis zur Auszahlung: ein vereinfachter und schneller Ablauf',
      step1Title: 'Online-Antrag',
      step1Duration: '5 Minuten',
      step1Description: 'Füllen Sie unser sicheres Formular aus und laden Sie Ihre Unterlagen hoch',
      step1Docs: [
        'Handelsregisterauszug unter 3 Monaten',
        'Ausweis des Geschäftsführers',
        'Letzte Jahresabschlüsse',
        'Kontoauszüge (3 Monate)'
      ],
      step2Title: 'Prüfung der Unterlagen',
      step2Duration: '24-48h',
      step2Description: 'Unser Expertenteam prüft Ihren Antrag und Ihre Rückzahlungsfähigkeit',
      step2Docs: [
        'Prüfung der Dokumente',
        'Finanzanalyse',
        'Bonitätsprüfung',
        'Berechnung des persönlichen Zinssatzes'
      ],
      step3Title: 'Grundsätzliche Zusage',
      step3Duration: '48h',
      step3Description: 'Erhalt Ihres detaillierten Kreditangebots mit endgültigen Konditionen',
      step3Docs: [
        'Bewilligter Betrag',
        'Effektivzins und Monatsraten',
        'Erforderliche Sicherheiten',
        'Aufschiebende Bedingungen'
      ],
      step4Title: 'Auszahlung',
      step4Duration: '7-15 Tage',
      step4Description: 'Elektronische Vertragsunterzeichnung und Zahlung innerhalb von 7-15 Tagen nach Implementierung der Sicherheiten',
      step4Docs: [
        'Unterzeichnung des Kreditvertrags',
        'Implementierung der Sicherheiten',
        'Kreditnehmerversicherung',
        'Überweisung der Mittel'
      ],
      documentsTitle: 'Vorzubereitende Dokumente je nach Projekt',
      creationTitle: 'Unternehmensgründung',
      creationDocs: [
        'Detaillierter Businessplan',
        '3-Jahres-Finanzprognose',
        'Finanzierungsplan',
        'Lebenslauf des Geschäftsführers und Erfahrung',
        'Nachweis des Eigenkapitals'
      ],
      repriseTitle: 'Unternehmensübernahme',
      repriseDocs: [
        'Übernahmevertrag',
        'Jahresabschlüsse der letzten 3 Jahre',
        'Bewertung des Geschäftswerts',
        'Gewerbemietvertrag',
        'Unbedenklichkeitsbescheinigung'
      ],
      developmentTitle: 'Entwicklung',
      developmentDocs: [
        'Jahresabschlüsse der letzten 3 Jahre',
        'Vollständiges Steuerpaket',
        'Lieferantenangebote (Ausrüstung)',
        'Geschäftskontoauszüge (6 Monate)',
        'Geschäftsprognose'
      ],
      incompleteTitle: 'Unvollständige Unterlagen? Kein Problem!',
      incompleteDescription: 'Unser Team hilft Ihnen bei der Zusammenstellung Ihrer Unterlagen. Wir unterstützen Sie beim Erhalt fehlender Dokumente.',
      needHelp: 'Brauchen Sie Hilfe?',
      averageTime: 'Durchschnittliche Gesamtdauer:',
      averageTimeValue: '2-3 Wochen von der Einreichung bis zur Auszahlung',
      startApplication: 'Meinen Antrag starten'
    },
    guaranteesSection: {
      title: 'Sicherheiten und Absicherung',
      subtitle: 'Mehrere Optionen zur Absicherung Ihrer Finanzierung und Optimierung Ihrer Steuern',
      organizationalTitle: 'Organisatorische Sicherheiten',
      organizationalItems: [
        'BPI France (40-70% des Kredits)',
        'SIAGI (Handwerker-/Händlergarantie)',
        'France Active (Sozialwirtschaft)',
        'SOCAMA (Landwirte)'
      ],
      realTitle: 'Dingliche Sicherheiten',
      realItems: [
        'Hypothek auf Immobilien',
        'Verpfändung des Geschäftswerts',
        'Pfandrecht an Material/Ausrüstung',
        'Darlehensgeber-Privileg'
      ],
      personalTitle: 'Persönliche Sicherheiten',
      personalItems: [
        'Gesamtschuldnerische Bürgschaft des Geschäftsführers',
        'Professionelle Bankbürgschaft',
        'Garantie auf erste Anforderung',
        'Patronatserklärung der Gruppe'
      ],
      insuranceTitle: 'Kreditnehmerversicherung',
      insuranceItems: [
        'Tod / PTIA (obligatorisch)',
        'Dauerhafte Invalidität (IPT/IPP)',
        'Zeitweilige Arbeitsunfähigkeit (ITT)',
        'Steuerlich absetzbare Beiträge'
      ],
      taxBenefitsTitle: 'Steuervorteile des Geschäftskredits',
      taxBenefit1Title: 'Absetzbarkeit der Zinsen',
      taxBenefit1Description: 'Die Darlehenszinsen sind vom steuerlichen Ergebnis Ihres Unternehmens absetzbar und reduzieren somit Ihre Gewinnsteuer.',
      taxBenefit2Title: 'Beschleunigte Abschreibung',
      taxBenefit2Description: 'Für finanzierte Ausrüstung ist unter bestimmten Bedingungen eine beschleunigte Abschreibung möglich (neue, ökologische Ausrüstung usw.).',
      taxBenefit3Title: 'Steuergutschrift',
      taxBenefit3Description: 'Bestimmte Investitionen berechtigen zu Steuergutschriften (Energiewende, Digital, Ausbildung).',
      taxBenefit4Title: 'Erstattungsfähige Mehrwertsteuer',
      taxBenefit4Description: 'Die Mehrwertsteuer auf Zinsen und Bearbeitungsgebühren ist für steuerpflichtige Unternehmen erstattungsfähig.',
      taxAdvice: 'Steuerberatung: Konsultieren Sie Ihren Steuerberater, um die Absetzbarkeit Ihrer Kredite zu optimieren und Ihre Steuervorteile zu maximieren.',
      contributionTitle: 'Erforderliches Eigenkapital',
      equipmentPercentage: '10-15%',
      equipmentLabel: 'Ausrüstung',
      equipmentDescription: 'Material, Fahrzeuge',
      creationPercentage: '20-30%',
      creationLabel: 'Gründung / Übernahme',
      creationDescription: 'Geschäftswert',
      realEstatePercentage: '20-25%',
      realEstateLabel: 'Gewerbeimmobilien',
      realEstateDescription: 'Räumlichkeiten, Büros',
      contributionDisclaimer: '* Richtwerte, die je nach Projekt und Profil variieren können'
    },
    footer: {
      description: 'Ihr vertrauenswürdiger Partner für alle Ihre Finanzierungsprojekte. Kreditlösungen für Privat- und Geschäftskunden.',
      phone: '+352 40 63 48',
      email: 'infos@altusfinancegroup.com',
      address: '19 Rue Sigismond, L-2537 Luxembourg',
      hoursTitle: 'Öffnungszeiten',
      hours: {
        weekdays: 'Mo - Fr: 9:00 - 19:00',
        weekend: 'Sa: 9:00 - 17:00',
        support: 'Responsive support',
      },
      certificationsTitle: 'Zertifizierungen & Sicherheit',
      certifications: [
        'Reguliert durch ACPR',
        'ISO 27001 Zertifiziert',
        'DSGVO-konform',
        'SSL/TLS Gesichert',
        'FBF Mitglied',
      ],
      productsTitle: 'Unsere Produkte',
      products: {
        personal: 'Privatdarlehen',
        business: 'Geschäftskredite',
        mortgage: 'Immobilienkredit',
        auto: 'Autokredit',
        renovation: 'Renovierungsdarlehen',
      },
      companyTitle: 'Unternehmen',
      careers: 'Karriere',
      legalTitle: 'Rechtliches',
      legalLinks: {
        terms: 'Rechtliche Hinweise',
        privacy: 'Datenschutzrichtlinie',
        cgu: 'AGB',
        cookies: 'Cookies',
        gdpr: 'DSGVO',
      },
      helpTitle: 'Hilfe',
      helpLinks: {
        faq: 'FAQ',
        userGuide: 'Benutzerhandbuch',
        support: 'Kundensupport',
        simulator: 'Kreditsimulator',
        contactUs: 'Kontaktieren Sie uns',
      },
      copyright: 'Altus Finance Group. Alle Rechte vorbehalten.',
      regulatory: 'Altus Finance Group ist eine von der ACPR zugelassene Finanzierungsmarke. Kreditinstitut unter Kontrolle der Banque de France.',
      disclaimer: 'Achtung, Geld leihen kostet auch Geld. Die Informationen auf dieser Seite dienen nur zu Informationszwecken und stellen kein vertragliches Angebot dar. Alle Kreditanträge unterliegen der Prüfung und Annahme der Unterlagen. Ein Kredit verpflichtet Sie und muss zurückgezahlt werden. Überprüfen Sie Ihre Rückzahlungsfähigkeit, bevor Sie sich verpflichten.',
    },
    seo: {
      home: {
        title: 'Altus Finance Group - Professional & Personal Loans | Fast and Competitive Financing',
        description: 'Professional and personal loan solutions with Altus Finance Group. Get fast financing for your business or personal project. Competitive rates, simple and transparent process.',
      },
      about: {
        title: 'About Altus Finance Group - Our Mission and Values | Financing Solutions',
        description: 'Discover Altus Finance Group, leader in professional loan solutions with over 15 years of experience, 15,000+ satisfied clients and €500M in loans granted. Our mission: make financing accessible to all.',
      },
      contact: {
        title: 'Contact Us - Altus Finance Group | Questions About Our Professional Loans',
        description: 'Have a question about our financing solutions? Contact Altus Finance Group. Our team is available to support you with your professional loan project. Fast response guaranteed.',
      },
      howItWorks: {
        title: 'How to Get a Business Loan - Detailed Process | Altus Finance Group',
        description: 'Discover the complete process to obtain a professional loan with Altus Finance Group. From online application to fund release: criteria, required documents and timeframes. Response in 24-48h.',
      },
      forgotPassword: {
        title: 'Forgot Password | Altus Finance Group',
        description: 'Reset your password',
        emailSentTitle: 'Email Sent | Altus Finance Group',
        emailSentDescription: 'A reset link has been sent',
      },
      resetPassword: {
        title: 'Reset Password | Altus Finance Group',
        description: 'Create a new password for your account',
      },
      twoFactorSetup: {
        title: '2FA Setup | Altus Finance Group',
        description: 'Set up two-factor authentication to secure your account',
      },
      verifyTwoFactor: {
        title: '2FA Verification | Altus Finance Group',
        description: 'Two-factor verification',
      },
    },
    businessLoans: {
      title: 'Lösungen für Professionelle',
      subtitle: 'Finanzierung maßgeschneidert für Ihr Unternehmen, Kleinstunternehmen, KMU oder Selbstständige',
      businessLoan: 'Geschäftskredit',
      businessLoanDesc: 'Finanzierung für Ihre Geschäftsprojekte, Entwicklung und Cashflow',
      businessLoanFeatures: ['Antwort innerhalb 48h', 'Fester Zinssatz', 'Flexible Rückzahlung'],
      cashFlowCredit: 'Liquiditätskredit',
      cashFlowCreditDesc: 'Schnelle Lösung zur Verwaltung Ihres Betriebskapitalbedarfs',
      cashFlowCreditFeatures: ['Schnelle Auszahlung', 'Ohne Sicherheit bis €50k', 'Flexibel'],
      equipmentFinancing: 'Ausrüstungsfinanzierung',
      equipmentFinancingDesc: 'Kaufen Sie Ihre professionelle Ausrüstung und Materialien',
      equipmentFinancingFeatures: ['Bis zu 100% Finanzierung', 'Leasing-Option', 'Steuerlich absetzbar'],
      commercialProperty: 'Gewerbeimmobilienkredit',
      commercialPropertyDesc: 'Erwerben Sie Ihre Räumlichkeiten, Büros oder gewerbliche Lagerhallen',
      commercialPropertyFeatures: ['Lange Laufzeit', 'Anzahlung ab 20%', 'Wettbewerbsfähiger Zinssatz'],
      lineOfCredit: 'Kreditlinie',
      lineOfCreditDesc: 'Revolvierender Kredit für Ihren gelegentlichen Bedarf',
      lineOfCreditFeatures: ['Verfügbar 24/7', 'Freie Rückzahlung', 'Automatische Verlängerung'],
      lineOfCreditDuration: 'Verlängerbar',
      vehicleFleet: 'Fahrzeugkredit',
      vehicleFleetDesc: 'Finanzieren Sie Ihren Fuhrpark oder Nutzfahrzeuge',
      vehicleFleetFeatures: ['Leasing oder klassischer Kredit', 'Rückkaufoption', 'Versicherung inklusive'],
      smeLoan: 'KMU-Kredite',
      smeLoanDesc: 'Dedizierte Finanzierungslösungen für KMU für Wachstum, Entwicklung und strategische Investitionen',
      smeLoanFeatures: ['Hohe Beträge bis €1M', 'Flexible Laufzeit 1-10 Jahre', 'Fachkundige Betreuung'],
      amount: 'Betrag',
      rate: 'Effektivzins',
      duration: 'Laufzeit',
      months: 'Monate',
      years: 'Jahre',
      features: 'Vorteile',
      learnMore: 'Mehr erfahren',
      advantagesTitle: 'ALTUS Pro Vorteile',
      advantages: [
        'Dedizierter Berater für Ihr Unternehmen',
        'Individuelle Prüfung Ihrer Unterlagen',
        'Begleitung während des gesamten Prozesses',
        'Business-Plan-Paket inklusive',
      ],
      eligibilityTitle: 'Zulassungskriterien',
      eligibility: [
        'In Frankreich registriertes Unternehmen',
        'Seit mehr als 6 Monaten aktiv',
        'Kein Bankverbot',
        'Aktuelle Finanzberichte',
      ],
      rateDisclaimer: 'Richtzinssätze vorbehaltlich Prüfung und Annahme Ihres Antrags. Fester Effektivzins.',
      simulateLoan: 'Mein Geschäftskredit simulieren',
      contactAdvisor: 'Berater kontaktieren',
    },
    professionalFAQ: {
      title: 'Häufig gestellte Fragen',
      subtitle: 'Finden Sie schnell Antworten auf Ihre Fragen',
      faqs: [
        {
          question: 'Welche Dokumente werden für einen Geschäftskreditantrag benötigt?',
          answer: 'Für Professionelle: Unternehmensregistrierung jünger als 3 Monate, Ausweis des Direktors, Finanzberichte der letzten 3 Jahre, vollständige Steuerunterlagen, Geschäftskontenauszüge (6 Monate), Businessplan (für Startups), Finanzprognose. Für Privatpersonen: Ausweis, Wohnsitznachweis, aktuelle Gehaltsabrechnungen und Steuerbescheid.',
        },
        {
          question: 'Welche Eigenbeteiligung ist für einen Geschäftskredit erforderlich?',
          answer: 'Die Eigenbeteiligung variiert je nach Projekt: 10-15% für Ausrüstungs- oder Materialkauf, 20-30% für Unternehmensgründung oder -übernahme, 20-25% für Gewerbeimmobilien. Eine höhere Eigenbeteiligung kann Ihre Finanzierungsbedingungen verbessern und Ihren Zinssatz senken.',
        },
        {
          question: 'Wie lange dauert es bis zur Antwort und Auszahlung?',
          answer: 'Erste Genehmigung innerhalb von 24-48h nach Einreichung des vollständigen Antrags. Endgültige Genehmigung innerhalb von 48h. Auszahlung erfolgt 7-15 Tage nach Vertragsunterzeichnung und Sicherheitenstellung. Durchschnittliche Gesamtdauer: 2-3 Wochen.',
        },
        {
          question: 'Welche Sicherheiten kann ich für meinen Geschäftskredit anbieten?',
          answer: 'Mehrere Optionen: dingliche Sicherheiten (Hypothek, Geschäftswertpfand, Materialpfand), persönliche Sicherheiten (gesamtschuldnerische Bürgschaft des Direktors), Garantieorganisationen (BPI France 40-70%, SIAGI, France Active, SOCAMA), oder Kreditnehmerversicherung (obligatorisch: Tod/PTIA, optional: IPT/IPP/ITT).',
        },
        {
          question: 'Sind Kreditzinsen steuerlich absetzbar?',
          answer: 'Ja! Geschäftskreditzinsen sind vollständig von Ihrem zu versteuernden Einkommen absetzbar und reduzieren so Ihre Ertragssteuer. Auch die Prämien der Kreditnehmerversicherung sind absetzbar. Die Mehrwertsteuer auf Zinsen und Gebühren ist für steuerpflichtige Unternehmen erstattungsfähig.',
        },
        {
          question: 'Kann ich einen Kredit erhalten, wenn mein Unternehmen weniger als ein Jahr alt ist?',
          answer: 'Ja, wir finanzieren Unternehmensgründungen mit solidem Businessplan und Eigenbeteiligung von 20-30%. Wir bewerten Ihre berufliche Erfahrung, Projektviabilität und Prognosen. Ein Ehrenkredit (BPI France, Initiative France) kann Ihren Antrag stärken.',
        },
        {
          question: 'Kann ich meinen Geschäftskredit vorzeitig zurückzahlen?',
          answer: 'Ja, alle unsere Geschäftskredite erlauben vorzeitige Rückzahlung. Strafgebühren sind gesetzlich begrenzt: maximal 6 Monate Zinsen oder 3% des Restkapitals. Einige Verträge sehen kostenlose vorzeitige Rückzahlung nach einer bestimmten Frist vor.',
        },
        {
          question: 'Welche aktuellen Zinssätze gelten für Geschäftskredite?',
          answer: 'Unsere Effektivzinssätze variieren je nach Projekt: Gewerbeimmobilien 2,9-5,5% (5-25 Jahre), Ausrüstung 3,9-7,5% (2-5 Jahre), Geschäftswert 4,7% (5-10 Jahre), Cashflow 4,0-9,0% (3-36 Monate), Geschäftsfahrzeuge 3,2-6,5% (2-6 Jahre). Zinssätze individuell nach Profil und Laufzeit.',
        },
        {
          question: 'Wie funktioniert der Online-Antragsprozess?',
          answer: '1) Füllen Sie unser Online-Formular aus (5 Min.) und laden Sie Ihre Dokumente hoch. 2) Analyse Ihres Antrags durch unsere Experten (24-48h). 3) Erhalten Sie Ihre grundsätzliche Genehmigung mit Bedingungen. 4) Elektronische Vertragsunterzeichnung. 5) Sicherheitenstellung. 6) Auszahlung auf Ihr Altus-Konto.',
        },
        {
          question: 'Kann ich mehrere Finanzierungsarten kombinieren?',
          answer: 'Ja, Sie können mehrere Lösungen kombinieren: Bankkredit + Leasing für Ausrüstung, Geschäftskredit + Ehrenkredit (BPI France) zur Stärkung des Eigenkapitals, oder Kreditlinie + Tilgungskredit zur Kombination von Flexibilität und langfristiger Finanzierung.',
        },
        {
          question: 'Gibt es Antragsgebühren und andere Kosten?',
          answer: 'Antragsgebühren: 1-2% des Betrags für Geschäftskredite (verhandelbar). Sicherheitengebühren: variabel je nach Art (Hypothek, Pfand). Kreditnehmerversicherung: 0,10% bis 0,40% des geliehenen Kapitals pro Jahr. Alle Gebühren sind in Ihrem Kreditangebot detailliert aufgeführt.',
        },
        {
          question: 'Was passiert, wenn ich Rückzahlungsschwierigkeiten habe?',
          answer: 'Kontaktieren Sie uns bei ersten Anzeichen von Schwierigkeiten. Wir können prüfen: vorübergehender Zahlungsaufschub, Zahlungsmodulation, Kreditlaufzeitverlängerung oder Kreditreorganisation. Vorbeugende Unterstützung ist immer vorzuziehen.',
        },
      ],
      notFoundTitle: 'Finden Sie die Antwort auf Ihre Frage nicht?',
      notFoundDesc: 'Unser Expertenteam ist montags bis freitags von 9 bis 19 Uhr verfügbar',
      contactUs: 'Kontaktieren Sie uns',
      helpCenter: 'Hilfecenter',
    },
    admin: {
      common: {
        status: {pending: 'Ausstehend', active: 'Aktiv', approved: 'Genehmigt', rejected: 'Abgelehnt', suspended: 'Ausgesetzt', completed: 'Abgeschlossen', signed: 'Unterzeichnet', inProgress: 'In Bearbeitung'},
        actions: {approve: 'Genehmigen', reject: 'Ablehnen', delete: 'Löschen', suspend: 'Aussetzen', save: 'Speichern', download: 'Herunterladen', upload: 'Hochladen', send: 'Senden', edit: 'Bearbeiten', cancel: 'Abbrechen', disburse: 'Auszahlen'},
        labels: {user: 'Benutzer', userName: 'Benutzername', userEmail: 'Benutzer-E-Mail', amount: 'Betrag', type: 'Typ', rate: 'Zinssatz', duration: 'Laufzeit', status: 'Status', date: 'Datum', createdAt: 'Erstellt', actions: 'Aktionen', fees: 'Gebühren', progress: 'Fortschritt', codes: 'Codes', recipient: 'Empfänger', contract: 'Vertrag', months: 'Monate', total: 'Gesamt', active: 'aktiv', pending: 'ausstehend', recent: 'Neueste', all: 'Alle', noData: 'Keine Daten', loading: 'Lädt...', error: 'Fehler', success: 'Erfolg', balance: 'Guthaben', loans: 'Kredite'},
        messages: {error: 'Fehler', success: 'Erfolg', updated: 'Aktualisiert', approved: 'Genehmigt', rejected: 'Abgelehnt', deleted: 'Gelöscht', disbursed: 'Ausgezahlt', cannotApprove: 'Kann nicht genehmigen', cannotReject: 'Kann nicht ablehnen', cannotDelete: 'Kann nicht löschen', cannotUpdate: 'Kann nicht aktualisieren', loadError: 'Ladefehler'},
        empty: {noResults: 'Keine Ergebnisse', noData: 'Keine Daten verfügbar'},
      },
      dashboard: {title: 'Admin-Konsole', description: 'Plattformübersicht und Benutzerverwaltung', totalUsers: 'Benutzer gesamt', activeUsers: 'aktiv', pendingUsers: 'ausstehend', transfers: 'Überweisungen', transfersPending: 'in Bearbeitung', loans: 'Kredite', loansActive: 'aktiv', totalVolume: 'Gesamtvolumen', volumeDescription: 'Überweisungen gesamt', recentUsers: 'Neueste Benutzer', recentUsersDescription: 'Neueste Registrierungen', recentTransfers: 'Neueste Überweisungen', recentTransfersDescription: 'Neueste Transaktionen'},
      loans: {title: 'Kreditverwaltung', description: 'Alle Kreditanträge der Plattform verwalten', allLoans: 'Alle Kredite', allLoansDescription: 'Vollständige Liste der Kreditanträge', loanApproved: 'Kredit genehmigt', loanApprovedDesc: 'Der Kredit wurde erfolgreich genehmigt. Der Vertrag wurde erstellt.', loanRejected: 'Kredit abgelehnt', loanRejectedDesc: 'Der Kredit wurde erfolgreich abgelehnt', loanDeleted: 'Kredit gelöscht', loanDeletedDesc: 'Der Kredit wurde erfolgreich gelöscht', fundsDisbursed: 'Mittel ausgezahlt', fundsDisbursedDesc: 'Die Mittel wurden erfolgreich ausgezahlt. Der Benutzer wurde benachrichtigt.', contractGenerated: '📄 Erstellt', contractSigned: '✅ Unterzeichnet', approveReason: 'Grund der Genehmigung', rejectReason: 'Grund der Ablehnung', deleteReason: 'Grund der Löschung', approveDialogDesc: 'Diese Aktion genehmigt den Kredit von {amount} für {userName} und erstellt den Vertrag.', rejectDialogTitle: 'Kredit ablehnen', rejectDialogDesc: 'Diese Aktion lehnt den Kredit dauerhaft ab. Der Benutzer wird benachrichtigt.', disburseDialogTitle: 'Mittel auszahlen', disburseDialogDesc: 'Diese Aktion zahlt {amount} an {userName} aus. Der Kredit wird aktiv und der Benutzer kann Überweisungen vornehmen.', deleteDialogTitle: 'Kredit löschen', deleteDialogDesc: 'Diese Aktion löscht den Kredit dauerhaft.'},
      transfers: {title: 'Überweisungsverwaltung', description: 'Überweisungsanträge genehmigen oder aussetzen', allTransfers: 'Alle Überweisungen', allTransfersDescription: 'Vollständige Liste der Geldüberweisungen', transferUpdated: 'Überweisung aktualisiert', transferUpdatedDesc: 'Der Überweisungsstatus wurde erfolgreich aktualisiert', approveDialogTitle: 'Überweisung genehmigen', approveDialogDesc: 'Diese Aktion genehmigt die Überweisung und aktualisiert ihren Status auf "in Bearbeitung".', suspendDialogTitle: 'Überweisung aussetzen', suspendDialogDesc: 'Diese Aktion setzt die Überweisung aus. Sie kann später reaktiviert werden.'},
    },
  },
  nl: {
    hero: {
      title: 'Realiseer uw projecten met Altus Finance Group',
      subtitle: 'Financieringsoplossingen voor particulieren en bedrijven - Concurrerende tarieven en transparant proces',
      cta1: 'Financiering aanvragen',
      cta2: 'Mijn gebied',
      learnMore: 'Meer weten',
      trustIndicator: 'Meer dan 15.000 tevreden klanten vertrouwen ons',
      trustBadges: {
        response24h: 'Reactie binnen 24u',
        swissSecurity: 'Zwitserse bankbeveiliging',
        fastApproval: 'Snelle goedkeuring',
      },
      calculator: {
        title: 'Bereken uw Budget',
        subtitle: 'Krijg direct een schatting',
        loanAmount: 'Leningbedrag',
        duration: 'Looptijd (maanden)',
        monthlyPayment: 'Maandelijkse Betaling',
        perMonth: 'per maand',
        applyNow: 'Nu aanvragen',
        disclaimer: 'Gratis aanvraag - Geen verplichting - Vertrouwelijk proces',
      },
      slides: [
        {
          title: 'Altus Finance Group',
          subtitle: 'Professionele en veilige financieringsoplossingen om uw groei te ondersteunen.',
        },
        {
          title: 'Financiële Expertise van Uitmuntendheid',
          subtitle: 'Op maat gemaakte oplossingen aangepast aan uw ondernemende en vermogensambities.',
        },
        {
          title: 'Uw Betrouwbare Partner',
          subtitle: 'Persoonlijke begeleiding en absolute discretie voor al uw financieringsprojecten.',
        },
        {
          title: 'Financiële oplossingen op maat',
          subtitle: 'Persoonlijke begeleiding om al uw professionele en persoonlijke projecten te realiseren',
        },
        {
          title: 'Uw betrouwbare partner',
          subtitle: 'Meer dan 15.000 tevreden klanten vertrouwen ons voor hun financieringsbehoeften',
        },
        {
          title: 'Financier uw ambities',
          subtitle: 'Voordelige tarieven en een eenvoudig proces om uw projecten tot leven te brengen',
        },
        {
          title: 'Expertise en begeleiding',
          subtitle: 'Een toegewijd team om u bij elke stap van uw project te begeleiden',
        },
      ],
    },
    nav: {
      home: 'Start',
      products: 'Onze leningen',
      tagline: 'Premium Financiële Oplossingen',
      more: 'Meer',
      moreInfo: 'Meer informatie',
      language: 'Taal',
      loansMenu: {
        label: 'Onze leningen',
        items: [
          {
            title: 'Persoonlijk Krediet',
            description: 'Financier uw persoonlijke projecten met concurrerende tarieven',
            href: '/loans/personal-credit',
          },
          {
            title: 'Lening Herfinanciering',
            description: 'Consolideer uw leningen om terugbetalingen te vereenvoudigen',
            href: '/loans/loan-refinancing',
          },
          {
            title: 'Leasing Herfinanciering',
            description: 'Optimaliseer uw kosten door uw leasing te herfinancieren',
            href: '/loans/lease-refinancing',
          },
          {
            title: 'Creditcard Herfinanciering',
            description: 'Verlaag uw creditcard rentetarieven',
            href: '/loans/credit-card-refinancing',
          },
          {
            title: 'Diverse Kredieten',
            description: 'Financieringsoplossingen aangepast aan al uw behoeften',
            href: '/products',
          },
          {
            title: 'MKB Leningen',
            description: 'Bedrijfsfinanciering om uw onderneming te laten groeien',
            href: '/products',
          },
        ],
      },
      howItWorks: 'Hoe het werkt',
      resources: 'Bronnen',
      faq: 'FAQ',
      about: 'Over ons',
      contact: 'Contact',
      phone: '+352 40 63 48',
      dashboard: 'Overzicht',
      loans: 'Leningen',
      myLoans: 'Mijn Leningen',
      newLoan: 'Lening Aanvraag',
      contracts: 'Contracten',
      loansSection: 'Leningen',
      transfers: 'Overschrijvingen',
      history: 'Geschiedenis',
      settings: 'Instellingen',
      logout: 'Afmelden',
      users: 'Gebruikers',
      documents: 'KYC-documenten',
      reports: 'Rapporten',
    },
    contracts: {
      title: 'Contractbeheer',
      description: 'Download, onderteken en stuur uw leningscontracten veilig terug.',
      loanNumber: 'Lening',
      approvedOn: 'Goedgekeurd op',
      actionRequired: 'Actie vereist',
      step1: '1. Contract downloaden',
      step1Description: 'Download en lees uw leningscontract zorgvuldig.',
      step2: '2. Ondertekenen en terugsturen',
      step2Description: 'Onderteken het contract en stuur het terug in PDF-formaat.',
      downloadContract: 'Contract downloaden',
      tabPending: 'Te ondertekenen',
      tabReview: 'In behandeling',
      tabCompleted: 'Voltooid',
      inReview: 'In behandeling',
      signed: 'Ondertekend',
      noPendingContracts: 'Geen openstaande contracten',
      noPendingContractsDescription: 'Al uw contracten zijn ondertekend en verzonden.',
      noReviewContracts: 'Geen contracten in behandeling',
      noReviewContractsDescription: 'Er zijn momenteel geen contracten in afwachting van beoordeling.',
      noCompletedContracts: 'Geen ondertekende contracten',
      noCompletedContractsDescription: 'Uw ondertekende contracten verschijnen hier.',
      reviewMessage: 'Uw ondertekende contract is ontvangen en wordt beoordeeld door ons team. U wordt op de hoogte gebracht zodra de fondsen zijn vrijgegeven.',
      signedSuccess: 'Contract succesvol ondertekend en gevalideerd',
      downloadOriginal: 'Origineel contract downloaden',
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
      pendingTransfers: 'Lopende overschrijvingen',
      availableFunds: 'Beschikbare middelen',
      upcomingRepayments: 'Aankomende aflossingen',
      yourGlobalBalance: 'Uw totale saldo',
      noActiveLoans: 'Geen actieve leningen',
      noTransfers: 'Geen overschrijvingen gevonden',
      dataLoadError: 'Fout bij het laden van gegevens',
      available: 'beschikbaar',
      notifications: 'Meldingen',
      noNotifications: 'Geen meldingen',
      viewDetails: 'Details bekijken',
      availableOffers: 'Beschikbare aanbiedingen voor u',
      contractToSign: 'Te ondertekenen contract',
      moreTransfers: 'extra overschrijving(en)',
      goodMorning: 'Goedemorgen',
      goodAfternoon: 'Goedemiddag',
      goodEvening: 'Goedenavond',
      totalBalance: 'Totaal saldo',
      newTransfer: 'Nieuwe overboeking',
      requestLoan: 'Lening aanvragen',
      manageAccounts: 'Rekeningen beheren',
      cashflow: 'Cashflow',
      incomeExpensesSixMonths: 'Inkomsten en uitgaven over 6 maanden',
      income: 'Inkomsten',
      expenses: 'Uitgaven',
      creditUtilization: 'Kredietgebruik',
      used: 'gebruikt',
      recentActivity: 'Recente activiteit',
      latestTransactions: 'Laatste transacties',
      viewAll: 'Bekijk alles',
      noRecentTransactions: 'Geen recente transacties',
      pendingRequests: 'In behandeling',
      pendingRequestsDescription: 'Uw leningaanvragen in behandeling',
      noPendingRequests: 'Geen aanvragen in behandeling',
      pendingLoan: 'Aanvraag in behandeling',
      yourActiveLoans: 'Uw actieve leningen',
      yourActiveLoansDescription: 'Volg uw terugbetalingen en vervaldagen',
      activeLoan: 'Actieve lening',
      repaid: 'Terugbetaald',
      upcomingDueDates: 'Aankomende vervaldagen',
      amount: 'Bedrag',
      monthJan: 'Jan',
      monthFeb: 'Feb',
      monthMar: 'Mrt',
      monthApr: 'Apr',
      monthMay: 'Mei',
      monthJun: 'Jun',
      serverError: 'Kan geen verbinding maken met de server. Controleer uw verbinding en probeer het opnieuw.',
      diagnosticInfo: 'Diagnostische informatie (ontwikkeling)',
      retry: 'Opnieuw proberen',
      financeOverview: 'Hier is een overzicht van uw financiën',
      yourCreditLimit: 'Uw kredietlimiet',
      maximum: 'Maximum',
      activeLoanSingular: 'actieve lening',
      activeLoansPlural: 'actieve leningen',
      loanNumber: 'Lening #',
      progression: 'Voortgang',
      nextSixMonths: 'Volgende 6 maanden',
      repayment: 'Terugbetaling',
      noUpcomingRepayments: 'Geen aankomende terugbetalingen',
      pendingContracts: 'Openstaande contracten',
      contractsToSign: 'contract(en) te ondertekenen',
      generatedOn: 'Gegenereerd op',
      view: 'Bekijken',
    },
    loan: {
      pageTitle: 'Mijn leningen',
      pageDescription: 'Beheer uw leningen en simuleer uw aflossingen',
      tabMyLoans: 'Mijn leningen',
      tabCalculator: 'Calculator',
      amount: 'Bedrag',
      interestRate: 'Rentetarief',
      nextPayment: 'Volgende betaling',
      viewAll: 'Alles bekijken',
      status: 'Status',
      downloadContract: 'Contract downloaden',
      uploadSignedContract: 'Getekend contract uploaden',
      downloading: 'Downloaden...',
      uploading: 'Uploaden...',
      loanNumber: 'Lening',
      requestSubmitted: 'Leningaanvraag ingediend',
      requestSubmittedDesc: 'Uw aanvraag wacht op goedkeuring door een beheerder. U ontvangt een melding zodra deze is verwerkt.',
      requestError: 'Kan leningaanvraag niet indienen',
      loanApproved: '🎉 Uw lening is goedgekeurd!',
      approvalInstructions: 'Om uw lening te voltooien, volgt u deze stappen:',
      approvalStep1: 'Download uw leningcontract (PDF)',
      approvalStep2: 'Lees het zorgvuldig en teken het',
      approvalStep3: 'Stuur het ondertekende contract (PDF) terug via de knop hieronder',
      downloadContractButton: '1. Download contract',
      uploadContractButton: '2. Upload ondertekend contract',
      uploading2: 'Uploaden...',
    },
    transfer: {
      pageTitle: 'Mijn overschrijvingen',
      pageDescription: 'Beheer en volg al uw geldtransfers',
      searchPlaceholder: 'Zoek op ontvanger of ID...',
      allStatuses: 'Alle statussen',
      filterTitle: 'Filters en zoeken',
      filterDescription: 'Verfijn uw overschrijvingslijst',
      noTransfersFound: 'Geen overschrijvingen gevonden',
      noTransfersMessage: 'U heeft nog geen overschrijvingen gedaan',
      createTransfer: 'Overschrijving maken',
      newTransfer: 'Nieuwe overschrijving',
      requestSubmitted: 'Verzoek ingediend',
      documentVerification: 'Documentcontrole',
      complianceCheck: 'Nalevingscontrole',
      approvalPending: 'Goedkeuring in afwachting',
      transferComplete: 'Overschrijving voltooid',
      pending: 'In afwachting',
      inProgress: 'In behandeling',
      approved: 'Goedgekeurd',
      rejected: 'Afgewezen',
      completed: 'Voltooid',
      suspended: 'Opgeschort',
      noAccount: 'Geen geregistreerde rekening',
      validation: 'Validatie',
      validating: 'Valideren...',
      onHold: 'Overschrijving gepauzeerd',
      processing: 'Overschrijving wordt verwerkt',
      processingComplete: 'Overschrijving voltooid',
    },
    history: {
      pageTitle: 'Transactiegeschiedenis',
      pageDescription: 'Bekijk de volledige geschiedenis van al uw transacties',
      totalCredits: 'Totaal kredieten',
      totalDebits: 'Totaal debiteringen',
      totalTransactions: 'Totaal transacties',
      filterTitle: 'Filters en zoeken',
      filterDescription: 'Verfijn uw transactiegeschiedenis',
      searchPlaceholder: 'Zoek op beschrijving of ID...',
      allTypes: 'Alle types',
      typeCredit: 'Krediet',
      typeDebit: 'Debitering',
      typeFee: 'Kosten',
      noTransactionsFound: 'Geen transacties gevonden',
      filterType: 'Type',
      noTransactionsFoundFiltered: 'Probeer uw zoekcriteria te wijzigen',
      noTransactionsYet: 'U heeft nog geen transacties',
    },
    fee: {
      type: 'Type kosten',
      reason: 'Reden',
      amount: 'Bedrag',
      date: 'Datum',
      downloadStatement: 'Afschrift downloaden',
      loanFees: 'Leningkosten',
      transferFees: 'Overschrijvingskosten',
      accountFees: 'Rekeningkosten',
      feesToPay: 'Te betalen kosten',
      unpaidFeesCount: 'onbetaalde kosten',
      unpaidFeesSingular: 'onbetaalde kost',
      pendingValidation: 'In afwachting van validatie',
      autoValidatedViaCode: 'Automatisch gevalideerd via code',
      totalUnpaid: 'Totaal onbetaald',
      totalOverall: 'Totaal algemeen',
    },
    common: {
      loading: 'Laden...',
      error: 'Fout',
      success: 'Succes',
      active: 'Actief',
      pending: 'In afwachting',
      completed: 'Voltooid',
      suspended: 'Opgeschort',
      saving: 'Opslaan...',
      cancel: 'Annuleren',
      save: 'Opslaan',
      close: 'Sluiten',
      noData: 'Geen gegevens beschikbaar',
      months: 'maanden',
      years: 'jaren',
    },
    settings: {
      title: 'Instellingen',
      profile: 'Profiel',
      notifications: 'Meldingen',
      security: 'Beveiliging',
      appearance: 'Uiterlijk',
      personalInfo: 'Persoonlijke informatie',
      updateInfo: 'Werk uw profielinformatie bij',
      fullName: 'Volledige naam',
      email: 'E-mail',
      phone: 'Telefoon',
      company: 'Bedrijf',
      saveChanges: 'Wijzigingen opslaan',
      accountType: 'Accounttype',
      yourAccountType: 'Uw account',
      individualAccount: 'Particuliere rekening',
      businessAccount: 'Zakelijke rekening',
      individualAccess: 'Toegang tot persoonlijke financieringsdiensten',
      businessAccess: 'Volledige toegang tot zakelijke financieringsdiensten',
      verified: 'Geverifieerd',
      notificationPreferences: 'Meldingsvoorkeuren',
      chooseNotifications: 'Kies hoe u op de hoogte wilt worden gebracht',
      emailAlerts: 'E-mailmeldingen',
      emailAlertsDesc: 'Ontvang belangrijke meldingen per e-mail',
      transferUpdates: 'Overschrijvingsupdates',
      transferUpdatesDesc: 'Meldingen over de status van uw overschrijvingen',
      loanReminders: 'Betalingsherinneringen',
      loanRemindersDesc: 'Herinneringen voor uw leningtermijnen',
      marketingEmails: 'Marketing e-mails',
      marketingEmailsDesc: 'Ontvang nieuws en speciale aanbiedingen',
      savePreferences: 'Voorkeuren opslaan',
      changePassword: 'Wachtwoord wijzigen',
      updatePassword: 'Update van uw wachtwoord',
      currentPassword: 'Huidig wachtwoord',
      newPassword: 'Nieuw wachtwoord',
      confirmNewPassword: 'Bevestig nieuw wachtwoord',
      themeSettings: 'Thema-instellingen',
      chooseTheme: 'Selecteer uw voorkeursthema',
      lightMode: 'Lichte modus',
      darkMode: 'Donkere modus',
      systemMode: 'Systeem',
      languageSettings: 'Taalinstellingen',
      chooseLanguage: 'Selecteer uw taal',
      changePhoto: 'Foto wijzigen',
      uploading: 'Uploaden...',
      twoFactorAuth: 'Tweefactorauthenticatie',
      twoFactorAuthDesc: 'Voeg een extra beveiligingslaag toe aan uw account',
      twoFactorEnabled: 'Tweefactorauthenticatie ingeschakeld',
      enable2FA: '2FA inschakelen',
      twoFactorEnabledDesc: 'Uw account is beschermd door tweefactorauthenticatie',
      twoFactorDisabledDesc: 'Bescherm uw account met verificatie in twee stappen via Google Authenticator',
      disable: 'Uitschakelen',
      configure: 'Configureren',
      enabled: 'Ingeschakeld',
      twoFactorActiveMessage: 'Uw account is beveiligd met Google Authenticator. Bij elke aanmelding wordt een code gevraagd.',
      theme: 'Thema',
      themeDesc: 'Kies uw favoriete thema',
      light: 'Licht',
      dark: 'Donker',
      languageLabel: 'Taal',
      languageDesc: 'Selecteer uw taal',
      disable2FASuccess: 'Succes',
      disable2FASuccessDesc: '2FA succesvol uitgeschakeld',
      disable2FAError: 'Fout bij het uitschakelen van 2FA',
    },
    messages: {
      profileUpdated: 'Profiel bijgewerkt',
      profileUpdatedDesc: 'Uw informatie is succesvol opgeslagen.',
      preferencesUpdated: 'Voorkeuren opgeslagen',
      preferencesUpdatedDesc: 'Uw meldingsvoorkeuren zijn bijgewerkt.',
      passwordChanged: 'Wachtwoord gewijzigd',
      passwordChangedDesc: 'Uw wachtwoord is succesvol gewijzigd.',
      passwordMismatch: 'De wachtwoorden komen niet overeen',
      errorUpdatingProfile: 'Fout bij het bijwerken van profiel',
      errorUpdatingPreferences: 'Fout bij het bijwerken van voorkeuren',
      errorChangingPassword: 'Fout bij het wijzigen van wachtwoord',
      avatarUpdated: 'Profielfoto bijgewerkt',
      avatarUpdatedDesc: 'Uw profielfoto is succesvol bijgewerkt.',
      errorUploadingAvatar: 'Fout bij het uploaden van foto',
      invalidFileType: 'Niet toegestaan bestandstype. Alleen JPEG-, PNG- en WebP-afbeeldingen zijn toegestaan.',
      fileTooLarge: 'Het bestand is te groot (max 5MB).',
    },
    about: {
      title: 'Over Altus Finance Group',
      subtitle: 'Uw betrouwbare partner voor de financiering van particulieren en bedrijven',
      mission: 'Onze missie',
      missionText: 'Bij Altus Finance Group democratiseren we de toegang tot financiering voor iedereen. Of u nu een particulier bent met een persoonlijk project of een groeiend bedrijf, we bieden moderne, transparante en op uw behoeften afgestemde kredietoplossingen. Onze geavanceerde technologie stelt ons in staat om uw situatie snel te analyseren en u gepersonaliseerde aanbiedingen met concurrerende tarieven voor te stellen. We geloven in totale transparantie: geen verborgen kosten, duidelijke voorwaarden en begeleiding bij elke stap.',
      stats: {
        clients: 'Actieve klanten',
        loansProvided: 'Verstrekte leningen',
        successRate: 'Tevredenheidspercentage',
        yearsExperience: 'Jaren ervaring',
      },
    },
    howItWorks: {
      title: 'Hoe het werkt',
      subtitle: 'Een 100% digitaal, ultrasnelprocess in 4 eenvoudige stappen',
      step1Title: 'Online aanvraag - 4 minuten',
      step1Desc: 'Vul ons beveiligde formulier in met uw persoonlijke of zakelijke informatie. Geen noodzaak om te reizen, alles gebeurt online met directe identiteitsverificatie (KYC) en vereenvoudigde documentupload.',
      step1Duration: '4 min',
      step2Title: 'Ultrasnelle reactie - Van enkele minuten tot 24u',
      step2Desc: 'Onze kredietbeoordelingstechnologie analyseert uw financieel profiel, uw inkomsten en uw geschiedenis in realtime. Dankzij onze geavanceerde algoritmen en integratie met kredietbureaus geven we u een principieel antwoord in enkele minuten tot maximaal 24u.',
      step2Duration: 'Van enkele minuten tot 24u',
      step3Title: 'Vrijgave van middelen - Direct',
      step3Desc: 'Zodra uw aanvraag is goedgekeurd, worden de middelen direct vrijgegeven op uw beveiligde Altus Finance Group-account. U behoudt de volledige controle over uw middelen met 24/7 toegang via uw klantgebied.',
      step3Duration: 'Direct',
      step4Title: 'Overschrijving naar uw rekening - In uw tempo',
      step4Desc: 'Maak uw middelen over wanneer u wilt naar uw persoonlijke of zakelijke bankrekening rechtstreeks vanuit uw Altus Finance Group-gebied. Directe of geplande overschrijvingen volgens uw behoeften, zonder extra kosten.',
      step4Duration: 'In uw tempo',
      averageTimeValue: 'Maximaal 24 uur van de indiening van de aanvraag tot de vrijgave van middelen',
    },
    products: {
      title: 'Onze leningoplossingen',
      subtitle: 'Producten aangepast aan uw behoeften - Particulieren en Bedrijven',
      businessTitle: 'Zakelijke leningen',
      businessSubtitle: 'Producten aangepast aan uw zakelijke behoeften',
      termLoans: 'Zakelijke termijnleningen',
      termLoansDesc: 'Middellange en langetermijnfinanciering voor uw strategische investeringen: ontwikkeling, acquisitie, expansie. Van €10.000 tot €500.000 over 1 tot 7 jaar. Vaste tarieven van 3,5% tot 8,5% JKP volgens profiel. Vervroegde terugbetaling zonder boete.',
      lineOfCredit: 'Hernieuwbare kredietlijn',
      lineOfCreditDesc: 'Flexibel krediet om uw liquiditeit te beheren en onvoorziene omstandigheden het hoofd te bieden. Van €5.000 tot €100.000. Tarieven van 4,0% tot 9,0% JKP. Betaal alleen rente over gebruikte bedragen. Automatische aanvulling van beschikbaar kapitaal.',
      equipmentFinancing: 'Apparatuurfinanciering',
      equipmentFinancingDesc: 'Financier uw professionele apparatuur, bedrijfsvoertuigen, machines, gereedschap. Van €20.000 tot €300.000 over 2 tot 5 jaar. Tarieven van 3,9% tot 7,5% JKP. De apparatuur kan dienen als zekerheid, waardoor het verkrijgen van de lening wordt vergemakkelijkt.',
      invoiceFactoring: 'Factoring / Factuurcessie',
      invoiceFactoringDesc: 'Zet uw klantfacturen om in directe liquiditeit om uw cashflow te verbeteren. Voorschot tot 90% van het factuurbedrag binnen 24-48u. Kosten van 1% tot 3% volgens volume en termijn. Ideaal voor B2B-bedrijven.',
    },
    contact: {
      title: 'Neem contact met ons op',
      subtitle: 'Ons team luistert naar u',
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
      faqTitle: 'Veelgestelde vragen',
      faqs: [
        {
          question: 'Welke documenten zijn nodig voor een leningaanvraag?',
          answer: 'Voor particulieren: identiteitsbewijs, bewijs van verblijf, laatste loonstroken (3 maanden), belastingaanslag. Voor bedrijven: KvK-uittreksel jonger dan 3 maanden, balansen en resultatenrekeningen (laatste 2 boekjaren), zakelijke bankafschriften (3-6 maanden), identiteitsbewijs van de directeur. Alle documenten kunnen direct veilig online worden geüpload.',
        },
        {
          question: 'Hoe lang duurt het goedkeuringsproces?',
          answer: 'Dankzij onze realtime analysetechnologie krijgt u een principieel antwoord in enkele minuten tot maximaal 24 uur. Zodra goedgekeurd, worden de middelen direct vrijgegeven op uw beveiligde Altus Finance Group-account. U kunt ze vervolgens overmaken naar uw persoonlijke of zakelijke bankrekening wanneer u wilt, direct en zonder extra kosten.',
        },
        {
          question: 'Wat is het minimum en maximum bedrag dat ik kan lenen?',
          answer: 'Persoonlijke leningen: van €1.000 tot €75.000. Hypothecaire leningen: van €50.000 tot €500.000. Zakelijke termijnleningen: van €10.000 tot €500.000. Kredietlijnen: van €5.000 tot €100.000. Het exacte bedrag hangt af van uw terugbetalingscapaciteit berekend volgens uw inkomsten, lasten en kredietgeschiedenis.',
        },
        {
          question: 'Kan ik mijn lening vervroegd terugbetalen?',
          answer: 'Ja, al onze leningen staan vervroegde terugbetaling toe zonder boete of verborgen kosten. U kunt uw lening op elk moment gedeeltelijk of volledig terugbetalen via uw klantgebied. Dit vermindert automatisch de totale rentekosten. U behoudt zo de volledige controle over uw lening.',
        },
        {
          question: 'Wat zijn de toelatingscriterial voor een lening?',
          answer: 'Particulieren: meerderjarig zijn, in Nederland wonen, regelmatig inkomen hebben en schuldgraad <40%. Bedrijven: actief sinds 6+ maanden, minimale maandomzet van €15.000, geen recente betalingsachterstanden. De kredietscore wordt automatisch geverifieerd via kredietbureaus. De dossiers worden per geval bestudeerd.',
        },
        {
          question: 'Hoe worden de rentetarieven berekend?',
          answer: 'Onze tarieven worden berekend door een algoritme dat verschillende factoren analyseert: uw kredietscore, de looptijd van de lening, het geleende bedrag, uw inkomsten en lasten, uw terugbetalingsgeschiedenis en de financiële gezondheid (voor bedrijven). De tarieven variëren van 0,5% tot 9,0% JKP volgens profiel en type lening. Onze tarieven behoren tot de meest concurrerende op de markt dankzij ons netwerk van financiële partners.',
        },
        {
          question: 'Zijn er administratiekosten of verborgen kosten?',
          answer: 'Totale transparantie: we tonen alle kosten al bij de simulatie. Administratiekosten: van €0 tot €150 afhankelijk van het type lening. Geen kosten voor vervroegde terugbetaling. Geen maandelijkse beheerkosten. Het JKP (Jaarlijks Kostenpercentage) omvat alle kosten voor een gemakkelijke vergelijking met andere aanbiedingen.',
        },
        {
          question: 'Hoe bereken ik mijn leencapaciteit?',
          answer: 'Uw leencapaciteit hangt af van uw schuldgraad die 40% van uw netto-inkomsten niet mag overschrijden. Formule: (Maandelijks inkomen × 0,40) - Bestaande kredietlasten = Maximaal beschikbare termijn. Onze online simulator berekent automatisch uw leencapaciteit en stelt u aangepaste bedragen voor. U kunt de looptijd aanpassen om de termijnen te moduleren.',
        },
        {
          question: 'Kan ik een lening krijgen met een lage kredietscore?',
          answer: 'Ja, we accepteren verschillende profielen. Onze beoordelingstechnologie analyseert ook alternatieve gegevens naast de eenvoudige kredietscore: professionele stabiliteit, terugkerend inkomen, spaargeld, bankgeschiedenis. Scores geaccepteerd vanaf 500-560 voor bepaalde producten. Zelfs met een onvolmaakte geschiedenis kunt u een lening krijgen, maar de tarieven worden aangepast aan het risico.',
        },
        {
          question: 'Wat gebeurt er als ik een termijn niet kan betalen?',
          answer: 'Neem direct contact met ons op. We bieden verschillende oplossingen: uitstel van termijn (tijdelijke opschorting), verlaging van termijnen, herstructurering van de lening. Er kunnen vertragingskosten van toepassing zijn, maar we geven altijd de voorkeur aan dialoog om een oplossing te vinden die is aangepast aan uw situatie. Persoonlijke begeleiding is beschikbaar bij moeilijkheden.',
        },
      ],
    },
    legal: {
      termsTitle: 'Gebruiksvoorwaarden',
      privacyTitle: 'Privacybeleid',
      lastUpdated: 'Laatst bijgewerkt: januari 2025',
      terms: {
        section1Title: '1. Aanvaarding van voorwaarden',
        section1Content: 'Door toegang te krijgen tot en gebruik te maken van de diensten van Altus Finance Group, gaat u akkoord en stemt u ermee in gebonden te zijn aan de voorwaarden van deze overeenkomst.',
        section2Title: '2. Gebruikslicentie',
        section2Content: 'Toestemming wordt verleend om tijdelijk toegang te krijgen tot de materialen (informatie of software) op het platform van Altus Finance Group alleen voor persoonlijke, niet-commerciële weergave.',
        section3Title: '3. Leningovereenkomst',
        section3Content: 'Alle leningen zijn onderworpen aan kredietgoedkeuring. De voorwaarden zullen worden verstrekt in een afzonderlijke leningovereenkomst bij goedkeuring van uw aanvraag.',
        section4Title: '4. Verklaringen en garanties',
        section4Content: 'U verklaart en garandeert dat alle informatie die in uw leningaanvraag is verstrekt nauwkeurig, volledig en actueel is.',
        section5Title: '5. Beperking van aansprakelijkheid',
        section5Content: 'In geen geval zal Altus Finance Group of haar leveranciers aansprakelijk zijn voor enige schade die voortvloeit uit het gebruik of het onvermogen om de materialen op het platform van Altus Finance Group te gebruiken.',
        section6Title: '6. Wijzigingen',
        section6Content: 'Altus Finance Group kan deze gebruiksvoorwaarden te allen tijde herzien zonder voorafgaande kennisgeving. Door dit platform te gebruiken, stemt u ermee in gebonden te zijn aan de huidige versie van deze voorwaarden.',
      },
      privacy: {
        section1Title: '1. Informatie die we verzamelen',
        section1Content: 'We verzamelen de informatie die u ons rechtstreeks verstrekt wanneer u een account aanmaakt, een lening aanvraagt of met ons communiceert. Dit kan uw naam, e-mailadres, telefoonnummer, bedrijfsinformatie en financiële gegevens omvatten.',
        section2Title: '2. Hoe we uw informatie gebruiken',
        section2Content: 'We gebruiken de verzamelde informatie om:',
        section2List: [
          'Uw leningaanvragen te verwerken',
          'Met u te communiceren over onze diensten',
          'Ons platform en onze diensten te verbeteren',
          'Te voldoen aan wettelijke en regelgevende vereisten',
        ],
        section3Title: '3. Delen van informatie',
        section3Content: 'We verkopen uw persoonlijke informatie niet. We kunnen uw informatie delen met:',
        section3List: [
          'Kredietbureaus voor kredietevaluatie',
          'Dienstverleners die ons helpen bij onze activiteiten',
          'Toezichthouders en wetshandhavingsinstanties wanneer wettelijk vereist',
        ],
        section4Title: '4. Gegevensbeveiliging',
        section4Content: 'We implementeren passende technische en organisatorische maatregelen om uw persoonlijke informatie te beschermen tegen ongeautoriseerde toegang, wijziging, openbaarmaking of vernietiging.',
        section5Title: '5. Uw rechten',
        section5Content: 'U heeft het recht om toegang te krijgen tot, te corrigeren of te verwijderen van uw persoonlijke informatie. U kunt ook bezwaar maken tegen bepaalde verwerkingen van uw gegevens.',
        section6Title: '6. Cookies',
        section6Content: 'We gebruiken cookies en soortgelijke trackingtechnologieën om uw ervaring op ons platform te verbeteren. U kunt cookies beheren via uw browserinstellingen.',
        section7Title: '7. Neem contact met ons op',
        section7Content: 'Als u vragen heeft over dit privacybeleid, neem dan contact met ons op via privacy@altus-group.com',
      },
    },
    individualLoans: {
      title: 'Particuliere leningen',
      subtitle: 'Financieringsoplossingen aangepast aan al uw levensprojecten',
      personalLoan: 'Persoonlijke lening',
      personalLoanDesc: 'Flexibele financiering voor al uw projecten zonder gebruiksjustificatie: reis, bruiloft, aankoop apparatuur. Van €1.000 tot €75.000 over 12 tot 84 maanden. JKP tarieven van 2,9% tot 7,9% volgens profiel. Antwoord in 48u, middelen in 5 dagen.',
      mortgageLoan: 'Hypothecaire lening',
      mortgageLoanDesc: 'Financier uw hoofdverblijf, tweede woning of verhuurinvestering. Van €50.000 tot €500.000 over 10 tot 25 jaar. Vaste of variabele tarieven vanaf 1,5% JKP. Tot 110% eigen inbreng inclusief notariskosten. Gratis gepersonaliseerde simulatie.',
      autoLoan: 'Auto- / Motorlening',
      autoLoanDesc: 'Financier uw nieuwe of tweedehands voertuig, auto of motor. Van €3.000 tot €75.000 over 12 tot 84 maanden. JKP tarieven van 1,9% tot 5,9%. Mogelijkheid om verzekering en accessoires op te nemen. Direct antwoord bij uw partnerdealer.',
      studentLoan: 'Studentenlening',
      studentLoanDesc: 'Financier uw hogere studies, collegegeld, studentenhuisvesting. Van €1.000 tot €50.000. Volledig terugbetalingsuitstel tot einde van de studie. Voorkeurstarieven vanaf 1,5% JKP. Zonder ouderlijke borg onder voorwaarden.',
      greenLoan: 'Groene lening / Eco-PTZ',
      greenLoanDesc: 'Financier energetische renovatiewerkzaamheden: isolatie, warmtepomp, zonnepanelen. Van €7.000 tot €50.000. Gesubsidieerde tarieven vanaf 0,5% JKP. In aanmerking komend voor overheidssteun. Tot €30.000 zonder eigen inbreng.',
      renovationLoan: 'Renovatielening',
      renovationLoanDesc: 'Renoveer, vergroot, verfraai uw woning. Van €1.500 tot €75.000 over 12 tot 120 maanden. JKP tarieven van 2,5% tot 6,9%. Zonder hypothecaire garantie tot €50.000. Geleidelijke vrijgave volgens voortgang van werkzaamheden mogelijk.',
      miscellaneousCredit: 'Diverse Kredieten',
      miscellaneousCreditDesc: 'Financier al uw persoonlijke projecten: evenementen, apparatuur, vrijetijd, gezondheid, welzijn. Van €500 tot €50.000 over 6 tot 96 maanden. JKP tarieven van 2,9% tot 8,9%. Vereenvoudigde procedure, snel antwoord in 24u. Uitbetaling middelen in 3-5 dagen.',
      amount: 'Bedrag',
      rate: 'JKP tarief',
      duration: 'Looptijd',
      rateDisclaimer: 'Indicatieve tarieven onderworpen aan toelatingsvoorwaarden. Vast JKP. Een lening verplicht u en moet worden terugbetaald. Controleer uw terugbetalingscapaciteit voordat u zich verbindt.',
      compareLoans: 'Alle leningen vergelijken',
    },
    features: {
      title: 'Waarom kiezen voor Altus Finance Group?',
      subtitle: 'Een modern en transparant leningplatform dat uw behoeften centraal stelt',
      security: 'Bankbeveiliging op bedrijfsniveau',
      securityDesc: 'AES-256 encryptie, AVG-naleving, SOC 2 Type II en ISO 27001 certificering. Uw financiële gegevens zijn beschermd met dezelfde standaarden als grote banken. Multi-factor authenticatie en 24/7 bewaking tegen fraude.',
      fast: 'Express reactie - Minuten tot 24u',
      fastDesc: 'Onze AI-technologie analyseert uw dossier in realtime. Goedkeuringsantwoord in minuten tot maximaal 24 uur. Middelen direct vrijgegeven op uw beveiligde Altus-account. Vervolgens overmaken naar uw bankrekening wanneer u wilt. 100% digitaal, nul papierwerk.',
      competitive: 'Tot de laagste tarieven op de markt',
      competitiveDesc: 'Dankzij ons netwerk van 50+ financiële partners en geoptimaliseerde beoordelingstechnologie onderhandelen we de beste tarieven voor u: van 0,5% tot 9,0% JKP volgens profiel en type lening. Automatische vergelijking om het beste aanbod te garanderen.',
      flexible: 'Maximale flexibiliteit zonder boete',
      flexibleDesc: 'Gratis vervroegde terugbetaling op elk moment. Mogelijke modulering van termijnen volgens uw situatie. Uitstel van termijn bij moeilijkheden. Keuze van afschrijvingsdatum. U behoudt de volledige controle over uw lening.',
    },
    stats: {
      clients: 'Tevreden klanten',
      funded: 'Verstrekte leningen',
      satisfaction: 'Tevredenheidspercentage',
      years: 'Jaren ervaring',
    },
    partners: {
      title: 'Onze Financiële Partners',
      subtitle: 'We werken samen met een uitgebreid netwerk van toonaangevende banken en financiële instellingen om u de beste voorwaarden te garanderen',
      banksNetwork: 'Partnerbanken',
      loansFunded: 'Verstrekte Leningen',
      yearsExperience: 'Jaren Ervaring',
      satisfactionRate: 'Tevredenheidspercentage',
      networkTitle: 'Een Netwerk van Betrouwbare Partners',
      benefits: [
        'Toegang tot meer dan 50 financiële instellingen om de beste aanbiedingen te vergelijken',
        'Onderhandeling van voorkeurstarieven dankzij ons zakenvolume',
        'Erkende expertise in kredietbemiddeling sinds meer dan 25 jaar'
      ]
    },
    testimonials: {
      title: 'Wat onze klanten zeggen',
      subtitle: 'Meer dan 15.000 particulieren en professionals vertrouwen ons',
      reviews: [
        { name: 'Jan de Vries', role: 'Ondernemer', company: 'Restaurant Smaak', text: 'Altus Finance Group heeft het me mogelijk gemaakt om snel financiering te krijgen om mijn bedrijf te ontwikkelen. Het proces was eenvoudig en transparant, ik ontving de middelen in minder dan een week.', rating: 5 },
        { name: 'Lisa Janssen', role: 'Particulier', company: 'Eigenares', text: 'Uitstekende service voor mijn hypothecaire lening. De adviseurs zijn attent en vonden het beste tarief voor mij. Ik beveel hun diensten ten zeerste aan.', rating: 5 },
        { name: 'Peter Bakker', role: 'Financieel Directeur', company: 'Tech Solutions BV', text: 'Dankzij Altus Finance Group konden we de aankoop van nieuwe apparatuur financieren. De betalingsflexibiliteit en het concurrerende tarief maakten het verschil.', rating: 5 },
        { name: 'Sophie van Dijk', role: 'Ambachtsman', company: 'Traditionele Bakkerij', text: 'Een professionele en efficiënte service. Ik kreeg mijn renovatielening zonder complicaties. Het team begeleidde me bij elke stap.', rating: 5 },
        { name: 'Tom Visser', role: 'Handelaar', company: 'Mode & Accessoires', text: 'Ik ben zeer tevreden met de verkregen financiering voor de uitbreiding van mijn winkel. Altus Finance Group begrijpt echt de behoeften van ondernemers.', rating: 5 },
        { name: 'Bas Smit', role: 'Particulier', company: 'Gezinshoofd', text: 'Mijn autolening werd snel goedgekeurd met een uitstekend tarief. De online simulator stelde me in staat om de aanbiedingen gemakkelijk te vergelijken.', rating: 5 },
        { name: 'Emma Jansen', role: 'Verpleegster', company: 'Sint-Jozef Ziekenhuis', text: 'Ik kon mijn energetische renovatiewerken financieren dankzij hun groene lening. De gesubsidieerde tarieven en advies over staatssteun hebben me veel geholpen.', rating: 5 },
        { name: 'Ruud van den Berg', role: 'Manager', company: 'Restaurant De Gourmet', text: 'De revolving kredietlijn redde mijn cashflow tijdens de moeilijke periode. Maximale flexibiliteit en vervroegde terugbetaling zonder kosten.', rating: 5 },
        { name: 'Anne de Boer', role: 'Architect', company: 'De Boer & Partners', text: '100% digitaal en snel proces. Ik kreeg mijn zakelijke lening in 3 dagen. De interface is intuïtief en duidelijk.', rating: 5 },
        { name: 'Lars Hendriks', role: 'Student', company: 'Business School', text: 'De studentenlening met uitgestelde betaling heeft het me mogelijk gemaakt om mijn studie stressvrij te financieren. Voorkeurstarieven en zonder ouderlijke garantie.', rating: 5 },
        { name: 'Iris Vermeer', role: 'Apotheker', company: 'Centrale Apotheek', text: 'Financiering van medische apparatuur goedgekeurd in 48u. De klantenservice is responsief en professioneel. Zeer tevreden met de begeleiding.', rating: 5 },
        { name: 'Mark van Leeuwen', role: 'Ontwikkelaar', company: 'Tech Startup', text: 'Persoonlijke lening voor mijn professioneel opleidingsproject. Geen gebruiksbewijs vereist, transparant en snel proces.', rating: 5 },
        { name: 'Sara de Jong', role: 'Lerares', company: 'Vondel Lyceum', text: 'Mijn hypothecaire lening werd goedgekeurd met een zeer concurrerend tarief. De online simulatie hielp me het beste aanbod te vergelijken en te kiezen.', rating: 5 },
        { name: 'Tim Mulder', role: 'Ondernemer', company: 'Innovatieve Startup', text: 'De apparatuurfinanciering stelde me in staat de benodigde machines te kopen om mijn productie te starten. Terugbetaling aangepast aan mijn cashflow.', rating: 5 },
        { name: 'Linda Kuipers', role: 'Advocate', company: 'Kuipers Advocaten', text: 'Ultra-snel goedkeuringsproces dankzij AI-technologie. Ik ontving een principieel antwoord in minder dan 24 uur. Indrukwekkend!', rating: 5 },
        { name: 'Pieter Brouwer', role: 'Loodgieter', company: 'Brouwer Loodgieters', text: 'Renovatielening om mijn bedrijfspand te renoveren. Geleidelijke vrijgave volgens voortgang, precies wat ik nodig had.', rating: 5 },
        { name: 'Marloes Peters', role: 'Designer', company: 'Creatieve Studio', text: 'De kredietlijn gaf me de nodige flexibiliteit om de schommelingen in mijn bedrijfskas te beheren. Ik betaal alleen voor wat ik gebruik.', rating: 5 },
        { name: 'Rob Willems', role: 'Arts', company: 'Medische Praktijk', text: 'Financiering van mijn praktijkopening. Belangrijk bedrag snel goedgekeurd met een voordelig vast tarief. Zeer professioneel.', rating: 5 },
        { name: 'Evelien Dekker', role: 'Bloemist', company: 'Bloemen & Natuur', text: 'Zakelijke lening om mijn online winkel te ontwikkelen. Het proces was eenvoudig en het team begeleidde me bij elke stap. Bedankt!', rating: 5 },
        { name: 'Dennis van Dam', role: 'Ingenieur', company: 'Onafhankelijk Consultant', text: 'Autolening voor mijn zakelijke voertuig. Onmiddellijke reactie en middelen overgemaakt in 3 dagen. Onberispelijke service en concurrerend tarief.', rating: 5 },
        { name: 'Marieke Vos', role: 'Schoonheidsspecialist', company: 'Schoonheidsinstituut', text: 'Financiering voor de aankoop van nieuwe cosmetische apparatuur. Geen verborgen kosten, alles is vanaf het begin transparant. Ik beveel het ten zeerste aan.', rating: 5 },
        { name: 'Wouter Jacobs', role: 'Chef-kok', company: 'Modern Bistro', text: 'Factoring om mijn cashflow te verbeteren. Transformatie van mijn facturen in liquiditeit in 24u. Perfecte oplossing voor mijn B2B-activiteit.', rating: 5 },
      ],
    },
    auth: {
      title: 'ALTUS',
      subtitle: 'Uw betrouwbare partner voor financiering',
      loginTab: 'Inloggen',
      signupTab: 'Registreren',
      email: 'E-mail',
      password: 'Wachtwoord',
      confirmPassword: 'Bevestig wachtwoord',
      fullName: 'Volledige naam',
      phone: 'Telefoon',
      companyName: 'Bedrijfsnaam',
      siret: 'KvK-nummer',
      accountType: 'Accounttype',
      personal: 'Particulier',
      personalLoan: 'Persoonlijke lening',
      business: 'Bedrijf/Zakelijk',
      businessLoan: 'Zakelijke lening',
      login: 'Inloggen',
      loggingIn: 'Inloggen...',
      signup: 'Mijn account aanmaken',
      signingUp: 'Registreren...',
      backToHome: 'Terug naar home',
      loginSuccess: 'Inloggen geslaagd!',
      loginSuccessDesc: 'Welkom bij ALTUS',
      signupSuccess: 'Registratie geslaagd!',
      signupSuccessDesc: 'Een verificatie-e-mail is verzonden naar uw adres.',
      loginError: 'Inlogfout',
      loginErrorDesc: 'E-mail of wachtwoord onjuist',
      signupError: 'Fout',
      signupErrorDesc: 'Er is een fout opgetreden tijdens de registratie',
      emailNotVerified: 'E-mail niet geverifieerd',
      emailPlaceholder: 'jan.devries@voorbeeld.nl',
      passwordPlaceholder: '••••••••',
      fullNamePlaceholder: 'Jan de Vries',
      phonePlaceholder: '+31 6 12345678',
      companyNamePlaceholder: 'Bedrijf B.V.',
      siretPlaceholder: '12345678',
      required: 'verplicht',
      companyRequired: 'Bedrijfsnaam is verplicht voor zakelijke accounts',
      emailInvalid: 'Ongeldige e-mail',
      passwordMinLength: 'Het wachtwoord moet minimaal 12 tekens bevatten',
      passwordUppercase: 'Het wachtwoord moet minimaal één hoofdletter bevatten',
      passwordLowercase: 'Het wachtwoord moet minimaal één kleine letter bevatten',
      passwordNumber: 'Het wachtwoord moet minimaal één cijfer bevatten',
      passwordSpecial: 'Het wachtwoord moet minimaal één speciaal teken bevatten',
      passwordMatch: 'De wachtwoorden moeten overeenkomen',
      invalidOtp: 'Ongeldige of verlopen code',
      sessionExpired: 'Sessie verlopen',
      sessionExpiredMessage: 'Uw sessie is verlopen. Log alstublieft opnieuw in.',
      accessDenied: 'Toegang geweigerd',
      authenticationRequired: 'Authenticatie vereist',
      verificationError: 'Fout tijdens verificatie',
      verificationInProgress: 'Verificatie bezig',
      emailVerified: 'E-mail geverifieerd',
      accountActiveAutoLogin: 'Uw account is nu actief. U bent automatisch ingelogd en wordt over enkele seconden doorgestuurd naar uw dashboard...',
      linkExpiredInvalid: 'De verificatielink is mogelijk verlopen of ongeldig.',
      tokenMissing: 'Verificatietoken ontbreekt',
      pleaseTwoFactorCode: 'Voer uw twee-factor authenticatiecode in',
      verificationCodeSent: 'Verificatiecode verzonden',
      twoFactorAuth: 'Twee-factor authenticatie',
      enterOtpCode: 'Voer de 6-cijferige code in die naar uw e-mail is verzonden',
      otpExpiresIn: 'De code verloopt over 10 minuten',
      backToLogin: 'Terug naar inloggen',
    },
    errors: {
      sessionExpired: 'Sessie verlopen',
      accessDenied: 'Toegang geweigerd',
      authRequired: 'Authenticatie vereist',
      networkError: 'Netwerkfout. Probeer het opnieuw.',
      unexpectedError: 'Er is een onverwachte fout opgetreden',
      verificationFailed: 'Verificatie mislukt',
    },
    bankCard: {
      title: 'Altus Premium bankkaart',
      subtitle: 'Bestel uw exclusieve kaart en profiteer van uitzonderlijke voordelen',
      learnMore: 'Meer informatie',
      viewDetails: 'Details bekijken',
      orderNow: 'Nu bestellen',
      orderCard: 'Kaart bestellen',
      orderSuccess: 'Virtuele kaart bestellen',
      orderSuccessDesc: 'Uw virtuele kaart wordt geactiveerd. U ontvangt de details binnenkort per e-mail.',
      modalTitle: 'Altus Premium bankkaart',
      modalSubtitle: 'Ontdek alle voordelen van onze exclusieve kaart',
      advantagesTitle: 'Exclusieve voordelen',
      advantages: {
        cashback: '2% Cashback',
        cashbackDesc: 'Verdien 2% cashback op al uw aankopen',
        noFees: 'Geen jaarlijkse kosten',
        noFeesDesc: 'Eerste jaar gratis, daarna €49/jaar',
        protection: 'Volledige bescherming',
        protectionDesc: 'Reisverzekering en aankoopbescherming inbegrepen',
        rewards: 'Beloningsprogramma',
        rewardsDesc: 'Verzamel punten bij elke aankoop',
        global: 'Wereldwijde acceptatie',
        globalDesc: 'Geaccepteerd bij miljoenen winkels wereldwijd',
        support: 'Reactieve ondersteuning',
        supportDesc: 'Reactieve ondersteuning tijdens kantooruren',
        maxSecurity: 'Maximale beveiliging',
        maxSecurityDesc: 'Tijdelijke nummers met volledige bescherming',
        instantActivation: 'Directe activering',
        instantActivationDesc: 'Direct bruikbaar',
        noFeesEuro: 'Geen kosten',
        noFeesEuroDesc: '0% kosten in eurozone',
        globallyAccepted: 'Wereldwijd geaccepteerd',
        globallyAcceptedDesc: 'Compatibel met Apple Pay & Google Pay',
      },
      usageZonesTitle: 'Gebruikszones',
      usageZones: {
        worldwide: 'Wereldwijd',
        worldwideDesc: 'Gebruik uw kaart overal ter wereld',
        online: 'Online aankopen',
        onlineDesc: 'Veilige betaling voor al uw online aankopen',
        stores: 'Fysieke winkels',
        storesDesc: 'Geaccepteerd bij miljoenen winkels wereldwijd',
        atm: 'Geldautomaat opnames',
        atmDesc: 'Gratis opnames bij netwerkgeldautomaten',
      },
      feesTitle: 'Kosten en tarieven',
      fees: {
        annualFee: 'Jaarlijkse kosten',
        annualFeeAmount: 'Eerste jaar gratis, daarna €49/jaar',
        transactionFee: 'Transactiekosten',
        transactionFeeAmount: '0% bij aankopen',
        withdrawalFee: 'Opnamekosten',
        withdrawalFeeAmount: '3 gratis opnames/maand, daarna €2/opname',
        foreignFee: 'Wisselkosten',
        foreignFeeAmount: '1,5% bij buitenlandse transacties',
      },
      specificationsTitle: 'Specificaties',
      specifications: {
        cardType: 'Kaarttype',
        cardTypeValue: 'Visa Premium / Mastercard World Elite',
        creditLimit: 'Kredietlimiet',
        creditLimitValue: 'Tot €50.000 volgens profiel',
        validity: 'Geldigheid',
        validityValue: '5 jaar',
        delivery: 'Levering',
        deliveryValue: '7-10 werkdagen',
      },
      orderProcess: 'Bestelproces',
      orderProcessDesc: 'Vul het bestelformulier in, verstrek uw documenten, wacht op goedkeuring (24-48u) en ontvang uw kaart thuis.',
      termsConditions: 'Algemene voorwaarden van de Altus Premium kaart',
      close: 'Sluiten',
    },
    notifications: {
      loan_request: { title: 'Nieuwe leningaanvraag', message: 'Uw leningaanvraag is ontvangen' },
      loan_under_review: { title: 'Lening in beoordeling', message: 'Uw lening wordt beoordeeld' },
      loan_approved: { title: 'Lening goedgekeurd', message: 'Gefeliciteerd! Uw lening is goedgekeurd' },
      loan_rejected: { title: 'Lening afgewezen', message: 'Uw leningaanvraag is afgewezen' },
      loan_contract_generated: { title: 'Contract gegenereerd', message: 'Uw leningcontract is klaar voor download' },
      loan_contract_signed: { title: 'Contract getekend', message: 'Uw contract is ontvangen en wordt verwerkt' },
      loan_disbursed: { title: 'Middelen vrijgegeven', message: 'De leningmiddelen zijn op uw rekening gestort' },
      transfer_initiated: { title: 'Overschrijving geïnitieerd', message: 'Uw overschrijvingsverzoek is geïnitieerd' },
      transfer_completed: { title: 'Overschrijving voltooid', message: 'Uw overschrijving is succesvol voltooid' },
      transfer_approved: { title: 'Overschrijving goedgekeurd', message: 'Uw overschrijving is goedgekeurd' },
      transfer_suspended: { title: 'Overschrijving opgeschort', message: 'Uw overschrijving is opgeschort' },
      code_issued: { title: 'Code uitgegeven', message: 'Een overschrijvingscode is gegenereerd' },
      kyc_approved: { title: 'KYC goedgekeurd', message: 'Uw identiteitsverificatie is goedgekeurd' },
      kyc_rejected: { title: 'KYC afgewezen', message: 'Uw identiteitsverificatie is afgewezen' },
      fee_added: { title: 'Nieuwe kosten', message: 'Nieuwe kosten zijn toegevoegd aan uw rekening' },
      account_status_changed: { title: 'Accountstatus gewijzigd', message: 'De status van uw account is bijgewerkt' },
      admin_message_sent: { title: 'Nieuw bericht', message: 'U heeft een bericht ontvangen van de beheerder' },
      general: { title: 'Melding', message: 'U heeft een nieuwe melding' },
      twoFactorSuggestion: { title: 'Beveiligingsaanbeveling', message: 'We raden aan om tweefactorauthenticatie te activeren voor meer accountbeveiliging' },
      markAllRead: 'Alle markeren als gelezen',
      markAsRead: 'Markeren als gelezen',
      deleteNotification: 'Melding verwijderen',
    },
    dialogs: {
      newLoan: {
        title: 'Nieuwe leningaanvraag',
        subtitle: 'Vul onderstaand formulier in om een lening aan te vragen',
        loanType: 'Type lening',
        selectLoanType: 'Type selecteren',
        amount: 'Bedrag',
        enterAmount: 'Bedrag invoeren',
        duration: 'Looptijd',
        selectDuration: 'Looptijd selecteren',
        months: 'maanden',
        estimatedRate: 'Geschat tarief',
        monthlyPayment: 'Maandelijkse termijn',
        totalRepayment: 'Totale terugbetaling',
        firstRequestAlert: 'Eerste leningaanvraag',
        firstRequestAlertDesc: 'Voor uw eerste aanvraag moet u een bankrekening toevoegen en KYC-documenten uploaden.',
        addBankAccount: 'Bankrekening toevoegen',
        selectAccount: 'Rekening selecteren',
        bankName: 'Banknaam',
        bankNamePlaceholder: 'bijv.: ING',
        accountLabel: 'Rekeninglabel',
        accountLabelPlaceholder: 'bijv.: Hoofdrekening',
        iban: 'IBAN',
        ibanPlaceholder: 'NL XX XXXX XXXX XXXX XX',
        bic: 'BIC/SWIFT',
        bicPlaceholder: 'XXXXXXXX',
        uploadDocuments: 'Documenten uploaden',
        kycDocumentsTab: 'KYC-documenten',
        additionalDocumentsTab: 'Extra documenten',
        identity: 'Identiteitsbewijs',
        proof_of_address: 'Bewijs van verblijf',
        income_proof: 'Inkomensbewijs',
        business_registration: 'Handelsregister',
        financial_statements: 'Financiële overzichten',
        tax_returns: 'Belastingaangifte',
        submit: 'Aanvraag indienen',
        submitting: 'Indienen...',
        cancel: 'Annuleren',
        loanTypes: {
          personal: 'Persoonlijke lening',
          auto: 'Autolening',
          mortgage: 'Hypothecaire lening',
          green: 'Groene lening',
          renovation: 'Renovatielening',
          student: 'Studentenlening',
          business: 'Zakelijke lening',
          cashFlow: 'Cashflow management',
          equipment: 'Apparatuurfinanciering',
          commercialProperty: 'Commercieel vastgoed',
          lineOfCredit: 'Kredietlijn',
          vehicleFleet: 'Wagenpark',
        },
      },
      transfer: {
        title: 'Nieuwe overschrijving',
        subtitle: 'Geld overmaken naar uw bankrekening',
        selectAccount: 'Rekening selecteren',
        noAccountsAvailable: 'Geen bankrekening beschikbaar. Voeg eerst een rekening toe.',
        amount: 'Bedrag',
        enterAmount: 'Bedrag invoeren',
        amountPlaceholder: '50000',
        recipient: 'Ontvanger',
        recipientPlaceholder: 'Naam van bedrijf of begunstigde',
        feesDescription: 'Er zijn overboekingskosten van 25€ van toepassing',
        availableFunds: 'Beschikbare middelen',
        feesAndProcessing: 'Kosten en verwerking',
        submit: 'Overschrijving starten',
        submitting: 'Verwerken...',
        creating: 'Wordt gemaakt...',
        createTransfer: 'Overboeking maken',
        cancel: 'Annuleren',
        transferSuccess: 'Overboeking gestart',
        transferSuccessDesc: 'Uw overboekingsverzoek is succesvol aangemaakt',
        transferError: 'Fout',
        transferErrorDesc: 'Kan overboeking niet maken',
      },
      loanRequestModal: {
        title: 'Lening Aanvragen',
        description: 'Vul het onderstaande formulier in en voeg de vereiste documenten toe om uw leningaanvraag in te dienen.',
        loanType: 'Type Lening',
        selectLoanTypePlaceholder: 'Selecteer een type lening',
        loanAmount: 'Leningbedrag',
        duration: 'Looptijd',
        durationMonths: 'Looptijd (maanden)',
        months: 'maanden',
        interestRate: 'Rentevoet',
        estimatedMonthlyPayment: 'Geschatte Maandelijkse Betaling',
        requiredDocuments: 'Vereiste Documenten',
        requiredDocumentsDescription: 'Voeg alle documenten toe die als verplicht zijn gemarkeerd om uw aanvraag te voltooien.',
        required: 'Verplicht',
        optional: 'Optioneel',
        attach: 'Bijvoegen',
        cancel: 'Annuleren',
        submit: 'Aanvraag Indienen',
        validationError: 'Selecteer een type lening',
        requestSent: 'Aanvraag Verzonden',
        requestSentDescription: 'Uw leningaanvraag is succesvol ingediend. U ontvangt binnen 48 uur een antwoord.',
        error: 'Fout',
        errorDescription: 'Er is een fout opgetreden bij het indienen van uw aanvraag.',
        fileTooLarge: 'Bestand Te Groot',
        fileTooLargeDescription: 'De maximale bestandsgrootte is 10MB.',
        missingDocuments: 'Ontbrekende Documenten',
        missingDocumentsPrefix: 'Voeg alle vereiste documenten toe:',
      },
      cardTerms: {
        title: 'Algemene voorwaarden van de Altus Premium kaart',
        acceptTerms: 'Accepteren en kaart bestellen',
        declineTerms: 'Weigeren',
      },
      welcome: {
        title: 'Welkom bij Altus Finance Group',
        description: 'Uw account is succesvol aangemaakt. Kies uit onze gepersonaliseerde aanbiedingen om te beginnen.',
        accountTypeTitle: 'Accounttype',
        individualAccount: 'Particuliere rekening',
        businessAccount: 'Zakelijke rekening',
        individualAccess: 'Toegang tot persoonlijke leningen en persoonlijk financieel beheer',
        businessAccess: 'Volledige toegang tot zakelijke financieringsoplossingen en premiumdiensten',
        availableOffers: 'Beschikbare aanbiedingen voor u',
        getStarted: 'Beginnen',
        dialog: {
          title: 'Welkom bij Altus Finance Group!',
          description: 'We zijn blij u te ondersteunen bij uw financieringsprojecten.',
        },
        account: {
          badgeLabel: 'Uw account:',
          individual: {
            description: 'U heeft toegang tot persoonlijke leningaanbiedingen. Deze aanbiedingen zijn speciaal ontworpen voor uw persoonlijke behoeften en individuele projecten.',
          },
          business: {
            description: 'U heeft toegang tot professionele leningaanbiedingen. Deze aanbiedingen zijn speciaal ontworpen voor de ontwikkeling en groei van uw bedrijf.',
          },
        },
        offers: {
          title: 'Beschikbare aanbiedingen voor u',
          individual: [
            'Persoonlijke Lening',
            'Hypotheek',
            'Auto Lening',
            'Studielening',
            'Groene Lening',
            'Renovatielening',
          ],
          business: [
            'Professionele Lening',
            'Liquiditeitskrediet',
            'Apparatuurfinanciering',
            'Commerciële Hypotheek',
            'Kredietlijn',
            'Bedrijfsvoertuig Krediet',
          ],
        },
        important: {
          title: 'Belangrijk:',
          message: 'Alleen de hierboven genoemde aanbiedingen zijn toegankelijk in uw ruimte.',
          individualSwitch: ' Als u toegang wilt tot professionele aanbiedingen, moet u een zakelijke rekening aanmaken.',
          businessSwitch: ' Als u toegang wilt tot persoonlijke aanbiedingen, moet u een particuliere rekening aanmaken.',
        },
        cta: {
          primary: 'Begrepen, laten we beginnen',
          pending: 'Laden...',
        },
      },
      transactionHistory: {
        title: 'Transactiegeschiedenis',
        type: 'Type',
        amount: 'Bedrag',
        date: 'Datum',
        status: 'Status',
        noTransactions: 'Geen transacties gevonden',
        close: 'Sluiten',
      },
    },
    verify: {
      verifying: 'Verifiëren...',
      success: 'E-mail geverifieerd!',
      successMessage: 'Uw e-mail is succesvol geverifieerd. U kunt nu inloggen op uw account.',
      goToDashboard: 'Naar dashboard',
      error: 'Verificatie mislukt',
      errorMessage: 'Uw e-mail kon niet worden geverifieerd. De link is mogelijk verlopen.',
      tryAgain: 'Opnieuw proberen',
      backToSignup: 'Terug naar registratie',
      backToHome: 'Terug naar home',
    },
    forgotPassword: {
      title: 'Wachtwoord vergeten?',
      description: 'Geen probleem! We sturen u instructies om uw wachtwoord opnieuw in te stellen.',
      instructions: 'Voer hieronder uw e-mailadres in en we sturen u een link om uw wachtwoord opnieuw in te stellen.',
      emailLabel: 'E-mailadres',
      emailPlaceholder: 'uwemail@voorbeeld.nl',
      sendResetLink: 'Reset link versturen',
      sending: 'Verzenden...',
      backToLogin: 'Terug naar inloggen',
      emailSent: 'E-mail verzonden!',
      emailSentDesc: 'Controleer uw inbox voor instructies om uw wachtwoord opnieuw in te stellen.',
      error: 'Fout',
      errorDesc: 'Reset e-mail kon niet worden verzonden. Probeer opnieuw.',
    },
    resetPassword: {
      title: 'Wachtwoord opnieuw instellen',
      description: 'Voer hieronder uw nieuwe wachtwoord in',
      newPassword: 'Nieuw wachtwoord',
      newPasswordPlaceholder: 'Voer uw nieuwe wachtwoord in',
      confirmPassword: 'Bevestig wachtwoord',
      confirmPasswordPlaceholder: 'Bevestig uw nieuwe wachtwoord',
      requirements: 'Wachtwoordvereisten',
      minLength: 'Minimaal 12 tekens',
      uppercase: 'Minimaal één hoofdletter',
      lowercase: 'Minimaal één kleine letter',
      number: 'Minimaal één cijfer',
      specialChar: 'Minimaal één speciaal teken',
      passwordStrength: 'Wachtwoordsterkte',
      weak: 'Zwak',
      medium: 'Gemiddeld',
      strong: 'Sterk',
      veryStrong: 'Zeer sterk',
      resetPassword: 'Wachtwoord opnieuw instellen',
      resetting: 'Opnieuw instellen...',
      success: 'Wachtwoord opnieuw ingesteld!',
      successMessage: 'Uw wachtwoord is succesvol opnieuw ingesteld. U kunt nu inloggen met uw nieuwe wachtwoord.',
      error: 'Fout',
      invalidToken: 'Ongeldige of verlopen reset link',
      passwordMismatch: 'De wachtwoorden komen niet overeen',
    },
    twoFactorAuth: {
      setup: {
        title: 'Tweefactorauthenticatie instellen',
        description: 'Voeg een extra beveiligingslaag toe aan uw account',
        step1: 'Stap 1: Installeer een authenticator-app',
        step1Description: 'Download een app zoals Google Authenticator of Authy op uw mobiele apparaat.',
        step2: 'Stap 2: Scan de QR-code',
        step2Description: 'Open uw authenticator-app en scan de onderstaande QR-code.',
        step3: 'Stap 3: Voer de verificatiecode in',
        step3Description: 'Voer de 6-cijferige code van uw authenticator-app in om de setup te voltooien.',
        qrCodeInstructions: 'Scan deze QR-code met uw authenticator-app',
        cantScanQR: 'Kunt u de QR-code niet scannen?',
        secretKey: 'Voer deze sleutel handmatig in',
        enterCode: 'Voer de 6-cijferige code in',
        codePlaceholder: '000000',
        verify: 'Verifiëren en activeren',
        verifying: 'Verifiëren...',
        cancel: 'Annuleren',
        successTitle: '2FA geactiveerd!',
        successMessage: 'Tweefactorauthenticatie is succesvol geactiveerd voor uw account.',
        errorTitle: 'Ongeldige code',
        errorMessage: 'De ingevoerde code is ongeldig. Probeer opnieuw.',
      },
      disable: {
        title: 'Tweefactorauthenticatie uitschakelen',
        description: 'Weet u zeker dat u tweefactorauthenticatie wilt uitschakelen? Dit maakt uw account minder veilig.',
        enterPassword: 'Voer uw wachtwoord in ter bevestiging',
        passwordPlaceholder: 'Uw wachtwoord',
        disable: '2FA uitschakelen',
        disabling: 'Uitschakelen...',
        cancel: 'Annuleren',
        successTitle: '2FA uitgeschakeld',
        successMessage: 'Tweefactorauthenticatie is uitgeschakeld voor uw account.',
        errorTitle: 'Fout',
        errorMessage: 'Kon tweefactorauthenticatie niet uitschakelen. Controleer uw wachtwoord.',
      },
      login: {
        title: 'Tweefactorauthenticatie verifiëren',
        description: 'Voer de 6-cijferige code van uw authenticator-app in',
        enterCode: 'Voer de verificatiecode in',
        codePlaceholder: '000000',
        verify: 'Verifiëren',
        verifying: 'Verifiëren...',
        cancel: 'Annuleren',
        errorTitle: 'Ongeldige code',
        errorMessage: 'De ingevoerde code is ongeldig of verlopen. Probeer opnieuw.',
      },
    },
    bankAccounts: {
      title: 'Bankrekeningen',
      description: 'Beheer uw bankrekeningen voor overschrijvingen',
      addAccount: 'Rekening toevoegen',
      noAccountsTitle: 'Geen bankrekening',
      noAccountsDescription: 'Voeg een bankrekening toe om geld over te maken.',
      accountLabel: 'Label',
      bankName: 'Bank',
      iban: 'IBAN',
      bic: 'BIC',
      createdAt: 'Aangemaakt op',
      actions: 'Acties',
      delete: 'Verwijderen',
      deleteConfirm: 'Weet u zeker dat u deze bankrekening wilt verwijderen?',
      deleteSuccess: 'Bankrekening succesvol verwijderd',
      addAccountTitle: 'Bankrekening toevoegen',
      addAccountDescription: 'Voeg een nieuwe bankrekening toe voor overschrijvingen',
      accountLabelLabel: 'Rekeninglabel',
      accountLabelPlaceholder: 'bijv.: Hoofdrekening',
      accountLabelRequired: 'Rekeninglabel is verplicht',
      bankNameLabel: 'Banknaam',
      bankNamePlaceholder: 'bijv.: ING',
      bankNameRequired: 'Banknaam is verplicht',
      ibanLabel: 'IBAN',
      ibanPlaceholder: 'NL XX XXXX XXXX XXXX XX',
      ibanRequired: 'IBAN is verplicht',
      invalidIban: 'Ongeldig IBAN-formaat',
      bicLabel: 'BIC/SWIFT',
      bicPlaceholder: 'XXXXXXXX',
      invalidBic: 'Ongeldig BIC-formaat',
      submit: 'Rekening toevoegen',
      submitting: 'Toevoegen...',
      cancel: 'Annuleren',
      addSuccess: 'Bankrekening toegevoegd',
      addSuccessDesc: 'Uw bankrekening is succesvol toegevoegd.',
      addError: 'Fout bij het toevoegen van bankrekening',
      addFirstAccount: 'Uw eerste rekening toevoegen',
      deleteSuccessDesc: 'De bankrekening is succesvol verwijderd.',
      deleteError: 'Kan bankrekening niet verwijderen.',
    },
    welcomeModal: {
      title: 'Welkom bij Altus Finance Group',
      description: 'Uw account is succesvol aangemaakt. Kies uit onze gepersonaliseerde aanbiedingen om te beginnen.',
      accountType: 'Accounttype',
      individualAccount: 'Particuliere rekening',
      businessAccount: 'Zakelijke rekening',
      individualAccess: 'Toegang tot persoonlijke leningen en persoonlijk financieel beheer',
      businessAccess: 'Volledige toegang tot zakelijke financieringsoplossingen en premiumdiensten',
      availableOffers: 'Beschikbare aanbiedingen voor u',
      getStarted: 'Beginnen',
    },
    calculator: {
      title: 'Leningcalculator',
      description: 'Bereken uw maandelijkse termijnen en de totale kosten van uw lening',
      loanAmount: 'Leningbedrag',
      interestRate: 'Rentetarief (%)',
      loanDuration: 'Leningduur',
      months: 'maanden',
      calculate: 'Berekenen',
      results: 'Resultaten',
      monthlyPayment: 'Maandelijkse termijn',
      totalInterest: 'Totale rente',
      totalAmount: 'Totaal bedrag',
      amortizationSchedule: 'Aflossingsschema',
      month: 'Maand',
      payment: 'Betaling',
      principal: 'Hoofdsom',
      interest: 'Rente',
      balance: 'Saldo',
      downloadSchedule: 'Schema downloaden',
    },
    amortization: {
      interactiveTitle: 'Interactief aflossingsschema',
      interactiveDescription: 'Selecteer een actieve lening en pas de parameters aan om de impact op de betalingen te zien',
      calculatorTitle: 'Interactieve Aflossing Calculator',
      calculatorDescription: 'Simuleer uw aflossingsplan en visualiseer de evolutie van uw lening',
      selectActiveLoan: 'Selecteer een actieve lening',
      chooseLoan: 'Kies een lening...',
      loanOf: 'Lening van',
      at: 'tegen',
      loanAmount: 'Leningbedrag (€)',
      annualInterestRate: 'Jaarlijks rentetarief (%)',
      duration: 'Looptijd (jaren)',
      years: 'jaren',
      calculateAmortization: 'Aflossing berekenen',
      calculatePlan: 'Aflossingsplan berekenen',
      monthlyPayment: 'Maandelijkse betaling',
      totalPayment: 'Totaal te betalen',
      totalInterest: 'Totale rente',
      table: 'Tabel',
      evolution: 'Evolutie',
      cumulative: 'Cumulatief',
      breakdown: 'Uitsplitsing',
      month: 'Maand',
      payment: 'Betaling',
      principal: 'Hoofdsom',
      interest: 'Rente',
      balance: 'Saldo',
      amount: 'Bedrag (€)',
      monthLabel: 'Maand',
      noActiveLoans: 'Geen actieve leningen',
      noActiveLoansDesc: 'U heeft momenteel geen actieve leningen. Vraag een nieuwe lening aan om deze functie te gebruiken.',
      loanType: 'Leningtype',
      selectType: 'Type selecteren',
      personal: 'Persoonlijk',
      business: 'Zakelijk',
      realEstate: 'Vastgoed',
      automaticallyCalculated: 'Automatisch berekend',
      rateInfo: 'Het rentetarief wordt automatisch berekend op basis van het bedrag en het leningtype. Alle leningaanvragen vereisen administratieve goedkeuring.',
      requestLoan: 'Deze lening aanvragen',
      sending: 'Verzenden...',
      chart: 'Grafiek',
      balanceEvolution: 'Saldo- en betalingsevolutie',
      principalVsInterest: 'Hoofdsom vs Rente uitsplitsing',
      monthlyRepaymentPlan: 'Maandelijks aflossingsplan',
      remainingBalance: 'Restant saldo',
      errors: {
        amountPositive: 'Het leningbedrag moet groter zijn dan €0',
        amountMax: 'Het leningbedrag mag €10.000.000 niet overschrijden',
        rateNegative: 'Het rentetarief kan niet negatief zijn',
        rateMax: 'Het rentetarief mag 100% niet overschrijden',
        durationPositive: 'De leningduur moet groter zijn dan 0 jaar',
        durationMax: 'De leningduur mag 50 jaar niet overschrijden',
      },
    },
    kycDocuments: {
      title: 'KYC-documenten',
      description: 'Upload uw documenten voor identiteitsverificatie',
      uploadDocuments: 'Documenten uploaden',
      documentType: 'Documenttype',
      selectDocumentType: 'Documenttype selecteren',
      identity: 'Identiteitsbewijs',
      proof_of_address: 'Bewijs van verblijf',
      income_proof: 'Inkomensbewijs',
      business_registration: 'Handelsregister',
      financial_statements: 'Financiële overzichten',
      tax_returns: 'Belastingaangifte',
      chooseFile: 'Bestand kiezen',
      upload: 'Uploaden',
      uploading: 'Uploaden...',
      uploadSuccess: 'Succesvol geüpload',
      uploadSuccessDesc: 'Uw document is succesvol geüpload.',
      uploadError: 'Fout bij uploaden',
      status: 'Status',
      pending: 'In afwachting',
      approved: 'Goedgekeurd',
      rejected: 'Afgewezen',
      uploadedAt: 'Geüpload op',
      noDocuments: 'Geen documenten geüpload',
    },
    transferFlow: {
      backToDashboard: 'Terug naar dashboard',
      form: {
        title: 'Nieuwe overschrijving',
        subtitle: 'Start een veilige overschrijving naar een externe rekening',
        amountLabel: 'Bedrag (EUR)',
        amountPlaceholder: '10000',
        amountHelper: 'Vast bedrag gebaseerd op uw actieve lening (niet bewerkbaar)',
        accountLabel: 'Externe rekening (optioneel)',
        accountPlaceholder: 'Selecteer een rekening',
        externalAccountLabel: 'Extern account *',
        selectAccountPlaceholder: 'Selecteer een account',
        noAccount: 'Geen rekening geregistreerd',
        recipientLabel: 'Begunstigde',
        recipientPlaceholder: 'Naam van begunstigde',
        initiateButton: 'Overschrijving starten',
        initiating: 'Initialiseren...',
      },
      verification: {
        title: 'Verificatie van overschrijving',
        subtitle: 'Een ogenblik geduld tijdens de verificatie van uw overschrijving',
        doNotClose: 'Sluit deze pagina niet',
        doNotCloseDesc: 'Uw overschrijving wordt geverifieerd door ons beveiligde systeem. Deze bewerking duurt ongeveer 45 seconden.',
        progressLabel: 'Verificatievoortgang',
        verificationSteps: 'Verificatiestappen',
        step1: 'Verificatie van afzenderrekening',
        step2: 'Validatie van bedrag en kosten',
        step3: 'Veiligheidscontrole tegen fraude',
        step4: 'Voorbereiding van veilige overschrijving',
      },
      validation: {
        title: 'Validatie van overschrijving',
        subtitle: 'Code {sequence} / {total}',
        demoCodeLabel: 'Demonstratiecode:',
        codeLabel: 'Validatiecode (6 cijfers)',
        codePlaceholder: '000000',
        codeHelpText: 'Een code is naar uw e-mail verzonden',
        validateButton: 'Valideren',
        validating: 'Valideren...',
        resendButton: 'Opnieuw verzenden',
        historyLabel: 'Geschiedenis',
      },
      progress: {
        titlePaused: 'Overschrijving gepauzeerd',
        titleInProgress: 'Overschrijving in behandeling',
        securityVerificationTitle: 'Beveiligingsverificatie',
        transferProcessingTitle: 'Overdracht wordt verwerkt',
        toPrefix: 'Naar:',
        securityVerificationRequired: 'Beveiligingsverificatie vereist',
        enterVerificationCode: 'Om veiligheidsredenen voert u de verificatiecode in die naar u is verzonden',
        codeFromAdvisor: 'De beveiligingscode wordt verstrekt door uw adviseur',
        validationCodeLabel: 'Validatiecode (6 cijfers)',
        enterCodePlaceholder: 'Voer de 6-cijferige code in',
        validating: 'Valideren...',
        validateAndContinue: 'Valideren en doorgaan',
        processingTransfer: 'Uw overdracht wordt verwerkt...',
        doNotCloseProcessing: 'Uw transactie wordt veilig verwerkt. Sluit deze pagina niet.',
        amountLabel: 'Bedrag: {amount} EUR naar {recipient}',
        progressLabel: 'Voortgang',
        pauseTitle: 'Deblokkeringscode vereist bij {percent}%',
        pauseDescription: 'Neem contact op met de klantenservice om de deblokkeringscode voor uw overschrijving te verkrijgen.',
        pauseCodeLabel: 'Deblokkeringscode',
        pauseCodePlaceholder: 'Voer de code in',
        validatePauseCode: 'Code valideren',
        statusLabel: 'Huidige status',
        statusCompleted: 'Overschrijving voltooid!',
        statusProcessing: 'Wordt verwerkt door ons banksysteem...',
        eventsLabel: 'Gebeurtenissen',
        circularProgressTitle: 'Verificatie van de overboeking',
        circularProgressSubtitle: 'Uw transactie wordt veilig verwerkt.',
      },
      complete: {
        title: 'Overschrijving voltooid',
        subtitle: 'Uw overschrijving is succesvol uitgevoerd',
        successMessage: 'Uw overdracht is succesvol voltooid. De fondsen zijn binnen 24 tot 72 uur beschikbaar.',
        referenceLabel: 'Referentie',
        returnToDashboard: 'Terug naar dashboard',
        amountLabel: 'Bedrag',
        recipientLabel: 'Begunstigde',
        feesLabel: 'Kosten',
      },
      toast: {
        transferInProgress: 'Overdracht bezig',
        transferAlreadyInProgress: 'Er is al een overdracht bezig voor deze lening. Omleiden...',
        transferInitiated: 'Overdracht succesvol geïnitieerd. Verificatie bezig...',
        selectExternalAccount: 'Selecteer een extern account.',
        noActiveLoan: 'Geen actieve lening beschikbaar.',
        initiated: 'Overschrijving geïnitieerd',
        initiatedDesc: 'Verificatie van uw overschrijving loopt...',
        error: 'Fout',
        errorInitiation: 'Overschrijving kon niet worden gestart',
        codeValidated: 'Code gevalideerd',
        codeInvalid: 'Ongeldige code',
        codeInvalidDesc: 'De code is onjuist of verlopen',
        codeSent: 'Code verzonden',
        codeSentDesc: 'Code {sequence} succesvol verzonden',
        approved: 'Overschrijving goedgekeurd',
        approvedDesc: 'Uw overschrijving is goedgekeurd en wordt verwerkt.',
        fieldsRequired: 'Verplichte velden',
        fieldsRequiredDesc: 'Vul alle velden in',
        invalidCode: 'Ongeldige code',
        invalidCodeDesc: 'De code moet 6 cijfers bevatten',
        codeRequired: 'Code vereist',
        codeRequiredDesc: 'Voer de deblokkeringscode in',
        unblocked: 'Overschrijving gedeblokkeerd',
        unblockedDesc: 'De overschrijving is succesvol gedeblokkeerd',
      },
    },
    loanOffers: {
      pageTitle: 'Onze leningaanbiedingen',
      pageSubtitle: 'Ontdek al onze financieringsoplossingen voor particulieren en professionals',
      accountInfo: 'Rekening {accountType}:',
      individualTab: 'Particuliere leningen',
      businessTab: 'Zakelijke leningen',
      individual: 'Particulier',
      business: 'Zakelijk',
      amountLabel: 'Bedrag',
      rateLabel: 'Tarief',
      durationLabel: 'Looptijd',
      advantagesLabel: 'Voordelen',
      requestButton: 'Deze lening aanvragen',
      loginToRequest: 'Inloggen om aan te vragen',
      types: {
        personalLoan: {
          title: 'Persoonlijke Lening',
          description: 'Flexibele financiering voor uw persoonlijke projecten',
          features: ['Snel antwoord', 'Geen gebruiksverantwoording vereist', 'Flexibele terugbetaling'],
        },
        mortgageLoan: {
          title: 'Hypothecaire Lening',
          description: 'Financier de aankoop van uw hoofd- of tweede verblijf',
          features: ['Vast of variabel tarief', 'Tot 80% van het bedrag', 'Verzekering inbegrepen'],
        },
        autoLoan: {
          title: 'Autolening',
          description: 'Koop uw nieuwe of tweedehands voertuig',
          features: ['Snelle uitbetaling', 'Mogelijkheid tot vervroegde terugbetaling', 'Optionele verzekering'],
        },
        studentLoan: {
          title: 'Studentenlening',
          description: 'Financier uw studie met voordelige voorwaarden',
          features: ['Uitgestelde terugbetaling', 'Preferentiële tarieven', 'Ouderborgstelling optioneel'],
        },
        greenLoan: {
          title: 'Groene Lening',
          description: 'Financier uw energierenovatieprojecten',
          features: ['Verlaagd tarief', 'In aanmerking voor staatssteun', 'Milieuvriendelijke financiering'],
        },
        renovationLoan: {
          title: 'Renovatielening',
          description: 'Renoveer en verbeter uw woning',
          features: ['Geen hypotheek tot 75k€', 'Geleidelijke uitbetaling mogelijk', 'Mogelijke belastingaftrek'],
        },
        businessLoan: {
          title: 'Zakelijke Lening',
          description: 'Financiering voor uw bedrijfsprojecten, ontwikkeling en liquiditeit',
          features: ['Antwoord binnen 48u', 'Vast tarief', 'Flexibele terugbetaling'],
        },
        cashFlowCredit: {
          title: 'Liquiditeitskrediet',
          description: 'Snelle oplossing voor uw werkkapitaalbehoeften',
          features: ['Snelle uitbetaling', 'Geen zekerheid tot 50k€', 'Flexibel'],
        },
        equipmentFinancing: {
          title: 'Apparatuurfinanciering',
          description: 'Koop uw professionele apparatuur en materialen',
          features: ['Tot 100% van het bedrag', 'Leasing optie', 'Belastingaftrek'],
        },
        commercialPropertyLoan: {
          title: 'Commercieel Vastgoedkrediet',
          description: 'Verkrijg uw bedrijfsruimten, kantoren of magazijnen',
          features: ['Lange looptijd', 'Aanbetaling vanaf 20%', 'Concurrerend tarief'],
        },
        lineOfCredit: {
          title: 'Kredietlijn',
          description: 'Doorlopend krediet voor uw incidentele behoeften',
          features: ['Beschikbaar 24/7', 'Vrije terugbetaling', 'Automatische verlenging'],
        },
        vehicleFleetLoan: {
          title: 'Wagenparkkrediet',
          description: 'Financier uw wagenpark of bedrijfsvoertuigen',
          features: ['Leasing of traditioneel krediet', 'Terugkoopoptie', 'Verzekering inbegrepen'],
        },
      },
    },
    cardTermsContent: {
      title: 'Algemene Gebruiksvoorwaarden - ALTUS Virtuele Kaart',
      lastUpdated: 'Laatste update: November 2025',
      section1: {
        title: '1. DOEL EN TOEPASSINGSGEBIED',
        content: 'Deze algemene voorwaarden (hierna "AV") regelen het gebruik van de virtuele bankkaart ALTUS (hierna "de Virtuele Kaart"), aangeboden door ALTUS Finance Group aan klanten met een ALTUS-rekening (hierna "de Kaarthouder"). De Virtuele Kaart is een gedematerialiseerd betaalmiddel gekoppeld aan uw ALTUS-rekening.',
      },
      section2: {
        title: '2. SERVICEBESCHRIJVING',
        subtitle1: '2.1 Aard van de Virtuele Kaart',
        content1: 'De Virtuele Kaart is een gedematerialiseerde betaalkaart met een 16-cijferig kaartnummer, een vervaldatum en een visueel cryptogram (CVV). Het werkt als een fysieke bankkaart maar bestaat alleen in elektronische vorm.',
        subtitle2: '2.2 Kaarttype',
        item1: 'Permanente virtuele kaart: vaste coördinaten gedurende de gehele geldigheidsduur (3 jaar)',
        item2: 'Tijdelijke virtuele kaart: tijdelijke coördinaten met instelbaar bedrag en duur',
      },
      section3: {
        title: '3. GESCHIKTHEIDSVOORWAARDEN',
        content: 'Om een Virtuele Kaart te verkrijgen, moet de Kaarthouder:',
        list: [
          'ALTUS-klant zijn met een actieve en gefinancierde rekening',
          'De identiteitsverificatie (KYC) hebben voltooid',
          'Niet in een situatie van ongeautoriseerde overtrekking verkeren',
          'Sterke authenticatie (twee-factor) hebben geactiveerd',
          'Deze AV en de Tariefvoorwaarden accepteren',
        ],
      },
      section4: {
        title: '4. ACTIVERING EN GEBRUIK',
        subtitle1: '4.1 Activering',
        content1: 'De Virtuele Kaart wordt onmiddellijk geactiveerd bij het aanmaken via de applicatie of het ALTUS-klantengebied. De Kaarthouder ontvangt onmiddellijk de volledige kaartcoördinaten.',
        subtitle2: '4.2 Toegestaan gebruik',
        list1: [
          'Betalingen op alle online handelssites die Visa/Mastercard accepteren',
          'Terugkerende betalingen en abonnementen (alleen permanente kaart)',
          'Aankopen op internationale websites',
          'Contactloze betalingen in winkels (indien toegevoegd aan Apple Pay/Google Pay)',
        ],
        subtitle3: '4.3 Beperkingen',
        list2: [
          'Geen contante opnames bij geldautomaten',
          'Fysieke presentatie onmogelijk (autoverhuur, sommige hotels)',
          'Sommige aanbieders kunnen virtuele kaarten weigeren',
        ],
      },
      section5: {
        title: '5. VEILIGHEID EN BESCHERMING',
        subtitle1: '5.1 Versterkte veiligheid',
        list1: [
          'De coördinaten van uw fysieke bankkaart worden nooit blootgesteld',
          'Mogelijkheid om de kaart onmiddellijk te blokkeren/deblokkeren',
          'Definitieve verwijdering met één klik',
          '3D Secure-bescherming op alle transacties',
          'Dynamische CVV voor maximale veiligheid',
        ],
        subtitle2: '5.2 Verplichtingen van de Kaarthouder',
        content2: 'De Kaarthouder verbindt zich ertoe de coördinaten van zijn Virtuele Kaart vertrouwelijk te behandelen en deze niet aan derden door te geven. Bij vermoeden van fraude moet de Kaarthouder de kaart onmiddellijk blokkeren of verwijderen via zijn klantengebied.',
        subtitle3: '5.3 Garanties en verzekeringen',
        content3: 'De Virtuele Kaart profiteert van dezelfde garanties als uw fysieke kaart, inclusief bescherming tegen fraude, aankoopverzekering en garantie voor conforme levering.',
      },
      section6: {
        title: '6. LIMIETEN EN GRENZEN',
        content: 'De betalingslimieten van de Virtuele Kaart zijn identiek aan die van uw ALTUS-hoofdkaart:',
        list: [
          'Maandelijks limiet: tot 50.000 € afhankelijk van uw profiel',
          'Limiet per transactie: tot 10.000 €',
          'Mogelijkheid om limieten tijdelijk aan te passen via de applicatie',
        ],
        content2: 'Voor tijdelijke kaarten bepaalt u het maximumbedrag en de geldigheidsduur bij het aanmaken.',
      },
      section7: {
        title: '7. PRIJSSTELLING',
        list: [
          'Aanmaak virtuele kaart: Gratis',
          'Transactiekosten in eurozone: 0%',
          'Betalingen buiten eurozone: 1,5% van het bedrag',
          'Jaarlijkse bijdrage: Gratis',
          'Blokkeren/Deblokkeren: Gratis en onbeperkt',
        ],
      },
      section8: {
        title: '8. AFSCHRIJVING EN AFSCHRIFT',
        content: 'Alle transacties uitgevoerd met de Virtuele Kaart worden in realtime van uw ALTUS-rekening afgeschreven. Ze verschijnen onmiddellijk in uw transactiegeschiedenis en op uw maandelijkse afschriften.',
      },
      section9: {
        title: '9. VERZET EN BEËINDIGING',
        subtitle1: '9.1 Tijdelijke blokkering',
        content1: 'U kunt uw Virtuele Kaart op elk moment blokkeren via uw klantengebied. Deblokkering is onmiddellijk.',
        subtitle2: '9.2 Definitieve verwijdering',
        content2: 'Het verwijderen van een Virtuele Kaart is onmiddellijk en onomkeerbaar. Abonnementen gekoppeld aan deze kaart worden automatisch geweigerd. Het wordt aanbevolen uw betalingsinformatie bij de betrokken handelaren bij te werken vóór verwijdering.',
        subtitle3: '9.3 In geval van fraude',
        content3: 'Bij vermoedelijk verlies of diefstal van de coördinaten, verwijder de kaart onmiddellijk via uw applicatie en neem contact op met onze klantenservice op +31 XX XX XX XX XX (beschikbaar 24/7).',
      },
      section10: {
        title: '10. AANSPRAKELIJKHEID',
        content: 'ALTUS kan niet aansprakelijk worden gesteld in geval van:',
        list: [
          'Weigering van een handelaar om de Virtuele Kaart te accepteren',
          'Tijdelijke onderbreking van de service voor onderhoud',
          'Frauduleus gebruik als gevolg van nalatigheid van de Kaarthouder',
          'Handelsgeschillen tussen de Kaarthouder en een handelaar',
        ],
        content2: 'De Kaarthouder is volledig verantwoordelijk voor het gebruik van zijn Virtuele Kaart en de uitgevoerde transacties tot de melding van frauduleus gebruik.',
      },
      section11: {
        title: '11. DUUR EN WIJZIGING',
        content: 'Deze AV worden voor onbepaalde tijd aangegaan. ALTUS behoudt zich het recht voor deze AV op elk moment te wijzigen. Elke wijziging wordt de Kaarthouder minstens 2 maanden vóór inwerkingtreding medegedeeld. Het ontbreken van bezwaar binnen deze termijn geldt als aanvaarding.',
      },
      section12: {
        title: '12. KLACHTEN',
        content: 'Voor klachten kan de Kaarthouder contact opnemen met de ALTUS-klantenservice:',
        list: [
          'Per e-mail: support@altusgroup.com',
          'Per telefoon: +31 XX XX XX XX XX',
          'Via het beveiligde klantengebied',
        ],
        content2: 'Bij gebrek aan een bevredigend antwoord binnen 2 maanden kan de Kaarthouder zich wenden tot de Ombudsman van de AFM.',
      },
      section13: {
        title: '13. TOEPASSELIJK RECHT EN JURISDICTIE',
        content: 'Deze AV worden beheerst door Nederlands recht. Alle geschillen met betrekking tot hun interpretatie of uitvoering vallen onder de exclusieve bevoegdheid van de Nederlandse rechtbanken.',
      },
      note: 'Door uw ALTUS Virtuele Kaart te activeren, erkent u dat u de volledige Algemene Gebruiksvoorwaarden hebt gelezen, begrepen en geaccepteerd.',
    },
    processTimeline: {
      title: 'Financieringsproces',
      subtitle: 'Van uw aanvraag tot uitbetaling: een vereenvoudigd en snel traject',
      step1Title: 'Online aanvraag',
      step1Duration: '5 minuten',
      step1Description: 'Vul ons beveiligde formulier in en upload uw documenten',
      step1Docs: [
        'Handelsregisteruittreksel jonger dan 3 maanden',
        'Identiteitsbewijs van de directeur',
        'Laatste jaarrekeningen',
        'Bankafschriften (3 maanden)'
      ],
      step2Title: 'Dossieranalyse',
      step2Duration: '24-48u',
      step2Description: 'Ons expertenteam bestudeert uw aanvraag en terugbetalingscapaciteit',
      step2Docs: [
        'Verificatie van documenten',
        'Financiële analyse',
        'Solvabiliteitsonderzoek',
        'Berekening van persoonlijk tarief'
      ],
      step3Title: 'Principe-akkoord',
      step3Duration: '48u',
      step3Description: 'Ontvangst van uw gedetailleerde leningaanbieding met definitieve voorwaarden',
      step3Docs: [
        'Toegekend bedrag',
        'JKP en maandelijkse aflossingen',
        'Vereiste garanties',
        'Opschortende voorwaarden'
      ],
      step4Title: 'Uitbetaling van fondsen',
      step4Duration: '7-15 dagen',
      step4Description: 'Elektronische ondertekening van het contract en uitbetaling binnen 7-15 dagen na implementatie van garanties',
      step4Docs: [
        'Ondertekening leningscontract',
        'Implementatie garanties',
        'Kredietnemersverzekering',
        'Overboeking van fondsen'
      ],
      documentsTitle: 'Voor te bereiden documenten volgens uw project',
      creationTitle: 'Bedrijfsoprichting',
      creationDocs: [
        'Gedetailleerd businessplan',
        '3-jarige financiële prognose',
        'Financieringsplan',
        'CV van de directeur en ervaring',
        'Bewijs van persoonlijke inbreng'
      ],
      repriseTitle: 'Bedrijfsovername',
      repriseDocs: [
        'Overnameprotocol',
        'Jaarrekeningen van de laatste 3 jaar',
        'Waardering van de handelszaak',
        'Commerciële huurovereenkomst',
        'Verklaring van geen bezwaar'
      ],
      developmentTitle: 'Ontwikkeling',
      developmentDocs: [
        'Jaarrekeningen van de laatste 3 jaar',
        'Volledig fiscaal pakket',
        'Leveranciersoffertes (apparatuur)',
        'Zakelijke bankafschriften (6 maanden)',
        'Activiteitenprognose'
      ],
      incompleteTitle: 'Onvolledig dossier? Geen paniek!',
      incompleteDescription: 'Ons team helpt u bij het samenstellen van uw dossier. Wij helpen u bij het verkrijgen van ontbrekende documenten.',
      needHelp: 'Hulp nodig?',
      averageTime: 'Gemiddelde totale doorlooptijd:',
      averageTimeValue: '2-3 weken van indiening van het dossier tot uitbetaling van fondsen',
      startApplication: 'Mijn aanvraag starten'
    },
    guaranteesSection: {
      title: 'Garanties en Beveiliging',
      subtitle: 'Meerdere opties om uw financiering veilig te stellen en uw belastingen te optimaliseren',
      organizationalTitle: 'Organisatorische Garanties',
      organizationalItems: [
        'BPI France (40-70% van de lening)',
        'SIAGI (garantie ambachtslieden/handelaren)',
        'France Active (sociale economie)',
        'SOCAMA (boeren)'
      ],
      realTitle: 'Zakelijke Garanties',
      realItems: [
        'Hypotheek op onroerend goed',
        'Verpanding van handelszaak',
        'Pandrecht op materieel/apparatuur',
        'Privilege van geldschieter'
      ],
      personalTitle: 'Persoonlijke Garanties',
      personalItems: [
        'Hoofdelijke borg van de directeur',
        'Professionele bankgarantie',
        'Garantie op eerste verzoek',
        'Comfort letter van de groep'
      ],
      insuranceTitle: 'Kredietnemersverzekering',
      insuranceItems: [
        'Overlijden / PTIA (verplicht)',
        'Permanente invaliditeit (IPT/IPP)',
        'Tijdelijke arbeidsongeschiktheid (ITT)',
        'Fiscaal aftrekbare premies'
      ],
      taxBenefitsTitle: 'Fiscale Voordelen van de Zakelijke Lening',
      taxBenefit1Title: 'Aftrekbaarheid van rente',
      taxBenefit1Description: 'Leningsrente is aftrekbaar van het fiscale resultaat van uw bedrijf, waardoor uw winstbelasting wordt verlaagd.',
      taxBenefit2Title: 'Versnelde afschrijving',
      taxBenefit2Description: 'Voor gefinancierde apparatuur is versnelde afschrijving mogelijk onder bepaalde voorwaarden (nieuwe, ecologische apparatuur, enz.).',
      taxBenefit3Title: 'Belastingkrediet',
      taxBenefit3Description: 'Bepaalde investeringen geven recht op belastingkredieten (energietransitie, digitaal, training).',
      taxBenefit4Title: 'Terugvorderbare BTW',
      taxBenefit4Description: 'BTW op rente en dossiertkosten is terugvorderbaar voor belastingplichtige bedrijven.',
      taxAdvice: 'Fiscaal advies: Raadpleeg uw accountant om de aftrekbaarheid van uw leningen te optimaliseren en uw fiscale voordelen te maximaliseren.',
      contributionTitle: 'Vereiste Persoonlijke Inbreng',
      equipmentPercentage: '10-15%',
      equipmentLabel: 'Apparatuur',
      equipmentDescription: 'Materieel, voertuigen',
      creationPercentage: '20-30%',
      creationLabel: 'Oprichting / Overname',
      creationDescription: 'Handelszaak',
      realEstatePercentage: '20-25%',
      realEstateLabel: 'Zakelijk Onroerend Goed',
      realEstateDescription: 'Panden, kantoren',
      contributionDisclaimer: '* Indicatieve percentages die kunnen variëren afhankelijk van uw project en profiel'
    },
    footer: {
      description: 'Uw betrouwbare partner voor al uw financieringsprojecten. Leningsoplossingen aangepast aan particulieren en professionals.',
      phone: '+352 40 63 48',
      email: 'infos@altusfinancegroup.com',
      address: '19 Rue Sigismond, L-2537 Luxembourg',
      hoursTitle: 'Openingstijden',
      hours: {
        weekdays: 'Ma - Vr: 9:00 - 19:00',
        weekend: 'Za: 9:00 - 17:00',
        support: 'Responsive support',
      },
      certificationsTitle: 'Certificeringen & Beveiliging',
      certifications: [
        'Gereguleerd door ACPR',
        'ISO 27001 Gecertificeerd',
        'AVG Conform',
        'SSL/TLS Beveiligd',
        'FBF Lid',
      ],
      productsTitle: 'Onze Producten',
      products: {
        personal: 'Persoonlijke Leningen',
        business: 'Zakelijke Leningen',
        mortgage: 'Hypothecaire Lening',
        auto: 'Autokrediet',
        renovation: 'Renovatielening',
      },
      companyTitle: 'Bedrijf',
      careers: 'Carrières',
      legalTitle: 'Juridisch',
      legalLinks: {
        terms: 'Juridische Kennisgeving',
        privacy: 'Privacybeleid',
        cgu: 'AV',
        cookies: 'Cookies',
        gdpr: 'AVG',
      },
      helpTitle: 'Hulp',
      helpLinks: {
        faq: 'FAQ',
        userGuide: 'Gebruikershandleiding',
        support: 'Klantondersteuning',
        simulator: 'Leningsimulator',
        contactUs: 'Neem contact met ons op',
      },
      copyright: 'Altus Finance Group. Alle rechten voorbehouden.',
      regulatory: 'Altus Finance Group is een financieringsmerk goedgekeurd door de ACPR. Kredietinstelling onder toezicht van de Banque de France.',
      disclaimer: 'Let op, geld lenen kost ook geld. De informatie op deze pagina is uitsluitend voor informatieve doeleinden en vormt geen contractueel aanbod. Alle kredietaanvragen zijn onderworpen aan beoordeling en aanvaarding van het dossier. Een krediet verplicht u en moet worden terugbetaald. Controleer uw terugbetalingscapaciteit voordat u zich verbindt.',
    },
    seo: {
      home: {
        title: 'Altus Finance Group - Professional & Personal Loans | Fast and Competitive Financing',
        description: 'Professional and personal loan solutions with Altus Finance Group. Get fast financing for your business or personal project. Competitive rates, simple and transparent process.',
      },
      about: {
        title: 'About Altus Finance Group - Our Mission and Values | Financing Solutions',
        description: 'Discover Altus Finance Group, leader in professional loan solutions with over 15 years of experience, 15,000+ satisfied clients and €500M in loans granted. Our mission: make financing accessible to all.',
      },
      contact: {
        title: 'Contact Us - Altus Finance Group | Questions About Our Professional Loans',
        description: 'Have a question about our financing solutions? Contact Altus Finance Group. Our team is available to support you with your professional loan project. Fast response guaranteed.',
      },
      howItWorks: {
        title: 'How to Get a Business Loan - Detailed Process | Altus Finance Group',
        description: 'Discover the complete process to obtain a professional loan with Altus Finance Group. From online application to fund release: criteria, required documents and timeframes. Response in 24-48h.',
      },
      forgotPassword: {
        title: 'Forgot Password | Altus Finance Group',
        description: 'Reset your password',
        emailSentTitle: 'Email Sent | Altus Finance Group',
        emailSentDescription: 'A reset link has been sent',
      },
      resetPassword: {
        title: 'Reset Password | Altus Finance Group',
        description: 'Create a new password for your account',
      },
      twoFactorSetup: {
        title: '2FA Setup | Altus Finance Group',
        description: 'Set up two-factor authentication to secure your account',
      },
      verifyTwoFactor: {
        title: '2FA Verification | Altus Finance Group',
        description: 'Two-factor verification',
      },
    },
    businessLoans: {
      title: 'Oplossingen voor Professionals',
      subtitle: 'Financiering op maat voor uw bedrijf, micro-onderneming, KMO of zelfstandige',
      businessLoan: 'Zakelijke Lening',
      businessLoanDesc: 'Financiering voor uw bedrijfsprojecten, ontwikkeling en cashflow',
      businessLoanFeatures: ['Antwoord binnen 48u', 'Vast tarief', 'Flexibele terugbetaling'],
      cashFlowCredit: 'Liquiditeitskrediet',
      cashFlowCreditDesc: 'Snelle oplossing om uw werkkapitaalbehoeften te beheren',
      cashFlowCreditFeatures: ['Snelle uitbetaling', 'Geen onderpand tot €50k', 'Flexibel'],
      equipmentFinancing: 'Apparatuurfinanciering',
      equipmentFinancingDesc: 'Koop uw professionele apparatuur en materialen',
      equipmentFinancingFeatures: ['Tot 100% financiering', 'Leasing-optie', 'Fiscaal aftrekbaar'],
      commercialProperty: 'Commercieel Vastgoedkrediet',
      commercialPropertyDesc: 'Verwerf uw gebouwen, kantoren of professionele opslagruimtes',
      commercialPropertyFeatures: ['Lange looptijd', 'Aanbetaling vanaf 20%', 'Concurrerend tarief'],
      lineOfCredit: 'Kredietlijn',
      lineOfCreditDesc: 'Revolverend krediet voor uw incidentele behoeften',
      lineOfCreditFeatures: ['Beschikbaar 24/7', 'Vrije terugbetaling', 'Automatische verlenging'],
      lineOfCreditDuration: 'Verlengbaar',
      vehicleFleet: 'Professioneel Voertuigkrediet',
      vehicleFleetDesc: 'Financier uw wagenpark of bedrijfsvoertuigen',
      vehicleFleetFeatures: ['Leasing of klassiek krediet', 'Terugkoopoptie', 'Verzekering inbegrepen'],
      smeLoan: 'KMO-Leningen',
      smeLoanDesc: 'Toegewijde financieringsoplossingen voor KMO\'s voor groei, ontwikkeling en strategische investeringen',
      smeLoanFeatures: ['Hoge bedragen tot €1M', 'Flexibele looptijd 1-10 jaar', 'Professionele begeleiding'],
      amount: 'Bedrag',
      rate: 'JKP',
      duration: 'Looptijd',
      months: 'maanden',
      years: 'jaar',
      features: 'Voordelen',
      learnMore: 'Meer informatie',
      advantagesTitle: 'ALTUS Pro Voordelen',
      advantages: [
        'Toegewijde adviseur voor uw bedrijf',
        'Gepersonaliseerde studie van uw dossier',
        'Begeleiding gedurende uw hele proces',
        'Businessplan pakket inbegrepen',
      ],
      eligibilityTitle: 'Toelatingsvoorwaarden',
      eligibility: [
        'Bedrijf geregistreerd in Frankrijk',
        'Actief sinds meer dan 6 maanden',
        'Geen bankverbod',
        'Up-to-date financiële overzichten',
      ],
      rateDisclaimer: 'Indicatieve tarieven onder voorbehoud van studie en aanvaarding van uw aanvraag. Vast JKP.',
      simulateLoan: 'Mijn zakelijke lening simuleren',
      contactAdvisor: 'Contact opnemen met een adviseur',
    },
    professionalFAQ: {
      title: 'Veelgestelde Vragen',
      subtitle: 'Vind snel antwoorden op uw vragen',
      faqs: [
        {
          question: 'Welke documenten zijn vereist voor een zakelijke leningaanvraag?',
          answer: 'Voor professionals: Bedrijfsregistratie jonger dan 3 maanden, identiteitsbewijs van de directeur, financiële overzichten van de laatste 3 jaar, volledige belastingdocumenten, zakelijke bankafschriften (6 maanden), businessplan (voor startups), financiële prognose. Voor particulieren: identiteitsbewijs, woonplaatsbewijs, recente loonstroken en belastingaangifte.',
        },
        {
          question: 'Welke persoonlijke bijdrage is vereist voor een zakelijke lening?',
          answer: 'De persoonlijke bijdrage varieert per project: 10-15% voor aankoop van apparatuur of materialen, 20-30% voor oprichting of overname van bedrijf, 20-25% voor commercieel vastgoed. Een hogere bijdrage kan uw financieringsvoorwaarden verbeteren en uw tarief verlagen.',
        },
        {
          question: 'Wat is de termijn voor een antwoord en fondsen?',
          answer: 'Eerste goedkeuring binnen 24-48u na indiening van volledige aanvraag. Definitieve goedkeuring binnen 48u. Uitbetaling van fondsen vindt plaats 7-15 dagen na contractondertekening en garantieopstelling. Gemiddelde totale tijd: 2-3 weken.',
        },
        {
          question: 'Welke garanties kan ik aanbieden voor mijn zakelijke lening?',
          answer: 'Verschillende opties: zakelijke garanties (hypotheek, pandrecht op handelsfonds, materieel pandrecht), persoonlijke garanties (hoofdelijke borg van directeur), garantie-organisaties (BPI France 40-70%, SIAGI, France Active, SOCAMA), of kredietnemer verzekering (verplicht: overlijden/PTIA, optioneel: IPT/IPP/ITT).',
        },
        {
          question: 'Zijn de rente van leningen fiscaal aftrekbaar?',
          answer: 'Ja! Rente op zakelijke leningen is volledig aftrekbaar van uw belastbaar inkomen, waardoor uw winstbelasting wordt verlaagd. Ook de premies van de kredietnemerverzekering zijn aftrekbaar. BTW op rente en kosten is terugvorderbaar voor btw-plichtige bedrijven.',
        },
        {
          question: 'Kan ik een lening krijgen als mijn bedrijf minder dan een jaar oud is?',
          answer: 'Ja, we financieren bedrijfsopstarters met een solide businessplan en persoonlijke bijdrage van 20-30%. We evalueren uw professionele ervaring, projecthaalbaarheid en prognoses. Een erelening (BPI France, Initiative France) kan uw aanvraag versterken.',
        },
        {
          question: 'Kan ik mijn zakelijke lening vervroegd terugbetalen?',
          answer: 'Ja, al onze zakelijke leningen staan vervroegde terugbetaling toe. Boetes zijn wettelijk beperkt: maximaal 6 maanden rente of 3% van het resterende kapitaal. Sommige contracten voorzien gratis vervroegde terugbetaling na een bepaalde periode.',
        },
        {
          question: 'Wat zijn de huidige tarieven voor zakelijke leningen?',
          answer: 'Onze JKP-tarieven variëren per project: Commercieel vastgoed 2,9-5,5% (5-25 jaar), Apparatuur 3,9-7,5% (2-5 jaar), Handelsfonds 4,7% (5-10 jaar), Cashflow 4,0-9,0% (3-36 maanden), Professionele voertuigen 3,2-6,5% (2-6 jaar). Tarieven gepersonaliseerd op basis van uw profiel en looptijd.',
        },
        {
          question: 'Hoe werkt het online aanvraagproces?',
          answer: '1) Vul ons online formulier in (5 min) en upload uw documenten. 2) Analyse van uw aanvraag door onze experts (24-48u). 3) Ontvang uw principiële goedkeuring met voorwaarden. 4) Elektronische ondertekening van contract. 5) Garantieopstelling. 6) Uitbetaling van fondsen naar uw Altus-rekening.',
        },
        {
          question: 'Kan ik meerdere soorten financiering combineren?',
          answer: 'Ja, u kunt meerdere oplossingen combineren: banklening + leasing voor apparatuur, zakelijke lening + erelening (BPI France) om eigen vermogen te versterken, of kredietlijn + aflossingslening om flexibiliteit en langetermijnfinanciering te combineren.',
        },
        {
          question: 'Zijn er aanvraagkosten en andere kosten?',
          answer: 'Aanvraagkosten: 1-2% van bedrag voor zakelijke leningen (onderhandelbaar). Garantiekosten: variabel afhankelijk van type (hypotheek, pand). Kredietnemerverzekering: 0,10% tot 0,40% van geleend kapitaal per jaar. Alle kosten staan gedetailleerd in uw leningaanbieding.',
        },
        {
          question: 'Wat gebeurt er als ik terugbetalingsproblemen heb?',
          answer: 'Neem contact met ons op bij de eerste tekenen van moeilijkheden. We kunnen verkennen: tijdelijk betalingsuitstel, betalingsmodulatie, verlenging van looptijd van lening of kredietherstructurering. Preventieve ondersteuning is altijd verkieslijk.',
        },
      ],
      notFoundTitle: 'Kunt u het antwoord op uw vraag niet vinden?',
      notFoundDesc: 'Ons team van experts is beschikbaar van maandag tot vrijdag van 9.00 tot 19.00 uur',
      contactUs: 'Neem contact op',
      helpCenter: 'Helpcentrum',
    },
    admin: {
      common: {
        status: {pending: 'In behandeling', active: 'Actief', approved: 'Goedgekeurd', rejected: 'Afgewezen', suspended: 'Opgeschort', completed: 'Voltooid', signed: 'Ondertekend', inProgress: 'Bezig'},
        actions: {approve: 'Goedkeuren', reject: 'Afwijzen', delete: 'Verwijderen', suspend: 'Opschorten', save: 'Opslaan', download: 'Downloaden', upload: 'Uploaden', send: 'Versturen', edit: 'Bewerken', cancel: 'Annuleren', disburse: 'Uitbetalen'},
        labels: {user: 'Gebruiker', userName: 'Gebruikersnaam', userEmail: 'Gebruikers-e-mail', amount: 'Bedrag', type: 'Type', rate: 'Tarief', duration: 'Looptijd', status: 'Status', date: 'Datum', createdAt: 'Aangemaakt', actions: 'Acties', fees: 'Kosten', progress: 'Voortgang', codes: 'Codes', recipient: 'Ontvanger', contract: 'Contract', months: 'maanden', total: 'Totaal', active: 'actief', pending: 'in behandeling', recent: 'Recent', all: 'Alle', noData: 'Geen gegevens', loading: 'Laden...', error: 'Fout', success: 'Succes', balance: 'Saldo', loans: 'Leningen'},
        messages: {error: 'Fout', success: 'Succes', updated: 'Bijgewerkt', approved: 'Goedgekeurd', rejected: 'Afgewezen', deleted: 'Verwijderd', disbursed: 'Uitbetaald', cannotApprove: 'Kan niet goedkeuren', cannotReject: 'Kan niet afwijzen', cannotDelete: 'Kan niet verwijderen', cannotUpdate: 'Kan niet bijwerken', loadError: 'Fout bij laden'},
        empty: {noResults: 'Geen resultaten', noData: 'Geen gegevens beschikbaar'},
      },
      dashboard: {title: 'Beheerdersconscole', description: 'Platformoverzicht en gebruikersbeheer', totalUsers: 'Totaal aantal gebruikers', activeUsers: 'actief', pendingUsers: 'in behandeling', transfers: 'Overboekingen', transfersPending: 'bezig', loans: 'Leningen', loansActive: 'actief', totalVolume: 'Totaal volume', volumeDescription: 'Totale overboekingen', recentUsers: 'Recente gebruikers', recentUsersDescription: 'Laatste registraties', recentTransfers: 'Recente overboekingen', recentTransfersDescription: 'Laatste transacties'},
      loans: {title: 'Leningbeheer', description: 'Alle leningaanvragen van het platform beheren', allLoans: 'Alle leningen', allLoansDescription: 'Volledige lijst van leningaanvragen', loanApproved: 'Lening goedgekeurd', loanApprovedDesc: 'De lening is succesvol goedgekeurd. Het contract is gegenereerd.', loanRejected: 'Lening afgewezen', loanRejectedDesc: 'De lening is succesvol afgewezen', loanDeleted: 'Lening verwijderd', loanDeletedDesc: 'De lening is succesvol verwijderd', fundsDisbursed: 'Fondsen uitbetaald', fundsDisbursedDesc: 'De fondsen zijn succesvol uitbetaald. De gebruiker is op de hoogte gesteld.', contractGenerated: '📄 Gegenereerd', contractSigned: '✅ Ondertekend', approveReason: 'Reden voor goedkeuring', rejectReason: 'Reden voor afwijzing', deleteReason: 'Reden voor verwijdering', approveDialogDesc: 'Deze actie keurt de lening van {amount} voor {userName} goed en genereert het contract.', rejectDialogTitle: 'Lening afwijzen', rejectDialogDesc: 'Deze actie wijst de lening permanent af. De gebruiker wordt op de hoogte gesteld.', disburseDialogTitle: 'Fondsen uitbetalen', disburseDialogDesc: 'Deze actie betaalt {amount} uit aan {userName}. De lening wordt actief en de gebruiker kan overdrachten maken.', deleteDialogTitle: 'Lening verwijderen', deleteDialogDesc: 'Deze actie verwijdert de lening permanent.'},
      transfers: {title: 'Overboekingenbeheer', description: 'Overboekingsaanvragen goedkeuren of opschorten', allTransfers: 'Alle overboekingen', allTransfersDescription: 'Volledige lijst van geldoverboekingen', transferUpdated: 'Overboeking bijgewerkt', transferUpdatedDesc: 'De status van de overboeking is succesvol bijgewerkt', approveDialogTitle: 'Overboeking goedkeuren', approveDialogDesc: 'Deze actie keurt de overboeking goed en werkt de status bij naar "in behandeling".', suspendDialogTitle: 'Overboeking opschorten', suspendDialogDesc: 'Deze actie schort de overboeking op. Deze kan later worden heractiveerd.'},
    },
  } as TranslationKeys,
};
export function useTranslations() {
  const { language } = useLanguage();
  return translations[language];
}
