export const seoConfig = {
  siteUrl: import.meta.env.VITE_SITE_URL || 'http://localhost:5000',
  siteName: 'Altus Finance Group',
  defaultTitle: 'Altus Finance Group - Professional Loan Solutions | Business Financing',
  defaultDescription: 'Altus Finance Group offers professional loan solutions tailored to your business. Quickly access funds with competitive rates and a transparent approval process.',
  defaultKeywords: 'business loan, enterprise financing, professional loan, quick loan, competitive rate, SME financing, business credit, financing solution, personal loan, car loan, mortgage, student loan, consumer credit, renovation loan, revolving credit, no doc loan, professional financing, enterprise funding',
  defaultImage: '/og-image.jpg',
  twitterHandle: '@altusfinancegroup',
  themeColor: '#0066cc',
  locale: 'en_US',
  alternateLangs: ['fr', 'es', 'pt', 'it', 'de'],
  organization: {
    name: 'Altus Finance Group',
    logo: '/logo.png',
    telephone: '+33-1-XX-XX-XX-XX',
    address: {
      streetAddress: '123 Avenue des Champs-Élysées',
      addressLocality: 'Paris',
      postalCode: '75008',
      addressCountry: 'FR'
    },
    geo: {
      latitude: 48.8566,
      longitude: 2.3522
    },
    sameAs: [
      'https://www.facebook.com/altusfinancegroup',
      'https://www.linkedin.com/company/altusfinancegroup',
      'https://twitter.com/altusfinancegroup'
    ]
  }
} as const;
