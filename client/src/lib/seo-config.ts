export const seoConfig = {
  siteUrl: import.meta.env.VITE_SITE_URL || 'http://localhost:5000',
  siteName: 'Altus Finances Group',
  defaultTitle: 'Altus Finances Group - Solutions de Financement | Crédits Professionnels et Particuliers',
  defaultDescription: 'Altus Finances Group propose des solutions de crédit adaptées à vos projets personnels et professionnels. Accédez rapidement à des fonds avec des taux avantageux et un processus de validation transparent.',
  defaultKeywords: 'crédit professionnel, financement entreprise, prêt personnel, emprunt rapide, taux avantageux, financement PME, crédit société, solution de financement, prêt particulier, crédit auto, prêt immobilier, crédit étudiant, crédit consommation, prêt travaux, crédit renouvelable, prêt sans justificatif, financement pro',
  defaultImage: '/og-image.jpg',
  twitterHandle: '@altusfinancesgroup',
  themeColor: '#0066cc',
  locale: 'en_US',
  alternateLangs: ['fr', 'es', 'pt', 'it', 'de'],
  organization: {
    name: 'Altus Finances Group',
    logo: '/logo.png',
    telephone: '+352-40-63-48',
    address: {
      streetAddress: '19 Rue Sigismond',
      addressLocality: 'Luxembourg',
      postalCode: 'L-2537',
      addressCountry: 'LU'
    },
    geo: {
      latitude: 49.6117,
      longitude: 6.1319
    },
    sameAs: [
      'https://www.facebook.com/altusfinancesgroup',
      'https://www.linkedin.com/company/altusfinancesgroup',
      'https://twitter.com/altusfinancesgroup'
    ]
  }
} as const;
