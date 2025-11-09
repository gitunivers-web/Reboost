import { seoConfig } from './seo-config';

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "name": seoConfig.siteName,
  "description": "Professional loan solutions for individuals and businesses with competitive rates and a transparent process",
  "url": seoConfig.siteUrl,
  "logo": {
    "@type": "ImageObject",
    "url": `${seoConfig.siteUrl}/logo.png`,
    "width": 512,
    "height": 512
  },
  "image": `${seoConfig.siteUrl}/og-image.jpg`,
  "telephone": seoConfig.organization.telephone,
  "address": {
    "@type": "PostalAddress",
    ...seoConfig.organization.address
  },
  "geo": {
    "@type": "GeoCoordinates",
    ...seoConfig.organization.geo
  },
  "sameAs": seoConfig.organization.sameAs,
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "15000"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": seoConfig.organization.telephone,
    "contactType": "Customer Service",
    "availableLanguage": ["French", "English", "Spanish", "Portuguese", "Italian", "German"]
  }
};

export const websiteSchema = {
  "@type": "WebSite",
  "name": seoConfig.siteName,
  "url": seoConfig.siteUrl,
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${seoConfig.siteUrl}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};

export const breadcrumbSchema = (items: Array<{name: string, path: string}>) => ({
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `${seoConfig.siteUrl}${item.path}`
  }))
});

export const loanProductSchema = {
  "@type": "LoanOrCredit",
  "name": "Altus Finance Group Professional Loan",
  "description": "Flexible professional loan with competitive rates",
  "provider": {
    "@type": "FinancialService",
    "name": seoConfig.siteName
  },
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition"
  }
};

export const faqSchema = (faqs: Array<{question: string, answer: string}>) => ({
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const contactPageSchema = {
  "@type": "ContactPage",
  "name": "Contact Altus Finance Group",
  "description": "Contact us for all your questions about our financing solutions",
  "url": `${seoConfig.siteUrl}/contact`
};
